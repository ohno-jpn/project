"""
サービスアカウント接続テストスクリプト

使い方:
  1. Google Cloud Console でサービスアカウントを作成し、
     service_account.json をこのフォルダに置く
  2. Google Drive で写真フォルダをサービスアカウントのメールと「閲覧者」で共有する
  3. .env に GDRIVE_PARENT_FOLDER_ID を設定する
  4. python setup_oauth.py を実行して接続確認
"""
import os
from dotenv import load_dotenv

load_dotenv()

if not os.path.exists('service_account.json'):
    print('ERROR: service_account.json が見つかりません。')
    print('Google Cloud Console でサービスアカウントを作成し、JSONキーをダウンロードしてください。')
    exit(1)

from drive_client import DriveClient

client = DriveClient()
creds = client._get_creds()
print(f'認証成功！ サービスアカウント: {creds.service_account_email}')

parent_id = os.environ.get('GDRIVE_PARENT_FOLDER_ID', '')
if not parent_id:
    print('\n.env に GDRIVE_PARENT_FOLDER_ID を設定してください。')
    exit(0)

folders = client.list_event_folders(parent_id)
if not folders:
    print('\nフォルダが見つかりませんでした。')
    print('以下を確認してください:')
    print(f'  - GDRIVE_PARENT_FOLDER_ID が正しいか')
    print(f'  - Google Driveで写真フォルダを {creds.service_account_email} と共有しているか')
else:
    print(f'\n親フォルダ内のイベントフォルダ数: {len(folders)}')
    for f in folders[:5]:
        print(f"  - {f['name']} (id: {f['id']})")
    if len(folders) > 5:
        print(f'  ... 他 {len(folders) - 5} 件')
    print('\n接続OK！')
