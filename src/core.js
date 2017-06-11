class Core {
	constructor() {
		// Constants
		this.originalWorldSize = 1000;
		this.borderHardDistanceRel = 0.02;
		this.borderSoftDistanceRel = 0.05;
		this.borderMediumDistanceRel = (this.borderHardDistanceRel + this.borderSoftDistanceRel) / 2;
		this.worldSizeScaling = Math.sqrt(2);
		this.minWorldSizeFactor = 0.125;
		this.maxWorldSizeFactor = 2.0;
		this.timeFactorScaling = 2.0;
		this.minTimeFactor = 0.125;
		this.maxTimeFactor = 64.0;
		this.dropRadius = 15;
		this.desiredFps = 60;
		this.timeResolution = 1 / 60;
		this.maxFeedAmount = 40;
		this.minInteractDistance = 100;
		this.microbesLimit = 1000;
		this.foodLimit = 2000;

		// Parameters
		this.timeFactor = 1;
		this.worldSizeFactor = parseFloat(localStorage.getItem('worldSizeFactor')) || 0.5;

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
	}

	addMicrobe(microbe) {
		if (this.microbes.length < this.microbesLimit) {
			this.microbes.push(microbe);
			this.graphics.addMicrobe(microbe);
		}
	}

	removeMicrobe(microbe) {
		const index = this.microbes.indexOf(microbe);
		if (index >= 0) {
			this.microbes.splice(index, 1);
			this.graphics.removeMicrobe(microbe);
		} else {
			console.log('Skipping invalid index < 0 in removeMicrobe()');
		}
	}

	addFood(foodItem) {
		if (this.food.length < this.foodLimit) {
			this.mesh.add(foodItem);
			this.food.push(foodItem);
			this.graphics.addFood(foodItem);
		}
	}

	removeFood(foodItem) {
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

	resizeWorld(factor) {
		const oldWorldSizeFactor = this.worldSizeFactor;
		this.worldSizeFactor *= factor;
		this.worldSizeFactor = Math.min(Math.max(this.worldSizeFactor, this.minWorldSizeFactor), this.maxWorldSizeFactor);
		localStorage.setItem('worldSizeFactor', this.worldSizeFactor);
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

	onFullScreenChange(isFullScreen) {
		this.multiResizeWorld();
		this.overlay.onFullScreenChange(isFullScreen);
	}

	onMouseDown(event) {
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

	onMouseMove(event) {
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

	onMouseWheel() {
	}

	onTouchStart(changedTouches) {
		for (let touch of changedTouches) {
			if (this.hoverPos['touch' + touch.identifier]) {
				this.hoverPos['touch' + touch.identifier].x = touch.clientX;
				this.hoverPos['touch' + touch.identifier].y = touch.clientY;
			} else {
				this.hoverPos['touch' + touch.identifier] = {
					x: touch.clientX,
					y: touch.clientY
				}
			}
			if (this.dropPos['touch' + touch.identifier]) {
				this.dropPos['touch' + touch.identifier].x = touch.clientX;
				this.dropPos['touch' + touch.identifier].y = touch.clientY;
			} else {
				this.dropPos['touch' + touch.identifier] = {
					x: touch.clientX,
					y: touch.clientY
				}
			}
		}

		this.dropFood();
	}

	onTouchMove(changedTouches) {
		for (let touch of changedTouches) {
			if (this.hoverPos['touch' + touch.identifier]) {
				this.hoverPos['touch' + touch.identifier].x = touch.clientX;
				this.hoverPos['touch' + touch.identifier].y = touch.clientY;
			} else {
				this.hoverPos['touch' + touch.identifier] = {
					x: touch.clientX,
					y: touch.clientY
				}
			}
			if (this.dropPos['touch' + touch.identifier]) {
				this.dropPos['touch' + touch.identifier].x = touch.clientX;
				this.dropPos['touch' + touch.identifier].y = touch.clientY;
			} else {
				this.dropPos['touch' + touch.identifier] = {
					x: touch.clientX,
					y: touch.clientY
				}
			}
		}
	}

	onTouchEnd(changedTouches) {
		for (let touch of changedTouches) {
			this.graphics.removeHoverPos(this.hoverPos['touch' + touch.identifier]);
			delete this.hoverPos['touch' + touch.identifier];
			delete this.dropPos['touch' + touch.identifier];
		}
	}

	onKeyPress(key) {
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
		} else if (key === 27) {
			this.overlay.closeOptions();
		} else if (key === 'Escape' || key === 'Esc') {
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

	setOptimization(on) {
		localStorage.setItem('optimized', on);
		location.reload();
	}

	setShowDebugInformation(on) {
		localStorage.setItem('debug', on);
		this.graphics.setShowDebugInformation(on);
	}

	initMesh() {
		if (this.mesh) {
			this.mesh.init(this.worldWidth, this.worldHeight, this.minInteractDistance);
		} else {
			this.mesh = new Mesh(this.worldWidth, this.worldHeight, this.minInteractDistance);
		}
	}

	updateSingle(timeDiff) {
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
		// Permanent settings
		const optimized = JSON.parse(localStorage.getItem('optimized')) || false;
		const debug = JSON.parse(localStorage.getItem('debug')) || false;

		// Initialize system
		this.graphics = new Graphics(optimized, debug);
		this.overlay = new Overlay(this, optimized, debug);
		Events.init(this, this.graphics.getInteractive());

		// Initialize world
		this.resizeWorld(1.0);
		this.populateWorld();

		// Start draw loop
		const self = this;
		requestAnimationFrame(function () {
			self.loop();
		});
	}
}