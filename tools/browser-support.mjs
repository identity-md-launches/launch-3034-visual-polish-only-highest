/** Optional browser-validation support. Not part of the production export. */
const { chromium } = await import(process.env.WHEEL_RAID_PLAYWRIGHT || 'playwright');
const httpBridge = process.argv.includes('--http-bridge');
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
export async function start(){
 const root=resolve('dist');
 const server=createServer(async(req,res)=>{
  let name=new URL(req.url,'http://localhost').pathname.replace(/^\/preview\//,'/');
  if(name.endsWith('/'))name+='index.html';
  const file=resolve(root,'.'+name);
  if(!file.startsWith(root+'/'))return res.writeHead(403).end();
  try{const data=await readFile(file);res.setHeader('content-type',({'.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404).end()}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 return {browser,base:`http://127.0.0.1:${server.address().port}/preview/`,close:async()=>{await browser.close();await new Promise(r=>server.close(r))}};
}
export async function bridge(page,intercept){
 const failures=[];
 await page.route('https://**/*',async route=>{
  const req=route.request();
  try{
   if(intercept && await intercept(route,req))return;
   if(!httpBridge)return route.continue();
   const resp=await fetch(req.url(),{method:req.method(),headers:req.headers(),body:req.method()==='POST'?req.postData():undefined,signal:AbortSignal.timeout(18000)});
   await route.fulfill({status:resp.status,headers:Object.fromEntries([...resp.headers].filter(([k])=>!['content-encoding','content-length','transfer-encoding'].includes(k))),body:Buffer.from(await resp.arrayBuffer())});
  }catch(e){failures.push({url:req.url(),error:e.message});await route.abort()}
 });
 return failures;
}
export async function shots(page,name,fullPage=true){await mkdir('test/scratch/shots',{recursive:true});await page.screenshot({path:`test/scratch/shots/${name}.png`,fullPage});}
