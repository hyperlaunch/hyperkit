import { type BaseEvent, HyperkitElement } from "./hyperkit-element";
import type { HyperkitTransition } from "./transition";

export abstract class HyperkitDisclosureSummoner extends HyperkitElement<{
	propTypes: { summons: "string" };
}> {
	public propTypes = { summons: "string" } as const;
	public requiredChildren = ["button"];

	abstract summons: HyperkitDisclosureContent | null;

	public button = this.querySelector<HTMLButtonElement>("button");

	dismisssummonContent = false;

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			!this.summons?.hidden && this.setActive();

			this.button?.addEventListener("click", () => {
				if (!this.dismisssummonContent || this.summons?.hidden)
					return this.summonContent();

				this.summons?.dismiss();
			});

			this.summons?.on("summon", () => this.setActive());
			this.summons?.on("dismiss", () => this.unsetActive());
		});
	}

	summonContent() {
		this.summons?.summon();
		this.setActive();
	}

	setActive() {
		if (!this.button) return;
		this.button.dataset.active = "";
	}
	unsetActive() {
		delete this.button?.dataset.active;
	}
}

export abstract class HyperkitDisclosureDismisser extends HyperkitElement {
	public requiredChildren = ["button"];

	abstract dismisses: HyperkitDisclosureContent | null;

	public button = this.querySelector<HTMLButtonElement>("button");

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			this.button?.addEventListener("click", () => this.dismisses?.dismiss());
		});
	}
}

type DisclosureContentEvents = { type: "summon" } | { type: "dismiss" };

export abstract class HyperkitDisclosureContent<
	Options extends { events: BaseEvent | undefined } = { events: undefined },
> extends HyperkitElement<{
	events: DisclosureContentEvents;
	propagatedEvents: Options["events"];
	propTypes: { id: "string" };
}> {
	public readonly propTypes = { id: "string" } as const;

	abstract summonBy: HyperkitDisclosureSummoner | null;

	dismissOnOutsideClick = false;
	dismissOnEscKey = false;

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			this.hidden ? this.handleDismissal() : this.handleSummoning();

			if (this.dismissOnOutsideClick) this.attachOutsideClickListener();
			if (this.dismissOnEscKey) this.attachEscapeKeyListener();
		});
	}

	static get observedAttributes() {
		return ["hidden"];
	}

	attributeChangedCallback(name: string, _: string, value: string) {
		if (name === "hidden")
			value !== null ? this.handleDismissal() : this.handleSummoning();
	}

	get transition() {
		return this.querySelector<HyperkitTransition>("hyperkit-transition");
	}

	public summon() {
		this.removeAttribute("hidden");
		this.transition?.enter();
	}

	private handleSummoning() {
		this.setAttribute("aria-hidden", "false");
		this.fire("summon");
	}

	public dismiss() {
		if (!this.transition) return this.setAttribute("hidden", "");

		this.transition.exit();
		this.transition.on("exit", () => this.setAttribute("hidden", ""), {
			once: true,
		});
	}

	private handleDismissal() {
		this.setAttribute("aria-hidden", "true");
		this.fire("dismiss");
	}

	private attachOutsideClickListener() {
		document.addEventListener("click", (event) => {
			const isInsidePopover = this.contains(event.target as Node);
			const issummonBy = this.summonBy?.button === event.target;
			if (!issummonBy && !isInsidePopover && !this.hasAttribute("hidden"))
				this.dismiss();
		});
	}

	private attachEscapeKeyListener() {
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") this.dismiss();
		});
	}
}
