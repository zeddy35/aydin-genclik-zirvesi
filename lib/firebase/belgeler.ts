import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './config';
import type { Belge, BelgeTuru, AdminBelgeTuru } from './types';

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

export async function uploadKullaniciBelge(
  uid: string,
  file: File,
  belgeTuru: BelgeTuru,
  onProgress?: (progress: number) => void
): Promise<void> {
  const filePath = `belgeler/${uid}/${belgeTuru}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      reject,
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'belgeler'), {
          kullaniciId: uid,
          belgeTuru,
          dosyaUrl: downloadUrl,
          dosyaAdi: file.name,
          dosyaBoyutu: file.size,
          yukleyenTip: 'kullanici',
          yuklenmeTarihi: serverTimestamp(),
          durum: 'yuklendi',
        });
        resolve();
      }
    );
  });
}

export async function uploadAdminBelge(
  uid: string,
  file: File,
  belgeTuru: AdminBelgeTuru,
  onProgress?: (progress: number) => void
): Promise<void> {
  const filePath = `admin_belgeler/${uid}/${belgeTuru}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      reject,
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'belgeler'), {
          kullaniciId: uid,
          belgeTuru,
          dosyaUrl: downloadUrl,
          dosyaAdi: file.name,
          dosyaBoyutu: file.size,
          yukleyenTip: 'admin',
          yuklenmeTarihi: serverTimestamp(),
          durum: 'onaylandi',
        });
        resolve();
      }
    );
  });
}
