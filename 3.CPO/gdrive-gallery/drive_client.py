import os
import requests as req
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# サービスアカウントはDrive読み取り専用スコープのみ付与
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

IMAGE_MIMETYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/heic', 'image/heif', 'image/tiff', 'image/bmp',
    'image/x-canon-cr2', 'image/x-nikon-nef', 'image/x-sony-arw',
    'image/x-panasonic-raw',
}


class DriveClient:
    def __init__(self):
        self._creds = None

    def _get_creds(self):
        if self._creds and self._creds.valid:
            return self._creds
        # サービスアカウントキーから認証情報を生成
        # このアカウントには「写真フォルダのみ」を共有しておく → 他ファイルにアクセス不可
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        if not creds.valid:
            creds.refresh(Request())
        self._creds = creds
        return creds

    def _get_service(self):
        return build('drive', 'v3', credentials=self._get_creds())

    def list_event_folders(self, parent_id):
        svc = self._get_service()
        results = svc.files().list(
            q=f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields="files(id, name)",
            orderBy="name desc",
            pageSize=1000,
        ).execute()
        return results.get('files', [])

    def list_photos(self, folder_id):
        svc = self._get_service()
        mime_filter = ' or '.join(f"mimeType='{m}'" for m in IMAGE_MIMETYPES)
        results = svc.files().list(
            q=f"'{folder_id}' in parents and ({mime_filter}) and trashed=false",
            fields="files(id, name, mimeType)",
            orderBy="name",
            pageSize=1000,
        ).execute()
        return results.get('files', [])

    def _drive_thumbnail(self, file_id, size):
        """Google Driveのthumbnailエンドポイント経由で画像を取得"""
        creds = self._get_creds()
        if not creds.valid:
            creds.refresh(Request())
        url = f"https://drive.google.com/thumbnail?id={file_id}&sz={size}"
        resp = req.get(url, headers={"Authorization": f"Bearer {creds.token}"}, timeout=10)
        if resp.status_code == 200:
            return resp.content, resp.headers.get('Content-Type', 'image/jpeg')
        return None, None

    def get_thumbnail(self, file_id):
        try:
            return self._drive_thumbnail(file_id, 'w400')
        except Exception:
            return None, None

    def get_photo(self, file_id):
        """大きめサイズで取得（フルサイズの代わりにweb最適化サイズ）"""
        try:
            return self._drive_thumbnail(file_id, 'w1600')
        except Exception:
            return None, None
