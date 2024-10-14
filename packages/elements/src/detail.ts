import { HyperkitElement } from "./hyperkit-element";
import type { HyperkitTransition } from "./transition";

class HyperkitDetail extends HyperkitElement<{
	events: { type: "show" } | { type: "hide" };
}> {
	public requiredChildren = ["h7-detail-trigger", "h7-detail-content"];

	private triggerElement: HTMLElement | null = null;
	private contentElement: HTMLElement | null = null;
	private button?: HTMLButtonElement | null = null;
	private clickListenerAdded = false;

	connectedCallback() {
		super.connectedCallback();
		this.initializeElements();
		this.setInitialVisibility();
	}

	private initializeElements() {
		this.contentElement?.setAttribute(
			"aria-hidden",
			this.contentElement.hasAttribute("hidden") ? "true" : "false",
		);

		this.button =
			this.triggerElement?.querySelector<HTMLButtonElement>("button");

		if (!this.clickListenerAdded) {
			this.button?.addEventListener("click", (event) => {
				event.stopPropagation();
				this.toggleContent();
			});
			this.clickListenerAdded = true;
		}
	}

	private setInitialVisibility() {
		this.setVisible(!this.hidden);
	}

	public get hidden(): boolean {
		return this.contentElement?.hasAttribute("hidden") ?? false;
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

		if (transitionElement) {
			transitionElement.exit();
			transitionElement.on(
				"exit",
				() => {
					this.contentElement?.setAttribute("hidden", "");
					this.contentElement?.setAttribute("aria-hidden", "true");
				},
				{ once: true },
			);
		} else {
			this.contentElement.setAttribute("hidden", "");
			this.contentElement.setAttribute("aria-hidden", "true");
		}

		this.setVisible(false);
	}

	private setVisible(visible: boolean) {
		if (this.button) {
			if (visible) {
				this.fire("show");
				this.button.setAttribute("data-visible", "true");
			} else {
				this.fire("hide");
				this.button.removeAttribute("data-visible");
			}
		}
	}
}

if (!customElements.get("hyperkit-detail")) {
	customElements.define("hyperkit-detail", HyperkitDetail);
}

class HyperkitAccordion extends HyperkitElement {
	public requiredChildren = ["hyperkit-detail"];
	private details: HyperkitDetail[] = [];

	connectedCallback() {
		super.connectedCallback();
		this.initializeDetails();
	}

	private initializeDetails() {
		for (const detail of this.details)
			detail.on("show", () => this.closeOtherDetails(detail));

		for (const [index, detail] of this.details.entries())
			index !== 0 ? detail.hide() : detail.show();
	}

	private closeOtherDetails(openDetail: HyperkitDetail) {
		for (const detail of this.details) {
			if (detail !== openDetail && !detail.hidden) detail.hide();
		}
	}
}

if (!customElements.get("hyperkit-accordion"))
	customElements.define("hyperkit-accordion", HyperkitAccordion);
