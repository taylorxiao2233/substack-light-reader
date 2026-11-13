import http from 'node:http';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const allowed = new Map([
  ['/', ['docs/preview.svg', 'image/svg+xml']],
  ['/demo', ['tests/browser/demo.html', 'text/html']],
  ['/demo.js', ['tests/browser/demo.js', 'text/javascript']],
  ['/runtime.js', ['src/runtime.js', 'text/javascript']],
  ['/light-theme.css', ['src/light-theme.css', 'text/css']],
  ['/src/runtime.js', ['src/runtime.js', 'text/javascript']],
  ['/src/light-theme.css', ['src/light-theme.css', 'text/css']]
]);
const server = http.createServer((req, res) => {
  const item = allowed.get(new URL(req.url, 'http://127.0.0.1').pathname);
  if (!item) { res.writeHead(404); res.end(); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'none'; form-action 'none'");
  res.setHeader('Content-Type', `${item[1]}; charset=utf-8`);
  res.end(readFileSync(new URL(item[0], root)));
});
server.listen(48732, '127.0.0.1', () => {
  console.log('Preview illustration: http://127.0.0.1:48732');
  console.log('Interactive local fixture: http://127.0.0.1:48732/demo');
});
