import {Mesh} from "./mesh";

export class Food {
	x: number;
	y: number;
	private size: number = 0;
	sqrtSize: number = 0;
	special: number;
	private readonly maxSize: number;
	positionChanged: boolean;
	meshCol?: number;
	meshRow?: number;

	constructor(time: number, x: number, y: number, size?:number) {
		this.x = x;
		this.y = y;
		this.special = time;
		this.setSize(size === undefined ? 1 : size);
		this.maxSize = 100.0;
		this.positionChanged = true;
	}

	update(worldCenter: { x: number; y: number; }, borderMedium: number, timeDiff: number, mesh: Mesh) {
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

	setSize(size: number) {
		if (size > this.maxSize) {
			this.size = this.maxSize;
		} else {
			this.size = size;
		}
		this.sqrtSize = Math.sqrt(size);
	}
}
