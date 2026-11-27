# Invitaciones — app y nativo

## Circuito

1. Authed: `GET /invites/me/link?kind=` → URL canónica `https://app.uat.km0lab.com/i/{code}` (también en Android; **no** se comparte solo Play).
2. Invitado abre `/i/:code` → `POST /invites/resolve` → Zustand `pendingInvite` + cookie `km0_invite`.
3. OTP envía `invite_code` + `postal_code`. Last-click gana el último código **antes** de completar el registro.
4. Negocio: `POST /shops/public-signup` y OTP del `contact_email` (o activación inmediata si el residente logueado usa su mismo email).

## Matriz de plataformas

| Canal                   | Código / atribución                            | Config                                                           | Prueba                                            | Límite                                                             |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Web                     | `/i/{code}`                                    | rewrite SPA Vercel                                               | Dos cuentas + un comercio UAT                     | —                                                                  |
| Android (app instalada) | App Link `https://app.uat.km0lab.com/i/*`      | `AndroidManifest` + `assetlinks.json` + SHA-256 Play App Signing | Internal test abre `/i/code` en cold y warm start | Hay que publicar `assetlinks.json` con la huella real              |
| Android (sin app)       | Web `/i/code`; Play es fallback de instalación | —                                                                | El usuario puede instalar después                 | **Sin deferred deep linking** si entra por ficha Play sin referrer |
| iOS                     | Misma cuenta web → app cuando exista IPA       | Universal Links pendientes (no hay `ios/`)                       | Alta en web                                       | **Sin** DDL ni fingerprinting                                      |

## Play Install Referrer

No hay plugin nativo de Play Install Referrer en este build. `setupCapacitor` llama a un stub: si en el futuro un plugin registra `PlayInstallReferrer.getReferrer()`, se recupera `invite_code` / `ref` / `utm_content`. Hasta entonces, instalar desde la ficha de Play **sin** pasar por `/i/{code}` no atribuye.

## Asset Links

Fichero: `apps/km0lab/public/.well-known/assetlinks.json`

Sustituir `REPLACE_WITH_PLAY_APP_SIGNING_SHA256` por la huella SHA-256 del certificado de Play App Signing (Play Console → Integridad de la app).

## Cuentas locales

Ver [`docs/LOCAL-ACCOUNTS.md`](../km0lab-api/docs/LOCAL-ACCOUNTS.md) en `km0lab-api`:

- Demo: `admin@km0lab.com` + `123456` (pueblo 00000).
- Malgrat: `admin-malgrat@km0lab.com` + `123456` (CP 08380, usuarios reales).
- Vecinos de prueba (Gmail / Jobmail): OTP por correo.

En local, **Copiar enlace** ya genera `http://localhost:…/i/{código}` (no UAT). El invitado tiene que **abrir** esa URL en incógnito antes del OTP; un alta directa en `/login` sin código no atribuye. El código se guarda aunque el invitado pase antes por idioma/CP.

## Runbook UAT

1. Cuenta A (prescriptor) con CP del pueblo: Home → Invita → copia `/i/{code}`.
2. Incógnito / otro dispositivo: abre el enlace, elige CP del **mismo** pueblo, OTP cuenta B.
3. A ve 1 registro y +100 (o el importe de la acción) en Les meves invitacions y backoffice Invitacions.
4. Cuenta A comparte enlace de negocio; formulario público + OTP del email del comercio → +500.
5. Mismo email con shop ya activo → no elegible.
6. CP de otro pueblo → alta OK, **sin** puntos al prescriptor.

## iOS

No hay proyecto `ios/` hoy. El JS de `pendingInvite` y `/i/:code` está listo. Universal Links y deferred deep linking quedan pendientes.
