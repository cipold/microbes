import {Options} from "./options";
import {Core} from "./core";
import {toggleFullScreen} from "./helpers";

export class Overlay {
	private readonly options: Options;
	private readonly btnFullScreen: HTMLButtonElement;
	private readonly speedGroup: any;
	private readonly worldSizeGroup: HTMLDivElement;

	constructor(core: Core, optimized: boolean, debug: boolean) {
		this.options = new Options(core, optimized, debug);
		this.addOptionsButton(this.options);
		this.btnFullScreen = this.addFullScreenButton();
		this.speedGroup = this.addPlusMinusGroup(
			'slow_motion_video',
			core.timeFactor + 'x',
			'fast_forward',
			function (plus: boolean) {
				if (plus) {
					core.onIncreaseSpeed();
				} else {
					core.onDecreaseSpeed();
				}
			}
		);
		this.speedGroup.classList.add('bottomleft');
		this.worldSizeGroup = this.addPlusMinusGroup(
			'remove',
			'<span class="material-icons">public</span>',
			'add',
			function (plus: boolean) {
				if (plus) {
					core.onIncreaseSize();
				} else {
					core.onDecreaseSize()
				}
			}
		);
		this.worldSizeGroup.classList.add('bottomright');
	}

	addOptionsButton(options: Options) {
		const btnOptions = document.createElement('button');
		btnOptions.innerHTML = '<span class="material-icons">settings</span>';
		btnOptions.id = 'btnoptions';
		btnOptions.addEventListener('click', function () {
			options.toggle();
		}, false);
		document.body.appendChild(btnOptions);
		return btnOptions;
	}

	addFullScreenButton() {
		const btnFullScreen = document.createElement('button');
		btnFullScreen.innerHTML = '<span class="material-icons">fullscreen</span>';
		btnFullScreen.id = 'btnfullscreen';
		btnFullScreen.addEventListener('click', function () {
			toggleFullScreen();
		}, false);
		document.body.appendChild(btnFullScreen);
		return btnFullScreen;
	}

	addPlusMinusGroup(decreaseIcon: string, middleText: string, increaseIcon: string, func: (plus: boolean) => void) {
		const group: any = document.createElement('div');
		group.classList.add('plusminusgroup');
		const btnDecrease = document.createElement('button');
		btnDecrease.classList.add('btndecrease');
		btnDecrease.innerHTML = '<span class="material-icons">' + decreaseIcon + '</span>';
		btnDecrease.addEventListener('click', function () {
			func(false);
		}, false);
		group.appendChild(btnDecrease);
		const middle = document.createElement('div');
		middle.innerHTML = middleText;
		group.appendChild(middle);
		const btnIncrease = document.createElement('button');
		btnIncrease.classList.add('btnincrease');
		btnIncrease.innerHTML = '<span class="material-icons">' + increaseIcon + '</span>';
		btnIncrease.addEventListener('click', function () {
			func(true);
		}, false);
		group.appendChild(btnIncrease);
		group.setText = function (text: string) {
			middle.innerHTML = text;
		};
		document.body.appendChild(group);
		return group;
	}

	onFullScreenChange(isFullScreen: boolean) {
		if (isFullScreen) {
			this.btnFullScreen.innerHTML = '<span class="material-icons">fullscreen_exit</span>';
		} else {
			this.btnFullScreen.innerHTML = '<span class="material-icons">fullscreen</span>';
		}
	}

	setSpeed(speed: number) {
		this.speedGroup.setText(speed + 'x');
	}

	setWorldSize(_worldSize: number) {
		// Nothing to do
	}

	closeOptions() {
		this.options.close();
	}
}
