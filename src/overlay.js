class Overlay {
	constructor(core, optimized, debug) {
		this.options = new Options(core, optimized, debug);
		this.btnOptions = this.addOptionsButton(this.options);
		this.btnFullScreen = this.addFullScreenButton();
		this.speedGroup = this.addPlusMinusGroup(
			'slow_motion_video',
			core.timeFactor + 'x',
			'fast_forward',
			function (plus) {
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
			'<i class="material-icons">public</i>',
			'add',
			function (plus) {
				if (plus) {
					core.onIncreaseSize();
				} else {
					core.onDecreaseSize()
				}
			}
		);
		this.worldSizeGroup.classList.add('bottomright');

	}

	addOptionsButton(options) {
		const btnOptions = document.createElement('button');
		btnOptions.innerHTML = '<i class="material-icons">settings</i>';
		btnOptions.id = 'btnoptions';
		btnOptions.addEventListener('click', function () {
			options.toggle();
		}, false);
		document.body.appendChild(btnOptions);
		return btnOptions;
	}

	addFullScreenButton() {
		const btnFullScreen = document.createElement('button');
		btnFullScreen.innerHTML = '<i class="material-icons">fullscreen</i>';
		btnFullScreen.id = 'btnfullscreen';
		btnFullScreen.addEventListener('click', function () {
			toggleFullScreen();
		}, false);
		document.body.appendChild(btnFullScreen);
		return btnFullScreen;
	}

	addPlusMinusGroup(decreaseIcon, middleText, increaseIcon, func) {
		const group = document.createElement('div');
		group.classList = 'plusminusgroup';
		const btnDecrease = document.createElement('button');
		btnDecrease.classList = 'btndecrease';
		btnDecrease.innerHTML = '<i class="material-icons">' + decreaseIcon + '</i>';
		btnDecrease.addEventListener('click', function () {
			func(false);
		}, false);
		group.appendChild(btnDecrease);
		const middle = document.createElement('div');
		middle.innerHTML = middleText;
		group.appendChild(middle);
		const btnIncrease = document.createElement('button');
		btnIncrease.classList = 'btnincrease';
		btnIncrease.innerHTML = '<i class="material-icons">' + increaseIcon + '</i>';
		btnIncrease.addEventListener('click', function () {
			func(true);
		}, false);
		group.appendChild(btnIncrease);
		group.setText = function (text) {
			middle.innerHTML = text;
		};
		document.body.appendChild(group);
		return group;
	}

	onFullScreenChange(isFullScreen) {
		if (isFullScreen) {
			this.btnFullScreen.innerHTML = '<i class="material-icons">fullscreen_exit</i>';
		} else {
			this.btnFullScreen.innerHTML = '<i class="material-icons">fullscreen</i>';
		}
	}

	setSpeed(speed) {
		this.speedGroup.setText(speed + 'x');
	}

	setWorldSize(worldSize) {
		// Nothing to do
	}

	closeOptions() {
		this.options.close();
	}
}