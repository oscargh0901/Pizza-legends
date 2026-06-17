# AGENT.md — Escaneo del proyecto "Pizza Legends"

> Documento de referencia generado a partir de un escaneo completo del repositorio (código, assets, historial git). Pensado para que cualquier persona (o agente) que retome el proyecto entienda en qué estado está, qué arreglar y hacia dónde podría evolucionar.

## 1. Resumen ejecutivo

**Pizza Legends** es un prototipo muy temprano de un juego RPG estilo Pokémon/Zelda (vista cenital, movimiento por cuadrícula, NPCs, diálogos) construido en **JavaScript vanilla + Canvas 2D**, sin frameworks ni build tools.

El repo solo cubre la parte de **"overworld"** (mapa explorable, movimiento del héroe, NPCs con comportamiento en bucle, cutscenes de diálogo). **No existe sistema de batallas, ni de equipo/colección de "pizzas", ni menús, ni persistencia**, aunque los assets de esas features ya están en `images/` (fondos de batalla, iconos de tipos de pizza, displays de combate). Esto confirma que es un proyecto **a medio terminar**, consistente con seguir un tutorial paso a paso y detenerse en un punto intermedio.

Historial de commits (`git log`): `Initial commit` → `a` → `afinal`. Mensajes no descriptivos, típico de quien copia un tutorial sin documentar avances propios.

## 2. ¿De qué va el juego?

- El jugador controla un héroe en una sala ("DemoRoom") con vista top-down.
- Se mueve con flechas/WASD en una cuadrícula de 16px.
- Hay NPCs con rutinas de movimiento/espera en bucle (`behaviorLoop`) y diálogos al pulsar Enter si están enfrente (`talking`).
- Los diálogos se muestran como cajas de texto inferiores tipo Pokémon, con cutscenes simples (encadenar "andar", "estar quieto", "mensaje").
- La temática "pizza" (héroe, tipos de pizza: chill/fungi/spicy/veggie) sugiere que el plan original era un sistema de batallas por turnos con "pizzas" como criaturas coleccionables — pero esa mecánica **no está implementada**, solo hay arte preparado para ella.

## 3. Tecnologías

| Capa | Tecnología | Notas |
|---|---|---|
| Lenguaje | JavaScript ES6 (clases) | Sin TypeScript, sin linter configurado |
| Render | Canvas 2D API | Sprites dibujados manualmente, sin motor (Phaser, PixiJS, etc.) |
| Módulos | Ninguno | Clases globales cargadas vía `<script>` en orden manual en `index.html` |
| Estilos | CSS plano | `styles/global.css`, `styles/TextMessage.css`, escalado por `transform: scale(3)` |
| Build / bundler | **Ninguno** | No hay `package.json`, ni Webpack/Vite/Parcel |
| Tests | **Ninguno** | No hay test runner ni una sola prueba |
| Persistencia | **Ninguna** | Sin `localStorage`, sin backend |
| Servidor | Implícito | Las rutas son absolutas (`/images/...`, `/utils.js`), requiere servir con un servidor estático (live-server, http-server); no funciona abriendo el `index.html` directo con `file://` |

**Estructura de archivos:**
```
index.html          → carga todos los scripts en orden manual
init.js              → punto de entrada, instancia Overworld
Overworld.js         → bucle de juego (game loop), cámara, draw order
OverworldMap.js      → datos de mapas (DemoRoom, Kitchen) + lógica de paredes/cutscenes
OverworldEvent.js    → ejecuta eventos de cutscene (walk, stand, textMessage)
GameObject.js        → clase base de entidades (posición, sprite, behaviorLoop)
Person.js            → extiende GameObject con movimiento por input/cuadrícula
Sprite.js            → animaciones por hoja de sprites (spritesheet)
TextMessage.js       → caja de diálogo
DirectionInput.js     → input de teclado (flechas/WASD)
KeyPressListener.js  → listener de tecla puntual (Enter)
utils.js             → helpers de cuadrícula y eventos custom
images/              → mapas, personajes, iconos de pizza, UI de batalla (sin usar aún)
```

## 4. Errores detectados

1. **`KeyPressListener.unbind()` no desvincula nada — bug real.** (`KeyPressListener.js:20-23`)
   ```js
   unbind() {
       document.addEventListener("keydown", this.keydownFunction); // debería ser removeEventListener
       document.addEventListener("keyup", this.keyupFunction);
   }
   ```
   Usa `addEventListener` en vez de `removeEventListener`. Resultado: cada vez que se cierra un `TextMessage` (que llama a `unbind()`), en lugar de quitar el listener de Enter, **se duplica**. Tras varios diálogos, una sola pulsación de Enter dispara el callback múltiples veces → fuga de listeners y comportamiento errático progresivo. Es el bug más importante del repo.

2. **`console.log` de depuración en código "final".** (`GameObject.js:21`, `OverworldMap.js:72`) — quedó `console.log("mounting!")` y `console.log({ match })` de cuando se depuraba el tutorial. Hay que retirarlos antes de cualquier release.

3. **Typo tolerado por JS pero descuidado.** (`OverworldMap.js:68`) — `hero. direction` (espacio antes de la propiedad). Funciona porque JS ignora el espacio, pero indica falta de linter/formateo.

4. **Sombra de sprite "hardcodeada".** (`Sprite.js:13`) — `this.useShadow = true; //config.useShadow || false` — la opción de configurar la sombra está comentada y deshabilitada, es código muerto a medio terminar.

5. **Sin manejo de errores de carga de imágenes.** Todas las clases (`Sprite`, `OverworldMap`) asumen que las imágenes siempre cargan bien; si una ruta falla, el juego sigue "vivo" pero dibuja huecos sin avisar en consola de forma clara.

6. **Datos de contenido mezclados con lógica de motor.** Los mapas (`DemoRoom`, `Kitchen`) están definidos inline dentro de `OverworldMap.js` (`window.OverworldMaps = {...}`), junto a la clase que los consume. Esto hará insostenible añadir más mapas/niveles.

7. **Sin control de colisiones por mapa real ni capas de profundidad** más allá de un diccionario plano de paredes (`walls`) — no escala bien a mapas grandes ni a colisiones con objetos dinámicos.

8. **Sin gestión de resolución/responsive.** El canvas es fijo a 352×198px y se escala con `transform: scale(3)` vía CSS; no se adapta a distintos tamaños de pantalla ni a móvil.

## 5. Mejoras sugeridas (priorizadas)

**Críticas (antes de seguir construyendo encima):**
- Arreglar `KeyPressListener.unbind()` (cambiar a `removeEventListener`).
- Quitar los `console.log` de depuración.
- Añadir `package.json` + un bundler ligero (Vite es el más simple) para poder usar módulos ES (`import`/`export`) en vez de variables globales y `<script>` en orden manual.
- Añadir un `README.md` con instrucciones para ejecutar el proyecto (requiere servidor estático).
- Añadir `.gitignore` y una licencia explícita (ver sección 6, importante por el origen tutorial).

**Funcionales (para que sea un juego real):**
- Implementar el sistema de batallas (ya hay arte preparado: `*Battle.png`, iconos chill/fungi/spicy/veggie, `SingleMemberDisplay.png`) — es la mecánica central que falta y la que justifica el nombre "Pizza Legends".
- Separar datos de mapas/contenido a JSON o módulos independientes del motor.
- Añadir persistencia (`localStorage` o backend) para guardar progreso.
- Añadir un sistema de transición entre mapas (actualmente solo hay un mapa cargado, `Kitchen` está definida pero nunca se usa).
- Soporte táctil/mobile (controles en pantalla) si se apunta a web/móvil.

**Calidad de código:**
- Introducir ESLint + Prettier.
- Tests unitarios mínimos para utils (`nextPosition`, `withGrid`, etc.) y lógica de colisiones.
- Tipado opcional con JSDoc o migración a TypeScript a medida que crezca.

## 6. Origen del proyecto y originalidad (importante)

La estructura de clases (`Overworld`, `OverworldMap`, `OverworldEvent`, `GameObject`, `Person`, `Sprite`, `DirectionInput`, `KeyPressListener`, `TextMessage`), los nombres de mapas (`DemoRoom`, `Kitchen`, `PizzaShop`, `Street`...) y los assets (iconos de tipos de pizza, displays de batalla) coinciden con la serie tutorial pública **"Pizza Legends"** (curso de creación de un RPG estilo Pokémon en JS vanilla). Es decir: el código actual es, en gran parte, una **transcripción del tutorial**, no una base original.

Si la intención es:
- **Aprender / portfolio personal** → no hay problema legal, pero conviene indicarlo explícitamente (ej. en el README: "proyecto de aprendizaje basado en el tutorial X") y, ya que se quiere usar como portfolio, sería bueno **añadir alguna mecánica propia** que demuestre criterio (ej. el propio sistema de batallas, que el tutorial probablemente no cubre en este punto).
- **Publicar o monetizar el juego** → hay que sustituir el arte (sprites, mapas, iconos) por arte propio o con licencia adecuada, y renombrar/refactorizar lo suficiente para que no sea una copia 1:1 del código del tutorial. El nombre "Pizza Legends" también podría estar ligado al tutorial original; conviene verificar/cambiarlo si se busca una marca propia.

## 7. Proyección de negocio

Siendo honesto sobre el estado actual: **hoy el proyecto no tiene valor comercial por sí mismo**. Es un esqueleto de movimiento + diálogos sin bucle de juego completo (sin combate, sin progresión, sin economía, sin monetización). Antes de pensar en negocio, falta completar el *core loop* (explorar → combate → progresión).

Caminos razonables si se decide invertir tiempo en convertirlo en algo con potencial:

1. **Juego indie ligero (más realista).** Terminar el sistema de batallas y publicarlo en itch.io / como PWA. Es un nicho saturado y de bajos ingresos salvo que el arte/historia destaque mucho; sirve más como **proyecto de portfolio para conseguir trabajo como dev de juegos/frontend** que como negocio en sí.
2. **"Advergame" para una marca de pizza.** La temática (pizzas, tipos como toppings) se presta a un juego promocional para una pizzería/cadena (ej. campaña de marketing, app de fidelización con minijuego). Esto sí tiene un modelo de negocio claro (cliente B2B paga por el desarrollo/personalización), pero requiere salir y conseguir ese cliente; el código actual sirve como prueba de concepto, no como producto vendible todavía.
3. **Recurso educativo.** Empaquetarlo como ejemplo didáctico (curso propio, artículos, repositorio comentado) para enseñar desarrollo de juegos en JS vanilla. Bajo techo de ingresos, pero bajo coste y reutiliza lo ya hecho.

**Recomendación calibrada:** no proyectar expectativas de negocio sobre el código tal cual está. Si el objetivo es monetizar, el camino más realista a corto plazo es la opción 2 (advergame a medida), pero exige completar el combate, sustituir el arte por algo con licencia clara/original, y conseguir un cliente — no es algo que el repo resuelva solo.

## 8. Próximos pasos sugeridos (checklist)

- [ ] Arreglar bug de `KeyPressListener.unbind()`
- [ ] Limpiar `console.log` de depuración
- [ ] Añadir `package.json`, bundler (Vite) y módulos ES
- [ ] Añadir `README.md` con instrucciones de ejecución
- [ ] Decidir y documentar licencia / originalidad del arte y nombre
- [ ] Implementar sistema de batallas (ya hay assets listos)
- [ ] Separar datos de mapas de la lógica del motor
- [ ] Añadir persistencia de progreso
