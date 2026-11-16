const WISHES = [
  { title: 'Мандарины', text: 'Год начнётся с запаха мандарин. Даже обычный понедельник будет чуть теплее, чем ты ждёшь.' },
  { title: 'Встреча', text: 'В январе появится человек, с которым легко молчать и ещё легче смеяться.' },
  { title: 'Подарок', text: 'Самый нужный подарок придёт без ленты и в самый обычный день. Не пропусти его.' },
  { title: 'Удача', text: 'Одна смелая мысль, сказанная вслух, успеет обернуться удачей ещё до весны.' },
  { title: 'Огоньки', text: 'Кто-то включит гирлянду ровно тогда, когда ты устанешь. Дома будет светло.' },
  { title: 'Маршрут', text: 'Год свернёт туда, куда ты давно собирался, но всё откладывал. На этот раз сверни.' },
  { title: 'Письмо', text: 'Тебе напишут тёплые слова. Сохрани их: в феврале они очень пригодятся.' },
  { title: 'Снег', text: 'То, что начнётся легко, как первый снег, окажется самым важным в этом году.' },
];

const COLORS = ['#ffffff', '#214091', '#ffffff', '#214091', '#ffffff', '#214091', '#ffffff', '#214091'];
const INK = ['#214091', '#ffffff', '#214091', '#ffffff', '#214091', '#ffffff', '#214091', '#ffffff'];

const NS = 'http://www.w3.org/2000/svg';
const rotor = document.getElementById('rotor');
const svg = document.getElementById('wheel');
const frt = document.querySelector('.spin-frt');
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
    const [tx, ty] = polar(cx, cy, 138, mid);
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('fill', INK[index]);
    text.setAttribute('font-family', 'Montserrat, Helvetica Neue, Arial, sans-serif');
    text.setAttribute('font-size', '17');
    text.setAttribute('font-weight', '800');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('transform', `rotate(${mid} ${tx} ${ty})`);
    text.textContent = wish.title;
    svg.append(text);

    if (index % 2 === 0) {
      const [sx, sy] = polar(cx, cy, 86, mid);
      const flake = document.createElementNS(NS, 'text');
      flake.setAttribute('x', sx);
      flake.setAttribute('y', sy);
      flake.setAttribute('fill', '#c5d2ee');
      flake.setAttribute('font-size', '16');
      flake.setAttribute('text-anchor', 'middle');
      flake.setAttribute('dominant-baseline', 'middle');
      flake.textContent = '❄';
      svg.append(flake);
    }
  });

  const lights = ['#ffffff', '#f6c445', '#ed1c24', '#f58220'];
  for (let i = 0; i < 20; i += 1) {
    const [x, y] = polar(cx, cy, 231, i * 18);
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', x);
    glow.setAttribute('cy', y);
    glow.setAttribute('r', '6');
    glow.setAttribute('fill', '#fff');
    glow.setAttribute('opacity', '0.55');
    svg.append(glow);
    const bulb = document.createElementNS(NS, 'circle');
    bulb.setAttribute('cx', x);
    bulb.setAttribute('cy', y);
    bulb.setAttribute('r', '3.6');
    bulb.setAttribute('fill', lights[i % lights.length]);
    svg.append(bulb);
  }
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

drawWheel();
snow();
mountMascot();
button.addEventListener('click', spin);
