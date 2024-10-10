import type { HyperkitTransition } from "./transition";

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

class HyperkitDetail extends HTMLElement {
	private triggerElement: HTMLElement | null = null;
	private contentElement: HTMLElement | null = null;
	private button?: HTMLButtonElement | null = null;
	private clickListenerAdded = false;

	connectedCallback() {
		this.validateStructure();
		this.initializeElements();
		this.setInitialVisibility();
	}

	private validateStructure() {
		this.triggerElement = this.querySelector("hk-detail-trigger");
		this.contentElement = this.querySelector("hk-detail-content");

		if (!this.triggerElement || !this.contentElement)
			throw new MissingTagError("hk-detail-trigger or hk-detail-content");
	}

	private initializeElements() {
		if (!this.contentElement) {
			throw new MissingTagError("hk-detail-content");
		}

		if (!this.contentElement.hasAttribute("hidden")) {
			this.contentElement.setAttribute("hidden", "");
		}

		this.contentElement.setAttribute("aria-hidden", "true");

		this.button =
			this.triggerElement?.querySelector<HTMLButtonElement>("button");

		if (!this.button)
			throw new MissingTagError("button inside hk-detail-trigger");

		if (!this.clickListenerAdded) {
			this.button.addEventListener("click", (event) => {
				event.stopPropagation();
				this.toggleContent();
			});
			this.clickListenerAdded = true;
		}
	}

	private setInitialVisibility() {
		!this.hidden ? this.setVisible(true) : this.setVisible(false);
	}

	public get hidden(): boolean {
		return this.contentElement?.hasAttribute("hidden") ?? true;
	}

	private toggleContent() {
		this.hidden ? this.show() : this.hide();
	}

	public show() {
		if (!this.contentElement) return;

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		this.contentElement.removeAttribute("hidden");
		this.contentElement.setAttribute("aria-hidden", "false");

		if (transitionElement) transitionElement.enter();

		this.setVisible(true);
	}

	public hide() {
		if (!this.contentElement) return;

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		this.contentElement.setAttribute("hidden", "");
		this.contentElement.setAttribute("aria-hidden", "true");

		if (transitionElement) transitionElement.exit();

		this.setVisible(false);
	}

	private setVisible(visible: boolean) {
		if (this.triggerElement) {
			if (visible) {
				this.triggerElement.setAttribute("data-visible", "true");
			} else {
				this.triggerElement.removeAttribute("data-visible");
			}
		}
		this.dispatchEvent(new CustomEvent("change", { detail: { visible } }));
	}
}

if (!customElements.get("hyperkit-detail")) {
	customElements.define("hyperkit-detail", HyperkitDetail);
}

class HyperkitAccordion extends HTMLElement {
	private details: HyperkitDetail[] = [];

	connectedCallback() {
		this.initializeDetails();
	}

	private initializeDetails() {
		this.details = Array.from(
			this.querySelectorAll<HyperkitDetail>("hyperkit-detail"),
		);

		for (const detail of this.details)
			detail.addEventListener("change", (event) => {
				const customEvent = event as CustomEvent<{
					visible: boolean;
				}>;
				if (customEvent.detail.visible) this.closeOtherDetails(detail);
			});

		for (const [index, detail] of this.details.entries()) {
			index !== 0 ? detail.hide() : detail.show();
		}
	}

	private closeOtherDetails(openDetail: HyperkitDetail) {
		for (const detail of this.details) {
			if (detail !== openDetail && !detail.hidden) detail.hide();
		}
	}
}

if (!customElements.get("hyperkit-accordion"))
	customElements.define("hyperkit-accordion", HyperkitAccordion);
