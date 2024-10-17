import { HyperkitArrowNav } from "./arrow-nav"; // Import HyperkitArrowNav
import {
	HyperkitDisclosureContent,
	HyperkitDisclosureSummoner,
} from "./hyperkit-disclosure";
import { HyperkitElement } from "./hyperkit-element";

class HyperkitSelectOption extends HyperkitElement {
	requiredChildren = ["button"];

	connectedCallback() {
		super.connectedCallback();

		const button = this.querySelector("button");
		if (!button) {
			console.warn("<h7-select-option> should have a nested button.");
		} else {
			button.addEventListener("click", this.onClick.bind(this));
		}
	}

	onClick() {
		const select = this.closest<HyperkitSelect>("hyperkit-select");
		if (select) select.selected(this);
	}
}

if (!customElements.get("h7-select-option"))
	customElements.define("h7-select-option", HyperkitSelectOption);

class HyperkitSelect extends HyperkitDisclosureContent<{
	events: {
		type: "change";
		detail: { previous?: string; current: string };
	};
}> {
	requiredSiblings = [`hyperkit-select-summoner[summons="${this.prop("id")}"]`];
	requiredChildren = ["h7-select-option"];

	summonedBy = document.querySelector<HyperkitSelectSummoner>(
		`hyperkit-select-summoner[summons="${this.prop("id")}"]`,
	);

	connectedInput: HTMLInputElement | null = null;
	value?: string;

	dismissOnOutsideClick = true;
	dismissOnEscKey = true;

	connectedCallback() {
		super.connectedCallback();

		const forAttr = this.getAttribute("for");
		this.connectedInput = forAttr
			? (document.getElementById(forAttr) as HTMLInputElement)
			: null;
		if (forAttr && this.connectedInput) {
			this.value = this.connectedInput.value;
		}

		this.initializeArrowNavigation();
	}

	selected(option: HyperkitSelectOption) {
		const previous = this.value;
		const current = String(option.getAttribute("value"));

		this.value = String(current);

		if (this.connectedInput) this.connectedInput.value = String(current);

		this.fire("change", { detail: { previous, current } });

		this.dismiss();
	}

	initializeArrowNavigation() {
		const arrowNav = new HyperkitArrowNav();

		const optionsContainer = document.createElement("div");
		optionsContainer.append(...Array.from(this.children));
		arrowNav.appendChild(optionsContainer);

		this.appendChild(arrowNav);
	}
}

if (!customElements.get("hyperkit-select"))
	customElements.define("hyperkit-select", HyperkitSelect);

class HyperkitSelectSummoner extends HyperkitDisclosureSummoner {
	requiredSiblings = [`hyperkit-select[id="${this.prop("summons")}"]`];

	summons = document.querySelector<HyperkitSelect>(
		`hyperkit-select[id="${this.prop("summons")}"]`,
	);

	dismissSummonedContent = true;
	originalButtonText = "";

	connectedCallback() {
		super.connectedCallback();

		if (this.button) {
			this.originalButtonText = this.button.textContent || "";
		}

		this.button?.addEventListener("keydown", this.onKeyDown.bind(this));

		this.summons?.on("change", this.onValueChanged.bind(this));

		this.updateButtonText();
	}

	onKeyDown(event: KeyboardEvent) {
		if (
			event.key === "ArrowDown" &&
			this.summons &&
			!this.summons.hidden &&
			document.activeElement === this.button
		) {
			event.preventDefault();
			const firstOptionButton = this.summons.querySelector<HTMLButtonElement>(
				"h7-select-option button",
			);
			firstOptionButton?.focus();
		}
	}

	onValueChanged() {
		this.updateButtonText();
	}

	updateButtonText() {
		const value = this.summons?.value;
		let textContent = this.originalButtonText;

		if (value && this.summons) {
			const option = this.summons.querySelector(
				`h7-select-option[value="${value}"]`,
			);
			const optionButton = option?.querySelector("button");
			if (optionButton) {
				textContent = String(optionButton.textContent);
			} else {
				textContent = value;
			}
		}

		if (this.button) this.button.textContent = textContent;
	}
}

if (!customElements.get("hyperkit-select-summoner"))
	customElements.define("hyperkit-select-summoner", HyperkitSelectSummoner);
