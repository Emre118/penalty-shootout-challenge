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
  game.activeControl = 'direction';
  game.controlValue = { direction: 0.5, height: 0.5, power: 0.5 };
  game.lockedShot = { direction: 0.5, height: 0.5, power: 0.5 };
  game.markers = {
    direction: { t: Math.random(), dir: 1 },
    height: { t: Math.random(), dir: 1 },
    power: { t: Math.random(), dir: 1 },
  };
  game.shot = null;
  game.keeper = { x: KEEPER_HOME.x, y: KEEPER_HOME.y, tx: KEEPER_HOME.x, ty: KEEPER_HOME.y, lean: 0 };
  game.resultTimer = 0;
  canvasHint.textContent = 'Click the active control or press Space.';
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
  Object.entries(game.markers).forEach(([key, marker]) => {
    marker.t += marker.dir * speed * dt;
    if (marker.t > 1) {
      marker.t = 1;
      marker.dir = -1;
    } else if (marker.t < 0) {
      marker.t = 0;
      marker.dir = 1;
    }
    game.controlValue[key] = marker.t;
  });
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
  game.activeControl = 'direction';
  game.phaseMessage = game.suddenDeath ? 'Sudden Death: select direction' : 'Select shot direction';
  canvasHint.textContent = 'Click the Direction bar or press Space.';
  game.markers.direction.t = Math.random();
  game.markers.height.t = Math.random();
  game.markers.power.t = Math.random();
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
    drawBall(BALL_START.x, BALL_START.y, 22, 0);
  }
  drawPhaseMessage();

  if (game.mode === 'goalkeeperPick') {
    drawGoalClickOverlay();
  }

  drawControls();
}

function drawStadium() {
  const sky = ctx.createLinearGradient(0, 0, 0, 210);
  sky.addColorStop(0, '#2d8fe2');
  sky.addColorStop(1, '#0e5aa4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 260);

  ctx.fillStyle = '#0a1b2d';
  ctx.fillRect(0, 42, W, 155);

  crowdDots.forEach((dot) => {
    ctx.fillStyle = dot.color;
    ctx.fillRect(dot.x, dot.y, dot.w, dot.h);
  });

  ctx.fillStyle = '#073762';
  ctx.fillRect(0, 196, W, 44);
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
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#36b83f' : '#2fad37';
    ctx.fillRect(0, 260 + i * 64, W, 64);
  }

  // perspective penalty area
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
}

function drawGoal() {
  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = 'rgba(255,255,255,.04)';
  ctx.fillRect(GOAL.x, GOAL.y, GOAL.w, GOAL.h);
  ctx.strokeRect(GOAL.x, GOAL.y, GOAL.w, GOAL.h);

  // net
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(255,255,255,.64)';
  for (let x = GOAL.x + 18; x < GOAL.x + GOAL.w; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, GOAL.y + 2);
    ctx.lineTo(x - 35, GOAL.y + GOAL.h);
    ctx.stroke();
  }
  for (let y = GOAL.y + 18; y < GOAL.y + GOAL.h; y += 18) {
    ctx.beginPath();
    ctx.moveTo(GOAL.x, y);
    ctx.lineTo(GOAL.x + GOAL.w, y + 6);
    ctx.stroke();
  }

  // back posts shadow
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath();
  ctx.moveTo(GOAL.x - 18, GOAL.y + 24);
  ctx.lineTo(GOAL.x, GOAL.y);
  ctx.moveTo(GOAL.x + GOAL.w + 18, GOAL.y + 24);
  ctx.lineTo(GOAL.x + GOAL.w, GOAL.y);
  ctx.stroke();
  ctx.restore();
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
  drawFootballer(PLAYER_POS.x, PLAYER_POS.y, team.primary, team.secondary, true);
}

function drawGoalkeeper() {
  const color = '#c9ff11';
  drawGoalkeeperFigure(game.keeper.x, game.keeper.y, color, game.keeper.lean);
}

function drawFootballer(x, y, primary, secondary, facingGoal = true) {
  ctx.save();
  ctx.translate(x, y);

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(0, 48, 36, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, 18);
  ctx.lineTo(-18, 45);
  ctx.moveTo(13, 18);
  ctx.lineTo(18, 45);
  ctx.stroke();

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-18, 45);
  ctx.lineTo(-24, 48);
  ctx.moveTo(18, 45);
  ctx.lineTo(26, 48);
  ctx.stroke();

  // shorts
  ctx.fillStyle = secondary;
  ctx.fillRect(-18, 4, 36, 20);

  // shirt stripes
  ctx.fillStyle = primary;
  ctx.fillRect(-22, -46, 44, 52);
  ctx.fillStyle = secondary;
  for (let sx = -15; sx <= 15; sx += 14) {
    ctx.fillRect(sx, -46, 7, 52);
  }

  // arms
  ctx.strokeStyle = primary;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-23, -32);
  ctx.lineTo(-34, -2);
  ctx.moveTo(23, -32);
  ctx.lineTo(34, -2);
  ctx.stroke();

  // head
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(0, -62, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGoalkeeperFigure(x, y, color, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean * 0.25);

  ctx.fillStyle = 'rgba(0,0,0,.20)';
  ctx.beginPath();
  ctx.ellipse(0, 58, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(-38 - lean * 20, -38);
  ctx.moveTo(14, -8);
  ctx.lineTo(38 - lean * 20, -38);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillRect(-25, -18, 50, 62);

  ctx.fillStyle = '#111';
  ctx.fillRect(-22, 38, 19, 28);
  ctx.fillRect(3, 38, 19, 28);

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-13, 64);
  ctx.lineTo(-24, 70);
  ctx.moveTo(13, 64);
  ctx.lineTo(24, 70);
  ctx.stroke();

  ctx.fillStyle = '#ffd6ad';
  ctx.beginPath();
  ctx.arc(0, -36, 18, 0, Math.PI * 2);
  ctx.fill();

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
  const locked = game.mode === 'playerAim' && controlIsLocked(key);

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

  const t = game.mode === 'playerAim' ? game.controlValue[key] : game.lockedShot[key];
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
  }
  ctx.restore();
}

function controlIsLocked(key) {
  if (game.activeControl === 'direction') return false;
  if (game.activeControl === 'height') return key === 'direction';
  if (game.activeControl === 'power') return key === 'direction' || key === 'height';
  return true;
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
