#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = int(os.environ.get("PORT", 8082))

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

# ============================================================================
# 24/7 FLEET KEEP-ALIVE ANTI-SLEEP WORKER
# Automatically pings all ManiSoft cloud services on Render every 9 minutes
# ============================================================================
import threading
import time
import urllib.request

def _start_fleet_keep_alive():
    fleet_urls = [
        "https://manisoft-passmaster-ai.onrender.com",
        "https://manisoft-lumina.onrender.com",
        "https://manisoft-panel.onrender.com",
        "https://manisoft-starshine.onrender.com",
        "https://manisoft-strike-ops.onrender.com",
        "https://manisoft-subway-surfers.onrender.com",
        "https://manisoft-aether-transport.onrender.com"
    ]
    def loop():
        time.sleep(25)
        while True:
            for u in fleet_urls:
                try:
                    req = urllib.request.Request(u, headers={"User-Agent": "ManiSoft-SubwaySurfers-KeepAlive/2.0"})
                    with urllib.request.urlopen(req, timeout=15) as r:
                        r.read(100)
                except Exception:
                    pass
            time.sleep(540) # 9 minutes (well under Render 15-min sleep limit)

    t = threading.Thread(target=loop, daemon=True, name="SubwaySurfersKeepAliveWorker")
    t.start()

_start_fleet_keep_alive()

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
