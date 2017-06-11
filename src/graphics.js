class Graphics {
	constructor(optimized, debug) {
		this.optimized = optimized;

		// Parameters
		this.resolutionFactor = 1;
		this.zoomFactor = 1;

		// Relative size factors used for texture generation
		this.textureSizeFactor = 1;
		this.tsfMicrobe = 20;
		this.tsfFood = 20;
		this.tsfExplosion = 100;
		this.tsfHover = 80;
		this.tsfHoverFill = 80;
		const fullResolution = window.devicePixelRatio || 1;
		const lowResolution = fullResolution > 1 ? 1 : 0.5;
		// Renderer
		this.renderer = PIXI.autoDetectRenderer(800, 800, {
			backgroundColor: 0x0b0b20,
			antialias: !optimized,
			resolution: optimized ? lowResolution : fullResolution
		});
		this.renderer.view.style.position = 'absolute';
		this.renderer.view.style.top = '0';
		this.renderer.view.style.width = '100%';
		this.renderer.view.style.height = '100%';
		document.body.appendChild(this.renderer.view);

		// Stages
		this.stage = new PIXI.Container();
		this.scalingStage = new PIXI.Container();
		this.stage.addChild(this.scalingStage);

		// Background
		this.background = new PIXI.Sprite();
		this.background.anchor.set(0.5);
		this.scalingStage.addChild(this.background);

		// Microbes & food
		// this.microbesContainer = new PIXI.particles.ParticleContainer(microbesLimit,
		this.microbesContainer = new PIXI.particles.ParticleContainer();
		this.microbesContainer.setProperties({
			scale: true,
			position: true,
			rotation: true,
			alpha: !optimized
		});
		// this.foodContainer = new PIXI.particles.ParticleContainer(foodLimit,
		this.foodContainer = new PIXI.particles.ParticleContainer();
		this.foodContainer.setProperties({
			scale: true,
			position: true,
			rotation: false,
			alpha: !optimized
		});
		// this.explosionsContainer = new PIXI.particles.ParticleContainer(explosionLimit,
		this.explosionsContainer = new PIXI.particles.ParticleContainer();
		this.explosionsContainer.setProperties({
			scale: true,
			position: true,
			rotation: false,
			alpha: true
		});
		this.scalingStage.addChild(this.microbesContainer);
		this.scalingStage.addChild(this.foodContainer);
		this.scalingStage.addChild(this.explosionsContainer);

		// Text
		this.statusText = new PIXI.Text('Loading...', {fontFamily: 'Arial', fontSize: 15, fill: 0x606060});
		this.statusText.x = 10;
		this.statusText.y = 80;
		if (debug) this.stage.addChild(this.statusText);
	}

	getInteractive() {
		return this.renderer.view;
	}

	resizeCanvas(hoverPos, microbes, food, worldWidth, worldHeight, radius, borderSoftRel, borderHardRel) {
		// Calculate resolution by normalizing with device based pixel ratio and scaling it with desired resolution factor
		const resolution = /*window.devicePixelRatio * */this.resolutionFactor;
		const width = window.innerWidth * resolution;
		const height = window.innerHeight * resolution;

		this.renderer.resize(window.innerWidth, window.innerHeight);

		// Calculate factor by which all elements are scaled up (used for zooming)
		const worldCanvasFactor = Math.min(width, height) / Math.min(worldWidth, worldHeight);
		const scaleFactor = this.zoomFactor * worldCanvasFactor;

		this.textureSizeFactor = scaleFactor;
		this.refreshTextures(hoverPos, microbes, food, scaleFactor * radius, borderSoftRel, borderHardRel);

		this.scalingStage.scale.x = scaleFactor;
		this.scalingStage.scale.y = scaleFactor;
		this.scalingStage.x = scaleFactor * width / worldCanvasFactor / 2;
		this.scalingStage.y = scaleFactor * height / worldCanvasFactor / 2;
		this.scalingStage.pivot.x = worldWidth / 2;
		this.scalingStage.pivot.y = worldHeight / 2;

		this.background.x = worldWidth / 2;
		this.background.y = worldHeight / 2;
		this.background.scale.x = 1 / scaleFactor;
		this.background.scale.y = 1 / scaleFactor;
	}

	drawMicrobe(microbe, time) {
		const sprite = microbe.sprite;
		sprite.rotation = microbe.orientation;
		sprite.x = microbe.x;
		sprite.y = microbe.y;
		sprite.scale.x = (5 + microbe.size * 5 / 3) / (this.tsfMicrobe * this.textureSizeFactor);
		sprite.scale.y = (5 + microbe.size * 5 / 3) / (this.tsfMicrobe * this.textureSizeFactor);

		// Highlight
		if (!this.optimized) {
			const smallSpecialDiff = time - microbe.smallSpecial;
			if (smallSpecialDiff >= 0 && smallSpecialDiff <= 1) {
				const smallSpecialFactor = 1 - smallSpecialDiff;
				sprite.alpha = 0.7 + 0.3 * smallSpecialFactor * smallSpecialFactor;
			} else {
				sprite.alpha = 0.7;
			}

			let largeSpecialDiff = time - microbe.largeSpecial;
			if (largeSpecialDiff >= 0 && largeSpecialDiff <= 1) {
				if (!microbe.explosionSprite) {
					const sprite = new PIXI.Sprite(this.explosionTexture);
					sprite.anchor.set(0.5);
					microbe.explosionSprite = sprite;
					this.explosionsContainer.addChild(sprite);
				}

				let largeSpecialFactor = 1 - largeSpecialDiff;
				largeSpecialFactor = largeSpecialFactor * largeSpecialFactor * largeSpecialFactor;

				microbe.explosionSprite.x = microbe.x;
				microbe.explosionSprite.y = microbe.y;
				microbe.explosionSprite.alpha = largeSpecialFactor * largeSpecialFactor * largeSpecialFactor;
				microbe.explosionSprite.scale.x = 2 * 40 * (1 - largeSpecialFactor) / (this.tsfExplosion * this.textureSizeFactor);
				microbe.explosionSprite.scale.y = 2 * 40 * (1 - largeSpecialFactor) / (this.tsfExplosion * this.textureSizeFactor);
			} else {
				if (microbe.explosionSprite) {
					this.explosionsContainer.removeChild(microbe.sprite);
					microbe.explosionSprite.destroy();
					delete microbe.explosionSprite;
				}
			}
		}
	}

	drawFood(foodItem, time) {
		const sprite = foodItem.sprite;
		sprite.x = foodItem.x;
		sprite.y = foodItem.y;
		sprite.scale.x = 2 * (foodItem.sqrtSize + 1) / (this.tsfFood * this.textureSizeFactor);
		sprite.scale.y = 2 * (foodItem.sqrtSize + 1) / (this.tsfFood * this.textureSizeFactor);

		// Highlight
		if (!this.optimized) {
			let specialDiff = time - foodItem.special;
			if (specialDiff >= 0 && specialDiff <= 1) {
				const specialFactor = 1 - specialDiff;
				sprite.alpha = 0.7 + 0.3 * specialFactor * specialFactor;
			} else {
				sprite.alpha = 0.7;
			}
		}
	}

	draw(rotation, time, hoverPos, dropRadius, feedLevel, microbes, food, fps, updateLoad, drawLoad) {
		this.scalingStage.rotation = rotation;

		// Draw hover positions
		for (let i in hoverPos) {
			if (hoverPos.hasOwnProperty(i)) {
				const p = hoverPos[i];
				if (!p.hoverSprite) {
					const sprite = new PIXI.Sprite(this.hoverTexture);
					sprite.anchor.set(0.5);
					this.scalingStage.addChild(sprite);
					p.hoverSprite = sprite;
				}
				if (!p.hoverFillSprite) {
					const sprite = new PIXI.Sprite(this.hoverFillTexture);
					sprite.anchor.set(0.5);
					this.scalingStage.addChild(sprite);
					p.hoverFillSprite = sprite;
				}

				const worldPos = this.scalingStage.toLocal(new PIXI.Point(p.x, p.y));
				p.hoverSprite.position = worldPos;
				p.hoverSprite.scale.x = 2 * dropRadius / (this.tsfHover * this.textureSizeFactor);
				p.hoverSprite.scale.y = 2 * dropRadius / (this.tsfHover * this.textureSizeFactor);
				p.hoverFillSprite.position = worldPos;
				p.hoverFillSprite.scale.x = 2 * dropRadius / (this.tsfHoverFill * this.textureSizeFactor);
				p.hoverFillSprite.scale.y = 2 * dropRadius / (this.tsfHoverFill * this.textureSizeFactor);
				p.hoverFillSprite.alpha = Math.sqrt(feedLevel);
			}
		}

		this.statusText.text = Math.round(fps) + ' fps | u: ' + (100 * updateLoad).toFixed(0) + '% | d: ' + (100 * drawLoad).toFixed(0) + '%\n' +
			microbes.length + ' microbes\n' +
			food.length + ' food';

		for (let i = 0; i < microbes.length; i++) {
			this.drawMicrobe(microbes[i], time);
		}

		for (let i = 0; i < food.length; i++) {
			this.drawFood(food[i], time);
		}

		this.renderer.render(this.stage);
	}

	addMicrobe(microbe) {
		const sprite = new PIXI.Sprite(this.microbeTexture);
		sprite.anchor.set(3 / 5, 0.5);
		microbe.sprite = sprite;
		this.microbesContainer.addChild(sprite);
	}

	removeMicrobe(microbe) {
		this.microbesContainer.removeChild(microbe.sprite);
		microbe.sprite.destroy();
		delete microbe.sprite;
		if (microbe.explosionSprite) {
			this.explosionsContainer.removeChild(microbe.sprite);
			microbe.explosionSprite.destroy();
			delete microbe.explosionSprite;
		}
	}

	addFood(foodItem) {
		const sprite = new PIXI.Sprite(this.foodTexture);
		sprite.anchor.set(0.5);
		foodItem.sprite = sprite;
		this.foodContainer.addChild(sprite);
	}

	removeFood(foodItem) {
		this.foodContainer.removeChild(foodItem.sprite);
		foodItem.sprite.destroy();
		delete foodItem.sprite;
	}

	removeHoverPos(hoverPos) {
		if (hoverPos.hoverSprite) {
			this.scalingStage.removeChild(hoverPos.hoverSprite);
			hoverPos.hoverSprite.destroy();
			delete hoverPos.hoverSprite;
		}
		if (hoverPos.hoverFillSprite) {
			this.scalingStage.removeChild(hoverPos.hoverFillSprite);
			hoverPos.hoverFillSprite.destroy();
			delete hoverPos.hoverFillSprite;
		}
	}

	static getMicrobeTexture(renderer, tsf) {
		const g = new PIXI.Graphics();

		// Head
		g.lineStyle(2 / 5 * tsf, 0xff0000, 1.0);
		g.moveTo(0, 0);
		g.lineTo(2 / 5 * tsf, 0);

		// Body
		g.lineStyle(3 / 5 * tsf, 0x00ff00, 1.0);
		g.moveTo(0, 0);
		g.lineTo(-3 / 5 * tsf, 0);

		return renderer.generateTexture(g);
	}

	static getFoodTexture(renderer, tsf) {
		const g = new PIXI.Graphics();

		g.lineStyle(0);
		g.beginFill(0x9696ff, 1.0);
		g.drawCircle(0, 0, 0.5 * tsf);

		return renderer.generateTexture(g);
	}

	static getExplosionTexture(renderer, tsf) {
		const g = new PIXI.Graphics();

		g.lineStyle(0);
		g.beginFill(0xffffff, 1.0);
		g.drawCircle(0, 0, 0.5 * tsf);

		return renderer.generateTexture(g);
	}

	static getBackgroundTexture(scaledRadius, borderSoftUnscaled, borderHardUnscaled) {
		const r = scaledRadius;
		const canvas = document.createElement('canvas');
		canvas.width = 2 * r;
		canvas.height = 2 * r;
		const context = canvas.getContext('2d');

		const gradient = context.createRadialGradient(r, r, 0, r, r, r);
		gradient.addColorStop(0, '#0d0d28');
		gradient.addColorStop(borderSoftUnscaled, '#161638');
		gradient.addColorStop(borderHardUnscaled, '#303060');
		gradient.addColorStop(1, 'rgba(11, 11, 32, 0)');
		context.fillStyle = gradient;
		context.fillRect(0, 0, 2 * r, 2 * r);

		return PIXI.Texture.fromCanvas(canvas);
	}

	static getHoverTexture(renderer, tsf) {
		const g = new PIXI.Graphics();

		g.lineStyle(0);
		g.beginFill(0x9696ff, 0.2);
		g.drawCircle(0, 0, 0.5 * tsf);

		return renderer.generateTexture(g);
	}

	static getHoverFillTexture(tsf) {
		const r = 0.5 * tsf;
		const canvas = document.createElement('canvas');
		canvas.width = tsf;
		canvas.height = tsf;
		const context = canvas.getContext('2d');

		context.beginPath();
		context.arc(r, r, r, 0, 2 * Math.PI);
		context.closePath();
		const gradient = context.createRadialGradient(r, r, 0, r, r, r);
		gradient.addColorStop(0.2, 'rgba(150, 150, 255, 0.2)');
		gradient.addColorStop(0.7, 'rgba(150, 150, 255, 0.2)');
		gradient.addColorStop(1, 'rgba(150, 150, 255, 0.6)');
		context.fillStyle = gradient;
		context.fill();

		return PIXI.Texture.fromCanvas(canvas);
	}

	refreshTextures(hoverPos, microbes, food, scaledRadius, borderSoftRel, borderHardRel) {
		if (this.explosionTexture) this.explosionTexture.destroy();
		this.explosionTexture = Graphics.getExplosionTexture(this.renderer, Math.max(this.tsfExplosion * this.textureSizeFactor, 3));

		if (this.hoverTexture) this.hoverTexture.destroy();
		this.hoverTexture = Graphics.getHoverTexture(this.renderer, Math.max(this.tsfHover * this.textureSizeFactor, 3));
		if (this.hoverFillTexture) this.hoverFillTexture.destroy();
		this.hoverFillTexture = Graphics.getHoverFillTexture(Math.max(this.tsfHoverFill * this.textureSizeFactor, 3));
		for (let i in hoverPos) {
			if (hoverPos.hasOwnProperty(i)) {
				const p = hoverPos[i];
				if (p.hoverSprite) {
					p.hoverSprite.texture = this.hoverTexture;
				}
				if (p.hoverFillSprite) {
					p.hoverFillSprite.texture = this.hoverFillTexture;
				}
			}
		}

		if (this.microbeTexture) this.microbeTexture.destroy();
		this.microbeTexture = Graphics.getMicrobeTexture(this.renderer, Math.max(this.tsfMicrobe * this.textureSizeFactor, 3));
		for (let i = 0; i < microbes.length; i++) {
			microbes[i].sprite.texture = this.microbeTexture;
			if (microbes[i].explosionSprite) {
				microbes[i].explosionSprite.texture = this.explosionTexture;
			}
		}

		if (this.foodTexture) this.foodTexture.destroy();
		this.foodTexture = Graphics.getFoodTexture(this.renderer, Math.max(this.tsfFood * this.textureSizeFactor, 3));
		for (let i = 0; i < food.length; i++) {
			food[i].sprite.texture = this.foodTexture;
		}

		if (this.background.texture) this.background.texture.destroy();
		this.background.texture = Graphics.getBackgroundTexture(scaledRadius, borderSoftRel, borderHardRel);
	}

	toWorldPos(x, y) {
		return this.scalingStage.toLocal(new PIXI.Point(x, y));
	}

	setShowDebugInformation(on) {
		if (on) {
			this.stage.addChild(this.statusText);
		} else {
			this.stage.removeChild(this.statusText);
		}
	}
}