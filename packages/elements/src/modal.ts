import {
	HyperkitDisclosureContent,
	HyperkitDisclosureDismisser,
	HyperkitDisclosureSummoner,
} from "./hyperkit-disclosure";
import { HyperkitElement } from "./hyperkit-element";

export class HyperkitModal extends HyperkitDisclosureContent {
	public requiredSiblings = [
		`hyperkit-modal-summoner[summons=${this.prop("id")}]`,
	];

	summonedBy = document.querySelector<HyperkitModalSummoner>(
		`hyperkit-modal-summoner[summons=${this.prop("id")}]`,
	);

	dismissOnOutsideClick = true;
	dismissOnEscKey = true;
}

if (!customElements.get("hyperkit-modal"))
	customElements.define("hyperkit-modal", HyperkitModal);

export class HyperkitModalSummoner extends HyperkitDisclosureSummoner {
	public requiredSiblings = [`hyperkit-modal[id=${this.prop("summons")}]`];

	summons = document.querySelector<HyperkitModal>(
		`hyperkit-modal[id=${this.prop("summons")}`,
	);
}

if (!customElements.get("hyperkit-modal-summoner"))
	customElements.define("hyperkit-modal-summoner", HyperkitModalSummoner);

export class HyperkitModalDismisser extends HyperkitDisclosureDismisser {
	public requiredParent = "hyperkit-modal";
	public requiredChildren = ["button"];

	dismisses = this.closest<HyperkitModal>("hyperkit-modal");
}

if (!customElements.get("h7-modal-dismisser"))
	customElements.define("h7-modal-dismisser", HyperkitModalDismisser);

export class HyperkitModalBackdrop extends HyperkitElement {
	public requiredParent = "hyperkit-modal";

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			this.addEventListener("click", () =>
				this.closest<HyperkitModal>("hyperkit-modal")?.dismiss(),
			);
		});
	}
}

if (!customElements.get("h7-modal-backdrop"))
	customElements.define("h7-modal-backdrop", HyperkitModalBackdrop);
