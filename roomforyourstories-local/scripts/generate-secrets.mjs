import {randomBytes} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
if(existsSync('.dev.vars')){console.error('.dev.vars already exists. Keep CONFIG_KEY unchanged so stored bot settings remain readable. Edit OWNER_PASSWORD or SETUP_SECRET manually to change them.');process.exit(1);}
writeFileSync('.dev.vars',`OWNER_PASSWORD="${randomBytes(24).toString('hex')}"\nSETUP_SECRET="${randomBytes(32).toString('hex')}"\nCONFIG_KEY="${randomBytes(32).toString('base64')}"\n`,{mode:0o600});
console.log('Created private .dev.vars. Keep it out of Git. Save OWNER_PASSWORD in your password manager; SETUP_SECRET is the key for /setup#key=YOUR_KEY. Upload these three secrets using the README instructions.');
