import os
import re
from datetime import datetime
from flask import (Flask, render_template, redirect, url_for,
                   request, jsonify, Response, g)
from dotenv import load_dotenv
from models import db, Event, Photo, SyncLog
from drive_client import DriveClient
from clerk_auth import login_required

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gallery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ.get('SECRET_KEY', 'change-me-in-production')

db.init_app(app)

with app.app_context():
    db.create_all()

drive = DriveClient()

FOLDER_RE = re.compile(r'^(\d{8})_(.+)$')


@app.context_processor
def inject_clerk():
    return {
        'clerk_publishable_key': os.environ.get('CLERK_PUBLISHABLE_KEY', ''),
    }


# ---------- pages ----------

@app.route('/')
def index():
    return redirect(url_for('events'))


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/events')
@login_required
def events():
    q = request.args.get('q', '').strip()
    date_from = request.args.get('from', '').strip()
    date_to = request.args.get('to', '').strip()

    query = Event.query
    if q:
        query = query.filter(Event.event_title.ilike(f'%{q}%'))
    if date_from:
        query = query.filter(Event.event_date >= date_from)
    if date_to:
        query = query.filter(Event.event_date <= date_to)

    event_list = query.order_by(Event.event_date.desc()).all()
    return render_template('events.html', events=event_list,
                           q=q, date_from=date_from, date_to=date_to)


@app.route('/events/<folder_id>')
@login_required
def event_detail(folder_id):
    event = Event.query.filter_by(folder_id=folder_id).first_or_404()
    photos = Photo.query.filter_by(event_id=event.id).order_by(Photo.sort_order).all()
    return render_template('event_detail.html', event=event, photos=photos)


# ---------- image proxy ----------

@app.route('/proxy/thumb/<file_id>')
@login_required
def proxy_thumb(file_id):
    data, mime = drive.get_thumbnail(file_id)
    if data is None:
        return '', 404
    return Response(data, mimetype=mime)


@app.route('/proxy/photo/<file_id>')
@login_required
def proxy_photo(file_id):
    data, mime = drive.get_photo(file_id)
    if data is None:
        return '', 404
    return Response(data, mimetype=mime)


# ---------- sync ----------

@app.route('/admin/sync', methods=['POST'])
@login_required
def sync():
    parent_id = os.environ.get('GDRIVE_PARENT_FOLDER_ID', '')
    if not parent_id:
        return jsonify({'error': 'GDRIVE_PARENT_FOLDER_ID not set'}), 500

    try:
        folders = drive.list_event_folders(parent_id)
        event_count = photo_count = 0

        for folder in folders:
            m = FOLDER_RE.match(folder['name'])
            if not m:
                continue
            try:
                event_date = datetime.strptime(m.group(1), '%Y%m%d').date()
            except ValueError:
                continue

            event = Event.query.filter_by(folder_id=folder['id']).first()
            if not event:
                event = Event(folder_id=folder['id'])
                db.session.add(event)

            photos_data = drive.list_photos(folder['id'])

            event.folder_name = folder['name']
            event.event_date = event_date
            event.event_title = m.group(2)
            event.photo_count = len(photos_data)
            event.last_synced = datetime.utcnow()
            db.session.flush()

            if photos_data:
                event.cover_thumbnail_url = url_for('proxy_thumb', file_id=photos_data[0]['id'])

            existing_ids = {p.file_id for p in Photo.query.filter_by(event_id=event.id)}
            new_ids = {p['id'] for p in photos_data}

            Photo.query.filter(
                Photo.event_id == event.id,
                Photo.file_id.notin_(new_ids)
            ).delete(synchronize_session=False)

            for i, ph in enumerate(photos_data):
                if ph['id'] not in existing_ids:
                    db.session.add(Photo(
                        event_id=event.id,
                        file_id=ph['id'],
                        filename=ph['name'],
                        thumbnail_url=url_for('proxy_thumb', file_id=ph['id']),
                        web_view_url=url_for('proxy_photo', file_id=ph['id']),
                        mime_type=ph.get('mimeType', ''),
                        sort_order=i,
                    ))

            event_count += 1
            photo_count += len(photos_data)

        db.session.add(SyncLog(event_count=event_count, photo_count=photo_count, status='success'))
        db.session.commit()
        return jsonify({'status': 'ok', 'events': event_count, 'photos': photo_count})

    except Exception as e:
        db.session.rollback()
        db.session.add(SyncLog(event_count=0, photo_count=0, status=f'error: {e}'))
        db.session.commit()
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5002)
