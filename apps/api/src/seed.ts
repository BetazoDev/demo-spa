import * as admin from 'firebase-admin';

// NOTE: To run this script, you MUST set the GOOGLE_APPLICATION_CREDENTIALS 
// environment variable pointing to your Firebase Admin service account key JSON file.
// Example: set GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
// Then run: npx ts-node src/seed.ts

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

async function seed() {
    console.log('🌱 Starting Firebase Seeding...');

    const tenantId = 'demo-tenant-123';

    // 1. Create Tenant
    console.log('Creating Tenant...');
    await db.collection('tenants').doc(tenantId).set({
        domain: 'demo.com', // maps to localhost or demo.com
        branding: {
            logo_url: '',
            primary_color: '#6BAE8E', // Jade Spa
            secondary_color: '#8DB87A',
            tagline: 'Tu santuario de bienestar'
        },
        settings: {
            currency: 'MXN',
            timezone: 'America/Mexico_City'
        },
        owner_id: 'owner_abc',
        subscription: {
            status: 'active',
            plan: 'pro'
        }
    });

    // 2. Create Staff (Users & Availabilities merged)
    console.log('Creating Staff...');
    const staffRef = db.collection('tenants').doc(tenantId).collection('staff');

    // Default schedule for demo
    const defaultSchedule = [1, 2, 3, 4, 5].map(day => ({
        day_of_week: day,
        start_time: '09:00',
        end_time: '18:00'
    })).concat([{ day_of_week: 6, start_time: '10:00', end_time: '15:00' }]);

    const staffMembers = [
        {
            id: 'owner_abc',
            name: 'Sofía (Dueña)',
            email: 'sofia@spademo.com',
            role: 'owner',
            photo_url: '',
            bio: 'Terapeuta de spa con 8 años de experiencia en relajación holística.',
            services_offered: ['svc_1', 'svc_2', 'svc_3'],
            weekly_schedule: defaultSchedule
        },
        {
            id: 'staff_xyz',
            name: 'Valentina',
            email: 'valentina@spademo.com',
            role: 'staff',
            photo_url: '',
            bio: 'Especialista en masajes y tratamientos faciales.',
            services_offered: ['svc_2', 'svc_4'],
            weekly_schedule: defaultSchedule
        }
    ];
    for (const st of staffMembers) {
        // use set to keep consistent IDS for demo
        await staffRef.doc(st.id).set(st);
    }

    // 3. Create Services
    console.log('Creating Services...');
    const servicesRef = db.collection('tenants').doc(tenantId).collection('services');
    const services = [
        { id: 'svc_1', name: 'Masaje Relajante', duration_minutes: 60, estimated_price: 650, required_advance: 200 },
        { id: 'svc_2', name: 'Facial Hidratante', duration_minutes: 60, estimated_price: 700, required_advance: 200 },
        { id: 'svc_3', name: 'Ritual de Piedras Calientes', duration_minutes: 90, estimated_price: 950, required_advance: 300 },
        { id: 'svc_4', name: 'Masaje de Tejido Profundo', duration_minutes: 75, estimated_price: 800, required_advance: 250 },
    ];
    for (const s of services) {
        await servicesRef.doc(s.id).set(s);
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
});
