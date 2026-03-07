import { z } from 'zod';

const takimUyesiSchema = z.object({
  isim: z.string().min(2, 'En az 2 karakter'),
  soyisim: z.string().min(2, 'En az 2 karakter'),
  eposta: z.string().email('Geçersiz e-posta'),
  telefon: z.string().regex(/^0[5][0-9]{9}$/, 'Geçersiz format: 05XX XXX XX XX'),
  universite: z.string().min(3, 'Üniversite adı gerekli'),
  bolum: z.string().min(2, 'Bölüm adı gerekli'),
});

export const registerSchema = z
  .object({
    isim: z.string().min(2, 'En az 2 karakter'),
    soyisim: z.string().min(2, 'En az 2 karakter'),
    eposta: z.string().email('Geçersiz e-posta formatı'),
    telefon: z.string().regex(/^0[5][0-9]{9}$/, 'Geçersiz format: 05XX XXX XX XX'),
    universite: z.string().min(3, 'Üniversite adı gerekli'),
    bolum: z.string().min(2, 'Bölüm adı gerekli'),
    etkinlikTuru: z.enum(['hackathon', 'gamejam'], {
      message: 'Etkinlik türü seçiniz',
    }),
    katilimTuru: z.enum(['bireysel', 'takim']),
    takimAdi: z.string().min(3).max(30).optional().or(z.literal('')),
    takimUyeleri: z.array(takimUyesiSchema).max(3).optional(),
    motivasyon: z.string().min(100, 'En az 100 karakter giriniz').max(500),
    deneyimSeviyesi: z.enum(['yeni_basliyor', 'orta', 'ileri']),
    rol: z.array(z.string()).min(1, 'En az bir rol seçiniz'),
    dahaOnceKatildi: z.boolean(),
    dahaOnceHangi: z.string().optional(),
    neOgrenmekIstiyor: z.string().max(300).optional(),
    projeFikri: z.string().max(200).optional(),
    sifre: z
      .string()
      .min(8, 'En az 8 karakter')
      .regex(/[A-Z]/, 'En az 1 büyük harf')
      .regex(/[0-9]/, 'En az 1 rakam'),
    sifreTekrar: z.string(),
    gizlilikOnay: z.literal(true, {
      message: 'Gizlilik politikasını onaylamanız gerekli',
    }),
    kuralOnay: z.literal(true, {
      message: 'Etkinlik kurallarını onaylamanız gerekli',
    }),
    iletisimIzni: z.boolean().optional(),
  })
  .refine(d => d.sifre === d.sifreTekrar, {
    message: 'Şifreler eşleşmiyor',
    path: ['sifreTekrar'],
  })
  .refine(
    d => {
      if (d.katilimTuru === 'takim' && (!d.takimAdi || d.takimAdi.length < 3)) return false;
      return true;
    },
    { message: 'Takım adı giriniz (en az 3 karakter)', path: ['takimAdi'] }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;
