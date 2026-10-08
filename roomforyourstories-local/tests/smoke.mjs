import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173';
const password=readFileSync('.dev.vars','utf8').match(/OWNER_PASSWORD="([^"]+)"/)[1];
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5173','--strictPort'],{stdio:['ignore','pipe','pipe']});
try{
await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Preview startup timed out')),45000);const listen=data=>{if(data.toString().includes('Local:')){clearTimeout(timeout);resolve();}};server.stdout.on('data',listen);server.stderr.on('data',listen);server.on('exit',code=>{clearTimeout(timeout);reject(Error('Preview exited: '+code));});});
assert.equal((await fetch(root+'/api/stories?id=123456789012345678',{method:'DELETE',headers:{Origin:root}})).status,403);
assert.equal((await fetch(root+'/api/stories?id=123456789012345678',{method:'DELETE',headers:{Origin:root,'oai-authenticated-user-id':'site-owner','oai-authenticated-user-email':'fake@example.test'}})).status,403);
assert.equal((await fetch(root+'/api/login',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:JSON.stringify({password})})).status,403);
const login=await fetch(root+'/api/login',{method:'POST',headers:{Origin:root,'Content-Type':'application/json'},body:JSON.stringify({password})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie');assert(cookie.includes('HttpOnly'));assert(cookie.includes('Secure'));assert(cookie.includes('SameSite=Strict'));
const owner=await fetch(root+'/api/owner',{headers:{Cookie:cookie.split(';')[0]}});assert.equal((await owner.json()).isOwner,true);
assert.equal((await (await fetch(root+'/api/owner')).json()).isOwner,false);
const manage=await fetch(root+'/manage',{redirect:'manual'});assert.equal(manage.status,307);assert(manage.headers.get('location').includes('/owner-login'));
const page=await fetch(root+'/stories');assert.equal(page.status,200);assert(!(await page.text()).includes('Owner sign-in'));
console.log('Local public/owner routes passed: deletion authorization, header spoofing rejection, login origin, session cookie and protected management.');
}finally{server.kill('SIGTERM');}
