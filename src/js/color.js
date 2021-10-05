class Color {
	static fromRgb(r, g, b) {
		return this.getValue(r, g, b);
	}

	static fromHsb(h, s, b) {
		const hi = Math.floor(h / 255 * 6) % 6;
		const f = (h / 255 * 6) - Math.floor(h / 255 * 6);
		const p = Math.round(b * (1 - (s / 255)));
		const q = Math.round(b * (1 - (s / 255) * f));
		const t = Math.round(b * (1 - (s / 255) * (1 - f)));

		let comps = [];
		switch (hi) {
			case 0:
				comps = [b, t, p];
				break;
			case 1:
				comps = [q, b, p];
				break;
			case 2:
				comps = [p, b, t];
				break;
			case 3:
				comps = [p, q, b];
				break;
			case 4:
				comps = [t, p, b];
				break;
			default:
				comps = [b, p, q];
				break;
		}
		return this.getValue(comps[0], comps[1], comps[2]);
	}

	static getValue(r, g, b) {
		return (r << 16) | (g << 8) | b;
	}
};

		// const min = Math.min(r, Math.min(g, b));
		// const max = Math.max(r, Math.max(g, b));
		// if (max === min) {
		// 	return 0;
		// }
		// if (max === r) {
		// 	return ((g - b) / (max - min) / 6 + 1) % 1;
		// }
		// if (max === g) {
		// 	return (b - r) / (max - min) / 6 + 1 / 3;
		// }
		// const hue = (r - g) / (max - min) / 6 + 2 / 3;
		// const saturation = (max !== 0) ?
		// 	(max - min) / max :
		// 	0;
		// const brightness = max;
		// return [hue, saturation, brightness];

module.exports = Color;
