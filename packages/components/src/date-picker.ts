export class DatePicker extends HTMLElement {
	private currentDate: Date = new Date();
	private selectedDate: Date | null = null;
	private inputElement: HTMLInputElement | null = null;
	private monthElement: HTMLElement | null = null;
	private dayTemplate: HTMLElement | null = null;
	private futureOnly = false;
	private pastOnly = false;
	private minDate: Date | null = null;
	private maxDate: Date | null = null;

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
		this.validateStructure();

		this.hoistValidationProperties();

		this.cloneTemplate();
		this.initializeElements();
		this.attachInputListener();
		this.render();
		this.setupNavigationButtons();
	}

	private hoistValidationProperties() {
		this.futureOnly = this.hasAttribute("future-only");
		this.pastOnly = this.hasAttribute("past-only");

		const minDateAttr = this.getAttribute("min-date");
		const maxDateAttr = this.getAttribute("max-date");

		this.minDate = minDateAttr ? new Date(minDateAttr) : null;
		this.maxDate = maxDateAttr ? new Date(maxDateAttr) : null;
	}

	private validateStructure() {
		const template = this.querySelector("template");

		if (!template) {
			console.error(
				"There must be a template tag immediately nested under hyperkit-date-picker",
				this,
			);
			throw new Error("Missing hyperkit-date-picker");
		}

		const content = template.content;

		if (!content.querySelector("hk-days-list")) {
			console.error(
				"The hk-days-list tag must be present in the template",
				template,
			);
			throw new Error("Missing hk-days-list");
		}

		if (!content.querySelector("hk-day-number")) {
			console.error(
				"The hk-day-number tag must be present in the template",
				template,
			);
			throw new Error("Missing hk-day-number");
		}
	}

	private initializeElements() {
		this.inputElement = document.querySelector(
			`input[name="${this.getAttribute("for")}"]`,
		);
		this.monthElement = this.querySelector("hk-current-month");

		this.dayTemplate = this.querySelector("hk-day-number");

		if (this.dayTemplate) {
			this.dayTemplate = this.dayTemplate.cloneNode(true) as HTMLElement;
			this.querySelector("hk-day-number")?.remove();
		}
	}

	private cloneTemplate() {
		const template = this.querySelector("template");
		if (template) this.appendChild(template.content.cloneNode(true));
	}

	private attachInputListener() {
		if (!this.inputElement) return;

		this.inputElement.addEventListener("change", () => {
			const inputValue = this.inputElement?.value;

			if (!inputValue) return;

			const parsedDate = new Date(inputValue);

			if (Number.isNaN(parsedDate.getTime())) return;

			this.selectedDate = parsedDate;
			this.currentDate = parsedDate;
			this.render();
		});
	}

	private setupNavigationButtons() {
		this.setupButton("hk-previous-month", () => this.changeMonth(-1));
		this.setupButton("hk-next-month", () => this.changeMonth(1));
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

		if (selector === "hk-previous-month")
			button.setAttribute("aria-label", "Go to previous month");
		if (selector === "hk-next-month")
			button.setAttribute("aria-label", "Go to next month");

		button.setAttribute("role", "button");
	}

	private get daysElement(): HTMLElement | null {
		return this.querySelector("hk-days-list");
	}

	render() {
		if (!this.monthElement) return;

		this.monthElement.textContent =
			DatePicker.monthNames[this.currentDate.getUTCMonth()];
		this.monthElement.setAttribute("role", "heading");
		this.monthElement.setAttribute(
			"aria-label",
			`Current month: ${DatePicker.monthNames[this.currentDate.getUTCMonth()]}`,
		);

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
		if (!this.dayTemplate) throw new Error("dayTemplate is not defined");

		const button = document.createElement("button");

		for (const attr of Array.from(this.dayTemplate.attributes))
			button.setAttribute(attr.name, attr.value);

		button.textContent = content;

		if (!date) {
			button.dataset.otherMonth = "";
			button.setAttribute("disabled", "true");
			button.setAttribute("aria-disabled", "true");
			button.setAttribute("aria-label", "Unavailable day");
			button.setAttribute("role", "button");
			return button;
		}

		button.dataset.date = date.toISOString();
		button.setAttribute("role", "button");
		button.setAttribute("aria-label", `Select date: ${content}`);

		const disabled =
			(this.futureOnly && date < new Date()) ||
			(this.pastOnly && date > new Date()) ||
			(this.minDate && date < this.minDate) ||
			(this.maxDate && date > this.maxDate);

		if (disabled) {
			button.setAttribute("disabled", "true");
			button.setAttribute("aria-disabled", "true");
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

customElements.define("hk-previous-month", class extends ChildElement {});
customElements.define("hk-next-month", class extends ChildElement {});
customElements.define("hk-current-month", class extends ChildElement {});
customElements.define("hk-days-list", class extends ChildElement {});
customElements.define("hk-day-number", class extends ChildElement {});
