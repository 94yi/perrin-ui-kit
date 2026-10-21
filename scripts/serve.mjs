import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL(process.argv.includes('--dist')?'../dist/':'../',import.meta.url)));
const port=Number(process.env.PORT||5174),host='127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 try{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.split('/').some(part=>part.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  file=await realpath(file);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const type=types[path.extname(file)];if(!type){res.writeHead(403);res.end('Forbidden');return;}
  const body=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
 }catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Not found');}
});
server.listen(port,host,()=>console.log(`Perrin UI Kit: http://${host}:${server.address().port}/`));
