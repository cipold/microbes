import {Core} from "./core";

export class Options {
	private readonly options: HTMLDivElement;
	private readonly btnCloseOptions: HTMLButtonElement;

	constructor(core: Core, optimized: boolean, debug: boolean) {
		this.options = document.createElement('div');
		this.options.style.display = 'none';
		this.options.innerHTML = '<h1>Options</h1>';
		this.options.id = 'options';
		document.body.appendChild(this.options);

		this.btnCloseOptions = document.createElement('button');
		this.btnCloseOptions.innerHTML = '<span class="material-icons">close</span>';
		this.btnCloseOptions.id = 'btnclose';
		const self = this;
		this.btnCloseOptions.addEventListener('click', function () {
			self.close();
		}, false);
		this.options.appendChild(this.btnCloseOptions);

		this.addToggle('Low Resolution', function (on: boolean) {
			core.setOptimization(on)
		}, optimized);
		this.addToggle('Debug Information', function (on: boolean) {
			core.setShowDebugInformation(on);
		}, debug);
	}

	addToggle(text: string, func: (on: boolean) => void, on: boolean) {
		const toggleOption: any = document.createElement('div');
		toggleOption.classList = 'optiontoggle';
		toggleOption.on = on;
		toggleOption.innerHTML = text;
		const toggle = document.createElement('div');
		toggle.classList.add('toggle');
		const btnOff = document.createElement('button');
		btnOff.innerHTML = 'off';
		btnOff.classList.add('btntoggle', 'btnoff');
		if (!on) btnOff.classList.add('active');
		toggle.appendChild(btnOff);
		const btnOn = document.createElement('button');
		btnOn.innerHTML = 'on';
		btnOn.classList.add('btntoggle', 'btnon');
		if (on) btnOn.classList.add('active');
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
