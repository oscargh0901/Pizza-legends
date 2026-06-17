# Pizza Legends

Prototipo de un RPG estilo Pokémon (vista cenital, movimiento por cuadrícula, NPCs, diálogos) hecho en JavaScript vanilla + Canvas 2D.

Ver [`AGENT.md`](./AGENT.md) para un escaneo completo del proyecto: arquitectura, bugs conocidos, mejoras pendientes y proyección de negocio.

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
  DirectionInput.js / KeyPressListener.js   Entrada de teclado
  utils.js          Helpers de cuadrícula y eventos
public/             Assets estáticos servidos tal cual (imágenes, CSS)
```

## Controles

- Flechas / WASD: moverse
- Enter: hablar con un NPC / avanzar diálogo / luchar (al hablar con el NPC retador)
