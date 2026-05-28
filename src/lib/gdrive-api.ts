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
      },
      cache: 'no-store'
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
      },
      cache: 'no-store'
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
      body: JSON.stringify(data),
      cache: 'no-store'
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

export async function uploadMediaFile(accessToken: string, mediaId: string, dataUrl: string): Promise<boolean> {
  try {
    // 1. Check if file already exists in appDataFolder
    const query = encodeURIComponent(`name='${mediaId}' and 'appDataFolder' in parents and trashed=false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    if (!searchRes.ok) return false;
    const searchData = await searchRes.json();
    let fileId = searchData.files?.[0]?.id;

    // 2. If not, create file metadata in appDataFolder
    if (!fileId) {
      const metadata = {
        name: mediaId,
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
        console.error('[GDrive API] Create media file metadata failed:', await createRes.text());
        return false;
      }
      const createData = await createRes.json();
      fileId = createData.id;
    }

    // 3. Upload content as plain text (Base64 string)
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      body: dataUrl,
      cache: 'no-store'
    });

    if (!uploadRes.ok) {
      console.error('[GDrive API] Upload media file content failed:', await uploadRes.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[GDrive API] uploadMediaFile error:', err);
    return false;
  }
}

export async function downloadMediaFile(accessToken: string, mediaId: string): Promise<string | null> {
  try {
    // 1. Find fileId by name in appDataFolder
    const query = encodeURIComponent(`name='${mediaId}' and 'appDataFolder' in parents and trashed=false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;
    if (!fileId) return null;

    // 2. Download content (raw text/Base64)
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error('[GDrive API] Download media file content failed:', await res.text());
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error('[GDrive API] downloadMediaFile error:', err);
    return null;
  }
}
