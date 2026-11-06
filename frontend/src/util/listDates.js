const formatter=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
export function updatedTimestamp(item){const updated=Date.parse(item.updatedAt);if(Number.isFinite(updated))return updated;const created=Date.parse(item.createdAt);return Number.isFinite(created)?created:0;}
export function newestUpdatedFirst(items){return [...items].sort((a,b)=>updatedTimestamp(b)-updatedTimestamp(a)||String(b._id||'').localeCompare(String(a._id||'')));}
export function formatListDate(value){const date=new Date(value);return value&&Number.isFinite(date.getTime())?formatter.format(date).replace(/\b(am|pm)\b/gi,text=>text.toUpperCase()):'Unavailable';}
