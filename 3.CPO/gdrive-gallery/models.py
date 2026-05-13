from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    folder_id = db.Column(db.Text, unique=True, nullable=False)
    folder_name = db.Column(db.Text)
    event_date = db.Column(db.Date)
    event_title = db.Column(db.Text)
    photo_count = db.Column(db.Integer, default=0)
    cover_thumbnail_url = db.Column(db.Text)
    last_synced = db.Column(db.DateTime)

    photos = db.relationship('Photo', backref='event', lazy=True, cascade='all, delete-orphan')


class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    file_id = db.Column(db.Text, unique=True, nullable=False)
    filename = db.Column(db.Text)
    thumbnail_url = db.Column(db.Text)
    web_view_url = db.Column(db.Text)
    mime_type = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)


class SyncLog(db.Model):
    __tablename__ = 'sync_log'

    id = db.Column(db.Integer, primary_key=True)
    synced_at = db.Column(db.DateTime, default=datetime.utcnow)
    event_count = db.Column(db.Integer, default=0)
    photo_count = db.Column(db.Integer, default=0)
    status = db.Column(db.Text)
