import { HyperkitElement } from "./hyperkit-element";

export class HyperkitFieldsetRepeater extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();
	}

	public addNewFieldset() {
		const template = this.querySelector<HTMLTemplateElement>(
			"hyperkit-new-fieldset template",
		);
		if (!template || !template.content) return;

		const newFieldset = template.content.cloneNode(true) as DocumentFragment;
		const fieldset = newFieldset.querySelector<HyperkitRepeatedFieldset>(
			"hyperkit-repeated-fieldset",
		);

		if (fieldset)
			this.insertBefore(fieldset, this.querySelector("hyperkit-new-fieldset"));
	}
}

if (!customElements.get("hyperkit-fieldset-repeater"))
	customElements.define("hyperkit-fieldset-repeater", HyperkitFieldsetRepeater);

export class HyperkitRepeatedFieldset extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();
		this.setupDestroyer();
	}

	private setupDestroyer() {
		const destroyer = this.querySelector("hyperkit-fieldset-destroyer");
		if (destroyer) {
			destroyer.addEventListener("click", () => this.remove());
		}
	}
}

if (!customElements.get("hyperkit-repeated-fieldset"))
	customElements.define("hyperkit-repeated-fieldset", HyperkitRepeatedFieldset);

export class HyperkitFieldsetCreator extends HyperkitElement {
	connectedCallback() {
		super.connectedCallback();
		this.setupCreator();
	}

	private setupCreator() {
		const repeaterId = this.getAttribute("for");
		const repeater = document.getElementById(
			repeaterId,
		) as HyperkitFieldsetRepeater;
		const button = this.querySelector("button");

		if (button && repeater) {
			button.addEventListener("click", () => repeater.addNewFieldset());
		}
	}
}

if (!customElements.get("hyperkit-fieldset-creator"))
	customElements.define("hyperkit-fieldset-creator", HyperkitFieldsetCreator);

export class HyperkitFieldsetDestroyer extends HyperkitElement {}

if (!customElements.get("hyperkit-fieldset-destroyer"))
	customElements.define(
		"hyperkit-fieldset-destroyer",
		HyperkitFieldsetDestroyer,
	);

export class HyperkitNewFieldset extends HyperkitElement {}

if (!customElements.get("hyperkit-new-fieldset"))
	customElements.define("hyperkit-new-fieldset", HyperkitNewFieldset);
