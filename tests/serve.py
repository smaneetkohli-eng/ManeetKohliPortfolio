"""Local-only browser regression server: python3 tests/serve.py (no dependencies)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        url = urlsplit(self.path)
        content = None
        mime = 'text/javascript'
        if url.path == '/tests/unavailable.js':
            content = 'throw new Error("Simulated shader CDN outage");'
        elif url.path == '/' and 'motion=reduce' in url.query:
            content = (ROOT / 'index.html').read_text().replace('css/site.css?v=', 'css/site.css?motion=reduce&v=')
            content = content.replace('<head>', '''<head><script>
              const nativeMatch = window.matchMedia.bind(window);
              window.matchMedia = q => q.includes('prefers-reduced-motion')
                ? Object.assign(new EventTarget(), {matches:true, media:q}) : nativeMatch(q);
            </script>''')
            mime = 'text/html'
        elif url.path == '/css/site.css' and 'motion=reduce' in url.query:
            content = (ROOT / 'css/site.css').read_text().replace('(prefers-reduced-motion: reduce)', '(min-width: 0px)')
            mime = 'text/css'
        elif url.path == '/' and 'shader=fail' in url.query:
            content = (ROOT / 'index.html').read_text().replace('js/site.js?v=', 'js/site.js?shader=fail&v=')
            mime = 'text/html'
        elif url.path == '/js/site.js' and 'shader=fail' in url.query:
            content = (ROOT / 'js/site.js').read_text().replace('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.80/+esm', '/tests/unavailable.js')
        if content is None:
            return super().do_GET()
        data = content.encode()
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

if __name__ == '__main__':
    print('Regression tests: http://127.0.0.1:8081/tests/browser.html', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8081), Handler).serve_forever()
