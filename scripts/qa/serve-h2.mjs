// Local stand-in for Netlify's CDN when measuring performance: HTTP/2 over TLS + Brotli, serving the
// static export in out/. `npx serve` speaks HTTP/1.1 with gzip, which makes Lighthouse's simulated
// mobile timings much worse than production.
// Usage: node scripts/qa/serve-h2.mjs [port=4443] [dir=out]  (self-signed cert: run Chrome with
// --ignore-certificate-errors)
import http2 from "node:http2";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const [, , PORT = "4443", DIR = "out"] = process.argv;
const root = path.resolve(DIR);
const certDir = path.join(tmpdir(), "comme-avant-h2");
mkdirSync(certDir, { recursive: true });
const key = path.join(certDir, "key.pem");
const cert = path.join(certDir, "cert.pem");
if (!existsSync(key)) {
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert, "-days", "30", "-subj", "/CN=localhost"], { stdio: "ignore" });
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".svg"]);
const cache = new Map();

function resolve(urlPath) {
  let p = path.join(root, decodeURIComponent(urlPath.split("?")[0]));
  if (!p.startsWith(root)) return null;
  if (existsSync(p) && statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (existsSync(p)) return p;
  if (existsSync(p + ".html")) return p + ".html";
  return null;
}

const server = http2.createSecureServer({ key: readFileSync(key), cert: readFileSync(cert), allowHTTP1: true }, (req, res) => {
  let file = resolve(req.url);
  let status = 200;
  if (!file) {
    file = path.join(root, "404.html");
    status = 404;
  }
  const ext = path.extname(file);
  const headers = { "content-type": TYPES[ext] ?? "application/octet-stream" };
  if (req.url.startsWith("/_next/static/") || req.url.startsWith("/img/")) headers["cache-control"] = "public, max-age=31536000, immutable";
  else headers["cache-control"] = "public, max-age=0, must-revalidate";
  let body = readFileSync(file);
  if (COMPRESSIBLE.has(ext) && /\bbr\b/.test(req.headers["accept-encoding"] ?? "")) {
    if (!cache.has(file)) cache.set(file, zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }));
    body = cache.get(file);
    headers["content-encoding"] = "br";
  }
  res.writeHead(status, headers);
  res.end(body);
});
server.listen(Number(PORT), () => console.log(`https://localhost:${PORT} → ${root}`));
