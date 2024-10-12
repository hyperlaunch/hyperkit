import MissingTagError from "./missing-tag-error";
import type { HyperkitTransition } from "./transition";

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

		if (!this.triggerElement) {
			console.error("Missing <hk-detail-trigger> in <hyperkit-detail>", this);
			throw new MissingTagError("hk-detail-trigger");
		}

		if (!this.contentElement) {
			console.error("Missing <hk-detail-content> in <hyperkit-detail>", this);
			throw new MissingTagError("hk-detail-content");
		}
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

		this.setVisible(false);
	}

	private setVisible(visible: boolean) {
		if (this.button) {
			if (visible) {
				this.button.setAttribute("data-visible", "true");
			} else {
				this.button.removeAttribute("data-visible");
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
		this.validateStructure();
		this.initializeDetails();
	}

	private validateStructure() {
		this.details = Array.from(
			this.querySelectorAll<HyperkitDetail>("hyperkit-detail"),
		);

		if (this.details.length === 0) {
			console.error(
				"No <hyperkit-detail> elements found in <hyperkit-accordion>",
				this,
			);
			throw new MissingTagError("hyperkit-detail");
		}
	}

	private initializeDetails() {
		for (const detail of this.details) {
			detail.addEventListener("change", (event) => {
				const customEvent = event as CustomEvent<{ visible: boolean }>;
				if (customEvent.detail.visible) this.closeOtherDetails(detail);
			});
		}

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
