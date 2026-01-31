// lib/easterEggs/konami.ts

export function createKonamiListener(onSuccess: () => void) {
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key === konamiCode[konamiIndex]) {
      konamiIndex++;

      if (konamiIndex === konamiCode.length) {
        onSuccess();
        konamiIndex = 0;
      }
    } else if ((e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") && konamiCode.includes(e.key)) {
      konamiIndex = 1;
    } else {
      konamiIndex = 0;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}
