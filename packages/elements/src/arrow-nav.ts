class HyperkitArrowNav extends HTMLElement {
	private focusableElements: HTMLElement[] = [];

	connectedCallback() {
		this.initializeFocusableElements();
		this.attachArrowKeyListener();
	}

	private initializeFocusableElements() {
		this.focusableElements = Array.from(
			this.querySelectorAll<HTMLElement>("a, button, [tabindex]"),
		).filter(
			(el) =>
				!el.hasAttribute("disabled") &&
				!el.getAttribute("tabindex")?.startsWith("-"),
		);

		if (this.focusableElements.length === 0) {
			console.error("No focusable elements found inside <hyperkit-arrow-nav>");
			throw new Error("Missing focusable elements");
		}
	}

	private attachArrowKeyListener() {
		this.addEventListener("keydown", (event: KeyboardEvent) => {
			const activeElement = document.activeElement as HTMLElement;

			// Only proceed if the focused element is inside <hyperkit-arrow-nav>
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

		// If nothing is focused or the index is out of bounds, do nothing
		if (currentIndex === -1) return;

		// Prevent moving up when the first element is focused
		if (currentIndex === 0 && direction === -1) return;

		// Prevent moving down when the last element is focused
		if (currentIndex === this.focusableElements.length - 1 && direction === 1)
			return;

		const nextIndex = currentIndex + direction;
		this.focusableElements[nextIndex]?.focus();
	}
}

if (!customElements.get("hyperkit-arrow-nav"))
	customElements.define("hyperkit-arrow-nav", HyperkitArrowNav);
