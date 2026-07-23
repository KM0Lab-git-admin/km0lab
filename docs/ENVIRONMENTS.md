# Entornos, dominios y despliegue — KM0 LAB

> Fuente de verdad del modelo **local → UAT → producción**, DNS,
> ramas Git y configuración en Vercel / Railway.
>
> Principio: **mínimo número de entornos**. UAT ≈ producción. Si UAT se
> rompe no es grave; tras el OK en UAT, el pase a prod no debería
> sorprender.

---

## 1. Entornos (solo tres)

| Entorno        | Qué es                                    | URL pública                    |
| -------------- | ----------------------------------------- | ------------------------------ |
| **local**      | Máquina del desarrollador (Vite / Docker) | `localhost` — no es subdominio |
| **uat**        | Único entorno de prueba desplegado        | `*.uat.km0lab.com`             |
| **production** | Público real (cuando UAT tenga el OK)     | `*.km0lab.com` (sin `.uat`)    |

No hay entorno “development” desplegado. “Development” en el día a día
= **local**.

En el monorepo app, Vite sigue usando `MODE=development|production` en
build; el **nombre de despliegue** (UAT vs prod) lo dan las URLs y las
variables (`VITE_*`), no un tercer mode obligatorio el día 1.

---

## 2. Dominios

### 2.1. Ahora (UAT + local)

| Pieza                        | Host                        | Destino típico |
| ---------------------------- | --------------------------- | -------------- |
| App KM0 LAB                  | `app.uat.km0lab.com`        | Vercel         |
| API usuarios (`km0lab-api`)  | `api.uat.km0lab.com`        | Railway        |
| API eventos (`events-query`) | `eventquery.uat.km0lab.com` | Railway        |
| Web corporativa              | _(opcional / más adelante)_ | —              |

Local:

| Pieza        | URL                                                    |
| ------------ | ------------------------------------------------------ |
| App          | `http://localhost:5173`                                |
| km0lab-api   | `http://localhost:8000`                                |
| events-query | local o la URL UAT/prod que uses en `.env.development` |

### 2.2. Producción (cuando se abra)

| Pieza           | Host                    |
| --------------- | ----------------------- |
| Web corporativa | `km0lab.com` / `www`    |
| App             | `app.km0lab.com`        |
| km0lab-api      | `api.km0lab.com`        |
| events-query    | `eventquery.km0lab.com` |

Mismo patrón que UAT: se quita el segmento `.uat`.

### 2.3. Correo (transaccional / OTP)

| Entorno | Remitente orientativo                           |
| ------- | ----------------------------------------------- |
| UAT     | Sandbox del proveedor SMTP o `…@uat.km0lab.com` |
| Prod    | `KM0 LAB <no-reply@km0lab.com>` (`SMTP_FROM`)   |

Sin `SMTP_HOST` configurado, `km0lab-api` **no envía correo**: imprime el
OTP en el log (`[DEV] OTP para …`).

---

## 3. Ramas Git → entorno

| Repo                             | Rama        | Despliegue                             |
| -------------------------------- | ----------- | -------------------------------------- |
| `km0lab`                         | `develop`   | **UAT** (app)                          |
| `km0lab`                         | `main`      | **producción** (cuando exista)         |
| `km0lab-api`                     | `develop`   | **UAT** (API usuarios)                 |
| `km0lab-api`                     | `main`      | **producción**                         |
| `events-query`                   | `develop`   | **UAT** (API eventos)                  |
| `events-query`                   | `main`      | **producción**                         |
| Lovable (`speak-spanish-easily`) | solo `main` | No despliega UAT/prod; sync → `km0lab` |

Flujo diario:

```
local (develop)
  → push a develop remoto
  → deploy automático UAT

Lovable main
  → pnpm sync:lovable (en km0lab)
  → commit en develop
  → mismo deploy UAT
```

Promoción a producción (más adelante): merge `develop` → `main` en cada
repo que despliega, con el OK previo en UAT.

---

## 4. Matriz de conexiones (quién llama a quién)

| Cliente                        | `VITE_KM0LAB_API_URL` / API usuarios | `VITE_EVENTS_API_URL` / eventos     |
| ------------------------------ | ------------------------------------ | ----------------------------------- |
| Local (`localhost:5173`)       | `http://localhost:8000`              | local, UAT o prod (según `.env`)    |
| App UAT (`app.uat.km0lab.com`) | `https://api.uat.km0lab.com`         | `https://eventquery.uat.km0lab.com` |
| App prod (`app.km0lab.com`)    | `https://api.km0lab.com`             | `https://eventquery.km0lab.com`     |

**Plan B (acordado):** UAT tiene su propio host de events-query
(`eventquery.uat…`), no reutiliza el de prod como destino fijo de la app
UAT.

---

## 5. Configuración paso a paso

Orden recomendado: **API usuarios → events-query → app Vercel → prueba E2E**.

### 5.1. DNS (`km0lab.com`)

Crear CNAME (el target exacto lo dan Vercel/Railway al añadir el dominio):

| Host (subdominio) | Tipo  | Valor                           |
| ----------------- | ----- | ------------------------------- |
| `app.uat`         | CNAME | target **Vercel**               |
| `api.uat`         | CNAME | target **Railway** km0lab-api   |
| `eventquery.uat`  | CNAME | target **Railway** events-query |

TTL bajo (p. ej. 300 s) mientras se prueba.

No hace falta tocar aún `app` / `api` / `eventquery` sin `.uat` (prod).

> Nota: históricamente `api.km0lab.com` puede apuntar al hosting web
> (Apache) de `km0lab.com`, **no** a Railway. Eso no bloquea UAT si se
> usan los hosts `*.uat.km0lab.com`.

### 5.2. Railway — `km0lab-api` (UAT)

1. Servicio online + MySQL (tablas `users`, `otp_codes`).
2. Public Networking / dominio generado `*.up.railway.app`.
3. **Custom domain:** `api.uat.km0lab.com` → completar CNAME en DNS.
4. Esperar certificado Active.
5. Verificar:
   - `https://api.uat.km0lab.com/docs`
   - `https://api.uat.km0lab.com/api/v1/health`

Variables orientativas:

```env
ENVIRONMENT=production
DB_*            # MySQL de este proyecto Railway (UAT)
JWT_SECRET      # largo, distinto del local
CORS_ORIGINS    # https://app.uat.km0lab.com,http://localhost:5173
SMTP_HOST=      # vacío = OTP en logs; luego Resend/etc.
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=KM0 LAB <no-reply@km0lab.com>
```

Tras cambiar vars: redeploy.

Auth: el usuario aparece en `users` solo tras `POST /api/v1/auth/verify-otp`
correcto. `request-otp` solo escribe en `otp_codes` (código hasheado).

### 5.3. Railway — `events-query` (UAT) — Plan B

1. Deploy desde rama **`develop`** (ideal: environment/BD UAT ≠ prod).
2. **Custom domain:** `eventquery.uat.km0lab.com` + CNAME en DNS.
3. Verificar `/docs` y `/api/v1/health`.

**CORS:** en events-query los orígenes están en código
(`events-query/app/main.py`, lista `allowed_origins`), no en una env
`CORS_ORIGINS`. Debe incluir:

- `https://app.uat.km0lab.com`
- (ya suele tener `http://localhost:5173` y previews Vercel/Lovable)

Commit en `develop` → redeploy. Sin esa línea, la Agenda en UAT fallará
por CORS aunque el DNS esté bien.

### 5.4. Vercel — app (`km0lab`)

1. **Domains:** `app.uat.km0lab.com` → CNAME que indique Vercel.
2. **Git:** este proyecto = UAT → Production Branch = **`develop`**.
3. Variables de entorno (build):

| Key                   | Valor UAT                           |
| --------------------- | ----------------------------------- |
| `VITE_KM0LAB_API_URL` | `https://api.uat.km0lab.com`        |
| `VITE_EVENTS_API_URL` | `https://eventquery.uat.km0lab.com` |

Las `VITE_*` se fijan en el **build**. Tras cambiarlas → **Redeploy**.

Más adelante: proyecto o rama `main` → `app.km0lab.com` con URLs sin
`.uat`.

### 5.5. Prueba de punta a punta (UAT)

1. Abrir `https://app.uat.km0lab.com`.
2. Login → Network: `POST …/api/v1/auth/request-otp` a **`api.uat…`** (200).
3. Sin SMTP: Deploy Logs de km0lab-api → `[DEV] OTP para …: ######`.
4. Verificar código → Home.
5. MySQL: `SELECT * FROM users;`.
6. Agenda: Network hacia **`eventquery.uat…`**, sin error CORS.

---

## 6. SMTP (Fases operativas)

1. **Fase 0 (hecha en local):** OTP por log sin SMTP.
2. **Fase 1:** Elegir proveedor (recomendado: **Resend**; alternativas
   Postmark, SendGrid, Brevo, SES).
3. **Fase 2:** Rellenar `SMTP_*` en km0lab-api (local y/o Railway UAT) y
   probar que el correo llega.
4. **Fase 3:** Domino verificado + prod (Railway `main`, DNS sin `.uat`).

Ejemplo Resend:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxx
SMTP_FROM=KM0 LAB <no-reply@km0lab.com>
```

---

## 7. Checklist resumen UAT

- [ ] DNS: `app.uat`, `api.uat`, `eventquery.uat`
- [ ] Railway km0lab-api: custom domain + `CORS_ORIGINS` + health/docs
- [ ] Railway events-query: custom domain + CORS con `app.uat` en código
- [ ] Vercel: dominio `app.uat` + `VITE_*` + deploy desde `develop`
- [ ] Flujo registro → fila en `users`
- [ ] Agenda/noticias contra `eventquery.uat`

---

## 8. Qué no hacer (simplificación)

- No crear `dev.km0lab.com` ni un tercer stack “development” remoto.
- No apuntar la app UAT a `api.km0lab.com` mientras ese host no sea la
  API Railway (riesgo de hosting Apache / SSL incorrecto).
- No promover a `main`/prod sin OK explícito en UAT.
- Lovable no es un entorno de hosting: solo `main` + sync.

---

## 9. Relación con otros docs

| Doc                               | Rol                                      |
| --------------------------------- | ---------------------------------------- |
| `docs/BACKEND.md`                 | Modelo de datos y auth OTP               |
| `docs/START-HERE-AI.md`           | Onboarding agentes / repos               |
| `AGENTS.md`                       | Reglas de agentes (actualizar si el repo |
|                                   | pasa de 2 a 3 entornos de despliegue)    |
| `events-query/docs/DEPLOYMENT.md` | Detalle deploy events-query              |
| `km0lab-api/README.md`            | Stack y vars de la API de usuarios       |

---

## 10. Decisión cerrada (resumen ejecutivo)

- **Local** = desarrollo diario.
- **`develop` → UAT** en km0lab, km0lab-api y events-query.
- **`main` → producción** cuando toque; Lovable solo `main` (sync).
- Hosts UAT: `app.uat` / `api.uat` / `eventquery.uat` bajo `km0lab.com`.
- Events en UAT = **Plan B** (subdominio propio, no solo reutilizar prod).
- UAT muy cerca de prod; validar ahí y luego cortar a prod sin sorpresas.
