import type { HyperkitTransition } from "./transition";

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

class DisclosureItemElement extends HTMLElement {
	public triggerElement: HTMLElement | null = null;
	public contentElement: HTMLElement | null = null;

	connectedCallback() {
		this.triggerElement = this.querySelector("hk-disclosure-trigger");
		this.contentElement = this.querySelector("hk-disclosure-content");

		if (!this.triggerElement || !this.contentElement) {
			console.error(
				"<hk-disclosure-item> must include both <hk-disclosure-trigger> and <hk-disclosure-content>",
			);
			throw new MissingTagError(
				"hk-disclosure-trigger or hk-disclosure-content",
			);
		}

		this.validateTrigger();
	}

	private validateTrigger() {
		const button = this.triggerElement?.querySelector("button");
		if (!button) {
			console.error("<hk-disclosure-trigger> must include a <button>");
			throw new MissingTagError("button inside hk-disclosure-trigger");
		}
	}
}

if (!customElements.get("hk-disclosure-item"))
	customElements.define("hk-disclosure-item", DisclosureItemElement);

export class HyperkitDisclosure extends HTMLElement {
	private items: DisclosureItemElement[] = [];
	private accordion = false;

	connectedCallback() {
		this.accordion = this.hasAttribute("accordion");
		this.setupItems();
		this.validateInitialVisibility();
	}

	private setupItems() {
		const items =
			this.querySelectorAll<DisclosureItemElement>("hk-disclosure-item");
		this.items = Array.from(items);

		if (!this.items.length) {
			console.error(
				"hyperkit-disclosure must include at least one hk-disclosure-item",
			);
			throw new MissingTagError("hk-disclosure-item");
		}

		for (const item of this.items) {
			this.setupTrigger(item);
			this.updateVisibility(item);
		}
	}

	private setupTrigger(item: DisclosureItemElement) {
		const button = item.triggerElement?.querySelector("button");

		if (button) {
			button.addEventListener("click", () =>
				item.contentElement?.hasAttribute("hidden")
					? this.show(item)
					: this.hide(item),
			);
		}
	}

	private validateInitialVisibility() {
		if (this.accordion) {
			const visibleItems = this.items.filter(
				(item) => !item.contentElement?.hasAttribute("hidden"),
			);

			if (visibleItems.length > 1) {
				console.warn(
					"Only one disclosure item should be visible at a time when the accordion attribute is set.",
				);
				for (const item of visibleItems.slice(1)) {
					this.hide(item);
				}
			}
		}
	}

	private updateVisibility(item: DisclosureItemElement) {
		const button = item.triggerElement?.querySelector("button");
		const content = item.contentElement;

		if (!button || !content) return;

		if (!content.hasAttribute("hidden")) {
			button.setAttribute("aria-expanded", "true");
			button.setAttribute("data-visible", "true");
		} else {
			button.setAttribute("aria-expanded", "false");
			button.removeAttribute("data-visible");
		}
	}

	public show(item: DisclosureItemElement) {
		const button = item.triggerElement?.querySelector("button");
		const content = item.contentElement;

		if (!button || !content) return;

		const transitionElement = content.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);

		if (this.accordion) {
			for (const otherItem of this.items)
				if (otherItem !== item) this.hide(otherItem);
		}

		content.removeAttribute("hidden");
		content.setAttribute("aria-hidden", "false");

		if (transitionElement) transitionElement.enter();

		button.setAttribute("aria-expanded", "true");
		button.setAttribute("data-visible", "true");

		item.dispatchEvent(
			new CustomEvent("change", { detail: { visible: true } }),
		);
	}

	public hide(item: DisclosureItemElement) {
		const button = item.triggerElement?.querySelector("button");
		const content = item.contentElement;

		if (!button || !content) return;

		const transitionElement = content.querySelector<HyperkitTransition>(
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
						content.setAttribute("hidden", "");
						content.setAttribute("aria-hidden", "true");
					}
				},
				{ once: true },
			);
		} else {
			content.setAttribute("hidden", "");
			content.setAttribute("aria-hidden", "true");
		}

		button.setAttribute("aria-expanded", "false");
		button.removeAttribute("data-visible");

		item.dispatchEvent(
			new CustomEvent("change", { detail: { visible: false } }),
		);
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
