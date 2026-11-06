import {DurableObject} from 'cloudflare:workers';
import {httpServerHandler} from 'cloudflare:node';
import {createApplication} from '../app.js';
import {connectDB} from '../db/db.js';
import {acceptSocket} from './websocket.js';
import {EventEmitter} from 'node:events';

class NativeWebSocketEngine extends EventEmitter { close() {} }

// One named object keeps MongoDB connections, Socket.IO rooms and rate limits
// together. All requests must reach the same object, including polling requests.
export class TaskifyBackend extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.application = createApplication({wsEngine:NativeWebSocketEngine,clientIp:req=>req.headers['cf-connecting-ip']||'127.0.0.1'});
    this.application.server.listen(3030);
    this.http = httpServerHandler({port:3030});
    this.connection = null;
  }
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/health') return Response.json({success:true,service:'taskify-backend'});
    try {
      this.connection ||= connectDB().catch(error => {this.connection=null;throw error;});
      await this.connection;
      if (path === '/ready') return Response.json({success:true,database:'connected'});
      if (path.startsWith('/socket.io/') && request.headers.get('Upgrade')?.toLowerCase()==='websocket') {
        return await acceptSocket(request,this.application.io.engine);
      }
      return await this.http.fetch(request);
    } catch (error) {
      console.error('Backend request failed:',error.code || error.name);
      return Response.json({success:false,message:'Backend temporarily unavailable.'},{status:503});
    }
  }
}
export default {
  fetch(request,env) {
    return env.BACKEND.get(env.BACKEND.idFromName('taskify-production-v2')).fetch(request);
  }
};
