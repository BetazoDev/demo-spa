import admin from 'firebase-admin';

const TENANT_ID = 'demo';

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'nail-demo-35d0a' });
}
const db = admin.firestore();

const services = [
    { id: 'svc-1', name: 'Masaje Relajante', duration_minutes: 60, estimated_price: 650, required_advance: 200, category: 'Masajes', description: 'Masaje de cuerpo completo con aceites aromáticos para liberar tensiones.' },
    { id: 'svc-2', name: 'Masaje de Tejido Profundo', duration_minutes: 75, estimated_price: 800, required_advance: 250, category: 'Masajes', description: 'Trabaja capas profundas del tejido muscular para aliviar tensión crónica.' },
    { id: 'svc-3', name: 'Facial Hidratante', duration_minutes: 60, estimated_price: 700, required_advance: 200, category: 'Faciales', description: 'Limpieza profunda, exfoliación e hidratación intensiva para tu piel.' },
    { id: 'svc-4', name: 'Ritual de Piedras Calientes', duration_minutes: 90, estimated_price: 950, required_advance: 300, category: 'Rituales', description: 'Combinación de masaje con piedras volcánicas calientes para máxima relajación.' },
    { id: 'svc-5', name: 'Envoltura Corporal', duration_minutes: 60, estimated_price: 750, required_advance: 250, category: 'Corporales', description: 'Tratamiento nutritivo con arcilla y aceites esenciales para tu piel.' },
    { id: 'svc-6', name: 'Aromaterapia', duration_minutes: 45, estimated_price: 500, required_advance: 150, category: 'Masajes', description: 'Masaje suave con aceites esenciales diseñados para equilibrar mente y cuerpo.' },
];

const staffList = [
    { id: 'staff-1', name: 'Sofía Ramírez', email: 'sofia@spademo.com', role: 'owner', photo_url: 'https://i.pravatar.cc/150?u=sofia-ramirez', bio: 'Terapeuta certificada con 8 años de experiencia en bienestar holístico.', active: true, color_identifier: '#6BAE8E', services_offered: ['svc-1', 'svc-2', 'svc-4', 'svc-6'] },
    { id: 'staff-2', name: 'Valentina Cruz', email: 'valentina@spademo.com', role: 'staff', photo_url: 'https://i.pravatar.cc/150?u=valentina-cruz', bio: 'Especialista en tratamientos faciales y rituales de bienestar.', active: true, color_identifier: '#8DB87A', services_offered: ['svc-3', 'svc-5', 'svc-6'] },
];

const tenantDoc = {
    id: TENANT_ID, domain: 'demo.diabolicalservices.tech', name: 'Serenity Spa', owner_id: 'owner-demo',
    branding: { logo_url: '', primary_color: '#6BAE8E', secondary_color: '#8DB87A', tagline: 'Tu santuario de bienestar' },
    settings: { currency: 'MXN', timezone: 'America/Mexico_City' },
    subscription: { status: 'active', plan: 'pro' },
};

async function seed() {
    console.log('🌱 Seeding Firestore for tenant:', TENANT_ID);
    const batch = db.batch();
    batch.set(db.doc(`tenants/${TENANT_ID}`), tenantDoc);
    for (const svc of services) {
        batch.set(db.doc(`tenants/${TENANT_ID}/services/${svc.id}`), svc);
    }
    for (const s of staffList) {
        batch.set(db.doc(`tenants/${TENANT_ID}/staff/${s.id}`), s);
    }
    await batch.commit();
    console.log('✅ Tenant + 6 services + 2 staff written successfully!');
    console.log('🎉 Seed complete!');
    process.exit(0);
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
