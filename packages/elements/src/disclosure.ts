import type { HyperkitTransition } from "./transition";

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

export class HyperkitDisclosure extends HTMLElement {
	private items: DisclosureItemElement[] = [];
	private accordion = false;

	connectedCallback() {
		this.accordion = this.hasAttribute("accordion");
		this.validateStructure();
		this.initializeItems();
		this.validateInitialVisibility();
	}

	private validateStructure() {
		const items =
			this.querySelectorAll<DisclosureItemElement>("hk-disclosure-item");

		if (!items.length) {
			console.error(
				"hyperkit-disclosure must include at least one hk-disclosure-item",
			);
			throw new MissingTagError("hk-disclosure-item");
		}

		this.items = Array.from(items);
	}

	private initializeItems() {
		for (const item of this.items) {
			item.initialize(this);
		}
	}

	private validateInitialVisibility() {
		if (this.accordion) {
			const visibleItems = this.items.filter((item) => !item.hidden);

			if (visibleItems.length > 1) {
				console.warn(
					"Only one disclosure item should be visible at a time when the accordion attribute is set.",
				);
				for (const item of visibleItems.slice(1)) item.hide();
			}
		}
	}

	public show(item: DisclosureItemElement) {
		if (this.accordion) {
			for (const otherItem of this.items) {
				if (otherItem !== item && !otherItem.hidden) {
					otherItem.hide();
				}
			}
		}
		item.show();
	}

	public hide(item: DisclosureItemElement) {
		item.hide();
	}
}

if (!customElements.get("hyperkit-disclosure"))
	customElements.define("hyperkit-disclosure", HyperkitDisclosure);

class ChildElement extends HTMLElement {
	connectedCallback() {
		if (!this.closest("hk-disclosure-item")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hk-disclosure-item>`,
				this,
			);
		}
	}
}

for (const tag of ["hk-disclosure-trigger", "hk-disclosure-content"]) {
	if (!customElements.get(tag))
		customElements.define(tag, class extends ChildElement {});
}

class DisclosureItemElement extends HTMLElement {
	private triggerElement: HTMLElement | null = null;
	private contentElement: HTMLElement | null = null;
	private disclosureParent: HyperkitDisclosure | null = null;

	connectedCallback() {
		if (!this.closest("hyperkit-disclosure")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-disclosure>`,
				this,
			);
		}

		this.triggerElement = this.querySelector("hk-disclosure-trigger");
		this.contentElement = this.querySelector("hk-disclosure-content");

		if (!this.triggerElement || !this.contentElement) {
			console.error(
				"<hk-disclosure-item> must include both <hk-disclosure-trigger> and <hk-disclosure-content>",
			);
			return;
		}

		this.initialize();
	}

	public initialize(disclosureParent?: HyperkitDisclosure) {
		this.disclosureParent =
			disclosureParent || this.closest("hyperkit-disclosure");

		const button = this.triggerElement?.querySelector("button");

		if (!button) {
			console.error("<hk-disclosure-trigger> must include a <button>");
			throw new MissingTagError("button inside hk-disclosure-trigger");
		}

		if (this.contentElement) {
			if (!this.contentElement.hasAttribute("hidden")) {
				this.contentElement.setAttribute("aria-hidden", "false");
				button.setAttribute("aria-expanded", "true");
				button.setAttribute("data-visible", "true");
			} else {
				this.contentElement.setAttribute("aria-hidden", "true");
				button.setAttribute("aria-expanded", "false");
				button.removeAttribute("data-visible");
			}

			button.addEventListener("click", () => {
				if (this.hidden) {
					this.disclosureParent?.show(this);
				} else {
					this.disclosureParent?.hide(this);
				}
			});

			button.setAttribute(
				"aria-controls",
				this.contentElement.id || "disclosureContent",
			);
			if (!this.contentElement.id) {
				this.contentElement.id = "disclosureContent";
			}
		}
	}

	public get hidden(): boolean {
		return this.contentElement?.hasAttribute("hidden") ?? false;
	}

	public show() {
		if (!this.triggerElement || !this.contentElement) return;

		const button = this.triggerElement.querySelector("button");
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

		button?.setAttribute("aria-expanded", "true");
		button?.setAttribute("data-visible", "true");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: true } }),
		);
	}

	public hide() {
		if (!this.triggerElement || !this.contentElement) return;

		const button = this.triggerElement.querySelector("button");
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

		button?.setAttribute("aria-expanded", "false");
		button?.removeAttribute("data-visible");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: false } }),
		);
	}
}

if (!customElements.get("hk-disclosure-item"))
	customElements.define("hk-disclosure-item", DisclosureItemElement);
