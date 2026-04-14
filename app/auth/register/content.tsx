'use client';

import { useState, useEffect, useRef } from 'react';
import FluidBackground from '@/components/FluidBackground';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register';
import Script from 'next/script';
import { Code2, Palette, Music, BarChart2, Shuffle, Search, Gamepad2, User, Users, Sprout, Wrench, Rocket, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

const ROLLER = [
  { id: 'gelistirici',     label: 'Geliştirici',      icon: <Code2 size={14} className="inline mr-1.5" /> },
  { id: 'tasarimci',       label: 'Tasarımcı',         icon: <Palette size={14} className="inline mr-1.5" /> },
  { id: 'ses_muzik',       label: 'Ses & Müzik',       icon: <Music size={14} className="inline mr-1.5" /> },
  { id: 'proje_yoneticisi',label: 'Proje Yöneticisi',  icon: <BarChart2 size={14} className="inline mr-1.5" /> },
  { id: 'hepsini_yaparim', label: 'Hepsini Yaparım',   icon: <Shuffle size={14} className="inline mr-1.5" /> },
];

const sifreGucu = (sifre: string) => {
  let puan = 0;
  if (sifre.length >= 8) puan += 2;
  if (/[A-Z]/.test(sifre)) puan += 2;
  if (/[0-9]/.test(sifre)) puan += 2;
  if (/[^A-Za-z0-9]/.test(sifre)) puan += 2;
  return puan;
};

/* ── shared classes ─────────────────────────────────────────── */
const inputCls  = 'w-full bg-[#0d0b18] border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#d1cfe8] font-[Lexend] text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#3d3660] focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15';
const labelCls  = 'block text-[13px] text-[#9490b0] tracking-wide mb-1.5';
const errorCls  = 'text-[13px] text-red-400 mt-1 block';
const cardCls   = 'bg-[#13111f]/80 backdrop-blur-xl border border-[#1e1a2e] rounded-xl p-7 mb-5';
const sectionLabelCls = 'font-[Share_Tech_Mono] text-[15px] tracking-[0.3em] text-[#4a4568] uppercase mb-5 pb-3 border-b border-dashed border-[#1e1a2e]';
const dividerCls = 'border-none border-t border-dashed border-[#1e1a2e] my-5';
const groupCls  = 'mb-[18px]';

const selectorCardBase = 'border-2 border-[#1e1a2e] bg-[#0d0b18] rounded-xl px-4 py-[18px] cursor-pointer transition-all duration-150 text-left hover:border-[#3a3060] hover:-translate-y-px';
const selectorHack     = 'border-[#d4a843] bg-[#d4a843]/7 shadow-[0_0_0_1px_#d4a843]';
const selectorDefault  = 'border-violet-600 bg-violet-600/7 shadow-[0_0_0_1px_#7c3aed]';

export default function RegisterPageContent() {
  const router = useRouter();
  const [basarili, setBasarili]           = useState(false);
  const [globalHata, setGlobalHata]       = useState('');
  const [sifreGoster, setSifreGoster]     = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [sifre, setSifre]                 = useState('');
  const [sifreTekrar, setSifreTekrar]     = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [basvuruAcik, setBasvuruAcik]     = useState<boolean | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings/basvuru')
      .then(r => r.json())
      .then(d => setBasvuruAcik(d.acik === true))
      .catch(() => setBasvuruAcik(false));
  }, []);

  const {
    register, handleSubmit, watch, setValue, getValues, control, setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { katilimTuru: 'bireysel', dahaOnceKatildi: false, rol: [], takimUyeleri: [], iletisimIzni: false },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'takimUyeleri' });

  const watchedEtkinlik = watch('etkinlikTuru');
  const watchedKatilim  = watch('katilimTuru');
  const watchedDahaOnce = watch('dahaOnceKatildi');
  const watchedMotivon  = watch('motivasyon') ?? '';
  const watchedRol      = watch('rol') ?? [];
  const watchedDeneyim  = watch('deneyimSeviyesi');

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const code = json?.code as string | undefined;
        if (res.status === 429)                               { setGlobalHata('Çok fazla deneme. Lütfen 15 dakika bekleyin.'); return; }
        if (res.status === 403 || code === 'applications_closed') { setGlobalHata('Başvurular şu anda kapalı.'); return; }
        if (res.status === 409 || code === 'email_exists')    { setError('eposta', { message: 'Bu e-posta zaten kayıtlı. Giriş yap →' }); return; }
        if (res.status === 422) {
          const j422 = await res.json().catch(() => ({}));
          setGlobalHata(j422?.code === 'captcha_failed' || j422?.code === 'captcha_required'
            ? 'CAPTCHA doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.'
            : 'Form bilgileri geçersiz. Lütfen kontrol edin.');
          return;
        }
        setGlobalHata('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      const { user } = await signInWithEmailAndPassword(auth, data.eposta, data.sifre);
      try { await sendEmailVerification(user); } catch { /* ignore */ }
      setBasarili(true);
      setTimeout(() => router.push('/panel'), 2500);
    } catch {
      setGlobalHata('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (basarili) {
    const isHack    = watchedEtkinlik === 'hackathon';
    const stampColor = isHack ? '#d4a843' : '#7c3aed';
    return (
      <>
        <style>{`
          @keyframes stampIn { from { transform: rotate(-15deg) scale(2); opacity: 0; } to { transform: rotate(-15deg) scale(1); opacity: 0.9; } }
          @keyframes burstIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.95; } }
        `}</style>
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center px-6 py-15">
            <div
              className="font-[Lexend] font-extrabold text-[clamp(22px,6vw,48px)] px-8 py-4 inline-block"
              style={{ color: stampColor, border: `4px solid ${stampColor}`, animation: `${isHack ? 'stampIn 0.6s ease' : 'burstIn 0.5s ease'} forwards` }}
            >
              {isHack ? 'DOSYA TESLİM EDİLDİ' : 'GAME SUBMITTED! 🎮'}
            </div>
            <p className="font-[Share_Tech_Mono] text-xs tracking-[0.25em] text-[#4a4568] mt-5 text-center">
              PANELE YÖNLENDİRİLİYORSUN...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload"
          onLoad={() => {
            (window as unknown as Record<string, unknown>).onTurnstileSuccess = (token: string) => setTurnstileToken(token);
          }}
        />
      )}

      <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 pb-16 font-[Lexend] relative overflow-hidden">
        <FluidBackground />
        <div className="relative z-10 max-w-[680px] mx-auto">

          {/* Header */}
          <div className="text-center mb-8 px-6 py-8 bg-[#13111f]/80 backdrop-blur-xl border border-[#1e1a2e] rounded-xl">
            <p className="font-[Share_Tech_Mono] text-[15px] tracking-[0.35em] text-[#4a4568] uppercase mb-2">◈ AGZ KAYIT SİSTEMİ ◈</p>
            <h1 className="font-[Lexend] font-extrabold text-[clamp(22px,5vw,34px)] text-[#d1cfe8] mb-3">Aydın Gençlik Zirvesi&apos;ne Kayıt</h1>
            <p className="text-base text-[#8b85a8] leading-relaxed">
              Formu doldurun ve kayıt olun.<br />
              <strong className="text-[#c4b5fd]">Kayıt = Başvurudur.</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* 01 Kişisel */}
            <div className={cardCls}>
              <p className={sectionLabelCls}>// 01 — KİŞİSEL BİLGİLER</p>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                <div className={groupCls}>
                  <label className={labelCls}>İSİM *</label>
                  <input {...register('isim')} className={inputCls} placeholder="Adınız" />
                  {errors.isim && <span className={errorCls}>{errors.isim.message}</span>}
                </div>
                <div className={groupCls}>
                  <label className={labelCls}>SOYİSİM *</label>
                  <input {...register('soyisim')} className={inputCls} placeholder="Soyadınız" />
                  {errors.soyisim && <span className={errorCls}>{errors.soyisim.message}</span>}
                </div>
              </div>
              <div className={groupCls}>
                <label className={labelCls}>E-POSTA *</label>
                <input {...register('eposta')} type="email" className={inputCls} placeholder="ornek@eposta.com" />
                {errors.eposta && <span className={errorCls}>{errors.eposta.message}</span>}
              </div>
              <div className={groupCls}>
                <label className={labelCls}>TELEFON *</label>
                <input {...register('telefon')} type="tel" className={inputCls} placeholder="05XXXXXXXXX" />
                {errors.telefon && <span className={errorCls}>{errors.telefon.message}</span>}
                <span className="text-xs text-[#6b6485] mt-1">11 haneli: 05XXXXXXXXX</span>
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                <div className={groupCls}>
                  <label className={labelCls}>ÜNİVERSİTE *</label>
                  <input {...register('universite')} className={inputCls} placeholder="Üniversiteniz" />
                  {errors.universite && <span className={errorCls}>{errors.universite.message}</span>}
                </div>
                <div className={groupCls}>
                  <label className={labelCls}>BÖLÜM *</label>
                  <input {...register('bolum')} className={inputCls} placeholder="Bölümünüz" />
                  {errors.bolum && <span className={errorCls}>{errors.bolum.message}</span>}
                </div>
              </div>
            </div>

            {/* 02 Etkinlik */}
            <div className={cardCls}>
              <p className={sectionLabelCls}>// 02 — ETKİNLİK SEÇİMİ</p>
              <div className={groupCls}>
                <label className={labelCls}>ETKİNLİK TÜRÜ *</label>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-1.5">
                  {[
                    { id: 'hackathon', icon: <Search size={28} />, name: 'HACKATHON', desc: 'Gizli Dosya teması\n48 saat · Teknoloji & Ürün' },
                    { id: 'gamejam',   icon: <Gamepad2 size={28} />, name: 'GAME JAM', desc: 'Ship it! Ruhu\n48 saat · Oyun & Tasarım' },
                  ].map(ev => (
                    <div key={ev.id}
                      className={`${selectorCardBase} ${watchedEtkinlik === ev.id ? (ev.id === 'hackathon' ? selectorHack : selectorDefault) : ''}`}
                      onClick={() => setValue('etkinlikTuru', ev.id as 'hackathon'|'gamejam', { shouldValidate: true })}
                    >
                      <div className="text-[22px] mb-2">{ev.icon}</div>
                      <div className="font-[Lexend] font-bold text-base text-[#d1cfe8] mb-1">{ev.name}</div>
                      <div className="text-[13px] text-[#6b6485] leading-relaxed whitespace-pre-line">{ev.desc}</div>
                    </div>
                  ))}
                </div>
                {errors.etkinlikTuru && <span className={errorCls}>{errors.etkinlikTuru.message}</span>}
              </div>

              <hr className={dividerCls} />

              <div className={groupCls}>
                <label className={labelCls}>KATILIM TÜRÜ *</label>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-1.5">
                  {[
                    { id: 'bireysel', icon: <User size={28} />, name: 'BİREYSEL', desc: 'Kendi başıma\n(eşleşme mümkün)' },
                    { id: 'takim',    icon: <Users size={28} />, name: 'TAKIM',    desc: 'Kendi takımımla\n(max 4 kişi)' },
                  ].map(k => (
                    <div key={k.id}
                      className={`${selectorCardBase} ${watchedKatilim === k.id ? selectorDefault : ''}`}
                      onClick={() => setValue('katilimTuru', k.id as 'bireysel'|'takim', { shouldValidate: true })}
                    >
                      <div className="text-[22px] mb-2">{k.icon}</div>
                      <div className="font-[Lexend] font-bold text-base text-[#d1cfe8] mb-1">{k.name}</div>
                      <div className="text-[13px] text-[#6b6485] leading-relaxed whitespace-pre-line">{k.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takım section */}
              <div className={`overflow-hidden transition-[max-height,opacity] duration-400 ${watchedKatilim === 'takim' ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <hr className={dividerCls} />
                <div className={groupCls}>
                  <label className={labelCls}>TAKIM ADI *</label>
                  <input {...register('takimAdi')} className={inputCls} placeholder="Takımınızın adı (min. 3 karakter)" />
                  {errors.takimAdi && <span className={errorCls}>{errors.takimAdi.message}</span>}
                </div>
                <label className="block text-[13px] text-[#9490b0] tracking-wide mb-3">
                  TAKIM ÜYELERİ <span className="text-[#4a4568] text-[11px]">(max 3 ek üye)</span>
                </label>
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-[#0a0814] border border-[#2a2545] rounded-lg p-4 mb-3.5">
                    <div className="flex justify-between items-center mb-3.5">
                      <span className="font-[Share_Tech_Mono] text-[11px] tracking-[0.2em] text-[#6b6485] uppercase">ÜYE {index + 1}</span>
                      <button type="button" onClick={() => remove(index)}
                        className="bg-transparent border-none text-red-400 text-[13px] cursor-pointer px-2 py-1 rounded transition-colors hover:bg-red-400/10">
                        ✕ Çıkar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                      <div className={groupCls}><label className={labelCls}>İSİM *</label><input {...register(`takimUyeleri.${index}.isim`)} className={inputCls} placeholder="İsim" /></div>
                      <div className={groupCls}><label className={labelCls}>SOYİSİM *</label><input {...register(`takimUyeleri.${index}.soyisim`)} className={inputCls} placeholder="Soyisim" /></div>
                    </div>
                    <div className={groupCls}>
                      <label className={labelCls}>E-POSTA *</label>
                      <input {...register(`takimUyeleri.${index}.eposta`)} type="email" className={inputCls} placeholder="eposta@ornek.com" />
                      {errors.takimUyeleri?.[index]?.eposta && <span className={errorCls}>{errors.takimUyeleri[index]?.eposta?.message}</span>}
                    </div>
                    <div className={groupCls}>
                      <label className={labelCls}>TELEFON *</label>
                      <input {...register(`takimUyeleri.${index}.telefon`)} className={inputCls} placeholder="05XXXXXXXXX" />
                      {errors.takimUyeleri?.[index]?.telefon && <span className={errorCls}>{errors.takimUyeleri[index]?.telefon?.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                      <div className={groupCls}>
                        <label className={labelCls}>ÜNİVERSİTE *</label>
                        <input {...register(`takimUyeleri.${index}.universite`)} className={inputCls} placeholder="Üniversite" />
                        {errors.takimUyeleri?.[index]?.universite && <span className={errorCls}>{errors.takimUyeleri[index]?.universite?.message}</span>}
                      </div>
                      <div className={groupCls}>
                        <label className={labelCls}>BÖLÜM *</label>
                        <input {...register(`takimUyeleri.${index}.bolum`)} className={inputCls} placeholder="Bölüm" />
                        {errors.takimUyeleri?.[index]?.bolum && <span className={errorCls}>{errors.takimUyeleri[index]?.bolum?.message}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {fields.length < 3 && (
                  <button type="button"
                    className="w-full border-2 border-dashed border-[#2a2545] bg-transparent rounded-lg py-3 text-[#6b6485] font-[Lexend] text-[15px] cursor-pointer transition-all duration-150 mt-2 hover:border-violet-600 hover:bg-violet-600/7 hover:text-[#c4b5fd]"
                    onClick={() => append({ isim: '', soyisim: '', eposta: '', telefon: '', universite: '', bolum: '' })}
                  >
                    + Takım Arkadaşı Ekle
                  </button>
                )}
                {fields.length > 0 && (
                  <p className="text-right text-xs text-[#6b6485] mt-2">{fields.length}/3 ek üye</p>
                )}
              </div>
            </div>

            {/* 03 Motivasyon */}
            <div className={cardCls}>
              <p className={sectionLabelCls}>// 03 — MOTİVASYON & PROFİL</p>

              <div className={groupCls}>
                <label className={labelCls}>MOTİVASYON * <span className="text-[#4a4568] text-[11px]">(100-500 karakter)</span></label>
                <textarea {...register('motivasyon')} className={`${inputCls} resize-y min-h-[110px] leading-relaxed`}
                  placeholder="Bu etkinliğe neden katılmak istiyorsun? Seni buraya ne getiriyor?" maxLength={500} />
                <p className={`text-xs text-right mt-1 ${watchedMotivon.length > 475 ? 'text-red-400' : watchedMotivon.length > 400 ? 'text-amber-500' : 'text-[#4a4568]'}`}>
                  {watchedMotivon.length}/500
                </p>
                {errors.motivasyon && <span className={errorCls}>{errors.motivasyon.message}</span>}
              </div>

              <hr className={dividerCls} />

              <div className={groupCls}>
                <label className={labelCls}>DENEYİM SEVİYESİ *</label>
                <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
                  {[
                    { id: 'yeni_basliyor', icon: <Sprout size={28} />, name: 'Yeni Başlıyorum', desc: 'İlk deneyimim olacak' },
                    { id: 'orta',          icon: <Wrench size={28} />, name: 'Orta Seviye',     desc: 'Birkaç proje yaptım' },
                    { id: 'ileri',         icon: <Rocket size={28} />, name: 'İleri Seviye',    desc: 'Deneyimliyim' },
                  ].map(d => (
                    <div key={d.id}
                      className={`${selectorCardBase} text-center ${watchedDeneyim === d.id ? selectorDefault : ''}`}
                      onClick={() => setValue('deneyimSeviyesi', d.id as 'yeni_basliyor'|'orta'|'ileri', { shouldValidate: true })}
                    >
                      <div className="text-[22px] mb-2">{d.icon}</div>
                      <div className="font-[Lexend] font-bold text-[13px] text-[#d1cfe8] mb-1">{d.name}</div>
                      <div className="text-[13px] text-[#6b6485] leading-relaxed">{d.desc}</div>
                    </div>
                  ))}
                </div>
                {errors.deneyimSeviyesi && <span className={errorCls}>{errors.deneyimSeviyesi.message}</span>}
              </div>

              <hr className={dividerCls} />

              <div className={groupCls}>
                <label className={labelCls}>ROLÜNÜZ * <span className="text-[#4a4568] text-[11px]">(birden fazla seçilebilir)</span></label>
                <div className="flex flex-wrap gap-2">
                  {ROLLER.map(r => (
                    <button key={r.id} type="button"
                      className={`inline-flex items-center bg-[#13111f] border border-[#2a2545] text-[#6b6485] rounded-full px-3.5 py-1.5 text-sm cursor-pointer transition-all duration-150 font-[Lexend] hover:border-[#4a3572] ${watchedRol.includes(r.id) ? 'bg-violet-600/20 !border-violet-600 !text-[#c4b5fd]' : ''}`}
                      onClick={() => toggleRol(r.id)}
                    >
                      {r.icon}{r.label}
                    </button>
                  ))}
                </div>
                {errors.rol && <span className={errorCls}>{errors.rol.message}</span>}
              </div>

              <hr className={dividerCls} />

              <div className={groupCls}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative w-11 h-6 flex-shrink-0">
                    <input type="checkbox" {...register('dahaOnceKatildi')} className="sr-only peer" />
                    <div className="absolute inset-0 bg-[#2a2545] rounded-xl transition-colors peer-checked:bg-violet-600/40" />
                    <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-[#5a5376] transition-transform peer-checked:translate-x-5 peer-checked:bg-violet-600" />
                  </div>
                  <span className="text-sm text-[#c8c4e0]">Daha önce GDG/OTT/HSD etkinliğine katıldım</span>
                </label>
              </div>

              {watchedDahaOnce && (
                <div className={groupCls}>
                  <label className={labelCls}>HANGİ ETKİNLİĞE? <span className="text-[#4a4568] text-[11px]">(opsiyonel)</span></label>
                  <input {...register('dahaOnceHangi')} className={inputCls} placeholder="Etkinlik adı, yıl..." />
                </div>
              )}

              <div className={groupCls}>
                <label className={labelCls}>NE ÖĞRENMEK İSTİYORSUN? <span className="text-[#4a4568] text-[11px]">(opsiyonel)</span></label>
                <textarea {...register('neOgrenmekIstiyor')} className={`${inputCls} resize-y min-h-[80px] leading-relaxed`}
                  placeholder="Bu 48 saatin sonunda neyle çıkmak istiyorsun?" maxLength={300} />
              </div>

              <div className={groupCls}>
                <label className={labelCls}>ÖN PROJE FİKRİ <span className="text-[#4a4568] text-[11px]">(opsiyonel)</span></label>
                <textarea {...register('projeFikri')} className={`${inputCls} resize-y min-h-[80px] leading-relaxed`}
                  placeholder="Aklında bir fikir var mı? Zorunlu değil." maxLength={200} />
              </div>
            </div>

            {/* 04 Hesap */}
            <div className={cardCls}>
              <p className={sectionLabelCls}>// 04 — HESAP OLUŞTUR</p>

              <div className={groupCls}>
                <label className={labelCls}>ŞİFRE *</label>
                <div className="relative">
                  <input type={sifreGoster ? 'text' : 'password'} className={`${inputCls} pr-11`}
                    placeholder="············" value={sifre} onChange={e => setSifre(e.target.value)} autoComplete="new-password" />
                  <button type="button" onClick={() => setSifreGoster(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#6b6485] hover:text-[#9490b0] transition-colors duration-150 p-1">
                    {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {sifre.length > 0 && (
                  <div className="mt-2">
                    <div className="bg-[#1e1a2e] rounded h-1 overflow-hidden">
                      <div className="h-full rounded transition-[width,background] duration-200" style={{ width: `${(gucPuan / 8) * 100}%`, background: gucRenk }} />
                    </div>
                    <div className="flex justify-end my-1"><span className="text-[11px]" style={{ color: gucRenk }}>{gucLabel}</span></div>
                    <div className="flex flex-wrap gap-2.5 mt-1.5">
                      {[
                        { ok: sifre.length >= 8,       label: '✓ En az 8 karakter' },
                        { ok: /[A-Z]/.test(sifre),     label: '✓ En az 1 büyük harf' },
                        { ok: /[0-9]/.test(sifre),     label: '✓ En az 1 rakam' },
                      ].map(rule => (
                        <span key={rule.label} className={`text-xs transition-colors duration-200 ${rule.ok ? 'text-emerald-500' : 'text-[#3d3660]'}`}>
                          {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {errors.sifre && <span className={errorCls}>{errors.sifre.message}</span>}
              </div>

              <div className={groupCls}>
                <label className={labelCls}>ŞİFRE TEKRAR *</label>
                <div className="relative">
                  <input type={sifreTekrarGoster ? 'text' : 'password'}
                    className={`${inputCls} ${sifreTekrar.length > 0 ? 'pr-[68px]' : 'pr-11'}`}
                    placeholder="············" value={sifreTekrar} onChange={e => setSifreTekrar(e.target.value)} autoComplete="new-password" />
                  <button type="button" onClick={() => setSifreTekrarGoster(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#6b6485] hover:text-[#9490b0] transition-colors duration-150 p-1">
                    {sifreTekrarGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {sifreTekrar.length > 0 && (
                    <span className="absolute right-11 top-1/2 -translate-y-1/2 pointer-events-none">
                      {sifreTekrar === sifre ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    </span>
                  )}
                </div>
                {errors.sifreTekrar && <span className={errorCls}>{errors.sifreTekrar.message}</span>}
              </div>

              <hr className={dividerCls} />

              {[
                { name: 'gizlilikOnay' as const, label: <>Gizlilik Politikası&apos;nı okudum ve kabul ediyorum <span className="text-red-400">*</span></>, muted: false },
                { name: 'kuralOnay'    as const, label: <>Etkinlik kurallarını okudum ve kabul ediyorum <span className="text-red-400">*</span></>,         muted: false },
                { name: 'iletisimIzni' as const, label: <>GDG on Campus, HSD ve OTT&apos;den haberler almak istiyorum <span className="text-xs">(opsiyonel)</span></>, muted: true },
              ].map(cb => (
                <div key={cb.name}>
                  <label className="flex items-start gap-2.5 cursor-pointer mb-3">
                    <input type="checkbox" className="w-[18px] h-[18px] min-w-[18px] accent-violet-600 mt-0.5 cursor-pointer" {...register(cb.name)} />
                    <span className={`text-[15px] leading-relaxed ${cb.muted ? 'text-[#6b6485]' : 'text-[#c8c4e0]'}`}>{cb.label}</span>
                  </label>
                  {errors[cb.name] && <span className={`${errorCls} mb-2`}>{errors[cb.name]?.message}</span>}
                </div>
              ))}

              <hr className={dividerCls} />

              {globalHata && (
                <div className="bg-red-500/8 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-[15px] mb-5 leading-relaxed">
                  {globalHata}
                </div>
              )}

              {TURNSTILE_SITE_KEY && (
                <div className="mb-4">
                  <div ref={turnstileRef} className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="dark" data-callback="onTurnstileSuccess" />
                </div>
              )}

              {basvuruAcik === false && (
                <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/30 rounded-xl px-[18px] py-3.5 mb-3">
                  <Lock size={18} className="flex-shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-amber-400 tracking-wide">BAŞVURULAR HENÜZ AÇILMADI</p>
                    <p className="text-xs text-[#92836a] leading-relaxed mt-1">
                      Site hazırlık aşamasında. Başvurular açıldığında buradan kayıt olabilirsin. Takipte kal!
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || basvuruAcik === false || basvuruAcik === null}
                className="w-full bg-violet-700 hover:enabled:bg-violet-800 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl py-3.5 border-none font-[Lexend] transition-all duration-150 tracking-wide cursor-pointer">
                {isSubmitting ? 'GÖNDERİLİYOR...' : basvuruAcik === null ? 'YÜKLENİYOR...' : basvuruAcik ? 'BAŞVURUYU TAMAMLA →' : 'BAŞVURULAR YAKINDA AÇILACAK'}
              </button>

              <p className="text-center mt-4 text-[13px] text-[#4a4568]">
                Zaten hesabın var mı?{' '}
                <a href="/auth/login" className="text-violet-600 no-underline">Giriş Yap →</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
