// lib/easterEggs/konami.ts

export function createKonamiListener(onSuccess: () => void) {
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"];
  let konamiIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    const expectedKey = konamiCode[konamiIndex];
    
    console.log(`[Konami] Index: ${konamiIndex}, Pressed: ${key}, Expected: ${expectedKey}`);
    
    // For arrow keys, compare directly (case-sensitive)
    // For letters, compare lowercase
    const isMatch = /^Arrow/.test(expectedKey) 
      ? key === expectedKey 
      : key.toLowerCase() === expectedKey.toLowerCase();

    if (isMatch) {
      konamiIndex++;
      console.log(`[Konami] ✓ Match! Progress: ${konamiIndex}/${konamiCode.length}`);

      if (konamiIndex === konamiCode.length) {
        console.log("[Konami] 🎉 KONAMI CODE ACTIVATED!");
        onSuccess();
        konamiIndex = 0;
      }
    } else {
      // Reset on any wrong key
      console.log(`[Konami] ✗ Wrong key, reset`);
      konamiIndex = 0;
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }
  
  return () => {};
}
