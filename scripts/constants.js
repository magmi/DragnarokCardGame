/* ═══════════════════════════════════════════════════════════
   CONSTANTS & CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

const MAX_ENERGY = 3;
const HAND_SIZE = 5;
const PLAYER_MAX_HP = 30;

const LEVEL_THRESHOLDS = [30, 60, 100, 150, 200];
const LEVELUP_ATK_BONUS = 1;
const LEVELUP_HP_BONUS = 5;

const CARD_STRIKE = 'strike';
const CARD_DEFEND = 'defend';
const CARD_POWER_UP = 'powerUp';
const CARD_CHOMP = 'chomp';
const CARD_HEAL = 'heal';
const CARD_REPEL = 'repel';
const CARD_BURN = 'burn';
const CARD_VULNERABLE = 'vulnerable'

const ALL_CARDS_UNLOCKED = false; // for testing: set to true to unlock all cards from the start

const CARD_DEFS = {
  strike: {
    id: CARD_STRIKE, name: 'Strike', cost: 1,
    img: 'resources/cards/cardStrike.png', desc: 'Deal 6 damage',
    type: 'attack', value: 6,
    unlocked: true,
    defaultUnlocked: true,
  },
  defend: {
    id: CARD_DEFEND, name: 'Defend', cost: 1,
    img: 'resources/cards/cardDefend.png', desc: 'Gain 5 Block',
    type: 'defend', value: 5,
    unlocked: true,
    defaultUnlocked: true,
  },
  vulnerable: {
    id: CARD_VULNERABLE, name: 'Bite', cost: 2,
    img: 'resources/cards/cardVulnerable.png', desc: 'Deal 10 damage and apply 3 vulnerable',
    type: 'attack', value: 10, vulnerable: 3,
    unlocked: true,
    defaultUnlocked: true
  },
  powerUp: {
    id: CARD_POWER_UP, name: 'Power Up', cost: 2,
    img: 'resources/cards/cardPowerUp.png', desc: 'Double next attack',
    type: 'special', multiplier: 2,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  chomp: {
    id: CARD_CHOMP, name: 'Chomp', cost: 1,
    img: 'resources/cards/cardChomp.png', desc: 'Deal 8 damage',
    type: 'attack', value: 8,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  heal: {
    id: CARD_HEAL, name: 'Heal', cost: 2,
    img: 'resources/cards/cardHeal.png', desc: 'Heal 8 HP',
    type: 'special', value: 8,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  repel: {
    id: CARD_REPEL, name: 'Repel', cost: 1,
    img: 'resources/cards/cardRepel.png', desc: 'Gain 3 Block and Reflect 3 damage',
    type: 'special', value: 3,
    reflect: 3,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  burn: {
    id: CARD_BURN, name: 'Hell Fire', cost: 2,
    img: 'resources/cards/cardBurn.png', desc: 'Deal 5 damage and apply 2 burn',
    type: 'attack', value: 5, burn: 2,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED
  }
};
const ENEMIES = [
  {
    id: 'znichar',
    name: 'Znichar Beast',
    maxHp: 40,
    sprite: 'resources/enemies/enemy3.png',
    thumb: 'resources/enemies/enemy3checkpoint.png',
    attacks: [
      { id: 'attack1', name: 'Claws Strike', type: 'attack', value: 10 },
      { id: 'attack2', name: 'Bite', type: 'attack', value: 12 },
      { id: 'attack3', name: 'Power Claw', type: 'attack', value: 8 },
      { id: 'attack4', name: 'Chomp', type: 'attack', value: 9 },
      { id: 'defend1', name: 'Spines Barrier', type: 'defend', value: 8 },
    ],
    unlocks: [CARD_POWER_UP, CARD_CHOMP],
    expValue: 40,
  },
  {
    id: 'beryl',
    name: 'Beryl The Bronze Dragon',
    maxHp: 50,
    sprite: 'resources/enemies/enemy2.png',
    thumb: 'resources/enemies/enemy2checkpoint.png',
    attacks: [
      { id: 'attack1', name: 'Dragon Bite', type: 'attack', value: 10 },
      { id: 'attack2', name: 'Dragon Bite', type: 'attack', value: 9 },
      { id: 'attack3', name: 'Dragon Bite', type: 'attack', value: 11 },
      { id: 'attack4', name: 'Dragon Bite', type: 'attack', value: 12 },
      { id: 'defend1', name: 'Scales Barrier', type: 'defend', value: 10 },
    ],
    unlocks: [CARD_REPEL, CARD_HEAL, CARD_BURN],
    expValue: 60,
  },
  {
    id: 'kera',
    name: 'Kera The Fire Dragoness',
    maxHp: 100,
    sprite: 'resources/enemies/enemy1.png',
    thumb: 'resources/enemies/enemy1checkpoint.png',
    attacks: [
      { id: 'attack1', name: 'Flame Breath', type: 'attack', value: 15 },
      { id: 'attack2', name: 'Flame Breath', type: 'attack', value: 14 },
      { id: 'attack3', name: 'Flame Breath', type: 'attack', value: 10 },
      { id: 'attack4', name: 'Flame Breath', type: 'attack', value: 12 },
      { id: 'defend1', name: 'Ember Shield', type: 'defend', value: 12 },
    ],
    expValue: 100,
  },
];

const STARTING_DECK =
  ALL_CARDS_UNLOCKED
    ? [CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_DEFEND, CARD_DEFEND, CARD_POWER_UP, CARD_CHOMP, CARD_HEAL, CARD_REPEL, CARD_BURN, CARD_VULNERABLE]
    : [CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_DEFEND, CARD_DEFEND, CARD_DEFEND, CARD_DEFEND, CARD_VULNERABLE];