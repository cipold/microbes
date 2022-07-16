import {Core} from "./core";

export class Events {
	static init(core: Core, interactive: HTMLCanvasElement) {
		window.addEventListener('resize', function () {
			core.onResize();
		});
		interactive.addEventListener('mousedown', function (event: MouseEvent) {
			event.preventDefault();
			core.onMouseDown(event);
		});
		interactive.addEventListener('mousemove', function (event: MouseEvent) {
			event.preventDefault();
			core.onMouseMove(event);
		});
		interactive.addEventListener('mouseup', function (event: Event) {
			event.preventDefault();
			core.onMouseUp();
		});
		interactive.addEventListener('mouseout', function (event: Event) {
			event.preventDefault();
			core.onMouseOut();
		});
		interactive.addEventListener('touchstart', function (event: TouchEvent) {
			event.preventDefault();
			core.onTouchStart(event.changedTouches);
		});
		interactive.addEventListener('touchmove', function (event: TouchEvent) {
			event.preventDefault();
			core.onTouchMove(event.changedTouches);
		});
		interactive.addEventListener('touchend', function (event: TouchEvent) {
			event.preventDefault();
			core.onTouchEnd(event.changedTouches);
		});
		interactive.addEventListener('wheel', function (event: Event) {
			event.preventDefault();
			core.onMouseWheel(event);
		});
		window.addEventListener('keydown', function (event: KeyboardEvent) {
			// event.preventDefault();
			core.onKeyPress(event.key);
		});

		function fullScreenChange() {
			core.onFullScreenChange(!!window.document.fullscreenElement);
		}

		document.addEventListener('fullscreenchange', fullScreenChange, false);
	}
}
