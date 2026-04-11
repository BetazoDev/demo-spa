import { api } from '@/lib/api';
import BookingWidget from '@/components/booking/BookingWidget';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  // Determine domain from headers or use default
  const headersList = headers();
  let domain = headersList.get('host') || 'demo.diabolicalservices.tech';
  
  if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
    domain = 'demo.diabolicalservices.tech';
  }

  const tenant = await api.getTenant(domain);

  if (!tenant) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Tenant no encontrado</h1>
        <p>Dominio intentado: {domain}</p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://demo-spa-back.diabolicalservices.tech'}</p>
        <a href="/login" className="text-jade underline mt-4 block">Ir al Login</a>
      </div>
    );
  }

  const allStaff = await api.getStaff(domain).catch(() => []);
  
  // Prefer strictly owner, then admin, then any active staff member
  const owner = allStaff.find(s => s.role === 'owner') || 
                allStaff.find(s => s.role === 'admin') || 
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

