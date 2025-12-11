
import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import json
import ssl

PORT = 8000
REDASH_HOST = 'https://dashboard.quebon.tv'

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # Handle API requests to Redash
        if self.path.startswith('/api/queries/'):
            self.handle_proxy_request()
        else:
            super().do_POST()

    def do_GET(self):
        # Handle API requests to Redash
        if self.path.startswith('/api/jobs/') or self.path.startswith('/api/query_results/'):
            self.handle_proxy_request()
        else:
            super().do_GET()

    def handle_proxy_request(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else None
        
        target_url = f"{REDASH_HOST}{self.path}"
        print(f"Proxying request to: {target_url}")
        
        try:
            # Create request
            headers = {
                'Authorization': self.headers.get('Authorization'),
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
            
            req = urllib.request.Request(target_url, data=post_data, headers=headers, method=self.command)
            
            # Create SSL context to ignore verification if needed (optional)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(req, context=ctx) as response:
                response_data = response.read()
                
                self.send_response(response.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            print(f"Proxy Error: {e}")
            self.wfile.write(str(e).encode())

print(f"Starting proxy server on port {PORT}...")
print(f"Open http://localhost:{PORT} in your browser")

# Allow address reuse
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
