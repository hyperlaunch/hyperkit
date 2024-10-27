import { HyperkitElement } from "./hyperkit-element";


class HyperkitLink extends HyperkitElement<{
	propTypes: { timeout: "number" };
}> {
	static isPopstateBound = false;
	loading = false;
	propTypes = { timeout: "number" } as const;

	requiredChildren = ["a[href]"];
	cacheLimit = 5;
	maxCacheSize = 100 * 1024;

	connectedCallback() {
		super.connectedCallback();
		window.history.scrollRestoration = "manual";

		requestAnimationFrame(() => {
			this.anchor?.addEventListener("mousedown", (event) =>
				this.handleNavigation(event),
			);
			this.anchor?.addEventListener("touchstart", (event) =>
				this.handleNavigation(event),
			);
			this.anchor?.addEventListener("mouseover", () => this.prefetchContent());
		});

		if (!HyperkitLink.isPopstateBound) {
			window.addEventListener("popstate", () => this.handlePopstate());
			HyperkitLink.isPopstateBound = true;
		}
	}

	get anchor() {
		return this.querySelector<HTMLAnchorElement>("a");
	}

	get href() {
		return String(this.anchor?.getAttribute("href"));
	}

	get timeout() {
		return this.prop("timeout") || 5000;
	}

	async handleNavigation(event: Event) {
		event.preventDefault();

		sessionStorage.setItem(
			`scrollPosition:${document.location.href}`,
			String(window.scrollY),
		);

		await this.startViewTransition();
		await this.loadBodyContent();

		history.pushState(null, "", this.href);

		requestAnimationFrame(() =>
			window.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
		);
	}

	async prefetchContent() {
		const href = this.href;

		if (sessionStorage.getItem(`prefetchedContent:${href}`)) return;

		try {
			const html = String(await this.fetch({ href }));

			if (new Blob([html]).size <= this.maxCacheSize) {
				this.cachePage(href, html);
			}
		} catch (error) {
			console.warn("Prefetch failed:", error);
		}
	}

	cachePage(href: string, html: string) {
		const cacheOrder = JSON.parse(sessionStorage.getItem("cacheOrder") || "[]");

		if (cacheOrder.length >= this.cacheLimit) {
			const oldestHref = cacheOrder.shift();
			sessionStorage.removeItem(`prefetchedContent:${oldestHref}`);
		}

		sessionStorage.setItem(`prefetchedContent:${href}`, html);

		cacheOrder.push(href);
		sessionStorage.setItem("cacheOrder", JSON.stringify(cacheOrder));
	}

	async loadBodyContent({ href }: { href?: string } = {}) {
		if (this.loading) return;

		this.loading = true;
		document.body.setAttribute("aria-busy", "true");

		const hrefToFetch = href || this.href;

		const cachedHtml = sessionStorage.getItem(
			`prefetchedContent:${hrefToFetch}`,
		);
		const html = String(
			cachedHtml || (await this.fetch({ href: hrefToFetch })),
		);

		if (cachedHtml)
			sessionStorage.removeItem(`prefetchedContent:${hrefToFetch}`);

		await this.insertContent({ html });

		this.loading = false;
		document.body.setAttribute("aria-busy", "false");
	}

	async insertContent({ html }: { html: string }) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");
		document.body.innerHTML = doc.body.innerHTML;
	}

	async handlePopstate() {
		const href = document.location.href;

		if (!href) {
			location.reload();
			return;
		}

		try {
			await this.startViewTransition();
			await this.loadBodyContent({ href });

			const savedScroll = sessionStorage.getItem(`scrollPosition:${href}`);
			if (savedScroll !== null) {
				requestAnimationFrame(() => {
					window.scrollTo({
						top: Number(savedScroll, 10),
						behavior: "smooth",
					});
				});
			}
		} catch (error) {
			console.error("Failed to load content on navigation:", error);
			location.reload();
		}
	}

	startViewTransition() {
		return document.startViewTransition
			? new Promise((resolve) =>
					document.startViewTransition(() => resolve(true)),
				)
			: true;
	}

	async fetch({ href }: { href: string }) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(href, { signal: controller.signal });
			if (!response.ok) throw new Error(`Non-2xx response: ${response.status}`);
			return await response.text();
		} catch (error) {
			console.warn("Fetch failed or timed out", error);
			window.location.href = href;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

if (!customElements.get("hyperkit-link"))
	customElements.define("hyperkit-link", HyperkitLink);
