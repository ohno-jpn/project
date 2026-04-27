import os
import re
import io
import time
import tempfile
import urllib.request
import urllib.parse
import json
from datetime import datetime
from flask import Flask, request, render_template, redirect, url_for, abort
from sqlalchemy import func
from models import db, Trip, Photo, TripPrefecture
import exifread
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

# DATABASE_URL: Render.comが "postgres://" を提供する場合に修正
_db_url = os.environ.get('DATABASE_URL', f'sqlite:///{BASE_DIR}/travel.db')
if _db_url.startswith('postgres://'):
    _db_url = _db_url.replace('postgres://', 'postgresql://', 1)

app.config.update(
    SQLALCHEMY_DATABASE_URI=_db_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    MAX_CONTENT_LENGTH=200 * 1024 * 1024,
    SECRET_KEY=os.environ.get('SECRET_KEY', 'travel-app-dev'),
)

db.init_app(app)

# Supabase クライアント
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')
SUPABASE_BUCKET = 'photos'
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY:
    from supabase import create_client
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

with app.app_context():
    db.create_all()
    if supabase_client:
        try:
            supabase_client.storage.create_bucket(SUPABASE_BUCKET, options={'public': True})
        except Exception:
            pass  # すでに存在する場合は無視

# Japan GeoJSON（起動時にダウンロード）
GEOJSON_PATH = os.path.join(BASE_DIR, 'static', 'japan.geojson')
os.makedirs(os.path.join(BASE_DIR, 'static'), exist_ok=True)
if not os.path.exists(GEOJSON_PATH):
    try:
        _url = 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson'
        _req = urllib.request.Request(_url, headers={'User-Agent': 'travel-app/1.0'})
        with urllib.request.urlopen(_req, timeout=30) as _res:
            with open(GEOJSON_PATH, 'wb') as _f:
                _f.write(_res.read())
    except Exception as _e:
        print(f'Warning: GeoJSON download failed: {_e}')

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'}


# ---------- EXIF helpers ----------

def _dms_to_decimal(values, ref):
    try:
        d = float(values[0].num) / float(values[0].den)
        m = float(values[1].num) / float(values[1].den)
        s = float(values[2].num) / float(values[2].den)
        result = d + m / 60 + s / 3600
        if str(ref).strip() in ('S', 'W'):
            result = -result
        return result
    except Exception:
        return None


def get_exif_info(filepath):
    info = {'lat': None, 'lon': None}
    try:
        with open(filepath, 'rb') as f:
            tags = exifread.process_file(f, details=False)

        for key in ['EXIF DateTimeOriginal', 'EXIF DateTime', 'Image DateTime']:
            if key in tags:
                info['datetime'] = str(tags[key])
                break

        if 'Image Make' in tags:
            info['make'] = str(tags['Image Make']).strip()
        if 'Image Model' in tags:
            info['model'] = str(tags['Image Model']).strip()
        if 'GPS GPSAltitude' in tags:
            info['altitude'] = str(tags['GPS GPSAltitude'])

        if 'GPS GPSLatitude' in tags and 'GPS GPSLatitudeRef' in tags:
            info['lat'] = _dms_to_decimal(
                tags['GPS GPSLatitude'].values, tags['GPS GPSLatitudeRef'])
        if 'GPS GPSLongitude' in tags and 'GPS GPSLongitudeRef' in tags:
            info['lon'] = _dms_to_decimal(
                tags['GPS GPSLongitude'].values, tags['GPS GPSLongitudeRef'])
    except Exception:
        pass
    return info


def reverse_geocode(lat, lon):
    empty = {'country': '', 'state': '', 'city': ''}
    try:
        params = urllib.parse.urlencode({
            'lat': lat, 'lon': lon, 'format': 'json', 'accept-language': 'ja',
        })
        req = urllib.request.Request(
            f'https://nominatim.openstreetmap.org/reverse?{params}',
            headers={'User-Agent': 'travel-app/1.0'})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            addr = data.get('address', {})
            city = addr.get('city') or addr.get('town') or addr.get('village') or ''
            state = addr.get('state') or addr.get('province') or ''
            if not state:
                for part in data.get('display_name', '').split(', '):
                    if part.endswith(('都', '道', '府', '県')):
                        state = part
                        break
            return {'country': addr.get('country', ''), 'state': state, 'city': city}
    except Exception:
        return empty


# ---------- Supabase Storage helpers ----------

def _upload_supabase(data_bytes, path, content_type='image/jpeg'):
    if not supabase_client:
        return ''
    try:
        supabase_client.storage.from_(SUPABASE_BUCKET).upload(
            path, data_bytes, {'content-type': content_type, 'upsert': 'true'})
        return supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(path)
    except Exception as e:
        print(f'Supabase upload error: {e}')
        return ''


def make_preview_and_upload(src_path, trip_id, filename):
    stem = os.path.splitext(filename)[0]
    try:
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
        except ImportError:
            pass
        img = Image.open(src_path).convert('RGB')
        img.thumbnail((1200, 1200), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=85)
        return _upload_supabase(buf.getvalue(), f"{trip_id}/previews/{stem}.jpg")
    except Exception as e:
        print(f'Preview error: {e}')
        return ''


def parse_folder_name(folder_name):
    m = re.match(r'^(\d{8})_(.+)$', folder_name)
    if m:
        try:
            return datetime.strptime(m.group(1), '%Y%m%d').date(), m.group(2)
        except ValueError:
            pass
    return None, folder_name


def rebuild_trip_prefectures(trip_id):
    TripPrefecture.query.filter_by(trip_id=trip_id).delete()
    pref_counts = {}
    for p in Photo.query.filter_by(trip_id=trip_id).all():
        if p.prefecture:
            pref_counts[p.prefecture] = pref_counts.get(p.prefecture, 0) + 1
    for pref, count in pref_counts.items():
        db.session.add(TripPrefecture(trip_id=trip_id, prefecture=pref, photo_count=count))
    db.session.commit()


# ---------- Routes ----------

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    files = request.files.getlist('photos')
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()

    image_files = [f for f in files
                   if os.path.splitext(f.filename)[1].lower() in IMAGE_EXTENSIONS]
    if not image_files:
        return render_template('index.html', error='画像ファイルが見つかりませんでした')

    folder_name = (image_files[0].filename.split('/')[0]
                   if '/' in image_files[0].filename else 'uploaded')
    folder_date, auto_title = parse_folder_name(folder_name)
    if not title:
        title = auto_title

    trip = Trip(folder_date=folder_date, title=title, description=description)
    db.session.add(trip)
    db.session.flush()

    geocode_cache = {}
    pref_counts = {}

    with tempfile.TemporaryDirectory() as tmp_dir:
        for f in image_files:
            basename = os.path.basename(f.filename)
            tmp_path = os.path.join(tmp_dir, basename)
            f.save(tmp_path)

            exif = get_exif_info(tmp_path)
            preview_url = make_preview_and_upload(tmp_path, trip.id, basename)

            lat, lon = exif.get('lat'), exif.get('lon')
            addr = {}
            if lat is not None and lon is not None:
                key = (round(lat, 4), round(lon, 4))
                if key not in geocode_cache:
                    time.sleep(1)
                    geocode_cache[key] = reverse_geocode(lat, lon)
                addr = geocode_cache[key]

            prefecture = addr.get('state', '')
            if prefecture:
                pref_counts[prefecture] = pref_counts.get(prefecture, 0) + 1

            make = exif.get('make', '')
            model = exif.get('model', '')
            db.session.add(Photo(
                trip_id=trip.id,
                filename=basename,
                preview_url=preview_url,
                datetime_taken=exif.get('datetime', ''),
                latitude=lat,
                longitude=lon,
                altitude=exif.get('altitude', ''),
                camera=f'{make} {model}'.strip(),
                prefecture=prefecture,
                country=addr.get('country', ''),
                city=addr.get('city', ''),
            ))

    for pref, count in pref_counts.items():
        db.session.add(TripPrefecture(trip_id=trip.id, prefecture=pref, photo_count=count))

    db.session.commit()
    return redirect(url_for('select_photos', trip_id=trip.id))


@app.route('/trips/<int:trip_id>/select', methods=['GET', 'POST'])
def select_photos(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    photos = Photo.query.filter_by(trip_id=trip_id).order_by(Photo.datetime_taken).all()

    if request.method == 'POST':
        selected_ids = request.form.getlist('selected_photos')
        if len(selected_ids) != 5:
            return render_template('select_photos.html', trip=trip, photos=photos,
                                   error=f'5枚選択してください（現在 {len(selected_ids)} 枚）')
        Photo.query.filter_by(trip_id=trip_id).update({'is_selected': False})
        for pid in selected_ids:
            Photo.query.filter_by(id=int(pid), trip_id=trip_id).update({'is_selected': True})
        db.session.commit()
        return redirect(url_for('trip_detail', trip_id=trip_id))

    return render_template('select_photos.html', trip=trip, photos=photos)


@app.route('/trips/<int:trip_id>')
def trip_detail(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    selected = Photo.query.filter_by(trip_id=trip_id, is_selected=True).all()
    return render_template('trip.html', trip=trip, selected=selected)


@app.route('/trips/<int:trip_id>/edit', methods=['POST'])
def edit_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    new_title = request.form.get('title', '').strip()
    if new_title:
        trip.title = new_title
    trip.description = request.form.get('description', '').strip()
    db.session.commit()
    return redirect(url_for('trip_detail', trip_id=trip_id))


@app.route('/trips/<int:trip_id>/delete', methods=['POST'])
def delete_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    if supabase_client:
        try:
            for folder in [str(trip.id), f"{trip.id}/previews"]:
                files = supabase_client.storage.from_(SUPABASE_BUCKET).list(folder)
                paths = [f"{folder}/{f['name']}" for f in files]
                if paths:
                    supabase_client.storage.from_(SUPABASE_BUCKET).remove(paths)
        except Exception as e:
            print(f'Storage delete error: {e}')
    db.session.delete(trip)
    db.session.commit()
    return redirect(url_for('trip_list'))


@app.route('/trips/<int:trip_id>/photos/<int:photo_id>/edit', methods=['POST'])
def edit_photo(trip_id, photo_id):
    photo = Photo.query.filter_by(id=photo_id, trip_id=trip_id).first_or_404()
    photo.prefecture = request.form.get('prefecture', '').strip()
    photo.city = request.form.get('city', '').strip()
    photo.country = request.form.get('country', '').strip()
    db.session.commit()
    rebuild_trip_prefectures(trip_id)
    return redirect(url_for('trip_detail', trip_id=trip_id))


@app.route('/trips')
def trip_list():
    trips = Trip.query.order_by(Trip.folder_date.desc()).all()
    return render_template('trips.html', trips=trips)


@app.route('/map')
def map_view():
    rows = (db.session.query(
                TripPrefecture.prefecture,
                func.count(TripPrefecture.trip_id).label('trip_count'))
            .group_by(TripPrefecture.prefecture).all())

    pref_data = {}
    for row in rows:
        trips = (Trip.query.join(TripPrefecture)
                 .filter(TripPrefecture.prefecture == row.prefecture)
                 .order_by(Trip.folder_date).all())
        pref_data[row.prefecture] = {
            'trip_count': row.trip_count,
            'trips': [{'id': t.id, 'title': t.title,
                        'date': t.folder_date.strftime('%Y年%m月%d日') if t.folder_date else '',
                        'url': url_for('trip_detail', trip_id=t.id)} for t in trips],
        }

    max_visits = max((v['trip_count'] for v in pref_data.values()), default=1)
    return render_template('map.html', pref_data=pref_data, max_visits=max_visits)


@app.route('/photo/<int:trip_id>/<path:filename>')
def serve_photo(trip_id, filename):
    photo = Photo.query.filter_by(trip_id=trip_id, filename=filename).first_or_404()
    if photo.preview_url:
        return redirect(photo.preview_url)
    abort(404)


if __name__ == '__main__':
    app.run(debug=True, port=5002)
