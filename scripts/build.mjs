import {cp,mkdir,rm,copyFile} from 'node:fs/promises';
import {generateUserscript} from './userscript.mjs';
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
await generateUserscript();
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ['src','examples','browser'])await cp(new URL(name,root),new URL(name+'/',dist),{recursive:true});
for(const name of ['index.html','LICENSE'])await copyFile(new URL(name,root),new URL(name,dist));
console.log('Built dist/: static demo, reusable modules, styles and userscript. No runtime dependencies.');
