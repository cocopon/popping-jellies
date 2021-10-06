/*! Popping Jellies (c) 2016 cocopon, licensed under the CC-BY-NC-SA 4.0. */
const JELLY_COUNT = 100;
const GROUP_COUNT = 3;
const AREA_SIZE = 400;
const MARGIN = 10;
const PARAMS = {
	bg: '#222',
	blend: p5.prototype.ADD,
	dt: 0.0004,
	force: 0.5,
	friction: {min: 0.8, max: 0.9},
	hue: {min: 1, max: 140},
	maxRadius: 1000,
	range: 10,
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
		this.colorGroup_ = group;
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
		this.colorGroup_ += (this.group - this.colorGroup_) * 0.1;
		fill(
			map(this.colorGroup_, 0, GROUP_COUNT - 1, PARAMS.hue.min, PARAMS.hue.max),
			255,
			255,
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
	pane.addButton({label: 'canvas', title: 'Save'}).on('click', () => {
		saveCanvas('snapshot', 'png');
	});

	const tab = pane.addTab({
		pages: [{title: 'Behavior'}, {title: 'Appearance'}],
	});

	const t0 = tab.pages[0];
	t0.addInput(PARAMS, 'range', {min: 1, max: 100});
	t0.addInput(PARAMS, 'force', {min: 0, max: 5});
	t0.addSeparator();
	t0.addInput(PARAMS, 'dt', {min: 0, max: 0.002});
	t0.addMonitor(env, 't', {view: 'graph', lineCount: 1, min: 0, max: +1});
	t0.addSeparator();
	t0.addInput(PARAMS, 'maxRadius', {min: 0, max: 2000, label: 'radius'});
	t0.addInput(PARAMS, 'friction', {min: 0.5, max: 1});
	t0.addInput(PARAMS, 'transfer', {min: 0, max: 1});

	const t1 = tab.pages[1];
	t1.addInput(PARAMS, 'bg');
	t1.addInput(PARAMS, 'hue', {min: 0, max: 360, step: 1});
	t1.addInput(PARAMS, 'blend', {
		options: [ADD, BLEND, SCREEN, LIGHTEST].map((b) => ({text: b, value: b})),
	});
}

function setup() {
	createCanvas(windowWidth, windowWidth);
	colorMode(HSB, 360, 255, 255);
	noStroke();

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
	background(PARAMS.bg);
	blendMode(PARAMS.blend);

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
		// Attraction or repulsion
		jellies.forEach((j2) => {
			const f12 = computeJellyForce(
				j1.pos, j2.pos,
				PARAMS.range,
				PARAMS.force * (j1.group === j2.group ? -1 : +1),
			);
			j1.f.add(f12);
			f12.mult(-1);
			j2.f.add(f12);
		});

		// Mouse interaction
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
			j1.energy += j1.group === j2.group ? pow(0.5, d * 0.1) : 0;
		});
		j1.energy /= JELLY_COUNT;

		j1.draw();
		j1.f.set(0, 0);
	});

	pop();
}

function windowResized() {
	resizeCanvas(windowWidth, windowWidth);
}

function touchStarted() {
	return false;
}