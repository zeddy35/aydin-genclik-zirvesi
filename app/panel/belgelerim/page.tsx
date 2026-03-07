'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getKullaniciBelgeler, uploadKullaniciBelge } from '@/lib/firebase/belgeler';
import type { Belge } from '@/lib/firebase/types';

const BELGE_LABELS: Record<string, string> = {
  ogrenci_belgesi: '🎓 Öğrenci Belgesi',
  nufus_fotokopisi: '🪪 Kimlik Fotokopisi',
  cv: '📄 CV / Özgeçmiş',
  katilim_sertifikasi: '🏆 Katılım Sertifikası',
  diger: '📁 Diğer',
};

export default function BelgelerimPage() {
  const { user } = useAuth();
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTur, setSelectedTur] = useState<string>('ogrenci_belgesi');
  const [dragOver, setDragOver] = useState(false);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const yukle = async () => {
    if (!user) return;
    const list = await getKullaniciBelgeler(user.uid);
    setBelgeler(list);
    setLoading(false);
  };

  useEffect(() => { yukle(); }, [user]);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) { setHata('Dosya boyutu 10 MB\u0027ı geçemez.'); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setHata('Sadece PDF, JPG, PNG veya WebP dosyaları yüklenebilir.'); return; }
    setHata(''); setUploading(true); setUploadProgress(0);
    try {
      await uploadKullaniciBelge(user.uid, file, selectedTur as Parameters<typeof uploadKullaniciBelge>[2], (p) => setUploadProgress(p));
      setBasari('Dosya başarıyla yüklendi!');
      await yukle();
      setTimeout(() => setBasari(''), 4000);
    } catch {
      setHata('Yükleme sırasında bir hata oluştu.');
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  };

  if (!user) return null;

  const kullaniciBelgeler = belgeler.filter(b => b.yukleyenTip === 'kullanici');
  const adminBelgeler = belgeler.filter(b => b.yukleyenTip === 'admin');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Share+Tech+Mono&display=swap');
        .bp-page { padding: 28px; max-width: 760px; margin: 0 auto; }
        .bp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .bp-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 28px; }
        .bp-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .bp-sec-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed #1e1a2e; }
        .bp-sel { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .bp-sel-btn { background: #0d0b18; border: 1px solid #2a2545; border-radius: 8px; padding: 8px 14px; color: #6b6485; font-size: 13px; cursor: pointer; transition: all 150ms; font-family: 'DM Sans', sans-serif; }
        .bp-sel-btn:hover { border-color: #4a3572; }
        .bp-sel-btn.on { background: rgba(124,58,237,0.15); border-color: #7c3aed; color: #c4b5fd; }
        .bp-drop { border: 2px dashed #2a2545; border-radius: 10px; padding: 32px; text-align: center; cursor: pointer; transition: all 150ms; position: relative; }
        .bp-drop:hover, .bp-drop.over { border-color: #7c3aed; background: rgba(124,58,237,0.04); }
        .bp-drop-icon { font-size: 30px; margin-bottom: 8px; }
        .bp-drop-text { font-size: 14px; color: #8b85a8; margin-bottom: 4px; }
        .bp-drop-hint { font-size: 12px; color: #4a4568; }
        .bp-prog-wrap { background: #1e1a2e; border-radius: 4px; height: 6px; overflow: hidden; margin-top: 12px; }
        .bp-prog { height: 100%; background: #7c3aed; border-radius: 4px; transition: width 200ms; }
        .bp-file-list { display: flex; flex-direction: column; gap: 10px; }
        .bp-file-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #0d0b18; border: 1px solid #1e1a2e; border-radius: 8px; }
        .bp-file-icon { font-size: 20px; flex-shrink: 0; }
        .bp-file-info { flex: 1; min-width: 0; }
        .bp-file-tur { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: #4a4568; text-transform: uppercase; }
        .bp-file-name { font-size: 13px; color: #c8c4e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .bp-file-link { font-size: 12px; color: #7c3aed; text-decoration: none; transition: color 150ms; flex-shrink: 0; }
        .bp-file-link:hover { color: #c4b5fd; }
        .bp-empty { text-align: center; padding: 32px; color: #4a4568; font-size: 13px; }
        .bp-msg-ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 10px 14px; color: #6ee7b7; font-size: 13px; margin-bottom: 12px; }
        .bp-msg-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 14px; color: #fca5a5; font-size: 13px; margin-bottom: 12px; }
      `}</style>

      <div className="bp-page">
        <p className="bp-eyebrow">◈ BELGELERİM</p>
        <h1 className="bp-title">Dosyalar</h1>

        {/* Upload Section */}
        <div className="bp-card">
          <p className="bp-sec-label">// BELGE YÜKLE</p>
          <div className="bp-sel">
            {Object.entries(BELGE_LABELS).slice(0, 3).map(([id, label]) => (
              <button key={id} type="button" className={`bp-sel-btn ${selectedTur === id ? 'on' : ''}`} onClick={() => setSelectedTur(id)}>
                {label}
              </button>
            ))}
          </div>
          {basari && <div className="bp-msg-ok">{basari}</div>}
          {hata && <div className="bp-msg-err">{hata}</div>}
          <div
            className={`bp-drop ${dragOver ? 'over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bp-drop-icon">{uploading ? '⏳' : '📤'}</div>
            <p className="bp-drop-text">{uploading ? 'Yükleniyor...' : 'Dosyayı buraya sürükle veya tıkla'}</p>
            <p className="bp-drop-hint">PDF, JPG, PNG, WebP · Maks 10 MB</p>
            {uploading && (
              <div className="bp-prog-wrap" style={{ marginTop: 12 }}>
                <div className="bp-prog" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Admin belgeler */}
        {adminBelgeler.length > 0 && (
          <div className="bp-card">
            <p className="bp-sec-label">// ADMİN TARAFINDAN GÖNDERİLEN</p>
            <div className="bp-file-list">
              {adminBelgeler.map(b => (
                <div key={b.id} className="bp-file-row">
                  <span className="bp-file-icon">📩</span>
                  <div className="bp-file-info">
                    <div className="bp-file-tur">{BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru}</div>
                    <div className="bp-file-name">{b.dosyaAdi}</div>
                  </div>
                  <a href={b.dosyaUrl} target="_blank" rel="noopener noreferrer" className="bp-file-link">İndir ↗</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kullanici belgeleri */}
        <div className="bp-card">
          <p className="bp-sec-label">// YÜKLEDİĞİN BELGELER</p>
          {loading ? (
            <div className="bp-empty" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 12, letterSpacing: '0.3em' }}>YÜKLENİYOR...</div>
          ) : kullaniciBelgeler.length === 0 ? (
            <div className="bp-empty">Henüz belge yüklemediniz.</div>
          ) : (
            <div className="bp-file-list">
              {kullaniciBelgeler.map(b => (
                <div key={b.id} className="bp-file-row">
                  <span className="bp-file-icon">📄</span>
                  <div className="bp-file-info">
                    <div className="bp-file-tur">{BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru}</div>
                    <div className="bp-file-name">{b.dosyaAdi}</div>
                  </div>
                  <a href={b.dosyaUrl} target="_blank" rel="noopener noreferrer" className="bp-file-link">Görüntüle ↗</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
