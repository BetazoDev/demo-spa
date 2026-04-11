'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
    salonName?: string;
    tagline?: string;
    logoUrl?: string; // New prop for branding
    onFinish: () => void;
}

export default function SplashScreen({
    salonName = "Serenity Spa",
    tagline = 'Tu momento de bienestar',
    logoUrl,
    onFinish
}: SplashScreenProps) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onFinish, 400);
        }, 2200);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400"
            style={{
                background: 'var(--cream)',
                opacity: show ? 1 : 0,
                pointerEvents: show ? 'auto' : 'none',
            }}
        >
            {/* Branding Logo or Brush icon */}
            <div className="mb-8 animate-scale-in" style={{ animationDuration: '0.6s' }}>
                {/* Spa leaf / wellness icon fallback */}
            {logoUrl ? (
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-soft border-4 border-white">
                        <img src={logoUrl} alt={salonName} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="28" fill="var(--pink-pale)" />
                        <path d="M28 12 C28 12 14 22 14 34 C14 41.7 20.3 48 28 48 C35.7 48 42 41.7 42 34 C42 22 28 12 28 12Z" fill="var(--pink)" opacity="0.8" />
                        <path d="M28 20 C28 20 20 28 20 36 C20 40.4 23.6 44 28 44" fill="var(--coral)" opacity="0.5" />
                        <line x1="28" y1="48" x2="28" y2="36" stroke="var(--charcoal-light)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                )}
            </div>

            {/* Salon name */}
            <h1
                className="font-serif text-charcoal text-3xl font-normal mb-2 animate-fade-in-up"
                style={{ animationDelay: '0.2s', letterSpacing: '-0.5px' }}
            >
                {salonName}
            </h1>

            {/* Tagline */}
            <p
                className="italic text-nf-gray text-base animate-fade-in-up text-center px-8"
                style={{ animationDelay: '0.35s', fontFamily: 'Georgia, var(--font-serif)' }}
            >
                {tagline}
            </p>

            {/* Loading bar */}
            <div
                className="loading-bar-track mt-16 animate-fade-in"
                style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
            >
                <div className="loading-bar-fill" style={{ animationDelay: '0.6s' }} />
            </div>
            <p
                className="text-[10px] tracking-[0.2em] text-gray-light mt-3 animate-fade-in uppercase"
                style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
            >
                loading
            </p>
        </div>
    );
}

