#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8082

class GameHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
    }

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

def run(port=PORT):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", port), GameHTTPRequestHandler) as httpd:
            print(f"🚀 Subway Surfers server running at http://127.0.0.1:{port}/")
            print(f"📡 Also available on LAN (port {port})")
            sys.stdout.flush()
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {port} busy, trying {port + 1}: {e}")
        run(port + 1)

if __name__ == '__main__':
    run()
