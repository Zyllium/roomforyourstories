import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { spawn } from 'node:child_process';

const hidden = new Writable({
  write(chunk, encoding, callback) {
    callback();
  }
});

const terminal = createInterface({
  input: process.stdin,
  output: hidden,
  terminal: true
});

terminal.on('SIGINT', () => {
  terminal.close();
  process.exit(130);
});

process.stdout.write('Paste your SETUP_SECRET (typing is hidden): ');

terminal.question('', (answer) => {
  terminal.close();
  console.log();

  const key = answer.trim();
  if (!key) {
    console.log('No key entered.');
    return;
  }

  const url = new URL('https://roomforyourstories.com/setup');
  url.hash = new URLSearchParams({ key }).toString();

  const browser = spawn(
    'rundll32.exe',
    ['url.dll,FileProtocolHandler', url.href],
    { shell: false, stdio: 'ignore' }
  );

  browser.on('error', () => {
    console.log('Could not open your default browser.');
  });
});