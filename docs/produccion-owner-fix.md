# Solución: Datos del usuario owner no se muestran en producción

## Problema identificado

El repositorio funciona correctamente en entorno local pero **no muestra los datos del usuario owner** en producción (https://spa-demo.diabolicalservices.tech/).

## Diagnóstico

Tras analizar el código, se identificaron los siguientes problemas:

### 1. **Resolución de tenant por dominio en producción** (`apps/api/src/tenant.ts:4-16`)

La función `getTenantByDomain` tiene un mapeo explícito para dominios de desarrollo pero **no incluye el dominio de producción**:

```typescript
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
    let searchDomain = domain;
    if (domain.includes('localhost') || 
        domain === 'api-demo.diabolicalservices.tech' || 
        domain === 'demo.diabolicalservices.tech') {
        searchDomain = 'spa-demo.diabolicalservices.tech';
    }
    // ...
}
```

**Problema:** Cuando la petición viene desde `spa-demo.diabolicalservices.tech` en producción, el dominio NO está en la lista de redirección, por lo que busca directamente en la base de datos por ese dominio. Si el tenant en la BD tiene registrado otro dominio (ej: `demo.diabolicalservices.tech`), no lo encuentra.

### 2. **Variable de entorno `NEXT_PUBLIC_API_URL` no configurada en producción**

El archivo `apps/web/src/lib/api.ts` usa esta variable para determinar la URL del backend:

```typescript
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api'
    : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://spa-demo-back.diabolicalservices.tech') + '/api';
```

**Problema:** Si la variable no está definida en el entorno de producción de Dokploy, el fallback funciona pero puede causar problemas de CORS o de resolución de tenant.

### 3. **Middleware de resolución de tenant en el API** (`apps/api/src/index.ts:177-227`)

El middleware intenta resolver el tenant pero tiene lógica compleja que puede fallar:

```typescript
const tenantDomain = (req.headers['x-tenant-domain'] || req.query.domain || req.headers.host) as string;
```

**Problema:** En producción, el header `x-tenant-domain` puede no enviarse correctamente o el `host` header puede variar.

---

## Soluciones

### Solución 1: Actualizar `apps/api/src/tenant.ts` (RECOMENDADA)

Agregar el dominio de producción a la lista de redirección:

```typescript
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
    let searchDomain = domain;
    
    // Mapeo de dominios alternativos al dominio canonical del tenant
    if (
        domain.includes('localhost') || 
        domain === 'api-demo.diabolicalservices.tech' || 
        domain === 'demo.diabolicalservices.tech' ||
        domain === 'spa-demo.diabolicalservices.tech' ||  // ← AGREGAR ESTO
        domain === 'spa-demo-back.diabolicalservices.tech' // ← Y ESTO para el backend
    ) {
        searchDomain = 'spa-demo.diabolicalservices.tech';
    }

    const res = await query('SELECT * FROM tenants WHERE domain = $1', [searchDomain]);
    if (res.rowCount === 0) return null;

    return res.rows[0] as Tenant;
}
```

### Solución 2: Verificar datos en la base de datos

Ejecutar esta consulta en la base de datos de producción para verificar el dominio registrado:

```sql
SELECT id, domain, name, owner_id FROM tenants;
```

**Acción requerida:** Si el dominio no es `spa-demo.diabolicalservices.tech`, actualizarlo:

```sql
UPDATE tenants SET domain = 'spa-demo.diabolicalservices.tech' WHERE id = 'demo-tenant';
```

### Solución 3: Configurar variables de entorno en Dokploy

En la configuración del proyecto **web** en Dokploy, agregar:

```bash
NEXT_PUBLIC_API_URL=https://spa-demo-back.diabolicalservices.tech
```

### Solución 4: Mejorar el fallback en `apps/web/src/app/[domain]/page.tsx`

El código actual ya tiene un fallback robusto, pero se puede mejorar:

```typescript
// Línea 29-38 - Asegurar que el fallback funcione
let [tenant, allStaff] = await Promise.all([
    api.getTenant(domain),
    api.getStaff(domain).catch(() => [])
]);

// Fallback mejorado
if ((!tenant || !allStaff.length) && domain === 'spa-demo.diabolicalservices.tech') {
    // Intentar sin parámetros de dominio para usar el fallback del API
    [tenant, allStaff] = await Promise.all([
        api.getTenant('demo-tenant').catch(() => null),
        api.getStaff().catch(() => [])
    ]);
}
```

---

## Pasos para implementar en Dokploy

### 1. Actualizar el código del API

1. Hacer commit del cambio en `apps/api/src/tenant.ts`
2. Push a GitHub para触发 el deployment en Dokploy

### 2. Configurar variables de entorno en Dokploy

Para el proyecto **web**:
```
NEXT_PUBLIC_API_URL=https://spa-demo-back.diabolicalservices.tech
```

Para el proyecto **api**:
```
DATABASE_URL=<tu connection string de PostgreSQL>
```

### 3. Verificar datos en la base de datos

Conectarse a la base de datos de producción y ejecutar:

```sql
-- Verificar tenant existente
SELECT * FROM tenants;

-- Si no existe el tenant correcto, insertarlo
INSERT INTO tenants (id, domain, name, owner_id, branding, settings)
VALUES ('demo-tenant', 'spa-demo.diabolicalservices.tech', 'Demo Spa', 'demo-owner', 
        '{"tagline": "Tu spa de confianza"}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET domain = EXCLUDED.domain;
```

### 4. Forzar re-seed si es necesario

Llamar al endpoint de emergencia (solo para desarrollo/demo):

```
POST https://spa-demo-back.diabolicalservices.tech/api/admin/seed-emergency
Content-Type: application/json

{
  "secret": "spademo-reset-2026"
}
```

---

## Verificación

Después de aplicar los cambios, verificar:

1. **API health check:**
   ```
   GET https://spa-demo-back.diabolicalservices.tech/api/health
   ```

2. **Tenant resolution:**
   ```
   GET https://spa-demo-back.diabolicalservices.tech/api/tenant
   Headers: x-tenant-domain: spa-demo.diabolicalservices.tech
   ```

3. **Staff data (para verificar owner):**
   ```
   GET https://spa-demo-back.diabolicalservices.tech/api/staff
   ```

4. **Página principal:**
   ```
   https://spa-demo.diabolicalservices.tech/
   ```

---

## Resumen de archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/api/src/tenant.ts` | Agregar dominio de producción a la lista de redirección |
| Variables de entorno Dokploy | Agregar `NEXT_PUBLIC_API_URL` |
| Base de datos | Verificar/actualizar dominio del tenant |

---

## Notas adicionales

- El problema más probable es que **el dominio en la base de datos no coincide** con el dominio desde el que se hace la petición en producción
- La solución temporal es usar el endpoint `/api/admin/seed-emergency` para regenerar los datos
- Para una solución permanente, actualizar el tenant en la base de datos o modificar la lógica de resolución de dominios
