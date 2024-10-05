export class DatePicker extends HTMLElement {
	private currentDate: Date = new Date();
	private selectedDate: Date | null = null;
	private inputElement: HTMLInputElement | null = null;
	private monthElement: HTMLElement | null = null;
	private dayTemplate: HTMLElement | null = null;

	private static monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	connectedCallback() {
		if (!this.validateStructure()) return;

		this.cloneTemplate();
		this.initializeElements();
		this.render();
		this.setupNavigationButtons();
	}

	private validateStructure() {
		const template = this.querySelector("template");

		if (!template) {
			console.error(
				"There must be a template tag immediately nested under hyperkit-date-picker",
				this,
			);
			return false;
		}

		const content = template.content;

		if (
			!content.querySelector("days-list") ||
			!content.querySelector("day-number")
		) {
			console.error(
				"The days-list and day-number tags must be present in the template",
				template,
			);
			return false;
		}

		return true;
	}

	private initializeElements() {
		this.inputElement = document.querySelector(
			`input[name="${this.getAttribute("for")}"]`,
		);
		this.monthElement = this.querySelector("current-month");

		this.dayTemplate = this.querySelector("day-number");

		if (this.dayTemplate) {
			this.dayTemplate = this.dayTemplate.cloneNode(true) as HTMLElement;
			this.querySelector("day-number")?.remove();
		}
	}

	private cloneTemplate() {
		const template = this.querySelector("template");
		if (template) this.appendChild(template.content.cloneNode(true));
	}

	private setupNavigationButtons() {
		this.setupButton("previous-month", () => this.changeMonth(-1));
		this.setupButton("next-month", () => this.changeMonth(1));
	}

	private setupButton(selector: string, callback: () => void) {
		const buttonWrapper = this.querySelector(selector);

		if (!buttonWrapper) return;

		const button = document.createElement("button");

		button.innerHTML = buttonWrapper.innerHTML;

		for (const attr of Array.from(buttonWrapper.attributes))
			button.setAttribute(attr.name, attr.value);

		while (buttonWrapper.attributes.length > 0)
			buttonWrapper.removeAttribute(buttonWrapper.attributes[0].name);

		buttonWrapper.innerHTML = "";
		buttonWrapper.appendChild(button);
		button.addEventListener("click", callback);
	}

	private get daysElement(): HTMLElement | null {
		return this.querySelector("days-list");
	}

	render() {
		if (!this.monthElement) return;

		this.monthElement.textContent =
			DatePicker.monthNames[this.currentDate.getUTCMonth()];

		this.clearDaysElement();

		const year = this.currentDate.getUTCFullYear();
		const month = this.currentDate.getUTCMonth();
		const firstDay = new Date(Date.UTC(year, month, 1));
		const lastDay = new Date(Date.UTC(year, month + 1, 0));
		const daysInMonth = lastDay.getUTCDate();
		const startingDay = (firstDay.getUTCDay() + 6) % 7;

		this.renderPreviousMonthDays(year, month, startingDay);
		this.renderCurrentMonthDays(year, month, daysInMonth);
		this.renderNextMonthDays();
	}

	private clearDaysElement() {
		while (this.daysElement?.firstChild)
			this.daysElement.removeChild(this.daysElement.firstChild);
	}

	private renderPreviousMonthDays(
		year: number,
		month: number,
		startingDay: number,
	) {
		const prevMonthLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
		for (let i = 0; i < startingDay; i++) {
			const dayElement = this.createDayButton(
				String(prevMonthLastDay - startingDay + i + 1),
			);
			dayElement.dataset.otherMonth = "";
			this.daysElement?.appendChild(dayElement);
		}
	}

	private renderCurrentMonthDays(
		year: number,
		month: number,
		daysInMonth: number,
	) {
		const today = new Date();

		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(Date.UTC(year, month, i));
			const dayElement = this.createDayButton(String(i), date);

			if (date.toDateString() === today.toDateString())
				dayElement.dataset.today = "";

			if (
				this.selectedDate &&
				date.toDateString() === this.selectedDate.toDateString()
			)
				dayElement.dataset.selected = "";

			dayElement.addEventListener("click", () => this.selectDate(date));
			this.daysElement?.appendChild(dayElement);
		}
	}

	private renderNextMonthDays() {
		const totalDays = this.daysElement?.children.length ?? 0;
		const remainingDays = (7 - (totalDays % 7)) % 7;

		for (let i = 1; i <= remainingDays; i++) {
			const dayElement = this.createDayButton(String(i));
			dayElement.dataset.otherMonth = "";
			this.daysElement?.appendChild(dayElement);
		}
	}

	private createDayButton(content: string, date?: Date): HTMLElement {
		if (!this.dayTemplate) {
			throw new Error("dayTemplate is not defined");
		}

		const button = document.createElement("button");

		for (const attr of Array.from(this.dayTemplate.attributes))
			button.setAttribute(attr.name, attr.value);

		button.textContent = content;

		const futureOnly = this.hasAttribute("future-only");
		const pastOnly = this.hasAttribute("past-only");
		const minDateAttr = this.getAttribute("min-date");
		const maxDateAttr = this.getAttribute("max-date");

		const minDate = minDateAttr ? new Date(minDateAttr) : null;
		const maxDate = maxDateAttr ? new Date(maxDateAttr) : null;
		const today = new Date();

		if (date) {
			button.dataset.date = date.toISOString();

			if (futureOnly && date < today) button.setAttribute("disabled", "true");

			if (pastOnly && date > today) button.setAttribute("disabled", "true");

			if (minDate && date < minDate) button.setAttribute("disabled", "true");

			if (maxDate && date > maxDate) button.setAttribute("disabled", "true");
		}

		return button;
	}

	private changeMonth(delta: number) {
		this.currentDate.setUTCMonth(this.currentDate.getUTCMonth() + delta);
		this.render();
	}

	private selectDate(date: Date) {
		this.selectedDate = date;
		this.updateInputElement(date);
		this.render();
		this.dispatchEvent(new CustomEvent("dateSelected", { detail: { date } }));
	}

	private updateInputElement(date: Date) {
		if (!this.inputElement) return;

		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		this.inputElement.value = `${year}-${month}-${day}`;
	}
}

customElements.define("hyperkit-date-picker", DatePicker);

class ChildElement extends HTMLElement {
	connectedCallback() {
		if (!this.closest("hyperkit-date-picker"))
			console.error(
				`${this.tagName.toLowerCase()} must be used inside hyperkit-date-picker`,
				this,
			);
	}
}

customElements.define("previous-month", class extends ChildElement {});
customElements.define("next-month", class extends ChildElement {});
customElements.define("current-month", class extends ChildElement {});
customElements.define("days-list", class extends ChildElement {});
customElements.define("day-number", class extends ChildElement {});
