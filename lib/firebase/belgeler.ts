import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Belge, AdminBelgeTuru } from './types';

export async function getKullaniciBelgeler(uid: string): Promise<Belge[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'belgeler'), where('kullaniciId', '==', uid))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Belge));
  } catch {
    return [];
  }
}

export async function getAdminBelgeler(uid: string): Promise<Belge[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'belgeler'),
        where('kullaniciId', '==', uid),
        where('yukleyenTip', '==', 'admin')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Belge));
  } catch {
    return [];
  }
}

export async function uploadAdminBelge(
  uid: string,
  file: File,
  belgeTuru: AdminBelgeTuru,
  idToken: string,
): Promise<void> {
  // 1. Get presigned upload URL from server
  const presignRes = await fetch('/api/admin/belgeler/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      kullaniciId: uid,
      belgeTuru,
      dosyaAdi: file.name,
      contentType: file.type,
    }),
  });
  if (!presignRes.ok) throw new Error('Presigned URL alınamadı.');
  const { uploadUrl, r2Key } = await presignRes.json();

  // 2. Upload directly to Cloudflare R2
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!uploadRes.ok) throw new Error('R2 yüklemesi başarısız.');

  // 3. Save metadata to Firestore
  await addDoc(collection(db, 'belgeler'), {
    kullaniciId: uid,
    belgeTuru,
    r2Key,
    dosyaUrl: '',
    dosyaAdi: file.name,
    dosyaBoyutu: file.size,
    yukleyenTip: 'admin',
    yuklenmeTarihi: serverTimestamp(),
    durum: 'onaylandi',
  });
}
