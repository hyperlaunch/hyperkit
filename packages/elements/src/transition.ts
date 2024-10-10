export class HyperkitTransition extends HTMLElement {
	private isExiting = false;

	connectedCallback() {
		// Automatically start the enter transition if the 'enter-on-connect' attribute is present
		if (this.hasAttribute("enter-on-connect")) {
			this.enter();
		}
	}

	enter() {
		// Set the initial state to 'entering'
		this.setDataState("entering");

		// Ensure the transition starts in the next animation frame
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				this.setDataState("entered");
			});
		});

		// Listen for the transition to complete before dispatching the 'entered' event
		this.addEventListener(
			"transitionend",
			(event) => {
				if (event.target === this && !this.isExiting) {
					this.dispatchEvent(
						new CustomEvent("change", { detail: { state: "entered" } }),
					);
				}
			},
			{ once: true },
		);
	}

	exit() {
		// Set the flag to mark that we are exiting
		this.isExiting = true;

		// Set the initial state to 'exiting'
		this.setDataState("exiting");

		// Ensure the transition starts in the next animation frame
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				this.setDataState("exited");
			});
		});

		// Listen for the transition to complete before dispatching the 'exited' event and hiding the element
		this.addEventListener(
			"transitionend",
			(event) => {
				if (event.target === this) {
					this.setAttribute("hidden", "");
					this.dispatchEvent(
						new CustomEvent("change", { detail: { state: "exited" } }),
					);
					this.isExiting = false;
				}
			},
			{ once: true },
		);
	}

	private setDataState(state: "entering" | "entered" | "exiting" | "exited") {
		this.setAttribute("data-state", state);
	}
}

if (!customElements.get("hyperkit-transition")) {
	customElements.define("hyperkit-transition", HyperkitTransition);
}
