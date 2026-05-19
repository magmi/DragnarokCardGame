/**
 * sprites.js
 * Inline SVG artwork for the Dragon and Player characters.
 * Injected into the DOM on load so they can be styled via CSS.
 */

const DRAGON_SVG = `
<svg class="dragon-svg" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <ellipse cx="55" cy="72" rx="28" ry="20" fill="#3a1a08"/>
  <ellipse cx="55" cy="68" rx="22" ry="16" fill="#5a2510"/>

  <!-- Tail -->
  <path d="M75 78 Q95 85 105 75 Q100 90 85 88 Z" fill="#3a1a08"/>
  <path d="M75 78 Q90 84 98 77" stroke="#c9401a" stroke-width="1.5" fill="none"/>

  <!-- Neck and head -->
  <path d="M45 55 Q40 40 38 30" stroke="#5a2510" stroke-width="12" stroke-linecap="round" fill="none"/>
  <ellipse cx="36" cy="24" rx="16" ry="12" fill="#5a2510"/>
  <ellipse cx="36" cy="24" rx="12" ry="9"  fill="#7a3518"/>

  <!-- Snout -->
  <path d="M22 24 Q18 27 20 30 Q26 34 32 30" fill="#5a2510"/>

  <!-- Eye -->
  <circle cx="30" cy="20" r="4"   fill="#ff6020"/>
  <circle cx="30" cy="20" r="2"   fill="#ff2000"/>
  <circle cx="31" cy="19" r="0.8" fill="white"/>

  <!-- Horns -->
  <path d="M38 14 Q36 4 32 8"  stroke="#8b4010" stroke-width="3"   stroke-linecap="round" fill="none"/>
  <path d="M44 12 Q46 2 50 6"  stroke="#8b4010" stroke-width="2.5" stroke-linecap="round" fill="none"/>

  <!-- Wings -->
  <path d="M38 58 Q10 30 5 50 Q20 55 38 65 Z"    fill="#3a1008" opacity="0.9"/>
  <path d="M72 58 Q100 30 105 50 Q90 55 72 65 Z" fill="#3a1008" opacity="0.9"/>
  <path d="M38 58 Q15 38 8 52"   stroke="#6a2010" stroke-width="1" fill="none"/>
  <path d="M72 58 Q97 38 102 52" stroke="#6a2010" stroke-width="1" fill="none"/>

  <!-- Claws -->
  <path d="M35 88 Q30 96 28 100 M35 88 Q33 97 31 102 M35 88 Q36 97 35 102"
        stroke="#8b4010" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M73 88 Q78 96 80 100 M73 88 Q75 97 77 102 M73 88 Q72 97 73 102"
        stroke="#8b4010" stroke-width="2" stroke-linecap="round" fill="none"/>

  <!-- Scale texture -->
  <path d="M50 60 Q55 57 60 60 M48 68 Q55 65 62 68 M52 76 Q55 73 58 76"
        stroke="#7a3010" stroke-width="1" fill="none" opacity="0.7"/>
</svg>`;

const PLAYER_SVG = `
<svg class="player-svg" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
  <!-- Cape -->
  <path d="M30 48 Q15 70 18 95 Q30 88 45 90 Q60 88 72 95 Q75 70 60 48 Z" fill="#1a0a2a"/>
  <path d="M32 50 Q20 72 22 90" stroke="#3a1a5a" stroke-width="1.5" fill="none"/>

  <!-- Body / Armor -->
  <rect x="28" y="45" width="34" height="36" rx="5" fill="#2a3a5a"/>
  <rect x="32" y="48" width="26" height="28" rx="3" fill="#3a4a7a"/>

  <!-- Armor detail lines -->
  <path d="M36 52 L54 52 M36 58 L54 58 M36 64 L54 64"
        stroke="#5a6a9a" stroke-width="1" opacity="0.5"/>
  <path d="M45 48 L45 76" stroke="#5a6aaa" stroke-width="1.5" opacity="0.4"/>

  <!-- Pauldrons -->
  <ellipse cx="27" cy="48" rx="8" ry="6" fill="#2a3a6a"/>
  <ellipse cx="63" cy="48" rx="8" ry="6" fill="#2a3a6a"/>

  <!-- Helmet -->
  <ellipse cx="45" cy="28" rx="14" ry="15" fill="#3a4a7a"/>
  <ellipse cx="45" cy="26" rx="12" ry="10" fill="#4a5a8a"/>

  <!-- Visor -->
  <path d="M33 26 Q45 32 57 26" fill="#1a2a4a"/>

  <!-- Eye glow through visor -->
  <path d="M38 24 Q45 28 52 24" stroke="#80c0ff" stroke-width="2.5" fill="none" opacity="0.9"/>

  <!-- Helmet crest -->
  <path d="M35 16 Q40 5 45 12 Q50 5 55 16" fill="#c9a84c" opacity="0.8"/>

  <!-- Sword arm -->
  <rect x="63" y="46" width="7"  height="30" rx="3" fill="#2a3a5a"/>
  <rect x="61" y="72" width="11" height="3"  rx="1.5" fill="#c9a84c"/>
  <rect x="64" y="74" width="5"  height="20" rx="2"   fill="#888888"/>
  <rect x="63" y="88" width="7"  height="2.5" rx="1"  fill="#c9a84c"/>

  <!-- Shield arm -->
  <ellipse cx="25" cy="64" rx="9" ry="12" fill="#2a4a7a"/>
  <ellipse cx="25" cy="64" rx="7" ry="9"  fill="#1a3a6a"/>
  <path d="M20 58 L30 58 L30 70 L25 74 L20 70 Z" fill="#c9a84c" opacity="0.3"/>

  <!-- Legs -->
  <rect x="30" y="78" width="12" height="22" rx="4" fill="#2a3060"/>
  <rect x="48" y="78" width="12" height="22" rx="4" fill="#2a3060"/>
  <rect x="29" y="96" width="14" height="7"  rx="3" fill="#1a2050"/>
  <rect x="47" y="96" width="14" height="7"  rx="3" fill="#1a2050"/>
</svg>`;

// Inject sprites into their placeholder containers
document.getElementById('enemy-sprite').innerHTML = '<img src="resources/enemy1.png" alt="Enemy" />';
document.getElementById('player-sprite').innerHTML = '<img src="resources/player.png" alt="Player" />';
