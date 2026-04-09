"use client";

const C = {
  bg:       "#070709",
  surf:     "#0c0c12",
  surf2:    "#101018",
  border:   "#1c1c28",
  borderHi: "#2a2a3a",
  red:      "#c0392b",
  redDim:   "#7a1a1a",
  redText:  "#e05050",
  amber:    "#d97706",
  amberText:"#fbbf24",
  gold:     "#c8a84b",
  txt:      "#ede9f8",
  txtSec:   "#918da8",
  txtMuted: "#524e68",
  txtCode:  "#3c3a52",
  ui:       "var(--font-lexend), sans-serif",
  mono:     "var(--font-share-tech-mono), monospace",
  display:  "var(--font-oswald), sans-serif",
} as const;

interface Character {
  id:      string;
  name:    string;
  role:    string;
  status:  string;
  suspect: boolean;
  photo?:  string;
  details: { label: string; value: string }[];
  story:   string;
}

const CHARACTERS: Character[] = [
  {
    id:      "01",
    name:    "KARAKTEr ADI",
    role:    "Rol / Unvan",
    status:  "AKTİF · İZLENİYOR",
    suspect: true,
    details: [
      { label: "Konum",          value: "—" },
      { label: "Son Görülme",    value: "—" },
      { label: "Tehdit Seviyesi",value: "YÜKSEK" },
      { label: "Bağlantılar",    value: "—" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü kısaca burada anlatılacak.",
  },
  {
    id:      "02",
    name:    "KARAKTEr ADI",
    role:    "Rol / Unvan",
    status:  "KAYIP · ARAŞTIRILIYOR",
    suspect: false,
    details: [
      { label: "Konum",       value: "—" },
      { label: "Son Görülme", value: "—" },
      { label: "Durum",       value: "BİLİNMİYOR" },
      { label: "İlişki",      value: "—" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü kısaca burada anlatılacak.",
  },
  {
    id:      "03",
    name:    "KARAKTEr ADI",
    role:    "Rol / Unvan",
    status:  "TANIK · KORUMA ALTINDA",
    suspect: false,
    details: [
      { label: "Konum",       value: "—" },
      { label: "Son Görülme", value: "—" },
      { label: "Güvenilirlik",value: "ORTA" },
      { label: "İfade",       value: "ALINMADI" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü kısaca burada anlatılacak.",
  },
  {
    id:      "04",
    name:    "KARAKTEr ADI",
    role:    "Rol / Unvan",
    status:  "GİZLİ · YETKİLENDİRİLMİŞ",
    suspect: false,
    details: [
      { label: "Konum",       value: "—" },
      { label: "Son Görülme", value: "—" },
      { label: "Yetki",       value: "SINIRLI" },
      { label: "Görev",       value: "GİZLİ" },
    ],
    story:
      "Bu karakter hakkında hikaye buraya gelecek. Kişinin geçmişi, motivasyonları ve vakadaki rolü kısaca burada anlatılacak.",
  },
];

function StatusBadge({ status, suspect }: { status: string; suspect: boolean }) {
  const color = suspect ? C.redText : C.amberText;
  const bg    = suspect ? `${C.redDim}55` : "#1a1200";
  const border= suspect ? `${C.red}55` : `${C.amber}44`;
  return (
    <span style={{
      fontFamily:    C.mono,
      fontSize:      9,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color,
      background:    bg,
      border:        `1px solid ${border}`,
      padding:       "3px 8px",
      display:       "inline-block",
    }}>
      {status}
    </span>
  );
}

function CharacterCard({ char, index }: { char: Character; index: number }) {
  const accentColor = char.suspect ? C.redText : C.gold;
  const borderColor = char.suspect ? C.redDim  : C.border;

  return (
    <div
      style={{
        background:   C.surf,
        border:       `1px solid ${borderColor}`,
        position:     "relative",
        overflow:     "hidden",
        animation:    `fadeIn 0.5s ease both`,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Top accent line */}
      <div style={{
        height:     2,
        background: char.suspect
          ? `linear-gradient(90deg, ${C.red}, ${C.redDim} 60%, transparent)`
          : `linear-gradient(90deg, ${C.gold}88, transparent)`,
      }} />

      <div style={{ padding: "clamp(20px, 3vw, 28px)" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>

          {/* Photo */}
          <div style={{
            width:          80,
            height:         96,
            background:     C.surf2,
            border:         `1px solid ${borderColor}`,
            flexShrink:     0,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            6,
            position:       "relative",
            overflow:       "hidden",
          }}>
            {char.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={char.photo} alt={char.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: C.border, border: `1px solid ${C.borderHi}`,
                }} />
                <div style={{ width: 48, height: 20, background: C.border, borderRadius: 2 }} />
                <div style={{
                  position:  "absolute",
                  bottom:    4,
                  fontFamily: C.mono,
                  fontSize:  8,
                  color:     C.txtCode,
                  letterSpacing: "0.15em",
                }}>
                  FOTOĞRAF YOK
                </div>
              </>
            )}
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{
                fontFamily:    C.mono,
                fontSize:      10,
                color:         C.txtCode,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}>
                DOSYA #{char.id}
              </span>
              {char.suspect && (
                <span style={{
                  fontFamily:    C.mono,
                  fontSize:      8,
                  color:         C.redText,
                  background:    `${C.redDim}44`,
                  border:        `1px solid ${C.red}55`,
                  padding:       "1px 6px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>
                  ANA ŞÜPHELI
                </span>
              )}
            </div>

            <h2 style={{
              fontFamily:    C.display,
              fontSize:      "clamp(20px, 3vw, 26px)",
              fontWeight:    600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:         char.suspect ? C.redText : C.txt,
              margin:        "0 0 4px",
              lineHeight:    1.1,
            }}>
              {char.name}
            </h2>

            <p style={{
              fontFamily:    C.ui,
              fontSize:      13,
              color:         C.txtSec,
              margin:        "0 0 10px",
            }}>
              {char.role}
            </p>

            <StatusBadge status={char.status} suspect={char.suspect} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

        {/* Details grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap:                 "8px 16px",
          marginBottom:        16,
        }}>
          {char.details.map((d) => (
            <div key={d.label} style={{
              background:   C.surf2,
              border:       `1px solid ${C.border}`,
              padding:      "8px 10px",
            }}>
              <div style={{
                fontFamily:    C.mono,
                fontSize:      9,
                color:         C.txtCode,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom:  3,
              }}>
                {d.label}
              </div>
              <div style={{
                fontFamily:    C.ui,
                fontSize:      12,
                color:         accentColor,
                fontWeight:    500,
              }}>
                {d.value}
              </div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div style={{
          borderLeft: `2px solid ${borderColor}`,
          paddingLeft: 12,
        }}>
          <div style={{
            fontFamily:    C.mono,
            fontSize:      9,
            color:         C.txtCode,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom:  6,
          }}>
            // ARKA_PLAN
          </div>
          <p style={{
            fontFamily:  C.ui,
            fontSize:    13,
            lineHeight:  1.7,
            color:       C.txtMuted,
            margin:      0,
          }}>
            {char.story}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LorePage() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { min-height: 100vh; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
      `}</style>

      <div style={{
        minHeight:  "100vh",
        background: C.bg,
        color:      C.txt,
        padding:    "clamp(24px, 5vw, 60px) clamp(16px, 5vw, 40px)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Header */}
          <header style={{ marginBottom: "clamp(32px, 5vw, 56px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, flex: 1, background: C.border }} />
              <span style={{
                fontFamily:    C.mono,
                fontSize:      9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color:         C.txtCode,
              }}>
                GİZLİ · SINIRLI ERİŞİM
              </span>
              <div style={{ height: 1, flex: 1, background: C.border }} />
            </div>

            <h1 style={{
              fontFamily:    C.display,
              fontSize:      "clamp(32px, 6vw, 56px)",
              fontWeight:    700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:         C.txt,
              margin:        "0 0 4px",
              lineHeight:    1,
            }}>
              VAKA DOSYASI
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{
                fontFamily:    C.mono,
                fontSize:      10,
                color:         C.redText,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                AGZ HackathOn 2026
              </span>
              <span style={{ width: 1, height: 12, background: C.border, display: "inline-block" }} />
              <span style={{
                fontFamily:    C.mono,
                fontSize:      10,
                color:         C.txtCode,
                letterSpacing: "0.15em",
              }}>
                {CHARACTERS.length} KAYIT · DEVAM EDEN SORUŞTURMA
              </span>
            </div>
          </header>

          {/* Grid */}
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 440px), 1fr))",
            gap:                 "clamp(12px, 2vw, 20px)",
          }}>
            {CHARACTERS.map((char, i) => (
              <CharacterCard key={char.id} char={char} index={i} />
            ))}
          </div>

          {/* Footer */}
          <footer style={{
            marginTop:     40,
            paddingTop:    20,
            borderTop:     `1px solid ${C.border}`,
            textAlign:     "center",
          }}>
            <p style={{
              fontFamily:    C.mono,
              fontSize:      9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         C.txtCode,
            }}>
              Bu dosyalar AGZ HackathOn 2026 organizasyonu tarafından hazırlanmıştır · Yetkisiz dağıtım yasaktır
            </p>
          </footer>

        </div>
      </div>
    </>
  );
}
