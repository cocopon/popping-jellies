/*! Popping Jelly (c) 2016 cocopon, licensed under the CC-BY-NC-SA 4.0. */
const JELLY_COUNT = 100;
const GROUP_COUNT = 3;
const AREA_SIZE = 400;
const MARGIN = 10;
const PARAMS = {
	dt: 0.0004,
	friction: {min: 0.85, max: 0.9},
	maxRadius: 1000,
	transfer: {min: 0, max: 0.8},
};

const jellies = [];
const env = {
	friction: 0,
	t: 0,
	transfer: 0,
};

class Jelly {
	constructor(x, y, group) {
		this.group = group;
		this.f = createVector();
		this.pos = createVector(x, y);
		this.vel = createVector();
		this.energy = 0;
	}

	update() {
		// a = f / m
		const acc = this.f;
		// v = v0 + a * t
		this.vel.add(acc);
		// x = x0 + v * t
		this.pos.add(this.vel);

		if (this.pos.x < -MARGIN) {
			this.pos.x += AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.x > AREA_SIZE + MARGIN) {
			this.pos.x -= AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.y < -MARGIN) {
			this.pos.y += AREA_SIZE + MARGIN * 2;
		}
		if (this.pos.y > AREA_SIZE + MARGIN) {
			this.pos.y -= AREA_SIZE + MARGIN * 2;
		}
	}

	draw() {
		fill(
			map(this.group, 0, GROUP_COUNT - 1, 1, 140),
			255,
			255
		);
		const sz = map(this.energy, 0, 1, 0, PARAMS.maxRadius);
		circle(this.pos.x, this.pos.y, sz / 2);
	}
}

function computeJellyForce(p1, p2, range, maxForce) {
	const n12 = p5.Vector.sub(p1, p2);
	const oldMag = n12.mag();
	n12.setMag(pow(0.5, oldMag / range) * maxForce);
	return n12;
}

function updateEnv() {
	env.t = pow(sin((frameCount * PARAMS.dt) * TWO_PI), 4);
	env.friction = map(
		env.t,
		0, 1,
		PARAMS.friction.min, PARAMS.friction.max,
	);
	env.transfer = map(
		env.t,
		0, 1,
		PARAMS.transfer.min, PARAMS.transfer.max,
	);
}

function initDebug() {
	const pane = new Tweakpane.Pane({
		title: 'Parameters',
	});
	pane.registerPlugin(TweakpaneEssentialsPlugin);

	pane.addInput(PARAMS, 'dt', {min: 0, max: 0.002});
	pane.addMonitor(env, 't', {view: 'graph', lineCount: 1, min: 0, max: +1});
	pane.addSeparator();
	pane.addInput(PARAMS, 'maxRadius', {min: 0, max: 2000, label: 'radius'});
	pane.addInput(PARAMS, 'friction', {min: 0.8, max: 1});
	pane.addInput(PARAMS, 'transfer', {min: 0, max: 1});
}

function setup() {
	const w = windowWidth;
	createCanvas(w, w);
	colorMode(HSB, 360, 255, 255);

	for (let i = 0; i < JELLY_COUNT; i++) {
		jellies.push(new Jelly(
			random(AREA_SIZE),
			random(AREA_SIZE),
			floor(random(GROUP_COUNT)),
		));
	}

	if (location.search.match('debug')) {
		initDebug();
	}
}

function draw() {
	blendMode(BLEND);
	background(0, 0, 0x22);
	blendMode(ADD);

	push();
	const zoom = max(1, width / AREA_SIZE, height / AREA_SIZE);
	scale(zoom);

	updateEnv();

	if (random() < env.transfer) {
		const jelly = jellies[floor(random(JELLY_COUNT))];
		if (jelly.energy > 0.02) {
			jelly.group = floor(random(GROUP_COUNT));
		}
	}

	const mp = createVector(mouseX / zoom, mouseY / zoom);
	jellies.forEach((j1) => {
		jellies.forEach((j2) => {
			const f12 = computeJellyForce(
				j1.pos, j2.pos,
				10,
				j1.group === j2.group ? -1 : +1,
			);
			j1.f.add(f12);
			f12.mult(-1);
			j2.f.add(f12);
		});

		if (mouseIsPressed) {
			const fm = computeJellyForce(j1.pos, mp, 5, 5);
			j1.f.add(fm);
		}
	});

	jellies.forEach((jelly) => {
		jelly.vel.mult(env.friction);
		jelly.update(env);
	});

	jellies.forEach((j1) => {
		j1.energy = 0;
		jellies.forEach((j2) => {
			const d = j1.pos.dist(j2.pos);
			j1.energy += pow(0.5, d * 0.1);
		});
		j1.energy /= JELLY_COUNT;

		j1.draw();
		j1.f.set(0, 0);
	});

	pop();
}
