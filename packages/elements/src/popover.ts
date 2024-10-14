import { HyperkitElement } from "./hyperkit-element";
import type { HyperkitTransition } from "./transition";

export class HyperkitPopover extends HyperkitElement<{
	events: { type: "show" } | { type: "hide" };
}> {
	private triggerButton?: HTMLButtonElement | null = null;
	private contentElement: HTMLElement | null = null;

	public connectedCallback() {
		super.connectedCallback();
		this.initializeElements();
		this.setupPopover();
		this.attachOutsideClickListener();
		this.attachEscapeKeyListener();
		this.setInitialVisibility();
	}

	private getButtonForTrigger() {
		const triggerElement = this.querySelector("h7-popover-trigger");

		if (!triggerElement) {
			console.error("h7-popover-trigger tag is missing in the markup", this);
		}

		const button = triggerElement?.querySelector<HTMLButtonElement>("button");
		if (!button) {
			console.error(
				"Button element is missing inside h7-popover-trigger",
				this,
			);
		}

		return button;
	}

	private getContentElement() {
		const contentElement =
			this.querySelector<HTMLElement>("h7-popover-content");
		if (!contentElement) {
			console.error("h7-popover-content tag is missing in the markup", this);
		}

		return contentElement;
	}

	private initializeElements() {
		this.triggerButton = this.getButtonForTrigger();
		this.contentElement = this.getContentElement();
		this.triggerButton?.setAttribute("aria-expanded", "false");
		this.triggerButton?.setAttribute(
			"aria-controls",
			this.contentElement?.id || "popoverContent",
		);

		this.contentElement?.setAttribute("aria-hidden", "true");

		if (this.contentElement) this.contentElement.id ||= "popoverContent";
	}

	private setupPopover() {
		this.triggerButton?.addEventListener("click", () => {
			this.contentElement?.hasAttribute("hidden") ? this.show() : this.hide();
		});
	}

	private setInitialVisibility() {
		if (this.contentElement?.hasAttribute("hidden")) {
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

		this.contentElement.removeAttribute("hidden");
		this.contentElement.setAttribute("aria-hidden", "false");

		if (transitionElement) {
			transitionElement.enter();
		}

		this.triggerButton.setAttribute("aria-expanded", "true");
		this.triggerButton.setAttribute("data-visible", "true");

		this.fire("show");
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

		this.fire("hide");
	}

	private attachOutsideClickListener() {
		document.addEventListener("click", (event) => {
			const isInsidePopover = this.contains(event.target as Node);
			if (!isInsidePopover) this.hide();
		});
	}

	private attachEscapeKeyListener() {
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") this.hide();
		});
	}
}

if (!customElements.get("hyperkit-popover"))
	customElements.define("hyperkit-popover", HyperkitPopover);

class ChildElement extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();
		if (!this.closest("hyperkit-popover")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-popover>`,
				this,
			);
		}
	}
}

if (!customElements.get("h7-popover-content"))
	customElements.define("h7-popover-content", class extends ChildElement {});

class PopoverTrigger extends ChildElement {
	public requiredChildren = ["button"];

	connectedCallback() {
		super.connectedCallback();
	}
}

if (!customElements.get("h7-popover-trigger"))
	customElements.define("h7-popover-trigger", class extends PopoverTrigger {});
