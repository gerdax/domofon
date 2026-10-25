import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('service worker precaches all assets and serves the app from a subdirectory without network',async()=>{
  const origin='https://example.github.io',base=origin+'/domofon/',entries=new Map(),handlers={};let claimed=false,networkCalls=0,currentCache;
  const caches={open:async name=>{currentCache=name;return {addAll:async requests=>{for(const request of requests){assert.equal(request.cache,'reload');const path=request.url;const local=path==='./'?'index.html':path.slice(2).split('?')[0];const bytes=await readFile(new URL('../dist/'+local,import.meta.url));entries.set(new URL(path,base).href,{bytes});}}};},match:async request=>entries.get(new URL(typeof request==='string'?request:request.url,base).href),keys:async()=>['domofon-v0',currentCache,'other-app-v1'],delete:async key=>{assert.equal(key,'domofon-v0');}};
  vm.runInNewContext(await readFile(new URL('../dist/sw.js',import.meta.url),'utf8'),{caches,URL,Response,Request:class{constructor(url,options){this.url=url;this.cache=options.cache;}},self:{location:{origin},skipWaiting:()=>Promise.resolve(),clients:{claim:()=>{claimed=true;}},addEventListener:(type,fn)=>handlers[type]=fn},fetch:async()=>{networkCalls++;throw Error('offline');}});
  let work;handlers.install({waitUntil:promise=>work=promise});await work;handlers.activate({waitUntil:promise=>work=promise});await work;assert.ok(claimed);
  for(const url of entries.keys()){handlers.fetch({request:{url,method:'GET',mode:'cors'},respondWith:promise=>work=promise});assert.ok((await work).bytes.length>0);}
  assert.equal(networkCalls,0);
  handlers.fetch({request:{url:base+'some-route',method:'GET',mode:'navigate'},respondWith:promise=>work=promise});assert.ok((await work).bytes.toString().includes('<title>Domofon</title>'));
});
