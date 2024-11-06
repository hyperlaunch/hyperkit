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
		return String(this.form?.action);
	}

	async handleGet() {
		const formData = this.formData;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const queryString = new URLSearchParams(formData as any).toString();

		const url = `${this.action?.split("?")[0]}?${queryString}`;

		await this.startViewTransition();
		const html = await this.getPotentiallyCachedContent({ url, bust: true });
		await this.replaceContent({ html });

		history.pushState(null, "", url);

		requestAnimationFrame(() =>
			window.scrollTo({ top: 0, behavior: "smooth" }),
		);
	}

	async handlePost() {
		const response = await this.fetch({
			url: this.action,
			method: "POST",
			body: this.formData,
			headers: { Accept: "text/html" },
		});

		await this.startViewTransition();

		const html = await response.text();
		await this.replaceContent({ html });

		return history.pushState(null, "", response.url);
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
