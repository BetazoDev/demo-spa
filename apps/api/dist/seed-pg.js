"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const db_1 = require("./lib/db");
const init_db_1 = require("./init-db");
const TENANT_ID = 'demo-tenant';
const services = [
    { id: 'svc-1', name: 'Masaje Relajante', duration_minutes: 60, estimated_price: 650, required_advance: 200, category: 'Masajes', description: 'Masaje de cuerpo completo con aceites aromáticos para liberar tensiones.' },
    { id: 'svc-2', name: 'Masaje de Tejido Profundo', duration_minutes: 75, estimated_price: 800, required_advance: 250, category: 'Masajes', description: 'Trabaja capas profundas del tejido muscular para aliviar tensión crónica.' },
    { id: 'svc-3', name: 'Facial Hidratante', duration_minutes: 60, estimated_price: 700, required_advance: 200, category: 'Faciales', description: 'Limpieza profunda, exfoliación e hidratación intensiva para tu piel.' },
    { id: 'svc-4', name: 'Ritual de Piedras Calientes', duration_minutes: 90, estimated_price: 950, required_advance: 300, category: 'Rituales', description: 'Combinación de masaje con piedras volcánicas calientes para máxima relajación.' },
    { id: 'svc-5', name: 'Envoltura Corporal', duration_minutes: 60, estimated_price: 750, required_advance: 250, category: 'Corporales', description: 'Tratamiento nutritivo con arcilla y aceites esenciales para tu piel.' },
];
const staffList = [
    { id: 'staff-1', name: 'Sofía Ramírez', email: 'sofia@spademo.com', role: 'staff', photo_url: 'https://i.pravatar.cc/150?u=sofia-ramirez', bio: 'Terapeuta certificada con 8 años de experiencia en bienestar holístico.', active: true, color_identifier: '#6BAE8E', services_offered: ['svc-1', 'svc-2', 'svc-4'] },
    { id: 'staff-2', name: 'Valentina Cruz', email: 'valentina@spademo.com', role: 'staff', photo_url: 'https://i.pravatar.cc/150?u=valentina-cruz', bio: 'Especialista en tratamientos faciales y rituales de bienestar.', active: true, color_identifier: '#8DB87A', services_offered: ['svc-3', 'svc-5'] },
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
        await (0, init_db_1.initDb)();
        console.log('✅ Schema ready.');
        // 1. Clear existing data for demo tenant
        console.log('Clearing existing data...');
        await (0, db_1.query)('DELETE FROM appointments WHERE tenant_id = $1', [TENANT_ID]);
        await (0, db_1.query)('DELETE FROM staff WHERE tenant_id = $1', [TENANT_ID]);
        await (0, db_1.query)('DELETE FROM services WHERE tenant_id = $1', [TENANT_ID]);
        // 2. Insert Services
        console.log('Inserting services...');
        for (const s of services) {
            await (0, db_1.query)(`
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
            await (0, db_1.query)(`
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
        // 4. Insert Admin User (role: 'direccion')
        console.log('Inserting admin user...');
        await (0, db_1.query)(`
            INSERT INTO users (id, tenant_id, email, password, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO UPDATE SET
                password = EXCLUDED.password,
                role = EXCLUDED.role
        `, ['user-1', TENANT_ID, 'admin@demo.com', 'admin123', 'direccion']);
        console.log('✅ Seed successful! Spa Demo is ready with:');
        console.log('   - 5 servicios');
        console.log('   - 2 miembros del staff');
        console.log('   - 1 usuario administrador (admin@demo.com / admin123)');
        console.log('   - Rol: direccion');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error; // Re-throw instead of process.exit
    }
}
// Only run if executed directly (not imported)
if (require.main === module) {
    seed()
        .then(() => {
        console.log('🎉 Seed completed, exiting...');
        process.exit(0);
    })
        .catch((err) => {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    });
}
