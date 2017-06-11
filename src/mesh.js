class Mesh {
	constructor(width, height, minCellSize) {
		this.init(width, height, minCellSize);
	}

	init(width, height, minCellSize) {
		const oldm = this.m;
		const oldCols = this.cols;
		const oldRows = this.rows;

		this.width = width;
		this.height = height;
		this.cols = Math.floor(width / minCellSize);
		this.rows = Math.floor(height / minCellSize);
		this.m = new Array(this.rows);
		for (let row = 0; row < this.rows; row++) {
			this.m[row] = new Array(this.cols);
			for (let col = 0; col < this.cols; col++) {
				this.m[row][col] = {
					food: []
				};
			}
		}

		if (oldm) {
			for (let row = 0; row < oldRows; row++) {
				for (let col = 0; col < oldCols; col++) {
					const food = oldm[row][col].food;
					for (let i = 0; i < food.length; i++) {
						delete food[i].meshCol;
						delete food[i].meshRow;
						this.add(food[i]);
					}
				}
			}
		}
	}

	clear() {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				this.m[row][col].food = [];
			}
		}
	}

	add(f) {
		if (f.meshCol !== undefined || f.meshRow !== undefined) {
			console.warn('add called on item with meshRow or meshCol');
			return;
		}

		// ~~ == faster Math.floor
		let col = ~~(this.cols * f.x / this.width);
		let row = ~~(this.rows * f.y / this.height);

		// if faster than Math.min / Math.max
		if (col < 0) col = 0;
		if (col > this.cols - 1) col = this.cols - 1;
		if (row < 0) row = 0;
		if (row > this.rows - 1) row = this.rows - 1;

		f.meshCol = col;
		f.meshRow = row;
		this.m[row][col].food.push(f);
	}

	update(f) {
		if (f.meshCol === undefined || f.meshRow === undefined) {
			console.warn('update called on item without meshRow or meshCol');
			return;
		}

		// ~~ == faster Math.floor
		let col = ~~(this.cols * f.x / this.width);
		let row = ~~(this.rows * f.y / this.height);

		// if faster than Math.min / Math.max
		if (col < 0) col = 0;
		if (col > this.cols - 1) col = this.cols - 1;
		if (row < 0) row = 0;
		if (row > this.rows - 1) row = this.rows - 1;

		if (f.meshCol !== col || f.meshRow !== row) {
			this.remove(f);

			f.meshCol = col;
			f.meshRow = row;
			this.m[row][col].food.push(f);
		}
	}

	remove(f) {
		if (f.meshCol === undefined || f.meshRow === undefined) {
			console.warn('remove called on item without meshRow or meshCol');
			return;
		}
		const col = f.meshCol;
		if (col < 0 || col > this.cols - 1) {
			console.warn('remove called on item with illegal meshCol');
			return;
		}
		const row = f.meshRow;
		if (row < 0 || row > this.rows - 1) {
			console.warn('remove called on item with illegal meshRow');
			return;
		}

		const food = this.m[row][col].food;
		delete food.meshCol;
		delete food.meshRow;
		const index = food.indexOf(f);
		if (index >= 0) {
			food.splice(index, 1);
		} else {
			console.log('Could not find food item in mesh');
		}
	}

	get(m) {
		// ~~ == faster Math.floor
		let col = ~~(this.cols * m.x / this.width);
		let row = ~~(this.rows * m.y / this.height);

		let ret = [];
		let pr = row - 1;
		let pc = col - 1;
		if (pr >= 0 && pr < this.rows) {
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
		}
		pr++;
		pc = col - 1;
		if (pr >= 0 && pr < this.rows) {
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
		}
		pr++;
		pc = col - 1;
		if (pr >= 0 && pr < this.rows) {
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
			pc++;
			if (pc >= 0 && pc < this.cols) {
				ret.push(this.m[pr][pc].food);
			}
		}
		return ret;
	}
}