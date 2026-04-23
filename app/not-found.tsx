"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

export default function NotFound() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return
      glowRef.current.style.left = `${e.clientX}px`
      glowRef.current.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden"
      style={{ background: '#08080f', fontFamily: 'var(--font-lexend), sans-serif' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Mouse light */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed z-0"
        style={{
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, rgba(96,165,250,0.06) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.08s ease-out, top 0.08s ease-out',
          top: '50%',
          left: '50%',
        }}
      />

      {/* Static ambient glow behind image */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -68%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5">

        {/* AGZ image */}
        <div
          style={{
            filter: 'drop-shadow(0 0 40px rgba(124,58,237,0.6)) drop-shadow(0 0 12px rgba(96,165,250,0.35))',
            marginBottom: '-60px',
          }}
        >
          <Image
            src="/404/404.png"
            alt="AGZ"
            width={380}
            height={295}
            quality={100}
          />
        </div>

        {/* 404 */}
        <h1
          className="font-extrabold leading-none select-none -mt-2"
          style={{
            fontSize: 'clamp(96px, 20vw, 152px)',
            fontFamily: 'var(--font-oswald), sans-serif',
            background: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 45%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px',
          }}
        >
          404
        </h1>

        {/* Text */}
        <div className="flex flex-col items-center gap-2 -mt-1">
          <p className="font-semibold text-white text-lg">Sayfa Bulunamadı</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        {/* Button */}
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            boxShadow: '0 0 24px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          Anasayfaya Dön
        </Link>
      </div>
    </div>
  )
}
