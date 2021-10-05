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

module.exports = Vector;
