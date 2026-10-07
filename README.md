# MedIA Suite — Landing

Página de presentación de [MedIA Suite](https://github.com/modarox28/triage-ia), app web de triage de urgencias con apoyo de IA.

- **Landing:** https://modarox28.github.io/medai-lander/
- **App:** https://media-suite-6f432.web.app · [demo sin registro](https://media-suite-6f432.web.app/?demo=1)

Un solo `index.html` sin dependencias externas: las fuentes (Familjen Grotesk y JetBrains Mono) y las capturas de la app están en `assets/`. Las capturas son de la app real en modo demo, con datos ficticios.

Para actualizar las capturas, toma pantallazos del modo demo a 390×844 (celular) o 1440×900 (escritorio) y guárdalos en `assets/img/` en formato WebP.

## Animaciones de scroll

- [Lenis](https://github.com/darkroomengineering/lenis) (MIT) suaviza el desplazamiento con mouse y trackpad; en celular se usa el scroll nativo.
- [GSAP + ScrollTrigger](https://gsap.com) (licencia estándar gratuita) mueve los elementos según el scroll: el hero, el teléfono fijo que cambia de pantalla en "Funciones", la frase que se ilumina palabra por palabra y los teléfonos de día y noche.
- Ambas librerías están copiadas en `assets/vendor/`; la lógica está en `assets/scroll.js`.
- Con "reducir movimiento" activado en el sistema, la página se muestra sin animaciones.

Cada vez que cambies `assets/scroll.js`, sube el número de `?v=` en la etiqueta `<script>` de `index.html` y de `en/index.html`; así los navegadores no usan la copia anterior guardada en caché (GitHub Pages la guarda 10 minutos).

## Versión en inglés

`en/index.html` es la misma página traducida (enlaces `ES`/`EN` en la barra superior y etiquetas `hreflang` para buscadores). Los textos que genera `assets/scroll.js` (simulador, carrusel) cambian solos según `<html lang="en">`. Si editas un texto en `index.html`, cámbialo también en `en/index.html`. Los botones de demo de la versión en inglés abren la app con `?lang=en`.

## Video del recorrido

`assets/video/recorrido.webm` y `recorrido.mp4` (27 s, sin sonido) muestran la app en modo demo. Se reproduce solo cuando entra en pantalla, con botón de pausa; con "reducir movimiento" no arranca solo.

## Contador de visitas

Al final de `index.html` y `en/index.html` está el código de [GoatCounter](https://www.goatcounter.com) (gratis, sin cookies, no requiere aviso de cookies), comentado. Para activarlo: crea una cuenta, reemplaza `TU-CODIGO` por tu código y quita los `<!--` `-->` de esa línea en ambos archivos.
