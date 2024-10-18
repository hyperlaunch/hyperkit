import { HyperkitElement } from "./hyperkit-element";
import { HyperkitTransition } from "./transition";

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

		if (fieldset) {
			// Insert the new fieldset before the new fieldset container
			this.insertBefore(fieldset, this.querySelector("hyperkit-new-fieldset"));

			// Optionally apply the enter transition if it exists
			const transition = fieldset.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);
			if (transition) {
				transition.enter();
			}
		}
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
			destroyer.addEventListener("click", () => this.removeWithTransition());
		}
	}

	private removeWithTransition() {
		// Optionally apply the exit transition if it exists
		const transition = this.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);
		if (transition) {
			transition.exit();
			transition.on("exit", () => this.remove(), { once: true });
		} else {
			this.remove();
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

		if (button && repeater)
			button.addEventListener("click", () => repeater.addNewFieldset());
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
			)?.removeWithTransition(),
		);
	}
}

if (!customElements.get("hyperkit-fieldset-destroyer"))
	customElements.define(
		"hyperkit-fieldset-destroyer",
		HyperkitFieldsetDestroyer,
	);

export class HyperkitNewFieldset extends HyperkitElement {}

if (!customElements.get("hyperkit-new-fieldset"))
	customElements.define("hyperkit-new-fieldset", HyperkitNewFieldset);
