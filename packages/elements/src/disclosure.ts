import type { HyperkitTransition } from "./transition";

class MissingDisclosureHeaderError extends Error {
	constructor() {
		super("<hk-disclosure-item> is missing a <hk-disclosure-header>.");
		this.name = "MissingDisclosureHeaderError";
	}
}

class MissingDisclosureContentError extends Error {
	constructor() {
		super("<hk-disclosure-item> is missing a <hk-disclosure-content>.");
		this.name = "MissingDisclosureContentError";
	}
}

class HyperkitDisclosure extends HTMLElement {
	private items: HTMLElement[] = [];

	connectedCallback() {
		this.initializeItems();
	}

	private initializeItems() {
		this.items = Array.from(this.querySelectorAll("hk-disclosure-item"));

		for (const item of this.items) {
			const header = item.querySelector<HTMLElement>("hk-disclosure-header");
			const content = item.querySelector<HTMLElement>("hk-disclosure-content");

			if (!header) {
				console.error(
					"<hk-disclosure-item> is missing a <hk-disclosure-header>",
					item,
				);
				throw new MissingDisclosureHeaderError();
			}

			if (!content) {
				console.error(
					"<hk-disclosure-item> is missing a <hk-disclosure-content>",
					item,
				);
				throw new MissingDisclosureContentError();
			}

			header.addEventListener("click", () => this.toggleContent({ content }));
		}
	}

	public show(item: HTMLElement) {
		const content = item.querySelector<HTMLElement>("hk-disclosure-content");
		if (!content) return;

		this.toggleContent({ content, forceOpen: true });
	}

	public hide(item: HTMLElement) {
		const content = item.querySelector<HTMLElement>("hk-disclosure-content");
		if (!content) return;

		this.toggleContent({ content, forceOpen: false });
	}

	private toggleContent({
		content,
		forceOpen,
	}: {
		content: HTMLElement;
		forceOpen?: boolean;
	}) {
		const transitionElement = content.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);

		const isHidden = content.hasAttribute("hidden");
		const shouldOpen = forceOpen === undefined ? isHidden : forceOpen;

		if (!transitionElement) {
			shouldOpen
				? content.removeAttribute("hidden")
				: content.setAttribute("hidden", "");
			return;
		}

		if (shouldOpen) {
			content.removeAttribute("hidden");
			transitionElement.enter();
			return;
		}

		transitionElement.exit();
		transitionElement.addEventListener(
			"change",
			(event) => {
				const customEvent = event as CustomEvent<{
					state: "entered" | "exited";
				}>;
				if (customEvent.detail.state === "exited") {
					content.setAttribute("hidden", "");
				}
			},
			{ once: true },
		);
	}
}

if (!customElements.get("hyperkit-disclosure")) {
	customElements.define("hyperkit-disclosure", HyperkitDisclosure);
}
