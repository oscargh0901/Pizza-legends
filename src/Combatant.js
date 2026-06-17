export class Combatant {
  constructor({ name, type, maxHp, moves }) {
    this.name = name;
    this.type = type;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.moves = moves;
  }

  get isFainted() {
    return this.hp <= 0;
  }

  get hpPercentage() {
    return Math.max(0, Math.round((this.hp / this.maxHp) * 100));
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
}
