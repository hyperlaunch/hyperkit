import type { HyperkitTransition } from "./transition";

class MissingTemplateError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MissingTemplateError";
	}
}

class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

class HyperkitPopover extends HTMLElement {
	private triggerElement: HTMLElement | null = null;
	private contentElement: HTMLElement | null = null;

	public connectedCallback() {
		this.validateStructure();
		this.cloneTemplate();
		this.initializeElements();
		this.setupPopover();
		this.attachOutsideClickListener();
		this.attachEscapeKeyListener();
		this.setInitialVisibility();
	}

	public get hidden(): boolean {
		return this.contentElement?.hasAttribute("hidden") ?? true;
	}

	private validateStructure() {
		const template = this.querySelector("template");

		if (!template) {
			console.error("Template tag is missing in hyperkit-popover", this);
			throw new MissingTemplateError(
				"Template tag is required in hyperkit-popover.",
			);
		}

		const content = template.content;
		this.triggerElement = content.querySelector("hk-popover-trigger");
		this.contentElement = content.querySelector("hk-popover-content");

		if (!this.triggerElement) {
			console.error(
				"hk-popover-trigger tag is missing in the template",
				template,
			);
			throw new MissingTagError("hk-popover-trigger");
		}

		if (!this.contentElement) {
			console.error(
				"hk-popover-content tag is missing in the template",
				template,
			);
			throw new MissingTagError("hk-popover-content");
		}
	}

	private cloneTemplate() {
		const template = this.querySelector<HTMLTemplateElement>("template");
		if (template) this.appendChild(template.content.cloneNode(true));
	}

	private initializeElements() {
		this.triggerElement = this.querySelector("hk-popover-trigger");
		this.contentElement = this.querySelector("hk-popover-content");

		if (!this.triggerElement || !this.contentElement)
			throw new Error(
				"Trigger or content element is missing after initialization.",
			);

		const button = document.createElement("button");
		for (const attr of Array.from(this.triggerElement.attributes)) {
			button.setAttribute(attr.name, attr.value);
			this.triggerElement.removeAttribute(attr.name);
		}

		button.innerHTML = this.triggerElement.innerHTML;
		this.triggerElement.replaceChildren(button);

		button.setAttribute("aria-expanded", "false");
		button.setAttribute(
			"aria-controls",
			this.contentElement.id || "popoverContent",
		);
		this.contentElement.setAttribute("aria-hidden", "true");
		this.contentElement.id = this.contentElement.id || "popoverContent";
	}

	private setupPopover() {
		const button = this.triggerElement?.querySelector("button");

		if (button && this.contentElement)
			button.addEventListener("click", () => {
				this.hidden ? this.show() : this.hide();
			});
	}

	private setInitialVisibility() {
		const button = this.triggerElement?.querySelector("button");
		if (!this.hidden) {
			button?.setAttribute("data-visible", "true");
			button?.setAttribute("aria-expanded", "true");
		}
	}

	public show() {
		if (!this.contentElement || !this.triggerElement) return;
		const button = this.triggerElement.querySelector("button");

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			this.contentElement.removeAttribute("hidden");
			this.contentElement.setAttribute("aria-hidden", "false");

			transitionElement.enter();
		} else {
			this.contentElement.removeAttribute("hidden");
			this.contentElement.setAttribute("aria-hidden", "false");
		}

		button?.setAttribute("aria-expanded", "true");
		button?.setAttribute("data-visible", "true");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: true } }),
		);
	}

	public hide() {
		if (!this.contentElement || !this.triggerElement) return;
		const button = this.triggerElement.querySelector("button");

		const transitionElement =
			this.contentElement.querySelector<HyperkitTransition>(
				"hyperkit-transition",
			);

		if (transitionElement) {
			transitionElement.exit();
			transitionElement.addEventListener(
				"change",
				(event) => {
					// Ensure this is the "exited" state change
					if (event.detail.state === "exited") {
						this.contentElement.setAttribute("hidden", "");
						this.contentElement.setAttribute("aria-hidden", "true");
					}
				},
				{ once: true },
			); // Ensure the listener is removed after it's used once
		} else {
			this.contentElement.setAttribute("hidden", "");
			this.contentElement.setAttribute("aria-hidden", "true");
		}

		button?.setAttribute("aria-expanded", "false");
		button?.removeAttribute("data-visible");

		this.dispatchEvent(
			new CustomEvent("change", { detail: { visible: false } }),
		);
	}

	private attachOutsideClickListener() {
		document.addEventListener(
			"click",
			(event) =>
				!this.contains(event.target as Node) && !this.hidden && this.hide(),
		);
	}

	private attachEscapeKeyListener() {
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !this.hidden) {
				this.hide();
			}
		});
	}
}

if (!customElements.get("hyperkit-popover"))
	customElements.define("hyperkit-popover", HyperkitPopover);
