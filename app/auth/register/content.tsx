'use client';

import { useState, useEffect } from 'react';
import FluidBackground from '@/components/FluidBackground';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register';
import { Search, Gamepad2, User, Users, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useThemeMode } from '@/hooks/useThemeMode';

const sifreGucu = (sifre: string) => {
  let puan = 0;
  if (sifre.length >= 8)           puan += 2;
  if (/[A-Z]/.test(sifre))         puan += 2;
  if (/[0-9]/.test(sifre))         puan += 2;
  if (/[^A-Za-z0-9]/.test(sifre)) puan += 2;
  return puan;
};

export default function RegisterPageContent() {
  const router    = useRouter();
  const isDark    = useThemeMode() === 'dark';

  const [basarili, setBasarili]               = useState(false);
  const [globalHata, setGlobalHata]           = useState('');
  const [sifreGoster, setSifreGoster]         = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [sifre, setSifre]                     = useState('');
  const [sifreTekrar, setSifreTekrar]         = useState('');
  const [basvuruAcik, setBasvuruAcik]         = useState<boolean | null>(null);

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
    defaultValues: { katilimTuru: 'bireysel', takimUyeleri: [], iletisimIzni: false },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'takimUyeleri' });

  const watchedEtkinlik = watch('etkinlikTuru');
  const watchedKatilim  = watch('katilimTuru');

  const gucPuan  = sifreGucu(sifre);
  const gucRenk  = gucPuan < 4 ? '#ef4444' : gucPuan < 7 ? '#f59e0b' : '#10b981';
  const gucLabel = gucPuan < 4 ? 'Zayıf'  : gucPuan < 7 ? 'Orta'    : 'Güçlü';

  useEffect(() => { setValue('sifre', sifre); },         [sifre, setValue]);
  useEffect(() => { setValue('sifreTekrar', sifreTekrar); }, [sifreTekrar, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setGlobalHata('');
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });

      if (!res.ok) {
        const json  = await res.json().catch(() => ({}));
        const code  = json?.code as string | undefined;
        if (res.status === 429)                                  { setGlobalHata('Çok fazla deneme. Lütfen 15 dakika bekleyin.'); return; }
        if (res.status === 403 || code === 'applications_closed') { setGlobalHata('Başvurular şu anda kapalı.'); return; }
        if (res.status === 409 || code === 'email_exists')        { setError('eposta', { message: 'Bu e-posta zaten kayıtlı. Giriş yap →' }); return; }
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

  /* ── Theme-aware class strings ──────────────────────────────────────────── */

  const inputCls = isDark
    ? 'w-full bg-[#0d0b18] border border-[#2a2545] rounded-lg px-3.5 py-2.5 text-[#d1cfe8] font-[Lexend] text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#3d3660] focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15'
    : 'w-full bg-white border border-[#DDD6FE] rounded-lg px-3.5 py-2.5 text-[#1E1B4B] font-[Lexend] text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#C4BBE8] focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15';

  const labelCls = isDark
    ? 'block text-[13px] text-[#9490b0] tracking-wide mb-1.5'
    : 'block text-[13px] text-[#5B5280] tracking-wide mb-1.5';

  const errorCls = 'text-[13px] text-red-400 mt-1 block';

  const cardCls = isDark
    ? 'bg-[#13111f]/80 backdrop-blur-xl border border-[#1e1a2e] rounded-xl p-7 mb-5'
    : 'bg-white border border-[#EDE9FE] rounded-xl p-7 mb-5 shadow-sm';

  const sectionLabelCls = isDark
    ? 'font-[Share_Tech_Mono] text-[15px] tracking-[0.3em] text-[#4a4568] uppercase mb-5 pb-3 border-b border-dashed border-[#1e1a2e]'
    : 'font-[Share_Tech_Mono] text-[15px] tracking-[0.3em] text-[#A09BBF] uppercase mb-5 pb-3 border-b border-dashed border-[#EDE9FE]';

  const dividerCls = isDark
    ? 'border-none h-px my-5 bg-[#1e1a2e]'
    : 'border-none h-px my-5 bg-[#EDE9FE]';

  const groupCls = 'mb-[18px]';

  const selectorCardBase = isDark
    ? 'border-2 border-[#1e1a2e] bg-[#0d0b18] rounded-xl px-4 py-[18px] cursor-pointer transition-all duration-150 text-left hover:border-[#3a3060] hover:-translate-y-px'
    : 'border-2 border-[#DDD6FE] bg-[#FAFAFE] rounded-xl px-4 py-[18px] cursor-pointer transition-all duration-150 text-left hover:border-violet-400 hover:-translate-y-px';

  const selectorHack    = 'border-[#d4a843] bg-[#d4a843]/7 shadow-[0_0_0_1px_#d4a843]';
  const selectorDefault = 'border-violet-600 bg-violet-600/7 shadow-[0_0_0_1px_#7c3aed]';

  const cardNameCls = isDark ? 'font-[Lexend] font-bold text-base text-[#d1cfe8] mb-1' : 'font-[Lexend] font-bold text-base text-[#1E1B4B] mb-1';
  const cardDescCls = isDark ? 'text-[13px] text-[#6b6485] leading-relaxed whitespace-pre-line' : 'text-[13px] text-[#6D6594] leading-relaxed whitespace-pre-line';

  const teamMemberBg     = isDark ? 'bg-[#0a0814] border border-[#2a2545]' : 'bg-[#F3F0FF] border border-[#DDD6FE]';
  const teamMemberLabel  = isDark ? 'text-[#6b6485]' : 'text-[#9C94BC]';

  const addMemberBtnCls = isDark
    ? 'w-full border-2 border-dashed border-[#2a2545] bg-transparent rounded-lg py-3 text-[#6b6485] font-[Lexend] text-[15px] cursor-pointer transition-all duration-150 mt-2 hover:border-violet-600 hover:bg-violet-600/7 hover:text-[#c4b5fd]'
    : 'w-full border-2 border-dashed border-[#DDD6FE] bg-transparent rounded-lg py-3 text-[#A09BBF] font-[Lexend] text-[15px] cursor-pointer transition-all duration-150 mt-2 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-600';

  const consentLabelCls = isDark ? 'text-[15px] leading-relaxed text-[#c8c4e0]' : 'text-[15px] leading-relaxed text-[#374151]';
  const consentMutedCls = isDark ? 'text-[15px] leading-relaxed text-[#6b6485]' : 'text-[15px] leading-relaxed text-[#6D6594]';

  const toggleTrackCls  = isDark ? 'absolute inset-0 bg-[#2a2545] rounded-xl transition-colors peer-checked:bg-violet-600/40' : 'absolute inset-0 bg-[#DDD6FE] rounded-xl transition-colors peer-checked:bg-violet-600/40';
  const toggleThumbCls  = isDark ? 'absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-[#5a5376] transition-transform peer-checked:translate-x-5 peer-checked:bg-violet-600' : 'absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-[#C4BBE8] transition-transform peer-checked:translate-x-5 peer-checked:bg-violet-600';

  /* ── Success screen ─────────────────────────────────────────────────────── */
  if (basarili) {
    const isHack     = watchedEtkinlik === 'hackathon';
    const stampColor = isHack ? '#d4a843' : '#7c3aed';
    return (
      <>
        <style>{`
          @keyframes stampIn { from { transform: rotate(-15deg) scale(2); opacity: 0; } to { transform: rotate(-15deg) scale(1); opacity: 0.9; } }
          @keyframes burstIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.95; } }
        `}</style>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: isDark ? '#0a0a0f' : '#F8F7FF' }}
        >
          <div className="text-center px-6 py-15">
            <div
              className="font-[Lexend] font-extrabold text-[clamp(22px,6vw,48px)] px-8 py-4 inline-block"
              style={{ color: stampColor, border: `4px solid ${stampColor}`, animation: `${isHack ? 'stampIn 0.6s ease' : 'burstIn 0.5s ease'} forwards` }}
            >
              {isHack ? 'DOSYA TESLİM EDİLDİ' : 'GAME SUBMITTED! 🎮'}
            </div>
            <p
              className="font-[Share_Tech_Mono] text-xs tracking-[0.25em] mt-5 text-center"
              style={{ color: isDark ? '#4a4568' : '#A09BBF' }}
            >
              PANELE YÖNLENDİRİLİYORSUN...
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Main form ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen px-4 py-8 pb-16 font-[Lexend] relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: isDark ? '#0a0a0f' : '#F8F7FF' }}
    >
      <FluidBackground key={isDark ? 'dark' : 'light'} dark={isDark} />

      <div className="relative z-10 max-w-[680px] mx-auto">

        {/* Header */}
        <div
          className="text-center mb-8 px-6 py-8 rounded-xl"
          style={{
            background:     isDark ? 'rgba(19,17,31,0.80)' : '#ffffff',
            backdropFilter: isDark ? 'blur(20px)' : 'none',
            border:         `1px solid ${isDark ? '#1e1a2e' : '#EDE9FE'}`,
            boxShadow:      isDark ? 'none' : '0 1px 6px rgba(99,60,200,0.06)',
          }}
        >
          <p
            className="font-[Share_Tech_Mono] text-[15px] tracking-[0.35em] uppercase mb-2"
            style={{ color: isDark ? '#4a4568' : '#A09BBF' }}
          >
            ◈ AGZ KAYIT SİSTEMİ ◈
          </p>
          <h1
            className="font-[Lexend] font-extrabold text-[clamp(22px,5vw,34px)] mb-3"
            style={{ color: isDark ? '#d1cfe8' : '#1E1B4B' }}
          >
            Aydın Gençlik Zirvesi&apos;ne Kayıt
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: isDark ? '#8b85a8' : '#6D6594' }}
          >
            Formu doldurun ve kayıt olun.<br />
            <strong className="text-violet-500">Kayıt = Başvurudur.</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* 01 — KİŞİSEL BİLGİLER */}
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
              <span
                className="text-xs mt-1 block"
                style={{ color: isDark ? '#6b6485' : '#A09BBF' }}
              >
                11 haneli: 05XXXXXXXXX
              </span>
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

          {/* 02 — ETKİNLİK SEÇİMİ */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>// 02 — ETKİNLİK SEÇİMİ</p>

            <div className={groupCls}>
              <label className={labelCls}>ETKİNLİK TÜRÜ *</label>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-1.5">
                {[
                  { id: 'hackathon', icon: <Search size={28} />,  name: 'HACKATHON', desc: 'Gizli Dosya teması\n48 saat · Teknoloji & Ürün' },
                  { id: 'gamejam',   icon: <Gamepad2 size={28} />, name: 'GAME JAM',  desc: 'Ship it! Ruhu\n48 saat · Oyun & Tasarım' },
                ].map(ev => (
                  <div
                    key={ev.id}
                    className={`${selectorCardBase} ${watchedEtkinlik === ev.id ? (ev.id === 'hackathon' ? selectorHack : selectorDefault) : ''}`}
                    onClick={() => setValue('etkinlikTuru', ev.id as 'hackathon'|'gamejam', { shouldValidate: true })}
                  >
                    <div
                      className="text-[22px] mb-2"
                      style={{ color: isDark ? '#9490b0' : '#7C3AED' }}
                    >
                      {ev.icon}
                    </div>
                    <div className={cardNameCls}>{ev.name}</div>
                    <div className={cardDescCls}>{ev.desc}</div>
                  </div>
                ))}
              </div>
              {errors.etkinlikTuru && <span className={errorCls}>{errors.etkinlikTuru.message}</span>}
            </div>

            <div className={dividerCls} />

            <div className={groupCls}>
              <label className={labelCls}>KATILIM TÜRÜ *</label>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-1.5">
                {[
                  { id: 'bireysel', icon: <User size={28} />,  name: 'BİREYSEL', desc: 'Kendi başıma\n(eşleşme mümkün)' },
                  { id: 'takim',    icon: <Users size={28} />, name: 'TAKIM',    desc: 'Kendi takımımla\n(max 4 kişi)'    },
                ].map(k => (
                  <div
                    key={k.id}
                    className={`${selectorCardBase} ${watchedKatilim === k.id ? selectorDefault : ''}`}
                    onClick={() => setValue('katilimTuru', k.id as 'bireysel'|'takim', { shouldValidate: true })}
                  >
                    <div
                      className="text-[22px] mb-2"
                      style={{ color: isDark ? '#9490b0' : '#7C3AED' }}
                    >
                      {k.icon}
                    </div>
                    <div className={cardNameCls}>{k.name}</div>
                    <div className={cardDescCls}>{k.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Takım section */}
            <div className={`overflow-hidden transition-[max-height,opacity] duration-400 ${watchedKatilim === 'takim' ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={dividerCls} />
              <div className={groupCls}>
                <label className={labelCls}>TAKIM ADI *</label>
                <input {...register('takimAdi')} className={inputCls} placeholder="Takımınızın adı (min. 3 karakter)" />
                {errors.takimAdi && <span className={errorCls}>{errors.takimAdi.message}</span>}
              </div>
              <label
                className="block text-[13px] tracking-wide mb-3"
                style={{ color: isDark ? '#9490b0' : '#5B5280' }}
              >
                TAKIM ÜYELERİ{' '}
                <span style={{ color: isDark ? '#4a4568' : '#A09BBF' }} className="text-[11px]">(max 3 ek üye)</span>
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className={`${teamMemberBg} rounded-lg p-4 mb-3.5`}>
                  <div className="flex justify-between items-center mb-3.5">
                    <span
                      className={`font-[Share_Tech_Mono] text-[11px] tracking-[0.2em] uppercase ${teamMemberLabel}`}
                    >
                      ÜYE {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-transparent border-none text-red-400 text-[13px] cursor-pointer px-2 py-1 rounded transition-colors hover:bg-red-400/10"
                    >
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
                <button
                  type="button"
                  className={addMemberBtnCls}
                  onClick={() => append({ isim: '', soyisim: '', eposta: '', telefon: '', universite: '', bolum: '' })}
                >
                  + Takım Arkadaşı Ekle
                </button>
              )}
              {fields.length > 0 && (
                <p
                  className="text-right text-xs mt-2"
                  style={{ color: isDark ? '#6b6485' : '#A09BBF' }}
                >
                  {fields.length}/3 ek üye
                </p>
              )}
            </div>
          </div>

          {/* 03 — HESAP OLUŞTUR */}
          <div className={cardCls}>
            <p className={sectionLabelCls}>// 03 — HESAP OLUŞTUR</p>

            <div className={groupCls}>
              <label className={labelCls}>ŞİFRE *</label>
              <div className="relative">
                <input
                  type={sifreGoster ? 'text' : 'password'}
                  className={`${inputCls} pr-11`}
                  placeholder="············"
                  value={sifre}
                  onChange={e => setSifre(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors duration-150 p-1"
                  style={{ color: isDark ? '#6b6485' : '#A09BBF' }}
                >
                  {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {sifre.length > 0 && (
                <div className="mt-2">
                  <div
                    className="rounded h-1 overflow-hidden"
                    style={{ backgroundColor: isDark ? '#1e1a2e' : '#EDE9FE' }}
                  >
                    <div
                      className="h-full rounded transition-[width,background] duration-200"
                      style={{ width: `${(gucPuan / 8) * 100}%`, background: gucRenk }}
                    />
                  </div>
                  <div className="flex justify-end my-1">
                    <span className="text-[11px]" style={{ color: gucRenk }}>{gucLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-1.5">
                    {[
                      { ok: sifre.length >= 8,   label: '✓ En az 8 karakter' },
                      { ok: /[A-Z]/.test(sifre), label: '✓ En az 1 büyük harf' },
                      { ok: /[0-9]/.test(sifre), label: '✓ En az 1 rakam' },
                    ].map(rule => (
                      <span
                        key={rule.label}
                        className="text-xs transition-colors duration-200"
                        style={{ color: rule.ok ? '#10b981' : (isDark ? '#3d3660' : '#C4BBE8') }}
                      >
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
                <input
                  type={sifreTekrarGoster ? 'text' : 'password'}
                  className={`${inputCls} ${sifreTekrar.length > 0 ? 'pr-[68px]' : 'pr-11'}`}
                  placeholder="············"
                  value={sifreTekrar}
                  onChange={e => setSifreTekrar(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setSifreTekrarGoster(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors duration-150 p-1"
                  style={{ color: isDark ? '#6b6485' : '#A09BBF' }}
                >
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

            <div className={dividerCls} />

            {[
              { name: 'gizlilikOnay' as const, label: <>Gizlilik Politikası&apos;nı okudum ve kabul ediyorum <span className="text-red-400">*</span></>, muted: false },
              { name: 'kuralOnay'    as const, label: <>Etkinlik kurallarını okudum ve kabul ediyorum <span className="text-red-400">*</span></>,        muted: false },
              { name: 'iletisimIzni' as const, label: <>GDG on Campus, HSD ve OTT&apos;den haberler almak istiyorum <span className="text-xs">(opsiyonel)</span></>, muted: true },
            ].map(cb => (
              <div key={cb.name}>
                <label className="flex items-start gap-2.5 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    className="w-[18px] h-[18px] min-w-[18px] accent-violet-600 mt-0.5 cursor-pointer"
                    {...register(cb.name)}
                  />
                  <span className={cb.muted ? consentMutedCls : consentLabelCls}>{cb.label}</span>
                </label>
                {errors[cb.name] && <span className={`${errorCls} mb-2`}>{errors[cb.name]?.message}</span>}
              </div>
            ))}

            <div className={dividerCls} />

            {globalHata && (
              <div className="bg-red-500/8 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-[15px] mb-5 leading-relaxed">
                {globalHata}
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
              className="w-full bg-violet-700 hover:enabled:bg-violet-800 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl py-3.5 border-none font-[Lexend] transition-all duration-150 tracking-wide cursor-pointer"
            >
              {isSubmitting ? 'GÖNDERİLİYOR...' : basvuruAcik === null ? 'YÜKLENİYOR...' : basvuruAcik ? 'BAŞVURUYU TAMAMLA →' : 'BAŞVURULAR YAKINDA AÇILACAK'}
            </button>

            <p
              className="text-center mt-4 text-[13px]"
              style={{ color: isDark ? '#4a4568' : '#A09BBF' }}
            >
              Zaten hesabın var mı?{' '}
              <a href="/auth/login" className="text-violet-600 no-underline hover:text-violet-500 transition-colors">Giriş Yap →</a>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
