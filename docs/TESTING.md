# Pruebas de KM0 LAB

Qué se prueba, cuándo y contra qué. La pregunta que contesta:
**«¿puedo subir esto, y cómo sé que ha ido bien?»**

## El contexto que lo condiciona

- El piloto se hace en **UAT**, con vecinos reales.
- Hay **una sola base de datos** por entorno. No existe una «de pruebas».
- Después de UAT hay un **paso a producción**, que decide una persona.

Por eso las pruebas que escriben lo hacen en un **territorio de pruebas**
dentro de la misma base de datos, que se puede borrar entero.

## Tres territorios

| Territorio   | Código postal            | Las pruebas…                           |
| ------------ | ------------------------ | -------------------------------------- |
| Real         | 08380 y los que se creen | solo leen, sin sesión                  |
| Demostración | 00000 «Demo KM0»         | entran y miran; no canjean ni escanean |
| **Pruebas**  | 99999 «[QA] QA KM0»      | escriben todo lo que haga falta        |

Un dato de prueba se reconoce porque cuelga del municipio 9999x o de una
cuenta `qa+…@km0lab.com`, es `is_fake` y su nombre empieza por `[QA]`. Se
siembra y se borra con guiones de `km0lab-api`
(`docs/QA-TERRITORY.md` de aquel repositorio). **En producción no existe**:
ni el municipio, ni las cuentas, ni el código fijo.

## Qué hay

| Red                          | Dónde                          | Qué atrapa                                           |
| ---------------------------- | ------------------------------ | ---------------------------------------------------- |
| Tipos, estilo y formato      | `pnpm validate`                | Código incoherente                                   |
| Ensayo del porte             | `pnpm sync:check`              | Que traer lo último de Lovable rompa producción      |
| **Recorridos de vecino**     | `pnpm e2e` (`packages/e2e`)    | Que un vecino no pueda hacer lo que la app promete   |
| Pruebas de la API            | `pytest` en `km0lab-api`       | Reglas de negocio                                    |
| Flujos de la API sobre MySQL | `scripts/check_flows_mysql.py` | Claves foráneas, peticiones simultáneas, migraciones |

Los recorridos comparan lo que dice la pantalla con lo que hay en el
servidor, así que son también la prueba del **contrato** entre la app y la
API con datos reales: si el backoffice da de alta algo que la app no sabe
leer, el recorrido de visitante lo dice.

## Cuándo corre cada cosa

### En tu máquina, antes de subir

| Si tocas…           | Ejecuta                                                          |
| ------------------- | ---------------------------------------------------------------- |
| La app              | `pnpm validate` y `pnpm e2e` (con app, API y eventos arrancados) |
| Un porte de Lovable | `pnpm sync:check`, `pnpm sync:lovable`, y lo anterior            |
| `km0lab-api`        | `pytest`, `python -m scripts.check_flows_mysql` y `pnpm e2e`     |
| La base de datos    | Además: ensayo de migración (abajo)                              |

### Al proponer un cambio (pull request)

| Repositorio  | Qué corre solo                                                          |
| ------------ | ----------------------------------------------------------------------- |
| `km0lab`     | `validate` + **recorridos con la rama compilada, contra la API de UAT** |
| `km0lab-api` | `pytest` + migraciones desde cero sobre MySQL 8 + flujos                |

El cambio de la app se prueba contra UAT **antes** de publicarse: la rama
se sirve dentro de la máquina de GitHub y habla con la API de UAT. Si
falla, no se fusiona y los vecinos no ven nada.

### Al entrar en `develop` (se despliega UAT)

`Recorridos` espera a que UAT sirva el commit nuevo (`/version.json`) y
recorre la app desplegada. Si falla, GitHub avisa por correo con captura,
vídeo y traza del paso.

### Cada cuatro horas

Los mismos recorridos contra UAT. Para enterarse de un fallo aunque nadie
haya desplegado la app: un despliegue de la API o de eventos, un dato
nuevo del backoffice.

### Paso a producción

1. UAT en verde: el último `Recorridos` de `develop` ha pasado.
2. La lista manual de móvil (abajo).
3. Una persona fusiona `develop` en `main`.
4. `Recorridos` a mano contra `production`: solo las pruebas de lectura
   (`@lectura`). En producción no se escribe nunca.

## Cambios en la base de datos

La API aplica sola las migraciones al arrancar. Con vecinos dentro:

- **Solo añadir.** Durante el piloto una migración añade tablas o
  columnas; no borra ni renombra en el mismo paso.
- **Ensayarla sobre una copia.** Antes de subir: traer los datos de UAT a
  local (`pull_from_railway.py`, que solo lee), aplicar la migración y
  ejecutar `check_flows_mysql` y `pnpm e2e`.
- **Copia de seguridad antes** de desplegar una migración.

## Si algo falla después de desplegar

| Qué falló             | Cómo se vuelve atrás                              |
| --------------------- | ------------------------------------------------- |
| La app                | Vercel: volver al despliegue anterior             |
| La API, sin migración | Railway: volver a desplegar la versión anterior   |
| La API, con migración | No hay marcha atrás fácil: de ahí las tres normas |

Durante el piloto un fallo en UAT no es una catástrofe, pero lo ven
vecinos: se arregla o se deshace el mismo día.

## Lista manual (lo que un robot no puede)

Antes de pasar a producción y cuando cambie algo de esto:

- [ ] **Cámara**: escanear el QR de un comercio en un móvil real.
- [ ] **Correo**: pedir el código con una cuenta real y que llegue.
- [ ] **Móvil real**: zonas seguras arriba y abajo, teclado sobre los
      formularios, compartir por WhatsApp.
- [ ] **Android instalado**: abrir un enlace de invitación y uno de escaneo.

## Configuración que necesita

| Dónde                        | Qué                                           |
| ---------------------------- | --------------------------------------------- |
| Railway, servicio API de UAT | Variable `QA_TOKEN` (valor largo y aleatorio) |
| GitHub, repositorio `km0lab` | Secreto `E2E_QA_TOKEN` con el mismo valor     |

Sin ellos los recorridos de GitHub corren en modo solo lectura.
