/* ═══════════════════════════════════════════════════════════
   CONSTANTS & CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

const MAX_ENERGY = 3;
const HAND_SIZE = 5;
const PLAYER_MAX_HP = 30;
const VULNERABLE_MULTIPLIER = 1.25;
const WEAK_MULTIPLIER = 0.75;

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

const ALL_CARDS_UNLOCKED = false; // for testing

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

const ENEMY_STAGES = [
  // Stage 1
  [
    {
      id: 'icewolf',
      name: 'Ice Wolf',
      maxHp: 40,
      sprite: 'resources/enemies/enemy4.png',
      thumb: 'resources/enemies/enemy4checkpoint.png',
      attacks: [
        { id: 1, name: 'Maul', type: 'attack', value: 9 },
        { id: 2, name: 'Frost Curse', type: 'special', weak: 2 },
        { id: 3, name: 'Guard', type: 'defend', value: 8 },
      ],
      path: [1, 2, 1, 3],
      unlocks: [CARD_POWER_UP, CARD_CHOMP],
      expValue: 40,
    },
    {
      id: 'cursed',
      name: 'Cursed',
      maxHp: 40,
      sprite: 'resources/enemies/enemy6.png',
      thumb: 'resources/enemies/enemy6checkpoint.png',
      attacks: [
        { id: 1, name: 'Bite', type: 'attack', value: 9 },
        { id: 2, name: 'Hex', type: 'special', weak: 2 },
      ],
      path: [1, 1, 2],
      unlocks: [CARD_POWER_UP, CARD_CHOMP],
      expValue: 40,
    },
    {
      id: 'znichar',
      name: 'Znichar Beast',
      maxHp: 40,
      sprite: 'resources/enemies/enemy3.png',
      thumb: 'resources/enemies/enemy3checkpoint.png',
      attacks: [
        { id: 1, name: 'Chomp', type: 'attack', value: 9 },
        { id: 2, name: 'Weakening Roar', type: 'special', weak: 2 },
        { id: 3, name: 'Spiked Fury', type: 'special', strength: 1 },
        { id: 4, name: 'Spines Barrier', type: 'defend', value: 8 },
      ],
      path: [3, 1, 2, 1, 4],
      unlocks: [CARD_POWER_UP, CARD_CHOMP],
      expValue: 40,
    },
  ],
  // Stage 2
  [
    {
      id: 'frey',
      name: 'Frey the Water Dragon',
      maxHp: 50,
      sprite: 'resources/enemies/enemy5.png',
      thumb: 'resources/enemies/enemy5checkpoint.png',
      attacks: [
        { id: 1, name: 'Water Breath', type: 'attack', value: 15 },
        { id: 2, name: 'Bite', type: 'attack', value: 12 },
        { id: 3, name: 'Slash', type: 'attack', value: 10 },
        { id: 4, name: 'Crushing Tide', type: 'special', weak: 2 },
        { id: 5, name: 'Brace', type: 'defend', value: 12 },
      ],
      path: [4, 1, 5, 2, 3],
      unlocks: [CARD_REPEL, CARD_HEAL, CARD_BURN],
      expValue: 60,
    },
    {
      id: 'beryl',
      name: 'Beryl The Bronze Dragon',
      maxHp: 50,
      sprite: 'resources/enemies/enemy2.png',
      thumb: 'resources/enemies/enemy2checkpoint.png',
      attacks: [
        { id: 1, name: 'Dragon Bite', type: 'attack', value: 13 },
        { id: 2, name: 'Tail Swipe', type: 'attack', value: 11 },
        { id: 3, name: 'Bronze Claw', type: 'attack', value: 14 },
        { id: 4, name: 'Corroding Breath', type: 'special', vulnerable: 2 },
        { id: 5, name: 'Bronze Might', type: 'special', strength: 1 },
        { id: 6, name: 'Scales Barrier', type: 'defend', value: 12 },
      ],
      path: [5, 4, 1, 6, 3, 2],
      unlocks: [CARD_REPEL, CARD_HEAL, CARD_BURN],
      expValue: 60,
    },
  ],
  // Stage 3
  [
    {
      id: 'kera',
      name: 'Kera The Fire Dragoness',
      maxHp: 100,
      sprite: 'resources/enemies/enemy1.png',
      thumb: 'resources/enemies/enemy1checkpoint.png',
      attacks: [
        { id: 1, name: 'Flame Breath', type: 'attack', value: 16 },
        { id: 2, name: 'Inferno', type: 'attack', value: 18 },
        { id: 3, name: 'Tail Attack', type: 'attack', value: 13 },
        { id: 4, name: 'Searing Mark', type: 'special', vulnerable: 3 },
        { id: 5, name: 'Dragon Fury', type: 'special', strength: 2 },
        { id: 6, name: 'Ember Shield', type: 'defend', value: 15 },
      ],
      path: [5, 4, 2, 6, 1, 3],
      expValue: 100,
    },
  ],
];

// Active enemy lineup for the current run — one enemy rolled from each stage.
let ENEMIES = [];

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
            effects: [{ type: 'loseRandomCard', tone: 'negative' }],
          },
        ],
      },
      {
        label: 'Fight them (50% success)',
        outcomes: [
          {
            chance: 0.5,
            message: 'You defeat the bandits! You feel stronger.',
            effects: [{ type: 'maxHp', amount: 5, tone: 'positive' }],
          },
          {
            chance: 0.5,
            message: 'They overpower you and leave you bleeding.',
            effects: [{ type: 'hp', amount: -10, tone: 'negative' }],
          },
        ],
      },
    ],
  },
  {
    id: 'warriorMage',
    title: 'The Warrior mage',
    img: 'resources/encounters/warrior.jpg',
    description: 'You sense powerful mage riding toward you.',
    options: [
      {
        label: 'Devour him and claim his power (40% chance)',
        outcomes: [
          {
            chance: 0.4,
            message: 'His strength flows into your veins.',
            effects: [{ type: 'attackBonus', amount: 1, tone: 'positive' }],
          },
          {
            chance: 0.6,
            message: 'The warrior overpowers you before escaping.',
            effects: [{ type: 'hp', amount: -5, tone: 'negative' }],
          },
        ],
      },
      {
        label: 'Leave him alone',
        outcomes: [
          {
            chance: 1,
            message: 'The rider disappears into the distance.',
            effects: [],
          }
        ],
      },
    ],
  },
  {
    id: 'angryDragonGod',
    title: 'Dragon God',
    img: 'resources/encounters/dragonGod.jpg',
    description: 'You encounter a Dragnarok. The ancient dragon god offers you power - but at a cost.',
    options: [
      {
        label: 'Pray for a blessing (60% chance)',
        outcomes: [
          {
            chance: 0.6,
            message: 'A warm light flows over you, healing you.',
            effects: [{ type: 'hp', amount: 12, tone: 'positive' }],
          },
          {
            chance: 0.4,
            message: 'You get cursed.',
            effects: [{ type: 'hp', amount: -5, tone: 'negative' }],
          },
        ],
      },
      {
        label: 'Offer your blood (-6 HP)',
        outcomes: [
          {
            chance: 1,
            message: 'Power surges through your veins at a painful price.',
            effects: [{ type: 'hp', amount: -6, tone: 'negative' }, { type: 'attackBonus', amount: 1, tone: 'positive' }],
          },
        ],
      },
      {
        label: 'Leave',
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
    description: 'A shady merchant approaches. "Care to make a deal, traveler?"',
    options: [
      {
        label: 'Buy elixir (50% chance)',
        outcomes: [
          {
            chance: 0.5,
            message: 'Vitality surges through your body.',
            effects: [{ type: 'maxHp', amount: 5, tone: 'positive' }],
          },
          {
            chance: 0.5,
            message: 'It was poison!',
            effects: [{ type: 'hp', amount: -8, tone: 'negative' }],
          },
        ],
      },
      {
        label: 'Replace random card for strength potion',
        outcomes: [
          {
            chance: 1,
            message: 'You trade away a card.',
            effects: [{ type: 'loseRandomCard', tone: 'negative' }, { type: 'attackBonus', amount: 1, tone: 'positive' }],
          },
        ],
      },
      {
        label: 'Steal one of her wares (40% success)',
        outcomes: [
          {
            chance: 0.4,
            message: 'You stole a valuable item without being noticed.',
            effects: [{ type: 'addCard', cardId: CARD_CHOMP, tone: 'positive' }],
          },
          {
            chance: 0.6,
            message: "The merchant catches you and drives a dagger into your hand.",
            effects: [{ type: 'hp', amount: -10, tone: 'negative' }],
          },
        ],
      },
    ],
  },
];