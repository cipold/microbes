class Information {
	constructor(averageCount) {
		// Number of elements for which the average is calculated
		this.averageCount = averageCount;

		// Value buffer
		this.values = [];
	}

	// Set the current value and reduce value array if required
	addValue(value) {
		this.values.push(value);

		if (this.values.length > this.averageCount) {
			this.values.shift();
		}
	}

	// Return buffer average value
	getAverage() {
		const l = this.values.length;
		if (l > 0) {
			return this.values.reduce(function (a, b) {
					return a + b;
				}) / l;
		} else {
			return 0;
		}
	}

	// Return buffer last - buffer first divided by length - 1
	getAverageDifference() {
		const l = this.values.length;
		if (l > 1) {
			return (this.values[l - 1] - this.values[0]) / (l - 1);
		} else {
			return 0;
		}
	}
}