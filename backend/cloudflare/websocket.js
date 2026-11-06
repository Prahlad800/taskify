import {EventEmitter} from 'node:events';
import {allowedOrigins} from '../services/realtime.js';

// Engine.IO's ws transport expects an EventEmitter. Adapt the platform's native
// WebSocket here because Workers' node:http server does not emit upgrade events.
class NativeSocket extends EventEmitter {
  constructor(socket) {
    super();this.socket=socket;
    socket.addEventListener('message',event=>{
      if (typeof event.data==='string' && Buffer.byteLength(event.data)>1024*1024) return this.close(1009);
      if (event.data instanceof ArrayBuffer && event.data.byteLength>1024*1024) return this.close(1009);
      this.emit('message',event.data,typeof event.data!=='string');
    });
    socket.addEventListener('close',event=>this.emit('close',event.code,event.reason));
    socket.addEventListener('error',()=>this.emit('error',new Error('WebSocket connection failed')));
  }
  send(data,callback) {try{this.socket.send(data);callback?.();}catch(error){callback?.(error);}}
  close(code=1000) {try{this.socket.close(code);}catch{}}
}
export async function acceptSocket(request,engine) {
  const origin=request.headers.get('Origin');
  if(origin&&!allowedOrigins.includes(origin)) return new Response('Forbidden',{status:403});
  const url=new URL(request.url);
  const address=request.headers.get('CF-Connecting-IP')||'127.0.0.1';
  const req={url:url.pathname+url.search,method:request.method,headers:Object.fromEntries(request.headers),connection:{remoteAddress:address},socket:{remoteAddress:address}};
  engine.prepare(req);
  const error=await new Promise(resolve=>engine.verify(req,true,code=>resolve(code)));
  if(error!==undefined) return Response.json({code:error,message:'Invalid socket request'},{status:400});
  const pair=new WebSocketPair();pair[1].accept();
  const websocket=new NativeSocket(pair[1]);
  if(req._query.sid) engine.onWebSocket(req,{destroy:()=>websocket.close()},websocket);
  else {
    req.websocket=websocket;
    await engine.handshake('websocket',req,()=>websocket.close(1008));
  }
  return new Response(null,{status:101,webSocket:pair[0]});
}
