import { api } from '@/lib/api';
import BookingWidget from '@/components/booking/BookingWidget';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

interface Props {
    params: {
        staffSlug: string;
    }
}

export const dynamic = 'force-dynamic';

export default async function StaffBookingPage({ params }: Props) {
    const headersList = headers();
    let domain = headersList.get('host') || 'demo.diabolicalservices.tech';
    if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
        domain = 'demo.diabolicalservices.tech';
    }

    const tenant = await api.getTenant(domain);

    if (!tenant) {
        notFound();
    }

    // Resolve the staff member by slug
    const allStaff = await api.getStaff(domain).catch(() => []);
    
    // Helper to slugify names consistently
    const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const staffMember = allStaff.find(s => {
        const memberSlug = s.slug || slugify(s.name);
        return memberSlug === params.staffSlug;
    });

    if (!staffMember) {
        return (
            <div className="p-20 text-center bg-cream min-h-screen">
                <h1 className="text-2xl font-serif text-charcoal mb-4">Miembro no encontrado</h1>
                <p className="text-nf-gray mb-8">No pudimos encontrar al especialista "{params.staffSlug.replace(/-/g, ' ')}".</p>
                <a href="/" className="inline-block px-8 py-4 bg-jade text-white rounded-full font-serif shadow-lg">Ver todos los servicios</a>
            </div>
        );
    }

    const staffName = staffMember.name;
    const staffId = staffMember.id;
    const staffPhoto = staffMember.photo_url || undefined;

    return (
        <div className="min-h-screen bg-cream selection:bg-jade/20 selection:text-charcoal relative">
            <BookingWidget
                tenant={tenant}
                staffId={staffId}
                staffName={staffName}
                staffPhoto={staffPhoto}
                skipSplash={false}
            />
        </div>
    );
}
