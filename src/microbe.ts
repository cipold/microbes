import {Food} from "./food";
import {Core} from "./core";

export class Microbe {
	x: number;
	y: number;
	size: number;
	largeSpecial: number;
	smallSpecial: number;
	private orientation: number;
	private targetOrientation?: number;
	private offsetOrientation: number;
	private currentSpeed: number;
	private targetSize: number;
	private sqrtSize: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.orientation = Math.random() * 2 * Math.PI;
		this.offsetOrientation = 0;
		this.size = 0;
		this.sqrtSize = 0;
		this.setSize(3);
		this.currentSpeed = 0;
		this.targetSize = this.size;
		this.largeSpecial = -10;
		this.smallSpecial = -10;
	}

	update(worldCenter: { x: number; y: number; }, borderSoft: number, borderHard: number, timeDiff: number) {
		const targetSpeed = 18 + 200 / Math.max(this.size * this.size, 1);
		this.currentSpeed = 0.95 * this.currentSpeed + 0.05 * targetSpeed;

		this.x += Math.cos(this.orientation) * this.currentSpeed * timeDiff;
		this.y += Math.sin(this.orientation) * this.currentSpeed * timeDiff;

		const dx = worldCenter.x - this.x;
		const dy = worldCenter.y - this.y;
		const l = Math.hypot(dx, dy);
		if (l > borderSoft) {
			const dxn = dx / l;
			const dyn = dy / l;
			this.targetOrientation = Math.atan2(dyn, dxn);

			if (l > borderHard) {
				this.x = worldCenter.x - dxn * borderHard;
				this.y = worldCenter.y - dyn * borderHard;
			}
		}

		if (this.targetOrientation !== undefined) {
			let orientationRepeatOffset = 0;

			if (Math.abs(this.targetOrientation - this.orientation) >= Math.PI) {
				if (this.targetOrientation > this.orientation) {
					orientationRepeatOffset = -2 * Math.PI;
				} else {
					orientationRepeatOffset = 2 * Math.PI;
				}
			}

			this.orientation += (this.targetOrientation + orientationRepeatOffset - this.orientation) * 3.0 * timeDiff;
		}

		this.offsetOrientation += (Math.random() * 2 - 1) * 1.8 * timeDiff;
		this.offsetOrientation *= Math.pow(0.9, (60 * timeDiff));
		this.orientation += this.offsetOrientation;

		if (this.orientation >= 2 * Math.PI) {
			this.orientation -= 2 * Math.PI;
		}

		if (this.orientation < 0) {
			this.orientation += 2 * Math.PI;
		}

		this.targetSize -= 0.18 * timeDiff;
		this.setSize(0.98 * this.size + 0.02 * this.targetSize);
	}

	interact(core: Core, time: number, minInteractDistance: number, foodCells: Food[][]) {
		let closest = null;
		let minDistance = 999999;
		const self = this;

		for (let i = 0; i < foodCells.length; i++) {
			const foodCell = foodCells[i];
			for (let j = 0; j < foodCell.length;) {
				const f = foodCell[j];
				let xDiff = self.x - f.x;
				if (xDiff < 0) xDiff = -xDiff;
				let yDiff = self.y - f.y;
				if (yDiff < 0) yDiff = -yDiff;

				if (xDiff > minInteractDistance || yDiff > minInteractDistance) {
					j++;
					continue;
				}

				const distance = Math.hypot(xDiff, yDiff);
				if (distance < 4 + self.sqrtSize + f.sqrtSize) {
					self.grow(time, f);
					foodCell.splice(j, 1);
					core.removeFood(f); // global
				} else {
					if (distance < minDistance) {
						closest = f;
						minDistance = distance;
					}
					j++;
				}
			}
		}

		if (closest !== null && minDistance < minInteractDistance) {
			const x = (closest.x - this.x) / minDistance;
			const y = (closest.y - this.y) / minDistance;
			this.targetOrientation = Math.atan2(y, x);
		} else {
			this.targetOrientation = undefined;
		}
	}

	grow(time: number, foodItem: Food) {
		this.targetSize += foodItem.sqrtSize;
		this.smallSpecial = time;
	}

	divide(time: number) {
		this.setSize(3);
		this.targetSize = this.size;
		this.largeSpecial = time;

		return new Microbe(this.x, this.y);
	}

	setSize(size: number) {
		this.size = size;
		this.sqrtSize = Math.sqrt(size);
	}
}
