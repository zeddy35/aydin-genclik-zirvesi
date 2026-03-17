# Changelog — `minimalist` branch

> Tüm değişiklikler `master` → `minimalist` arası yapılan çalışmaları kapsar.

---

## HackFullView — Tam Yeniden Yazım

**Dosya:** `components/views/HackFullView.tsx`

Hackathon paneli sıfırdan yeniden tasarlandı. Dedektif/noir teması korunurken minimalist ve interaktif bir yapıya geçildi.

### Yeni Mimari
- `Person` interface + `PEOPLE[]` data array: Dedektif Dino, Early Akses, Beta
- `C` design token objesi (renkler, font aileleri)
- Alt bileşenler: `StatusBadge`, `Tag`, `SectionHeader`, `Divider`, `MainCaseDisplay`, `CharacterCard`, `FAQItem`

### Interaktif Karakter Seçici
- Sağda dikey sidebar (desktop) / üstte yatay scroll strip (mobil)
- Karta tıklayınca sol panel içeriği fade-out (170ms) → veri değişimi → fade-in ile güncelleniyor
- Aktif kart: sol accent bar, background tint, isim renk değişimi
- Hover: border color değişimi, image opacity artışı

### Tipografi Sistemi
- **Syne** → tüm UI metinleri (etiketler, body, tag'ler)
- **Oswald** → büyük başlıklar/değerler (`clamp(30px, 4.5vw, 58px)`)
- **Share Tech Mono** → yalnızca dosya kodları (HCK-AYD-01 vb.)

### Layout
- `flex-col lg:flex-row-reverse` — mobilede kartlar üstte, desktopda sağda
- `max-width: clamp(320px, 90vw, 1160px)` — responsive genişlik

### Bölümler
- **Karakter Dosyası** (hero) — interaktif kart seçici + ana içerik
- **Intel Strip** — Bölge / Süre / Tarih / Giriş (4 sütun, hover efektli)
- **Soruşturma Akışı** — 2 günlük timeline (4 faz, gün etiketleriyle)
- **Soru Odası** — FAQ accordion (desktop 2 sütun, mobil tek sütun)
- **CTA** — "Vakaya Katıl" + "Vaka Dosyası" butonları, hover efektli

### İçerik Güncellemeleri
- Süre: 48 Saat → **24 Saat**
- Tarih: Yakında → **5–6 Mayıs**
- Timeline: 3 faz → **4 faz** (Açılış · İnşa · Son Sprint · Kapanış), gün etiketleriyle
- Phase header: `5–6 Mayıs · 2 Gün`

### Hover Efektleri
- Intel Strip hücreleri: hover'da `surf2` background
- Phase Timeline kartları: hover'da hafif background highlight
- CTA butonları: border glow + box-shadow

### Easter Egg'ler (Korundu)
- Konami kodu (↑↑↓↓←→←→BA) → overlay
- HCK-AYD-48'e 5 kez tıklama → "GİZLİ DOSYA" stamp
- "Ücretsiz" üzerine 1.5s hover → Minecraft blok easter egg

---

## LandingView — Büyük Refactor

**Dosyalar:** `components/views/LandingView.tsx`, `components/views/LandingView.module.css`

### CSS Module Ayrımı
- Tüm inline `<style>` bloğu → `LandingView.module.css`'e taşındı (~466 satır yeni CSS)
- Animasyonlar, panel stilleri, pill, nav butonları modüler hale getirildi

### Navigasyon Okları (Mobil)
- Game Jam paneli: ok butonu **panel ortası sola** taşındı
- Hackathon paneli: ok butonu **panel ortası sağa** taşındı
- Butonlar artık iç content div'i yerine doğrudan panel div'inin child'ı → `position: absolute` doğru çalışıyor

### Bottom Pill Birleştirme
- Ayrı scroll arrow butonu kaldırıldı
- Chevron (↓) pill'in **içine** taşındı — sol tarafta küçük yuvarlak buton olarak
- Sonuç: `[ ↓ ]  AYDIN GENÇLİK ZİRVESİ 2026  [ GİRİŞ YAP ]` tek kompakt pill
- `pillWrapper` gap kaldırıldı, bounce animasyonu silindi

### Başvur Butonları
- Tüm "Başvur" butonları `/auth/register` adresine yönlendirildi:
  - `LandingView.tsx` → `/apply/gamejam`, `/apply/hackathon`
  - `PanelSplit.tsx` → `/gamejam/basvur`, `/hackathon/basvur`
  - `JamFullView.tsx` → `/gamejam/basvur`
  - `GameJamFullView.tsx` → `/apply/gamejam` (×2)
  - `HackFullView.tsx` → `/hackathon/basvur`

---

## Kayıt Sayfası — Başvuru Kilidi

**Dosya:** `app/auth/register/content.tsx`

- Submit butonu geçici olarak devre dışı bırakıldı
- Amber renkli bilgi banner'ı eklendi: **"BAŞVURULAR HENÜZ AÇILMADI"**
- Disabled buton: "BAŞVURULAR YAKINDA AÇILACAK"
- Form doldurulabilir durumda, yalnızca gönderim kapalı

---

## Bug Fix — Gri Overlay

**Dosya:** `components/views/GameJamFullView.module.css`

- `.wrapper::before { position: fixed }` → `position: absolute`
- **Neden:** HeroExperience'ın 300vw track div'i CSS `transform` kullandığından, `position: fixed` child'lar viewport yerine o div'e göre konumlanıyordu. Bu durum hackathon panelinin üzerine yarı saydam açık gri bir overlay sürüyordu.

---

## Bug Fix — Yanlış Font

**Dosya:** `app/arcade-theme.css`

- `--font-display: 'Press Start 2P'` → `--arcade-font-display: 'Press Start 2P'`
- `--font-heading`, `--font-body`, `--font-mono` → `--arcade-font-*` prefix'i
- `html, body { font-family; color }` override'ı kaldırıldı
- **Neden:** `arcade-theme.css`, `globals.css`'den sonra import edildiğinden Tailwind `@theme`'deki `--font-display: 'Oswald'` değişkenini eziyordu.

---

## Destekçiler (Sponsors)

**Dosya:** `app/globals.css`

- Sponsor kartları `row` layout'tan `column` layout'a geçirildi
- Kart boyutu: **240×240px** logo alanı
- Kart genişliği: 170px → **240px**
- İsim: sağa hizalı → **ortaya hizalı**
- Hover: `translateY(-3px)` + güçlendirilmiş glow

---

## Yeni Görseller

**Klasör:** `public/`

| Dosya | Açıklama |
|---|---|
| `dino/dino_bw.png` | Dedektif Dino — siyah-beyaz karakter görseli |
| `beta/beta_bw.png` | Beta — siyah-beyaz karakter görseli |
| `early-akses/early_bw.png` | Early Akses — siyah-beyaz karakter görseli |
| `backgrounds/jampanelbg.png` | Game Jam panel arka plan dokusu |
