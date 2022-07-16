export class FramePolicy {
	static getFrames(timeSinceLastUpdate: number, regularTimeDiff: number, timeFactor: number) {
		const frames = Math.round(timeSinceLastUpdate / regularTimeDiff);

		if (frames > 1) {
			const framesSkipped = frames - 1;
			if (framesSkipped > 5 * timeFactor) {
				// Major pause, do not catch up frames
				return {
					framesSkipped: 0,
					timeDiffRemainder: regularTimeDiff
				};
			} else {
				// Minor gap, catch up frames
				return {
					framesSkipped: framesSkipped,
					timeDiffRemainder: timeSinceLastUpdate - framesSkipped * regularTimeDiff
				};
			}
		} else {
			// Everything perfectly in time
			return {
				framesSkipped: 0,
				timeDiffRemainder: timeSinceLastUpdate
			};
		}
	}
}
