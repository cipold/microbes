class Events {
	static init(core, interactive) {
		window.addEventListener('resize', function () {
			core.onResize();
		});
		interactive.addEventListener('mousedown', function (event) {
			event.preventDefault();
			core.onMouseDown(event);
		});
		interactive.addEventListener('mousemove', function (event) {
			event.preventDefault();
			core.onMouseMove(event);
		});
		interactive.addEventListener('mouseup', function (event) {
			event.preventDefault();
			core.onMouseUp();
		});
		interactive.addEventListener('mouseout', function (event) {
			event.preventDefault();
			core.onMouseOut();
		});
		interactive.addEventListener('touchstart', function (event) {
			event.preventDefault();
			core.onTouchStart(event.changedTouches);
		});
		interactive.addEventListener('touchmove', function (event) {
			event.preventDefault();
			core.onTouchMove(event.changedTouches);
		});
		interactive.addEventListener('touchend', function (event) {
			event.preventDefault();
			core.onTouchEnd(event.changedTouches);
		});
		interactive.addEventListener('wheel', function (event) {
			event.preventDefault();
			core.onMouseWheel(event);
		});
		window.addEventListener('keydown', function (event) {
			// event.preventDefault();
			core.onKeyPress(event.key);
		});

		function fullScreenChange() {
			const doc = window.document;
			core.onFullScreenChange(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
		}

		document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
		document.addEventListener('mozfullscreenchange', fullScreenChange, false);
		document.addEventListener('fullscreenchange', fullScreenChange, false);
		document.addEventListener('MSFullscreenChange', fullScreenChange, false);
	}
}