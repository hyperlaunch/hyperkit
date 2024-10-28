import { HyperkitViewTransitioner } from "./hyperkit-view-transitioner";

class HyperkitLink extends HyperkitViewTransitioner {
	requiredChildren = ["a[href]"];

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			this.anchor?.addEventListener("mousedown", (event) =>
				this.handleNavigation(event),
			);
			this.anchor?.addEventListener("touchstart", (event) =>
				this.handleNavigation(event),
			);
			this.anchor?.addEventListener("mouseover", () => this.prefetchContent());
		});
	}

	get anchor() {
		return this.querySelector<HTMLAnchorElement>("a");
	}

	get href() {
		return String(this.anchor?.getAttribute("href"));
	}

	async handleNavigation(event: Event) {
		event.preventDefault();

		try {
			sessionStorage.setItem(
				`scrollPosition:${document.location.href}`,
				String(window.scrollY),
			);

			await this.startViewTransition();
			const html = await this.getPotentiallyCachedContent({ url: this.href });
			await this.replaceContent({ html });

			history.pushState(null, "", this.href);

			requestAnimationFrame(() =>
				window.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
			);
		} catch (_) {
			this.anchor?.click();
		}
	}

	async prefetchContent() {
		try {
			await this.getPotentiallyCachedContent({ url: this.href });
		} catch (error) {}
	}
}

if (!customElements.get("hyperkit-link"))
	customElements.define("hyperkit-link", HyperkitLink);
