'use strict';

const TEAMS = [
  { id: 'fenerbahce', name: 'Fenerbahçe', short: 'FB', primary: '#0b2a6f', secondary: '#ffd21f', logo: 'assets/logos/fenerbahce.png' },
  { id: 'galatasaray', name: 'Galatasaray', short: 'GS', primary: '#a90428', secondary: '#ffc629', logo: 'assets/logos/galatasaray.png' },
  { id: 'besiktas', name: 'Beşiktaş', short: 'BJK', primary: '#111111', secondary: '#ffffff', logo: 'assets/logos/besiktas.png' },
  { id: 'trabzonspor', name: 'Trabzonspor', short: 'TS', primary: '#781f38', secondary: '#57a7d8', logo: 'assets/logos/trabzonspor.png' },
  { id: 'bursaspor', name: 'Bursaspor', short: 'BS', primary: '#178a45', secondary: '#ffffff', logo: 'assets/logos/bursaspor.png' },
  { id: 'antalyaspor', name: 'Antalyaspor', short: 'ANT', primary: '#d71920', secondary: '#ffffff', logo: 'assets/logos/antalyaspor.png' },
  { id: 'ankaragucu', name: 'Ankaragücü', short: 'AG', primary: '#f4c300', secondary: '#063b86', logo: 'assets/logos/ankaragucu.png' },
  { id: 'konyaspor', name: 'Konyaspor', short: 'KON', primary: '#118c46', secondary: '#ffffff', logo: 'assets/logos/konyaspor.png' },
  { id: 'sivasspor', name: 'Sivasspor', short: 'SIV', primary: '#d51c29', secondary: '#ffffff', logo: 'assets/logos/sivasspor.png' },
  { id: 'kayserispor', name: 'Kayserispor', short: 'KAY', primary: '#d71920', secondary: '#ffce00', logo: 'assets/logos/kayserispor.png' },
  { id: 'gaziantep', name: 'Gaziantep FK', short: 'GFK', primary: '#d4001f', secondary: '#101010', logo: 'assets/logos/gaziantep.png' },
  { id: 'basaksehir', name: 'Başakşehir', short: 'IB', primary: '#f58220', secondary: '#0b254f', logo: 'assets/logos/basaksehir.png' },
  { id: 'genclerbirligi', name: 'Gençlerbirliği', short: 'GB', primary: '#d71920', secondary: '#111111', logo: 'assets/logos/genclerbirligi.png' },
  { id: 'goztepe', name: 'Göztepe', short: 'GÖZ', primary: '#d71920', secondary: '#ffd100', logo: 'assets/logos/goztepe.png' },
  { id: 'kocaelispor', name: 'Kocaelispor', short: 'KOC', primary: '#128c44', secondary: '#111111', logo: 'assets/logos/kocaelispor.png' },
  { id: 'denizlispor', name: 'Denizlispor', short: 'DEN', primary: '#178a45', secondary: '#111111', logo: 'assets/logos/denizlispor.png' },
  { id: 'eskisehirspor', name: 'Eskişehirspor', short: 'ES', primary: '#d71920', secondary: '#111111', logo: 'assets/logos/eskisehirspor.png' },
  { id: 'samsunspor', name: 'Samsunspor', short: 'SAM', primary: '#d71920', secondary: '#ffffff', logo: 'assets/logos/samsunspor.png' },
  { id: 'adanademirspor', name: 'Adana Demirspor', short: 'ADS', primary: '#54bceb', secondary: '#0b3472', logo: 'assets/logos/adanademirspor.png' },
  { id: 'rizespor', name: 'Çaykur Rizespor', short: 'RIZ', primary: '#1a9b5b', secondary: '#1e8fd3', logo: 'assets/logos/rizespor.png' },
];

const W = 1120;
const H = 720;
const GOAL = { x: 300, y: 160, w: 520, h: 260 };
const BALL_START = { x: 560, y: 565 };
const PLAYER_POS = { x: 480, y: 598 };
const KEEPER_HOME = { x: 560, y: 310 };
const CONTROL_BARS = {
  direction: { x: 144, y: 636, w: 286, h: 38, label: 'DIRECTION', left: 'LEFT', right: 'RIGHT' },
  height: { x: 461, y: 636, w: 286, h: 38, label: 'HEIGHT', left: 'LOW', right: 'HIGH' },
  power: { x: 778, y: 636, w: 286, h: 38, label: 'POWER', left: 'SLOW', right: 'FAST' },
};
const CONTROL_ORDER = ['direction', 'height', 'power'];

const screens = {
  menu: document.getElementById('menuScreen'),
  how: document.getElementById('howScreen'),
  team: document.getElementById('teamScreen'),
  preview: document.getElementById('previewScreen'),
  game: document.getElementById('gameScreen'),
  final: document.getElementById('finalScreen'),
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasHint = document.getElementById('canvasHint');

let selectedTeam = null;
let opponentTeam = null;
let soundEnabled = true;
let lastTime = 0;
let animationId = 0;
let logoImages = new Map();
let crowdDots = [];

const audioManager = {
  enabled: true,
  unlocked: false,
  crowd: null,
  whistle: null,
  crowdAvailable: true,
  whistleAvailable: true,

  init() {
    try {
      this.crowd = new Audio('assets/audio/crowd-loop.mp3');
      this.crowd.loop = true;
      this.crowd.volume = 0.2;
      this.crowd.preload = 'auto';
      this.crowd.addEventListener('error', () => {
        this.crowdAvailable = false;
      }, { once: true });
    } catch (_) {
      this.crowdAvailable = false;
      this.crowd = null;
    }

    try {
      this.whistle = new Audio('assets/audio/whistle.mp3');
      this.whistle.volume = 0.7;
      this.whistle.preload = 'auto';
      this.whistle.addEventListener('error', () => {
        this.whistleAvailable = false;
      }, { once: true });
    } catch (_) {
      this.whistleAvailable = false;
      this.whistle = null;
    }
  },

  unlock() {
    this.unlocked = true;
  },

  setEnabled(value) {
    this.enabled = value;
    soundEnabled = value;
    if (!value) {
      this.stopCrowd();
    } else if (screens.game.classList.contains('active')) {
      this.playCrowd();
    }
  },

  playCrowd() {
    if (!this.enabled || !this.unlocked || !this.crowd || !this.crowdAvailable) return;
    this.crowd.volume = 0.2;
    const playPromise = this.crowd.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Browsers can still reject playback; gameplay should continue silently.
      });
    }
  },

  stopCrowd() {
    if (!this.crowd) return;
    try {
      this.crowd.pause();
    } catch (_) {
      // Missing or blocked audio should never break gameplay.
    }
  },

  playWhistle() {
    if (!this.enabled || !this.unlocked || !this.whistle || !this.whistleAvailable) return;
    try {
      this.whistle.currentTime = 0;
      const playPromise = this.whistle.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Ignore blocked/missing audio without repeated console noise.
        });
      }
    } catch (_) {
      // Silent fallback.
    }
  },

  playWhistleBefore(callback) {
    if (!this.enabled || !this.unlocked || !this.whistle || !this.whistleAvailable) {
      callback();
      return;
    }

    let done = false;
    let timeoutId = 0;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timeoutId);
      this.whistle.removeEventListener('ended', finish);
      callback();
    };

    try {
      this.whistle.pause();
      this.whistle.currentTime = 0;
      this.whistle.addEventListener('ended', finish, { once: true });
      timeoutId = window.setTimeout(finish, 1200);
      const playPromise = this.whistle.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          window.setTimeout(finish, 120);
        });
      }
    } catch (_) {
      window.setTimeout(finish, 0);
    }
  },
};

const game = {
  mode: 'menu',
  phaseMessage: '',
  round: 1,
  suddenDeath: false,
  playerGoals: 0,
  opponentGoals: 0,
  playerPoints: 0,
  tournamentWins: 0,
  lastMatchWon: false,
  matchAwarded: false,
  playerHistory: [],
  opponentHistory: [],
  activeControl: 'direction',
  controlValue: {
    direction: 0.5,
    height: 0.5,
    power: 0.5,
  },
  lockedShot: {
    direction: 0.5,
    height: 0.5,
    power: 0.5,
  },
  markers: {
    direction: { t: 0.5, dir: 1 },
    height: { t: 0.5, dir: 1 },
    power: { t: 0.5, dir: 1 },
  },
  shot: null,
  waitingForWhistle: false,
  keeper: {
    x: KEEPER_HOME.x,
    y: KEEPER_HOME.y,
    tx: KEEPER_HOME.x,
    ty: KEEPER_HOME.y,
    lean: 0,
  },
  pendingOpponentShot: null,
  opponentHint: {
    active: false,
    x: 0,
    y: 0,
    elapsed: 0,
    duration: 1.2,
    alpha: 0,
  },
  frameImpact: null,
  netRipple: null,
  resultTimer: 0,
  mouse: { x: 0, y: 0 },
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function safeTextInitials(name, fallback) {
  if (fallback) return fallback;
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function setupTeamCardVars(element, team) {
  element.style.setProperty('--team-primary', team.primary);
  element.style.setProperty('--team-secondary', team.secondary);
}

function createLogoElement(team, className = 'team-logo-wrap') {
  const wrap = document.createElement('div');
  wrap.className = className;
  setupTeamCardVars(wrap, team);

  const fallback = document.createElement('span');
  fallback.className = 'logo-fallback';
  fallback.textContent = safeTextInitials(team.name, team.short);
  wrap.appendChild(fallback);

  const img = document.createElement('img');
  img.src = team.logo;
  img.alt = `${team.name} logo`;
  img.onload = () => {
    fallback.style.display = 'none';
  };
  img.onerror = () => {
    img.remove();
    fallback.style.display = 'block';
  };
  wrap.appendChild(img);

  return wrap;
}

function loadLogoImages() {
  TEAMS.forEach((team) => {
    const image = new Image();
    image.onload = () => {
      logoImages.set(team.id, { image, loaded: true });
    };
    image.onerror = () => {
      logoImages.set(team.id, { image: null, loaded: false });
    };
    image.src = team.logo;
  });
}

function renderTeamGrid() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = '';

  TEAMS.forEach((team) => {
    const button = document.createElement('button');
    button.className = 'team-card';
    setupTeamCardVars(button, team);
    button.type = 'button';
    button.dataset.teamId = team.id;

    const logo = createLogoElement(team);
    const name = document.createElement('p');
    name.className = 'team-name';
    name.textContent = team.name;

    button.appendChild(logo);
    button.appendChild(name);

    button.addEventListener('click', () => selectTeam(team));
    grid.appendChild(button);
  });
}

function selectTeam(team) {
  selectedTeam = team;
  document.querySelectorAll('.team-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.teamId === team.id);
  });
  document.getElementById('continueBtn').disabled = false;
}

function chooseOpponent() {
  let candidates = TEAMS.filter((team) => team.id !== selectedTeam.id && team.id !== opponentTeam?.id);
  if (candidates.length === 0) {
    candidates = TEAMS.filter((team) => team.id !== selectedTeam.id);
  }
  opponentTeam = candidates[Math.floor(Math.random() * candidates.length)];
}

function setPreviewLogo(containerId, team) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.replaceWith(createLogoElement(team, 'preview-logo'));
  const newElement = document.querySelector(`#${containerId}`);
  if (newElement) return;
}

function fillLogoSlot(slotId, team, className) {
  const old = document.getElementById(slotId);
  const fresh = createLogoElement(team, className);
  fresh.id = slotId;
  old.replaceWith(fresh);
}

function preparePreview() {
  chooseOpponent();
  fillLogoSlot('playerPreviewLogo', selectedTeam, 'preview-logo');
  fillLogoSlot('opponentPreviewLogo', opponentTeam, 'preview-logo');
  document.getElementById('playerPreviewName').textContent = selectedTeam.name;
  document.getElementById('opponentPreviewName').textContent = opponentTeam.name;
  showScreen('preview');
}

function resetGame(options = {}) {
  const { newTournament = false } = options;
  if (newTournament) {
    game.tournamentWins = 0;
    game.playerPoints = 0;
    game.lastMatchWon = false;
    game.matchAwarded = false;
  }
  game.mode = 'playerAim';
  game.phaseMessage = 'Select shot direction';
  game.round = 1;
  game.suddenDeath = false;
  game.playerGoals = 0;
  game.opponentGoals = 0;
  game.matchAwarded = false;
  game.playerHistory = [];
  game.opponentHistory = [];
  resetShotControls();
  resetOpponentHint();
  game.frameImpact = null;
  game.netRipple = null;
  game.shot = null;
  game.waitingForWhistle = false;
  game.keeper = { x: KEEPER_HOME.x, y: KEEPER_HOME.y, tx: KEEPER_HOME.x, ty: KEEPER_HOME.y, lean: 0 };
  game.resultTimer = 0;
  canvasHint.textContent = 'Click the active control or press Space.';
}

function resetShotControls() {
  game.activeControl = 'direction';
  game.markers = {
    direction: { t: Math.random(), dir: Math.random() < 0.5 ? -1 : 1 },
    height: { t: Math.random(), dir: Math.random() < 0.5 ? -1 : 1 },
    power: { t: Math.random(), dir: Math.random() < 0.5 ? -1 : 1 },
  };
  game.controlValue = {
    direction: game.markers.direction.t,
    height: game.markers.height.t,
    power: game.markers.power.t,
  };
  game.lockedShot = { direction: 0.5, height: 0.5, power: 0.5 };
}

function resetOpponentHint() {
  game.pendingOpponentShot = null;
  game.opponentHint = {
    active: false,
    x: 0,
    y: 0,
    elapsed: 0,
    duration: 1.2,
    alpha: 0,
  };
}

function tournamentDifficultyLevel() {
  return Math.max(0, game.tournamentWins);
}

function shouldShowOpponentHint() {
  // The save hint is visible only for the first two won matches.
  // After winning match 2, the next opponents shoot without showing the target hint.
  return game.tournamentWins < 2;
}

function currentMatchLabel() {
  return `Match ${game.tournamentWins + 1}`;
}


function startGame(options = {}) {
  resetGame(options);
  showScreen('game');
  audioManager.playCrowd();
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function startNextMatch() {
  chooseOpponent();
  startGame({ newTournament: false });
}

function playTone(type = 'click') {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type === 'goal' ? 'triangle' : type === 'save' ? 'square' : 'sine';
    oscillator.frequency.value = type === 'goal' ? 560 : type === 'save' ? 180 : 330;
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (_) {
    // Silent fallback for browsers that block audio before user interaction.
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
  lastTime = now;

  update(dt);
  draw();

  if (screens.game.classList.contains('active')) {
    animationId = requestAnimationFrame(loop);
  }
}

function update(dt) {
  updateGoalEffects(dt);

  if (game.mode === 'playerAim') {
    updateControlMarkers(dt);
  } else if (game.mode === 'goalkeeperPick') {
    updateOpponentHint(dt);
  } else if (game.mode === 'playerShot' || game.mode === 'opponentShot') {
    updateShot(dt);
  } else if (game.mode === 'resultPause') {
    updateBallRebound(dt);
    game.resultTimer -= dt;
    if (game.resultTimer <= 0) {
      advanceAfterResult();
    }
  }

  updateKeeper(dt);
}

function updateGoalEffects(dt) {
  if (game.frameImpact) {
    game.frameImpact.time += dt;
    if (game.frameImpact.time >= game.frameImpact.duration) {
      game.frameImpact = null;
    }
  }

  if (game.netRipple) {
    game.netRipple.time += dt;
    if (game.netRipple.time >= game.netRipple.duration) {
      game.netRipple = null;
    }
  }
}

function updateOpponentHint(dt) {
  const hint = game.opponentHint;
  if (!hint.active) return;

  hint.elapsed += dt;
  const remaining = Math.max(0, hint.duration - hint.elapsed);
  const fadeWindow = Math.min(0.28, hint.duration * 0.45);
  hint.alpha = clamp(remaining / fadeWindow, 0, 1);

  if (hint.elapsed >= hint.duration) {
    hint.active = false;
    hint.alpha = 0;
    if (game.mode === 'goalkeeperPick') {
      game.phaseMessage = 'Choose your save spot!';
      canvasHint.textContent = 'Click inside the goal to choose your goalkeeper dive spot.';
    }
  }
}

function currentDifficulty() {
  // Difficulty is fixed during a match and increases only after winning matches.
  return Math.min(2.35, 0.72 + tournamentDifficultyLevel() * 0.18);
}

function updateControlMarkers(dt) {
  if (game.mode !== 'playerAim' || game.waitingForWhistle) return;

  const speed = currentDifficulty();
  const marker = game.markers[game.activeControl];
  if (!marker) return;

  marker.t += marker.dir * speed * dt;
  if (marker.t > 1) {
    marker.t = 1;
    marker.dir = -1;
  } else if (marker.t < 0) {
    marker.t = 0;
    marker.dir = 1;
  }
  game.controlValue[game.activeControl] = marker.t;
}

function updateKeeper(dt) {
  const ease = Math.min(1, dt * 10.5);
  game.keeper.x += (game.keeper.tx - game.keeper.x) * ease;
  game.keeper.y += (game.keeper.ty - game.keeper.y) * ease;

  const diveX = clamp((game.keeper.tx - KEEPER_HOME.x) / 155, -1.25, 1.25);
  const diveY = clamp((KEEPER_HOME.y - game.keeper.ty) / 130, -0.7, 0.9);
  const diveDistance = Math.hypot(game.keeper.tx - KEEPER_HOME.x, game.keeper.ty - KEEPER_HOME.y);
  const diveAmount = clamp(diveDistance / 145, 0, 1);

  // Lean combines horizontal dive and high-shot stretch. This makes the keeper rotate
  // like a real dive instead of only sliding left/right.
  const targetLean = diveAmount > 0.12 ? diveX * (0.95 + Math.max(0, diveY) * 0.18) : 0;
  game.keeper.lean += (targetLean - game.keeper.lean) * ease;
}

function updateShot(dt) {
  if (!game.shot) return;
  game.shot.time += dt * game.shot.speedMultiplier;

  const kickDelay = game.shot.kickDelay || 0;
  const flightTime = Math.max(0, game.shot.time - kickDelay);
  const t = Math.min(1, flightTime / game.shot.duration);

  // Before the player's foot reaches the ball, keep the ball on the penalty spot.
  // This creates a real run-up/kick moment instead of the ball moving immediately.
  if (flightTime <= 0) {
    game.shot.x = game.shot.start.x;
    game.shot.y = game.shot.start.y;
    game.shot.scale = 1.55;
    game.shot.shadowX = game.shot.start.x;
    game.shot.shadowY = game.shot.start.y + 9;
    game.shot.shadowScale = 1.08;
  } else {
    if (game.shot.shooter === 'player' && game.phaseMessage === 'Run up!') {
      game.phaseMessage = 'Shot!';
    }

    const eased = easeInOutCubic(t);

    // More realistic ball physics:
    // - x movement is still controlled by Direction.
    // - y movement uses a curved flight path instead of a straight line.
    // - High + low-power shots behave like a Panenka: slow chip, rises first, then drops.
    // - High + high-power shots can still fly over the bar.
    const x = lerp(game.shot.start.x, game.shot.target.x, eased);
    const lineY = lerp(game.shot.start.y, game.shot.target.y, eased);
    const arc = Math.sin(Math.PI * eased) * game.shot.arcLift;
    const lateDrop = Math.pow(eased, 2.2) * game.shot.gravityDrop;

    game.shot.x = x;
    game.shot.y = lineY - arc + lateDrop;
    game.shot.scale = lerp(1.55, game.shot.endScale || 0.62, eased);
    game.shot.shadowX = x;
    game.shot.shadowY = lineY + lateDrop + Math.min(34, arc * 0.32);
    game.shot.shadowScale = game.shot.scale * lerp(1, 0.55, clamp(arc / 150, 0, 1));
    game.shot.rotation += dt * (5 + game.shot.power * 15);
  }

  if (t > 0.38) {
    const keeperEase = Math.min(1, (t - 0.38) / 0.42);
    game.keeper.tx = lerp(KEEPER_HOME.x, game.shot.keeperTarget.x, easeOutCubic(keeperEase));
    game.keeper.ty = lerp(KEEPER_HOME.y, game.shot.keeperTarget.y, easeOutCubic(keeperEase));
  }

  if (t >= 1) {
    finishShot();
  }
}


function updateBallRebound(dt) {
  const shot = game.shot;
  if (!shot || !shot.rebound) return;

  const r = shot.rebound;
  r.time += dt;

  // Keep a short motion trail so a fast save looks like a real deflection.
  r.trail.push({ x: shot.x, y: shot.y, scale: shot.scale, alpha: 0.34 });
  if (r.trail.length > 9) r.trail.shift();
  r.trail.forEach((point) => {
    point.alpha *= Math.pow(0.25, dt);
  });

  // Real rebound physics: velocity + gravity + bounce + friction.
  // y grows toward the player/camera; z is the ball height above the pitch.
  r.vz -= r.gravity * dt;
  r.x += r.vx * dt;
  r.y += r.vy * dt;
  r.z += r.vz * dt;

  // Wall/post-ish side limits so the ball can glance away without leaving the screen instantly.
  if (r.x < 42) {
    r.x = 42;
    r.vx = Math.abs(r.vx) * 0.58;
  } else if (r.x > W - 42) {
    r.x = W - 42;
    r.vx = -Math.abs(r.vx) * 0.58;
  }

  // When the ball hits the ground, it bounces once or twice and loses speed.
  if (r.z <= 0) {
    r.z = 0;
    if (Math.abs(r.vz) > 86 && r.bounces < 2) {
      r.vz = -r.vz * r.bounceDamping;
      r.vx *= 0.74;
      r.vy *= 0.70;
      r.bounces += 1;
      r.squash = 1;
    } else {
      r.vz = 0;
      r.onGround = true;
    }
  }

  const friction = r.onGround ? 0.055 : 0.42;
  r.vx *= Math.pow(friction, dt);
  r.vy *= Math.pow(friction, dt);
  r.spin *= Math.pow(r.onGround ? 0.20 : 0.62, dt);
  r.squash *= Math.pow(0.03, dt);

  // Perspective: as the ball comes back toward the penalty spot, it becomes larger.
  const perspective = clamp((r.y - GOAL.y) / (BALL_START.y - GOAL.y), 0, 1);
  shot.x = r.x;
  shot.y = r.y - r.z;
  shot.scale = lerp(0.58, 1.36, perspective) * (1 + Math.min(0.08, r.z / 950));
  shot.shadowX = r.x;
  shot.shadowY = r.y + 8;
  shot.shadowScale = shot.scale * lerp(1, 0.58, clamp(r.z / 170, 0, 1));
  shot.rotation += dt * r.spin;

  // End the rebound when the ball has visibly slowed down or after a safe timeout.
  const speed = Math.hypot(r.vx, r.vy) + Math.abs(r.vz) * 0.45;
  if ((r.time > 0.75 && speed < 70 && r.onGround) || r.time > r.maxTime || r.y > H - 62) {
    r.done = true;
    r.vx = 0;
    r.vy = 0;
    r.vz = 0;
    r.spin = 0;
    r.z = 0;
    shot.y = r.y;
  }
}

function finishShot() {
  const shot = game.shot;
  if (!shot) return;

  const result = evaluateShot(shot);
  shot.result = result;

  if (result.saved) {
    initializeSavedRebound(shot);
  } else if (result.frameHit) {
    initializeFrameRebound(shot, result);
  } else if (result.goal) {
    initializeNetRipple(shot);
  }

  if (shot.shooter === 'player') {
    game.playerHistory.push(result.goal);
    if (result.goal) {
      game.playerGoals += 1;
      game.playerPoints += 100;
      playTone('goal');
    } else {
      playTone(result.saved ? 'save' : 'miss');
    }
  } else {
    game.opponentHistory.push(result.goal);
    if (result.goal) {
      game.opponentGoals += 1;
      playTone('goal');
    } else {
      if (result.saved) {
        game.playerPoints += 50;
      }
      playTone(result.saved ? 'save' : 'miss');
    }
  }

  game.mode = 'resultPause';
  game.phaseMessage = result.label;
  // Saves, frame hits, and goals need a little more time so rebound/net animation can be seen clearly.
  game.resultTimer = (result.saved || result.frameHit) ? 2.05 : (result.goal ? 1.85 : 1.45);
}


function initializeSavedRebound(shot) {
  const savePoint = {
    x: lerp(shot.x, shot.keeperTarget.x, 0.58),
    y: lerp(shot.y, shot.keeperTarget.y, 0.58),
  };

  const keeperSide = clamp((shot.keeperTarget.x - KEEPER_HOME.x) / 175, -1, 1);
  const shotSide = clamp((shot.target.x - (GOAL.x + GOAL.w / 2)) / (GOAL.w / 2), -1, 1);
  const heightFactor = clamp((GOAL.y + GOAL.h - shot.target.y) / GOAL.h, 0, 1);
  const powerFactor = clamp(shot.power, 0, 1);
  const panenkaFactor = shot.isPanenka ? 1 : 0;

  // Deflection direction:
  // - diving saves push the ball to the same side as the dive
  // - central saves send it back toward the penalty spot with a slight random side
  const side = Math.abs(keeperSide) > 0.20
    ? keeperSide
    : (Math.abs(shotSide) > 0.12 ? shotSide * 0.65 : (Math.random() < 0.5 ? -0.55 : 0.55));

  const powerKick = lerp(0.70, 1.35, powerFactor);
  const chipFloat = heightFactor * 0.45 + panenkaFactor * 0.32;

  const vx = side * randomRange(210, 360) * powerKick;
  const vy = randomRange(245, 430) * (0.82 + powerFactor * 0.36 - panenkaFactor * 0.18);
  const vz = randomRange(210, 360) * (0.70 + chipFloat) + (powerFactor > 0.72 ? 65 : 0);

  shot.rebound = {
    time: 0,
    maxTime: 1.85,
    x: savePoint.x,
    y: savePoint.y,
    z: Math.max(8, heightFactor * 42),
    vx,
    vy,
    vz,
    gravity: 780,
    bounceDamping: lerp(0.34, 0.48, powerFactor),
    bounces: 0,
    onGround: false,
    squash: 0,
    spin: (side >= 0 ? 1 : -1) * randomRange(18, 30) * (0.85 + powerFactor * 0.45),
    trail: [],
    done: false,
  };

  // Start the visible rebound from the actual save contact point.
  shot.x = savePoint.x;
  shot.y = savePoint.y;
  shot.scale = Math.max(0.58, shot.scale);
}

function initializeFrameRebound(shot, result) {
  const point = result.impact || shot.target;
  const isCrossbar = result.type === 'crossbar';
  const side = isCrossbar
    ? clamp((point.x - (GOAL.x + GOAL.w / 2)) / (GOAL.w / 2), -0.75, 0.75)
    : (result.side === 'left' ? -1 : 1);
  const powerFactor = clamp(shot.power, 0, 1);

  game.frameImpact = {
    x: point.x,
    y: point.y,
    time: 0,
    duration: 0.45,
    type: result.type,
  };

  shot.rebound = {
    time: 0,
    maxTime: 1.65,
    x: point.x,
    y: point.y,
    z: isCrossbar ? 18 : 8,
    vx: (isCrossbar ? side || (Math.random() < 0.5 ? -0.45 : 0.45) : side) * randomRange(230, 390) * (0.85 + powerFactor * 0.45),
    vy: isCrossbar ? randomRange(230, 360) : randomRange(260, 430),
    vz: isCrossbar ? randomRange(260, 390) : randomRange(120, 240),
    gravity: 820,
    bounceDamping: 0.38,
    bounces: 0,
    onGround: false,
    squash: 0,
    spin: side * randomRange(24, 36),
    trail: [],
    done: false,
  };

  shot.x = point.x;
  shot.y = point.y;
  shot.scale = Math.max(0.58, shot.scale);
}

function initializeNetRipple(shot) {
  const impactX = clamp(shot.target.x, GOAL.x + 28, GOAL.x + GOAL.w - 28);
  const impactY = clamp(shot.target.y, GOAL.y + 28, GOAL.y + GOAL.h - 28);
  const side = clamp((impactX - (GOAL.x + GOAL.w / 2)) / (GOAL.w / 2), -1, 1);
  const heightFactor = clamp((GOAL.y + GOAL.h - impactY) / GOAL.h, 0, 1);

  game.netRipple = {
    x: impactX,
    y: impactY,
    side,
    heightFactor,
    power: clamp(shot.power, 0, 1),
    time: 0,
    duration: 1.18,
    strength: lerp(18, 44, clamp(shot.power, 0, 1)) + (shot.isPanenka ? 12 : 0),
    radiusX: lerp(72, 118, clamp(shot.power, 0, 1)),
    radiusY: lerp(48, 88, heightFactor),
  };
}

function evaluateShot(shot) {
  if (shot.frameHit) {
    return {
      goal: false,
      saved: false,
      frameHit: true,
      type: shot.frameHit.type,
      side: shot.frameHit.side,
      impact: shot.frameHit.impact,
      label: shot.frameHit.type === 'crossbar' ? 'CROSSBAR!' : 'POST!',
    };
  }

  if (!shot.inGoal) {
    return { goal: false, saved: false, label: 'MISSED!' };
  }

  const dx = shot.target.x - shot.keeperTarget.x;
  const dy = shot.target.y - shot.keeperTarget.y;
  const distance = Math.hypot(dx, dy);

  // Slow chips are easier to read if the keeper picks the correct spot.
  // Powerful shots are harder to save because they arrive faster.
  const chipPenalty = shot.power < 0.28 ? 18 : 0;
  const highChipBonus = shot.height > 0.78 && shot.power < 0.34 ? -8 : 0;
  const saveRadius = 108 - shot.power * 38 + chipPenalty + highChipBonus + (shot.height < 0.20 ? 10 : 0);
  const saved = distance < saveRadius;

  if (saved) {
    return { goal: false, saved: true, label: 'SAVED!' };
  }

  return { goal: true, saved: false, label: 'GOAL!' };
}


function shouldEndRegularShootout() {
  if (game.suddenDeath) return false;

  const playerTaken = game.playerHistory.length;
  const opponentTaken = game.opponentHistory.length;
  const playerRemaining = Math.max(0, 5 - playerTaken);
  const opponentRemaining = Math.max(0, 5 - opponentTaken);

  // Real penalty shootout rule:
  // If the trailing side can no longer catch the leader with the remaining kicks,
  // the match ends immediately instead of forcing all five kicks.
  if (game.playerGoals > game.opponentGoals + opponentRemaining) return true;
  if (game.opponentGoals > game.playerGoals + playerRemaining) return true;

  return false;
}

function advanceAfterResult() {
  game.shot = null;
  resetKeeper();

  if (game.mode !== 'resultPause') return;

  // End the match early when the result is mathematically decided.
  if (shouldEndRegularShootout()) {
    showFinal();
    return;
  }

  const lastWasPlayer = game.playerHistory.length > game.opponentHistory.length;
  if (lastWasPlayer) {
    startGoalkeeperPick();
  } else {
    const pairComplete = game.playerHistory.length === game.opponentHistory.length;
    if (pairComplete) {
      if (game.round >= 5) {
        if (game.playerGoals !== game.opponentGoals) {
          showFinal();
          return;
        }
        if (!game.suddenDeath) {
          game.suddenDeath = true;
          game.phaseMessage = 'Sudden Death!';
        }
        // In sudden death, after every completed pair, equal score continues.
      }
      game.round += 1;
      startPlayerAim();
    }
  }
}

function resetKeeper() {
  game.keeper.tx = KEEPER_HOME.x;
  game.keeper.ty = KEEPER_HOME.y;
}

function startPlayerAim() {
  game.mode = 'playerAim';
  resetShotControls();
  game.phaseMessage = game.suddenDeath ? 'Sudden Death: select direction' : 'Select shot direction';
  canvasHint.textContent = 'Click the Direction bar or press Space.';
}

function startGoalkeeperPick() {
  game.mode = 'goalkeeperPick';
  prepareOpponentShotBeforeKeeperClick();
  if (shouldShowOpponentHint()) {
    game.phaseMessage = 'Watch the glove hint, then choose your save spot!';
    canvasHint.textContent = 'Watch the glove hint, then click inside the goal to dive.';
  } else {
    game.phaseMessage = 'Defend! Choose your save spot!';
    canvasHint.textContent = 'No hint now. Click inside the goal to dive.';
  }
}

function lockActiveControl() {
  if (game.mode !== 'playerAim') return;
  if (game.waitingForWhistle) return;

  const key = game.activeControl;
  game.lockedShot[key] = game.controlValue[key];
  game.controlValue[key] = game.lockedShot[key];
  playTone('click');

  if (key === 'direction') {
    game.activeControl = 'height';
    game.phaseMessage = 'Select shot height';
    canvasHint.textContent = 'Click the Height bar or press Space.';
  } else if (key === 'height') {
    game.activeControl = 'power';
    game.phaseMessage = 'Select shot power';
    canvasHint.textContent = 'Click the Power bar or press Space.';
  } else {
    game.activeControl = null;
    createPlayerShot();
  }
}

function createPlayerShot() {
  if (game.waitingForWhistle || game.mode !== 'playerAim') return;
  game.activeControl = null;
  game.waitingForWhistle = true;
  game.phaseMessage = 'Wait for the whistle!';
  canvasHint.textContent = 'Whistle first, then the run-up begins.';

  audioManager.playWhistleBefore(() => {
    if (game.mode !== 'playerAim' || !game.waitingForWhistle) return;
    game.waitingForWhistle = false;
    startPlayerShotAfterWhistle();
  });
}

function startPlayerShotAfterWhistle() {
  const shot = buildShotFromValues({
    shooter: 'player',
    direction: game.lockedShot.direction,
    height: game.lockedShot.height,
    power: game.lockedShot.power,
  });

  shot.keeperTarget = chooseKeeperTargetAgainstPlayer(shot);
  game.shot = shot;
  game.activeControl = null;
  game.mode = 'playerShot';
  game.phaseMessage = 'Run up!';
  canvasHint.textContent = 'Watch the run-up and shot result.';
}

function chooseKeeperTargetAgainstPlayer(shot) {
  // CPU goalkeeper difficulty stays constant inside the match, then increases after each match win.
  const difficulty = Math.min(0.82, 0.25 + tournamentDifficultyLevel() * 0.10);
  const readsShot = Math.random() < difficulty;

  if (readsShot && shot.inGoal) {
    return {
      x: clamp(shot.target.x + randomRange(-55, 55), GOAL.x + 35, GOAL.x + GOAL.w - 35),
      y: clamp(shot.target.y + randomRange(-40, 40), GOAL.y + 38, GOAL.y + GOAL.h - 38),
    };
  }

  const zone = randomGoalPoint();
  return zone;
}

function createOpponentShot(clickPoint) {
  if (game.waitingForWhistle || game.mode !== 'goalkeeperPick') return;
  const shot = game.pendingOpponentShot || prepareOpponentShotBeforeKeeperClick();
  const keeperTarget = {
    x: clamp(clickPoint.x, GOAL.x + 35, GOAL.x + GOAL.w - 35),
    y: clamp(clickPoint.y, GOAL.y + 38, GOAL.y + GOAL.h - 38),
  };

  game.waitingForWhistle = true;
  game.opponentHint.active = false;
  game.opponentHint.alpha = 0;
  game.phaseMessage = 'Wait for the whistle!';
  canvasHint.textContent = 'Whistle first, then the opponent shoots.';

  audioManager.playWhistleBefore(() => {
    if (game.mode !== 'goalkeeperPick' || !game.waitingForWhistle) return;
    game.waitingForWhistle = false;
    startOpponentShotAfterWhistle(shot, keeperTarget);
  });
}

function startOpponentShotAfterWhistle(shot, keeperTarget) {
  game.pendingOpponentShot = null;
  shot.keeperTarget = keeperTarget;
  shot.time = 0;
  shot.x = shot.start.x;
  shot.y = shot.start.y;
  shot.rotation = 0;
  shot.scale = 1;
  shot.result = null;
  shot.rebound = null;
  game.shot = shot;
  game.mode = 'opponentShot';
  game.phaseMessage = 'Opponent shot!';
  canvasHint.textContent = 'Watch the shot result.';
  playTone('click');
}

function prepareOpponentShotBeforeKeeperClick() {
  const shotValues = generateOpponentShotValues();
  const shot = buildShotFromValues({
    shooter: 'opponent',
    direction: shotValues.direction,
    height: shotValues.height,
    power: shotValues.power,
  });

  game.pendingOpponentShot = shot;
  startOpponentShotHint(shot.target);
  return shot;
}

function getOpponentHintDuration() {
  if (!shouldShowOpponentHint()) return 0;

  // Hint duration also stays fixed inside a match. It only gets shorter after match wins.
  const durations = [0.78, 0.58];
  const level = Math.min(tournamentDifficultyLevel(), durations.length - 1);
  return durations[level];
}

function startOpponentShotHint(target) {
  const duration = getOpponentHintDuration();
  if (duration <= 0) {
    game.opponentHint = {
      active: false,
      x: 0,
      y: 0,
      elapsed: 0,
      duration: 0,
      alpha: 0,
    };
    return;
  }

  game.opponentHint = {
    active: true,
    x: clamp(target.x, GOAL.x + 34, GOAL.x + GOAL.w - 34),
    y: clamp(target.y, GOAL.y + 34, GOAL.y + GOAL.h - 34),
    elapsed: 0,
    duration,
    alpha: 1,
  };
}

function generateOpponentShotValues() {
  // Opponent accuracy is fixed during the match and increases only after match wins.
  const accuracy = Math.min(0.86, 0.53 + tournamentDifficultyLevel() * 0.055);
  let direction;
  let height;
  let power;

  if (Math.random() < accuracy) {
    direction = randomRange(0.14, 0.86);
    height = randomRange(0.18, 0.82);
    power = randomRange(0.30, 0.86);
  } else {
    direction = Math.random() < 0.5 ? randomRange(0.00, 0.12) : randomRange(0.88, 1.00);
    height = Math.random() < 0.5 ? randomRange(0.84, 1.00) : randomRange(0.02, 0.20);
    power = Math.random() < 0.5 ? randomRange(0.02, 0.18) : randomRange(0.90, 1.00);
  }

  return { direction, height, power };
}

function buildShotFromValues({ shooter, direction, height, power }) {
  const safeDirection = clamp(direction, 0, 1);
  const safeHeight = clamp(height, 0, 1);
  const safePower = clamp(power, 0, 1);

  const centerX = GOAL.x + GOAL.w / 2;
  const dirAmount = (safeDirection - 0.5) * 2; // -1 left, +1 right
  const edgeAmount = Math.abs(dirAmount);

  // Direction controls the horizontal aim. Extreme direction + high power may go wide.
  // Low-power chip shots stay more controlled, like a Panenka.
  const postInside = GOAL.w / 2 - 24;
  const wideRisk = Math.max(0, edgeAmount - 0.82) / 0.18;
  const highPowerWildness = Math.max(0, safePower - 0.72) * 125;
  let targetX = centerX + dirAmount * (postInside + wideRisk * (22 + highPowerWildness));

  // Height controls the vertical aim. The important part:
  // high + slow is NOT automatically over the bar. It becomes a chip/Panenka that drops.
  const bottomInside = GOAL.y + GOAL.h - 28;
  const topInside = GOAL.y + 34;
  let targetY = lerp(bottomInside, topInside, safeHeight);

  // Very weak, low shots may die before reaching the goal.
  const weakLowShot = safePower < 0.08 && safeHeight < 0.45;
  if (weakLowShot) {
    targetY += lerp(64, 18, safePower / 0.08);
  }

  // High + high-power shots can fly over the crossbar.
  // High + low-power shots stay inside as a Panenka-style chip.
  const overBarRisk = Math.max(0, safeHeight - 0.88) / 0.12;
  const powerOverRisk = Math.max(0, safePower - 0.72) / 0.28;
  const overAmount = overBarRisk * powerOverRisk * 105;
  targetY -= overAmount;

  // Panenka/chip characteristics.
  const isPanenka = safeHeight > 0.76 && safePower < 0.34;
  const chipFactor = clamp((0.46 - safePower) / 0.46, 0, 1);
  const heightFactor = clamp(safeHeight, 0, 1);

  // Arc lift makes the ball rise and then fall. This is what fixes the unrealistic straight line.
  const arcLift =
    24 +
    heightFactor * 42 +
    chipFactor * 58 +
    (isPanenka ? 38 : 0) -
    safePower * 20;

  // Gravity drop is stronger for slow chips, so the ball visibly comes down near the goal.
  const gravityDrop = isPanenka ? 22 + chipFactor * 18 : chipFactor * 12;

  // Slow chip takes longer; powerful shots are flatter and faster.
  const duration = isPanenka ? lerp(1.75, 1.25, safePower / 0.34) : lerp(1.32, 0.64, safePower);

  // This hitbox matches the visible goal mouth. If the final ball position is inside,
  // it is a goal/save situation; if it finishes outside, it is a real miss.
  const tolerance = 4;
  let frameHit = null;
  const postCandidate =
    edgeAmount > 0.90 &&
    safePower > 0.52 &&
    safePower < 0.94 &&
    safeHeight > 0.16 &&
    safeHeight < 0.86;
  const crossbarCandidate =
    safeHeight > 0.88 &&
    safePower > 0.56 &&
    safePower < 0.96 &&
    edgeAmount < 0.82;

  if (postCandidate) {
    const side = dirAmount < 0 ? 'left' : 'right';
    targetX = side === 'left' ? GOAL.x : GOAL.x + GOAL.w;
    targetY = clamp(targetY, GOAL.y + 42, GOAL.y + GOAL.h - 34);
    frameHit = { type: 'post', side, impact: { x: targetX, y: targetY } };
  } else if (crossbarCandidate) {
    targetX = clamp(targetX, GOAL.x + 54, GOAL.x + GOAL.w - 54);
    targetY = GOAL.y;
    frameHit = { type: 'crossbar', side: 'top', impact: { x: targetX, y: targetY } };
  }

  const inGoal =
    !frameHit &&
    targetX >= GOAL.x + tolerance &&
    targetX <= GOAL.x + GOAL.w - tolerance &&
    targetY >= GOAL.y + tolerance &&
    targetY <= GOAL.y + GOAL.h - tolerance;

  return {
    shooter,
    start: { ...BALL_START },
    x: BALL_START.x,
    y: BALL_START.y,
    target: { x: targetX, y: targetY },
    inGoal,
    frameHit,
    direction: safeDirection,
    height: safeHeight,
    power: safePower,
    isPanenka,
    arcLift,
    gravityDrop,
    endScale: isPanenka ? 0.68 : 0.62,
    time: 0,
    duration,
    kickDelay: shooter === 'player' ? 0.58 : 0,
    speedMultiplier: 1,
    rotation: 0,
    scale: 1,
    result: null,
    keeperTarget: randomGoalPoint(),
  };
}

function randomGoalPoint() {
  return {
    x: randomRange(GOAL.x + 55, GOAL.x + GOAL.w - 55),
    y: randomRange(GOAL.y + 55, GOAL.y + GOAL.h - 55),
  };
}

function showFinal() {
  cancelAnimationFrame(animationId);
  audioManager.stopCrowd();
  const title = document.getElementById('finalTitle');
  const summary = document.getElementById('finalSummary');
  const playerScore = document.getElementById('finalPlayerScore');
  const opponentScore = document.getElementById('finalOpponentScore');
  const actionButton = document.getElementById('playAgainBtn');

  const playerWonMatch = game.playerGoals > game.opponentGoals;
  game.lastMatchWon = playerWonMatch;

  if (playerWonMatch && !game.matchAwarded) {
    game.tournamentWins += 1;
    game.playerPoints += 500;
    game.matchAwarded = true;
  }

  fillLogoSlot('finalPlayerLogo', selectedTeam, 'small-crest');
  fillLogoSlot('finalOpponentLogo', opponentTeam, 'small-crest');

  // Opponent points were removed. The right side now shows only the last match score.
  document.getElementById('finalPlayerName').textContent = 'Total Points';
  document.getElementById('finalOpponentName').textContent = 'Match Score';
  playerScore.textContent = game.playerPoints;
  opponentScore.textContent = `${game.playerGoals} - ${game.opponentGoals}`;

  if (playerWonMatch) {
    title.textContent = 'Match Won!';
    summary.textContent = `${selectedTeam.name} beat ${opponentTeam.name} ${game.playerGoals}-${game.opponentGoals}. +500 match win bonus earned. Total wins: ${game.tournamentWins}. Total points: ${game.playerPoints}. Next match will be harder.`;
    actionButton.textContent = 'NEXT MATCH';
  } else if (game.playerGoals < game.opponentGoals) {
    title.textContent = 'Tournament Over';
    summary.textContent = `${opponentTeam.name} won ${game.opponentGoals}-${game.playerGoals}. Total wins: ${game.tournamentWins}. Total points: ${game.playerPoints}.`;
    actionButton.textContent = 'PLAY AGAIN';
  } else {
    title.textContent = 'Draw';
    summary.textContent = `The shootout ended level after sudden death. Total wins: ${game.tournamentWins}. Total points: ${game.playerPoints}.`;
    actionButton.textContent = 'PLAY AGAIN';
  }

  showScreen('final');
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawStadium();
  drawPitch();
  drawGoal();
  drawScoreboard();
  drawPlayer();
  drawGoalkeeper();
  drawReboundTrail();
  if (game.shot) {
    drawBallShadow(game.shot);
    drawBall(game.shot.x, game.shot.y, 18 * game.shot.scale, game.shot.rotation);
  } else {
    drawBallShadow({ shadowX: BALL_START.x, shadowY: BALL_START.y + 9, shadowScale: 1.02 });
    drawBall(BALL_START.x, BALL_START.y, 20, 0);
  }
  drawGoalEffects();
  drawPhaseMessage();

  if (game.mode === 'goalkeeperPick') {
    drawGoalClickOverlay();
    drawOpponentShotHint();
  }

  drawControls();
}

function drawStadium() {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#38a4f0');
  sky.addColorStop(0.62, '#0e67b6');
  sky.addColorStop(1, '#064478');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 260);

  const glow = ctx.createRadialGradient(W / 2, 70, 40, W / 2, 95, 520);
  glow.addColorStop(0, 'rgba(255,255,255,.32)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 220);

  ctx.fillStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 4; i += 1) {
    const x = 108 + i * 300;
    ctx.beginPath();
    ctx.moveTo(x, 42);
    ctx.lineTo(x + 70, 42);
    ctx.lineTo(x + 126, 188);
    ctx.lineTo(x - 58, 188);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#071625';
  ctx.fillRect(0, 52, W, 150);
  ctx.fillStyle = '#102f4b';
  ctx.fillRect(0, 74, W, 34);
  ctx.fillStyle = '#0d263d';
  ctx.fillRect(0, 136, W, 30);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  for (let y = 70; y <= 188; y += 22) {
    ctx.fillRect(0, y, W, 2);
  }

  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.moveTo(0, 196);
  ctx.lineTo(W, 196);
  ctx.lineTo(W, 222);
  ctx.quadraticCurveTo(W / 2, 202, 0, 222);
  ctx.closePath();
  ctx.fill();

  crowdDots.forEach((dot) => {
    ctx.fillStyle = dot.color;
    ctx.fillRect(dot.x, dot.y, dot.w, dot.h);
  });

  ctx.fillStyle = '#083c6d';
  ctx.fillRect(0, 198, W, 42);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(0, 198, W, 6);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('PENALTY SHOOTOUT CHALLENGE', W / 2, 225);

  ctx.fillStyle = selectedTeam?.secondary || '#ffd21f';
  ctx.fillRect(0, 240, W, 12);
  ctx.fillStyle = selectedTeam?.primary || '#0b2a6f';
  ctx.fillRect(0, 252, W, 10);
}

function drawPitch() {
  const pitch = ctx.createLinearGradient(0, 260, 0, H);
  pitch.addColorStop(0, '#238d30');
  pitch.addColorStop(0.5, '#35b842');
  pitch.addColorStop(1, '#1d8429');
  ctx.fillStyle = pitch;
  ctx.fillRect(0, 260, W, H - 260);

  const stripeCount = 9;
  const horizonY = 260;
  for (let i = 0; i < stripeCount; i += 1) {
    const y1 = horizonY + i * 52;
    const y2 = i === stripeCount - 1 ? H : horizonY + (i + 1) * 52;
    const inset1 = Math.max(0, 215 - i * 29);
    const inset2 = Math.max(0, 215 - (i + 1) * 29);

    ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 196, 77, .42)' : 'rgba(22, 130, 39, .32)';
    ctx.beginPath();
    ctx.moveTo(inset1, y1);
    ctx.lineTo(W - inset1, y1);
    ctx.lineTo(W - inset2, y2);
    ctx.lineTo(inset2, y2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 34; i += 1) {
    const y = 272 + i * 13;
    const wobble = (i % 4) * 18;
    ctx.beginPath();
    ctx.moveTo((wobble * 7) % W, y);
    ctx.lineTo(Math.min(W, ((wobble * 7) % W) + 64), y + 2);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(5,55,16,.22)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 11; i += 1) {
    const x = 96 + i * 96;
    ctx.beginPath();
    ctx.moveTo(560 + (x - 560) * 0.2, 264);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,.38)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 260);
  ctx.lineTo(560, 612);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,.92)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(64, 486);
  ctx.lineTo(1046, 486);
  ctx.lineTo(1100, 608);
  ctx.lineTo(20, 608);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(366, 390);
  ctx.lineTo(754, 390);
  ctx.lineTo(850, 486);
  ctx.lineTo(270, 486);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 612);
  ctx.lineTo(W, 612);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,.88)';
  ctx.beginPath();
  ctx.arc(BALL_START.x, BALL_START.y + 6, 5, 0, Math.PI * 2);
  ctx.fill();
}



function drawGoal() {
  ctx.save();

  const left = GOAL.x;
  const top = GOAL.y;
  const width = GOAL.w;
  const height = GOAL.h;
  const right = left + width;
  const bottom = top + height;
  const backInsetX = 42;
  const backTopY = top + 22;
  const backBottomY = bottom - 4;

  // back support poles outside the goal, similar to reference
  ctx.strokeStyle = '#9aa3ad';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(left - 22, top - 18);
  ctx.lineTo(left - 22, bottom - 48);
  ctx.moveTo(right + 22, top - 18);
  ctx.lineTo(right + 22, bottom - 48);
  ctx.stroke();

  // ground shadow
  const shadow = ctx.createRadialGradient(left + width / 2, bottom + 8, 50, left + width / 2, bottom + 18, width * 0.75);
  shadow.addColorStop(0, 'rgba(0,0,0,0.28)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(left + width / 2, bottom + 16, width * 0.72, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // subtle net background so the net is always visible
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(left + 3, top + 3, width - 6, height - 6);

  // top net plane
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.moveTo(left + 10, top + 8);
  ctx.lineTo(right - 10, top + 8);
  ctx.lineTo(right - backInsetX, backTopY);
  ctx.lineTo(left + backInsetX, backTopY);
  ctx.closePath();
  ctx.fill();

  // side net planes
  ctx.beginPath();
  ctx.moveTo(left + 10, top + 8);
  ctx.lineTo(left + backInsetX, backTopY);
  ctx.lineTo(left + backInsetX, backBottomY);
  ctx.lineTo(left + 10, bottom - 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(right - backInsetX, backTopY);
  ctx.lineTo(right - 10, top + 8);
  ctx.lineTo(right - 10, bottom - 8);
  ctx.lineTo(right - backInsetX, backBottomY);
  ctx.closePath();
  ctx.fill();

  // dense front net. Lines are drawn with many small segments so the net can
  // deform naturally when the ball hits it.
  ctx.strokeStyle = 'rgba(255,255,255,0.72)';
  ctx.lineWidth = 1;
  for (let x = left + 12; x < right - 8; x += 16) {
    drawElasticNetLine({ x, y: top + 2 }, { x, y: bottom - 2 }, 18);
  }
  for (let y = top + 12; y < bottom - 4; y += 14) {
    drawElasticNetLine({ x: left + 2, y }, { x: right - 2, y }, 28);
  }

  // roof net lines
  ctx.strokeStyle = 'rgba(255,255,255,0.46)';
  for (let i = 1; i < 13; i += 1) {
    const t = i / 13;
    const x1 = left + 10 + (width - 20) * t;
    const x2 = left + backInsetX + (width - 2 * backInsetX) * t;
    ctx.beginPath();
    ctx.moveTo(x1, top + 8);
    ctx.lineTo(x2, backTopY);
    ctx.stroke();
  }
  for (let i = 1; i < 4; i += 1) {
    const t = i / 4;
    const y = top + 8 + (backTopY - (top + 8)) * t;
    const xL = left + 10 + (backInsetX - 10) * t;
    const xR = right - 10 - (backInsetX - 10) * t;
    ctx.beginPath();
    ctx.moveTo(xL, y);
    ctx.lineTo(xR, y);
    ctx.stroke();
  }

  // side net lines
  for (const s of [-1, 1]) {
    const fx = s < 0 ? left + 10 : right - 10;
    const bx = s < 0 ? left + backInsetX : right - backInsetX;
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    for (let i = 1; i < 4; i += 1) {
      const t = i / 4;
      const x = fx + (bx - fx) * t;
      ctx.beginPath();
      ctx.moveTo(x, top + 8 + (backTopY - (top + 8)) * t);
      ctx.lineTo(x, bottom - 8 + (backBottomY - (bottom - 8)) * t);
      ctx.stroke();
    }
    for (let y = top + 18; y < bottom - 8; y += 16) {
      const t = (y - (top + 8)) / ((bottom - 8) - (top + 8));
      ctx.beginPath();
      ctx.moveTo(fx, y);
      ctx.lineTo(bx, backTopY + (backBottomY - backTopY) * t);
      ctx.stroke();
    }
  }

  // rear frame
  ctx.strokeStyle = 'rgba(205,215,225,0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left + backInsetX, backTopY);
  ctx.lineTo(right - backInsetX, backTopY);
  ctx.lineTo(right - backInsetX, backBottomY);
  ctx.moveTo(left + backInsetX, backTopY);
  ctx.lineTo(left + backInsetX, backBottomY);
  ctx.moveTo(left + backInsetX, backBottomY);
  ctx.lineTo(right - backInsetX, backBottomY);
  ctx.stroke();

  // front frame outline
  ctx.strokeStyle = 'rgba(20,30,40,0.18)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // front frame main white
  const frameGrad = ctx.createLinearGradient(left, top, right, bottom);
  frameGrad.addColorStop(0, '#f3f8fc');
  frameGrad.addColorStop(0.45, '#ffffff');
  frameGrad.addColorStop(1, '#d9e2ea');
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // glossy highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left + 3, top + 4);
  ctx.lineTo(right - 3, top + 4);
  ctx.moveTo(left + 3, top + 5);
  ctx.lineTo(left + 3, bottom - 5);
  ctx.moveTo(right - 3, top + 5);
  ctx.lineTo(right - 3, bottom - 5);
  ctx.stroke();

  ctx.restore();
}


function drawElasticNetLine(a, b, segments = 18) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const base = {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
    };
    const p = applyNetRippleToPoint(base);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function applyNetRippleToPoint(point) {
  const ripple = game.netRipple;
  if (!ripple) return point;

  const life = clamp(ripple.time / ripple.duration, 0, 1);
  const pullLife = Math.sin(Math.PI * Math.min(1, life * 1.15));
  const vibration = Math.sin(life * Math.PI * 9) * Math.pow(1 - life, 1.7);
  const dx = point.x - ripple.x;
  const dy = point.y - ripple.y;
  const nx = dx / ripple.radiusX;
  const ny = dy / ripple.radiusY;
  const distance = Math.sqrt(nx * nx + ny * ny);
  const influence = Math.exp(-distance * distance * 1.85);
  if (influence < 0.012) return point;

  const strength = ripple.strength * influence * (pullLife + vibration * 0.28);

  // A real net is pulled inward at the impact point. In front view, this is shown by
  // nearby strings bending toward the contact point, then sagging down and shaking.
  const towardImpactX = -dx * 0.18 * influence * (pullLife + 0.25);
  const towardImpactY = -dy * 0.12 * influence * (pullLife + 0.20);
  const sagY = strength * 0.52;
  const sideWaveX = Math.sin(point.y * 0.085 + life * 16) * influence * 4.5 * (1 - life) * (ripple.side || 0.35);

  return {
    x: point.x + towardImpactX + sideWaveX,
    y: point.y + towardImpactY + sagY,
  };
}

function drawScoreboard() {
  ctx.save();
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, '#034bb1');
  bar.addColorStop(0.5, '#025bd4');
  bar.addColorStop(1, '#034bb1');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 19px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`POINTS: ${game.playerPoints}`, 14, 27);
  ctx.textAlign = 'right';
  ctx.fillText(`${currentMatchLabel()}  |  WINS: ${game.tournamentWins}  |  ${game.suddenDeath ? 'SUDDEN DEATH' : `${Math.min(game.round, 5)} / 5`}`, W - 14, 27);

  drawCanvasCrest(selectedTeam, 275, 21, 32);
  drawCanvasCrest(opponentTeam, 845, 21, 32);

  ctx.textAlign = 'right';
  ctx.font = '900 19px system-ui';
  ctx.fillText(selectedTeam.name, 512, 27);
  ctx.textAlign = 'center';
  ctx.font = '950 24px system-ui';
  ctx.fillText(`${game.playerGoals} - ${game.opponentGoals}`, 560, 28);
  ctx.textAlign = 'left';
  ctx.font = '900 19px system-ui';
  ctx.fillText(opponentTeam.name, 608, 27);

  drawPenaltyDots();
  ctx.restore();
}

function drawPenaltyDots() {
  const startX = 380;
  const y = 58;
  const gap = 34;
  const totalRegular = 5;

  for (let i = 0; i < totalRegular; i += 1) {
    drawDot(startX + i * gap, y, game.playerHistory[i]);
  }
  for (let i = 0; i < totalRegular; i += 1) {
    drawDot(startX + 225 + i * gap, y, game.opponentHistory[i]);
  }

  if (game.playerHistory.length > 5 || game.opponentHistory.length > 5) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd21f';
    ctx.font = '900 12px system-ui';
    ctx.fillText('SD', 560, 75);
    const extra = Math.max(game.playerHistory.length, game.opponentHistory.length) - 5;
    for (let i = 0; i < extra; i += 1) {
      drawDot(488 + i * 24, 83, game.playerHistory[i + 5], 8);
      drawDot(608 + i * 24, 83, game.opponentHistory[i + 5], 8);
    }
  }
}

function drawDot(x, y, value, radius = 12) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (value === true) ctx.fillStyle = '#1df26b';
  else if (value === false) ctx.fillStyle = '#050505';
  else ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,.45)';
  ctx.stroke();
}

function drawCanvasCrest(team, x, y, radius) {
  if (!team) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = team.primary;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.clip();

  const logo = logoImages.get(team.id);
  if (logo && logo.loaded && logo.image) {
    ctx.drawImage(logo.image, x - radius, y - radius, radius * 2, radius * 2);
  } else {
    ctx.fillStyle = team.primary;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.fillStyle = team.secondary;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius);
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${Math.max(11, radius * 0.55)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(team.short, x, y + 1);
  }
  ctx.restore();
}

function drawPlayer() {
  const activeShot = game.shot && (game.mode === 'playerShot' || game.mode === 'opponentShot' || game.mode === 'resultPause')
    ? game.shot
    : null;

  // Show the correct shooter kit:
  // - our selected team when we shoot
  // - opponent team when the opponent shoots or while we are choosing a save spot
  const isOpponentShooter = game.mode === 'goalkeeperPick' || activeShot?.shooter === 'opponent';
  const team = isOpponentShooter ? opponentTeam : selectedTeam;

  if (!team) return;

  if (activeShot) {
    drawKickingFootballer(PLAYER_POS.x, PLAYER_POS.y, team.primary, team.secondary, 0.88, activeShot);
  } else {
    drawFootballer(PLAYER_POS.x, PLAYER_POS.y, team.primary, team.secondary, 0.88);
  }
}

function drawGoalkeeper() {
  const color = '#c9ff11';
  const activeShot = game.shot && (game.mode === 'playerShot' || game.mode === 'opponentShot' || game.mode === 'resultPause') ? game.shot : null;
  const dx = game.keeper.x - KEEPER_HOME.x;
  const dy = game.keeper.y - KEEPER_HOME.y;

  let visualSide = Math.abs(dx) > 10 ? Math.sign(dx) : 0;
  let flightT = 0;
  let anticipation = 0;
  let visualDive = clamp(Math.hypot(dx, dy) / 145, 0, 1);

  if (activeShot) {
    const kickDelay = activeShot.kickDelay || 0;
    const flightTime = Math.max(0, activeShot.time - kickDelay);
    flightT = clamp(flightTime / activeShot.duration, 0, 1);

    const targetDx = activeShot.keeperTarget.x - KEEPER_HOME.x;
    const targetDy = activeShot.keeperTarget.y - KEEPER_HOME.y;
    if (Math.abs(targetDx) > 10) visualSide = Math.sign(targetDx);

    const targetDive = clamp(Math.hypot(targetDx, targetDy) / 150, 0, 1);
    const visualDiveTiming = smoothstep(0.30, 0.92, flightT);
    visualDive = Math.max(visualDive, targetDive * visualDiveTiming);

    // Small pre-jump crouch before the keeper launches. It makes the save feel less robotic.
    anticipation = flightT > 0 && flightT < 0.38 ? Math.sin((flightT / 0.38) * Math.PI) * 0.75 : 0;
  }

  drawGoalkeeperFigure(game.keeper.x, game.keeper.y, color, game.keeper.lean, 0.94, visualDive, visualSide, anticipation, flightT);
}


function drawKickingFootballer(x, y, primary, secondary, scale = 1, shot) {
  const kickDelay = shot.kickDelay || 0.58;
  const runT = clamp(shot.time / kickDelay, 0, 1);
  const kickT = clamp((shot.time - kickDelay) / 0.36, 0, 1);
  const followT = clamp((shot.time - kickDelay - 0.20) / 0.64, 0, 1);
  const runEase = easeOutCubic(runT);
  const strikeEase = easeInOutCubic(kickT);
  const followEase = easeOutCubic(followT);
  const directionLean = clamp((shot.direction - 0.5) * 2, -1, 1);

  // Run-up: the body comes from behind the penalty spot and bounces like short football steps.
  const step = Math.sin(runT * Math.PI * 4);
  const runOffsetX = -64 * (1 - runEase);
  const runOffsetY = 34 * (1 - runEase) + Math.abs(step) * 3.5 * (1 - kickT);
  const hipTwist = step * 0.08 * (1 - kickT);
  const bodyLean = directionLean * 0.13 * strikeEase - 0.18 * strikeEase + 0.05 * Math.sin(runT * Math.PI) + hipTwist;
  const impactPulse = Math.exp(-Math.pow((shot.time - kickDelay) / 0.055, 2));

  ctx.save();
  ctx.translate(x + runOffsetX, y + runOffsetY);
  ctx.scale(scale, scale);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const skin = '#d7a77a';
  const dark = '#101820';
  const socks = '#f2f6ff';

  // Shadow stretches during follow-through.
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  ctx.beginPath();
  ctx.ellipse(12 + 22 * strikeEase, 55, 42 + 18 * strikeEase, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(bodyLean);

  // Dynamic skeleton points. Left leg plants, right leg swings through the ball.
  const hipL = { x: -15, y: 10 };
  const hipR = { x: 15, y: 10 };
  const plantKnee = { x: -18 - 8 * strikeEase, y: 31 + 3 * Math.abs(step) * (1 - kickT) };
  const plantFoot = { x: -24 - 2 * directionLean, y: 52 };

  // The kicking foot starts behind, reaches the ball at impact, then follows through upward.
  const backswing = Math.sin(runT * Math.PI) * (1 - kickT);
  const swingKnee = {
    x: 16 + 10 * strikeEase + 4 * directionLean * strikeEase,
    y: 25 - 20 * strikeEase + 5 * followEase,
  };
  const swingFoot = {
    x: -32 * (1 - strikeEase) + 70 * strikeEase - 12 * followEase + 15 * directionLean * strikeEase,
    y: 49 - 62 * strikeEase + 25 * followEase + 8 * backswing,
  };

  // Back leg silhouette behind the body for extra depth.
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(hipR.x + 2, hipR.y + 1);
  ctx.lineTo(swingKnee.x + 3, swingKnee.y + 2);
  ctx.lineTo(swingFoot.x + 3, swingFoot.y + 2);
  ctx.stroke();

  // Shorts first so legs look connected.
  ctx.fillStyle = secondary;
  roundRect(ctx, -25, -2, 50, 25, 7, true, false);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(-3, 2, 6, 20);

  // Legs / socks / boots.
  ctx.strokeStyle = secondary;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(hipL.x, hipL.y);
  ctx.lineTo(plantKnee.x, plantKnee.y);
  ctx.lineTo(plantFoot.x, plantFoot.y);
  ctx.moveTo(hipR.x, hipR.y);
  ctx.lineTo(swingKnee.x, swingKnee.y);
  ctx.lineTo(swingFoot.x, swingFoot.y);
  ctx.stroke();

  ctx.strokeStyle = socks;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(plantKnee.x, plantKnee.y + 2);
  ctx.lineTo(plantFoot.x, plantFoot.y - 2);
  ctx.moveTo(swingKnee.x, swingKnee.y + 2);
  ctx.lineTo(swingFoot.x, swingFoot.y - 1);
  ctx.stroke();

  ctx.strokeStyle = dark;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(plantFoot.x, plantFoot.y);
  ctx.lineTo(plantFoot.x - 19, plantFoot.y + 2);
  ctx.moveTo(swingFoot.x, swingFoot.y);
  ctx.lineTo(swingFoot.x + 21 + 5 * impactPulse, swingFoot.y - 1);
  ctx.stroke();

  // Torso.
  const torsoTop = -52;
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(-31, torsoTop);
  ctx.lineTo(31, torsoTop);
  ctx.lineTo(24, -4);
  ctx.quadraticCurveTo(0, 8, -24, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath();
  ctx.moveTo(-28, -50);
  ctx.lineTo(28, -50);
  ctx.lineTo(23, -40);
  ctx.lineTo(-23, -40);
  ctx.closePath();
  ctx.fill();

  // Shirt stripes.
  ctx.fillStyle = secondary;
  for (let sx = -18; sx <= 18; sx += 18) {
    ctx.beginPath();
    ctx.moveTo(sx - 4, -48);
    ctx.lineTo(sx + 4, -48);
    ctx.lineTo(sx + 2, -5);
    ctx.lineTo(sx - 2, -5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,.72)';
  roundRect(ctx, -9, -36, 18, 19, 4, true, false);
  ctx.fillStyle = primary;
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('9', 0, -26);

  // Arms counterbalance the kick.
  const leftArm = {
    elbowX: -43 - 15 * strikeEase + 6 * step * (1 - kickT),
    elbowY: -19 + 10 * strikeEase,
    handX: -39 - 15 * strikeEase,
    handY: 0 + 6 * strikeEase,
  };
  const rightArm = {
    elbowX: 43 - 8 * strikeEase - 4 * step * (1 - kickT),
    elbowY: -18 - 11 * strikeEase,
    handX: 49 - 11 * strikeEase,
    handY: -2 - 12 * strikeEase,
  };

  ctx.strokeStyle = primary;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(-27, -42);
  ctx.lineTo(leftArm.elbowX, leftArm.elbowY);
  ctx.moveTo(27, -42);
  ctx.lineTo(rightArm.elbowX, rightArm.elbowY);
  ctx.stroke();

  ctx.strokeStyle = skin;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(leftArm.elbowX, leftArm.elbowY);
  ctx.lineTo(leftArm.handX, leftArm.handY);
  ctx.moveTo(rightArm.elbowX, rightArm.elbowY);
  ctx.lineTo(rightArm.handX, rightArm.handY);
  ctx.stroke();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(leftArm.handX, leftArm.handY + 2, 5, 0, Math.PI * 2);
  ctx.arc(rightArm.handX, rightArm.handY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head lean forward at impact.
  ctx.save();
  ctx.translate(4 * strikeEase, -1 * strikeEase);
  ctx.rotate(-0.08 * strikeEase);
  ctx.fillStyle = skin;
  roundRect(ctx, -7, -67, 14, 15, 5, true, false);
  ctx.fillStyle = '#c79263';
  ctx.beginPath();
  ctx.arc(0, -74, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#151515';
  ctx.beginPath();
  ctx.arc(0, -80, 18, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(-15, -78, 30, 12);
  ctx.restore();

  // Swing trail and contact flash make the kick easier to read.
  if (kickT > 0.03 && kickT < 0.92) {
    ctx.strokeStyle = 'rgba(255,255,255,.40)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(34, 18, 39, -1.28, 0.35);
    ctx.stroke();
  }
  if (impactPulse > 0.12) {
    ctx.strokeStyle = `rgba(255,255,255,${0.48 * impactPulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 15);
    ctx.lineTo(88, 4);
    ctx.moveTo(72, 22);
    ctx.lineTo(94, 21);
    ctx.moveTo(68, 29);
    ctx.lineTo(86, 40);
    ctx.stroke();
  }

  ctx.restore();
}
function drawFootballer(x, y, primary, secondary, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(1, 50, 42, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = '#101820';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-15, 46);
  ctx.lineTo(-28, 51);
  ctx.moveTo(16, 46);
  ctx.lineTo(31, 52);
  ctx.stroke();

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 12);
  ctx.lineTo(-17, 34);
  ctx.moveTo(15, 12);
  ctx.lineTo(17, 34);
  ctx.stroke();

  ctx.strokeStyle = '#f2f6ff';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-17, 33);
  ctx.lineTo(-20, 47);
  ctx.moveTo(17, 33);
  ctx.lineTo(20, 47);
  ctx.stroke();

  ctx.strokeStyle = primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, 39);
  ctx.lineTo(-15, 39);
  ctx.moveTo(15, 39);
  ctx.lineTo(22, 39);
  ctx.stroke();

  ctx.fillStyle = secondary;
  roundRect(ctx, -24, -2, 48, 24, 6, true, false);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(-3, 1, 6, 20);

  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(-30, -52);
  ctx.lineTo(30, -52);
  ctx.lineTo(23, -4);
  ctx.quadraticCurveTo(0, 6, -23, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath();
  ctx.moveTo(-28, -50);
  ctx.lineTo(28, -50);
  ctx.lineTo(23, -40);
  ctx.lineTo(-23, -40);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = secondary;
  for (let sx = -18; sx <= 18; sx += 18) {
    ctx.beginPath();
    ctx.moveTo(sx - 4, -48);
    ctx.lineTo(sx + 4, -48);
    ctx.lineTo(sx + 2, -5);
    ctx.lineTo(sx - 2, -5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,.72)';
  roundRect(ctx, -9, -36, 18, 19, 4, true, false);
  ctx.fillStyle = primary;
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('9', 0, -26);

  ctx.strokeStyle = primary;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(-27, -42);
  ctx.lineTo(-40, -14);
  ctx.moveTo(27, -42);
  ctx.lineTo(40, -17);
  ctx.stroke();

  ctx.strokeStyle = '#d7a77a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-39, -14);
  ctx.lineTo(-34, 3);
  ctx.moveTo(39, -17);
  ctx.lineTo(45, -1);
  ctx.stroke();

  ctx.fillStyle = '#d7a77a';
  ctx.beginPath();
  ctx.arc(-34, 5, 5, 0, Math.PI * 2);
  ctx.arc(45, 1, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d7a77a';
  roundRect(ctx, -7, -67, 14, 15, 5, true, false);
  ctx.fillStyle = '#c79263';
  ctx.beginPath();
  ctx.arc(0, -74, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#151515';
  ctx.beginPath();
  ctx.arc(0, -80, 18, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(-15, -78, 30, 12);

  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath();
  ctx.ellipse(0, -52, 30, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


function drawGoalkeeperFigure(x, y, color, lean, scale = 1, diveAmount = 0, diveSide = 0, anticipation = 0, flightT = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const side = diveSide || (Math.abs(lean) > 0.08 ? Math.sign(lean) : 0);
  const dive = clamp(diveAmount, 0, 1);
  const absLean = clamp(Math.abs(lean), 0, 1.25);
  const stretch = Math.max(dive, absLean * 0.72);
  const lead = side === 0 ? 1 : side;
  const crouch = clamp(anticipation, 0, 1);
  const launch = smoothstep(0.28, 0.88, flightT) * stretch;
  const verticalStretch = clamp((KEEPER_HOME.y - y) / 120, -0.45, 0.85);
  const bodyAngle = lead * (0.12 * crouch + 0.98 * launch);

  const glove = '#f8fbff';
  const dark = '#101820';
  const skin = '#d7a77a';
  const shorts = '#111820';

  // Ground shadow stays horizontal and stretches when the keeper dives.
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(lead * 20 * launch, 62 + launch * 9 + crouch * 5, 48 + launch * 38, 12 - launch * 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Anticipation crouch before jump.
  ctx.translate(0, crouch * 10);
  ctx.rotate(bodyAngle);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const torsoTopY = -38 + crouch * 6;
  const torsoBottomY = 14 + crouch * 7;
  const shoulderY = -28 + crouch * 5;
  const hipY = 10 + crouch * 7;
  const headY = -64 + crouch * 5;

  const reach = 62 + 48 * launch + 14 * verticalStretch;
  const leadHand = {
    x: lead * reach,
    y: -17 - 43 * launch - verticalStretch * 18 + crouch * 5,
  };
  const trailHand = {
    x: -lead * (42 + 12 * launch),
    y: -4 + 24 * launch + crouch * 7,
  };

  // Arms with a two-segment reach. Lead arm stretches toward the shot, trail arm balances.
  const leadShoulder = { x: lead * 24, y: shoulderY };
  const trailShoulder = { x: -lead * 24, y: shoulderY };
  const leadElbow = {
    x: lead * (44 + 25 * launch),
    y: -24 - 28 * launch - verticalStretch * 10,
  };
  const trailElbow = {
    x: -lead * (35 + 8 * launch),
    y: -12 + 18 * launch,
  };

  ctx.strokeStyle = color;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(leadShoulder.x, leadShoulder.y);
  ctx.lineTo(leadElbow.x, leadElbow.y);
  ctx.lineTo(leadHand.x, leadHand.y);
  ctx.moveTo(trailShoulder.x, trailShoulder.y);
  ctx.lineTo(trailElbow.x, trailElbow.y);
  ctx.lineTo(trailHand.x, trailHand.y);
  ctx.stroke();

  ctx.strokeStyle = skin;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(leadElbow.x, leadElbow.y);
  ctx.lineTo(leadHand.x, leadHand.y);
  ctx.moveTo(trailElbow.x, trailElbow.y);
  ctx.lineTo(trailHand.x, trailHand.y);
  ctx.stroke();

  // Gloves.
  ctx.fillStyle = glove;
  ctx.strokeStyle = 'rgba(16,24,32,.38)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(leadHand.x, leadHand.y, 13 + 5 * launch, 16, lead * 0.22, 0, Math.PI * 2);
  ctx.ellipse(trailHand.x, trailHand.y, 10, 13, -lead * 0.20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Legs: crouched when anticipating, stretched/scissored when diving.
  const leadLegKnee = { x: -lead * (10 + 15 * launch), y: 30 + crouch * 8 + 6 * launch };
  const leadFoot = { x: -lead * (34 + 26 * launch), y: 53 + 16 * launch };
  const trailLegKnee = { x: lead * (16 + 18 * launch), y: 31 - 4 * launch + crouch * 6 };
  const trailFoot = { x: lead * (31 + 34 * launch), y: 48 - 12 * launch };

  ctx.strokeStyle = '#f2f6ff';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-16, hipY + 8);
  ctx.lineTo(lead < 0 ? trailLegKnee.x : leadLegKnee.x, lead < 0 ? trailLegKnee.y : leadLegKnee.y);
  ctx.lineTo(lead < 0 ? trailFoot.x : leadFoot.x, lead < 0 ? trailFoot.y : leadFoot.y);
  ctx.moveTo(16, hipY + 8);
  ctx.lineTo(lead > 0 ? trailLegKnee.x : leadLegKnee.x, lead > 0 ? trailLegKnee.y : leadLegKnee.y);
  ctx.lineTo(lead > 0 ? trailFoot.x : leadFoot.x, lead > 0 ? trailFoot.y : leadFoot.y);
  ctx.stroke();

  ctx.strokeStyle = dark;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(leadFoot.x, leadFoot.y);
  ctx.lineTo(leadFoot.x + lead * 18, leadFoot.y + 5);
  ctx.moveTo(trailFoot.x, trailFoot.y);
  ctx.lineTo(trailFoot.x + lead * 19, trailFoot.y + 3);
  ctx.stroke();

  // Shorts.
  ctx.fillStyle = shorts;
  roundRect(ctx, -24, 1 + crouch * 2, 48, 24, 7, true, false);

  // Jersey.
  const jerseyGrad = ctx.createLinearGradient(0, torsoTopY, 0, torsoBottomY);
  jerseyGrad.addColorStop(0, '#e4ff42');
  jerseyGrad.addColorStop(0.45, color);
  jerseyGrad.addColorStop(1, '#87bd00');
  ctx.fillStyle = jerseyGrad;
  ctx.beginPath();
  ctx.moveTo(-33, torsoTopY);
  ctx.lineTo(33, torsoTopY);
  ctx.lineTo(27, torsoBottomY);
  ctx.quadraticCurveTo(0, torsoBottomY + 12, -27, torsoBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fillRect(-23, torsoTopY + 6, 46, 8);
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.fillRect(-3, torsoTopY + 2, 6, 45);

  // Collar.
  ctx.fillStyle = '#f8fbff';
  ctx.beginPath();
  ctx.moveTo(-11, torsoTopY + 1);
  ctx.lineTo(0, torsoTopY + 12);
  ctx.lineTo(11, torsoTopY + 1);
  ctx.closePath();
  ctx.fill();

  // Head tracks the dive direction a bit.
  ctx.save();
  ctx.translate(lead * 4 * launch, -2 * launch);
  ctx.rotate(lead * 0.10 * launch);
  ctx.fillStyle = skin;
  roundRect(ctx, -8, -51 + crouch * 2, 16, 14, 5, true, false);
  ctx.beginPath();
  ctx.arc(0, headY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.beginPath();
  ctx.arc(-6, headY - 1, 1.8, 0, Math.PI * 2);
  ctx.arc(6, headY - 1, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5, headY + 8);
  ctx.quadraticCurveTo(0, headY + 11, 5, headY + 8);
  ctx.stroke();
  ctx.fillStyle = '#151515';
  ctx.beginPath();
  ctx.arc(0, headY - 6, 18, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(-15, headY - 4, 30, 9);
  ctx.restore();

  // Motion streak near the lead glove during a big dive.
  if (launch > 0.35) {
    ctx.strokeStyle = `rgba(255,255,255,${0.22 * launch})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leadHand.x - lead * 14, leadHand.y + 10);
    ctx.lineTo(leadHand.x - lead * 44, leadHand.y + 18);
    ctx.moveTo(leadHand.x - lead * 8, leadHand.y - 4);
    ctx.lineTo(leadHand.x - lead * 38, leadHand.y - 3);
    ctx.stroke();
  }

  ctx.restore();
}
function drawReboundTrail() {
  const shot = game.shot;
  if (!shot || !shot.rebound || !shot.rebound.trail) return;

  ctx.save();
  shot.rebound.trail.forEach((point, index) => {
    if (point.alpha < 0.015) return;
    const radius = 18 * point.scale * (0.62 + index / 18);
    ctx.globalAlpha = point.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawBallShadow(shot) {
  const x = shot.shadowX ?? shot.x;
  const y = shot.shadowY ?? shot.y + 9;
  const scale = shot.shadowScale ?? shot.scale ?? 1;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.24)';
  ctx.beginPath();
  ctx.ellipse(x, y, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoalEffects() {
  drawNetRipple();
  drawFrameImpactEffect();
}

function drawNetRipple() {
  const ripple = game.netRipple;
  if (!ripple) return;

  const t = clamp(ripple.time / ripple.duration, 0, 1);
  const fade = Math.pow(1 - t, 1.4);
  const snap = Math.sin(Math.PI * Math.min(1, t * 1.25));
  const shake = Math.sin(t * Math.PI * 11) * fade;
  const radiusX = lerp(20, ripple.radiusX * 0.86, easeOutCubic(t));
  const radiusY = lerp(10, ripple.radiusY * 0.72, easeOutCubic(t));

  ctx.save();

  // Soft glow at the exact point where the ball hits the net.
  const glow = ctx.createRadialGradient(ripple.x, ripple.y, 2, ripple.x, ripple.y, radiusX * 0.72);
  glow.addColorStop(0, `rgba(255,255,255,${0.24 * fade})`);
  glow.addColorStop(0.55, `rgba(255,255,255,${0.10 * fade})`);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(ripple.x, ripple.y + snap * 12, radiusX, radiusY + snap * 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Expanding wave rings on the net.
  ctx.strokeStyle = `rgba(255,255,255,${0.58 * fade})`;
  ctx.lineWidth = lerp(3.2, 1, t);
  ctx.beginPath();
  ctx.ellipse(ripple.x, ripple.y + snap * 12 + shake * 6, radiusX, radiusY + snap * 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,220,80,${0.24 * fade})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(ripple.x, ripple.y + snap * 10, radiusX * 0.62, radiusY * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Extra vibrating strings around the hit point, making the net feel elastic.
  ctx.strokeStyle = `rgba(255,255,255,${0.42 * fade})`;
  ctx.lineWidth = 1.4;
  for (let i = -4; i <= 4; i += 1) {
    const y = ripple.y + i * 12;
    const local = Math.exp(-(i * i) / 9);
    const bend = snap * 24 * local + shake * 7 * local;
    ctx.beginPath();
    ctx.moveTo(ripple.x - radiusX * 0.62, y);
    ctx.quadraticCurveTo(ripple.x, y + bend, ripple.x + radiusX * 0.62, y);
    ctx.stroke();
  }

  for (let i = -3; i <= 3; i += 1) {
    const x = ripple.x + i * 18;
    const local = Math.exp(-(i * i) / 7);
    const bend = snap * 18 * local + shake * 5 * local;
    ctx.beginPath();
    ctx.moveTo(x, ripple.y - radiusY * 0.62);
    ctx.quadraticCurveTo(x + bend * 0.35 * (ripple.side || 1), ripple.y, x, ripple.y + radiusY * 0.68 + bend);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFrameImpactEffect() {
  const impact = game.frameImpact;
  if (!impact) return;

  const t = clamp(impact.time / impact.duration, 0, 1);
  const alpha = 1 - t;
  const radius = lerp(8, 42, easeOutCubic(t));

  ctx.save();
  ctx.translate(impact.x, impact.y);
  ctx.strokeStyle = `rgba(255,230,90,${alpha})`;
  ctx.lineWidth = lerp(4, 1, t);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.86})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const inner = 8 + t * 9;
    const outer = 18 + t * 24;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall(x, y, radius, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.lineWidth = Math.max(1.5, radius * 0.08);
  ctx.stroke();

  ctx.fillStyle = '#111';
  drawPentagon(0, 0, radius * 0.35);
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35);
    ctx.lineTo(Math.cos(a) * radius * 0.86, Math.sin(a) * radius * 0.86);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPentagon(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPhaseMessage() {
  ctx.save();
  ctx.textAlign = 'center';
  const isResult = ['GOAL!', 'SAVED!', 'MISSED!', 'POST!', 'CROSSBAR!'].includes(game.phaseMessage);
  ctx.font = isResult ? '950 62px system-ui' : '900 28px system-ui';
  ctx.fillStyle = isResult ? (game.phaseMessage === 'GOAL!' ? '#1df26b' : game.phaseMessage === 'SAVED!' ? '#ffd21f' : '#ffdf5a') : '#ffffff';
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.lineWidth = isResult ? 8 : 5;
  const text = game.phaseMessage || '';
  const y = isResult ? 128 : 116;
  ctx.strokeText(text, W / 2, y);
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

function drawGoalClickOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(GOAL.x, GOAL.y, GOAL.w, GOAL.h);
  ctx.strokeStyle = 'rgba(255, 210, 31, .70)';
  ctx.lineWidth = 2;

  for (let i = 1; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(GOAL.x + (GOAL.w / 3) * i, GOAL.y);
    ctx.lineTo(GOAL.x + (GOAL.w / 3) * i, GOAL.y + GOAL.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(GOAL.x, GOAL.y + (GOAL.h / 3) * i);
    ctx.lineTo(GOAL.x + GOAL.w, GOAL.y + (GOAL.h / 3) * i);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 210, 31, .16)';
  ctx.beginPath();
  ctx.arc(game.mouse.x, game.mouse.y, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd21f';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '900 22px system-ui';
  ctx.textAlign = 'center';
  const overlayText = shouldShowOpponentHint()
    ? (game.opponentHint.active ? 'WATCH THE GLOVE HINT' : 'CLICK A DIVE SPOT')
    : 'NO HINT - PICK A DIVE SPOT';
  ctx.fillText(overlayText, GOAL.x + GOAL.w / 2, GOAL.y - 18);
  ctx.restore();
}

function drawOpponentShotHint() {
  const hint = game.opponentHint;
  if (!hint.active || hint.alpha <= 0) return;

  const pulse = 1 + Math.sin(hint.elapsed * 18) * 0.08;
  const intro = clamp(hint.elapsed / 0.14, 0, 1);
  const scale = pulse * lerp(0.78, 1, easeOutCubic(intro));
  const alpha = hint.alpha;

  ctx.save();
  ctx.translate(hint.x, hint.y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 48);
  glow.addColorStop(0, 'rgba(255,230,90,.48)');
  glow.addColorStop(0.62, 'rgba(255,230,90,.16)');
  glow.addColorStop(1, 'rgba(255,230,90,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,222,62,.88)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.stroke();

  drawHintGlove(-12, 1, -0.24);
  drawHintGlove(12, 1, 0.24);

  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHintGlove(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = '#f8fbff';
  ctx.strokeStyle = 'rgba(16,40,68,.55)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(0, 5, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (let i = -2; i <= 2; i += 1) {
    const fx = i * 3.2;
    roundRect(ctx, fx - 1.4, -11, 2.8, 12, 1.4, true, true);
  }

  ctx.fillStyle = '#ffd23e';
  roundRect(ctx, -8, 12, 16, 6, 3, true, false);

  ctx.restore();
}

function drawControls() {
  Object.entries(CONTROL_BARS).forEach(([key, bar]) => {
    drawControlBar(key, bar);
  });
}

function drawControlBar(key, bar) {
  const active = game.mode === 'playerAim' && game.activeControl === key;
  const locked = controlIsLocked(key);

  ctx.save();
  ctx.fillStyle = active ? 'rgba(255, 210, 31, .22)' : locked ? 'rgba(22, 226, 118, .20)' : 'rgba(255,255,255,.16)';
  ctx.strokeStyle = active ? '#ffd21f' : locked ? '#16e276' : 'rgba(255,255,255,.55)';
  ctx.lineWidth = active ? 4 : 2;
  roundRect(ctx, bar.x, bar.y, bar.w, bar.h, 10, true, true);

  ctx.strokeStyle = 'rgba(255,255,255,.40)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bar.x + bar.w / 2, bar.y + 4);
  ctx.lineTo(bar.x + bar.w / 2, bar.y + bar.h - 4);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 18px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(bar.left, bar.x + 10, bar.y + 25);
  ctx.textAlign = 'right';
  ctx.fillText(bar.right, bar.x + bar.w - 10, bar.y + 25);

  const t = locked ? game.lockedShot[key] : game.controlValue[key];
  const mx = bar.x + 22 + t * (bar.w - 44);
  const my = bar.y + bar.h / 2;
  ctx.fillStyle = active ? '#ffd21f' : locked ? '#16e276' : '#d7e7ff';
  ctx.beginPath();
  ctx.arc(mx, my, active ? 18 : 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(bar.label, bar.x + bar.w / 2, bar.y + 66);

  if (active) {
    ctx.font = '900 13px system-ui';
    ctx.fillStyle = '#ffd21f';
    ctx.fillText('ACTIVE', bar.x + bar.w / 2, bar.y - 8);
  } else if (locked) {
    ctx.font = '900 13px system-ui';
    ctx.fillStyle = '#16e276';
    ctx.fillText('LOCKED', bar.x + bar.w / 2, bar.y - 8);
  }
  ctx.restore();
}

function controlIsLocked(key) {
  const activeIndex = CONTROL_ORDER.indexOf(game.activeControl);
  if (activeIndex === -1) return true;
  return CONTROL_ORDER.indexOf(key) < activeIndex;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function handleCanvasClick(event) {
  const point = canvasPoint(event);

  if (game.mode === 'playerAim') {
    if (game.waitingForWhistle) return;
    const bar = CONTROL_BARS[game.activeControl];
    if (point.x >= bar.x && point.x <= bar.x + bar.w && point.y >= bar.y - 18 && point.y <= bar.y + bar.h + 32) {
      lockActiveControl();
    }
  } else if (game.mode === 'goalkeeperPick') {
    if (game.waitingForWhistle) return;
    if (point.x >= GOAL.x && point.x <= GOAL.x + GOAL.w && point.y >= GOAL.y && point.y <= GOAL.y + GOAL.h) {
      createOpponentShot(point);
    }
  }
}

function handleCanvasMove(event) {
  game.mouse = canvasPoint(event);
}

function keyDown(event) {
  if (!screens.game.classList.contains('active')) return;
  if (event.code === 'Space') {
    event.preventDefault();
    if (game.mode === 'playerAim' && !game.waitingForWhistle) lockActiveControl();
  }
}

function roundRect(context, x, y, width, height, radius, fill, stroke) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  if (fill) context.fill();
  if (stroke) context.stroke();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}


function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}


function generateCrowdDots() {
  crowdDots = [];
  const palette = ['rgba(255,255,255,.72)', 'rgba(255,209,31,.65)', 'rgba(20,220,120,.55)', 'rgba(220,50,60,.55)', 'rgba(80,170,255,.55)'];
  for (let y = 50; y < 185; y += 10) {
    for (let x = 0; x < W; x += 14) {
      if (Math.random() < 0.72) {
        crowdDots.push({
          x: x + Math.random() * 8,
          y: y + Math.random() * 5,
          w: randomRange(3, 5),
          h: randomRange(3, 6),
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    }
  }
}

function setupEvents() {
  document.getElementById('playBtn').addEventListener('click', () => {
    audioManager.unlock();
    playTone('click');
    showScreen('team');
  });
  document.getElementById('howBtn').addEventListener('click', () => {
    audioManager.unlock();
    playTone('click');
    showScreen('how');
  });
  document.getElementById('backFromHowBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('backFromTeamBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('continueBtn').addEventListener('click', () => {
    if (!selectedTeam) return;
    audioManager.unlock();
    playTone('click');
    preparePreview();
  });
  document.getElementById('backFromPreviewBtn').addEventListener('click', () => showScreen('team'));
  document.getElementById('startMatchBtn').addEventListener('click', () => {
    audioManager.unlock();
    playTone('click');
    startGame({ newTournament: true });
  });
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    audioManager.unlock();
    playTone('click');
    if (game.lastMatchWon) {
      startNextMatch();
    } else {
      chooseOpponent();
      startGame({ newTournament: true });
    }
  });
  document.getElementById('menuAgainBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('soundBtn').addEventListener('click', () => {
    audioManager.unlock();
    audioManager.setEnabled(!soundEnabled);
    document.getElementById('soundBtn').textContent = `SOUND: ${audioManager.enabled ? 'ON' : 'OFF'}`;
    playTone('click');
  });

  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousemove', handleCanvasMove);
  window.addEventListener('keydown', keyDown);
}

function init() {
  audioManager.init();
  generateCrowdDots();
  renderTeamGrid();
  loadLogoImages();
  setupEvents();
  showScreen('menu');
}

init();
