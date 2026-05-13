import os
import time
import requests
from functools import wraps
from flask import request, redirect, url_for, g, jsonify
import jwt
from jwt.algorithms import RSAAlgorithm

_jwks_cache = {'keys': None, 'fetched_at': 0}
JWKS_TTL = 3600


def _get_jwks():
    now = time.time()
    if _jwks_cache['keys'] and now - _jwks_cache['fetched_at'] < JWKS_TTL:
        return _jwks_cache['keys']
    domain = os.environ.get('CLERK_DOMAIN', '')
    resp = requests.get(f"https://{domain}/.well-known/jwks.json", timeout=10)
    resp.raise_for_status()
    _jwks_cache['keys'] = resp.json()
    _jwks_cache['fetched_at'] = now
    return _jwks_cache['keys']


def verify_token(token):
    jwks = _get_jwks()
    header = jwt.get_unverified_header(token)
    kid = header.get('kid')
    for key_data in jwks.get('keys', []):
        if key_data.get('kid') == kid:
            public_key = RSAAlgorithm.from_jwk(key_data)
            return jwt.decode(token, public_key, algorithms=['RS256'],
                              options={"verify_aud": False})
    raise ValueError('No matching key in JWKS')


def _extract_token():
    token = request.cookies.get('__session', '')
    if not token:
        token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip()
    return token


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token()
        if not token:
            if request.accept_mimetypes.accept_json:
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login'))
        try:
            payload = verify_token(token)
            g.user_id = payload.get('sub')
        except Exception:
            if request.accept_mimetypes.accept_json:
                return jsonify({'error': 'Invalid token'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated
