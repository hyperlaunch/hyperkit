export class DatePicker extends HTMLElement {
	private currentDate: Date = new Date();
	private selectedDate: Date | null = null;
	private inputElement: HTMLInputElement | null = null;
	private monthElement: HTMLElement | null = null;
	private dayTemplate: HTMLTemplateElement | null = null;
	private daysElement: HTMLElement | null = null;
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
		const calendarTemplate = this.querySelector<HTMLTemplateElement>(
			"template[hk-calendar]",
		);
		const dayNumberTemplate = this.querySelector<HTMLTemplateElement>(
			"template[hk-day-number]",
		);

		if (!calendarTemplate) {
			console.error(
				"`hyperkit-date-picker` must contain both a template with `hk-calendar`",
				this,
			);
			throw new Error("Required templates are missing");
		}

		if (!dayNumberTemplate) {
			console.error(
				"`hyperkit-date-picker` must contain both a template with `hk-day-number`",
				this,
			);
			throw new Error("Required templates are missing");
		}

		if (!calendarTemplate.content.querySelector("[hk-days-list]")) {
			console.error(
				"`template[hk-calendar]` must contain an element with `hk-days-list`",
				calendarTemplate,
			);
			throw new Error("Missing `hk-days-list` in `hk-calendar` template");
		}

		if (!dayNumberTemplate.content.querySelector("button")) {
			console.error(
				"`template[hk-day-number]` must contain a `button` element",
				dayNumberTemplate,
			);
			throw new Error("Missing `button` in `hk-day-number` template");
		}

		const previousMonthElement = this.querySelector("[hk-previous-month]");
		const nextMonthElement = this.querySelector("[hk-next-month]");

		if (previousMonthElement && previousMonthElement.tagName !== "BUTTON")
			console.warn(
				"`hk-previous-month` should be a button element",
				previousMonthElement,
			);

		if (nextMonthElement && nextMonthElement.tagName !== "BUTTON")
			console.warn(
				"`hk-next-month` should be a button element",
				nextMonthElement,
			);
	}

	private initializeElements() {
		this.inputElement = document.querySelector(
			`input[name="${this.getAttribute("for")}"]`,
		);
		this.monthElement = this.querySelector("[hk-current-month]");
		this.daysElement = this.querySelector("[hk-days-list]");
		this.dayTemplate = this.querySelector<HTMLTemplateElement>(
			"template[hk-day-number]",
		);
	}

	private cloneTemplate() {
		const template = this.querySelector<HTMLTemplateElement>(
			"template[hk-calendar]",
		);
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
		this.setupButton("[hk-previous-month]", () => this.changeMonth(-1));
		this.setupButton("[hk-next-month]", () => this.changeMonth(1));
	}

	private setupButton(selector: string, callback: () => void) {
		const button = this.querySelector(selector);
		if (!button) return;

		button.addEventListener("click", callback);
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

		const dayFragment = document.importNode(this.dayTemplate.content, true);
		const button = dayFragment.querySelector("button");

		if (!button) throw new Error("Template must contain a button");

		button.textContent = content;

		if (!date) {
			button.dataset.otherMonth = "";
			button.setAttribute("disabled", "true");
			button.setAttribute("aria-disabled", "true");
			button.setAttribute("aria-label", "Unavailable day");
			return button;
		}

		button.dataset.date = date.toISOString();
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
