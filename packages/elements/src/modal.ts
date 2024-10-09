import type { HyperkitTransition } from "./transition";

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

class MismatchedTriggerError extends Error {
	constructor(triggerName: string, modalName: string) {
		super(
			`The trigger "for" attribute (${triggerName}) does not match the modal "name" attribute (${modalName}).`,
		);
		this.name = "MismatchedTriggerError";
	}
}

class MissingButtonError extends Error {
	constructor() {
		super(
			"Missing required <button> inside <hyperkit-modal-trigger> or <hk-modal-dismisser>.",
		);
		this.name = "MissingButtonError";
	}
}

class HyperkitModal extends HTMLElement {
	private dismisserButton: HTMLButtonElement | null = null;
	private modalElement: HTMLElement | null = null;
	private backdropElement: HTMLElement | null = null;

	public connectedCallback() {
		this.validateStructure();
		this.initializeElements();
		this.attachOutsideClickListener();
		this.attachEscapeKeyListener();
		this.setInitialVisibility();
	}

	public get hidden(): boolean {
		return this.modalElement?.hasAttribute("hidden") ?? true;
	}

	private validateStructure() {
		this.dismisserButton = this.getButtonForDismisser();
		this.backdropElement = this.querySelector("hk-modal-backdrop"); // Find the backdrop
		this.modalElement = this;

		if (!this.dismisserButton && !this.backdropElement) {
			throw new MissingButtonError();
		}
	}

	private getButtonForDismisser(): HTMLButtonElement | null {
		const dismisser = this.querySelector<HTMLButtonElement>(
			"hk-modal-dismisser button",
		);
		if (!dismisser) {
			console.error("Button element is missing inside <hk-modal-dismisser>");
			return null;
		}
		return dismisser;
	}

	private initializeElements() {
		if (!this.modalElement) {
			console.error("Initialization failed: Missing modal element.");
			return;
		}

		this.modalElement.setAttribute("aria-hidden", "true");
		this.modalElement.id = this.modalElement.id || "modalContent";

		this.dismisserButton?.addEventListener("click", () => this.hide());

		// Add click listener to the backdrop
		this.backdropElement?.addEventListener("click", () => this.hide());
	}

	private setInitialVisibility() {
		if (!this.hidden) this.setVisible(true);
	}

	public show() {
		if (!this.modalElement) return;

		const transitionElement =
			this.modalElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			this.modalElement.removeAttribute("hidden");
			this.modalElement.setAttribute("aria-hidden", "false");

			transitionElement.enter();
		} else {
			this.modalElement.removeAttribute("hidden");
			this.modalElement.setAttribute("aria-hidden", "false");
		}

		this.setVisible(true);
	}

	public hide() {
		if (!this.modalElement) return;

		const transitionElement =
			this.modalElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			transitionElement.exit();
			transitionElement.addEventListener(
				"change",
				(event) => {
					const customEvent = event as CustomEvent<{
						state: "entered" | "exited";
					}>;
					if (customEvent.detail.state === "exited") {
						this.modalElement?.setAttribute("hidden", "");
						this.modalElement?.setAttribute("aria-hidden", "true");
					}
				},
				{ once: true },
			);
		} else {
			this.modalElement.setAttribute("hidden", "");
			this.modalElement.setAttribute("aria-hidden", "true");
		}

		this.setVisible(false);
	}

	private setVisible(visible: boolean) {
		this.dispatchEvent(new CustomEvent("change", { detail: { visible } }));
	}

	private attachOutsideClickListener() {
		document.addEventListener("click", (event) => {
			const isInsideModal = this.contains(event.target as Node);

			// Check if the click was on any of the trigger buttons associated with this modal
			const modalName = this.getAttribute("name");
			const trigger = document.querySelector<HTMLElement>(
				`hyperkit-modal-trigger[for="${modalName}"]`,
			);
			const isTriggerButton = trigger?.contains(event.target as Node);

			// If the click is neither inside the modal nor on the trigger button, hide the modal
			if (!isInsideModal && !isTriggerButton && !this.hidden) {
				this.hide();
			}
		});
	}

	private attachEscapeKeyListener() {
		document.addEventListener(
			"keydown",
			(event) => event.key === "Escape" && !this.hidden && this.hide(),
		);
	}
}

if (!customElements.get("hyperkit-modal"))
	customElements.define("hyperkit-modal", HyperkitModal);

class ModalTrigger extends HTMLElement {
	private triggerButton: HTMLButtonElement | null = null;

	connectedCallback() {
		this.triggerButton = this.querySelector<HTMLButtonElement>("button");
		if (!this.triggerButton) {
			console.error("<hyperkit-modal-trigger> must contain a <button>");
			throw new MissingButtonError();
		}

		const modalName = this.getAttribute("for");
		const modal = document.querySelector<HyperkitModal>(
			`hyperkit-modal[name="${modalName}"]`,
		);

		if (!modal) {
			console.error(
				`No matching modal for trigger's "for" attribute: ${modalName}`,
			);
			throw new MismatchedTriggerError(modalName || "", modalName || "");
		}

		this.triggerButton.addEventListener("click", () => modal?.show());
	}
}

class ModalDismisser extends HTMLElement {
	private dismisserButton: HTMLButtonElement | null = null;

	connectedCallback() {
		if (!this.closest("hyperkit-modal")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-modal>`,
				this,
			);
			throw new MissingTagError("hyperkit-modal");
		}

		this.dismisserButton = this.querySelector<HTMLButtonElement>("button");
		if (!this.dismisserButton) {
			console.error("Button element is missing inside <hk-modal-dismisser>");
			throw new MissingButtonError();
		}

		const modal = this.closest<HyperkitModal>("hyperkit-modal");
		this.dismisserButton.addEventListener("click", () => modal?.hide());
	}
}

if (!customElements.get("hyperkit-modal-trigger"))
	customElements.define("hyperkit-modal-trigger", ModalTrigger);

if (!customElements.get("hk-modal-dismisser"))
	customElements.define("hk-modal-dismisser", ModalDismisser);

// Modal Backdrop Class
class ModalBackdrop extends HTMLElement {
	connectedCallback() {
		if (!this.closest("hyperkit-modal")) {
			console.error(
				`${this.tagName.toLowerCase()} must be used inside <hyperkit-modal>`,
				this,
			);
			throw new MissingTagError("hyperkit-modal");
		}

		const modal = this.closest<HyperkitModal>("hyperkit-modal");
		this.addEventListener("click", () => modal?.hide());
	}
}

if (!customElements.get("hk-modal-backdrop"))
	customElements.define("hk-modal-backdrop", ModalBackdrop);
