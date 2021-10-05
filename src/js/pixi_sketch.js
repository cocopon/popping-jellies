import Device from './device';

class PixiSketch {
	constructor(canvasElement) {
		this.width = 100;
		this.height = 100;
		this.scale_ = 1.0;

		const resolution = Math.min(Device.getPixelRatio(), 2);
		this.renderer_ = PIXI.autoDetectRenderer(
			this.width,
			this.height,
			{
				antialias: true,
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

	getRenderer() {
		return this.renderer_;
	}

	getStage() {
		return this.stage_;
	}

	getScale(scale) {
		this.scale_ = scale;
	}

	setScale(scale) {
		this.scale_ = scale;
		this.applyScale_();
	}

	applyScale_() {
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

		// elem.width = this.width * 0.5;
		// elem.height = this.height;
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

module.exports = PixiSketch;
