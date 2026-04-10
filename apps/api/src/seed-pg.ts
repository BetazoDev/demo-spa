import { query } from './lib/db';
import { initDb } from './init-db';

const TENANT_ID = 'demo-tenant';

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

async function seed() {
    const dbUrl = process.env.DATABASE_URL || 'UNDEFINED';
    console.log('🌱 Seeding Postgres for tenant:', TENANT_ID);
    console.log('🔗 Connection URL present:', dbUrl !== 'UNDEFINED');
    if (dbUrl !== 'UNDEFINED') {
        console.log('📍 Connection string starts with:', dbUrl.substring(0, 20) + '...');
    }

    try {
        // 0. Initialize Database Schema
        console.log('🏗️ Initializing database schema...');
        await initDb();
        console.log('✅ Schema ready.');

        // 1. Clear existing data (if any) - Optional: only for demo tenant
        await query('DELETE FROM appointments WHERE tenant_id = $1', [TENANT_ID]);
        await query('DELETE FROM staff WHERE tenant_id = $1', [TENANT_ID]);
        await query('DELETE FROM services WHERE tenant_id = $1', [TENANT_ID]);

        // 2. Insert Services
        console.log('Inserting services...');
        for (const s of services) {
            await query(`
                INSERT INTO services (id, tenant_id, name, description, duration_minutes, estimated_price, required_advance, category)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    duration_minutes = EXCLUDED.duration_minutes,
                    estimated_price = EXCLUDED.estimated_price,
                    required_advance = EXCLUDED.required_advance,
                    category = EXCLUDED.category
            `, [s.id, TENANT_ID, s.name, s.description, s.duration_minutes, s.estimated_price, s.required_advance, s.category]);
        }

        // 3. Insert Staff
        console.log('Inserting staff...');
        for (const s of staffList) {
            await query(`
                INSERT INTO staff (id, tenant_id, name, email, role, photo_url, bio, active, color_identifier, services_offered)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    photo_url = EXCLUDED.photo_url,
                    bio = EXCLUDED.bio,
                    active = EXCLUDED.active,
                    color_identifier = EXCLUDED.color_identifier,
                    services_offered = EXCLUDED.services_offered
            `, [s.id, TENANT_ID, s.name, s.email, s.role, s.photo_url, s.bio, s.active, s.color_identifier, s.services_offered]);
        }

        console.log('✅ Seed successful! Spa Demo is ready with 6 services and 2 staff members.');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
    process.exit(0);
}

seed();
