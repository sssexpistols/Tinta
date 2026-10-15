export function parseCodeInfo(info=''){
 const language=/^\s*([^\s]+)/.exec(info)?.[1]||'';
 const metadata={};const pattern=/\b(filename|title|line)\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\s]+))/g;
 for(const match of info.matchAll(pattern))metadata[match[1]]=match[2]??match[3]??match[4];
 const line=/^\d{1,7}$/.test(metadata.line||'')?Number(metadata.line):null;
 return {language,filename:(metadata.filename||'').slice(0,512),title:(metadata.title||'').slice(0,512),line:line>0?line:null};
}
