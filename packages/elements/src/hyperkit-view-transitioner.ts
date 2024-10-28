import { HyperkitElement } from "@hyperkitxyz/elements/hyperkit-element";

export abstract class HyperkitViewTransitioner extends HyperkitElement<{
	propTypes: { timeout: "number" };
}> {
	static isPopstateBound = false;
	loading = false;
	propTypes = { timeout: "number" } as const;

	cacheLimit = 5;
	maxCacheSize = 100 * 1024;

	connectedCallback() {
		super.connectedCallback();

		window.history.scrollRestoration = "manual";

		if (!HyperkitViewTransitioner.isPopstateBound) {
			window.addEventListener("popstate", () => this.handlePopstate());
			HyperkitViewTransitioner.isPopstateBound = true;
		}
	}

	get timeout() {
		return this.prop("timeout") || 5000;
	}

	async handlePopstate() {
		const url = document.location.href;

		if (!url) {
			location.reload();
			return;
		}

		try {
			await this.startViewTransition();
			const html = await this.getPotentiallyCachedContent({ url });
			await this.replaceContent({ html });

			const savedScroll = sessionStorage.getItem(`scrollPosition:${url}`);
			if (savedScroll !== null) {
				requestAnimationFrame(() => {
					window.scrollTo({
						top: Number(savedScroll),
						behavior: "smooth",
					});
				});
			}
		} catch (error) {
			console.error("Failed to load content on navigation:", error);
			location.reload();
		}
	}

	async getPotentiallyCachedContent({
		url,
		bust = false,
	}: { url: string; bust?: boolean }) {
		const cache = sessionStorage.getItem(this.pageCacheKey({ url }));

		if (cache && !bust) return cache;

		const request = await this.fetch({ url });

		if (!request.status.toString().startsWith("2"))
			throw new Error("Bad status");

		const html = String(await request.text());

		if (new Blob([html]).size <= this.maxCacheSize) this.cachePage(url, html);

		return html;
	}

	async replaceContent({ html }: { html: string }) {
		if (this.loading) return;

		this.loading = true;
		document.body.setAttribute("aria-busy", "true");

		const parser = new DOMParser();
		const newDoc = parser.parseFromString(html, "text/html");
		const newBody = newDoc.body;

		this.syncHead(newDoc.head);

		document.body.replaceChildren(...Array.from(newBody.childNodes));

		this.loading = false;
		document.body.setAttribute("aria-busy", "false");
	}

	syncHead(newHtml: HTMLHeadElement) {
		const newHeadElements = Array.from(newHtml.children);

		const currentHeadElements = Array.from(document.head.children);
		const headMap = new Map();

		for (const el of currentHeadElements) {
			const key =
				el.tagName +
				el
					.getAttributeNames()
					.map((attr) => `${attr}:${el.getAttribute(attr)}`)
					.join("|");
			headMap.set(key, el);
		}

		for (const newEl of newHeadElements) {
			const key =
				newEl.tagName +
				newEl
					.getAttributeNames()
					.map((attr) => `${attr}:${newEl.getAttribute(attr)}`)
					.join("|");

			if (!headMap.has(key)) {
				document.head.appendChild(newEl.cloneNode(true));
			} else {
				const existingEl = headMap.get(key);
				if (existingEl?.outerHTML !== newEl.outerHTML) {
					existingEl.replaceWith(newEl.cloneNode(true));
				}
				headMap.delete(key);
			}
		}

		for (const el of headMap.values()) el.remove();
	}

	startViewTransition() {
		return document.startViewTransition
			? new Promise((resolve) =>
					document.startViewTransition(() => resolve(true)),
				)
			: true;
	}

	pageCacheKey({ url }: { url: string }) {
		const pathname = new URL(url, "http://hyperkit.xyz").pathname;
		return `cachedContent:${pathname.toLowerCase()}`;
	}

	cachePage(url: string, html: string) {
		const cacheOrder = JSON.parse(sessionStorage.getItem("cacheOrder") || "[]");

		if (cacheOrder.length >= this.cacheLimit) {
			const oldesturl = cacheOrder.shift();
			sessionStorage.removeItem(this.pageCacheKey({ url: oldesturl }));
		}

		sessionStorage.setItem(this.pageCacheKey({ url }), html);

		cacheOrder.push(url);
		sessionStorage.setItem("cacheOrder", JSON.stringify(cacheOrder));
	}

	async fetch({ url, ...fetchProps }: { url: string } & RequestInit) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				redirect: "manual",
				...fetchProps,
			});

			return response;
		} catch (error) {
			console.warn("Fetch failed or timed out", error);
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
