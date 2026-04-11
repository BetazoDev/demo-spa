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

    // Helper to slugify names consistently
    const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Resolve the staff member by slug - fallback to slug if API fails
    const allStaff = await api.getStaff(domain).catch((err) => {
        console.error('[staffSlug page] API getStaff error:', err);
        return [];
    });

    const staffMember = allStaff.find(s => {
        const memberSlug = s.slug || slugify(s.name);
        return memberSlug === params.staffSlug;
    });

    // Use staff data if found, otherwise fallback to slug-based defaults
    const staffName = staffMember?.name || params.staffSlug.replace(/-/g, ' ');
    const staffId = staffMember?.id;
    const staffPhoto = staffMember?.photo_url;

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
