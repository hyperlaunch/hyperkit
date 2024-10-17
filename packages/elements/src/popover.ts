import {
	HyperkitDisclosureContent,
	HyperkitDisclosureSummoner,
} from "./hyperkit-disclosure";

export class HyperkitPopover extends HyperkitDisclosureContent {
	public requiredSiblings = [
		`hyperkit-popover-summoner[summons=${this.prop("id")}]`,
	];

	summonBy = document.querySelector<HyperkitPopoverSummoner>(
		`hyperkit-popover-summoner[summons=${this.prop("id")}]`,
	);

	dismissOnOutsideClick = true;
	dismissOnEscKey = true;
}

if (!customElements.get("hyperkit-popover"))
	customElements.define("hyperkit-popover", HyperkitPopover);

export class HyperkitPopoverSummoner extends HyperkitDisclosureSummoner {
	public requiredSiblings = [`hyperkit-popover[id=${this.prop("summons")}]`];

	summons = document.querySelector<HyperkitPopover>(
		`hyperkit-popover[id=${this.prop("summons")}`,
	);

	dismisssummonContent = true;
}

if (!customElements.get("hyperkit-popover-summoner"))
	customElements.define("hyperkit-popover-summoner", HyperkitPopoverSummoner);
