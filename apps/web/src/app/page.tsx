import { api } from '@/lib/api';
import BookingWidget from '@/components/booking/BookingWidget';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Determine domain from headers or use default
  const headersList = headers();
  const hostHeader = headersList.get('host') || 'spa-demo.diabolicalservices.tech';
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || hostHeader;

  let domain = host.split(':')[0];

  // Robust mapping for demo environment
  // If we are on localhost, or in a domain that identifies as spa-demo, 
  // or if the domain is an internal docker host (no dots), we force the canonical demo domain.
  if (
    domain.includes('localhost') ||
    domain.includes('127.0.0.1') ||
    domain.includes('spa-demo') ||
    !domain.includes('.') // Internal Docker host fallback
  ) {
    domain = 'spa-demo.diabolicalservices.tech';
  }

  const [tenant, allStaff] = await Promise.all([
    api.getTenant(domain),
    api.getStaff(domain).catch(() => [])
  ]);

  if (!tenant) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Tenant no encontrado</h1>
        <p>Dominio intentado: {domain}</p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://spa-demo-back.diabolicalservices.tech'}</p>
      </div>
    );
  }

  // Find director or fallback to any staff
  const director = allStaff.find(s => s.role === 'owner');
  const owner = director ||
    allStaff.find(s => s.role === 'owner') ||
    allStaff.find(s => s.role === 'staff') ||
    allStaff.find(s => s.active) ||
    allStaff[0];

  if (!owner) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-serif text-charcoal mb-4">No hay especialistas disponibles</h1>
        <p className="text-nf-gray mb-8">Por favor, configura tu personal en el panel de administración.</p>
        <a href="/login" className="text-jade underline">Ir al Panel</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-jade-pale selection:text-charcoal relative">
      <BookingWidget
        tenant={tenant}
        staffId={owner?.id}
        staffName={owner?.name}
        staffPhoto={owner?.photo_url}
        skipSplash={false}
      />
    </div>
  );
}

