import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import http from 'node:http';
const root=fileURLToPath(new URL('../',import.meta.url));
test('preview server serves the kit and denies traversal, hidden files and writes',async()=>{
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server startup timeout')),10000);child.once('error',reject);child.once('exit',code=>reject(new Error('Server exited '+code)));child.stdout.on('data',data=>{const match=String(data).match(/127\.0\.0\.1:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});});
  const request=(url,method='GET')=>new Promise((resolve,reject)=>{http.request({hostname:'127.0.0.1',port,path:url,method},res=>{const chunks=[];res.on('data',data=>chunks.push(data));res.on('end',()=>resolve({status:res.statusCode,type:res.headers['content-type'],body:Buffer.concat(chunks).toString()}));}).on('error',reject).end();});
  assert.equal((await request('/')).status,200);
  const module=await request('/src/spacing-control.js');assert.equal(module.status,200);assert.match(module.type,/javascript/);
  for(const pathname of ['/.git/config','/%2e%2e%2fpackage.json','/src/../../.env','/invalid%ZZ'])assert.notEqual((await request(pathname)).status,200);
  assert.equal((await request('/index.html','POST')).status,405);
 }finally{child.kill('SIGTERM');}
});
