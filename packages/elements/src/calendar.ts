class MissingTagError extends Error {
	constructor(tagName: string) {
		super(`Missing required tag: <${tagName}>`);
		this.name = "MissingTagError";
	}
}

export class HyperkitCalendar extends HTMLElement {
	private currentDate = new Date();
	private selectedDate: Date | null = null;
	private inputElement: HTMLInputElement | null = null;
	private monthElement: HTMLElement | null = null;
	private dayButtonTemplate: HTMLButtonElement | null = null;
	private futureOnly = this.hasAttribute("future-only");
	private pastOnly = this.hasAttribute("past-only");
	private minDate = this.parseDateAttr("min-date");
	private maxDate = this.parseDateAttr("max-date");

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
		this.initializeElements();
		this.setInitialSelectedDate();
		this.attachInputListener();
		this.setupNavigationButtons();
		this.render();
	}

	private setInitialSelectedDate() {
		const calendarValue = this.getAttribute("value");
		if (calendarValue) {
			const parsedDate = new Date(calendarValue);
			if (!Number.isNaN(parsedDate.getTime())) {
				this.selectedDate = this.currentDate = parsedDate;
				return;
			}
		}

		if (this.inputElement?.value) {
			const parsedDate = new Date(this.inputElement.value);
			if (!Number.isNaN(parsedDate.getTime()))
				this.selectedDate = this.currentDate = parsedDate;
		}
	}

	get value() {
		return this.selectedDate && this.formatDate(this.selectedDate);
	}

	private parseDateAttr(attrName: string): Date | null {
		const attr = this.getAttribute(attrName);
		return attr ? new Date(attr) : null;
	}

	private validateStructure() {
		const daysList = this.querySelector("hk-days-list");
		const dayButton = this.querySelector('button[slot="day-number"]');

		if (!daysList) {
			console.error("hk-days-list is missing in the markup");
			throw new MissingTagError("hk-days-list");
		}

		if (!dayButton) {
			console.error("button[slot='day-number'] is missing in the markup");
			throw new MissingTagError("button[slot='day-number']");
		}
	}

	private initializeElements() {
		this.inputElement = document.querySelector(
			`input[id="${this.getAttribute("for")}"]`,
		);
		this.monthElement = this.querySelector("hk-current-month");

		this.dayButtonTemplate = this.querySelector<HTMLButtonElement>(
			'button[slot="day-number"]',
		);
		if (this.dayButtonTemplate) {
			this.dayButtonTemplate.remove();
		} else {
			console.error("Day button (slot='day-number') is missing");
		}
	}

	private attachInputListener() {
		this.inputElement?.addEventListener("change", () => {
			const parsedDate = new Date(this.inputElement?.value ?? "");
			if (!Number.isNaN(parsedDate.getTime())) {
				this.selectedDate = this.currentDate = parsedDate;
				this.render();
			}
		});
	}

	private setupNavigationButtons() {
		this.setupButton({
			selector: "hk-previous-month button",
			callback: () => this.changeMonth(-1),
		});

		this.setupButton({
			selector: "hk-next-month button",
			callback: () => this.changeMonth(1),
		});
	}

	private setupButton({
		selector,
		callback,
	}: {
		selector: string;
		callback: () => void;
	}) {
		const button = this.querySelector<HTMLButtonElement>(selector);
		if (!button) return;
		button.addEventListener("click", callback);

		button.setAttribute(
			"aria-label",
			selector.includes("previous")
				? "Go to previous month"
				: "Go to next month",
		);
	}

	private get daysElement(): HTMLElement | null {
		return this.querySelector("hk-days-list");
	}

	render() {
		if (!this.monthElement) return;
		const year = this.currentDate.getUTCFullYear();
		const month = HyperkitCalendar.monthNames[this.currentDate.getUTCMonth()];
		this.monthElement.textContent = `${month} ${year}`;
		this.monthElement.setAttribute(
			"aria-label",
			`Current month: ${this.monthElement.textContent}`,
		);

		this.clearDaysElement();
		this.renderMonthDays();
	}

	private clearDaysElement() {
		this.daysElement?.replaceChildren();
	}

	private renderMonthDays() {
		const year = this.currentDate.getUTCFullYear();
		const month = this.currentDate.getUTCMonth();
		const firstDay = new Date(Date.UTC(year, month, 1));
		const lastDay = new Date(Date.UTC(year, month + 1, 0));

		this.renderPreviousMonthDays(firstDay.getUTCDay());
		this.renderCurrentMonthDays(lastDay.getUTCDate());
		this.renderNextMonthDays();
	}

	private renderPreviousMonthDays(startingDay: number) {
		const adjustedStartingDay = (startingDay + 6) % 7;

		const prevMonthLastDay = new Date(
			Date.UTC(
				this.currentDate.getUTCFullYear(),
				this.currentDate.getUTCMonth(),
				0,
			),
		).getUTCDate();

		for (let i = 0; i < adjustedStartingDay; i++)
			this.daysElement?.appendChild(
				this.createDayButton({
					content: String(prevMonthLastDay - (adjustedStartingDay - i - 1)),
					isOtherMonth: true,
				}),
			);
	}

	private renderCurrentMonthDays(daysInMonth: number) {
		const today = new Date();
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(
				Date.UTC(
					this.currentDate.getUTCFullYear(),
					this.currentDate.getUTCMonth(),
					i,
				),
			);
			const dayElement = this.createDayButton({
				content: String(i),
				date,
			});
			if (date.toDateString() === today.toDateString())
				dayElement.dataset.today = "";
			if (
				this.selectedDate &&
				date.toDateString() === this.selectedDate.toDateString()
			)
				dayElement.dataset.selected = "";
			dayElement.addEventListener("click", () => this.selectDate({ date }));
			this.daysElement?.appendChild(dayElement);
		}
	}

	private renderNextMonthDays() {
		const remainingDays =
			(7 - ((this.daysElement?.children.length ?? 0) % 7)) % 7;
		for (let i = 1; i <= remainingDays; i++) {
			this.daysElement?.appendChild(
				this.createDayButton({ content: String(i), isOtherMonth: true }),
			);
		}
	}

	private createDayButton({
		content,
		date,
		isOtherMonth = false,
	}: {
		content: string;
		date?: Date;
		isOtherMonth?: boolean;
	}): HTMLElement {
		if (!this.dayButtonTemplate)
			throw new Error("Day button template is not defined");

		const button = this.dayButtonTemplate.cloneNode(true) as HTMLButtonElement;
		button.textContent = content;

		if (isOtherMonth || this.isDateDisabled(date)) {
			button.disabled = true;
			button.setAttribute("aria-disabled", "true");
		} else {
			button.dataset.date = date?.toISOString() ?? "";
			button.setAttribute("aria-label", `Select date: ${content}`);
		}

		return button;
	}

	private isDateDisabled(date?: Date): boolean {
		if (!date) return true;
		const now = new Date();
		return Boolean(
			(this.futureOnly && date < now) ||
				(this.pastOnly && date > now) ||
				(this.minDate && date < this.minDate) ||
				(this.maxDate && date > this.maxDate),
		);
	}

	private changeMonth(delta: number) {
		this.currentDate.setUTCMonth(this.currentDate.getUTCMonth() + delta);
		this.render();
	}

	private selectDate({ date }: { date: Date }) {
		const previousValue =
			this.selectedDate && this.formatDate(this.selectedDate);
		this.selectedDate = date;
		this.updateInputElement();
		this.render();
		this.dispatchEvent(
			new CustomEvent("change", {
				detail: { previousValue, newValue: this.formatDate(date) },
			}),
		);
	}

	private formatDate(date: Date) {
		return date.toISOString().split("T")[0];
	}

	private updateInputElement() {
		if (!this.inputElement || !this.selectedDate) return;

		const [year, month, day] = [
			this.selectedDate.getUTCFullYear(),
			String(this.selectedDate.getUTCMonth() + 1).padStart(2, "0"),
			String(this.selectedDate.getUTCDate()).padStart(2, "0"),
		];

		this.inputElement.value = `${year}-${month}-${day}`;
	}
}

if (!customElements.get("hyperkit-calendar"))
	customElements.define("hyperkit-calendar", HyperkitCalendar);

class ChildElement extends HTMLElement {
	connectedCallback() {
		if (!this.closest("hyperkit-calendar"))
			console.error(
				`${this.tagName.toLowerCase()} must be used inside hyperkit-calendar`,
				this,
			);
	}
}

for (const tag of [
	"hk-previous-month",
	"hk-next-month",
	"hk-current-month",
	"hk-days-list",
]) {
	if (!customElements.get(tag))
		customElements.define(tag, class extends ChildElement {});
}
