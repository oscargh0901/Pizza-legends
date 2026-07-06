import { KeyPressListener } from "./KeyPressListener.js";
import { DirectionInput } from "./DirectionInput.js";
import { OverworldMap } from "./OverworldMap.js";
import { OverworldMaps } from "./maps.js";

export class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }
 
   startGameLoop() {
     const step = () => {
       //Clear off the canvas
       this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 
       //Establish the camera person
       const cameraPerson = this.map.gameObjects.hero;
 
       //Update all objects
       Object.values(this.map.gameObjects).forEach(object => {
         object.update({
           arrow: this.directionInput.direction,
           map: this.map,
         })
       })
 
       //Draw Lower layer
       this.map.drawLowerImage(this.ctx, cameraPerson);
 
       //Draw Game Objects
       Object.values(this.map.gameObjects).sort((a,b) => {
         return a.y - b.y;
       }).forEach(object => {
         object.sprite.draw(this.ctx, cameraPerson);
       })
 
       //Draw Upper layer
       this.map.drawUpperImage(this.ctx, cameraPerson);
       
       requestAnimationFrame(() => {
         step();   
       })
     }
     step();
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });
  }
 
  init() {
   this.map = new OverworldMap(OverworldMaps.DemoRoom);
   this.map.mountObjects();

   this.bindActionInput();

   this.directionInput = new DirectionInput();
   this.directionInput.init();

   this.startGameLoop();
  }
 }