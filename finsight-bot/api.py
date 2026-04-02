"""
FinSight Bot API
Simple HTTP API to wrap the chatbot logic
"""

import os
import sys

# Add the finsight-bot directory to path
bot_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, bot_dir)

from http.server import HTTPServer, BaseHTTPRequestHandler
import json

from dotenv import load_dotenv
load_dotenv(os.path.join(bot_dir, '.env'))

from src.chatbot.bot import FinSightBot


class BotHandler(BaseHTTPRequestHandler):
    bot = None

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            message = body.get('message', '')
            if not message:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Message is required'}).encode())
                return

            response = self.bot.process_message(message)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'response': response}).encode())
        
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[API] {args[0]}")


def run_server(port=5000):
    BotHandler.bot = FinSightBot()
    
    server = HTTPServer(('', port), BotHandler)
    print(f"FinSight Bot API running on http://localhost:{port}")
    print("Endpoints:")
    print(f"  POST http://localhost:{port}/api/chat")
    print(f"  GET  http://localhost:{port}/api/health")
    
    server.serve_forever()


if __name__ == '__main__':
    run_server()
