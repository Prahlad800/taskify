import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('Markdown notes render formatted content safely',async t=>{
 const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
 try{
 const {default:Editor,looksLikeMarkdown}=await vite.ssrLoadModule('/src/components/MarkdownNoteEditor.jsx');
 const render=value=>renderToStaticMarkup(React.createElement(Editor,{noteId:'test',title:'Test',value,onChange:()=>{}}));
 await t.test('headings, bold, lists, code, tables and checklists render',()=>{
  const html=render('# Heading\n\n**Bold**\n\n- item\n- [x] finished\n\n| Name | Status |\n| --- | --- |\n| Note | Ready |\n\n\x60\x60\x60js\nconst answer = 42;\n\x60\x60\x60');
  for(const part of ['<h1>Heading</h1>','<strong>Bold</strong>','<table>','<li>item</li>','type="checkbox"','const answer = 42;','Copy code'])assert.ok(html.includes(part),part);
 });
 await t.test('unsafe URLs and raw script markup are not executed',()=>{
  const html=render('# Safety\n\n[bad](javascript:alert(1))\n\n<script>alert(1)</script>');assert.ok(!html.includes('href="javascript:'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 });
 await t.test('plain notes remain editable and Markdown is detected',()=>{
  const html=render('A plain note');assert.ok(html.includes('<textarea'));assert.ok(html.includes('A plain note'));assert.equal(looksLikeMarkdown('A plain note'),false);assert.equal(looksLikeMarkdown('# Heading\ntext'),true);assert.equal(looksLikeMarkdown('**Bold**'),true);
 });
 }finally{await vite.close()}
});
