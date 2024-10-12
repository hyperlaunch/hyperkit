import type { HyperkitTransition } from "./transition";

export class HyperkitElement extends HTMLElement {
	protected logError(message: string): void {
		console.error(message, this);
	}

	protected dispatchEventCustom(eventName: string, detail: any): void {
		this.dispatchEvent(new CustomEvent(eventName, { detail }));
	}

	protected enter(): void {
		const transitionElement = this.querySelector(
			"hyperkit-transition",
		) as HyperkitTransition | null;

		if (transitionElement) {
			transitionElement.enter();
			return;
		}

		if (this.hasAttribute("hidden")) {
			this.removeAttribute("hidden");
		}

		const transitionDuration = this.getTransitionDuration(this);
		this.applyClasses("enter-active");

		requestAnimationFrame(() => {
			this.applyClasses("enter-to");
			this.removeClasses("enter-active");
		});

		setTimeout(() => {
			this.removeClasses("enter-to");
			this.dispatchEventCustom("enter", { state: "entered" });
		}, transitionDuration);
	}

	protected exit(): void {
		const transitionElement = this.querySelector(
			"hyperkit-transition",
		) as HyperkitTransition | null;

		if (transitionElement) {
			transitionElement.exit();
			return;
		}

		this.applyClasses("exit-active");

		requestAnimationFrame(() => {
			this.applyClasses("exit-to");
			this.removeClasses("exit-active");
		});

		const transitionDuration = this.getTransitionDuration(this);

		setTimeout(() => {
			this.setAttribute("hidden", "");
			this.removeClasses("exit-to");
			this.dispatchEventCustom("exit", { state: "exited" });
		}, transitionDuration);
	}

	protected getTransitionDuration(element: HTMLElement): number {
		const duration = window
			.getComputedStyle(element)
			.getPropertyValue("transition-duration");
		return Number.parseFloat(duration) * 1000;
	}

	protected applyClasses(...classList: string[]): void {
		this.classList.add(...classList.filter(Boolean));
	}

	protected removeClasses(...classList: string[]): void {
		this.classList.remove(...classList.filter(Boolean));
	}

	protected handleRequiredElement(tagName: string): HTMLElement | null {
		const element = this.querySelector(tagName);
		if (!element) {
			this.logError(`Missing required <${tagName}> element.`);
			throw new Error(`Missing <${tagName}> element.`);
		}
		return element;
	}
}
