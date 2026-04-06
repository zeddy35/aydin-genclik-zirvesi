'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register';
import Script from 'next/script';
import './register.css';
import { Code2, Palette, Music, BarChart2, Shuffle, Search, Gamepad2, User, Users, Sprout, Wrench, Rocket, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

const ROLLER = [
  { id: 'gelistirici', label: 'Geliştirici', icon: <Code2 size={14} style={{ display: 'inline', marginRight: 5 }} /> },
  { id: 'tasarimci', label: 'Tasarımcı', icon: <Palette size={14} style={{ display: 'inline', marginRight: 5 }} /> },
  { id: 'ses_muzik', label: 'Ses & Müzik', icon: <Music size={14} style={{ display: 'inline', marginRight: 5 }} /> },
  { id: 'proje_yoneticisi', label: 'Proje Yöneticisi', icon: <BarChart2 size={14} style={{ display: 'inline', marginRight: 5 }} /> },
  { id: 'hepsini_yaparim', label: 'Hepsini Yaparım', icon: <Shuffle size={14} style={{ display: 'inline', marginRight: 5 }} /> },
];

const sifreGucu = (sifre: string) => {
  let puan = 0;
  if (sifre.length >= 8) puan += 2;
  if (/[A-Z]/.test(sifre)) puan += 2;
  if (/[0-9]/.test(sifre)) puan += 2;
  if (/[^A-Za-z0-9]/.test(sifre)) puan += 2;
  return puan;
};

export default function RegisterPageContent() {
  const router = useRouter();
  const [basarili, setBasarili] = useState(false);
  const [globalHata, setGlobalHata] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      katilimTuru: 'bireysel',
      dahaOnceKatildi: false,
      rol: [],
      takimUyeleri: [],
      iletisimIzni: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'takimUyeleri',
  });

  const watchedEtkinlik = watch('etkinlikTuru');
  const watchedKatilim = watch('katilimTuru');
  const watchedDahaOnce = watch('dahaOnceKatildi');
  const watchedMotivon = watch('motivasyon') ?? '';
  const watchedRol = watch('rol') ?? [];
  const watchedDeneyim = watch('deneyimSeviyesi');

  const gucPuan = sifreGucu(sifre);
  const gucRenk = gucPuan < 4 ? '#ef4444' : gucPuan < 7 ? '#f59e0b' : '#10b981';
  const gucLabel = gucPuan < 4 ? 'Zayıf' : gucPuan < 7 ? 'Orta' : 'Güçlü';

  useEffect(() => { setValue('sifre', sifre); }, [sifre, setValue]);
  useEffect(() => { setValue('sifreTekrar', sifreTekrar); }, [sifreTekrar, setValue]);

  const toggleRol = (id: string) => {
    const current = getValues('rol') ?? [];
    if (current.includes(id)) {
      setValue('rol', current.filter((r: string) => r !== id), { shouldValidate: true });
    } else {
      setValue('rol', [...current, id], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setGlobalHata('');

      // 1. Server-side kayıt: uygulama kapısı + rate limit + Firestore yazmaları
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const code = json?.code as string | undefined;

        if (res.status === 429) {
          setGlobalHata('Çok fazla deneme. Lütfen 15 dakika bekleyin.');
          return;
        }
        if (res.status === 403 || code === 'applications_closed') {
          setGlobalHata('Başvurular şu anda kapalı.');
          return;
        }
        if (res.status === 409 || code === 'email_exists') {
          setError('eposta', { message: 'Bu e-posta zaten kayıtlı. Giriş yap →' });
          return;
        }
        if (res.status === 422) {
          const json422 = await res.json().catch(() => ({}));
          if (json422?.code === 'captcha_failed' || json422?.code === 'captcha_required') {
            setGlobalHata('CAPTCHA doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.');
          } else {
            setGlobalHata('Form bilgileri geçersiz. Lütfen kontrol edin.');
          }
          return;
        }
        setGlobalHata('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      // 2. Hesap oluşturuldu — client oturumu başlat
      const { user } = await signInWithEmailAndPassword(auth, data.eposta, data.sifre);

      // 3. E-posta doğrulama gönder (non-fatal)
      try {
        await sendEmailVerification(user);
      } catch { /* ignore */ }

      setBasarili(true);
      setTimeout(() => router.push('/panel'), 2500);
    } catch {
      setGlobalHata('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (basarili) {
    const isHack = watchedEtkinlik === 'hackathon';
    const stampColor = isHack ? '#d4a843' : '#7c3aed';
    return (
      <>
        <div className="scs-page">
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div
              className="scs-stamp"
              style={{
                color: stampColor,
                border: `4px solid ${stampColor}`,
                animation: `${isHack ? 'stampIn 0.6s ease' : 'burstIn 0.5s ease'} forwards`,
              }}
            >
              {isHack ? 'DOSYA TESLİM EDİLDİ' : 'GAME SUBMITTED! 🎮'}
            </div>
            <p className="scs-sub">PANELE YÖNLENDİRİLİYORSUN...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Turnstile script — loaded once */}
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onLoad={() => {
            // Expose callback globally for Turnstile
            (window as unknown as Record<string, unknown>).onTurnstileSuccess =
              (token: string) => setTurnstileToken(token);
          }}
        />
      )}
      <div className="reg-page">
        <div className="reg-wrap">
          <div className="reg-header">
            <p className="reg-eyebrow">◈ AGZ KAYIT SİSTEMİ ◈</p>
            <h1 className="reg-h1">Aydın Gençlik Zirvesi&apos;ne Kayıt</h1>
            <p className="reg-intro">
              Formu doldurun ve kayıt olun.<br />
              <strong style={{ color: '#c4b5fd' }}>Kayıt = Başvurudur.</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* 01 Kişisel */}
            <div className="reg-card">
              <p className="reg-section-label">// 01 — KİŞİSEL BİLGİLER</p>
              <div className="reg-grid2">
                <div className="reg-group">
                  <label className="reg-label">İSİM *</label>
                  <input {...register('isim')} className="reg-input" placeholder="Adınız" />
                  {errors.isim && <span className="reg-error">{errors.isim.message}</span>}
                </div>
                <div className="reg-group">
                  <label className="reg-label">SOYİSİM *</label>
                  <input {...register('soyisim')} className="reg-input" placeholder="Soyadınız" />
                  {errors.soyisim && <span className="reg-error">{errors.soyisim.message}</span>}
                </div>
              </div>
              <div className="reg-group">
                <label className="reg-label">E-POSTA *</label>
                <input {...register('eposta')} type="email" className="reg-input" placeholder="ornek@eposta.com" />
                {errors.eposta && <span className="reg-error">{errors.eposta.message}</span>}
              </div>
              <div className="reg-group">
                <label className="reg-label">TELEFON *</label>
                <input {...register('telefon')} type="tel" className="reg-input" placeholder="05XXXXXXXXX" />
                {errors.telefon && <span className="reg-error">{errors.telefon.message}</span>}
                <span className="reg-hint">11 haneli: 05XXXXXXXXX</span>
              </div>
              <div className="reg-grid2">
                <div className="reg-group">
                  <label className="reg-label">ÜNİVERSİTE *</label>
                  <input {...register('universite')} className="reg-input" placeholder="Üniversiteniz" />
                  {errors.universite && <span className="reg-error">{errors.universite.message}</span>}
                </div>
                <div className="reg-group">
                  <label className="reg-label">BÖLÜM *</label>
                  <input {...register('bolum')} className="reg-input" placeholder="Bölümünüz" />
                  {errors.bolum && <span className="reg-error">{errors.bolum.message}</span>}
                </div>
              </div>
            </div>

            {/* 02 Etkinlik */}
            <div className="reg-card">
              <p className="reg-section-label">// 02 — ETKİNLİK SEÇİMİ</p>
              <div className="reg-group">
                <label className="reg-label">ETKİNLİK TÜRÜ *</label>
                <div className="reg-event-grid">
                  <div
                    className={`reg-selector-card ${watchedEtkinlik === 'hackathon' ? 'sel-hack' : ''}`}
                    onClick={() => setValue('etkinlikTuru', 'hackathon', { shouldValidate: true })}
                  >
                    <div className="reg-card-icon"><Search size={28} /></div>
                    <div className="reg-card-name">HACKATHON</div>
                    <div className="reg-card-desc">Gizli Dosya teması<br />48 saat · Teknoloji & Ürün</div>
                  </div>
                  <div
                    className={`reg-selector-card ${watchedEtkinlik === 'gamejam' ? 'sel-jam' : ''}`}
                    onClick={() => setValue('etkinlikTuru', 'gamejam', { shouldValidate: true })}
                  >
                    <div className="reg-card-icon"><Gamepad2 size={28} /></div>
                    <div className="reg-card-name">GAME JAM</div>
                    <div className="reg-card-desc">Ship it! Ruhu<br />48 saat · Oyun & Tasarım</div>
                  </div>
                </div>
                {errors.etkinlikTuru && <span className="reg-error">{errors.etkinlikTuru.message}</span>}
              </div>

              <hr className="reg-divider" />

              <div className="reg-group">
                <label className="reg-label">KATILIM TÜRÜ *</label>
                <div className="reg-katilim-grid">
                  <div
                    className={`reg-selector-card ${watchedKatilim === 'bireysel' ? 'sel-default' : ''}`}
                    onClick={() => setValue('katilimTuru', 'bireysel', { shouldValidate: true })}
                  >
                    <div className="reg-card-icon"><User size={28} /></div>
                    <div className="reg-card-name">BİREYSEL</div>
                    <div className="reg-card-desc">Kendi başıma<br />(eşleşme mümkün)</div>
                  </div>
                  <div
                    className={`reg-selector-card ${watchedKatilim === 'takim' ? 'sel-default' : ''}`}
                    onClick={() => setValue('katilimTuru', 'takim', { shouldValidate: true })}
                  >
                    <div className="reg-card-icon"><Users size={28} /></div>
                    <div className="reg-card-name">TAKIM</div>
                    <div className="reg-card-desc">Kendi takımımla<br />(max 4 kişi)</div>
                  </div>
                </div>
              </div>

              <div className={`reg-takim-section ${watchedKatilim === 'takim' ? 'reg-takim-open' : 'reg-takim-closed'}`}>
                <hr className="reg-divider" />
                <div className="reg-group">
                  <label className="reg-label">TAKIM ADI *</label>
                  <input {...register('takimAdi')} className="reg-input" placeholder="Takımınızın adı (min. 3 karakter)" />
                  {errors.takimAdi && <span className="reg-error">{errors.takimAdi.message}</span>}
                </div>
                <label className="reg-label" style={{ marginBottom: 12, display: 'block' }}>TAKIM ÜYELERİ <span style={{ color: '#4a4568', fontSize: 11 }}>(max 3 ek üye)</span></label>
                {fields.map((field, index) => (
                  <div key={field.id} className="reg-uye-card">
                    <div className="reg-uye-hdr">
                      <span className="reg-uye-title">ÜYE {index + 1}</span>
                      <button type="button" className="reg-uye-rm" onClick={() => remove(index)}>✕ Çıkar</button>
                    </div>
                    <div className="reg-grid2">
                      <div className="reg-group">
                        <label className="reg-label">İSİM *</label>
                        <input {...register(`takimUyeleri.${index}.isim`)} className="reg-input" placeholder="İsim" />
                      </div>
                      <div className="reg-group">
                        <label className="reg-label">SOYİSİM *</label>
                        <input {...register(`takimUyeleri.${index}.soyisim`)} className="reg-input" placeholder="Soyisim" />
                      </div>
                    </div>
                    <div className="reg-group">
                      <label className="reg-label">E-POSTA *</label>
                      <input {...register(`takimUyeleri.${index}.eposta`)} type="email" className="reg-input" placeholder="eposta@ornek.com" />
                      {errors.takimUyeleri?.[index]?.eposta && <span className="reg-error">{errors.takimUyeleri[index]?.eposta?.message}</span>}
                    </div>
                    <div className="reg-group">
                      <label className="reg-label">TELEFON *</label>
                      <input {...register(`takimUyeleri.${index}.telefon`)} className="reg-input" placeholder="05XXXXXXXXX" />
                      {errors.takimUyeleri?.[index]?.telefon && <span className="reg-error">{errors.takimUyeleri[index]?.telefon?.message}</span>}
                    </div>
                    <div className="reg-grid2">
                      <div className="reg-group">
                        <label className="reg-label">ÜNİVERSİTE *</label>
                        <input {...register(`takimUyeleri.${index}.universite`)} className="reg-input" placeholder="Üniversite" />
                        {errors.takimUyeleri?.[index]?.universite && <span className="reg-error">{errors.takimUyeleri[index]?.universite?.message}</span>}
                      </div>
                      <div className="reg-group">
                        <label className="reg-label">BÖLÜM *</label>
                        <input {...register(`takimUyeleri.${index}.bolum`)} className="reg-input" placeholder="Bölüm" />
                        {errors.takimUyeleri?.[index]?.bolum && <span className="reg-error">{errors.takimUyeleri[index]?.bolum?.message}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {fields.length < 3 && (
                  <button
                    type="button"
                    className="reg-add-btn"
                    onClick={() => append({ isim: '', soyisim: '', eposta: '', telefon: '', universite: '', bolum: '' })}
                  >
                    + Takım Arkadaşı Ekle
                  </button>
                )}
                {fields.length > 0 && (
                  <p style={{ textAlign: 'right', fontSize: 12, color: '#6b6485', marginTop: 8 }}>{fields.length}/3 ek üye</p>
                )}
              </div>
            </div>

            {/* 03 Motivasyon */}
            <div className="reg-card">
              <p className="reg-section-label">// 03 — MOTİVASYON & PROFİL</p>
              <div className="reg-group">
                <label className="reg-label">MOTİVASYON * <span style={{ color: '#4a4568', fontSize: 11 }}>(100-500 karakter)</span></label>
                <textarea
                  {...register('motivasyon')}
                  className="reg-textarea"
                  placeholder="Bu etkinliğe neden katılmak istiyorsun? Seni buraya ne getiriyor?"
                  maxLength={500}
                />
                <p className={`reg-char-count ${watchedMotivon.length > 475 ? 'reg-char-danger' : watchedMotivon.length > 400 ? 'reg-char-warn' : ''}`}>
                  {watchedMotivon.length}/500
                </p>
                {errors.motivasyon && <span className="reg-error">{errors.motivasyon.message}</span>}
              </div>
              <hr className="reg-divider" />
              <div className="reg-group">
                <label className="reg-label">DENEYİM SEVİYESİ *</label>
                <div className="reg-dny-grid">
                  {[
                    { id: 'yeni_basliyor', icon: <Sprout size={28} />, name: 'Yeni Başlıyorum', desc: 'İlk deneyimim olacak' },
                    { id: 'orta', icon: <Wrench size={28} />, name: 'Orta Seviye', desc: 'Birkaç proje yaptım' },
                    { id: 'ileri', icon: <Rocket size={28} />, name: 'İleri Seviye', desc: 'Deneyimliyim' },
                  ].map(d => (
                    <div
                      key={d.id}
                      className={`reg-selector-card ${watchedDeneyim === d.id ? 'sel-default' : ''}`}
                      style={{ textAlign: 'center' }}
                      onClick={() => setValue('deneyimSeviyesi', d.id as 'yeni_basliyor'|'orta'|'ileri', { shouldValidate: true })}
                    >
                      <div className="reg-card-icon">{d.icon}</div>
                      <div className="reg-card-name" style={{ fontSize: 13 }}>{d.name}</div>
                      <div className="reg-card-desc">{d.desc}</div>
                    </div>
                  ))}
                </div>
                {errors.deneyimSeviyesi && <span className="reg-error">{errors.deneyimSeviyesi.message}</span>}
              </div>
              <hr className="reg-divider" />
              <div className="reg-group">
                <label className="reg-label">ROLÜNÜZ * <span style={{ color: '#4a4568', fontSize: 11 }}>(birden fazla seçilebilir)</span></label>
                <div className="reg-chips">
                  {ROLLER.map(r => (
                    <button key={r.id} type="button" className={`reg-chip ${watchedRol.includes(r.id) ? 'on' : ''}`} onClick={() => toggleRol(r.id)} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {r.icon}{r.label}
                    </button>
                  ))}
                </div>
                {errors.rol && <span className="reg-error">{errors.rol.message}</span>}
              </div>
              <hr className="reg-divider" />
              <div className="reg-group">
                <label className="reg-toggle-wrap">
                  <div className="reg-toggle">
                    <input type="checkbox" {...register('dahaOnceKatildi')} />
                    <span className="reg-slider" />
                  </div>
                  <span style={{ fontSize: 14, color: '#c8c4e0' }}>Daha önce GDG/OTT/HSD etkinliğine katıldım</span>
                </label>
              </div>
              {watchedDahaOnce && (
                <div className="reg-group">
                  <label className="reg-label">HANGİ ETKİNLİĞE? <span style={{ color: '#4a4568', fontSize: 11 }}>(opsiyonel)</span></label>
                  <input {...register('dahaOnceHangi')} className="reg-input" placeholder="Etkinlik adı, yıl..." />
                </div>
              )}
              <div className="reg-group">
                <label className="reg-label">NE ÖĞRENMEK İSTİYORSUN? <span style={{ color: '#4a4568', fontSize: 11 }}>(opsiyonel)</span></label>
                <textarea {...register('neOgrenmekIstiyor')} className="reg-textarea" placeholder="Bu 48 saatin sonunda neyle çıkmak istiyorsun?" maxLength={300} style={{ minHeight: 80 }} />
              </div>
              <div className="reg-group">
                <label className="reg-label">ÖN PROJE FİKRİ <span style={{ color: '#4a4568', fontSize: 11 }}>(opsiyonel)</span></label>
                <textarea {...register('projeFikri')} className="reg-textarea" placeholder="Aklında bir fikir var mı? Zorunlu değil." maxLength={200} style={{ minHeight: 80 }} />
              </div>
            </div>

            {/* 04 Hesap */}
            <div className="reg-card">
              <p className="reg-section-label">// 04 — HESAP OLUŞTUR</p>
              <div className="reg-group">
                <label className="reg-label">ŞİFRE *</label>
                <div className="reg-pw-wrap">
                  <input type={sifreGoster ? 'text' : 'password'} className="reg-input" placeholder="············" value={sifre} onChange={e => setSifre(e.target.value)} autoComplete="new-password" />
                  <button type="button" className="reg-pw-eye" onClick={() => setSifreGoster(v => !v)}>{sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {sifre.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="reg-bar-bg"><div className="reg-bar" style={{ width: `${(gucPuan/8)*100}%`, background: gucRenk }} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 6px' }}><span style={{ fontSize: 11, color: gucRenk }}>{gucLabel}</span></div>
                    <div className="reg-pw-rules">
                      <span className={`reg-pw-rule ${sifre.length >= 8 ? 'ok' : ''}`}>✓ En az 8 karakter</span>
                      <span className={`reg-pw-rule ${/[A-Z]/.test(sifre) ? 'ok' : ''}`}>✓ En az 1 büyük harf</span>
                      <span className={`reg-pw-rule ${/[0-9]/.test(sifre) ? 'ok' : ''}`}>✓ En az 1 rakam</span>
                    </div>
                  </div>
                )}
                {errors.sifre && <span className="reg-error">{errors.sifre.message}</span>}
              </div>
              <div className="reg-group">
                <label className="reg-label">ŞİFRE TEKRAR *</label>
                <div className="reg-pw-wrap">
                  <input type={sifreTekrarGoster ? 'text' : 'password'} className="reg-input" placeholder="············" value={sifreTekrar} onChange={e => setSifreTekrar(e.target.value)} autoComplete="new-password" style={{ paddingRight: sifreTekrar.length > 0 ? '68px' : '44px' }} />
                  <button type="button" className="reg-pw-eye" onClick={() => setSifreTekrarGoster(v => !v)}>{sifreTekrarGoster ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  {sifreTekrar.length > 0 && <span className="reg-pw-match">{sifreTekrar === sifre ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</span>}
                </div>
                {errors.sifreTekrar && <span className="reg-error">{errors.sifreTekrar.message}</span>}
              </div>
              <hr className="reg-divider" />
              <label className="reg-cb-wrap">
                <input type="checkbox" className="reg-cb" {...register('gizlilikOnay')} />
                <span className="reg-cb-label">Gizlilik Politikası&apos;nı okudum ve kabul ediyorum <span style={{ color: '#f87171' }}>*</span></span>
              </label>
              {errors.gizlilikOnay && <span className="reg-error" style={{ marginBottom: 8 }}>{errors.gizlilikOnay.message}</span>}
              <label className="reg-cb-wrap">
                <input type="checkbox" className="reg-cb" {...register('kuralOnay')} />
                <span className="reg-cb-label">Etkinlik kurallarını okudum ve kabul ediyorum <span style={{ color: '#f87171' }}>*</span></span>
              </label>
              {errors.kuralOnay && <span className="reg-error" style={{ marginBottom: 8 }}>{errors.kuralOnay.message}</span>}
              <label className="reg-cb-wrap" style={{ marginTop: 4 }}>
                <input type="checkbox" className="reg-cb" {...register('iletisimIzni')} />
                <span className="reg-cb-label" style={{ color: '#6b6485' }}>GDG on Campus, HSD ve OTT&apos;den haberler almak istiyorum <span style={{ fontSize: 12 }}>(opsiyonel)</span></span>
              </label>
              <hr className="reg-divider" />
              {globalHata && <div className="reg-global-error">{globalHata}</div>}

              {/* ── Cloudflare Turnstile CAPTCHA ── */}
              {TURNSTILE_SITE_KEY && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    ref={turnstileRef}
                    className="cf-turnstile"
                    data-sitekey={TURNSTILE_SITE_KEY}
                    data-theme="dark"
                    data-callback="onTurnstileSuccess"
                  />
                </div>
              )}

              {/* ── Başvurular henüz açılmadı ── */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <Lock size={18} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.05em' }}>
                    BAŞVURULAR HENÜZ AÇILMADI
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#92836a', lineHeight: 1.6 }}>
                    Site hazırlık aşamasında. Başvurular açıldığında buradan kayıt olabilirsin. Takipte kal!
                  </p>
                </div>
              </div>

              <button type="button" className="reg-btn-off" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                BAŞVURULAR YAKINDA AÇILACAK
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#4a4568' }}>
                Zaten hesabın var mı?{' '}
                <a href="/auth/login" style={{ color: '#7c3aed', textDecoration: 'none' }}>Giriş Yap →</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
