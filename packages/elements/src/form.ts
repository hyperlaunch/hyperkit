import { HyperkitViewTransitioner } from "./hyperkit-view-transitioner";

class HyperkitForm extends HyperkitViewTransitioner {
	requiredChildren = ["form"];

	connectedCallback() {
		super.connectedCallback();

		const form = this.querySelector("form");
		if (!form) return;

		form.addEventListener("submit", (event) => this.handleSubmit(event));
	}

	get form() {
		return this.querySelector<HTMLFormElement>("form");
	}

	get formData() {
		return this.form && new FormData(this.form);
	}

	get method() {
		return this.form?.method.toUpperCase() || "GET";
	}

	get action() {
		return this.form?.action || document.location.href;
	}

	async handleGet() {
		const queryString = new URLSearchParams(this.formData).toString();

		const url = `${this.action}?${queryString}`;

		await this.startViewTransition();
		const html = await this.getPotentiallyCachedContent({ url, bust: true });
		await this.replaceContent({ html });

		history.pushState(null, "", url);

		requestAnimationFrame(() =>
			window.scrollTo({ top: 0, behavior: "smooth" }),
		);
	}

	async handleRedirect({ url }: { url: string | null }) {
		if (!url) throw new Error("Redirect reponses but no location specified");

		await this.startViewTransition();

		const html = await this.getPotentiallyCachedContent({ url, bust: true });
		await this.replaceContent({ html });

		history.pushState(null, "", url);
	}

	async handlePost() {
		const response = await this.fetch({
			url: this.action,
			method: "POST",
			body: this.formData,
			headers: { Accept: "text/html" },
		});

		if (response.status === 422 || response.status.toString().startsWith("2")) {
			const html = await response.text();
			return await this.replaceContent({ html });
		}
		if ([302, 303].includes(response.status))
			return this.handleRedirect({
				url: response.headers.get("location"),
			});

		if (response.type === "opaqueredirect")
			return this.handleRedirect({
				url: response.url,
			});

		throw new Error("Bad status");
	}

	async handleSubmit(event: Event) {
		event.preventDefault();

		if (!this.form) return;

		try {
			if (this.method === "GET") return await this.handleGet();
			if (this.method === "POST") return await this.handlePost();
		} catch (error) {
			console.error("Failed to submit form", error);
			this.form.submit();
		}
	}
}

if (!customElements.get("hyperkit-form"))
	customElements.define("hyperkit-form", HyperkitForm);
