// Dev tool for the layout audit (src/dev/audit.ts). Not part of the Next app.
// Saves audit results POSTed from the browser to docs/audit/<name>.json and serves them back (GET /<name>.json).
// Run: node scripts/audit-sink.mjs   (port 3999)
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIR = resolve(process.cwd(), 'docs/audit');
mkdirSync(DIR, { recursive: true });
const safe = (name) => /^[a-z0-9-]+$/i.test(name);

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.end();
  const name = decodeURIComponent((req.url ?? '/').slice(1)).replace(/\.json$/, '');
  if (!safe(name)) {
    res.statusCode = 400;
    return res.end('bad name');
  }
  const file = join(DIR, `${name}.json`);
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      writeFileSync(file, JSON.stringify(JSON.parse(body), null, 1) + '\n');
      res.end(`saved ${name}.json (${body.length} bytes)`);
    });
    return;
  }
  if (!existsSync(file)) {
    res.statusCode = 404;
    return res.end('not found');
  }
  res.setHeader('content-type', 'application/json');
  res.end(readFileSync(file));
}).listen(3999, () => console.log('audit sink on http://localhost:3999 →', DIR));
