'use client';

import { BookingData } from '@/lib/types';

interface SummaryStepProps {
    booking: BookingData;
    onNext: () => void;
    onBack: () => void;
}

function formatFullDate(dateStr: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SummaryStep({ booking, onNext, onBack }: SummaryStepProps) {
    const price = Number(booking.service_price) || 0;
    const advance = Number(booking.service_required_advance) || 0;

    const handleConfirm = () => {
        onNext();
    };

    return (
        <div className="flex flex-col h-full relative" style={{ background: 'var(--cream)' }}>
            {/* Header: Sticky at the top */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-dark/30 shadow-sm">
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                    <button onClick={onBack} className="flex items-center gap-2 text-nf-gray text-xs font-bold uppercase tracking-widest hover:text-jade transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-jade-pale transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </div>
                    </button>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-jade opacity-20" />
                        <div className="w-2 h-2 rounded-full bg-jade opacity-20" />
                        <div className="w-2 h-2 rounded-full bg-jade opacity-20" />
                        <div className="w-2 h-2 rounded-full bg-jade opacity-20" />
                        <div className="w-2 h-2 rounded-full bg-jade" />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-cream-dark opacity-30" />
                        ))}
                    </div>
                </div>

                <div className="px-6 pt-4 pb-4">
                    <p className="text-[10px] tracking-[0.2em] text-nf-gray uppercase font-bold mb-1">Paso 5: Resumen</p>
                    <h1 className="font-serif text-3xl text-charcoal leading-tight">
                        Confirma tu <span className="text-jade">cita</span>
                    </h1>
                </div>
            </div>

            {/* Scrollable content areas */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
                {/* Unified Main Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-cream-dark/30 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-jade-pale/20 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <div className="relative z-10">
                        <div className="mb-8">
                            <p className="text-[10px] font-bold text-nf-gray uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-jade-pale flex items-center justify-center text-xs">✨</span>
                                Servicios Seleccionados
                            </p>
                            <div className="space-y-3">
                                {booking.selected_services?.map((svc) => (
                                    <div key={svc.id} className="flex justify-between items-center group bg-cream/30 p-4 rounded-2xl border border-cream-dark/10">
                                        <h2 className="font-serif text-lg text-charcoal font-bold">{svc.name}</h2>
                                        <span className="text-sm font-bold text-jade">${Number(svc.estimated_price)}</span>
                                    </div>
                                )) || (
                                    <div className="bg-cream/30 p-4 rounded-2xl border border-cream-dark/10">
                                        <h2 className="font-serif text-xl text-charcoal font-bold">{booking.service_name || '—'}</h2>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 py-6 border-y border-cream-dark/30">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-nf-gray uppercase tracking-widest flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    Fecha
                                </p>
                                <span className="font-serif text-charcoal font-bold">{formatFullDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-nf-gray uppercase tracking-widest flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    Hora
                                </p>
                                <span className="font-serif text-charcoal font-bold">{booking.time || '—'} HS</span>
                            </div>
                            {booking.staff_name && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-[10px] font-bold text-nf-gray uppercase tracking-widest flex items-center gap-1.5">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        Especialista
                                    </p>
                                    <span className="text-xs font-bold text-charcoal uppercase tracking-widest">{booking.staff_name}</span>
                                </div>
                            )}
                        </div>

                        {/* Pricing details integrated inside the main card area or just below */}
                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nf-gray">Total del servicio</span>
                                <span className="font-serif text-2xl font-bold text-charcoal">${Number(booking.total_price || price).toFixed(2)}</span>
                            </div>

                            {Number(booking.total_required_advance || advance) > 0 && (
                                <div className="p-5 rounded-3xl bg-jade-pale/20 border border-jade-light/20">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-jade">Seña para reservar</span>
                                        </div>
                                        <span className="font-serif text-xl font-bold text-jade">${Number(booking.total_required_advance || advance).toFixed(2)}</span>
                                    </div>
                                    <p className="text-[9px] text-nf-gray leading-relaxed font-medium uppercase tracking-wider opacity-70">
                                        Este monto se descontará del total el día de tu cita. Pago seguro vía Mercado Pago.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA: Sticky at the bottom */}
            <div className={`sticky bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-xl border-t border-cream-dark/50 z-40 transition-all duration-500`}>
                <button
                    onClick={handleConfirm}
                    disabled={!booking.date || !booking.time || (!booking.service_id && !booking.selected_services?.length)}
                    className="w-full max-w-lg mx-auto py-5 rounded-full text-base font-serif flex items-center justify-center gap-3 shadow-lg btn-gradient text-white transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Confirmar Reserva
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
