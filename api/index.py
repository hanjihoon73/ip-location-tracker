
from flask import Flask, request, Response
import requests
import os

app = Flask(__name__)

REDASH_HOST = 'https://dashboard.quebon.tv'

@app.route('/api/<path:subpath>', methods=['GET', 'POST'])
def proxy(subpath):
    target_url = f"{REDASH_HOST}/api/{subpath}"
    
    # Headers to forward
    headers = {
        key: value for key, value in request.headers if key != 'Host'
    }
    
    # Ensure Content-Type is set for POST requests
    if request.method == 'POST' and 'Content-Type' not in headers:
        headers['Content-Type'] = 'application/json'

    try:
        if request.method == 'GET':
            resp = requests.get(target_url, headers=headers, params=request.args)
        elif request.method == 'POST':
            # Forward JSON body
            json_data = request.get_json(silent=True)
            resp = requests.post(target_url, headers=headers, json=json_data)
        else:
            return Response("Method not allowed", status=405)

        # Create response with CORS headers
        response = Response(resp.content, resp.status_code)
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Content-Type'] = 'application/json'
        
        return response

    except Exception as e:
        return Response(f"Proxy Error: {str(e)}", status=500)

# Handle OPTIONS requests for CORS preflight
@app.route('/api/<path:subpath>', methods=['OPTIONS'])
def handle_options(subpath):
    response = Response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# For local testing if needed (not used in Vercel)
if __name__ == '__main__':
    app.run(port=8000)
