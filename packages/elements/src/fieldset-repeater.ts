import { HyperkitElement } from "./hyperkit-element";
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

		// Clone the entire template content
		const newFieldset = template.content.cloneNode(true) as DocumentFragment;

		// Append the whole DocumentFragment
		this.querySelector("hyperkit-sortable")?.appendChild(newFieldset);

		// Find the transition element and trigger the enter transition if it exists
		const transition = newFieldset.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);
		transition?.enter();
	}
}

if (!customElements.get("hyperkit-fieldset-repeater"))
	customElements.define("hyperkit-fieldset-repeater", HyperkitFieldsetRepeater);

export class HyperkitRepeatedFieldset extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();

		const destroyer = this.querySelector<HyperkitFieldsetDestroyer>(
			"hyperkit-fieldset-destroyer",
		);
		destroyer?.addEventListener("click", () => this.remove());
	}

	public remove() {
		const transition = this.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);
		if (!transition) return super.remove();

		transition.exit();
		transition.on("exit", () => super.remove(), { once: true });
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

		if (button && repeater)
			button.addEventListener("click", () => repeater.add());
	}
}

if (!customElements.get("hyperkit-fieldset-creator"))
	customElements.define("hyperkit-fieldset-creator", HyperkitFieldsetCreator);

export class HyperkitFieldsetDestroyer extends HyperkitElement {
	requiredChildren = ["button"];

	connectedCallback() {
		super.connectedCallback();

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
