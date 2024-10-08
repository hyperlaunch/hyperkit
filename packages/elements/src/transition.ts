export class HyperkitTransition extends HTMLElement {
	private enterClass = this.getAttribute("enter-class") ?? "";
	private enterFromClass = this.getAttribute("enter-from-class") ?? "";
	private enterToClass = this.getAttribute("enter-to-class") ?? "";
	private exitClass = this.getAttribute("exit-class") ?? "";
	private exitFromClass = this.getAttribute("exit-from-class") ?? "";
	private exitToClass = this.getAttribute("exit-to-class") ?? "";

	connectedCallback() {
		if (this.hasAttribute("enter-on-connect")) this.enter();
	}

	enter() {
		// Clean up any exit-related classes before starting the enter transition
		this.removeClasses(this.exitClass);
		this.removeClasses(this.exitFromClass);
		this.removeClasses(this.exitToClass);

		// Ensure the element is visible
		this.removeAttribute("hidden");

		// Apply initial classes for the start of the enter transition
		this.applyClasses(this.enterClass, this.enterFromClass);

		// Proceed with the transition
		requestAnimationFrame(() => {
			this.removeClass(this.enterFromClass);
			this.applyClass(this.enterToClass);
		});

		setTimeout(() => {
			this.dispatchEvent(
				new CustomEvent("change", { detail: { state: "entered" } }),
			);
		}, this.getTransitionDuration());
	}

	exit() {
		// Clean up any enter-related classes before starting the exit transition
		this.removeClasses(this.enterClass);
		this.removeClasses(this.enterFromClass);
		this.removeClasses(this.enterToClass);

		// Apply initial classes for the start of the exit transition
		this.applyClasses(this.exitClass, this.exitFromClass);

		// Proceed with the transition
		requestAnimationFrame(() => {
			this.removeClass(this.exitFromClass);
			this.applyClass(this.exitToClass);

			setTimeout(() => {
				this.dispatchEvent(
					new CustomEvent("change", { detail: { state: "exited" } }),
				);
			}, this.getTransitionDuration());
		});
	}

	private addClasses(classNames: string) {
		this.classList.add(...classNames.split(" ").filter(Boolean));
	}

	private removeClasses(classNames: string) {
		this.classList.remove(...classNames.split(" ").filter(Boolean));
	}

	private applyClasses(...classList: string[]) {
		for (const cls of classList) {
			this.addClasses(cls);
		}
	}

	private applyClass(className: string) {
		this.addClasses(className);
	}

	private removeClass(className: string) {
		this.removeClasses(className);
	}

	private getTransitionDuration() {
		const duration = window
			.getComputedStyle(this)
			.getPropertyValue("transition-duration");
		return Number.parseFloat(duration) * 1000;
	}
}

if (!customElements.get("hyperkit-transition"))
	customElements.define("hyperkit-transition", HyperkitTransition);
