import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
async function walk(dir){const result=[];for(const name of await readdir(dir)){const file=path.join(dir,name);if((await stat(file)).isDirectory())result.push(...await walk(file));else result.push(file);}return result;}
test('built pages and styles resolve every local asset without the original project',async()=>{
 const dist=path.join(root,'dist');let refs=0;
 for(const file of await walk(dist)){
  if(!['.html','.css','.js'].includes(path.extname(file)))continue;
  const source=await readFile(file,'utf8');
  const imports=path.extname(file)==='.html'?[...source.matchAll(/(?:src|href)="(\.\.?\/[^"#]+)"/g)]:path.extname(file)==='.css'?[...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)]:[...source.matchAll(/(?:from|import)\s*['"](\.\.?\/[^'"]+)['"]/g)];
  for(const [,name] of imports){const target=path.resolve(path.dirname(file),name);assert.ok(target.startsWith(dist+path.sep));assert.ok((await stat(target)).isFile(),target);refs++;}
 }
 assert.ok(refs>=8);
});
test('userscript is independently executable JavaScript with no module imports',async()=>{
 const file=path.join(root,'browser/perrin-spacing.user.js');const source=await readFile(file,'utf8');
 execFileSync(process.execPath,['--check',file]);
 assert.doesNotMatch(source,/^import\s|^export\s/m);
 assert.ok(source.includes('window.PerrinSpacing=mountSpacingControl()'));
});
