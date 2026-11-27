# BACKEND — Arquitectura de datos de KM0 LAB

> Decisión de arquitectura del backend de la app y su modelo de datos.
> Cerrado con el equipo 2026. El código vive en el repo hermano
> **`KM0Lab-git-admin/km0lab-api`** (FastAPI + MySQL).

## 1. Dos backends, dos dominios

La app (`apps/km0lab`) consume **dos** backends, separados por dominio:

| Backend          | Repo           | Rol                                                                          | Acceso              |
| ---------------- | -------------- | ---------------------------------------------------------------------------- | ------------------- |
| **events-query** | `events-query` | Eventos y noticias del municipio (scraping → API).                           | Solo lectura        |
| **km0lab-api**   | `km0lab-api`   | Dominio de la app: usuarios y (a futuro) puntos, comercios, QR, recompensas. | Lectura y escritura |

Por qué separados: events-query es un servicio especializado de scraping;
meterle usuarios/puntos lo desnaturalizaría. Son ciclos de vida y
responsabilidades distintas. Coherente con la frontera del proyecto.

Los **textos e idiomas (i18n)** NO están en ningún backend: viven en la
app (`km0lab`, `lib/i18n.ts`). El backend solo persiste datos.

## 2. Stack de km0lab-api (decisiones cerradas)

- **FastAPI** (el equipo ya lo conoce por events-query).
- **MySQL 8** (consistencia con events-query), vía SQLAlchemy 2.0 async
  - aiomysql.
- **Alembic** para migraciones (la BD puede crecer).
- **Auth: OTP por email** + JWT (sin Twilio/SMS por ahora).
- **Hosting**: Railway (donde ya está events-query).

## 3. Alcance actual (MVP) vs. visión

> **Nota de estado (actualizado):** esta sección describía el MVP inicial
> (solo usuarios + auth). El backend ha avanzado bastante desde entonces: en
> **v0.2** ya tiene implementado casi todo el dominio (18 tablas, ~24
> migraciones). La fuente de verdad del estado real es
> [`km0lab-api/README.md`](https://github.com/KM0Lab-git-admin/km0lab-api).

**Estado actual (implementado en km0lab-api, v0.2):**

- **Identidad/perfil**: `users`, `otp_codes`, `towns`, `town_postal_codes`,
  `town_media`. ✅
- **Comercios**: `shops`, `shop_categories`, `shop_media`, `shop_payments`,
  `promotions`. ✅
- **Catálogo**: `point_actions`, `rewards`, `reward_shops`, `reward_media`. ✅
- **Gamificación / QR / canjes**: `points_transactions` (libro mayor de
  puntos), `qr_scans`, `redemptions`, `redemption_events`. ✅

Lo que sigue mockeado en la app es solo lo que aún no se ha conectado en el
frontend, no lo que falta en el backend.

### Tabla `users` (MVP)

| Campo                       | Tipo        | Notas                                       |
| --------------------------- | ----------- | ------------------------------------------- |
| `id`                        | string(32)  | UUID hex, PK                                |
| `email`                     | string(255) | único, índice                               |
| `name`                      | string(120) | nullable                                    |
| `lang`                      | string(5)   | `ca`\|`es`\|`en`, default `ca`              |
| `postal_code`               | string(10)  | nullable                                    |
| `town`                      | string(120) | nullable                                    |
| `points`                    | int         | saldo; el registro siembra 100 (bienvenida) |
| `created_at` / `updated_at` | datetime    |                                             |

`otp_codes` (auxiliar de auth): email, hash del código (nunca en claro),
expiración (TTL 10 min), consumido.

## 4. Autenticación (OTP por email)

1. `POST /api/v1/auth/request-otp { email }` → genera código de 6
   dígitos, lo guarda hasheado, lo envía por email.
2. `POST /api/v1/auth/verify-otp { email, code }` → valida; si el usuario
   no existe lo crea con **100 puntos de bienvenida**; devuelve
   `{ access_token (JWT), user }`.
3. El frontend guarda el JWT y lo envía como `Authorization: Bearer` en
   las rutas protegidas (`GET/PATCH /api/v1/users/me`).

Registro = primer login (passwordless). Coincide con el flujo
`signInWithOtp` que ya tenía la Login del prototipo.

## 5. Cómo lo consume la app

Igual que events-query: una **capa de services** en la app
(`services/`), con un cliente que valida las respuestas con zod y añade
el header `Authorization`. Base URL por variable de entorno
(`VITE_KM0LAB_API_URL`). El JWT se guarda en el store (Zustand) que hoy
sostiene la sesión mock — al conectar, ese store pasa a llenarse con
datos reales sin cambiar las pantallas (la frontera de KNOWLEDGE.md §0).

## 6. Pendiente

Los módulos de backend (puntos/ledger, comercios, escaneo QR con anti-fraude,
recompensas y canjes) **ya están implementados** en km0lab-api v0.2. Lo que
queda es sobre todo de frontend y operación:

- El **escáner de QR** en la app (acceso a cámara vía Capacitor) conectado al
  endpoint `POST /api/v1/scans` que valida el QR y suma puntos. Es el núcleo
  del piloto.
- Conectar en la app el resto de dominios reales (hoy parte sigue mock).
- Proveedor SMTP/Resend real para los OTP en producción.
- Despliegue en Railway con `alembic upgrade head` en el arranque.
