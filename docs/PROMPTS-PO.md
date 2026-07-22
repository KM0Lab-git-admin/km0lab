# Guía de prompts para Product Owner y diseño (Lovable)

> Para pedir cambios visuales en el prototipo de Lovable **sin saber
> programar**. La parte técnica la aplica Lovable solo, siguiendo las
> reglas de `docs/KNOWLEDGE.md` de su repo (§9: modo no técnico). Esta
> guía es el manual de la persona que escribe los prompts.

## La plantilla (3 campos, siempre los mismos)

```
Dónde: [pantalla, con su nombre visible] + [vista: móvil 375×667 /
tablet 768×1024 / apaisada] + captura si puedes, marcando el elemento.

Qué quiero: [qué se ve mal y cómo debería verse; si en otra pantalla o
vista ya está bien resuelto, decir "como en ..."]. Antes de tocar
código, dime en una frase qué vas a cambiar y espera mi confirmación.

Qué no debe cambiar: [vistas que ya están bien, textos, orden,
comportamiento...]. En caso de duda, pregunta antes de hacer.
```

## Ejemplo real

> **Dónde**: pantalla "Introduce tu código postal" (PostalCode), en la
> vista de tablet en vertical (el frame 768×1024 de PreviewAll).
>
> **Qué quiero**: ahora la ilustración, el título, la caja del código
> postal y el botón CONTINUAR quedan agrupados en la parte superior y
> sobra un gran vacío debajo. Quiero que se repartan de forma
> equilibrada a lo largo de todo el alto de la pantalla, con el mismo
> criterio visual que ya tiene la vista de móvil (375×667): ilustración
> arriba, título y subtítulo en la zona central, campo y botón hacia
> abajo, con espacios proporcionados entre ellos. Antes de tocar
> código, dime en una frase qué vas a cambiar y espera mi confirmación.
>
> **Qué no debe cambiar**: la vista de móvil (375×667) y la vista
> apaisada, que ya se ven bien. Tampoco el orden de los elementos, los
> textos, ni el comportamiento del campo y del botón (validación,
> mensajes de error, estados).

## Trucos que evitan retrabajo

1. **Señala el elemento como lo vería un usuario** ("las flechas
   redondas del carrusel del onboarding"), no intentes adivinar nombres
   de componentes. Una captura con el elemento marcado con un círculo
   vale más que cualquier descripción.
2. **Apunta a algo que ya está bien** ("como en la vista de móvil",
   "como hace la pantalla de idioma"): es la forma no técnica de dar la
   solución exacta.
3. **El tercer campo es el importante**: lo que NO debe cambiar. Sin
   él, la IA tiende a "mejorar" cosas que nadie le pidió.
4. **Espera siempre la reformulación**: Lovable debe responder con una
   frase del tipo "Voy a [cambio] sin tocar [resto]" antes de hacer
   nada. Si hace el cambio sin preguntar, o la frase no coincide con lo
   que pediste, di "no" y reformula tu prompt.
5. **Un cambio por prompt**. Dos peticiones mezcladas = resultados a
   medias en las dos.

## Cómo validar el resultado

Abrir **PreviewAll** y comprobar la matriz mínima:

- La vista donde pediste el cambio se ve como querías.
- La vista móvil (375×667) sigue intacta — es el contrato mínimo.
- Si la pantalla tiene estados (cargando, vacío, error), míralos a
  375×667.

## Cuándo NO hacerlo tú y pasarlo al desarrollador

Regla de triaje: **si puedes describir el cambio señalando la pantalla,
hazlo tú; si necesitas explicar cómo funciona por dentro, pásalo.**

Pásalo también si Lovable responde que el cambio requiere una decisión
técnica (dependencia nueva, tocar un archivo protegido, cambio
estructural, conectar datos reales) — está obligado a avisarte y a no
hacerlo por su cuenta (`docs/KNOWLEDGE.md` §9.5).

## Alternativa sin escribir: Visual Edit

Para cambios visuales puntuales (un texto, un color, un tamaño), el
modo **Visual Edit** de Lovable permite hacer clic en el elemento sobre
el preview y describir el cambio ahí mismo, sin plantilla. Los estados
de la Home en PreviewAll se renderizan sin iframe precisamente para
permitirlo.
