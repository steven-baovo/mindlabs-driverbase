/**
 * Tiện ích tương tác với Google Drive API (đặc biệt là AppData folder).
 */

const SYNC_FILE_NAME = 'mindlabs_data.json';

export async function findOrCreateSyncFile(accessToken: string): Promise<string | null> {
  try {
    // 1. Tìm file trong appDataFolder
    const query = encodeURIComponent(`name='${SYNC_FILE_NAME}' and 'appDataFolder' in parents and trashed=false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id,name)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!searchRes.ok) {
      console.error('[GDrive API] Search failed:', await searchRes.text());
      return null;
    }

    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id; // Trả về file ID nếu đã tồn tại
    }

    // 2. Không tìm thấy -> Tạo file mới
    const metadata = {
      name: SYNC_FILE_NAME,
      parents: ['appDataFolder']
    };

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!createRes.ok) {
      console.error('[GDrive API] Create file failed:', await createRes.text());
      return null;
    }

    const createData = await createRes.json();
    return createData.id;
  } catch (err) {
    console.error('[GDrive API] findOrCreateSyncFile error:', err);
    return null;
  }
}

export async function downloadSyncData(accessToken: string, fileId: string): Promise<any | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (res.status === 404) return null; // Không có data
    if (!res.ok) {
      console.error('[GDrive API] Download failed:', await res.text());
      return null;
    }

    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    console.error('[GDrive API] downloadSyncData error:', err);
    return null;
  }
}

export async function uploadSyncData(accessToken: string, fileId: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.error('[GDrive API] Upload failed:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[GDrive API] uploadSyncData error:', err);
    return false;
  }
}
