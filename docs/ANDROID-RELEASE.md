# Publicar la app nativa (Android; iOS más adelante)

Cómo se genera y se sube la app de `apps/km0lab` (Capacitor 7).

**Hoy es un proceso manual, más o menos una vez al mes, desde un ordenador
con Android Studio.** Este documento describe ese proceso y, al final, qué
haría falta para que lo hiciera una máquina sola.

Relacionados: `docs/VERSIONES.md` (numeración y compatibilidad) y
`docs/TESTING.md` (pruebas y lista manual de móvil).

## Qué es la app nativa

La misma app web, metida dentro de una cáscara nativa que aporta la cámara,
los permisos y el icono. **Lleva dentro una copia de la web del día en que
se compiló**: no se actualiza cuando se publica en UAT. Hasta la siguiente
publicación, quien la tenga instalada ve la web de ese día.

Por eso existen la versión mínima admitida y la comprobación nocturna de
compatibilidad (`docs/VERSIONES.md`).

## Publicación mensual: los pasos

| #   | Paso                                                               | Dónde                   |
| --- | ------------------------------------------------------------------ | ----------------------- |
| 1   | UAT en verde: el último «Recorridos» de `develop` ha pasado        | GitHub, pestaña Actions |
| 2   | Lista manual de móvil                                              | `docs/TESTING.md`       |
| 3   | Poner nombre a la versión: `pnpm release 1.2.0 --apply --push`     | Tu ordenador            |
| 4   | Compilar y firmar: `apps\km0lab\scripts\release-android.ps1`       | Tu ordenador            |
| 5   | Instalar el APK en un móvil real y probarlo (abajo)                | Móvil                   |
| 6   | Subir el AAB a Google Play                                         | Consola de Google Play  |
| 7   | Cuando esa versión esté repartida, valorar subir `MIN_APP_VERSION` | Railway                 |

El paso 3 escribe la versión y el número interno de Android. El guion del
paso 4 avisa si lo que se va a compilar no coincide con la versión del
producto.

### Paso 4, en detalle

```powershell
apps\km0lab\scripts\release-android.ps1
```

Hace: compilación web de producción → `cap sync` → comprueba la versión →
`gradlew bundleRelease assembleRelease` firmado → verifica la firma e
imprime las rutas:

- AAB (para Google Play):
  `apps/km0lab/android/app/build/outputs/bundle/release/app-release.aab`
- APK (para instalar a mano):
  `apps/km0lab/android/app/build/outputs/apk/release/app-release.apk`

`-SkipBuildWeb` reutiliza el `dist/` actual. `-BumpVersion` es el modo
antiguo (sube el número interno en uno) y ya no hace falta: la versión la
pone `pnpm release`.

### Paso 5: qué probar en el móvil

```bash
adb install -r apps/km0lab/android/app/build/outputs/apk/release/app-release.apk
```

- Entrada: idioma → código postal → Home.
- Acceso con código por correo.
- **Escáner** (`/scanner`): abre la cámara nativa y lee un QR real.
- Cerrar y volver a abrir: la sesión y el municipio se mantienen.
- Zonas seguras arriba y abajo, teclado sobre los formularios, compartir.

Es lo que los recorridos automáticos no pueden probar.

### Paso 6: subir a Google Play

1. Consola → app `com.km0lab.app` → la pista que toque.
2. **Crear versión** y subir el `.aab`.
3. Como notas de la versión sirven las de `docs/versiones/<versión>.md`.
4. Enviar.

## Preparación (una vez por ordenador)

- **Android Studio** con el SDK de Android (plataforma 36).
- **JDK 21**. Si no hay `JAVA_HOME`, el guion usa el que trae Android Studio.
- Un móvil Android con depuración USB, para probar el escáner.
- **Cuenta de Google Play Console** con la app `com.km0lab.app`.

## La clave de firma (una vez por app)

La clave **no se sube al repositorio**. Si se pierde y Google no gestiona
la firma, no se puede volver a actualizar la app. **Hay que tener copia
fuera de este ordenador.**

```bash
keytool -genkey -v -keystore km0lab-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias km0lab
```

Se guarda fuera del repositorio y se declara en
`apps/km0lab/android/app/keystore.properties` (ignorado por git), copiando
de `keystore.properties.example`:

```properties
storeFile=C:\\Users\\Propietario\\.keystores\\km0lab-release.jks
storePassword=...
keyAlias=km0lab
keyPassword=...
```

Sin ese fichero las compilaciones no se firman (sirve para depurar).

## Datos del proyecto

| Dato                    | Valor                                                |
| ----------------------- | ---------------------------------------------------- |
| Identificador           | `com.km0lab.app`                                     |
| Android mínimo          | 8.0 (`minSdkVersion 26`), por el escáner             |
| Android objetivo        | `targetSdkVersion 36`                                |
| Permisos                | `INTERNET` y `CAMERA`                                |
| API a la que habla      | La de `apps/km0lab/env/.env.production` (hoy, UAT)   |
| Enlaces que abre la app | Solo `https://app.uat.km0lab.com/i/…` (invitaciones) |

## Pendiente conocido

Detalle en `Auditoria/2026-11-20-apps-nativas/AUDITORIA.md` (carpeta de
trabajo, fuera de este repositorio).

- **Los enlaces no abren la app.** `public/.well-known/assetlinks.json`
  tiene un texto de relleno en lugar de la huella real de la firma, y el
  manifiesto no declara los enlaces de escaneo (`/scan`).
- **El enlace de tienda es de «pruebas internas»**, que admite 100 personas.
- **Un solo entorno**: el dominio de UAT está escrito en el manifiesto. Con
  producción hará falta separar.
- **Las apps anteriores a la 1.1.0 no envían su versión**: no se les puede
  pedir que actualicen desde el servidor.

## Para automatizarlo (cuando se decida)

Hoy no se hace: se evita depender de más servicios y la cadencia es
mensual. Esto es lo que necesitaría un trabajo de GitHub para hacer solo
los pasos 4 y 6, lanzado al crear una etiqueta `vX.Y.Z`.

**Entradas (secretos de GitHub):**

| Secreto                                                                  | Qué es                                                                       |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`                                                | El fichero `.jks`, codificado                                                |
| `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Sus datos                                                                    |
| `PLAY_SERVICE_ACCOUNT_JSON`                                              | Acceso de máquina a Google Play (cuenta de servicio con permiso de publicar) |

**Pasos del trabajo**, que son los del guion de PowerShell en una máquina
Linux:

1. Descargar el código en la etiqueta.
2. Node 24, pnpm, JDK 21 y el SDK de Android (ya vienen en la máquina).
3. `pnpm install --frozen-lockfile`.
4. `pnpm --filter km0lab cap:build:android` (web + `cap sync`).
5. Escribir `keystore.properties` a partir de los secretos.
6. `./gradlew bundleRelease` en `apps/km0lab/android`.
7. Subir el `.aab` a la pista elegida con la API de Google Play.
8. Guardar el `.aab` y el `.apk` como adjuntos de la ejecución.

**Lo que ya está listo para ese día:**

- La versión y el número interno salen de `VERSION` y los escribe
  `pnpm release`: el trabajo no tiene que calcular nada.
- La compilación de depuración funciona sin secretos
  (`./gradlew assembleDebug`): sirve como comprobación de que la app
  nativa compila en cada cambio.
- Las compilaciones son repetibles: `cap sync` no deja cambios en el
  repositorio.

**Lo que seguiría siendo manual:** la primera subida a una pista nueva, la
ficha de la tienda y las revisiones de Google.

El paso siguiente a automatizar la compilación sería la actualización en
caliente (que la web llegue a las apps sin pasar por la tienda). Está
diseñada y aplazada: `Auditoria/2026-11-20-apps-nativas/`.

## iOS (más adelante)

No existe proyecto iOS. Para tenerlo hace falta:

| Requisito                                                | Nota                               |
| -------------------------------------------------------- | ---------------------------------- |
| Cuenta de desarrollador de Apple                         | 99 USD al año; es inevitable       |
| Un Mac, o máquinas Mac de GitHub                         | Desde Windows no se puede compilar |
| Generar el proyecto: `pnpm --filter km0lab cap:add:ios`  | En un Mac                          |
| Certificados y perfiles de firma                         | Con la cuenta de Apple             |
| Permiso de cámara declarado, iconos y pantalla de inicio | En el proyecto iOS                 |
| `apple-app-site-association` en `public/.well-known/`    | Para que los enlaces abran la app  |
| Reparto en pruebas                                       | TestFlight                         |

La versión y el seguro de compatibilidad ya valen para iOS: la app envía
`X-App-Platform: ios` y la pantalla de «actualiza» usa
`VITE_IOS_STORE_URL`.
