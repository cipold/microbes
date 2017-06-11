// Returns uniformly spread random coordinate in circle around x, y
function randomPointInCircle(x, y, radius) {
	const distance = Math.sqrt(Math.random()) * radius;
	const angle = Math.random() * 2 * Math.PI;
	return {
		x: x + distance * Math.cos(angle),
		y: y + distance * Math.sin(angle)
	};
}

function toggleFullScreen() {
	const doc = window.document;
	const docEl = doc.documentElement;

	if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		requestFullScreen.call(docEl);
	} else {
		const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
		cancelFullScreen.call(doc);
	}
}