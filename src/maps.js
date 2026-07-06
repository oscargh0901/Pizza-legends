import { utils } from "./utils.js";
import { GameObject } from "./GameObject.js";
import { Person } from "./Person.js";
import { Storage } from "./Storage.js";

const savedHeroPosition = Storage.getHeroPosition();

export const OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: savedHeroPosition ? savedHeroPosition.x : utils.withGrid(5),
        y: savedHeroPosition ? savedHeroPosition.y : utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type:"textMessage", text: "I'm busy...", faceHero: "npcA" },
              { type:"textMessage", text: "Go away!" },
              { who: "hero", type:"walk", direction: "up" },
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "walk",  direction: "left" },
          { type: "stand",  direction: "up", time: 800 },
          { type: "walk",  direction: "up" },
          { type: "walk",  direction: "right" },
          { type: "walk",  direction: "down" },
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I challenge you to a pizza battle!", faceHero: "npcC" },
              { type: "battle", enemyId: "npcC" },
              { type: "textMessage", text: "Until next time!" },
            ]
          }
        ]
      }),
    },
    walls: {
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    }
  },
}
