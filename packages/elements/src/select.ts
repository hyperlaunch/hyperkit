import { HyperkitArrowNav } from "./arrow-nav"; // Import HyperkitArrowNav
import {
	HyperkitDisclosureContent,
	HyperkitDisclosureSummoner,
} from "./hyperkit-disclosure";
import { HyperkitElement } from "./hyperkit-element";

class HyperkitSelectOption extends HyperkitElement<{
	propTypes: { value: "string" };
}> {
	propTypes = { value: "string" } as const;
	requiredParent = "hyperkit-select";
	requiredChildren = ["button"];

	connectedCallback() {
		super.connectedCallback();

		const button = this.querySelector<HTMLButtonElement>("button");

		button?.setAttribute("role", "option");
		button?.addEventListener("click", () => this.onClick());
	}

	onClick() {
		const select = this.closest<HyperkitSelect>("hyperkit-select");
		if (select) select.selected(this);
	}
}

if (!customElements.get("hyperkit-select-option"))
	customElements.define("hyperkit-select-option", HyperkitSelectOption);

class HyperkitSelect extends HyperkitDisclosureContent<{
	events: {
		type: "change";
		detail: { previous?: string; current: string };
	};
}> {
	requiredSiblings = [`hyperkit-select-summoner[summons="${this.prop("id")}"]`];
	requiredChildren = ["hyperkit-select-option"];

	summonBy = document.querySelector<HyperkitSelectSummoner>(
		`hyperkit-select-summoner[summons="${this.prop("id")}"]`,
	);

	connectedInput: HTMLInputElement | null = null;
	value?: string;

	dismissOnOutsideClick = true;
	dismissOnEscKey = true;

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			this.value = this.getAttribute("value") || undefined;

			const forAttr = this.getAttribute("for");
			this.connectedInput = forAttr
				? document.querySelector<HTMLInputElement>(`#${forAttr}`)
				: null;

			if (forAttr && this.connectedInput)
				this.value = this.connectedInput.value;

			this.summonBy?.setAttribute("aria-controls", this.id);
			this.setAttribute("role", "listbox");

			this.on("summon", () => {
				if (!this.value) return;

				const selectedButton = this.querySelector<HTMLButtonElement>(
					`hyperkit-select-option[value="${this.value}"] button`,
				);

				selectedButton?.focus();
			});
		});
	}

	selected(option: HyperkitSelectOption) {
		const previous = this.value;
		const current = String(option.prop("value"));

		for (const opt of Array.from(
			this.querySelectorAll<HyperkitSelectOption>("hyperkit-select-option"),
		)) {
			const button = opt.querySelector<HTMLButtonElement>("button");

			delete button?.dataset.selected;
			button?.setAttribute("aria-selected", "false");
		}

		const selectedButton = option.querySelector<HTMLButtonElement>("button");

		if (selectedButton) {
			selectedButton.dataset.selected = "";
			selectedButton.setAttribute("aria-selected", "true");
		}

		this.value = String(current);

		if (this.connectedInput) this.connectedInput.value = String(current);

		this.fire("change", { detail: { previous, current } });

		this.dismiss();
	}
}

if (!customElements.get("hyperkit-select"))
	customElements.define("hyperkit-select", HyperkitSelect);

class HyperkitSelectSummoner extends HyperkitDisclosureSummoner {
	requiredSiblings = [`hyperkit-select[id="${this.prop("summons")}"]`];

	summons = document.querySelector<HyperkitSelect>(
		`hyperkit-select[id="${this.prop("summons")}"]`,
	);

	dismisssummonContent = true;
	originalButtonText = "";

	connectedCallback() {
		super.connectedCallback();

		if (this.button) {
			this.originalButtonText = this.button.textContent || "";
			this.button.setAttribute("aria-expanded", "false");
			this.button.setAttribute("aria-haspopup", "listbox");
			this.button.setAttribute("aria-controls", this.summons?.id || "");
			this.button.addEventListener("keydown", (e) => this.onKeyDown(e));
		}

		requestAnimationFrame(() => {
			this.summons?.on("change", this.onValueChanged.bind(this));
			this.updateButtonText();
		});
	}

	onValueChanged() {
		this.updateButtonText();
		this.button?.setAttribute("aria-expanded", String(!this.summons?.hidden));
	}

	onKeyDown(event: KeyboardEvent) {
		const arrowNav = this.summons.querySelector("hyperkit-arrow-nav");

		if (!arrowNav) return;
		if (
			event.key === "ArrowDown" &&
			this.summons &&
			!this.summons.hidden &&
			document.activeElement === this.button
		) {
			event.preventDefault();
			const firstOptionButton = this.summons.querySelector<HTMLButtonElement>(
				"hyperkit-select-option button",
			);
			firstOptionButton?.focus();
		}
	}

	updateButtonText() {
		const value = this.summons?.value;
		let textContent = this.originalButtonText;

		if (value && this.summons) {
			const option = this.summons.querySelector(
				`hyperkit-select-option[value="${value}"]`,
			);
			const optionButton = option?.querySelector("button");
			textContent = optionButton ? String(optionButton.textContent) : value;
		}

		if (this.button) this.button.textContent = textContent;
	}
}

if (!customElements.get("hyperkit-select-summoner"))
	customElements.define("hyperkit-select-summoner", HyperkitSelectSummoner);
