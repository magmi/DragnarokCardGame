/* ═══════════════════════════════════════════════════════════
   1. CONSTANTS & CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

const MAX_ENERGY = 3;
const HAND_SIZE = 5;
const PLAYER_MAX_HP = 30;

const CARD_STRIKE = 'strike';
const CARD_DEFEND = 'defend';
const CARD_POWER_UP = 'powerUp';
const CARD_CHOMP = 'chomp';
const CARD_HEAL = 'heal';
const CARD_REPEL = 'repel';

const ALL_CARDS_UNLOCKED = true; // for testing: set to true to unlock all cards from the start
/**
 * Card definitions. Each card has:
 *   id     — matches key, used as CSS class name
 *   name   — display name
 *   cost   — energy cost
 *   art    — emoji icon fallback
 *   img    — image asset used for card art
 *   desc   — flavour / effect description shown on card
 *   type   — 'attack' | 'defend' | 'repel'
 *   value  — damage dealt or block gained
 */

const CARD_DEFS = {
  strike: {
    id: 'strike', name: 'Strike', cost: 1,
    art: '⚔️', img: 'resources/cardStrike.png', desc: 'Deal 6 damage',
    type: 'attack', value: 6,
    unlocked: true,
    defaultUnlocked: true,
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1,
    art: '🛡️', img: 'resources/cardDefend.png', desc: 'Gain 5 Block',
    type: 'defend', value: 5,
    unlocked: true,
    defaultUnlocked: true,
  },
  powerUp: {
    id: 'powerUp', name: 'Power Up', cost: 2,
    art: '⚡', img: 'resources/cardPowerUp.png', desc: 'Double next attack',
    type: 'power', multiplier: 2,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  chomp: {
    id: 'chomp', name: 'Chomp', cost: 1,
    art: '⚔️', img: 'resources/cardChomp.png', desc: 'Deal 8 damage',
    type: 'attack', value: 8,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  heal: {
    id: 'heal', name: 'Heal', cost: 2,
    art: '❤️', img: 'resources/cardHeal.png', desc: 'Heal 8 HP',
    type: 'heal', value: 8,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  repel: {
    id: 'repel', name: 'Repel', cost: 1,
    art: '🛡️', img: 'resources/cardRepel.png', desc: 'Gain 3 Block and Reflect 3 damage',
    type: 'repel', value: 3,
    reflect: 3,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  }
};
const ENEMIES = [
  {
    id: 'znichar',
    name: 'Znichar Beast',
    maxHp: 20,
    sprite: 'resources/enemy3.png',
    thumb: 'resources/enemy3checkpoint.png',
    attacks: [
      { id: 'claw', name: 'Claws Strike', type: 'attack', value: 10 },
      { id: 'powerClaw', name: 'Power Claw', type: 'attack', value: 16 },
      { id: 'spinesBarrier', name: 'Spines Barrier', type: 'defend', value: 8 },
    ],
    unlocks: ['powerUp', 'chomp'],
  },
  {
    id: 'beryl',
    name: 'Beryl The Bronze Dragon',
    maxHp: 20,
    sprite: 'resources/enemy2.png',
    thumb: 'resources/enemy2checkpoint.png',
    attacks: [
      { id: 'bite', name: 'Dragon Bite', type: 'attack', value: 7 },
      { id: 'scalesBarrier', name: 'Scales Barrier', type: 'defend', value: 10 },
    ],
    unlocks: ['repel', 'heal'],
  },
    {
    id: 'kera',
    name: 'Kera The Fire Dragoness',
    maxHp: 20,
    sprite: 'resources/enemy1.png',
    thumb: 'resources/enemy1checkpoint.png',
    attacks: [
      { id: 'flameBreath', name: 'Flame Breath', type: 'attack', value: 15 },
      { id: 'emberShield', name: 'Ember Shield', type: 'defend', value: 12 },
    ],

  },
];

/** The player's starting deck (card IDs). */
const STARTING_DECK =
  ALL_CARDS_UNLOCKED
    ? [CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_DEFEND, CARD_DEFEND, CARD_POWER_UP, CARD_CHOMP, CARD_HEAL, CARD_REPEL]
    : [CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_DEFEND, CARD_DEFEND, CARD_DEFEND, CARD_DEFEND];