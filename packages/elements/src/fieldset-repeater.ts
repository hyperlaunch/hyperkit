import { HyperkitElement } from "./hyperkit-element";
import type { HyperkitSortableItem } from "./sortable";
import type { HyperkitTransition } from "./transition";

export class HyperkitFieldsetRepeater extends HyperkitElement {
	requiredChildren = ["template[slot='new-fieldset']"];

	connectedCallback() {
		super.connectedCallback();
	}

	public add() {
		const template = this.querySelector<HTMLTemplateElement>(
			"template[slot='new-fieldset']",
		);
		if (!template || !template.content) return;

		const newFieldset = template.content.cloneNode(true) as DocumentFragment;

		const sortable = this.querySelector("hyperkit-sortable");
		if (sortable) {
			sortable.appendChild(newFieldset);

			const newItem = sortable.lastElementChild as HyperkitSortableItem;

			this.updatePositions();

			requestAnimationFrame(() => {
				const transition = newItem?.querySelector<HyperkitTransition>(
					"hyperkit-transition",
				);
				transition?.enter();
			});
		}
	}

	public updatePositions() {
		const sortableItems = this.querySelectorAll<HyperkitSortableItem>(
			"hyperkit-sortable-item",
		);
		sortableItems.forEach((item, index) => {
			const positionInput = item.querySelector<HTMLInputElement>(
				"hyperkit-sortable-position input",
			);
			if (positionInput) {
				positionInput.value = String(index + 1);
			}
		});
	}
}

if (!customElements.get("hyperkit-fieldset-repeater"))
	customElements.define("hyperkit-fieldset-repeater", HyperkitFieldsetRepeater);

export class HyperkitRepeatedFieldset extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();

		this.setAttribute("role", "group");
		this.setAttribute("aria-labelledby", "fieldset-title");

		const destroyer = this.querySelector<HyperkitFieldsetDestroyer>(
			"hyperkit-fieldset-destroyer",
		);
		destroyer?.addEventListener("click", () => this.remove());
	}

	public remove() {
		const transition = this.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);

		const sortableItem = this.closest<HyperkitSortableItem>(
			"hyperkit-sortable-item",
		);

		const repeater = this.closest<HyperkitFieldsetRepeater>(
			"hyperkit-fieldset-repeater",
		);

		if (transition) {
			transition.exit();
			transition.on(
				"exit",
				() => {
					if (sortableItem) {
						sortableItem.remove();
						repeater?.updatePositions();
					} else {
						super.remove();
						repeater?.updatePositions();
					}
				},
				{ once: true },
			);
		} else {
			if (sortableItem) {
				sortableItem.remove();
				repeater?.updatePositions();
			} else {
				super.remove();
				repeater?.updatePositions();
			}
		}
	}
}

if (!customElements.get("hyperkit-repeated-fieldset"))
	customElements.define("hyperkit-repeated-fieldset", HyperkitRepeatedFieldset);

export class HyperkitFieldsetCreator extends HyperkitElement<{
	propTypes: { for: "string" };
}> {
	requiredChildren = ["button"];
	public propTypes = { for: "string" } as const;

	connectedCallback() {
		super.connectedCallback();

		const repeaterId = this.prop("for");
		const repeater = document.querySelector<HyperkitFieldsetRepeater>(
			`#${repeaterId}`,
		);
		const button = this.querySelector("button");

		if (button && repeater) {
			button.setAttribute("aria-expanded", "false");
			button.setAttribute("aria-controls", repeaterId);
			button.addEventListener("click", () => {
				repeater.add();
				button.setAttribute("aria-expanded", "true");
			});
		}
	}
}

if (!customElements.get("hyperkit-fieldset-creator"))
	customElements.define("hyperkit-fieldset-creator", HyperkitFieldsetCreator);

export class HyperkitFieldsetDestroyer extends HyperkitElement {
	requiredChildren = ["button"];

	connectedCallback() {
		super.connectedCallback();

		this.querySelector("button")?.setAttribute("aria-label", "Remove fieldset");

		this.addEventListener("click", () =>
			this.closest<HyperkitRepeatedFieldset>(
				"hyperkit-repeated-fieldset",
			)?.remove(),
		);
	}
}

if (!customElements.get("hyperkit-fieldset-destroyer"))
	customElements.define(
		"hyperkit-fieldset-destroyer",
		HyperkitFieldsetDestroyer,
	);
