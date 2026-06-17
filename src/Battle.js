import { Combatant } from "./Combatant.js";
import { TYPE_ICONS, PLAYER_PARTY, ENEMY_ROSTER, createMoveset, calculateDamage } from "./pizzas.js";

export class Battle {
  constructor({ playerId, enemyId, onComplete }) {
    const playerConfig = PLAYER_PARTY[playerId];
    const enemyConfig = ENEMY_ROSTER[enemyId];

    this.player = new Combatant({ ...playerConfig, moves: createMoveset(playerConfig.type) });
    this.enemy = new Combatant({ ...enemyConfig, moves: createMoveset(enemyConfig.type) });

    this.onComplete = onComplete;
    this.element = null;
  }

  createHudMarkup(combatant) {
    return `
      <img class="Battle_hud_bg" src="/images/ui/SingleMemberDisplay.png" />
      <img class="Battle_type_icon" src="${TYPE_ICONS[combatant.type]}" />
      <p class="Battle_name">${combatant.name}</p>
      <div class="Battle_hpBar"><div class="Battle_hpBar_fill"></div></div>
    `;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");
    this.element.style.backgroundImage = "url('/images/maps/DemoBattle.png')";

    this.element.innerHTML = (`
      <div class="Battle_hud Battle_hud_enemy">${this.createHudMarkup(this.enemy)}</div>
      <div class="Battle_hud Battle_hud_player">${this.createHudMarkup(this.player)}</div>
      <p class="Battle_message"></p>
      <div class="Battle_moves"></div>
    `);

    this.enemyHpFill = this.element.querySelector(".Battle_hud_enemy .Battle_hpBar_fill");
    this.playerHpFill = this.element.querySelector(".Battle_hud_player .Battle_hpBar_fill");
    this.messageElement = this.element.querySelector(".Battle_message");
    this.movesElement = this.element.querySelector(".Battle_moves");
  }

  updateHud() {
    this.enemyHpFill.style.width = `${this.enemy.hpPercentage}%`;
    this.playerHpFill.style.width = `${this.player.hpPercentage}%`;
  }

  setMessage(text) {
    this.messageElement.textContent = text;
  }

  showMoveButtons() {
    this.movesElement.innerHTML = this.player.moves.map((move, index) => (
      `<button class="Battle_move_button" data-move-index="${index}">${move.name}</button>`
    )).join("");

    this.movesElement.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        const move = this.player.moves[Number(button.dataset.moveIndex)];
        this.playerTurn(move);
      });
    });
  }

  playerTurn(move) {
    this.movesElement.innerHTML = "";

    const damage = calculateDamage(move, this.enemy);
    this.enemy.takeDamage(damage);
    this.updateHud();
    this.setMessage(`${this.player.name} uses ${move.name}!`);

    setTimeout(() => {
      if (this.enemy.isFainted) {
        this.setMessage(`${this.enemy.name} fainted!`);
        setTimeout(() => this.end(true), 1500);
        return;
      }
      this.enemyTurn();
    }, 1000);
  }

  enemyTurn() {
    const move = this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)];
    this.setMessage(`${this.enemy.name} uses ${move.name}!`);

    setTimeout(() => {
      const damage = calculateDamage(move, this.player);
      this.player.takeDamage(damage);
      this.updateHud();

      if (this.player.isFainted) {
        this.setMessage(`${this.player.name} fainted!`);
        setTimeout(() => this.end(false), 1500);
        return;
      }

      setTimeout(() => {
        this.setMessage("What will you do?");
        this.showMoveButtons();
      }, 800);
    }, 1000);
  }

  end(didWin) {
    this.element.remove();
    this.onComplete(didWin);
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.updateHud();

    this.setMessage(`${this.enemy.name} wants to fight!`);
    setTimeout(() => {
      this.setMessage("What will you do?");
      this.showMoveButtons();
    }, 1200);
  }
}
