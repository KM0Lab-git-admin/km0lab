# km0lab

Monorepo base con `pnpm` y `turbo`.

## Estructura

- `apps/`: aplicaciones de negocio
- `packages/`: librerias y modulos compartidos

## Primeros pasos

1. `pnpm install`
2. `npx turbo run dev`

## Migracion recomendada

1. Copiar primero `packages/components` (UI compartida).
2. Copiar despues `packages/app` por features.
3. Ir conectando cada app de `apps/*` a los paquetes compartidos.
