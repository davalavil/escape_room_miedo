# escape_room_miedo
Juego de escape room de miedo
# Escape Room: La Mansión Olvidada

Una terrorífica escape room virtual creada con HTML, CSS y JavaScript.

## Cómo Jugar

1.  **Clona o descarga** este repositorio.
2.  **Añade tus propios archivos** de imagen (`images/room1.jpg`, `images/room2.jpg`, etc.) y audio (`audio/suspense_music.mp3`, `audio/jumpscare1.wav`, etc.). Los nombres deben coincidir con los usados en `script.js` o debes modificarlos en el código.
3.  Abre el archivo `index.html` en tu navegador web.
4.  ¡Intenta escapar!

## Despliegue en GitHub Pages

1.  Asegúrate de que tu repositorio en GitHub tenga todo el código y los assets (imágenes, audio).
2.  Ve a la pestaña "Settings" (Configuración) de tu repositorio.
3.  En el menú lateral, selecciona "Pages".
4.  En la sección "Build and deployment", bajo "Source", selecciona "Deploy from a branch".
5.  Elige la rama donde está tu código (normalmente `main` o `master`) y la carpeta raíz (`/root`).
6.  Haz clic en "Save".
7.  GitHub construirá y desplegará tu página. Puede tardar unos minutos. La URL aparecerá en la misma sección de configuración de Pages.

## Personalización

*   **Imágenes:** Reemplaza las imágenes placeholder en la carpeta `images/` con las tuyas. Asegúrate de que los nombres coincidan o actualiza las rutas en `script.js`.
*   **Audio:** Añade tus archivos `.mp3` (música) y `.wav` o `.ogg` (efectos) en la carpeta `audio/`. Actualiza las referencias en `index.html` y `script.js`.
*   **Acertijos:** Modifica la lógica dentro de las funciones `action` de cada objeto en `script.js` para crear tus propios puzzles.
*   **Áreas Interactivas:** Ajusta las coordenadas (`top`, `left`, `width`, `height`) en la definición de `rooms` en `script.js`. Puedes descomentar temporalmente los estilos de `background-color` y `border` en `style.css` para `.interactive-area` para ayudarte a visualizar y posicionar las cajas.
*   **Sustos:** Modifica o añade llamadas a `triggerJumpScare()` donde quieras que ocurran. Necesitarás imágenes (`scareX.png`) y sonidos (`jumpscareX.wav`) para ello.

## Advertencia

Este juego contiene elementos de terror, sustos repentinos (jump scares) y música ambiental diseñada para crear tensión. Juega bajo tu propia responsabilidad.
