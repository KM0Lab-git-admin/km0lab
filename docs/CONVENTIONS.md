# Convenciones del monorepo km0lab

Este documento complementa a `AGENTS.md` con detalles, ejemplos y la tabla
completa de breakpoints. Pensado para personas y para agentes de IA.

---

## 1. Estructura de carpetas

```
km0lab/
├── AGENTS.md
├── docs/
│   └── CONVENTIONS.md
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json          # paths @km0lab/* compartidos
├── tsconfig.json
├── apps/
│   ├── km0lab/                 # app principal (Expo SDK 55)
│   │   ├── app/                # rutas de expo-router
│   │   ├── components/         # componentes específicos de la app
│   │   ├── env/                # .env.development, .env.production
│   │   ├── styles/global.css   # variables CSS
│   │   ├── app.config.ts
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   └── tailwind.config.js
│   └── km0lab-back-office/
└── packages/
    ├── app/                    # @km0lab/app (lógica compartida)
    ├── components/             # @km0lab/ui (UI compartida)
    │   ├── icons/
    │   ├── lib/
    │   └── ui/
    ├── km0lab-web-theme/       # @km0lab/web-theme (tokens para Next/Vite)
    ├── eslint-config/
    └── jest-config/
```

---

## 2. Scripts disponibles

**Raíz**

```bash
pnpm install
npx turbo run dev            # arranca todo lo que tenga script `dev`
npx turbo run build
npx turbo run type:check
npx turbo run lint
npx turbo run lint:fix
pnpm format
pnpm validate                # type:check + lint + format:check
```

**`apps/km0lab`**

```bash
pnpm --filter km0lab dev         # expo start (env development)
pnpm --filter km0lab web         # expo start --web
pnpm --filter km0lab android     # expo run:android
pnpm --filter km0lab ios         # expo run:ios
pnpm --filter km0lab tunnel      # expo start --tunnel
pnpm --filter km0lab build:web   # expo export -p web (env production)
pnpm --filter km0lab prebuild:android
pnpm --filter km0lab prebuild:ios
pnpm --filter km0lab expo:doctor
```

Entornos definidos en `apps/km0lab/env/.env.development` y
`apps/km0lab/env/.env.production`. Las variables expuestas al cliente deben
empezar por `EXPO_PUBLIC_`.

---

## 3. Añadir un componente compartido (`@km0lab/ui`)

1. Crear archivo en `packages/components/ui/<nombre-kebab>.tsx`.
2. Usar `cn()` de `@km0lab/ui/lib/utils` para merge de clases.
3. Definir variantes con `class-variance-authority` (patrón shadcn).
4. Exportar desde `packages/components/index.ts`.
5. Si introduce nuevas dependencias, añadirlas en
   `packages/components/package.json` con la versión compatible.
6. Validar:
   ```bash
   npx turbo run type:check lint
   pnpm --filter km0lab build:web
   ```

Regla de oro: si el componente solo se usa en una pantalla concreta, **no**
lo metas en `@km0lab/ui`; déjalo en `apps/km0lab/components/...`.

---

## 4. Añadir una pantalla

1. Crear `apps/km0lab/app/<segmento>/index.tsx` (o `page.tsx` si el tooling
   lo exige).
2. Si la pantalla tiene sub-rutas, añadir `_layout.tsx` al mismo nivel.
3. Contemplar los cuatro estados:
   - Loading (normalmente `Skeleton`).
   - Empty (componente o bloque con CTA).
   - Error (mensaje semántico + CTA reintentar).
   - Feliz.
4. Usar `expo-router` para navegar (`useRouter`, `<Link>`).
5. Copy en español (o idioma del producto); **no** en `@km0lab/ui`.
6. Si necesita un componente nuevo reutilizable, seguir sección 3.

Plantilla mínima:

```tsx
import { SafeAreaView, View } from 'react-native'

import { Text } from '@km0lab/ui'

export default function ExampleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="text-2xl font-sans-medium text-foreground">
          Título de la pantalla
        </Text>
      </View>
    </SafeAreaView>
  )
}
```

---

## 5. Estilos, tokens y breakpoints

### 5.1. Tokens de color

Definidos como variables HSL en `apps/km0lab/styles/global.css` y mapeados en
`apps/km0lab/tailwind.config.js`. Siempre usa los alias semánticos:

- `background`, `foreground`
- `muted`, `muted-foreground`
- `card`, `card-foreground`
- `primary`, `primary-foreground`, `primary-active`, `primary-subtle`,
  `primary-muted`, `primary-accent`, `primary-accent-muted`, `primary-contrast`
- `secondary`, `secondary-foreground`, `secondary-active`, `secondary-subtle`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`, `destructive-subtle`
- `success`, `success-foreground`
- `info`, `info-foreground`
- `warning`, `warning-foreground`
- `purple`, `purple-foreground`
- `border`, `input`, `placeholder`, `ring`, `inverse`

Para añadir un token nuevo:

1. Declarar variable en `:root` de `global.css` (`--mi-token: 200 50% 40%;`).
2. Mapear en `tailwind.config.js` (`miToken: 'hsl(var(--mi-token))'`).
3. Consumir con la clase (`bg-miToken`, `text-miToken`, ...).

### 5.2. Tipografías

Declaradas en `theme.extend.fontFamily`. Clases útiles:

- `font-sans`
- `font-sans-medium`
- `font-sans-italic`
- `font-sans-semibold`
- `font-sans-bold`

Cuando se incorporen fuentes reales de marca, reemplazar los valores en
`tailwind.config.js` y cargar las fuentes en la app Expo (`expo-font`).

### 5.3. Breakpoints de ancho (Tailwind estándar)

| Breakpoint | Ancho mínimo | Dispositivo |
|------------|--------------|-------------|
| `xs`       | 360px        | Móvil pequeño |
| `sm`       | 480px        | Móvil moderno |
| `md`       | 768px        | Tablet |
| `lg`       | 1024px       | Laptop |
| `xl`       | 1280px       | Desktop |
| `2xl`      | 1536px       | Pantalla grande |

### 5.4. Breakpoints con altura (proyecto)

Requieren **ancho y alto** simultáneos. **La dimensión más restrictiva manda**.

| Breakpoint | Ancho mínimo | Alto mínimo | Rango de alto | Logo scale |
|------------|--------------|-------------|---------------|------------|
| `xs`       | cualquiera   | —           | < 700px       | 45.72%     |
| `sm-h`     | 480px+       | 700px+      | 700-799px     | 33.75%     |
| `md-h`     | 768px+       | 800px+      | 800-899px     | 43.03%     |
| `lg-h`     | 1024px+      | 900px+      | 900-999px     | 57.375%    |
| `xl-h`     | 1280px+      | 1000px+     | 1000px+       | 63.75%     |

Ejemplo:

```tsx
<View className="py-2 md-h:py-6 lg-h:py-8" />
<View className="w-slide md-h:w-96 lg-h:w-[28rem]" />
```

Si la altura no llega, siempre cae a `xs`, independientemente del ancho.

---

## 6. Accesibilidad mínima

- Elementos interactivos deben ser accesibles: `role="button"` ya lo aplica
  `<Button>` de `@km0lab/ui`; si creas otro interactivo, añade rol.
- Estados `disabled`, `loading` y `focus` visibles (usar `web:focus-visible:...`).
- Textos con contraste (usa tokens `foreground` sobre `background`; `muted-foreground`
  sobre `muted`; `primary-foreground` sobre `primary`).
- No usar color como único canal de información (acompañar con icono o texto).

---

## 7. Testing

- Framework compartido: **Jest** (`@km0lab/jest-config`).
- Tests unitarios **colocalizados** junto al archivo: `Widget.test.tsx`.
- Integración: `tests/integration/<feature>/*.test.ts`.
- E2E: `tests/e2e/<feature>/*.e2e.ts` (cuando exista paquete `@km0lab/e2e`
  configurado).

Ejecutar:

```bash
pnpm --filter <pkg> test
```

---

## 8. Commits y ramas

Ver reglas completas en `AGENTS.md` sección 8.

Sugerencias de scopes ya usados:

- `ui` → cambios en `@km0lab/ui`.
- `km0lab` → cambios en la app principal.
- `app` → cambios en `@km0lab/app`.
- `web-theme` → cambios en `@km0lab/web-theme`.
- `eslint-config`, `jest-config`.
- `agents`, `docs` → para documentación.

Flujo de rama sencillo:

1. Crear rama desde `main` con nombre descriptivo en `kebab-case`
   (`feat/home-screen`, `fix/button-disabled-color`).
2. Commits pequeños y Conventional.
3. Antes de merge: validate completo.
4. Merge a `main` solo cuando el checklist de `AGENTS.md` §9 esté verde.

---

## 9. Glosario rápido

- **Token semántico**: variable CSS / clase Tailwind con nombre por
  **función** (`primary`, `danger`, `muted`), no por color real.
- **NativeWind**: Tailwind para React Native + web; permite prefijos
  `web:`, `native:`, `ios:`, `android:`.
- **Expo Router**: router basado en archivos para la app Expo (equivalente
  al App Router de Next.js).
- **Prebuild**: generar proyectos nativos (`android/`, `ios/`) a partir de
  la configuración Expo para builds custom.

---

## 10. Dudas habituales

**¿Cuándo creo un componente en `@km0lab/ui` y cuándo en la app?**
Si se usa en ≥ 2 pantallas o es claramente reutilizable → `@km0lab/ui`.
Si es específico de una pantalla → `apps/km0lab/components/...`.

**¿Puedo usar un color hex puntual?**
No. Define token primero, úsalo luego.

**¿Puedo meter `<Image src="data:..." />` gigante en el repo?**
No. Assets binarios grandes no. Usar `public/` con nombres en `kebab-case`
o CDN.

**¿Cómo añado una dependencia a solo un paquete?**

```bash
pnpm --filter @km0lab/ui add <dep>
pnpm --filter km0lab add <dep>
```
