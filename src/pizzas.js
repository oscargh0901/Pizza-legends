export const TYPE_ICONS = {
  chill: "/images/icons/chill.png",
  fungi: "/images/icons/fungi.png",
  spicy: "/images/icons/spicy.png",
  veggie: "/images/icons/veggie.png",
};

// 4-way cycle: each type is strong against one type and weak against another.
const TYPE_CHART = {
  spicy: { strongAgainst: "chill", weakAgainst: "veggie" },
  chill: { strongAgainst: "fungi", weakAgainst: "spicy" },
  fungi: { strongAgainst: "veggie", weakAgainst: "chill" },
  veggie: { strongAgainst: "spicy", weakAgainst: "fungi" },
};

export function getTypeMultiplier(moveType, defenderType) {
  const matchup = TYPE_CHART[moveType];
  if (!matchup) {
    return 1; // "normal" type moves are never super/not-very effective
  }
  if (matchup.strongAgainst === defenderType) {
    return 2;
  }
  if (matchup.weakAgainst === defenderType) {
    return 0.5;
  }
  return 1;
}

export function calculateDamage(move, defender) {
  return Math.round(move.power * getTypeMultiplier(move.type, defender.type));
}

const SIGNATURE_MOVES = {
  spicy: "Spicy Blast",
  chill: "Frost Bite",
  fungi: "Spore Cloud",
  veggie: "Veggie Whip",
};

export function createMoveset(type) {
  return [
    { name: SIGNATURE_MOVES[type], type, power: 12 },
    { name: "Bite", type: "normal", power: 8 },
  ];
}

export const PLAYER_PARTY = {
  hero: { name: "Margherita", type: "veggie", maxHp: 30 },
};

export const ENEMY_ROSTER = {
  npcC: { name: "Diabla", type: "spicy", maxHp: 30 },
};
