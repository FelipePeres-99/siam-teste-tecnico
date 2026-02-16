#!/usr/bin/env python3
from flask import Flask, request, jsonify
import argparse
import time

app = Flask(__name__)

parser = argparse.ArgumentParser(description="Mock external device")
parser.add_argument('--port', type=int, default=8101, help='Port to listen on')
args = parser.parse_args()

@app.route('/command', methods=['POST'])
def command():
    data = request.get_json(force=True)
    print(f"Received command: {data}")
    return jsonify({"status": "OK", "executed": True})

if __name__ == '__main__':
    print(f"Mock Device listening on port {args.port}")
    app.run(host='0.0.0.0', port=args.port)
