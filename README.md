# Pizza Legends

Prototipo de un RPG estilo Pokémon (vista cenital, movimiento por cuadrícula, NPCs, diálogos) hecho en JavaScript vanilla + Canvas 2D.

Ver [`NOTES.md`](./NOTES.md) para la documentación técnica: arquitectura, decisiones de diseño, bugs corregidos y roadmap.

## Origen

Este proyecto parte de la serie tutorial de [Drew Conley](https://www.youtube.com/@drewconley) en YouTube, donde construye un RPG estilo Pokémon en JavaScript vanilla. A partir de esa base añadí: sistema de batallas por turnos con tabla de tipos (`Battle.js`/`Combatant.js`/`pizzas.js`), persistencia de progreso en `localStorage` (`Storage.js`), una suite de tests E2E con Playwright, migración a Vite + módulos ES, y varios bugs corregidos (detalle en [`NOTES.md`](./NOTES.md)).

## Requisitos

- Node.js 18+

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que indique la terminal (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

## Tests

Hay tests end-to-end (Playwright) que juegan la partida real en un navegador headless: mueven al héroe, hablan con el NPC retador, pelean la batalla y comprueban el resultado, además de comprobar el aviso de "modo móvil" emulando un iPhone.

```bash
npx playwright install chromium   # solo la primera vez
npm run test:e2e
```

El test arranca el dev server automáticamente (no hace falta tener `npm run dev` corriendo a la vez).

## Estructura

```
index.html        Punto de entrada HTML
src/               Código del motor (módulos ES)
  main.js          Arranque del juego
  Overworld.js      Bucle de juego y cámara
  OverworldMap.js   Lógica de mapas (paredes, cutscenes)
  maps.js           Datos de los mapas (contenido, separado del motor)
  GameObject.js / Person.js   Entidades del juego
  Sprite.js         Animación de sprites
  OverworldEvent.js / TextMessage.js   Cutscenes y diálogos
  Battle.js / Combatant.js / pizzas.js   Sistema de batallas por turnos
  Storage.js        Persistencia en localStorage (posición del héroe, enemigos derrotados)
  MobileWarning.js  Aviso en dispositivos táctiles sin teclado físico
  DirectionInput.js / KeyPressListener.js   Entrada de teclado
  utils.js          Helpers de cuadrícula y eventos
public/             Assets estáticos servidos tal cual (imágenes, CSS)
```

## Controles

- Flechas / WASD: moverse
- Enter: hablar con un NPC / avanzar diálogo / luchar (al hablar con el NPC retador)

El juego solo se controla con teclado. En un móvil o tablet sin teclado físico aparece un aviso indicándolo (no hay controles táctiles todavía).
