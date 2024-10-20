import { HyperkitElement } from "./hyperkit-element";

export class HyperkitArrowNav extends HyperkitElement {
	public requiredChildren = ["a, button, [tabindex]"];
	private focusableElements: HTMLElement[] = [];

	connectedCallback() {
		super.connectedCallback();
		this.initializeElements();
		this.attachArrowKeyListener();
	}

	private initializeElements() {
		this.focusableElements = Array.from(
			this.querySelectorAll<HTMLElement>("a, button, [tabindex]"),
		).filter(
			(el) =>
				!el.hasAttribute("disabled") &&
				!el.getAttribute("tabindex")?.startsWith("-"),
		);
	}

	private attachArrowKeyListener() {
		this.addEventListener("keydown", (event: KeyboardEvent) => {
			const activeElement = document.activeElement as HTMLElement;

			if (!this.focusableElements.includes(activeElement)) return;

			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				event.preventDefault();
				this.moveFocus(event.key === "ArrowUp" ? -1 : 1);
			}
		});
	}

	private moveFocus(direction: number) {
		const activeElement = document.activeElement as HTMLElement;
		const currentIndex = this.focusableElements.indexOf(activeElement);

		if (currentIndex === -1) return;

		if (currentIndex === 0 && direction === -1) return;

		if (currentIndex === this.focusableElements.length - 1 && direction === 1)
			return;

		const nextIndex = currentIndex + direction;
		this.focusableElements[nextIndex]?.focus();
	}
}

if (!customElements.get("hyperkit-arrow-nav"))
	customElements.define("hyperkit-arrow-nav", HyperkitArrowNav);
