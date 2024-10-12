import MissingTagError from "./missing-tag-error";

export class HyperkitArrowNav extends HTMLElement {
	private focusableElements: HTMLElement[] = [];

	connectedCallback() {
		this.validateStructure();
		this.initializeElements();
		this.attachArrowKeyListener();
	}

	private validateStructure() {
		const focusableElements = this.querySelectorAll<HTMLElement>(
			"a, button, [tabindex]",
		);
		if (!focusableElements || focusableElements.length === 0) {
			console.error(
				"No focusable elements found inside <hyperkit-arrow-nav>",
				this,
			);
			throw new MissingTagError("a, button, [tabindex]");
		}
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
