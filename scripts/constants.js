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
    id: CARD_POWER_UP, name: 'Power Up', cost: 1,
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
    img: 'resources/cards/cardRepel.png', desc: 'Gain 5 Block and Reflect 5 damage',
    type: 'special', value: 5,
    reflect: 5,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED,
  },
  burn: {
    id: CARD_BURN, name: 'Hell Fire', cost: 2,
    img: 'resources/cards/cardBurn.png', desc: 'Deal 5 damage and apply 5 burn',
    type: 'attack', value: 5, burn: 5,
    unlocked: ALL_CARDS_UNLOCKED,
    defaultUnlocked: ALL_CARDS_UNLOCKED
  }
};

const ENEMIES = [
  {
    id: 'znichar',
    name: 'Znichar Beast',
    maxHp: 4,
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
    maxHp: 5,
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
    maxHp: 10,
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

const ENCOUNTERS = [
  {
    id: 'banditToll',
    title: 'The Bandit Toll',
    img: 'resources/encounters/bandits.jpg',
    description: 'Bandits block your road! They demand all your valuables. What do you do?',
    options: [
      {
        label: 'Give them your valuables',
        outcomes: [
          {
            chance: 1,
            message: 'The group leaves. You lose some of your cards but avoid a fight.',
            effects: [{ type: 'loseRandomCard' }],
          },
        ],
      },
      {
        label: 'Fight them (50% success)',
        outcomes: [
          {
            chance: 0.5,
            message: 'You defeat the bandits! You feel stronger.',
            effects: [{ type: 'maxHp', amount: 5 }],
          },
          {
            chance: 0.5,
            message: 'They overpower you and leave you bleeding.',
            effects: [{ type: 'hp', amount: -10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'warriorMage',
    title: 'The Warrior mage',
    img: 'resources/encounters/warrior.jpg',
    description: 'You encounter skilled warrior on a horse.',
    options: [
      {
        label: 'Eat him and take his powers (40% chance)',
        outcomes: [
          {
            chance: 0.4,
            message: 'You feel stronger.',
            effects: [{ type: 'attackBonus', amount: 1 }],
          },
          {
            chance: 0.6,
            message: 'He was stronger',
            effects: [{ type: 'hp', amount: -5 }],
          },
        ],
      },
      {
        label: 'Let him be',
        outcomes: [
          {
            chance: 1,
            message: 'He went away.',
            effects: [{ type: 'maxHp', amount: 5 }],
          }
        ],
      },
    ],
  },
  {
    id: 'angryDragonGod',
    title: 'Dragon God',
    img: 'resources/encounters/dragonGod.jpg',
    description: 'You encounter a Dragnarok. The ancient dragon god offers you a boon — but at a cost.',
    options: [
      {
        label: 'Pray for a blessing (60% success)',
        outcomes: [
          {
            chance: 0.6,
            message: 'A warm light flows over you, knitting your wounds.',
            effects: [{ type: 'hp', amount: 12 }],
          },
          {
            chance: 0.4,
            message: 'The shrine spirit takes offense and lashes out.',
            effects: [{ type: 'hp', amount: -5 }],
          },
        ],
      },
      {
        label: 'Offer your blood (-6 HP)',
        outcomes: [
          {
            chance: 1,
            message: 'Power surges through your veins at a painful price.',
            effects: [{ type: 'hp', amount: -6 }, { type: 'attackBonus', amount: 2 }],
          },
        ],
      },
      {
        label: 'Leave it untouched',
        outcomes: [
          {
            chance: 1,
            message: 'Nothing happens.',
            effects: [],
          },
        ],
      },
    ],
  },
  {
    id: 'hoodedMerchant',
    title: 'The Hooded Merchant',
    img: 'resources/encounters/merchant.jpg',
    description: 'A cloaked figure beckons from a roadside stall lined with ' +
      'curious wares. "Care to make a deal, traveler?"',
    options: [
      {
        label: 'Buy the elixir (50% success)',
        outcomes: [
          {
            chance: 0.5,
            message: 'Vitality surges through your body — you feel hardier than ever.',
            effects: [{ type: 'maxHp', amount: 5 }],
          },
          {
            chance: 0.5,
            message: 'It was poison! Your stomach churns in agony.',
            effects: [{ type: 'hp', amount: -8 }],
          },
        ],
      },
      {
        label: 'Replace random card for strength potion',
        outcomes: [
          {
            chance: 1,
            message: 'You trade away a card.',
            effects: [{ type: 'loseRandomCard' }, { type: 'attackBonus', amount: 1 }],
          },
        ],
      },
      {
        label: 'Steal one of her wares (40% success)',
        outcomes: [
          {
            chance: 0.4,
            message: 'You slip a blade up your sleeve, unseen.',
            effects: [{ type: 'addCard', cardId: CARD_CHOMP }],
          },
          {
            chance: 0.6,
            message: "Caught! The merchant stabbed you in your toe.",
            effects: [{ type: 'hp', amount: -10 }],
          },
        ],
      },
    ],
  },
];