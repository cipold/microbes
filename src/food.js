class Food {
	constructor(time, x, y, size = null) {
		this.x = x;
		this.y = y;
		this.special = time;
		this.setSize(size === null ? 1 : size);
		this.maxSize = 100.0;
		this.positionChanged = true;
	}

	update(worldCenter, borderMedium, timeDiff, mesh) {
		if (this.positionChanged) {
			let dx = worldCenter.x - this.x;
			let dy = worldCenter.y - this.y;
			const l = Math.hypot(dx, dy);
			if (l > borderMedium) {
				// 0.99 to actually get below threshold
				const f = 2 * (1 - (borderMedium * 0.99) / l) * timeDiff;
				this.x += dx * f;
				this.y += dy * f;
			} else {
				this.positionChanged = false;
			}

			mesh.update(this);
		}

		this.setSize(this.size + 0.3 * timeDiff);
	}

	setSize(size) {
		if (size > this.maxSize) {
			this.size = this.maxSize;
		} else {
			this.size = size;
		}
		this.sqrtSize = Math.sqrt(size);
	}
}