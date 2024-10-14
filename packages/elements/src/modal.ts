import { HyperkitElement } from "./hyperkit-element";
import type { HyperkitTransition } from "./transition";

export class HyperkitModal extends HyperkitElement<{
	events: { type: "show" } | { type: "hide" };
	propTypes: { name: "string"; hidden: "boolean" };
}> {
	public propTypes = { name: "string", hidden: "boolean" } as const;

	private dismisserButton: HTMLButtonElement | null = null;
	private backdropElement: HTMLElement | null = null;

	public connectedCallback() {
		this.validateStructure();
		this.initializeElements();
		this.attachOutsideClickListener();
		this.attachEscapeKeyListener();
		this.setInitialVisibility();
	}

	private validateStructure() {
		const modalName = this.prop("name");

		const trigger = document.querySelector<HTMLElement>(
			`hyperkit-modal-trigger[for="${modalName}"]`,
		);

		if (!trigger) {
			console.error(
				`No matching modal for trigger's "for" attribute: ${modalName}`,
				this,
			);
		}

		this.dismisserButton = this.getButtonForDismisser();
		if (!this.dismisserButton) {
			console.warn(
				"Optional dismiss button is missing in <h7-modal-dismisser>",
				this,
			);
		}

		this.backdropElement = this.querySelector("h7-modal-backdrop");
	}

	private getButtonForDismisser(): HTMLButtonElement | null {
		const dismisser = this.querySelector<HTMLButtonElement>(
			"h7-modal-dismisser button",
		);
		return dismisser;
	}

	private initializeElements() {
		this.setAttribute("aria-hidden", "true");
		this.id = this.id || "modalContent";

		this.dismisserButton?.addEventListener("click", () => this.hide());
		this.backdropElement?.addEventListener("click", () => this.hide());
	}

	private setInitialVisibility() {
		if (!this.prop("hidden")) this.setVisible(true);
	}

	public show() {
		const transitionElement = this.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);

		this.removeAttribute("hidden");
		this.setAttribute("aria-hidden", "false");

		if (transitionElement) transitionElement.enter();

		this.setVisible(true);
	}

	public hide() {
		const transitionElement = this.querySelector<HyperkitTransition>(
			"hyperkit-transition",
		);

		if (transitionElement) {
			transitionElement.exit();
			transitionElement.addEventListener(
				"exit",
				() => {
					this.setAttribute("hidden", "");
					this.setAttribute("aria-hidden", "true");
				},
				{ once: true },
			);
		} else {
			this.setAttribute("hidden", "");
			this.setAttribute("aria-hidden", "true");
		}

		this.setVisible(false);
	}

	private setVisible(visible: boolean) {
		this.fire(visible ? "show" : "hide");
	}

	private attachOutsideClickListener() {
		document.addEventListener("click", (event) => {
			const isInsideModal = this.contains(event.target as Node);

			const modalName = this.prop("name");
			const trigger = document.querySelector<HTMLElement>(
				`hyperkit-modal-trigger[for="${modalName}"]`,
			);
			const isTriggerButton = trigger?.contains(event.target as Node);

			if (!isInsideModal && !isTriggerButton && !this.prop("hidden")) {
				this.hide();
			}
		});
	}

	private attachEscapeKeyListener() {
		document.addEventListener(
			"keydown",
			(event) => event.key === "Escape" && !this.prop("hidden") && this.hide(),
		);
	}
}

if (!customElements.get("hyperkit-modal"))
	customElements.define("hyperkit-modal", HyperkitModal);

class ModalTrigger extends HyperkitElement<{ propTypes: { for: "string" } }> {
	public propTypes = { for: "string" } as const;
	private triggerButton: HTMLButtonElement | null = null;

	connectedCallback() {
		this.validateStructure();
		this.attachClickListener();
	}

	private validateStructure() {
		this.triggerButton = this.querySelector<HTMLButtonElement>("button");
		if (!this.triggerButton) {
			console.error("<hyperkit-modal-trigger> must contain a <button>", this);
		}

		const modalName = this.prop("for");
		const modal = document.querySelector<HyperkitModal>(
			`hyperkit-modal[name="${modalName}"]`,
		);

		if (!modal) {
			console.error(
				`No matching modal for trigger's "for" attribute: ${modalName}`,
				this,
			);
		}
	}

	private attachClickListener() {
		const modalName = this.getAttribute("for");
		const modal = document.querySelector<HyperkitModal>(
			`hyperkit-modal[name="${modalName}"]`,
		);
		this.triggerButton?.addEventListener("click", () => modal?.show());
	}
}

if (!customElements.get("hyperkit-modal-trigger"))
	customElements.define("hyperkit-modal-trigger", ModalTrigger);

class ModalDismisser extends HyperkitElement {
	private dismisserButton: HTMLButtonElement | null = null;

	connectedCallback() {
		this.validateStructure();
		this.attachClickListener();
	}

	private validateStructure() {
		if (!this.closest("hyperkit-modal")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-modal>`,
				this,
			);
		}

		this.dismisserButton = this.querySelector<HTMLButtonElement>("button");
		if (!this.dismisserButton) {
			console.error(
				"Button element is missing inside <h7-modal-dismisser>",
				this,
			);
		}
	}

	private attachClickListener() {
		const modal = this.closest<HyperkitModal>("hyperkit-modal");
		this.dismisserButton?.addEventListener("click", () => modal?.hide());
	}
}

if (!customElements.get("h7-modal-dismisser"))
	customElements.define("h7-modal-dismisser", ModalDismisser);

class ModalBackdrop extends HyperkitElement {
	connectedCallback() {
		this.validateStructure();
		this.attachClickListener();
	}

	private validateStructure() {
		if (!this.closest("hyperkit-modal")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-modal>`,
				this,
			);
		}
	}

	private attachClickListener() {
		const modal = this.closest<HyperkitModal>("hyperkit-modal");
		this.addEventListener("click", () => modal?.hide());
	}
}

if (!customElements.get("h7-modal-backdrop"))
	customElements.define("h7-modal-backdrop", ModalBackdrop);
