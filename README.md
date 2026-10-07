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
