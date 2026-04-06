'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminBelgeler } from '@/lib/firebase/belgeler';
import type { Belge } from '@/lib/firebase/types';
import { Medal, Award, Trophy, Folder, Inbox, FileText, Download, Loader2 } from 'lucide-react';

const BELGE_LABELS: Record<string, string> = {
  katilim_sertifikasi: 'Katılım Sertifikası',
  finalist_belgesi: 'Finalist Belgesi',
  odul_belgesi: 'Ödül Belgesi',
  diger: 'Diğer',
};

const BELGE_ICONS: Record<string, React.ReactNode> = {
  katilim_sertifikasi: <Medal size={24} />,
  finalist_belgesi: <Award size={24} />,
  odul_belgesi: <Trophy size={24} />,
  diger: <Folder size={24} />,
};

export default function BelgelerimPage() {
  const { user } = useAuth();
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!user) return;
    getAdminBelgeler(user.uid).then(list => {
      setBelgeler(list);
      setLoading(false);
    });
  }, [user]);

  const handleDownload = async (belge: Belge) => {
    if (!user) return;
    setDownloadingId(belge.id);
    setHata('');
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/belgeler/download?belgeId=${belge.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('İndirme linki alınamadı.');
      const { downloadUrl } = await res.json();
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = belge.dosyaAdi;
      a.click();
    } catch {
      setHata('Belge indirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        .bp-page { padding: 28px; max-width: 760px; margin: 0 auto; }
        .bp-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.35em; color: #4a4568; text-transform: uppercase; margin-bottom: 6px; }
        .bp-title { font-family: 'Lexend', sans-serif; font-weight: 800; font-size: clamp(20px,4vw,30px); color: #d1cfe8; margin-bottom: 8px; }
        .bp-desc { font-size: 14px; color: #6b6485; margin-bottom: 28px; line-height: 1.6; }
        .bp-card { background: #13111f; border: 1px solid #1e1a2e; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .bp-sec-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.3em; color: #4a4568; text-transform: uppercase; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed #1e1a2e; }
        .bp-file-list { display: flex; flex-direction: column; gap: 10px; }
        .bp-file-row { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #0d0b18; border: 1px solid #1e1a2e; border-radius: 10px; transition: border-color 150ms; }
        .bp-file-row:hover { border-color: #2a2545; }
        .bp-file-icon { font-size: 24px; flex-shrink: 0; }
        .bp-file-info { flex: 1; min-width: 0; }
        .bp-file-tur { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: #7c3aed; text-transform: uppercase; margin-bottom: 3px; }
        .bp-file-name { font-size: 13px; color: #c8c4e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bp-file-size { font-size: 11px; color: #4a4568; margin-top: 2px; }
        .bp-dl-btn { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.35); color: #c4b5fd; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; transition: all 150ms; flex-shrink: 0; white-space: nowrap; }
        .bp-dl-btn:hover:not(:disabled) { background: rgba(124,58,237,0.25); border-color: #7c3aed; }
        .bp-dl-btn:disabled { opacity: 0.5; cursor: default; }
        .bp-empty { text-align: center; padding: 48px 24px; }
        .bp-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .bp-empty-title { font-family: 'Lexend', sans-serif; font-size: 16px; color: #6b6485; margin-bottom: 6px; }
        .bp-empty-desc { font-size: 13px; color: #4a4568; line-height: 1.6; }
        .bp-loading { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 0.3em; color: #4a4568; padding: 32px; text-align: center; }
        .bp-msg-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 14px; color: #fca5a5; font-size: 13px; margin-bottom: 16px; }
      `}</style>

      <div className="bp-page">
        <p className="bp-eyebrow">◈ BELGELERİM</p>
        <h1 className="bp-title">Belgelerim</h1>
        <p className="bp-desc">
          Etkinlik sonrası sana atanan sertifika ve belgeler burada görünür. İndirmek için ilgili belgenin yanındaki butona tıkla.
        </p>

        {hata && <div className="bp-msg-err">{hata}</div>}

        <div className="bp-card">
          <p className="bp-sec-label">// SERTİFİKALAR & BELGELER</p>

          {loading ? (
            <div className="bp-loading">YÜKLENİYOR...</div>
          ) : belgeler.length === 0 ? (
            <div className="bp-empty">
              <div className="bp-empty-icon"><Inbox size={40} /></div>
              <div className="bp-empty-title">Henüz belge yok</div>
              <div className="bp-empty-desc">
                Etkinlik tamamlandıktan sonra katılım sertifikan ve<br />
                varsa finalist / ödül belgen burada görünecek.
              </div>
            </div>
          ) : (
            <div className="bp-file-list">
              {belgeler.map(b => (
                <div key={b.id} className="bp-file-row">
                  <span className="bp-file-icon">{BELGE_ICONS[b.belgeTuru] ?? <FileText size={24} />}</span>
                  <div className="bp-file-info">
                    <div className="bp-file-tur">{BELGE_LABELS[b.belgeTuru] ?? b.belgeTuru}</div>
                    <div className="bp-file-name">{b.dosyaAdi}</div>
                    <div className="bp-file-size">{(b.dosyaBoyutu / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    className="bp-dl-btn"
                    disabled={downloadingId === b.id}
                    onClick={() => handleDownload(b)}
                  >
                    {downloadingId === b.id ? <><Loader2 size={13} style={{ display: 'inline', marginRight: 4, animation: 'spin 1s linear infinite' }} /> İndiriliyor...</> : <><Download size={13} style={{ display: 'inline', marginRight: 4 }} /> İndir</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
