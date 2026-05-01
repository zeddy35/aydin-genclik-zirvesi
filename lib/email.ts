import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// From address — must be a verified domain in Resend dashboard
const FROM = process.env.RESEND_FROM ?? 'AGZ <noreply@aydingenclikzirvesi.com>';

export async function sendVerificationEmail(
  to: string,
  isim: string,
  verificationLink: string,
): Promise<void> {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: 'AGZ — E-posta Adresini Doğrula',
    html: `
      <div style="background:#0a0a0f;padding:40px;font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.3em;color:#4a4568;text-transform:uppercase;margin-bottom:8px;">
          ◈ AYDIN GENÇLİK ZİRVESİ
        </p>
        <h1 style="font-size:24px;font-weight:800;color:#d1cfe8;margin-bottom:16px;">
          Merhaba ${isim} 👋
        </h1>
        <p style="font-size:15px;color:#9490b0;line-height:1.7;margin-bottom:28px;">
          Başvurunuzu tamamlamak için e-posta adresinizi doğrulamanız gerekiyor.
          Aşağıdaki butona tıklayın.
        </p>
        <a href="${verificationLink}"
           style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
          E-postamı Doğrula →
        </a>
        <p style="font-size:12px;color:#4a4568;margin-top:28px;line-height:1.6;">
          Bu linkin geçerlilik süresi 24 saattir. Eğer bu başvuruyu siz yapmadıysanız
          bu e-postayı görmezden gelebilirsiniz.
        </p>
        <hr style="border:none;border-top:1px solid #1e1a2e;margin:24px 0;" />
        <p style="font-size:11px;color:#2a2545;font-family:monospace;letter-spacing:0.2em;">
          AGZ KAYIT SİSTEMİ · ${new Date().getFullYear()}
        </p>
      </div>
    `,
  });
}

export async function sendKapasiteDoluEmail(
  to: string,
  isim: string,
  adminNotu?: string,
): Promise<void> {
  await resend.emails.send({
    from:    FROM,
    to,
    subject: 'AGZ — Hackathon Başvurunuz Hakkında',
    html: `
      <div style="background:#0a0a0f;padding:40px;font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.3em;color:#4a4568;text-transform:uppercase;margin-bottom:8px;">
          ◈ AYDIN GENÇLİK ZİRVESİ
        </p>
        <h1 style="font-size:24px;font-weight:800;color:#d1cfe8;margin-bottom:8px;">
          Merhaba ${isim},
        </h1>
        <p style="font-size:15px;color:#9490b0;line-height:1.7;margin-bottom:20px;">
          Aydın Gençlik Zirvesi Hackathon'umuza başvurduğun için gerçekten çok teşekkür ederiz. 
          Zaman ayırıp başvurmanız bizim için çok değerliydi. 🙏
        </p>
        <div style="background:#13111f;border:1px solid #1e1a2e;border-left:3px solid #f59e0b;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="font-size:14px;color:#fbbf24;font-weight:700;margin:0 0 10px 0;">⚠️ Kontenjan Doldu</p>
          <p style="font-size:14px;color:#c8c4e0;line-height:1.7;margin:0;">
            Ne yazık ki hackathon kontenjanımız tamamen doldu ve başvurunu değerlendirme sürecine 
            alamıyoruz. Bu durum başvurunun kalitesiyle hiçbir şekilde ilgili değil
            tamamen sınırlı kapasiteden kaynaklanıyor. Bunu sana iletmek zorunda olmak bizim için de üzücü. 💜
          </p>
        </div>
        ${adminNotu ? `
          <div style="background:#13111f;border:1px solid #1e1a2e;border-left:3px solid #8b5cf6;
                      border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="font-size:13px;color:#c8c4e0;line-height:1.7;margin:0;">${adminNotu}</p>
          </div>
        ` : ''}
        <p style="font-size:14px;color:#9490b0;line-height:1.7;margin-bottom:24px;">
          Umarız AGZ'nin diğer etkinliklerinde bir araya geliriz. Seni bu topluluğun bir parçası 
          olarak görmekten mutluluk duyarız. Tekrar çok teşekkürler, başarılar! 🚀
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://aydingenclikzirvesi.com'}/panel/durum"
           style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
          Başvuru Durumunuzu Görün →
        </a>
        <hr style="border:none;border-top:1px solid #1e1a2e;margin:24px 0;" />
        <p style="font-size:11px;color:#2a2545;font-family:monospace;letter-spacing:0.2em;">
          AGZ KAYIT SİSTEMİ · ${new Date().getFullYear()}
        </p>
      </div>
    `,
  });
}

export async function sendApplicationStatusEmail(
  to: string,
  isim: string,
  durum: 'onaylandi' | 'reddedildi' | 'bekleme_listesi',
  adminNotu?: string,
): Promise<void> {
  const durumConfig = {
    onaylandi:       { emoji: '🎉', baslik: 'Başvurunuz Onaylandı!',        renk: '#10b981' },
    reddedildi:      { emoji: '😔', baslik: 'Başvurunuz Değerlendirildi',    renk: '#ef4444' },
    bekleme_listesi: { emoji: '⏳', baslik: 'Bekleme Listesine Alındınız',   renk: '#8b5cf6' },
  }[durum];

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `AGZ — ${durumConfig.baslik}`,
    html: `
      <div style="background:#0a0a0f;padding:40px;font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.3em;color:#4a4568;text-transform:uppercase;margin-bottom:8px;">
          ◈ AYDIN GENÇLİK ZİRVESİ
        </p>
        <h1 style="font-size:24px;font-weight:800;color:${durumConfig.renk};margin-bottom:8px;">
          ${durumConfig.emoji} ${durumConfig.baslik}
        </h1>
        <p style="font-size:15px;color:#9490b0;line-height:1.7;margin-bottom:${adminNotu ? '16px' : '28px'};">
          Merhaba ${isim}, başvurunuzu inceledik.
        </p>
        ${adminNotu ? `
          <div style="background:#13111f;border:1px solid #1e1a2e;border-left:3px solid ${durumConfig.renk};
                      border-radius:8px;padding:16px;margin-bottom:28px;">
            <p style="font-size:13px;color:#c8c4e0;line-height:1.7;margin:0;">${adminNotu}</p>
          </div>
        ` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://aydingenclikzirvesi.com'}/panel/durum"
           style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">
          Panelinize Gidin →
        </a>
        <hr style="border:none;border-top:1px solid #1e1a2e;margin:24px 0;" />
        <p style="font-size:11px;color:#2a2545;font-family:monospace;letter-spacing:0.2em;">
          AGZ KAYIT SİSTEMİ · ${new Date().getFullYear()}
        </p>
      </div>
    `,
  });
}
