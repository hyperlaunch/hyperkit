import type { HyperkitTransition } from "./transition";

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

class HyperkitPopover extends HTMLElement {
	private triggerButton: HTMLButtonElement | null = null;
	private contentElement: HTMLElement | null = null;

	public connectedCallback() {
		this.validateStructure();
		this.initializeElements();
		this.setupPopover();
		this.attachOutsideClickListener();
		this.attachEscapeKeyListener();
		this.setInitialVisibility();
	}

	public get hidden() {
		return this.contentElement?.hasAttribute("hidden") ?? true;
	}

	private getButtonForTrigger() {
		const triggerElement = this.querySelector("hk-popover-trigger");
		if (!triggerElement) {
			console.error("hk-popover-trigger tag is missing in the markup");
			throw new MissingTagError("hk-popover-trigger");
		}

		const button = triggerElement.querySelector<HTMLButtonElement>("button");
		if (!button) {
			console.error("Button element is missing inside hk-popover-trigger");
			throw new MissingTagError("button inside hk-popover-trigger");
		}

		return button;
	}

	private getContentElement() {
		const contentElement =
			this.querySelector<HTMLElement>("hk-popover-content");
		if (!contentElement) {
			console.error("hk-popover-content tag is missing in the markup");
			throw new MissingTagError("hk-popover-content");
		}

		return contentElement;
	}

	private validateStructure() {
		this.triggerButton = this.getButtonForTrigger();
		this.contentElement = this.getContentElement();
	}

	private initializeElements() {
		if (!this.triggerButton || !this.contentElement) {
			console.error(
				"Initialization failed: Missing button or content element.",
			);
			return;
		}

		this.triggerButton.setAttribute("aria-expanded", "false");
		this.triggerButton.setAttribute(
			"aria-controls",
			this.contentElement.id || "popoverContent",
		);

		this.contentElement.setAttribute("aria-hidden", "true");
		this.contentElement.id = this.contentElement.id || "popoverContent";
	}

	private setupPopover() {
		if (this.triggerButton && this.contentElement) {
			this.triggerButton.addEventListener("click", () =>
				this.hidden ? this.show() : this.hide(),
			);
		}
	}

	private setInitialVisibility() {
		if (!this.hidden) {
			this.triggerButton?.setAttribute("data-visible", "true");
			this.triggerButton?.setAttribute("aria-expanded", "true");
		}
	}

	public show() {
		if (!this.contentElement || !this.triggerButton) return;

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			this.contentElement.removeAttribute("hidden");
			this.contentElement.setAttribute("aria-hidden", "false");
			transitionElement.enter();
		} else {
			this.contentElement.removeAttribute("hidden");
			this.contentElement.setAttribute("aria-hidden", "false");
		}

		this.triggerButton.setAttribute("aria-expanded", "true");
		this.triggerButton.setAttribute("data-visible", "true");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: true } }),
		);
	}

	public hide() {
		if (!this.contentElement || !this.triggerButton) return;

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			transitionElement.exit();
			transitionElement.addEventListener(
				"change",
				(event) => {
					const customEvent = event as CustomEvent<{
						state: "entered" | "exited";
					}>;
					if (customEvent.detail.state === "exited") {
						this.contentElement?.setAttribute("hidden", "");
						this.contentElement?.setAttribute("aria-hidden", "true");
					}
				},
				{ once: true },
			);
		} else {
			this.contentElement.setAttribute("hidden", "");
			this.contentElement.setAttribute("aria-hidden", "true");
		}

		this.triggerButton.setAttribute("aria-expanded", "false");
		this.triggerButton.removeAttribute("data-visible");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: false } }),
		);
	}

	private attachOutsideClickListener() {
		document.addEventListener(
			"click",
			(event) =>
				!this.contains(event.target as Node) && !this.hidden && this.hide(),
		);
	}

	private attachEscapeKeyListener() {
		document.addEventListener(
			"keydown",
			(event) => event.key === "Escape" && !this.hidden && this.hide(),
		);
	}
}

if (!customElements.get("hyperkit-popover"))
	customElements.define("hyperkit-popover", HyperkitPopover);

class ChildElement extends HTMLElement {
	connectedCallback() {
		if (!this.closest("hyperkit-popover")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside hyperkit-popover`,
				this,
			);
		}
	}
}

for (const tag of ["hk-popover-trigger", "hk-popover-content"]) {
	if (!customElements.get(tag))
		customElements.define(tag, class extends ChildElement {});
}
