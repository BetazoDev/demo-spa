import { api } from '@/lib/api';
import BookingWidget from '@/components/booking/BookingWidget';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Determine domain from headers or use default
  const headersList = headers();
  const host = headersList.get('host') || 'spa-demo.diabolicalservices.tech';
  let domain = host.split(':')[0];

  if (domain.includes('localhost') || domain.includes('127.0.0.1') || domain === 'demo.diabolicalservices.tech') {
    domain = 'spa-demo.diabolicalservices.tech';
  }

  const tenant = await api.getTenant(domain);

  // Robust staff fetching
  let allStaff = await api.getStaff(domain).catch(() => []);

  // If no staff found for specific domain, try spa-demo fallback
  if (allStaff.length === 0 && domain !== 'spa-demo.diabolicalservices.tech') {
    allStaff = await api.getStaff('spa-demo.diabolicalservices.tech').catch(() => []);
  }

  if (!tenant) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Tenant no encontrado</h1>
        <p>Dominio intentado: {domain}</p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://spa-demo-back.diabolicalservices.tech'}</p>
        <a href="/login" className="text-jade underline mt-4 block">Ir al Login</a>
      </div>
    );
  }

  // Find director or fallback to any staff
  const director = allStaff.find(s => s.role === 'direccion');
  const owner = director || 
    allStaff.find(s => s.role === 'owner') ||
    allStaff.find(s => s.role === 'staff') ||
    allStaff.find(s => s.active) ||
    allStaff[0];

  // If a director with a slug is found, redirect to their specific booking page
  if (director?.slug) {
    redirect(`/book/${director.slug}`);
  }

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

