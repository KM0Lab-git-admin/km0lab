# Recorridos de vecino (`@km0lab/e2e`)

Un robot abre la app en un navegador con tamaño de móvil y hace lo que
haría un vecino: elegir idioma, registrarse, escanear, canjear, invitar.
Las mismas pruebas corren en local, en UAT y en producción.

La visión completa (qué se prueba en cada momento y por qué) está en
[`docs/TESTING.md`](../../docs/TESTING.md).

## Uso

```bash
pnpm e2e                 # todos, contra tu app y tu API locales
pnpm e2e:lectura         # solo los que no escriben
pnpm --filter @km0lab/e2e test:ui    # con la interfaz de Playwright
pnpm --filter @km0lab/e2e report     # abre el último informe
```

En local hacen falta la app (`pnpm dev`), `km0lab-api`, `events-query` y el
territorio de pruebas sembrado una vez:

```bash
# en km0lab-api
python -m scripts.seed_qa
```

Contra otro entorno:

```bash
E2E_TARGET=uat pnpm e2e                  # app y API de UAT
E2E_TARGET=production pnpm e2e           # producción: solo lectura
E2E_TARGET=uat E2E_BASE_URL=http://localhost:4173 pnpm e2e   # tu compilado contra la API de UAT
```

| Variable               | Para qué                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `E2E_TARGET`           | `local` (por defecto), `uat` o `production`                |
| `E2E_BASE_URL`         | Dirección de la app, si no es la del entorno               |
| `E2E_API_URL`          | Dirección de `km0lab-api`, si no es la del entorno         |
| `E2E_EVENTS_URL`       | Dirección de `events-query`, si no es la del entorno       |
| `E2E_QA_TOKEN`         | Clave del robot: prepara el territorio y evita los límites |
| `E2E_REAL_POSTAL_CODE` | Municipio real que se mira sin escribir (`08380`)          |

## Dónde escribe y dónde no

| Etiqueta   | Qué hace                                               | Dónde corre             |
| ---------- | ------------------------------------------------------ | ----------------------- |
| `@lectura` | No escribe nada. Municipio real, sin sesión            | Local, UAT y producción |
| `@qa`      | Escribe, solo en el territorio de pruebas (CP `99999`) | Local y UAT             |
| `@demo`    | Entra con la cuenta de demostración y mira             | Local y UAT             |

Cada prueba que escribe crea sus propios vecinos
(`qa+r<ejecución>-<nombre>@km0lab.com`), así que dos ejecuciones a la vez
no se pisan. Se borran con `python -m scripts.purge_qa --apply` en
`km0lab-api`, o solos cuando el robot tiene `E2E_QA_TOKEN`. El detalle del
territorio está en `km0lab-api/docs/QA-TERRITORY.md`.

## Los recorridos

| Fichero               | Qué comprueba                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `00-salud`            | Los tres servicios responden y es la versión esperada                                                      |
| `01-entrada`          | Idioma (ca/es/en), bienvenida, código postal válido, desconocido y sin conexión                            |
| `02-visitante`        | Home, Agenda, Noticias, Comercios y Premios de un municipio real, comparados con lo que hay en el servidor |
| `03-alta`             | Un vecino nuevo se registra y recibe su bienvenida; no se repite al volver a entrar                        |
| `04-acceso-y-cuenta`  | Código equivocado, acceso, zonas privadas, cerrar sesión; el saldo es el mismo en todas las pantallas      |
| `06-canjes`           | Vale (con código), producto (sin código), sin saldo y sin existencias                                      |
| `09-escaneo`          | Suma una sola vez; repetir y un QR falso se explican                                                       |
| `10-invitacion`       | Uno copia su enlace, otro se registra con él en otro móvil, y el primero cobra                             |
| `11-negocio-y-perfil` | Alta de negocio; guardar el perfil y volver a verlo                                                        |
| `13-demostracion`     | La cuenta de demostración entra y ve su cuenta                                                             |

## Cómo se escriben

- **Los pasos de vecino viven en `support/app.ts`** (`start`, `login`,
  `redeem`, `scan`…). Un recorrido se lee como una lista de pasos; si una
  pantalla cambia, se arregla ahí.
- **Los controles se buscan por su nombre**, tomado del diccionario de la
  app: `app.button('rewards.cta.redeem')`, no «el tercer botón». Un
  rediseño de Lovable no rompe las pruebas; un botón sin nombre para
  lectores de pantalla, sí.
- **Lo que dice la pantalla se compara con el servidor** (`support/api.ts`):
  el saldo que enseña Home es el que tiene la API, no «un número».
- **Un fallo conocido se marca con `test.fail(...)`** y su explicación. El
  día que se arregla, la prueba avisa de que ya pasa.

## Lo que no cubren

La cámara del escáner (se prueba lo que hace al leer un QR: abrir su
enlace), la app instalada en Android y que el correo con el código llegue
de verdad. Para eso está la lista manual de `docs/TESTING.md`.
