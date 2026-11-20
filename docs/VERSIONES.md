# Versiones y publicaciones

Cómo se numera el producto, cómo se publica una versión y qué protege a
las apps que ya están en los móviles.

## Tres cosas distintas

|                    | Qué es                                      | Quién lo pone          | Ejemplo                 |
| ------------------ | ------------------------------------------- | ---------------------- | ----------------------- |
| **Identidad**      | Qué código exacto está publicado            | Sale solo, de git      | `abfefa8`               |
| **Versión**        | El nombre de una publicación, para personas | El comando de publicar | `1.1.0`                 |
| **Compatibilidad** | Qué app antigua sigue aceptando el servidor | Una regla y un seguro  | «la mínima es la 1.1.0» |

`develop` cambia varias veces al día y va a UAT: eso se identifica **por
commit**, sin ceremonia. La versión con nombre se pone solo al **publicar**:
sacar app nativa o pasar a producción.

## Cómo se numera

Tres números, `1.2.0`, y una regla fija:

| Número     | Sube cuando…                                    | Ejemplo           |
| ---------- | ----------------------------------------------- | ----------------- |
| El tercero | Hay un arreglo urgente entre dos publicaciones  | `1.1.0` → `1.1.1` |
| El segundo | Sale una publicación normal, la de cada mes     | `1.1.1` → `1.2.0` |
| El primero | El servidor deja de admitir las apps anteriores | `1.9.0` → `2.0.0` |

**Una sola versión para todo el producto.** La `1.1.0` es esta app, esta
API, este backoffice y este servidor de eventos, probados juntos.

La numeración continúa desde la app de Android publicada: la `1.0.1`.

## Dónde está escrita

En el fichero **`VERSION`** de la raíz de cada repositorio. **No se edita a
mano**: lo cambia `pnpm release`.

| Pieza             | De dónde la lee                                            | Dónde se ve                      |
| ----------------- | ---------------------------------------------------------- | -------------------------------- |
| App web           | `VERSION`, al compilar (`vite.config.ts`)                  | `/version.json`, junto al commit |
| App Android       | `versionName` y número interno, que escribe `pnpm release` | Ajustes del móvil y Google Play  |
| API               | `VERSION` (`app/version.py`)                               | `/api/v1/health`                 |
| Backoffice        | `VERSION` (pendiente de enseñarla)                         | —                                |
| Agenda y noticias | `VERSION` (pendiente de enseñarla)                         | —                                |

En el código de la app: `APP_VERSION`, `APP_COMMIT` y `appVersionLabel()`
de `@km0lab/app`. Enseñarla en una pantalla (pie del perfil) es interfaz y
nace en Lovable: está pendiente como encargo.

El número interno de Android, que Google exige que suba siempre, se
calcula: `1.2.3` → `10203`.

## Publicar una versión

```bash
pnpm release                 # en qué versión estamos y qué hay sin publicar
pnpm release 1.1.0           # ENSEÑA lo que haría; no cambia nada
pnpm release 1.1.0 --apply   # lo hace
pnpm release 1.1.0 --apply --push   # y además lo sube
```

Recorre los repositorios hermanos que encuentre junto a `km0lab` (API,
backoffice, eventos). En cada uno:

1. Comprueba que está en `develop`, sin cambios a medias y al día.
2. Lanza las pruebas rápidas y los recorridos contra UAT.
3. Escribe la versión en `VERSION` (y en Android, en este repositorio).
4. Añade las notas a `CHANGELOG.md`, sacadas de los commits desde la
   etiqueta anterior: las novedades (`feat`) y los arreglos (`fix`) con su
   texto; el resto, contado.
5. Guarda un commit `chore(release): publica la 1.1.0`.
6. Pone la etiqueta `v1.1.0` en ese punto.

Las notas del producto entero quedan en `docs/versiones/1.1.0.md`.

Si cualquier comprobación falla, no cambia nada. Sin `--push` no sube
nada: imprime las órdenes para subirlo. Subir `develop` publica en UAT.

### El orden de una publicación

1. UAT en verde.
2. La lista manual de móvil (`docs/TESTING.md`).
3. `pnpm release X.Y.Z --apply --push`.
4. Compilar la app nativa desde esa etiqueta y subirla a la tienda
   (`docs/ANDROID-RELEASE.md`).
5. Cuando exista producción: solicitud de `develop` hacia `main` en cada
   repositorio.

### Un arreglo urgente

Se arregla en `develop`, se publica la web como siempre y se etiqueta
`pnpm release 1.1.1 --apply --push`. La app nativa solo se vuelve a subir
si el fallo está en la parte nativa.

## El seguro de compatibilidad

La app nativa lleva dentro una copia de la web del día en que se compiló y
se publica más o menos una vez al mes. **En los móviles hay siempre una app
más antigua que el servidor.**

### La regla

Mientras una app esté admitida, la API **añade, no quita**. Quitar o
renombrar un campo, cambiar su tipo o volver obligatorio uno opcional rompe
a la app publicada. Si hay que hacerlo: primero se añade lo nuevo, se
publica la app que lo usa, y solo después se retira lo viejo.

### La versión mínima

1. **La app dice su versión** en cada petición: cabeceras `X-App-Version`,
   `X-App-Platform` (`web`, `android`, `ios`) y `X-App-Build`.
2. **El servidor tiene una mínima admitida**: la variable `MIN_APP_VERSION`
   de la API. A una app por debajo le contesta 426 con
   `app_update_required`.
3. **La app enseña «actualiza la app»** (`UpdateRequired.tsx`) con el
   enlace a la tienda; en la web, «vuelve a cargar».

Para dejar de admitir una versión: subir `MIN_APP_VERSION` en Railway. No
hace falta publicar nada.

Límites que conviene conocer:

- Vacía (como está hoy) no se rechaza a nadie.
- Las peticiones **sin** cabecera pasan siempre: el backoffice, las
  pruebas y **las apps anteriores a la 1.1.0**, que no la envían. A esas no
  se les puede pedir que actualicen por esta vía.

### La comprobación de cada noche

`.github/workflows/compat.yml` coge la última versión etiquetada, que es la
web que lleva dentro la app publicada, la compila y lanza **sus** recorridos
contra la API de UAT de ese día. Si un cambio de la API rompe la app que ya
está en los móviles, se sabe a la mañana siguiente.

Mientras no haya ninguna etiqueta, no comprueba nada y termina en verde.

## Lo que no lleva versión

- Las maquetas de Lovable: se portan, no se publican.
- La web corporativa.
