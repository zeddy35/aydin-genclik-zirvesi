'use client';

import { useEffect, useRef } from 'react';

interface Props {
  dark?: boolean;
}

export default function FluidBackground({ dark = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    const blockClick = (e: Event) => { e.stopPropagation(); e.preventDefault(); };

    import('webgl-fluid').then(({ default: WebGLFluid }) => {
      if (destroyed || !canvas) return;
      WebGLFluid(canvas, {
        TRIGGER: 'hover',
        IMMEDIATE: true,
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 3,
        VELOCITY_DISSIPATION: 1.8,
        PRESSURE: 0.1,
        CURL: 15,
        SPLAT_RADIUS: 0.2,
        SPLAT_FORCE: 4000,
        SPLAT_COUNT: 3,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 4,
        BACK_COLOR: dark ? { r: 0, g: 0, b: 0 } : { r: 248, g: 247, b: 255 },
        TRANSPARENT: false,
        SHADING: true,
        BLOOM: true,
        BLOOM_INTENSITY: 0.4,
        SUNRAYS: false,
      });
      canvas.addEventListener('mousedown', blockClick, true);
      canvas.addEventListener('touchstart', blockClick, { capture: true, passive: false });
      canvas.addEventListener('touchend', blockClick, { capture: true, passive: false });
    });

    return () => {
      destroyed = true;
      canvas.removeEventListener('mousedown', blockClick, true);
      canvas.removeEventListener('touchstart', blockClick, true);
      canvas.removeEventListener('touchend', blockClick, true);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
