import { api } from '@/lib/api';
import BookingWidget from '@/components/booking/BookingWidget';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Determine domain from headers or use default
  const headersList = headers();
  // Get domain with multiple fallbacks
  const hostHeader = headersList.get('host');
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || hostHeader || 'spa-demo.diabolicalservices.tech';
  let domain = host.split(':')[0];

  // Map to the canonical demo domain
  if (domain.includes('localhost') || 
      domain.includes('127.0.0.1') || 
      domain.includes('diabolicalservices.tech')) {
    domain = 'spa-demo.diabolicalservices.tech';
  }

  console.log(`[RootPage] Resolving for domain: ${domain} (Original host: ${host})`);

  // Fetch tenant and staff in parallel
  const [tenant, allStaffRaw] = await Promise.all([
    api.getTenant(domain),
    api.getStaff(domain).catch(() => [])
  ]);

  let allStaff = allStaffRaw;

  // CRITICAL FALLBACK: If no staff found, try once more with the hardcoded primary domain
  if (allStaff.length === 0 && domain !== 'spa-demo.diabolicalservices.tech') {
    allStaff = await api.getStaff('spa-demo.diabolicalservices.tech').catch(() => []);
  }

  // SECOND FALLBACK: If still empty, try "demo.diabolicalservices.tech" (the old one) just in case
  if (allStaff.length === 0) {
    allStaff = await api.getStaff('demo.diabolicalservices.tech').catch(() => []);
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

  // Selection logic for the main landing page
  const director = allStaff.find(s => s.role === 'direccion');
  const owner = director || 
    allStaff.find(s => s.role === 'owner') ||
    allStaff.find(s => s.role === 'staff') ||
    allStaff.find(s => s.active) ||
    allStaff[0];

  // Note: We are NOT redirecting here to ensure the RootPage renders correctly.
  // The director's info will be passed to the widget.

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

