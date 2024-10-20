import { HyperkitElement } from "./hyperkit-element";

export class HyperkitCopyable extends HyperkitElement<{
	events: { type: "copied"; detail: { value: string } };
	propagatedEvents: undefined;
	propTypes: { value: "string" };
}> {
	requiredChildren = ["button"];
	public propTypes = { value: "string" } as const;

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			const button = this.querySelector<HTMLButtonElement>("button");
			const valueToCopy = this.prop("value");

			const copyHandler = async () => {
				if (!button) return;

				try {
					await navigator.clipboard.writeText(valueToCopy);
					button.dataset.copied = "";
					this.fire("copied", { detail: { value: valueToCopy } });
				} catch (error) {
					console.error(error, this);
				}
			};

			button?.addEventListener("click", copyHandler);
		});
	}
}

if (!customElements.get("hyperkit-copyable"))
	customElements.define("hyperkit-copyable", HyperkitCopyable);
