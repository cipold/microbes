class Options {
	constructor(core, optimized, debug) {
		this.options = document.createElement('div');
		this.options.style.display = 'none';
		this.options.innerHTML = '<h1>Options</h1>';
		this.options.id = 'options';
		document.body.appendChild(this.options);

		this.btnCloseOptions = document.createElement('button');
		this.btnCloseOptions.innerHTML = '<i class="material-icons">close</i>';
		this.btnCloseOptions.id = 'btnclose';
		const self = this;
		this.btnCloseOptions.addEventListener('click', function () {
			self.close();
		}, false);
		this.options.appendChild(this.btnCloseOptions);

		this.addToggle('Low Resolution', function (on) {
			core.setOptimization(on)
		}, optimized);
		this.addToggle('Debug Information', function (on) {
			core.setShowDebugInformation(on);
		}, debug);
	}

	addToggle(text, func, on) {
		const toggleOption = document.createElement('div');
		toggleOption.classList = 'optiontoggle';
		toggleOption.on = on;
		toggleOption.innerHTML = text;
		const toggle = document.createElement('div');
		toggle.classList = 'toggle';
		const btnOff = document.createElement('button');
		btnOff.innerHTML = 'off';
		btnOff.classList = 'btntoggle btnoff' + (!on ? ' active' : '');
		toggle.appendChild(btnOff);
		const btnOn = document.createElement('button');
		btnOn.innerHTML = 'on';
		btnOn.classList = 'btntoggle btnon' + (on ? ' active' : '');
		toggle.appendChild(btnOn);
		toggleOption.appendChild(toggle);
		toggleOption.addEventListener('click', function () {
			toggleOption.on = !toggleOption.on;
			if (toggleOption.on) {
				btnOff.classList.remove('active');
				btnOn.classList.add('active');
			} else {
				btnOff.classList.add('active');
				btnOn.classList.remove('active');
			}
			func(toggleOption.on);
		}, false);
		this.options.appendChild(toggleOption);
		return toggleOption;
	}

	open() {
		this.options.style.display = 'inline-block';
	}

	close() {
		this.options.style.display = 'none';
	}

	isOpen() {
		return this.options.style.display !== 'none';
	}

	toggle() {
		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	}
}