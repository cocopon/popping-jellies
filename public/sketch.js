const AGENT_COUNT = 100;
const GROUP_COUNT = 3;
const AREA_SIZE = 500;
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

class Agent {
	constructor(group, x, y) {
		this.group = group;
		this.f = new p5.Vector();
		this.pos = new p5.Vector(x, y);
		this.vel = new p5.Vector();
		this.energy_ = 0;
	}

	reset() {
		this.f.set(0, 0);
	}

	update() {
		const r = noise(this.pos.x * NOISE_SCALE, this.pos.y * NOISE_SCALE, noiseZ_);
		const angle = map(r, 0, 1, -1, +1) * 2 * Math.PI;
		this.vel.x += Math.cos(angle) * AGENT_POWER;
		this.vel.y += Math.sin(angle) * AGENT_POWER;

		const rr = Math.random() * 2 * Math.PI;
		this.vel.x += Math.cos(rr) * AGENT_POWER * RANDOMNESS;
		this.vel.y += Math.sin(rr) * AGENT_POWER * RANDOMNESS;

		this.vel.mult(FRICTION);

		// a = f / m
		const acc = this.f;

		// v = v0 + a * t
		this.vel.add(acc);

		// x = x0 + v * t
		this.pos.add(this.vel);

		if (this.pos.x < -MARGIN) {
			this.pos.x += AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.x >= AREA_SIZE + MARGIN) {
			this.pos.x -= AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.y < -MARGIN) {
			this.pos.y += AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.y >= AREA_SIZE + MARGIN) {
			this.pos.y -= AREA_SIZE + MARGIN * 2;
		}
	}

	draw() {
		this.energy_ = 0;
		agents_.forEach((a) => {
			const d = this.pos.dist(a.pos);
			this.energy_ += Math.pow(0.5, d * 0.1);
		});
		this.energy_ /= AGENT_COUNT;

		fill(
			map(this.group, 0, GROUP_COUNT, 5, 140),
			100,
			100
		);
		const sz = map(this.energy_, 0, 1, MIN_RADIUS, MAX_RADIUS);
		circle(this.pos.x, this.pos.y, sz / 2);
	}
}

const agents_ = [];
let noiseZ_ = 0;
let t_ = 0;

function setup() {
	const w = windowWidth;
	createCanvas(w, w);
	colorMode(HSB, 360, 100, 100);

	for (let i = 0; i < AGENT_COUNT; i++) {
		let agent = new Agent(
			Math.floor(Math.random() * GROUP_COUNT),
			Math.random() * AREA_SIZE,
			Math.random() * AREA_SIZE);
			agents_.push(agent);
	}
}

function draw() {
	blendMode(BLEND);
	background(0, 0, 13.3);
	blendMode(ADD);

	push();
	scale(Math.max(
		1,
		width / AREA_SIZE,
		height / AREA_SIZE
	));

	t_ = (t_ + 0.001) % 1;
	const t = -Math.cos(t_ * 2 * Math.PI);
	FRICTION = map(t, -1, +1, 0.9, 0.95);
	AGENT_POWER = map(t, -1, +1, 0.05, 0.08);
	SWITCH_RATIO = map(t, -1, +1, 0.5, 0.8);

	if (Math.random() < SWITCH_RATIO) {
		const index = Math.floor(Math.random() * AGENT_COUNT);
		const agent = agents_[index];
		if (agent.energy_ > 0.02) {
			agent.group = Math.floor(Math.random() * GROUP_COUNT);
		}
	}

	noiseZ_ += TRANSITION_SPEED;

	agents_.forEach((a) => {
		a.reset();
	});

	for (let j = 0; j < AGENT_COUNT; j++) {
		for (let i = j + 1; i < AGENT_COUNT; i++) {
			const ai = agents_[i];
			const aj = agents_[j];
			const dij = new p5.Vector();
			dij.x = ai.pos.x - aj.pos.x;
			dij.y = ai.pos.y - aj.pos.y;

			const oldMag = dij.mag();
			const angle = dij.heading();
			const nextMag = Math.pow(0.5, oldMag * 1e-1) * MAX_FORCE;
			dij.x = Math.cos(angle) * nextMag;
			dij.y = Math.sin(angle) * nextMag;
			if (ai.group === aj.group) {
				dij.mult(-1);
			}

			ai.f.add(dij);
			dij.mult(-1);
			aj.f.add(dij);
		}
	}

	agents_.forEach((a) => {
		a.update();
	});

	agents_.forEach((a) => {
		a.draw();
	});

	pop();
}