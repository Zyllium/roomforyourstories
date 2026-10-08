import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
if(!config.d1_databases?.[0]?.database_id||config.d1_databases[0].database_id==='00000000-0000-4000-8000-000000000000'){console.error('Create your D1 database and put its database_id into wrangler.jsonc first. See README.md.');process.exit(1);}
if(!existsSync('.dev.vars')){console.error('Run pnpm run secrets:generate first. Your deployment uses the private .dev.vars file.');process.exit(1);}
function run(script,args){const r=spawnSync(process.execPath,[script,...args],{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run('node_modules/vite/bin/vite.js',['build']);
run('node_modules/wrangler/bin/wrangler.js',['d1','migrations','apply','DB','--remote','--config','wrangler.jsonc']);
run('node_modules/wrangler/bin/wrangler.js',['deploy','--config','dist/server/wrangler.json','--secrets-file','.dev.vars']);
