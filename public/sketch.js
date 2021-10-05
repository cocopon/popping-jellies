function fromRgb(r, g, b) {
	return (r << 16) | (g << 8) | b;
}

function fromHsb(h, s, b) {
	const hi = Math.floor(h / 255 * 6) % 6;
	const f = (h / 255 * 6) - Math.floor(h / 255 * 6);
	const p = Math.round(b * (1 - (s / 255)));
	const q = Math.round(b * (1 - (s / 255) * f));
	const t = Math.round(b * (1 - (s / 255) * (1 - f)));
	return fromRgb(...[
		[b, t, p],
		[q, b, p],
		[p, b, t],
		[p, q, b],
		[t, p, b],
		[b, p, q],
	][hi]);
}

function getPixelRatio() {
	return window.devicePixelRatio || 1;
}

class PixiSketch {
	constructor(canvasElement) {
		this.width = 100;
		this.height = 100;
		this.scale_ = 1.0;

		const resolution = Math.min(getPixelRatio(), 2);
		this.renderer_ = PIXI.autoDetectRenderer(
			this.width,
			this.height,
			{
				antialias: true,
				backgroundColor: 0x222222,
				resolution: resolution,
				view: canvasElement
			}
		);
		this.renderer_.view.style.transform = `scale(${1 / resolution}, ${1 / resolution})`;

		this.stage_ = new PIXI.Container();

		window.onresize = () => {
			this.applyWindowSize_();
		};
		this.applyWindowSize_();

		document.addEventListener('DOMContentLoaded', () => {
			this.setup();
			this.loop_();
		});
	}

	getStage() {
		return this.stage_;
	}

	getScale(scale) {
		this.scale_ = scale;
	}

	setScale(scale) {
		this.scale_ = scale;
		this.stage_.scale.x = this.scale_;
		this.stage_.scale.y = this.scale_;
	}

	setup() {}
	update() {}

	loop_() {
		this.update();

		this.renderer_.render(this.stage_);
		requestAnimationFrame(() => {
			this.loop_();
		});
	}

	applyWindowSize_() {
		const elem = this.renderer_.view;
		const parentElem = elem.parentElement;

		this.width = parentElem.clientWidth;
		this.height = parentElem.clientHeight;

		this.renderer_.resize(
			this.width,
			this.height
		);

		elem.style.opacity = '0';
		elem.style.transition = 'all 0s ease';
		if (this.timer_ !== undefined) {
			clearTimeout(this.timer_);
		}
		this.timer_ = setTimeout(() => {
			elem.style.opacity = '1';
			elem.style.transition = 'opacity 1.0s ease-out';
		}, this.constructor.SHOWING_DELAY);
	}
}

PixiSketch.SHOWING_DELAY = 1000;

class Vector {
	static isVector(v) {
		return v.x !== undefined &&
			v.y !== undefined;
	}

	static add(v1, v2) {
		if (this.isVector(v2)) {
			v1.x += v2.x;
			v1.y += v2.y;
		}
		else {
			v1.x += v2;
			v1.y += v2;
		}
	}

	static sub(v1, v2) {
		if (this.isVector(v2)) {
			v1.x -= v2.x;
			v1.y -= v2.y;
		}
		else {
			v1.x -= v2;
			v1.y -= v2;
		}
	}

	static mult(v1, v2) {
		if (this.isVector(v2)) {
			v1.x *= v2.x;
			v1.y *= v2.y;
		}
		else {
			v1.x *= v2;
			v1.y *= v2;
		}
	}

	static div(v1, v2) {
		if (this.isVector(v2)) {
			v1.x /= v2.x;
			v1.y /= v2.y;
		}
		else {
			v1.x /= v2;
			v1.y /= v2;
		}
	}

	static mag(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y);
	}

	static dist(v1, v2) {
		const dx = v1.x - v2.x;
		const dy = v1.y - v2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	static heading(v) {
		return Math.atan2(v.y, v.x);
	}
}

const AGENT_COUNT = 100;
const GROUP_COUNT = 3;
const AREA_WIDTH = 800;
const AREA_HEIGHT = 600;
const NOISE_SCALE = 0.0100;
const TRANSITION_SPEED = 0.005;
let AGENT_POWER = 0.05;
let FRICTION = 0.9;
const RANDOMNESS = 2.0;
const MARGIN = 10;
let SWITCH_RATIO = 0.6;
const MIN_RADIUS = 0;
const MAX_RADIUS = 1000;
const MAX_FORCE = 1.0;

const sketch = new PixiSketch(document.getElementById('sketch'));

class Agent {
	constructor(group, x, y) {
		this.group = group;
		this.f = new PIXI.Point();
		this.pos = new PIXI.Point(x, y);
		this.vel = new PIXI.Point();
		this.energy_ = 0;
	}

	reset() {
		this.f.x = this.f.y = 0;
	}

	update() {
		const r = p5.prototype.noise(this.pos.x * NOISE_SCALE, this.pos.y * NOISE_SCALE, sketch.noiseZ_);
		const angle = p5.prototype.map(r, 0, 1, -1, +1) * 2 * Math.PI;
		this.vel.x += Math.cos(angle) * AGENT_POWER;
		this.vel.y += Math.sin(angle) * AGENT_POWER;

		const rr = Math.random() * 2 * Math.PI;
		this.vel.x += Math.cos(rr) * AGENT_POWER * RANDOMNESS;
		this.vel.y += Math.sin(rr) * AGENT_POWER * RANDOMNESS;

		Vector.mult(this.vel, FRICTION);

		// a = f / m
		const acc = this.f;

		// v = v0 + a * t
		Vector.add(this.vel, acc);

		// x = x0 + v * t
		Vector.add(this.pos, this.vel);

		if (this.pos.x < -MARGIN) {
			this.pos.x += AREA_WIDTH + MARGIN * 2;
		}
		if (this.pos.x >= AREA_WIDTH + MARGIN) {
			this.pos.x -= AREA_WIDTH + MARGIN * 2;
		}
		if (this.pos.y < -MARGIN) {
			this.pos.y += AREA_HEIGHT + MARGIN * 2;
		}
		if (this.pos.y >= AREA_HEIGHT + MARGIN) {
			this.pos.y -= AREA_HEIGHT + MARGIN * 2;
		}
	}

	draw(g) {
		this.energy_ = 0;
		sketch.agents_.forEach((a) => {
			const d = Vector.dist(this.pos, a.pos);
			this.energy_ += Math.pow(0.5, d * 0.1);
		});
		this.energy_ /= AGENT_COUNT;

		const col = fromHsb(
			p5.prototype.map(this.group, 0, GROUP_COUNT, 5, 140),
			255,
			255
		);
		g.beginFill(col);
		const sz = p5.prototype.map(this.energy_, 0, 1, MIN_RADIUS, MAX_RADIUS);
		g.drawCircle(this.pos.x, this.pos.y, sz / 2);
		g.endFill();
	}
}

sketch.setup = () => {
	sketch.noiseZ_ = 0;
	sketch.t_ = 0;

	const g = new PIXI.Graphics();
	g.blendMode = PIXI.BLEND_MODES.ADD;
	sketch.getStage().addChild(g);
	sketch.g = g;

	sketch.agents_ = [];

	for (let i = 0; i < AGENT_COUNT; i++) {
		let agent = new Agent(
			Math.floor(Math.random() * GROUP_COUNT),
			Math.random() * AREA_WIDTH,
			Math.random() * AREA_HEIGHT);
			sketch.agents_.push(agent);
	}
};

sketch.update = () => {
	sketch.setScale(Math.max(
		1,
		sketch.width / AREA_WIDTH,
		sketch.height / AREA_HEIGHT
	));

	sketch.t_ = (sketch.t_ + 0.001) % 1;
	const t = -Math.cos(sketch.t_ * 2 * Math.PI);
	FRICTION = p5.prototype.map(t, -1, +1, 0.9, 0.95);
	AGENT_POWER = p5.prototype.map(t, -1, +1, 0.05, 0.08);
	SWITCH_RATIO = p5.prototype.map(t, -1, +1, 0.5, 0.8);

	const g = sketch.g;
	g.clear();

	if (Math.random() < SWITCH_RATIO) {
		const index = Math.floor(Math.random() * AGENT_COUNT);
		const agent = sketch.agents_[index];
		if (agent.energy_ > 0.02) {
			agent.group = Math.floor(Math.random() * GROUP_COUNT);
		}
	}

	sketch.noiseZ_ += TRANSITION_SPEED;

	sketch.agents_.forEach((a) => {
		a.reset();
	});

	for (let j = 0; j < AGENT_COUNT; j++) {
		for (let i = j + 1; i < AGENT_COUNT; i++) {
			const ai = sketch.agents_[i];
			const aj = sketch.agents_[j];
			const dij = new PIXI.Point();
			dij.x = ai.pos.x - aj.pos.x;
			dij.y = ai.pos.y - aj.pos.y;

			const oldMag = Vector.mag(dij);
			const angle = Vector.heading(dij);
			const nextMag = Math.pow(0.5, oldMag * 1e-1) * MAX_FORCE;
			dij.x = Math.cos(angle) * nextMag;
			dij.y = Math.sin(angle) * nextMag;
			if (ai.group == aj.group) {
				Vector.mult(dij, -1);
			}

			Vector.add(ai.f, dij);

			Vector.mult(dij, -1);
			Vector.add(aj.f, dij);
		}
	}

	sketch.agents_.forEach((a) => {
		a.update();
	});

	sketch.agents_.forEach((a) => {
		a.draw(g);
	});
};
