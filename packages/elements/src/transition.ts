import { HyperkitElement } from "./hyperkit-element";

export class HyperkitTransition extends HyperkitElement<{
	events: { type: "enter" } | { type: "exit" };
	propagatedEvents: undefined;
	propTypes: {
		"enter-class": "string";
		"enter-from-class": "string";
		"enter-to-class": "string";
		"exit-class": "string";
		"exit-from-class": "string";
		"exit-to-class": "string";
		"enter-on-connect": "boolean";
	};
}> {
	public propTypes = {
		"enter-class": "string",
		"enter-from-class": "string",
		"enter-to-class": "string",
		"exit-class": "string",
		"exit-from-class": "string",
		"exit-to-class": "string",
		"enter-on-connect": "boolean",
	} as const;

	connectedCallback() {
		if (this.prop("enter-on-connect")) this.enter();
	}

	enter() {
		this.removeClasses(this.prop("exit-class"));
		this.removeClasses(this.prop("exit-from-class"));
		this.removeClasses(this.prop("exit-to-class"));

		this.removeAttribute("hidden");

		this.applyClasses(this.prop("enter-class"), this.prop("enter-from-class"));

		requestAnimationFrame(() => {
			this.removeClass(this.prop("enter-from-class"));
			this.applyClass(this.prop("enter-to-class"));
		});

		setTimeout(() => this.fire("enter"), this.getTransitionDuration());
	}

	exit() {
		this.removeClasses(this.prop("enter-class"));
		this.removeClasses(this.prop("enter-from-class"));
		this.removeClasses(this.prop("enter-to-class"));

		this.applyClasses(this.prop("exit-class"), this.prop("exit-from-class"));

		requestAnimationFrame(() => {
			this.removeClass(this.prop("exit-from-class"));
			this.applyClass(this.prop("exit-to-class"));

			setTimeout(() => this.fire("exit"), this.getTransitionDuration());
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
