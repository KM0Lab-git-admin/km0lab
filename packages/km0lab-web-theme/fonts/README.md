# Fuentes locales

Todas las fuentes se sirven desde este directorio; no se usan Google Fonts.

## Archivos necesarios para Antique Olive (font-brand)

Coloca aquí los `.ttf` que declara `src/styles/globals.css`:

- `Antique-Olive-Std-Roman_3869.ttf` (400, normal)
- `Antique-Olive-Std-Bold_3863.ttf` (700, normal)
- `Antique-Olive-Std-Black_3861.ttf` (900, normal)
- `Antique-Olive-Std-Italic_3865.ttf` (400, italic)

Si no están, el navegador usará los fallbacks de sistema (Impact, Arial Black, sans-serif).

## Inter y DM Sans (font-ui, font-body)

Actualmente se usan como fuentes del sistema. Para tenerlas en el repo: añade los `.woff2`/`.ttf` aquí y decláralas con `@font-face` en `globals.css`.
