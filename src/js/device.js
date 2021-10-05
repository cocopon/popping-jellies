class Device {
	static getPixelRatio() {
		return window.devicePixelRatio || 1.0;
	}
}

module.exports = Device;
