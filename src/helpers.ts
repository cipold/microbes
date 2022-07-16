// Returns uniformly spread random coordinate in circle around x, y
export function randomPointInCircle(x: number, y: number, radius: number) {
	const distance = Math.sqrt(Math.random()) * radius;
	const angle = Math.random() * 2 * Math.PI;
	return {
		x: x + distance * Math.cos(angle),
		y: y + distance * Math.sin(angle)
	};
}

export function toggleFullScreen() {
	if (window.document.fullscreenElement) {
		window.document.exitFullscreen.call(window.document);
	} else {
		window.document.documentElement.requestFullscreen.call(window.document.documentElement);
	}
}
