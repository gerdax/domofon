import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('install manifest is linked and declares correctly sized PNG icons in the app scope',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../dist/manifest.webmanifest',import.meta.url),'utf8'));
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(html,/<link rel="manifest" href="\.\/manifest\.webmanifest(?:\?[^\"]+)?">/);
  assert.equal(manifest.name,'Domofon');assert.equal(manifest.display,'standalone');
  assert.equal(manifest.prefer_related_applications??false,false);
  for(const field of ['id','start_url','scope'])assert.equal(new URL(manifest[field],'https://gerdax.github.io/domofon/manifest.webmanifest').pathname,'/domofon/');
  for(const size of [192,512]){
    const icon=manifest.icons.find(icon=>icon.sizes===`${size}x${size}`);assert.ok(icon);
    assert.equal(icon.type,'image/png');
    const bytes=await readFile(new URL('../dist/'+icon.src,import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);
  }
  const apple=await readFile(new URL('../dist/assets/key-icon-180.png',import.meta.url));
  assert.equal(apple.readUInt32BE(16),180);assert.equal(apple.readUInt32BE(20),180);
  assert.match(html,/apple-touch-icon.*key-icon-180\.png/);
});
