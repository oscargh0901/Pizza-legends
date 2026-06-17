const STORAGE_KEY = "pizzaLegendsSave";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const Storage = {
  getHeroPosition() {
    return load().heroPosition || null;
  },
  setHeroPosition(x, y) {
    const data = load();
    data.heroPosition = { x, y };
    save(data);
  },
  isDefeated(enemyId) {
    return (load().defeatedEnemies || []).includes(enemyId);
  },
  markDefeated(enemyId) {
    const data = load();
    const defeated = new Set(data.defeatedEnemies || []);
    defeated.add(enemyId);
    data.defeatedEnemies = [...defeated];
    save(data);
  },
};
