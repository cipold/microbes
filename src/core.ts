import {Events} from "./events";
import {Information} from "./information";
import {Food} from "./food";
import {Microbe} from "./microbe";
import {randomPointInCircle} from "./helpers";
import {Overlay} from "./overlay";
import {Graphics} from "./graphics";
import {FramePolicy} from "./framepolicy";
import {Mesh} from "./mesh";

export class Core {
	// Parameters
	timeFactor: number;
	private worldSizeFactor: number;

	// World size state
	private worldWidth: number;
	private worldHeight: number;
	private worldCenter: { x: number, y: number };
	private radius: number;
	private borderSoft: number;
	private borderMedium: number;
	private borderHard: number;

	// Simulation state
	private time: number;
	private readonly microbes: Microbe[];
	private readonly food: Food[];
	private rotation: number;
	private feedAmount: number;

	// Mouse / touches
	private readonly hoverPos: any;
	private readonly dropPos: any;

	// Information
	private msPerFrame: Information;
	private drawLoad: Information;
	private updateLoad: Information;

	// Misc
	private graphics: Graphics;
	private overlay: Overlay;
	private mesh: Mesh;
	private lastUpdate?: number;

	// Constants
	private readonly originalWorldSize = 1000;
	private readonly borderHardDistanceRel = 0.02;
	private readonly borderSoftDistanceRel = 0.05;
	private readonly borderMediumDistanceRel = (this.borderHardDistanceRel + this.borderSoftDistanceRel) / 2;
	private readonly worldSizeScaling = Math.sqrt(2);
	private readonly minWorldSizeFactor = 0.125;
	private readonly maxWorldSizeFactor = 2.0;
	private readonly timeFactorScaling = 2.0;
	private readonly minTimeFactor = 0.125;
	private readonly maxTimeFactor = 64.0;
	private readonly dropRadius = 15;
	private readonly desiredFps = 60;
	private readonly timeResolution = 1 / 60;
	private readonly maxFeedAmount = 40;
	private readonly minInteractDistance = 100;
	private readonly microbesLimit = 1000;
	private readonly foodLimit = 2000;

	constructor() {
		// Parameters
		this.timeFactor = 1;
		this.worldSizeFactor = parseFloat(localStorage.getItem('worldSizeFactor') || "0.5");

		// World size state
		this.worldWidth = 1;
		this.worldHeight = 1;
		this.worldCenter = {
			x: this.worldWidth / 2,
			y: this.worldHeight / 2
		};
		this.radius = 1;
		this.borderSoft = 1;
		this.borderMedium = 1;
		this.borderHard = 1;

		// Simulation state
		this.time = 0;
		this.microbes = [];
		this.food = [];
		this.rotation = 0;
		this.feedAmount = 0;

		// Mouse / touches
		this.hoverPos = {};
		this.dropPos = {};

		// Information
		this.msPerFrame = new Information(30);
		this.drawLoad = new Information(30);
		this.updateLoad = new Information(30);

		// Permanent settings
		const optimized = localStorage.getItem('optimized') === 'true';
		const debug = localStorage.getItem('debug') === 'true';

		// Initialize system
		this.graphics = new Graphics(optimized, debug);
		this.overlay = new Overlay(this, optimized, debug);
		Events.init(this, this.graphics.getInteractive());

		// FIXME: remove this duplicate mesh initialization only added to satisfy typescript
		this.mesh = new Mesh(this.worldWidth, this.worldHeight, this.minInteractDistance);

		// Initialize world
		this.resizeWorld(1.0);
		this.populateWorld();
	}

	addMicrobe(microbe: Microbe) {
		if (this.microbes.length < this.microbesLimit) {
			this.microbes.push(microbe);
			this.graphics.addMicrobe(microbe);
		}
	}

	removeMicrobe(microbe: Microbe) {
		const index = this.microbes.indexOf(microbe);
		if (index >= 0) {
			this.microbes.splice(index, 1);
			this.graphics.removeMicrobe(microbe);
		} else {
			console.log('Skipping invalid index < 0 in removeMicrobe()');
		}
	}

	addFood(foodItem: Food) {
		if (this.food.length < this.foodLimit) {
			this.mesh.add(foodItem);
			this.food.push(foodItem);
			this.graphics.addFood(foodItem);
		}
	}

	removeFood(foodItem: Food) {
		// foodItem already removed from mesh
		const index = this.food.indexOf(foodItem);
		if (index >= 0) {
			this.food.splice(index, 1);
			this.graphics.removeFood(foodItem);
		} else {
			console.log('Skipping invalid index < 0 in removeFood()');
		}
	}

	// Returns random coordinate in world
	randomLevelCoords() {
		return randomPointInCircle(this.worldCenter.x, this.worldCenter.y, this.borderMedium);
	}

	// Immediately drops all food at last touch / mouse position
	dropFood() {
		let count = 0;
		for (let i in this.dropPos) {
			if (this.dropPos.hasOwnProperty(i)) {
				const p = this.dropPos[i];
				let worldPos = this.graphics.toWorldPos(p.x, p.y);
				let dropAmount = Math.floor(this.feedAmount / (Object.keys(this.dropPos).length - count));

				if (dropAmount === 0 && this.feedAmount > 0) {
					dropAmount = (Math.random() > (1 - this.feedAmount / (Object.keys(this.dropPos).length - count))) ? 1 : 0;
				}

				// Drop food uniformly around position
				for (let j = 0; j < dropAmount; j++) {
					const p = randomPointInCircle(worldPos.x, worldPos.y, this.dropRadius);
					this.addFood(new Food(this.time, p.x, p.y, 0.3 + Math.random() * 0.7));
				}

				this.feedAmount -= dropAmount;
				count++;
			}
		}
	}

	resizeWorld(factor: number) {
		const oldWorldSizeFactor = this.worldSizeFactor;
		this.worldSizeFactor *= factor;
		this.worldSizeFactor = Math.min(Math.max(this.worldSizeFactor, this.minWorldSizeFactor), this.maxWorldSizeFactor);
		localStorage.setItem('worldSizeFactor', this.worldSizeFactor.toString());
		factor = this.worldSizeFactor / oldWorldSizeFactor;

		// Resize world
		this.worldWidth = this.originalWorldSize * this.worldSizeFactor;
		this.worldHeight = this.originalWorldSize * this.worldSizeFactor;
		this.worldCenter = {
			x: this.worldWidth / 2,
			y: this.worldHeight / 2
		};
		this.radius = 0.9 * this.originalWorldSize * this.worldSizeFactor / 2;

		this.borderSoft = this.radius * (1 - this.borderSoftDistanceRel / this.worldSizeFactor);
		this.borderMedium = this.radius * (1 - this.borderMediumDistanceRel / this.worldSizeFactor);
		this.borderHard = this.radius * (1 - this.borderHardDistanceRel / this.worldSizeFactor);

		// Reposition all elements
		for (let i = 0; i < this.microbes.length; i++) {
			const m = this.microbes[i];
			m.x *= factor;
			m.y *= factor;
		}

		for (let i = 0; i < this.food.length; i++) {
			const f = this.food[i];
			f.x *= factor;
			f.y *= factor;
			f.positionChanged = true;
		}

		this.onResize();
		this.initMesh();
	}

	multiResizeWorld() {
		this.resizeWorld(1.0);
		const self = this;
		setTimeout(function () {
			self.resizeWorld(1.0);
		}, 100);
		setTimeout(function () {
			self.resizeWorld(1.0);
		}, 500);
		setTimeout(function () {
			self.resizeWorld(1.0);
		}, 1500);
	}

	onResize() {
		this.graphics.resizeCanvas(
			this.hoverPos,
			this.microbes,
			this.food,
			this.worldWidth,
			this.worldHeight,
			this.radius,
			1 - this.borderSoftDistanceRel / this.worldSizeFactor,
			1 - this.borderHardDistanceRel / this.worldSizeFactor
		);
	}

	onFullScreenChange(isFullScreen: boolean) {
		this.multiResizeWorld();
		this.overlay.onFullScreenChange(isFullScreen);
	}

	onMouseDown(event: MouseEvent) {
		if (this.dropPos.mouse) {
			this.dropPos.mouse.x = event.clientX;
			this.dropPos.mouse.y = event.clientY;
		} else {
			this.dropPos.mouse = {
				x: event.clientX,
				y: event.clientY
			};
		}
		this.dropFood();
	}

	onMouseMove(event: MouseEvent) {
		if (this.hoverPos.mouse) {
			this.hoverPos.mouse.x = event.clientX;
			this.hoverPos.mouse.y = event.clientY;
		} else {
			this.hoverPos.mouse = {
				x: event.clientX,
				y: event.clientY
			};
		}
		if (this.dropPos.mouse) {
			this.dropPos.mouse.x = this.hoverPos.mouse.x;
			this.dropPos.mouse.y = this.hoverPos.mouse.y;
		}
	}

	onMouseUp() {
		delete this.dropPos.mouse;
	}

	onMouseOut() {
		this.graphics.removeHoverPos(this.hoverPos.mouse);
		delete this.hoverPos.mouse;
	}

	onMouseWheel(_event: Event) {
	}

	onTouchStart(changedTouches: TouchList) {
		for (let i = 0; i < changedTouches.length; i++) {
			if (this.hoverPos['touch' + changedTouches[i].identifier]) {
				this.hoverPos['touch' + changedTouches[i].identifier].x = changedTouches[i].clientX;
				this.hoverPos['touch' + changedTouches[i].identifier].y = changedTouches[i].clientY;
			} else {
				this.hoverPos['touch' + changedTouches[i].identifier] = {
					x: changedTouches[i].clientX,
					y: changedTouches[i].clientY
				}
			}
			if (this.dropPos['touch' + changedTouches[i].identifier]) {
				this.dropPos['touch' + changedTouches[i].identifier].x = changedTouches[i].clientX;
				this.dropPos['touch' + changedTouches[i].identifier].y = changedTouches[i].clientY;
			} else {
				this.dropPos['touch' + changedTouches[i].identifier] = {
					x: changedTouches[i].clientX,
					y: changedTouches[i].clientY
				}
			}
		}

		this.dropFood();
	}

	onTouchMove(changedTouches: TouchList) {
		for (let i = 0; i < changedTouches.length; i++) {
			if (this.hoverPos['touch' + changedTouches[i].identifier]) {
				this.hoverPos['touch' + changedTouches[i].identifier].x = changedTouches[i].clientX;
				this.hoverPos['touch' + changedTouches[i].identifier].y = changedTouches[i].clientY;
			} else {
				this.hoverPos['touch' + changedTouches[i].identifier] = {
					x: changedTouches[i].clientX,
					y: changedTouches[i].clientY
				}
			}
			if (this.dropPos['touch' + changedTouches[i].identifier]) {
				this.dropPos['touch' + changedTouches[i].identifier].x = changedTouches[i].clientX;
				this.dropPos['touch' + changedTouches[i].identifier].y = changedTouches[i].clientY;
			} else {
				this.dropPos['touch' + changedTouches[i].identifier] = {
					x: changedTouches[i].clientX,
					y: changedTouches[i].clientY
				}
			}
		}
	}

	onTouchEnd(changedTouches: TouchList) {
		for (let i = 0; i < changedTouches.length; i++) {
			this.graphics.removeHoverPos(this.hoverPos['touch' + changedTouches[i].identifier]);
			delete this.hoverPos['touch' + changedTouches[i].identifier];
			delete this.dropPos['touch' + changedTouches[i].identifier];
		}
	}

	onKeyPress(key: string) {
		if (key === '+') {
			this.onIncreaseSpeed();
		} else if (key === '-') {
			this.onDecreaseSpeed();
		} else if (key === '1') {
			this.resizeWorld(1e-10);
		} else if (key === '9') {
			this.resizeWorld(1e10);
		} else if (key === '/') {
			this.onDecreaseSize();
		} else if (key === '*') {
			this.onIncreaseSize();
		} else if (key === 'Escape') {
			this.overlay.closeOptions();
		}
	}

	onDecreaseSpeed() {
		this.timeFactor *= 1 / this.timeFactorScaling;
		if (this.timeFactor < this.minTimeFactor) this.timeFactor = this.minTimeFactor;
		this.overlay.setSpeed(this.timeFactor);
	}

	onIncreaseSpeed() {
		this.timeFactor *= this.timeFactorScaling;
		if (this.timeFactor > this.maxTimeFactor) this.timeFactor = this.maxTimeFactor;
		this.overlay.setSpeed(this.timeFactor);
	}

	onDecreaseSize() {
		this.resizeWorld(1 / this.worldSizeScaling);
		this.overlay.setWorldSize(this.worldSizeFactor);
	}

	onIncreaseSize() {
		this.resizeWorld(this.worldSizeScaling);
		this.overlay.setWorldSize(this.worldSizeFactor);
	}

	setOptimization(on: boolean) {
		localStorage.setItem('optimized', on.toString());
		location.reload();
	}

	setShowDebugInformation(on: boolean) {
		localStorage.setItem('debug', on.toString());
		this.graphics.setShowDebugInformation(on);
	}

	initMesh() {
		this.mesh = new Mesh(this.worldWidth, this.worldHeight, this.minInteractDistance, this.mesh);
	}

	updateSingle(timeDiff: number) {
		this.time += timeDiff;

		// Rotation
		this.rotation += 0.018 * timeDiff;

		// Add user food
		const userFoodFactor = 18.0 * timeDiff;
		for (let i = 0; i < userFoodFactor; i++) {
			if (i + 1 < userFoodFactor || Math.random() < userFoodFactor - i) {
				this.feedAmount += 1;
				if (this.feedAmount > this.maxFeedAmount) {
					this.feedAmount = this.maxFeedAmount;
				}
			}
		}

		// User food
		this.dropFood();

		// Random food
		const randomFoodFactor = 0.00006 * this.radius * this.radius * timeDiff;
		for (let i = 0; i < randomFoodFactor; i++) {
			if (Math.random() > 1 - randomFoodFactor) {
				const p = this.randomLevelCoords();
				this.addFood(new Food(this.time, p.x, p.y, 0.3));
			}
		}

		// Update food
		for (let i = 0; i < this.food.length; i++) {
			this.food[i].update(this.worldCenter, this.borderMedium, timeDiff, this.mesh);
		}

		// Update microbes
		for (let i = 0; i < this.microbes.length;) {
			const microbe = this.microbes[i];
			microbe.interact(this, this.time, this.minInteractDistance, this.mesh.get(microbe));
			microbe.update(this.worldCenter, this.borderSoft, this.borderHard, timeDiff);

			if (microbe.size > 10) {
				this.addMicrobe(microbe.divide(this.time));
			}

			if (microbe.size <= 0) {
				this.removeMicrobe(microbe);
				this.addFood(new Food(this.time, microbe.x, microbe.y, 5));
			} else {
				i++;
			}
		}
	}

	// Main simulation / update functionality
	update() {
		const now = new Date().getTime();
		const regularTimeDiff = this.timeResolution;

		if (!this.lastUpdate) {
			this.updateSingle(regularTimeDiff);
			this.lastUpdate = now;
			return;
		}

		const timeSinceLastUpdate = this.timeFactor * (now - this.lastUpdate) / 1000;
		const frames = FramePolicy.getFrames(timeSinceLastUpdate, regularTimeDiff, this.timeFactor);

		for (let i = 0; i < frames.framesSkipped; i++) {
			this.updateSingle(regularTimeDiff);
		}

		// Catch up jitter
		if (frames.timeDiffRemainder > 0.0001) {
			this.updateSingle(frames.timeDiffRemainder);
		}

		this.lastUpdate = now;
	}

	loop() {
		const startUpdate = new Date().getTime();
		this.update();
		const endUpdate = new Date().getTime();
		this.updateLoad.addValue((endUpdate - startUpdate) / (1000 / this.desiredFps));

		const startDraw = new Date().getTime();
		this.graphics.draw(
			this.rotation,
			this.time,
			this.hoverPos,
			this.dropRadius,
			this.feedAmount / this.maxFeedAmount,
			this.microbes,
			this.food,
			1000 / Math.max(this.msPerFrame.getAverageDifference(), 1),
			this.updateLoad.getAverage(),
			this.drawLoad.getAverage()
		);
		const endDraw = new Date().getTime();
		this.drawLoad.addValue((endDraw - startDraw) / (1000 / this.desiredFps));

		this.msPerFrame.addValue(endDraw);

		const self = this;
		requestAnimationFrame(function () {
			self.loop();
		});
	}

	clearWorld() {
		while (this.microbes.length > 0) {
			this.removeMicrobe(this.microbes[0]);
		}

		while (this.food.length > 0) {
			this.removeFood(this.food[0]);
		}
	}

	populateWorld() {
		for (let i = 0; i < this.radius * this.radius / 5000; i++) {
			const p = this.randomLevelCoords();
			this.addMicrobe(new Microbe(p.x, p.y));
		}

		for (let i = 0; i < this.radius * this.radius / 5000; i++) {
			const p = this.randomLevelCoords();
			this.addFood(new Food(this.time, p.x, p.y, 0.3 + Math.random() * 3));
		}
	}

	// Initialization
	start() {
		// Start draw loop
		const self = this;
		requestAnimationFrame(function () {
			self.loop();
		});
	}
}
