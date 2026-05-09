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

const game = {
  mode: 'menu',
  phaseMessage: '',
  round: 1,
  suddenDeath: false,
  playerGoals: 0,
  opponentGoals: 0,
  playerPoints: 0,
  opponentPoints: 0,
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
  keeper: {
    x: KEEPER_HOME.x,
    y: KEEPER_HOME.y,
    tx: KEEPER_HOME.x,
    ty: KEEPER_HOME.y,
    lean: 0,
  },
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
  const candidates = TEAMS.filter((team) => team.id !== selectedTeam.id);
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

function resetGame() {
  game.mode = 'playerAim';
  game.phaseMessage = 'Select shot direction';
  game.round = 1;
  game.suddenDeath = false;
  game.playerGoals = 0;
  game.opponentGoals = 0;
  game.playerPoints = 0;
  game.opponentPoints = 0;
  game.playerHistory = [];
  game.opponentHistory = [];
  resetShotControls();
  game.shot = null;
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

function startGame() {
  resetGame();
  showScreen('game');
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
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
  if (game.mode === 'playerAim') {
    updateControlMarkers(dt);
  } else if (game.mode === 'playerShot' || game.mode === 'opponentShot') {
    updateShot(dt);
  } else if (game.mode === 'resultPause') {
    game.resultTimer -= dt;
    if (game.resultTimer <= 0) {
      advanceAfterResult();
    }
  }

  updateKeeper(dt);
}

function currentDifficulty() {
  const baseRound = Math.max(1, game.round);
  return Math.min(2.4, 0.72 + (baseRound - 1) * 0.16 + (game.suddenDeath ? 0.18 : 0));
}

function updateControlMarkers(dt) {
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
  const ease = Math.min(1, dt * 9);
  game.keeper.x += (game.keeper.tx - game.keeper.x) * ease;
  game.keeper.y += (game.keeper.ty - game.keeper.y) * ease;
  game.keeper.lean += ((game.keeper.tx - KEEPER_HOME.x) / 130 - game.keeper.lean) * ease;
}

function updateShot(dt) {
  if (!game.shot) return;
  game.shot.time += dt * game.shot.speedMultiplier;
  const t = Math.min(1, game.shot.time / game.shot.duration);
  const eased = easeInOutCubic(t);
  game.shot.x = lerp(game.shot.start.x, game.shot.target.x, eased);
  game.shot.y = lerp(game.shot.start.y, game.shot.target.y, eased);
  game.shot.scale = lerp(1.55, 0.62, eased);
  game.shot.rotation += dt * (8 + game.shot.power * 11);

  if (t > 0.38) {
    const keeperEase = Math.min(1, (t - 0.38) / 0.42);
    game.keeper.tx = lerp(KEEPER_HOME.x, game.shot.keeperTarget.x, easeOutCubic(keeperEase));
    game.keeper.ty = lerp(KEEPER_HOME.y, game.shot.keeperTarget.y, easeOutCubic(keeperEase));
  }

  if (t >= 1) {
    finishShot();
  }
}

function finishShot() {
  const shot = game.shot;
  if (!shot) return;

  const result = evaluateShot(shot);
  shot.result = result;

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
      game.opponentPoints += 100;
      playTone('goal');
    } else {
      playTone(result.saved ? 'save' : 'miss');
    }
  }

  game.mode = 'resultPause';
  game.phaseMessage = result.label;
  game.resultTimer = 1.45;
}

function evaluateShot(shot) {
  if (!shot.inGoal) {
    return { goal: false, saved: false, label: 'MISSED!' };
  }

  const dx = shot.target.x - shot.keeperTarget.x;
  const dy = shot.target.y - shot.keeperTarget.y;
  const distance = Math.hypot(dx, dy);
  const saveRadius = 118 - shot.power * 45 + (shot.height < 0.24 ? 12 : 0);
  const saved = distance < saveRadius;

  if (saved) {
    return { goal: false, saved: true, label: 'SAVED!' };
  }

  return { goal: true, saved: false, label: 'GOAL!' };
}

function advanceAfterResult() {
  game.shot = null;
  resetKeeper();

  if (game.mode !== 'resultPause') return;

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
  game.phaseMessage = 'Defend! Click inside the goal.';
  canvasHint.textContent = 'Click inside the goal to choose your goalkeeper dive spot.';
}

function lockActiveControl() {
  if (game.mode !== 'playerAim') return;

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
    createPlayerShot();
  }
}

function createPlayerShot() {
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
  game.phaseMessage = 'Shot!';
  canvasHint.textContent = 'Watch the shot result.';
}

function chooseKeeperTargetAgainstPlayer(shot) {
  const difficulty = Math.min(0.78, 0.25 + (game.round - 1) * 0.09 + (game.suddenDeath ? 0.10 : 0));
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
  const shotValues = generateOpponentShotValues();
  const shot = buildShotFromValues({
    shooter: 'opponent',
    direction: shotValues.direction,
    height: shotValues.height,
    power: shotValues.power,
  });
  shot.keeperTarget = {
    x: clamp(clickPoint.x, GOAL.x + 35, GOAL.x + GOAL.w - 35),
    y: clamp(clickPoint.y, GOAL.y + 38, GOAL.y + GOAL.h - 38),
  };
  game.shot = shot;
  game.mode = 'opponentShot';
  game.phaseMessage = 'Opponent shot!';
  canvasHint.textContent = 'Watch the shot result.';
  playTone('click');
}

function generateOpponentShotValues() {
  const accuracy = Math.min(0.83, 0.53 + (game.round - 1) * 0.045 + (game.suddenDeath ? 0.08 : 0));
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
  const dirAmount = (direction - 0.5) * 2; // -1 to 1
  const powerWildness = Math.max(0, power - 0.88) * 1.25;
  const weakPenalty = Math.max(0, 0.12 - power) * 1.2;
  const targetX = GOAL.x + GOAL.w / 2 + dirAmount * (GOAL.w / 2) * (1.03 + powerWildness);
  const targetY = GOAL.y + GOAL.h - height * (GOAL.h * 1.03) + weakPenalty * 75;
  const overByHeight = height > 0.94;
  const overByPower = power > 0.96 && height > 0.70;
  const tooWide = targetX < GOAL.x + 8 || targetX > GOAL.x + GOAL.w - 8;
  const tooHigh = targetY < GOAL.y + 4 || overByHeight || overByPower;
  const tooWeak = power < 0.06;
  const inGoal = !tooWide && !tooHigh && !tooWeak;

  return {
    shooter,
    start: { ...BALL_START },
    x: BALL_START.x,
    y: BALL_START.y,
    target: { x: targetX, y: targetY },
    inGoal,
    direction,
    height,
    power,
    time: 0,
    duration: lerp(1.3, 0.68, power),
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
  const title = document.getElementById('finalTitle');
  const summary = document.getElementById('finalSummary');
  const playerScore = document.getElementById('finalPlayerScore');
  const opponentScore = document.getElementById('finalOpponentScore');

  fillLogoSlot('finalPlayerLogo', selectedTeam, 'small-crest');
  fillLogoSlot('finalOpponentLogo', opponentTeam, 'small-crest');
  document.getElementById('finalPlayerName').textContent = selectedTeam.name;
  document.getElementById('finalOpponentName').textContent = opponentTeam.name;
  playerScore.textContent = game.playerPoints;
  opponentScore.textContent = game.opponentPoints;

  if (game.playerPoints > game.opponentPoints) {
    title.textContent = 'You Won!';
    summary.textContent = `${selectedTeam.name} wins the shootout ${game.playerGoals}-${game.opponentGoals}.`;
  } else if (game.playerPoints < game.opponentPoints) {
    title.textContent = 'You Lost!';
    summary.textContent = `${opponentTeam.name} wins the shootout ${game.opponentGoals}-${game.playerGoals}.`;
  } else {
    title.textContent = 'Draw';
    summary.textContent = 'The shootout ended level after sudden death.';
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
  if (game.shot) {
    drawBall(game.shot.x, game.shot.y, 18 * game.shot.scale, game.shot.rotation);
  } else {
    drawBall(BALL_START.x, BALL_START.y, 20, 0);
  }
  drawPhaseMessage();

  if (game.mode === 'goalkeeperPick') {
    drawGoalClickOverlay();
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

  const geometry = goalGeometry();
  drawGoalShadow(geometry);
  drawGoalMouthDepth(geometry);
  drawGoalSupportPoles(geometry);
  drawGoalBackNet(geometry);
  drawGoalRoofNet(geometry);
  drawGoalSideNets(geometry);
  drawGoalFrame(geometry);
  ctx.restore();
}

function goalGeometry() {
  const netInset = 78;
  const supportInset = 38;
  const rearTopDrop = 42;
  const rearBottomDrop = 18;
  return {
    front: {
      lt: { x: GOAL.x, y: GOAL.y },
      rt: { x: GOAL.x + GOAL.w, y: GOAL.y },
      lb: { x: GOAL.x, y: GOAL.y + GOAL.h },
      rb: { x: GOAL.x + GOAL.w, y: GOAL.y + GOAL.h },
    },
    back: {
      lt: { x: GOAL.x + netInset, y: GOAL.y + rearTopDrop },
      rt: { x: GOAL.x + GOAL.w - netInset, y: GOAL.y + rearTopDrop },
      lb: { x: GOAL.x + netInset, y: GOAL.y + GOAL.h + rearBottomDrop },
      rb: { x: GOAL.x + GOAL.w - netInset, y: GOAL.y + GOAL.h + rearBottomDrop },
    },
    support: {
      lt: { x: GOAL.x + supportInset, y: GOAL.y + rearTopDrop - 8 },
      rt: { x: GOAL.x + GOAL.w - supportInset, y: GOAL.y + rearTopDrop - 8 },
      lb: { x: GOAL.x + supportInset, y: GOAL.y + GOAL.h + rearBottomDrop + 4 },
      rb: { x: GOAL.x + GOAL.w - supportInset, y: GOAL.y + GOAL.h + rearBottomDrop + 4 },
    },
  };
}

function drawGoalShadow(goal) {
  const shadow = ctx.createRadialGradient(
    GOAL.x + GOAL.w / 2,
    goal.front.lb.y + 12,
    40,
    GOAL.x + GOAL.w / 2,
    goal.front.lb.y + 20,
    GOAL.w * 0.68
  );
  shadow.addColorStop(0, 'rgba(0,0,0,.28)');
  shadow.addColorStop(0.62, 'rgba(0,0,0,.15)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(GOAL.x + GOAL.w / 2, goal.front.lb.y + 18, GOAL.w * 0.67, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.beginPath();
  ctx.moveTo(goal.front.lb.x - 16, goal.front.lb.y + 8);
  ctx.lineTo(goal.front.rb.x + 16, goal.front.rb.y + 8);
  ctx.lineTo(goal.back.rb.x + 46, goal.back.rb.y + 12);
  ctx.lineTo(goal.back.lb.x - 46, goal.back.lb.y + 12);
  ctx.closePath();
  ctx.fill();
}

function drawGoalMouthDepth(goal) {
  const mouth = ctx.createLinearGradient(0, goal.front.lt.y, 0, goal.front.lb.y);
  mouth.addColorStop(0, 'rgba(255,255,255,.035)');
  mouth.addColorStop(0.62, 'rgba(255,255,255,.012)');
  mouth.addColorStop(1, 'rgba(0,0,0,.055)');
  ctx.fillStyle = mouth;
  drawQuad(goal.front.lt, goal.front.rt, goal.front.rb, goal.front.lb, true, false);

  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 2;
  drawLine({ x: goal.front.lt.x + 12, y: goal.front.lt.y + 12 }, { x: goal.front.lb.x + 12, y: goal.front.lb.y - 12 });
  drawLine({ x: goal.front.rt.x - 12, y: goal.front.rt.y + 12 }, { x: goal.front.rb.x - 12, y: goal.front.rb.y - 12 });
}

function drawGoalSupportPoles(goal) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = 'rgba(16,26,36,.28)';
  ctx.lineWidth = 7;
  drawLine(goal.support.lt, goal.support.lb);
  drawLine(goal.support.rt, goal.support.rb);
  drawLine(goal.support.lt, goal.support.rt);

  ctx.strokeStyle = 'rgba(224,238,248,.54)';
  ctx.lineWidth = 3.5;
  drawLine(goal.support.lt, goal.support.lb);
  drawLine(goal.support.rt, goal.support.rb);
  drawLine(goal.support.lt, goal.support.rt);
}

function drawGoalBackNet(goal) {
  drawGoalPanel({
    a: goal.back.lt,
    b: goal.back.rt,
    c: goal.back.rb,
    d: goal.back.lb,
    columns: 10,
    rows: 6,
    fill: 'rgba(232,246,255,.045)',
    vertical: 'rgba(244,250,255,.42)',
    horizontal: 'rgba(244,250,255,.32)',
    lineWidth: 1.15,
  });
}

function drawGoalRoofNet(goal) {
  drawGoalPanel({
    a: { x: goal.front.lt.x + 14, y: goal.front.lt.y + 7 },
    b: { x: goal.front.rt.x - 14, y: goal.front.rt.y + 7 },
    c: goal.back.rt,
    d: goal.back.lt,
    columns: 9,
    rows: 4,
    fill: 'rgba(235,247,255,.075)',
    vertical: 'rgba(248,252,255,.58)',
    horizontal: 'rgba(248,252,255,.38)',
    lineWidth: 1.25,
  });
}

function drawGoalSideNets(goal) {
  drawGoalPanel({
    a: { x: goal.front.lt.x + 8, y: goal.front.lt.y + 18 },
    b: goal.support.lt,
    c: goal.support.lb,
    d: { x: goal.front.lt.x + 8, y: goal.front.lb.y - 12 },
    columns: 2,
    rows: 6,
    fill: 'rgba(235,247,255,.018)',
    vertical: 'rgba(248,252,255,.22)',
    horizontal: 'rgba(248,252,255,.18)',
    lineWidth: 1,
  });

  drawGoalPanel({
    a: goal.support.rt,
    b: { x: goal.front.rt.x - 8, y: goal.front.rt.y + 18 },
    c: { x: goal.front.rt.x - 8, y: goal.front.rb.y - 12 },
    d: goal.support.rb,
    columns: 2,
    rows: 6,
    fill: 'rgba(235,247,255,.018)',
    vertical: 'rgba(248,252,255,.22)',
    horizontal: 'rgba(248,252,255,.18)',
    lineWidth: 1,
  });
}

function drawGoalFrame(goal) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = 'rgba(17,29,38,.36)';
  ctx.lineWidth = 12;
  drawLine(goal.back.lt, goal.back.rt);
  drawLine(goal.back.lt, goal.back.lb);
  drawLine(goal.back.rt, goal.back.rb);
  drawLine(goal.back.lb, goal.back.rb);
  drawLine(goal.front.lt, goal.support.lt);
  drawLine(goal.front.rt, goal.support.rt);

  ctx.strokeStyle = 'rgba(220,236,248,.62)';
  ctx.lineWidth = 6;
  drawLine(goal.back.lt, goal.back.rt);
  drawLine(goal.back.lt, goal.back.lb);
  drawLine(goal.back.rt, goal.back.rb);
  drawLine(goal.back.lb, goal.back.rb);

  ctx.strokeStyle = 'rgba(235,246,255,.76)';
  ctx.lineWidth = 4;
  drawLine(goal.front.lt, goal.support.lt);
  drawLine(goal.front.rt, goal.support.rt);

  const frontFrame = ctx.createLinearGradient(GOAL.x, GOAL.y, GOAL.x + GOAL.w, GOAL.y + GOAL.h);
  frontFrame.addColorStop(0, '#eef8ff');
  frontFrame.addColorStop(0.35, '#ffffff');
  frontFrame.addColorStop(0.72, '#f8fdff');
  frontFrame.addColorStop(1, '#c7d8e7');
  ctx.strokeStyle = 'rgba(8,20,30,.48)';
  ctx.lineWidth = 22;
  drawLine(goal.front.lb, goal.front.lt);
  drawLine(goal.front.lt, goal.front.rt);
  drawLine(goal.front.rt, goal.front.rb);

  ctx.strokeStyle = frontFrame;
  ctx.lineWidth = 16;
  drawLine(goal.front.lb, goal.front.lt);
  drawLine(goal.front.lt, goal.front.rt);
  drawLine(goal.front.rt, goal.front.rb);

  ctx.strokeStyle = 'rgba(255,255,255,.95)';
  ctx.lineWidth = 5.5;
  drawLine({ x: goal.front.lt.x + 6, y: goal.front.lt.y + 5 }, { x: goal.front.rt.x - 6, y: goal.front.rt.y + 5 });
  drawLine({ x: goal.front.lt.x + 6, y: goal.front.lt.y + 6 }, { x: goal.front.lb.x + 6, y: goal.front.lb.y - 6 });
  drawLine({ x: goal.front.rt.x - 6, y: goal.front.rt.y + 6 }, { x: goal.front.rb.x - 6, y: goal.front.rb.y - 6 });

  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.beginPath();
  ctx.arc(goal.front.lb.x, goal.front.lb.y, 8, 0, Math.PI * 2);
  ctx.arc(goal.front.rb.x, goal.front.rb.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.beginPath();
  ctx.ellipse(goal.front.lb.x, goal.front.lb.y + 7, 18, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(goal.front.rb.x, goal.front.rb.y + 7, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath();
  ctx.ellipse(goal.back.lb.x, goal.back.lb.y + 7, 22, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(goal.back.rb.x, goal.back.rb.y + 7, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoalPanel({ a, b, c, d, columns, rows, fill, vertical, horizontal, lineWidth }) {
  ctx.fillStyle = fill;
  drawQuad(a, b, c, d, true, false);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = vertical;
  for (let i = 1; i < columns; i += 1) {
    const u = i / columns;
    drawLine(quadPoint(a, b, c, d, u, 0), quadPoint(a, b, c, d, u, 1));
  }

  ctx.strokeStyle = horizontal;
  for (let i = 1; i < rows; i += 1) {
    const v = i / rows;
    drawLine(quadPoint(a, b, c, d, 0, v), quadPoint(a, b, c, d, 1, v));
  }
}

function drawQuad(a, b, c, d, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function lerpPoint(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

function quadPoint(a, b, c, d, u, v) {
  return lerpPoint(lerpPoint(a, b, u), lerpPoint(d, c, u), v);
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
  ctx.fillText(`${game.suddenDeath ? 'SUDDEN DEATH' : `${Math.min(game.round, 5)} / 5`}`, W - 14, 27);

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
  const team = selectedTeam;
  drawFootballer(PLAYER_POS.x, PLAYER_POS.y, team.primary, team.secondary, 0.88);
}

function drawGoalkeeper() {
  const color = '#c9ff11';
  drawGoalkeeperFigure(game.keeper.x, game.keeper.y, color, game.keeper.lean, 0.94);
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

function drawGoalkeeperFigure(x, y, color, lean, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(lean * 0.18);

  ctx.fillStyle = 'rgba(0,0,0,.24)';
  ctx.beginPath();
  ctx.ellipse(0, 62, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const dive = lean * 18;
  const glove = '#f8fbff';
  const dark = '#101820';

  ctx.strokeStyle = dark;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-18, 45);
  ctx.lineTo(-36, 53);
  ctx.moveTo(18, 45);
  ctx.lineTo(36, 53);
  ctx.stroke();

  ctx.strokeStyle = '#f2f6ff';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-17, 17);
  ctx.lineTo(-24, 46);
  ctx.moveTo(17, 17);
  ctx.lineTo(24, 46);
  ctx.stroke();

  ctx.fillStyle = dark;
  roundRect(ctx, -24, 2, 48, 24, 7, true, false);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-32, -36);
  ctx.lineTo(32, -36);
  ctx.lineTo(27, 10);
  ctx.quadraticCurveTo(0, 21, -27, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fillRect(-23, -31, 46, 8);
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.fillRect(-3, -34, 6, 48);

  ctx.strokeStyle = color;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(-27, -26);
  ctx.lineTo(-51 - dive, -10);
  ctx.moveTo(27, -26);
  ctx.lineTo(51 - dive, -10);
  ctx.stroke();

  ctx.strokeStyle = '#d7a77a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-50 - dive, -10);
  ctx.lineTo(-62 - dive, 4);
  ctx.moveTo(50 - dive, -10);
  ctx.lineTo(62 - dive, 4);
  ctx.stroke();

  ctx.fillStyle = glove;
  ctx.beginPath();
  ctx.ellipse(-65 - dive, 6, 10, 13, -0.35, 0, Math.PI * 2);
  ctx.ellipse(65 - dive, 6, 10, 13, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16,24,32,.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#d7a77a';
  roundRect(ctx, -8, -51, 16, 14, 5, true, false);
  ctx.beginPath();
  ctx.arc(0, -62, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#151515';
  ctx.beginPath();
  ctx.arc(0, -68, 18, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.fillRect(-15, -66, 30, 10);

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
  const isResult = ['GOAL!', 'SAVED!', 'MISSED!'].includes(game.phaseMessage);
  ctx.font = isResult ? '950 62px system-ui' : '900 28px system-ui';
  ctx.fillStyle = isResult ? (game.phaseMessage === 'GOAL!' ? '#1df26b' : '#ffd21f') : '#ffffff';
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
  ctx.fillText('CLICK A DIVE SPOT', GOAL.x + GOAL.w / 2, GOAL.y - 18);
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
    const bar = CONTROL_BARS[game.activeControl];
    if (point.x >= bar.x && point.x <= bar.x + bar.w && point.y >= bar.y - 18 && point.y <= bar.y + bar.h + 32) {
      lockActiveControl();
    }
  } else if (game.mode === 'goalkeeperPick') {
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
    if (game.mode === 'playerAim') lockActiveControl();
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
    playTone('click');
    showScreen('team');
  });
  document.getElementById('howBtn').addEventListener('click', () => {
    playTone('click');
    showScreen('how');
  });
  document.getElementById('backFromHowBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('backFromTeamBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('continueBtn').addEventListener('click', () => {
    if (!selectedTeam) return;
    playTone('click');
    preparePreview();
  });
  document.getElementById('backFromPreviewBtn').addEventListener('click', () => showScreen('team'));
  document.getElementById('startMatchBtn').addEventListener('click', () => {
    playTone('click');
    startGame();
  });
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    chooseOpponent();
    startGame();
  });
  document.getElementById('menuAgainBtn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('soundBtn').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('soundBtn').textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
    playTone('click');
  });

  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousemove', handleCanvasMove);
  window.addEventListener('keydown', keyDown);
}

function init() {
  generateCrowdDots();
  renderTeamGrid();
  loadLogoImages();
  setupEvents();
  showScreen('menu');
}

init();
