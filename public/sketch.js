const JELLY_COUNT = 100;
const GROUP_COUNT = 3;
const AREA_SIZE = 500;
const NOISE_SCALE = 0.01;
const TRANSITION_SPEED = 0.005;
const RANDOMNESS = 2.0;
const MARGIN = 10;
const MIN_RADIUS = 0;
const MAX_RADIUS = 1000;
const MAX_FORCE = 1.0;

const jellies = [];
const env = {
	friction: 0,
	jellyPower: 0,
	noiseZ: 0,
	transferRate: 0,
};

class Jelly {
	constructor(x, y, group) {
		this.group = group;
		this.f = createVector();
		this.pos = createVector(x, y);
		this.vel = createVector();
		this.energy = 0;
	}

	reset() {
		this.f.set(0, 0);
	}

	update(env) {
		// External
		const r1 = noise(this.pos.x * NOISE_SCALE, this.pos.y * NOISE_SCALE, env.noiseZ);
		const angle = map(r1, 0, 1, -1, +1) * TWO_PI;
		this.vel.x += cos(angle) * env.jellyPower;
		this.vel.y += sin(angle) * env.jellyPower;
		// Internal
		const r2 = random(TWO_PI);
		this.vel.x += cos(r2) * env.jellyPower * RANDOMNESS;
		this.vel.y += sin(r2) * env.jellyPower * RANDOMNESS;

		this.vel.mult(env.friction);

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
		this.energy = 0;
		jellies.forEach((a) => {
			const d = this.pos.dist(a.pos);
			this.energy += pow(0.5, d * 0.1);
		});
		this.energy /= JELLY_COUNT;

		fill(
			map(this.group, 0, GROUP_COUNT - 1, 5, 140),
			255,
			255
		);
		const sz = map(this.energy, 0, 1, MIN_RADIUS, MAX_RADIUS);
		circle(this.pos.x, this.pos.y, sz / 2);
	}
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
}

function draw() {
	blendMode(BLEND);
	background(0, 0, 0x22);
	blendMode(ADD);

	push();
	scale(max(
		1,
		width / AREA_SIZE,
		height / AREA_SIZE,
	));

	const t = -cos((frameCount * 0.001) * TWO_PI);
	env.friction = map(t, -1, +1, 0.9, 0.95);
	env.jellyPower = map(t, -1, +1, 0.05, 0.08);
	env.transferRate = map(t, -1, +1, 0.5, 0.8);

	if (random() < env.transferRate) {
		const jelly = jellies[floor(random(JELLY_COUNT))];
		if (jelly.energy > 0.02) {
			jelly.group = floor(random(GROUP_COUNT));
		}
	}

	env.noiseZ += TRANSITION_SPEED;

	jellies.forEach((a) => {
		a.reset();
	});

	for (let j = 0; j < JELLY_COUNT; j++) {
		for (let i = j + 1; i < JELLY_COUNT; i++) {
			const j1 = jellies[i];
			const j2 = jellies[j];
			const n12 = p5.Vector.sub(j1.pos, j2.pos);
			const oldMag = n12.mag();
			n12.setMag(
				pow(0.5, oldMag * 1e-1) * MAX_FORCE * (j1.group === j2.group ? -1 : +1),
			);

			j1.f.add(n12);
			n12.mult(-1);
			j2.f.add(n12);
		}
	}

	jellies.forEach((j) => {
		j.update(env);
	});

	jellies.forEach((j) => {
		j.draw();
	});

	pop();
}