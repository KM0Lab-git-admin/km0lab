# Release Android (Google Play)

Guía para generar un APK de prueba y un AAB firmado publicable en Google Play
para `apps/km0lab` (Capacitor 7). Solo Android.

## 1. Prerrequisitos (una vez por máquina)

- **Android Studio** con Android SDK (Platform 35 + Build-Tools 35).
- **JDK 21** (`java -version`).
- `ANDROID_HOME` configurado.
- Un dispositivo físico Android con depuración USB activada (recomendado para
  probar el escáner QR; el emulador no tiene cámara fiable).
- **Cuenta de Google Play Console** (25 USD, pago único) con el app record
  `com.km0lab.app` creado.

Verifica que Gradle sincroniza (puede dar errores la primera vez mientras
descarga dependencias):

```bash
pnpm --filter km0lab cap:open:android
```

## 2. Keystore de release (una vez por app)

El keystore **no se commitea**. Guárdalo fuera del repo y haz copia de
seguridad: si lo pierdes no podrás actualizar la app en Google Play.

```bash
keytool -genkey -v -keystore km0lab-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias km0lab
```

Mueve el `.jks` a `C:\Users\Propietario\.keystores\km0lab-release.jks` (o
donde prefieras) y crea `apps/km0lab/android/app/keystore.properties`
(gitignored) copiando de `keystore.properties.example`:

```properties
storeFile=C:\\Users\\Propietario\\.keystores\\km0lab-release.jks
storePassword=TU_PASSWORD
keyAlias=km0lab
keyPassword=TU_PASSWORD
```

El `build.gradle` lee este fichero solo si existe; sin él, los builds release
no se firman (útil para debug).

## 3. Build web + sync

```bash
pnpm --filter km0lab cap:build:android   # = pnpm build && pnpm cap:sync
```

Esto regenera `dist/` y lo copia a
`apps/km0lab/android/app/src/main/assets/public/` (gitignored).

## 4. Generar artefactos

```bash
# APK de prueba (para instalar en tu móvil y validar)
pnpm --filter km0lab cap:apk:android
# → apps/km0lab/android/app/build/outputs/apk/release/app-release.apk

# AAB para Google Play
pnpm --filter km0lab cap:aab:android
# → apps/km0lab/android/app/build/outputs/bundle/release/app-release.aab
```

Ambos se firman con el `signingConfig.release` definido en `build.gradle`.

## 5. Probar el APK en el dispositivo

```bash
adb install -r apps/km0lab/android/app/build/outputs/apk/release/app-release.apk
```

Verifica especialmente:

- Flujo inicial (idioma → CP → home).
- Login OTP.
- **Escáner QR** (`/scanner`): abre la cámara nativa. Si no pide permiso o no
  escanea, revisa el permiso `CAMERA` en el manifest y que el plugin
  `@capacitor/barcode-scanner` esté en `capacitor.build.gradle`.
- Persistencia: cierra la app y reábrela; la sesión y el CP deben mantenerse
  (vía `@capacitor/preferences`).

## 6. Subir el AAB a Play Console

1. Play Console → app `com.km0lab.app` → **Producción** (o **Tests internos**
   para validar antes de publicar).
2. **Crear versión**, sube el `.aab`.
3. Completa el **Data safety form**, la **política de privacidad** (URL) y
   los **assets de store** (icono 512×512, banner 1024×500, descripciones
   ES/CA).
4. Revisa los permisos declarados: `INTERNET` + `CAMAMERA` (mínimos).
5. Envía a revisión.

## 7. Versionado

Cada release sube `versionCode` (entero) y `versionName` (string) en
`apps/km0lab/android/app/build.gradle`:

```gradle
versionCode 2
versionName "1.0.1"
```

Play Console exige `versionCode` estrictamente creciente entre uploads.

## Notas

- `minSdkVersion = 26` (Android 8.0) — requisito del plugin de escáner.
- `targetSdkVersion = compileSdkVersion = 35` — cumple el requisito actual de
  Google Play para nuevas apps.
- Deep links `/scan?c=…` nativos y `InAppBrowser` para links externos quedan
  fuera del scope v1 (rama `feat/android-native-v2`).
- iOS no está incluido en este flujo (decisión de producto).
