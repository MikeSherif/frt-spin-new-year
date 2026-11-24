// Временные тексты: заменим, когда пришлёт Бекташева.
const WISHES = [
  { title: 'Мандарины', text: 'Год начнётся с запаха мандарин. Даже обычный понедельник будет чуть теплее, чем ты ждёшь.' },
  { title: 'Встреча', text: 'В январе появится человек, с которым легко молчать и ещё легче смеяться.' },
  { title: 'Подарок', text: 'Самый нужный подарок придёт без ленты и в самый обычный день. Не пропусти его.' },
  { title: 'Удача', text: 'Одна смелая мысль, сказанная вслух, успеет обернуться удачей ещё до весны.' },
  { title: 'Огоньки', text: 'Кто-то включит гирлянду ровно тогда, когда ты устанешь. Дома будет светло.' },
  { title: 'Маршрут', text: 'Год свернёт туда, куда ты давно собирался, но всё откладывал. На этот раз сверни.' },
  { title: 'Письмо', text: 'Тебе напишут тёплые слова. Сохрани их: в феврале они очень пригодятся.' },
  { title: 'Снег', text: 'То, что начнётся легко, как первый снег, окажется самым важным в этом году.' },
  { title: 'Тепло', text: 'Рядом окажется тот, кто нальёт чай и ничего не будет спрашивать. Этого хватит.' },
  { title: 'Дом', text: 'Дом встретит светом в окне. В этом году возвращаться будет легче, чем уходить.' },
  { title: 'Свет', text: 'Одна короткая хорошая новость осветит длинную неделю. Заметь её.' },
  { title: 'Полночь', text: 'Загадай желание вовремя. В этом году оно не опоздает.' },
];

const TOYS = ['ball', 'star', 'icicle', 'bell', 'house', 'cone', 'flake', 'lantern', 'clock', 'tower', 'drop', 'fir'];
const COLORS = Array.from({ length: 12 }, (_, index) => (index % 2 ? '#214091' : '#ffffff'));
const INK = Array.from({ length: 12 }, (_, index) => (index % 2 ? '#ffffff' : '#214091'));

const NS = 'http://www.w3.org/2000/svg';
const rotor = document.getElementById('rotor');
const svg = document.getElementById('wheel');
const frt = document.querySelector('.spin-frt');
const hub = document.querySelector('.spin-hub');
const button = document.getElementById('spin');
const card = document.getElementById('card');
const cardTitle = document.getElementById('card-title');
const cardText = document.getElementById('card-text');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let rotation = 0;
let busy = false;
let awaiting = false;

function polar(cx, cy, radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function slicePath(cx, cy, radius, start, end) {
  const [x0, y0] = polar(cx, cy, radius, start);
  const [x1, y1] = polar(cx, cy, radius, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1} Z`;
}

function node(name, attrs, parent) {
  const el = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (parent) parent.append(el);
  return el;
}

function toyColors(index) {
  const light = index % 2 === 0;
  const mains = light ? ['#ed1c24', '#214091', '#f58220'] : ['#ffffff', '#f6c445', '#ffd7a8'];
  return {
    main: mains[index % 3],
    alt: light ? '#f6c445' : '#ed1c24',
    cap: light ? '#163024' : '#f6c445',
    line: light ? '#ffffff' : '#214091',
  };
}

function drawToy(g, kind, index) {
  const { main, alt, cap, line } = toyColors(index);
  if (kind === 'ball') {
    node('circle', { cx: 0, cy: 2, r: 12, fill: main }, g);
    node('path', { d: 'M-11 0 Q0 -6 11 0', fill: 'none', stroke: line, 'stroke-width': 2 }, g);
    node('path', { d: 'M-10 6 Q0 1 10 6', fill: 'none', stroke: line, 'stroke-width': 2 }, g);
    node('circle', { cx: -4, cy: -2, r: 2.2, fill: '#fff', opacity: '0.85' }, g);
  } else if (kind === 'star') {
    node('polygon', { points: '0,-14 3.6,-4.4 13.4,-4.4 5.4,1.6 8.6,11.2 0,5.2 -8.6,11.2 -5.4,1.6 -13.4,-4.4 -3.6,-4.4', fill: main }, g);
  } else if (kind === 'icicle') {
    node('path', { d: 'M-6 -12 H6 L0 16 Z', fill: main }, g);
    node('path', { d: 'M-2 -12 L0 8', fill: 'none', stroke: '#fff', 'stroke-width': 1.4, opacity: '0.8' }, g);
  } else if (kind === 'bell') {
    node('path', { d: 'M0 -14 C8 -12 11 -4 11 4 H-11 C-11 -4 -8 -12 0 -14 Z', fill: main }, g);
    node('path', { d: 'M-12 4 H12', stroke: line, 'stroke-width': 2 }, g);
    node('circle', { cx: 0, cy: 8, r: 2.4, fill: alt }, g);
  } else if (kind === 'house') {
    node('path', { d: 'M-13 1 L0 -13 L13 1 Z', fill: alt }, g);
    node('rect', { x: -9, y: 1, width: 18, height: 13, rx: 1, fill: main }, g);
    node('rect', { x: -2.4, y: 7, width: 4.8, height: 7, fill: line }, g);
    node('rect', { x: -7, y: 4, width: 3.4, height: 3.4, fill: line }, g);
  } else if (kind === 'cone') {
    node('ellipse', { cx: 0, cy: 2, rx: 8, ry: 13, fill: main }, g);
    node('path', { d: 'M-7 -2 H7 M-8 4 H8 M-6 9 H6', stroke: line, 'stroke-width': 1.4 }, g);
  } else if (kind === 'flake') {
    node('path', { d: 'M0 -13 V13 M-12 0 H12 M-9 -9 L9 9 M-9 9 L9 -9 M-3 -11 L0 -7 L3 -11 M-3 11 L0 7 L3 11', stroke: main, 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' }, g);
  } else if (kind === 'lantern') {
    node('rect', { x: -7, y: -8, width: 14, height: 18, rx: 3, fill: main }, g);
    node('rect', { x: -4, y: -4, width: 8, height: 10, rx: 1, fill: alt }, g);
    node('rect', { x: -3, y: -12, width: 6, height: 4, fill: cap }, g);
  } else if (kind === 'clock') {
    node('circle', { cx: 0, cy: 1, r: 12, fill: main }, g);
    node('circle', { cx: 0, cy: 1, r: 9, fill: index % 2 ? '#214091' : '#fff' }, g);
    node('path', { d: 'M0 1 L0 -6 M0 1 L5 4', stroke: index % 2 ? '#fff' : '#214091', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
  } else if (kind === 'tower') {
    node('rect', { x: -5, y: -1, width: 10, height: 16, fill: main }, g);
    node('path', { d: 'M-8 -1 L0 -12 L8 -1 Z', fill: alt }, g);
    node('polygon', { points: '0,-18 1.7,-14.4 5.6,-14.4 2.4,-12.2 3.4,-8.4 0,-10.6 -3.4,-8.4 -2.4,-12.2 -5.6,-14.4 -1.7,-14.4', fill: '#ed1c24' }, g);
  } else if (kind === 'drop') {
    node('path', { d: 'M0 -14 C8 -4 10 4 0 14 C-10 4 -8 -4 0 -14 Z', fill: main }, g);
    node('circle', { cx: -2, cy: -2, r: 2, fill: '#fff', opacity: '0.8' }, g);
  } else {
    node('path', { d: 'M0 -14 L8 -4 H-8 Z M0 -6 L11 4 H-11 Z M0 2 L13 14 H-13 Z', fill: main }, g);
    node('rect', { x: -1.5, y: 12, width: 3, height: 4, fill: cap }, g);
  }
  if (kind === 'ball' || kind === 'icicle' || kind === 'drop') {
    node('rect', { x: -3.2, y: -18, width: 6.4, height: 4.5, rx: 1, fill: cap }, g);
  }
}

function drawWheel() {
  const cx = 250;
  const cy = 250;
  const radius = 214;
  const step = 360 / WISHES.length;

  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('cx', cx);
  ring.setAttribute('cy', cy);
  ring.setAttribute('r', '236');
  ring.setAttribute('fill', '#214091');
  svg.append(ring);

  const rim = document.createElementNS(NS, 'circle');
  rim.setAttribute('cx', cx);
  rim.setAttribute('cy', cy);
  rim.setAttribute('r', '226');
  rim.setAttribute('fill', 'none');
  rim.setAttribute('stroke', '#f6c445');
  rim.setAttribute('stroke-width', '2.5');
  svg.append(rim);

  const garland = document.createElementNS(NS, 'circle');
  garland.setAttribute('cx', cx);
  garland.setAttribute('cy', cy);
  garland.setAttribute('r', '219');
  garland.setAttribute('fill', 'none');
  garland.setAttribute('stroke', '#ed1c24');
  garland.setAttribute('stroke-width', '2');
  svg.append(garland);

  WISHES.forEach((wish, index) => {
    const start = index * step;
    const end = start + step;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', slicePath(cx, cy, radius, start, end));
    path.setAttribute('fill', COLORS[index]);
    path.setAttribute('stroke', '#e7edf8');
    path.setAttribute('stroke-width', '2');
    svg.append(path);

    const mid = start + step / 2;
    const [tx, ty] = polar(cx, cy, 176, mid);
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('fill', INK[index]);
    text.setAttribute('font-family', 'Montserrat, Helvetica Neue, Arial, sans-serif');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', '800');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('transform', `rotate(${mid} ${tx} ${ty})`);
    text.textContent = wish.title;
    svg.append(text);

    const [ox, oy] = polar(cx, cy, 124, mid);
    const toy = node('g', { transform: `translate(${ox} ${oy}) rotate(${mid}) scale(1.28)` });
    drawToy(toy, TOYS[index], index);
    svg.append(toy);
  });

  const lights = ['#ffffff', '#f6c445', '#ed1c24', '#f58220'];
  for (let i = 0; i < 24; i += 1) {
    const [x, y] = polar(cx, cy, 231, i * 15);
    const group = node('g', { class: 'spin-bulb' });
    group.style.animationDelay = `${(i % 8) * 0.16}s`;
    node('circle', { cx: x, cy: y, r: 6.2, fill: '#fff', opacity: '0.45' }, group);
    node('circle', { cx: x, cy: y, r: 3.5, fill: lights[i % lights.length] }, group);
    svg.append(group);
  }

  node('circle', {
    cx, cy, r: 231, fill: 'none', class: 'spin-chase',
    stroke: '#fff8e1', 'stroke-width': '2', 'stroke-dasharray': '7 23',
  }, svg);
}

function showCard(wish) {
  card.classList.remove('maze-panel--visible');
  window.setTimeout(() => {
    cardTitle.textContent = wish.title;
    cardText.textContent = wish.text;
    void card.offsetWidth;
    card.classList.add('maze-panel--visible');
  }, reduce ? 0 : 180);
}

function finish(index) {
  busy = false;
  awaiting = false;
  rotor.classList.remove('is-live', 'is-coax', 'is-winding');
  hub.classList.remove('is-burst');
  button.disabled = false;
  button.textContent = 'Крутить ещё';
  showCard(WISHES[index]);
}

function crank() {
  frt.classList.remove('is-cranking');
  const actor = frt.querySelector('svg') || frt;
  actor.classList.remove('is-cranking');
  void frt.offsetWidth;
  frt.classList.add('is-cranking');
  actor.classList.add('is-cranking');
  window.setTimeout(() => {
    frt.classList.remove('is-cranking');
    actor.classList.remove('is-cranking');
  }, 2900);
}

function spin() {
  if (busy) return;
  busy = true;
  button.disabled = true;
  card.classList.remove('maze-panel--visible');
  if (!reduce) crank();

  const index = Math.floor(Math.random() * WISHES.length);
  const step = 360 / WISHES.length;
  const current = ((rotation % 360) + 360) % 360;
  const target = (360 - (index + 0.5) * step) % 360;
  let delta = target - current;
  if (delta < 0) delta += 360;
  const next = rotation + 360 * 6 + delta;

  if (reduce) {
    rotation = next;
    rotor.style.transform = `rotate(${rotation}deg)`;
    finish(index);
    return;
  }

  window.setTimeout(() => {
    rotor.classList.add('is-coax');
    void rotor.offsetWidth;
    rotor.style.transform = `rotate(${rotation + 46}deg)`;
  }, 780);

  window.setTimeout(() => {
    rotor.classList.remove('is-coax');
    rotor.classList.add('is-live');
    hub.classList.add('is-burst');
    void rotor.offsetWidth;
    rotation = next;
    awaiting = true;
    rotor.style.transform = `rotate(${rotation}deg)`;
  }, 2520);
}

rotor.addEventListener('transitionend', (event) => {
  if (!awaiting || event.propertyName !== 'transform' || event.elapsedTime < 2) return;
  const index = WISHES.findIndex((_, item) => {
    const step = 360 / WISHES.length;
    const landed = ((rotation % 360) + 360) % 360;
    const target = (360 - (item + 0.5) * step + 360) % 360;
    return Math.abs(landed - target) < 1;
  });
  finish(index < 0 ? 0 : index);
});

function lights() {
  const root = document.querySelector('.spin-lights');
  const colors = ['#ed1c24', '#f6c445', '#f58220', '#ffffff', '#d6e2ff'];
  for (let i = 0; i < 22; i += 1) {
    const bulb = document.createElement('i');
    bulb.style.setProperty('--c', colors[i % colors.length]);
    bulb.style.setProperty('--d', `${(i % 6) * 0.18}s`);
    root.append(bulb);
  }
}

function snow() {
  const root = document.querySelector('.spin-snow');
  const flakes = ['❄', '✦', '❅'];
  for (let i = 0; i < 28; i += 1) {
    const flake = document.createElement('i');
    flake.textContent = flakes[i % flakes.length];
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.fontSize = `${8 + Math.random() * 12}px`;
    flake.style.opacity = String(0.35 + Math.random() * 0.5);
    flake.style.setProperty('--dx', `${-16 + Math.random() * 40}px`);
    flake.style.animationDuration = `${9 + Math.random() * 12}s`;
    flake.style.animationDelay = `${-Math.random() * 12}s`;
    root.append(flake);
  }
}

function mountMascot() {
  fetch('assets/img/frtoshka.svg')
    .then((response) => response.text())
    .then((text) => {
      const root = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
      if (root.tagName.toLowerCase() !== 'svg') return;
      root.setAttribute('aria-hidden', 'true');
      frt.replaceChildren(root);
    })
    .catch(() => {});
}

function motionHelp() {
  const motion = document.querySelector('.spin-motion');
  const ask = motion.querySelector('.spin-motion__ask');
  const card = document.getElementById('spin-motion-help');

  function expanded(open) {
    ask.setAttribute('aria-expanded', open ? 'true' : 'false');
    card.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function shown() {
    return motion.classList.contains('is-open') || motion.matches(':hover') || motion.matches(':focus-within');
  }

  ask.addEventListener('click', (event) => {
    event.stopPropagation();
    motion.classList.toggle('is-open');
    expanded(shown());
  });

  function close() {
    motion.classList.remove('is-open');
    if (motion.contains(document.activeElement)) document.activeElement.blur();
    expanded(false);
  }

  document.addEventListener('click', (event) => {
    if (motion.contains(event.target)) return;
    close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    close();
  });

  motion.addEventListener('pointerenter', () => expanded(true));
  motion.addEventListener('pointerleave', () => expanded(shown()));
  motion.addEventListener('focusin', () => expanded(true));
  motion.addEventListener('focusout', () => expanded(shown()));
}

drawWheel();
lights();
snow();
mountMascot();
button.addEventListener('click', spin);
motionHelp();
