import { Matrix, PointerEventTypes, Vector3 } from '@babylonjs/core';
import type { Scene } from '../core/Scene';
import type { Simulation } from '../core/Simulation';
import { stats } from '../core/stats';
import { Age } from '../ecs/components/Age';
import { Behavior } from '../ecs/components/Behavior';
import { Genetics } from '../ecs/components/Genetics';
import { Health } from '../ecs/components/Health';
import { Hunger } from '../ecs/components/Hunger';
import { Position } from '../ecs/components/Position';
import { PredatorState } from '../ecs/components/PredatorState';
import { Velocity } from '../ecs/components/Velocity';
import { CrabTag, SharkTag } from '../ecs/components/Tags';
import { drawSparkline } from './sparkline';

const ICONS = {
  pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  orbit: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="4.5"/><circle cx="12" cy="12" r="1.8"/></svg>',
  fx: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  logo: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#062a3a"/><path d="M5 16c4-7 11-8 16-3l6-4v14l-6-4c-5 5-12 4-16-3z" fill="#5fe3d0"/><circle cx="10" cy="14" r="1.3" fill="#062a3a"/></svg>'
};

const SPEEDS = [1, 2, 4, 8];
// Vector3.Project wants a world matrix; positions are already world-space.
const WORLD_IDENTITY = Matrix.Identity();

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, className = '', html = '', parent?: HTMLElement
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  parent?.appendChild(node);
  return node;
}

type EntityKind = 'fish' | 'shark' | 'crab';

/** Glass HUD: ecosystem dashboard, control dock and creature inspector. */
export class UI {
  private root: HTMLElement;
  private refs: Record<string, HTMLElement> = {};
  private canvases: Record<string, HTMLCanvasElement> = {};
  private pauseBtn!: HTMLButtonElement;
  private speedBtns: HTMLButtonElement[] = [];
  private toggles: Record<string, HTMLButtonElement> = {};
  private dockClock!: HTMLElement;
  private timeSlider!: HTMLInputElement;
  private toastEl!: HTMLElement;
  private toastTimer = 0;
  private banner!: HTMLElement;
  private ringEl!: HTMLElement;
  private ringDot!: HTMLElement;

  private baseline: { speed: number; size: number; metabolism: number } | null = null;
  private selected: any = null;
  private selectedKind: EntityKind = 'fish';
  private following = false;
  private effects = true;
  private draggingTime = false;

  constructor(private sceneWrapper: Scene, private sim: Simulation) {
    this.root = document.getElementById('ui-root') as HTMLElement;
    this.build();
    this.bindInput();
    window.setInterval(() => this.refreshStats(), 250);
    window.setInterval(() => this.refreshInspector(), 100);
    sceneWrapper.scene.onBeforeRenderObservable.add(() => this.frame());
  }

  // ------------------------------------------------------------------ construction

  private build() {
    const r = this.root;

    const brand = el('div', 'brand glass', '', r);
    brand.innerHTML = `${ICONS.logo}<div><div class="brand-name">FISH EVO</div>
      <div class="brand-meta"><span><b data-ref="clock">10:00</b></span><span data-ref="phase">day</span><span data-ref="fps">-- fps</span></div></div>`;

    const eco = el('div', 'eco glass', '', r);
    eco.innerHTML = `
      <div class="block">
        <div class="section-title"><span>Ecosystem</span><span data-ref="elapsed">0:00</span></div>
        <div class="counts">
          <div class="count fish"><div class="n" data-ref="nFish">0</div><div class="l">Fish</div></div>
          <div class="count shark"><div class="n" data-ref="nShark">0</div><div class="l">Sharks</div></div>
          <div class="count crab"><div class="n" data-ref="nCrab">0</div><div class="l">Crabs</div></div>
          <div class="count food"><div class="n" data-ref="nFood">0</div><div class="l">Food</div></div>
        </div>
        <canvas class="spark" data-canvas="population" width="472" height="92"></canvas>
        <div class="row"><span class="k">Adults / juveniles</span><span class="v" data-ref="ageSplit">0 / 0</span></div>
        <div class="row"><span class="k">Generations</span><span class="v" data-ref="gen">0</span></div>
        <div class="row"><span class="k">Births</span><span class="v" data-ref="births">0</span></div>
        <div class="deaths">
          <span>starved<b data-ref="dStarve">0</b></span>
          <span>eaten<b data-ref="dEaten">0</b></span>
          <span>old age<b data-ref="dAge">0</b></span>
        </div>
      </div>
      <div class="block">
        <div class="section-title"><span>Evolution</span><span data-ref="swatchWrap"></span></div>
        <div class="row"><span class="k">Mean speed</span><span class="v"><span data-ref="vSpeed">-</span><span class="delta" data-ref="dSpeed"></span></span></div>
        <div class="row"><span class="k">Mean size</span><span class="v"><span data-ref="vSize">-</span><span class="delta" data-ref="dSize"></span></span></div>
        <div class="row"><span class="k">Mean metabolism</span><span class="v"><span data-ref="vMeta">-</span><span class="delta" data-ref="dMeta"></span></span></div>
        <canvas class="spark" data-canvas="traits" width="472" height="92"></canvas>
      </div>
      <div class="block">
        <div class="section-title"><span>Condition</span></div>
        <div class="row"><span class="k">Average hunger</span><span class="v" data-ref="vHunger">0%</span></div>
        <div class="bar hunger"><i data-ref="barHunger"></i></div>
        <div class="row" style="margin-top:9px"><span class="k">Average health</span><span class="v" data-ref="vHealth">0%</span></div>
        <div class="bar health"><i data-ref="barHealth"></i></div>
      </div>`;

    const hint = el('div', 'hint', '', r);
    hint.innerHTML = 'Drag to orbit &middot; scroll to zoom &middot; right-drag to pan<br>Click a creature to inspect &middot; <kbd>Space</kbd> pause &middot; <kbd>F</kbd> feed &middot; <kbd>H</kbd> hide UI';

    this.buildDock(r);
    this.buildInspector(r);

    this.ringEl = el('div', 'select-ring', '<i></i>', r);
    this.ringDot = this.ringEl.firstElementChild as HTMLElement;
    this.toastEl = el('div', 'toast glass', '', r);
    this.banner = el('div', 'banner glass', '<h2>THE SCHOOL HAS VANISHED</h2><p>Every fish is gone. Add a school to begin again.</p>', r);

    r.querySelectorAll<HTMLElement>('[data-ref]').forEach((n) => { this.refs[n.dataset.ref!] = n; });
    r.querySelectorAll<HTMLCanvasElement>('[data-canvas]').forEach((n) => { this.canvases[n.dataset.canvas!] = n; });
  }

  private button(label: string, icon: string, title: string, parent: HTMLElement, onClick: () => void, cls = '') {
    const b = el('button', `btn ${cls}`.trim(), `${icon}${label ? `<span>${label}</span>` : ''}`, parent);
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', onClick);
    return b;
  }

  private buildDock(r: HTMLElement) {
    const dock = el('div', 'dock glass', '', r);

    this.pauseBtn = this.button('', ICONS.pause, 'Pause (Space)', dock, () => this.togglePause(), 'icon');

    const speed = el('div', 'speed', '', dock);
    SPEEDS.forEach((s) => {
      const b = this.button(`${s}x`, '', `${s}x speed`, speed, () => this.setSpeed(s));
      if (s === 1) b.classList.add('on');
      this.speedBtns.push(b);
    });

    el('div', 'sep', '', dock);

    const time = el('div', 'timebox', '', dock);
    this.dockClock = el('span', 'clock', '10:00', time);
    this.timeSlider = el('input', '', '', time);
    this.timeSlider.type = 'range';
    this.timeSlider.min = '0';
    this.timeSlider.max = '24';
    this.timeSlider.step = '0.05';
    this.timeSlider.value = '10';
    this.timeSlider.setAttribute('aria-label', 'Time of day');
    this.timeSlider.addEventListener('pointerdown', () => { this.draggingTime = true; });
    window.addEventListener('pointerup', () => { this.draggingTime = false; });
    this.timeSlider.addEventListener('input', () => this.sceneWrapper.dayNight.setHour(parseFloat(this.timeSlider.value)));
    this.toggles.cycle = this.button('Cycle', '', 'Let time of day flow', time, () => this.toggleCycle(), 'on');

    el('div', 'sep', '', dock);

    this.button('Feed', '', 'Drop food (F)', dock, () => this.feed(), 'warm');
    this.button('+ School', '', 'Add a school of fish', dock, () => {
      this.sim.spawnSchool(6);
      this.toast('A new school arrives');
    });
    this.button('+ Shark', '', 'Add a shark', dock, () => {
      this.sim.spawnShark();
      this.toast('A shark enters the reef');
    });

    el('div', 'sep', '', dock);

    this.toggles.orbit = this.button('', ICONS.orbit, 'Slow auto-orbit', dock, () => this.toggleOrbit(), 'icon on');
    this.toggles.fx = this.button('', ICONS.fx, 'Visual effects (bloom, particles)', dock, () => this.toggleFx(), 'icon on');
    this.button('', ICONS.camera, 'Save a screenshot', dock, () => this.screenshot(), 'icon');
    this.button('', ICONS.reset, 'Restart the ecosystem', dock, () => this.restart(), 'icon');
    this.button('', ICONS.eye, 'Hide interface (H)', dock, () => this.toggleHidden(), 'icon');
  }

  private buildInspector(r: HTMLElement) {
    const insp = el('div', 'inspector glass', '', r);
    insp.innerHTML = `
      <div class="insp-head">
        <div class="dot" data-ref="iDot"></div>
        <div><div class="insp-title" data-ref="iTitle">Fish</div><div class="insp-sub" data-ref="iSub"></div></div>
        <button type="button" class="btn icon insp-close" data-ref="iClose" aria-label="Close inspector">${ICONS.close}</button>
      </div>
      <div class="chips" data-ref="iChips"></div>
      <div class="row"><span class="k">Health</span><span class="v" data-ref="iHealthV"></span></div>
      <div class="bar health"><i data-ref="iHealth"></i></div>
      <div data-ref="iHungerBlock">
        <div class="row" style="margin-top:9px"><span class="k">Hunger</span><span class="v" data-ref="iHungerV"></span></div>
        <div class="bar hunger"><i data-ref="iHunger"></i></div>
      </div>
      <div class="row" style="margin-top:9px"><span class="k">Age</span><span class="v" data-ref="iAgeV"></span></div>
      <div class="bar"><i data-ref="iAge"></i></div>
      <div data-ref="iGenes" style="margin-top:14px">
        <div class="section-title"><span>Genes</span></div>
        <div class="row"><span class="k">Colour</span><span class="v" data-ref="iColor"></span></div>
        <div class="row"><span class="k">Size</span><span class="v" data-ref="iSize"></span></div>
        <div class="row"><span class="k">Top speed</span><span class="v" data-ref="iSpeed"></span></div>
        <div class="row"><span class="k">Metabolism</span><span class="v" data-ref="iMeta"></span></div>
        <div class="row"><span class="k">Generation</span><span class="v" data-ref="iGen"></span></div>
      </div>
      <div class="insp-actions">
        <button type="button" class="btn" data-ref="iFollow">Follow</button>
        <button type="button" class="btn" data-ref="iFocus">Focus</button>
      </div>`;
    this.refs.inspector = insp;
    insp.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('button');
      if (!target) return;
      const ref = target.dataset.ref;
      if (ref === 'iClose') this.deselect();
      else if (ref === 'iFollow') this.toggleFollow();
      else if (ref === 'iFocus') this.focus();
    });
  }

  // ------------------------------------------------------------------ input

  private bindInput() {
    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); this.togglePause(); break;
        case 'f': this.feed(); break;
        case 'h': this.toggleHidden(); break;
        case 'escape': this.deselect(); break;
        case '1': case '2': case '3': case '4': this.setSpeed(SPEEDS[parseInt(e.key, 10) - 1]); break;
      }
    });

    this.sceneWrapper.scene.onPointerObservable.add((info) => {
      if (info.type !== PointerEventTypes.POINTERTAP) return;
      const s = this.sceneWrapper.scene;
      const hit = this.pickCreature(s.pointerX, s.pointerY);
      if (hit) this.select(hit.entity, hit.kind);
      else this.deselect();
    });
  }

  /** World position to CSS pixels on the canvas (null when behind the camera). */
  private project(pos: Vector3): { x: number; y: number; distance: number; focal: number } | null {
    const scene = this.sceneWrapper.scene;
    const engine = scene.getEngine();
    const cam = scene.activeCamera;
    const rect = engine.getRenderingCanvasClientRect();
    if (!cam || !rect) return null;
    const viewport = cam.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    const p = Vector3.Project(pos, WORLD_IDENTITY, scene.getTransformMatrix(), viewport);
    if (p.z < 0 || p.z > 1) return null;
    const ratio = engine.getRenderWidth() / rect.width;
    const focal = engine.getRenderHeight() / ratio / 2 / Math.tan(((cam as any).fov ?? 0.9) / 2);
    return { x: p.x / ratio, y: p.y / ratio, distance: Math.max(1, Vector3.Distance(cam.position, pos)), focal };
  }

  /** Nearest creature to the cursor in screen space; forgiving for tiny, distant fish. */
  private pickCreature(px: number, py: number): { entity: any; kind: EntityKind } | null {
    let best: any = null;
    let bestDist = Infinity;
    for (const mesh of this.sceneWrapper.scene.meshes as any[]) {
      const entity = mesh.entity;
      if (!entity || !entity.alive || !mesh.isEnabled()) continue;
      const p = this.project(mesh.position);
      if (!p) continue;
      const dist = Math.hypot(p.x - px, p.y - py);
      const apparent = (mesh.scaling.x * 2.2 * p.focal) / p.distance;
      if (dist < Math.max(24, apparent * 0.7) && dist < bestDist) { bestDist = dist; best = entity; }
    }
    if (!best) return null;
    const kind: EntityKind = best.hasComponent(SharkTag) ? 'shark' : best.hasComponent(CrabTag) ? 'crab' : 'fish';
    return { entity: best, kind };
  }

  // ------------------------------------------------------------------ actions

  private togglePause() {
    this.sim.paused = !this.sim.paused;
    this.pauseBtn.innerHTML = this.sim.paused ? ICONS.play : ICONS.pause;
    this.pauseBtn.classList.toggle('on', this.sim.paused);
    this.toast(this.sim.paused ? 'Paused' : 'Resumed');
  }

  private setSpeed(speed: number) {
    this.sim.timeScale = speed;
    this.speedBtns.forEach((b, i) => b.classList.toggle('on', SPEEDS[i] === speed));
  }

  private toggleCycle() {
    const dn = this.sceneWrapper.dayNight;
    dn.paused = !dn.paused;
    this.toggles.cycle.classList.toggle('on', !dn.paused);
  }

  private feed() {
    const t = this.sceneWrapper.camera.camera.target;
    this.sim.dropFood(8, { x: t.x, z: t.z });
    this.toast('Food drifts down');
  }

  private toggleOrbit() {
    const cam = this.sceneWrapper.camera;
    cam.setAutoOrbit(!cam.autoOrbit);
    this.toggles.orbit.classList.toggle('on', cam.autoOrbit);
  }

  private toggleFx() {
    this.effects = !this.effects;
    this.sceneWrapper.setEffectsEnabled(this.effects);
    this.toggles.fx.classList.toggle('on', this.effects);
    this.toast(this.effects ? 'Effects on' : 'Effects off (lighter on the GPU)');
  }

  private toggleHidden() {
    this.root.classList.toggle('hidden');
  }

  private restart() {
    this.deselect();
    this.baseline = null;
    this.sim.reset();
    this.toast('Ecosystem restarted');
  }

  private screenshot() {
    const canvas = this.sceneWrapper.canvas;
    const wasHidden = this.root.classList.contains('hidden');
    this.root.classList.add('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (!wasHidden) this.root.classList.remove('hidden');
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `fish-evo-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        this.toast('Screenshot saved');
      });
    }));
  }

  private toast(message: string) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove('show'), 1800);
  }

  // ------------------------------------------------------------------ selection

  private select(entity: any, kind: EntityKind) {
    this.selected = entity;
    this.selectedKind = kind;
    this.following = false;
    this.refs.iFollow.classList.remove('on');
    this.refs.iFollow.textContent = 'Follow';
    this.refs.inspector.classList.add('open');
    this.refs.iGenes.style.display = kind === 'crab' ? 'none' : '';
    this.refs.iHungerBlock.style.display = kind === 'fish' ? '' : 'none';
    this.refreshInspector();
  }

  private deselect() {
    this.selected = null;
    this.following = false;
    this.refs.inspector.classList.remove('open');
    this.ringEl.style.display = 'none';
  }

  private toggleFollow() {
    this.following = !this.following;
    this.refs.iFollow.classList.toggle('on', this.following);
    this.refs.iFollow.textContent = this.following ? 'Following' : 'Follow';
    if (this.following) {
      const cam = this.sceneWrapper.camera.camera;
      cam.radius = Math.min(cam.radius, 22);
    }
  }

  private focus() {
    if (!this.selected?.alive) return;
    const p = this.selected.getComponent(Position);
    const cam = this.sceneWrapper.camera.camera;
    cam.setTarget(new Vector3(p.x, p.y, p.z));
    cam.radius = Math.min(cam.radius, 16);
  }

  // ------------------------------------------------------------------ per-frame / periodic

  private frame() {
    const dn = this.sceneWrapper.dayNight;
    if (!this.draggingTime) this.timeSlider.value = String(dn.hour);
    this.dockClock.textContent = dn.formatClock();
    this.refs.clock.textContent = dn.formatClock();

    const entity = this.selected;
    if (!entity) return;
    if (!entity.alive) { this.deselect(); return; }

    const p = entity.getComponent(Position);
    const screen = this.project(new Vector3(p.x, p.y, p.z));
    if (screen) {
      const genes = entity.getComponent(Genetics);
      const length = this.selectedKind === 'shark' ? 8 : this.selectedKind === 'crab' ? 1.8 : 2.4;
      const size = Math.min(260, Math.max(34, ((genes?.size ?? 1) * length * screen.focal) / screen.distance));
      this.ringEl.style.display = 'block';
      this.ringEl.style.transform = `translate(${screen.x}px, ${screen.y}px)`;
      this.ringDot.style.width = this.ringDot.style.height = `${size}px`;
    } else {
      this.ringEl.style.display = 'none';
    }

    if (this.following) {
      const cam = this.sceneWrapper.camera.camera;
      cam.setTarget(Vector3.Lerp(cam.target, new Vector3(p.x, p.y, p.z), 0.08));
    }
  }

  private refreshStats() {
    const r = this.refs;
    const fmt = (v: number, d = 2) => v.toFixed(d);
    const phase = this.sceneWrapper.dayNight.daylight;
    r.phase.textContent = phase > 0.6 ? 'day' : phase > 0.2 ? 'dusk' : 'night';
    r.fps.textContent = `${Math.round(this.sceneWrapper.engine.getFps())} fps`;

    const total = Math.floor(this.sim.time / 1000);
    r.elapsed.textContent = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    r.nFish.textContent = String(stats.fish);
    r.nShark.textContent = String(stats.sharks);
    r.nCrab.textContent = String(stats.crabs);
    r.nFood.textContent = String(stats.food);
    r.ageSplit.textContent = `${stats.adults} / ${stats.juveniles}`;
    r.gen.textContent = String(stats.maxGeneration);
    r.births.textContent = String(stats.births);
    r.dStarve.textContent = String(stats.deaths.starvation);
    r.dEaten.textContent = String(stats.deaths.predator);
    r.dAge.textContent = String(stats.deaths.age);

    if (stats.fish > 0) {
      if (!this.baseline) {
        this.baseline = { speed: stats.avgSpeed, size: stats.avgSize, metabolism: stats.avgMetabolism };
      }
      r.vSpeed.textContent = fmt(stats.avgSpeed);
      r.vSize.textContent = fmt(stats.avgSize);
      r.vMeta.textContent = fmt(stats.avgMetabolism);
      this.setDelta(r.dSpeed, stats.avgSpeed, this.baseline.speed);
      this.setDelta(r.dSize, stats.avgSize, this.baseline.size);
      this.setDelta(r.dMeta, stats.avgMetabolism, this.baseline.metabolism);
      const [cr, cg, cb] = stats.avgColor;
      r.swatchWrap.innerHTML = `<span class="swatch" style="background:rgb(${cr},${cg},${cb})"></span>mean colour`;
    }
    r.vHunger.textContent = `${Math.round(stats.avgHunger * 100)}%`;
    r.barHunger.style.width = `${Math.round(stats.avgHunger * 100)}%`;
    r.vHealth.textContent = `${Math.round(stats.avgHealth * 100)}%`;
    r.barHealth.style.width = `${Math.round(stats.avgHealth * 100)}%`;

    const h = stats.history;
    drawSparkline(this.canvases.population, [{ data: h.fish, color: '#5fe3d0', fill: true }], { zeroBased: true });
    drawSparkline(this.canvases.traits, [
      { data: relativeChange(h.speed), color: '#9fb4ff' },
      { data: relativeChange(h.size), color: '#ffb454' }
    ], { legend: [['speed', '#9fb4ff'], ['size', '#ffb454']] });

    this.banner.classList.toggle('show', stats.fish === 0 && this.sim.time > 5000);
  }

  private setDelta(node: HTMLElement, value: number, base: number) {
    const pct = base > 0 ? ((value - base) / base) * 100 : 0;
    if (Math.abs(pct) < 0.5) { node.textContent = ''; node.className = 'delta'; return; }
    node.textContent = `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}%`;
    node.className = `delta ${pct > 0 ? 'up' : 'down'}`;
  }

  private refreshInspector() {
    const e = this.selected;
    if (!e) return;
    if (!e.alive) { this.deselect(); return; }
    const r = this.refs;
    const kind = this.selectedKind;
    const genes = e.getComponent(Genetics);
    const health = e.getComponent(Health);
    const age = e.getComponent(Age);
    const hunger = e.getComponent(Hunger);
    const behavior = e.getComponent(Behavior);
    const vel = e.getComponent(Velocity);
    const pred = e.getComponent(PredatorState);

    const name = kind === 'shark' ? 'Shark' : kind === 'crab' ? 'Crab' : 'Fish';
    r.iTitle.textContent = `${name} #${e.id}`;
    const color: number[] = genes?.color ?? (kind === 'crab' ? [200, 80, 60] : [120, 140, 170]);
    r.iDot.style.background = `rgb(${color[0]},${color[1]},${color[2]})`;
    r.iSub.textContent = age
      ? `${age.isAdult ? 'Adult' : 'Juvenile'} · ${Math.floor(age.value)}s old${genes && kind === 'fish' ? ` · gen ${genes.generation}` : ''}`
      : '';

    const chips: string[] = [];
    if (health?.isDead) {
      chips.push('<span class="chip alert">dying</span>');
    } else if (kind === 'fish') {
      if (behavior?.isFleeing) chips.push('<span class="chip alert">fleeing</span>');
      else if (behavior?.isHungry) chips.push('<span class="chip hot">hungry</span>');
      else chips.push('<span class="chip good">content</span>');
      if (age?.isAdult && hunger && hunger.value <= 0.3) chips.push('<span class="chip good">ready to breed</span>');
    } else if (kind === 'shark') {
      const sated = pred && this.sim.time < pred.satiatedUntil;
      chips.push(sated ? '<span class="chip good">satiated</span>'
        : pred?.isChasing ? '<span class="chip alert">chasing</span>' : '<span class="chip hot">hunting</span>');
    } else {
      chips.push(`<span class="chip">${behavior?.isResting ? 'resting' : 'scuttling'}</span>`);
    }
    if (vel) chips.push(`<span class="chip">${Math.hypot(vel.x, vel.y, vel.z).toFixed(1)} m/s</span>`);
    r.iChips.innerHTML = chips.join('');

    const hp = health ? health.current / health.max : 1;
    r.iHealthV.textContent = `${Math.round(hp * 100)}%`;
    r.iHealth.style.width = `${Math.round(hp * 100)}%`;
    if (hunger) {
      r.iHungerV.textContent = `${Math.round(hunger.value * 100)}%`;
      r.iHunger.style.width = `${Math.round(hunger.value * 100)}%`;
    }
    if (age) {
      r.iAgeV.textContent = `${Math.floor(age.value)} / ${age.maxAge}s`;
      r.iAge.style.width = `${Math.round(Math.min(1, age.value / age.maxAge) * 100)}%`;
    }
    if (genes) {
      r.iColor.innerHTML = `<span class="swatch" style="background:rgb(${color[0]},${color[1]},${color[2]})"></span>${color.join(', ')}`;
      r.iSize.textContent = genes.size.toFixed(2);
      r.iSpeed.textContent = genes.speed.toFixed(2);
      r.iMeta.textContent = genes.metabolism.toFixed(2);
      r.iGen.textContent = String(genes.generation);
    }
  }
}

/** Plots each trait as relative change from its starting value, clamped to +/-40%. */
function relativeChange(series: number[]): number[] {
  if (series.length === 0) return series;
  const first = series[0] || 1;
  return series.map((v) => Math.max(-0.4, Math.min(0.4, (v - first) / first)));
}
