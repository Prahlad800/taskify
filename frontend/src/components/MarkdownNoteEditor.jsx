import InlineNoteTitle from "./InlineNoteTitle";
import Icon from './WorkspaceIcon';
import {useEffect,useRef,useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {handleError,handleSuccess} from '../util/error';
import './markdown-note.css';

export function looksLikeMarkdown(value){return /(^|\n)(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\x60{3}|\|.*\|)|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/.test(value)}
function CodeBlock({children}){
 const code=useRef(null);const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(code.current.innerText);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{handleError('Unable to copy. Select the code and copy it manually.')}}
 return <div className="markdown-code-block"><button type="button" onClick={copy}>{copied?'Copied':'Copy code'}</button><pre ref={code}>{children}</pre></div>;
}
export default function MarkdownNoteEditor({noteId,title,value,onChange,onBlur,disabled,onTitleChange}){
 const editor=useRef(null),fileInput=useRef(null),active=useRef(true),latest=useRef(value);
 latest.current=value;
 useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
 const [mode,setMode]=useState(()=>looksLikeMarkdown(value)?'preview':'write');
 const [importing,setImporting]=useState(false);
 useEffect(()=>{setMode(looksLikeMarkdown(value)?'preview':'write')},[noteId]);
 function insert(text,{before='',after='',placeholder='text'}={}){
  const input=editor.current;const start=input?.selectionStart??value.length,end=input?.selectionEnd??value.length;
  const selection=value.slice(start,end);const added=before+(text??(selection||placeholder))+after;
  const next=value.slice(0,start)+added+value.slice(end);onChange(next);setMode('write');
  requestAnimationFrame(()=>{editor.current?.focus();editor.current?.setSelectionRange(start+before.length,start+added.length-after.length)});
 }
 function paste(event){
  const text=event.clipboardData.getData('text/plain');
  if(text.includes('\n')&&looksLikeMarkdown(text)){
   event.preventDefault();const start=event.currentTarget.selectionStart,end=event.currentTarget.selectionEnd;
   onChange(value.slice(0,start)+text+value.slice(end));setMode('preview');
  }
 }
 async function importFile(event){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(!/\.(md|markdown|txt)$/i.test(file.name))return handleError('Choose an .md, .markdown, or .txt file.');
  if(file.size>256*1024)return handleError('Choose a Markdown file smaller than 256 KB.');
  setImporting(true);
  try{const text=(await file.text()).replace(/^\uFEFF/,'');if(!active.current)return;const current=latest.current;const next=current?current+'\n\n'+text:text;onChange(next);setMode('preview');handleSuccess('Markdown imported. Saving automatically.');}
  catch{handleError('Could not read that file. Please try another file.');}finally{if(active.current)setImporting(false)}
 }
 async function copyMarkdown(){try{await navigator.clipboard.writeText(value);handleSuccess('Markdown copied');}catch{handleError('Could not copy. Use Write mode to select and copy the text.')}}
 function download(){const url=URL.createObjectURL(new Blob([value],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=(title||'note').replace(/[<>:"/\|?*]/g,'-')+'.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <section className="markdown-editor" aria-label="Markdown note editor">
  <div className="markdown-topbar"><div className="markdown-modes" role="group" aria-label="Editor mode">{['write','preview','split'].map(item=><button key={item} type="button" disabled={disabled} aria-pressed={mode===item} onClick={()=>{setMode(item);onBlur?.()}}>{item==='write'?'Write':item==='preview'?'Preview':'Split'}</button>)}</div>{onTitleChange&&<InlineNoteTitle title={title} onSave={onTitleChange} disabled={disabled}/>}<div className="markdown-file-actions"><input ref={fileInput} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" hidden onChange={importFile} disabled={disabled||importing}/><button type="button" disabled={disabled||importing} onClick={()=>fileInput.current.click()}><Icon name="download" size={16}/>{importing?'Importing...':'Import .md'}</button><button type="button" disabled={disabled||!value} onClick={copyMarkdown}><Icon name="copy" size={16}/>Copy Markdown</button><button type="button" disabled={disabled||!value} onClick={download}><Icon name="upload" size={16}/>Export .md</button></div></div>
  {mode!=='preview'&&<div className="markdown-formatbar" role="group" aria-label="Markdown formatting"><button type="button" title="Heading" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'## ',placeholder:'Heading'})}>H2</button><button type="button" title="Bold" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'**',after:'**'})}><strong>B</strong></button><button type="button" title="Italic" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'*',after:'*'})}><em>I</em></button><button type="button" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'\n- ',placeholder:'List item'})}>List</button><button type="button" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'\n- [ ] ',placeholder:'Task'})}>Checklist</button><button type="button" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(undefined,{before:'\n\x60\x60\x60\n',after:'\n\x60\x60\x60\n',placeholder:'code'})}>Code</button><span>Paste Markdown to see it formatted</span></div>}
  <div className={'markdown-panes mode-'+mode}>
   {mode!=='preview'&&<textarea ref={editor} className="editor-textarea markdown-source" aria-label="Note Markdown source" value={value} onChange={event=>onChange(event.target.value)} onPaste={paste} onBlur={onBlur} disabled={disabled} spellCheck placeholder={'Write or paste Markdown here...\n\n# Heading\n**Bold text**\n- A list item\n- [ ] A task'}/>}
   {mode!=='write'&&<article className="markdown-preview" aria-label="Formatted note">{value?<Markdown remarkPlugins={[remarkGfm]} components={{pre:CodeBlock,a:({node,...props})=><a {...props} target="_blank" rel="noopener noreferrer"/>,img:({node,...props})=><img {...props} loading="lazy"/>}}>{value}</Markdown>:<p className="markdown-empty">Your formatted note will appear here. Switch to Write or import a Markdown file.</p>}</article>}
  </div>
  <div className="markdown-caption"><span>Markdown supported</span><span>{value.trim()?value.trim().split(/\s+/).length:0} words</span></div>
 </section>;
}
