# Pruebas de KM0 LAB

Qué se prueba, cuándo y contra qué.

## La idea: dos tramos

El trabajo diario se hace casi siempre directamente en `develop`, y
`develop` publica en UAT. Las pruebas no deben frenar eso.

| Tramo      | Dónde corre          | Qué corre                                      | Cuánto tarda | Si falla         |
| ---------- | -------------------- | ---------------------------------------------- | ------------ | ---------------- |
| **Rápido** | Tu máquina, al subir | Formato, estilo, tipos y pruebas sin navegador | Segundos     | No se sube       |
| **Lento**  | GitHub, ya en UAT    | Recorridos de vecino con navegador, contra UAT | 3-5 minutos  | Avisa por correo |

**En local nunca es obligatorio abrir el navegador ni arrancar servidores.**
Los recorridos completos se pueden lanzar a mano (`pnpm e2e`) cuando el
cambio es grande; no forman parte de publicar.

La consecuencia, asumida: un fallo que solo ve el navegador se detecta
unos minutos **después** de publicarse en UAT. UAT es el entorno de
pruebas; la barrera de verdad es el paso a producción.

## Tramo rápido (en tu máquina)

Corre solo, por los ganchos de git (`lefthook.yml`):

| Momento              | Qué                                      |
| -------------------- | ---------------------------------------- |
| Al guardar un commit | Formato y estilo de los ficheros tocados |
| Al subir             | Tipos de todo el proyecto y `pnpm test`  |

`pnpm test` son las pruebas de `packages/app/tests`: la lógica que habla
con el servidor (escaneo, canje, perfil, código postal, sesión, textos),
con un servidor de mentira. Comprueban a la vez qué manda la app y si
entiende lo que recibe. Menos de un segundo.

En `km0lab-api` el equivalente es `pytest` (unos 15 segundos), que se lanza
solo al subir `develop` o `main`.

## Tramo lento (en GitHub)

`.github/workflows/e2e.yml`, los recorridos de `packages/e2e`:

| Cuándo                 | Qué hace                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Al subir `develop`     | Espera a que UAT sirva el commit nuevo y recorre la app publicada |
| Cada cuatro horas      | Lo mismo, por si cambia un servidor o un dato y no la app         |
| Solicitud hacia `main` | Recorre lo que va a entrar en producción, contra la API de UAT    |
| A mano                 | Contra UAT o contra producción                                    |

Un robot abre la app en un navegador con tamaño de móvil y hace lo que
haría un vecino: registrarse, escanear, canjear, invitar. Compara lo que
dice la pantalla con lo que hay en el servidor, así que es también la
prueba del contrato entre la app y la API con datos reales.

En `km0lab-api`, `.github/workflows/tests.yml` repite `pytest` y añade las
migraciones desde cero y los flujos de puntos sobre MySQL.

## Dónde escriben las pruebas

Hay una sola base de datos por entorno. Las pruebas que escriben lo hacen
en un **territorio de pruebas** dentro de ella, que se puede borrar entero.

| Territorio   | Código postal            | Las pruebas…                           |
| ------------ | ------------------------ | -------------------------------------- |
| Real         | 08380 y los que se creen | solo leen, sin sesión                  |
| Demostración | 00000 «Demo KM0»         | entran y miran; no canjean ni escanean |
| **Pruebas**  | 99999 «[QA] QA KM0»      | escriben todo lo que haga falta        |

Un dato de prueba cuelga del municipio 9999x o de una cuenta
`qa+…@km0lab.com`, está marcado como falso y su nombre empieza por `[QA]`.
Usa las mismas tablas que los datos reales: lo que cambia es la marca. Se
siembra y se borra con guiones de `km0lab-api` (su
`docs/QA-TERRITORY.md`). **En producción no existe**: ni el municipio, ni
las cuentas, ni el código fijo.

## Paso a producción

1. UAT en verde: el último «Recorridos» de `develop` ha pasado.
2. La lista manual de móvil (abajo).
3. Solicitud de `develop` hacia `main`. Ahí sí corren los recorridos
   **antes** de fusionar, y la decide una persona.
4. Ya en producción: «Recorridos» a mano contra `production`. Solo las
   pruebas de lectura; en producción no se escribe nunca.

## Cambios en la base de datos

Es el único caso en que conviene probar antes en local, porque no tiene
marcha atrás fácil. La API aplica sola las migraciones al arrancar.

- **Solo añadir.** Una migración añade tablas o columnas; no borra ni
  renombra en el mismo paso.
- **Ensayarla sobre una copia.** Traer los datos de UAT a local
  (`pull_from_railway.py`, que solo lee), aplicar la migración y lanzar
  `python -m scripts.check_flows_mysql` y `pnpm e2e`.
- **Copia de seguridad antes** de publicarla.

## Si algo falla después de publicar

| Qué falló             | Cómo se vuelve atrás                            |
| --------------------- | ----------------------------------------------- |
| La app                | Vercel: volver al despliegue anterior           |
| La API, sin migración | Railway: volver a desplegar la versión anterior |
| La API, con migración | No hay marcha atrás fácil: de ahí lo de arriba  |

## Lista manual (lo que un robot no puede)

Antes de pasar a producción y cuando cambie algo de esto:

- [ ] **Cámara**: escanear el QR de un comercio en un móvil real.
- [ ] **Correo**: pedir el código con una cuenta real y que llegue.
- [ ] **Móvil real**: zonas seguras arriba y abajo, teclado sobre los
      formularios, compartir por WhatsApp.
- [ ] **Android instalado**: abrir un enlace de invitación y uno de escaneo.

## Comandos

```bash
pnpm test            # pruebas rápidas (las que corren solas al subir)
pnpm e2e             # recorridos con navegador, contra tu entorno local
pnpm e2e:lectura     # solo los que no escriben
E2E_TARGET=uat pnpm e2e    # recorridos contra UAT, desde tu máquina
```

Los recorridos en local necesitan la app, `km0lab-api` y `events-query`
arrancados y el territorio sembrado (`python -m scripts.seed_qa`). Detalle
en [`packages/e2e/README.md`](../packages/e2e/README.md).

## Configuración

| Dónde                        | Qué                                           |
| ---------------------------- | --------------------------------------------- |
| Railway, servicio API de UAT | Variable `QA_TOKEN` (valor largo y aleatorio) |
| GitHub, repositorio `km0lab` | Secreto `E2E_QA_TOKEN` con el mismo valor     |

Es la clave del robot. Sin ella los recorridos de GitHub corren en modo
solo lectura.
