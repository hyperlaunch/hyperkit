import {
	HyperkitDisclosureContent,
	HyperkitDisclosureSummoner,
} from "./hyperkit-disclosure";
import { HyperkitElement } from "./hyperkit-element";

export class HyperkitDetail extends HyperkitDisclosureContent {
	public requiredSiblings = [
		`hyperkit-detail-summoner[summons=${this.prop("id")}]`,
	];

	summonedBy = document.querySelector<HyperkitDetailSummoner>(
		`hyperkit-detail-summoner[summons=${this.prop("id")}]`,
	);
}

if (!customElements.get("hyperkit-detail"))
	customElements.define("hyperkit-detail", HyperkitDetail);

export class HyperkitDetailSummoner extends HyperkitDisclosureSummoner {
	public requiredSiblings = [`hyperkit-detail[id=${this.prop("summons")}]`];

	summons = document.querySelector<HyperkitDetail>(
		`hyperkit-detail[id=${this.prop("summons")}`,
	);

	dismissSummonedContent = !this.closest("hyperkit-accordion");
}

if (!customElements.get("hyperkit-detail-summoner"))
	customElements.define("hyperkit-detail-summoner", HyperkitDetailSummoner);

class HyperkitAccordion extends HyperkitElement {
	public requiredChildren = ["hyperkit-detail"];
	private details = Array.from(
		this.querySelectorAll<HyperkitDetail>("hyperkit-detail"),
	);

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			for (const detail of this.details)
				detail.on("summoned", () => this.closeOtherDetails(detail));

			for (const [index, detail] of this.details.entries())
				index !== 0 ? detail.dismiss() : detail.summon();
		});
	}

	private closeOtherDetails(openDetail: HyperkitDetail) {
		for (const detail of this.details) {
			if (detail !== openDetail && !detail.hidden) detail.dismiss();
		}
	}
}

if (!customElements.get("hyperkit-accordion"))
	customElements.define("hyperkit-accordion", HyperkitAccordion);
