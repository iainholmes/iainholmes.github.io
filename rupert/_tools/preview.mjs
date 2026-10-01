// Dependency-free local development preview. Publication still uses GitHub Pages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), value = key => args[args.indexOf(key) + 1];
const port = args.includes('--port') ? Number(value('--port')) : 4173;
const host = args.includes('--host') ? value('--host') : '127.0.0.1';
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + path);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw Error('Outside preview root');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, host, () => console.log(`The Rupert Atlas preview listening on ${host}:${port}`));
