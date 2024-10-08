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
		this.removeClasses(this.exitClass);
		this.removeClasses(this.exitFromClass);
		this.removeClasses(this.exitToClass);

		this.removeAttribute("hidden");

		this.applyClasses(this.enterClass, this.enterFromClass);

		requestAnimationFrame(() => {
			this.removeClass(this.enterFromClass);
			this.applyClass(this.enterToClass);
		});

		setTimeout(
			() =>
				this.dispatchEvent(
					new CustomEvent("change", { detail: { state: "entered" } }),
				),
			this.getTransitionDuration(),
		);
	}

	exit() {
		this.removeClasses(this.enterClass);
		this.removeClasses(this.enterFromClass);
		this.removeClasses(this.enterToClass);

		this.applyClasses(this.exitClass, this.exitFromClass);

		requestAnimationFrame(() => {
			this.removeClass(this.exitFromClass);
			this.applyClass(this.exitToClass);

			setTimeout(
				() =>
					this.dispatchEvent(
						new CustomEvent("change", { detail: { state: "exited" } }),
					),
				this.getTransitionDuration(),
			);
		});
	}

	private addClasses(classNames: string) {
		this.classList.add(...classNames.split(" ").filter(Boolean));
	}

	private removeClasses(classNames: string) {
		this.classList.remove(...classNames.split(" ").filter(Boolean));
	}

	private applyClasses(...classList: string[]) {
		for (const cls of classList) this.addClasses(cls);
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
