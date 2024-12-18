import { HyperkitElement } from "./hyperkit-element";

export class HyperkitCalendar extends HyperkitElement<{
	events: { type: "change"; detail: { previous?: string; current: string } };
	propagatedEvents: undefined;
	propTypes: {
		value: "date";
		min: "date";
		max: "date";
		"future-only": "boolean";
		"past-only": "boolean";
		for: "string";
	};
}> {
	public requiredChildren = [
		"hyperkit-days-list",
		`template[slot="day-number"]`,
	];
	private currentDate = new Date();
	private selectedDate: Date | null = null;
	private inputElement: HTMLInputElement | null = null;
	private monthElement: HTMLElement | null = null;
	private dayTemplate: HTMLTemplateElement | null = null;

	public propTypes = {
		value: "date",
		min: "date",
		max: "date",
		"future-only": "boolean",
		"past-only": "boolean",
		for: "string",
	} as const;

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
		super.connectedCallback();
		this.initializeElements();
		this.setInitialSelectedDate();
		this.attachInputListener();
		this.setupNavigationButtons();
		this.render();
	}

	private setInitialSelectedDate() {
		const calendarValue = this.prop("value");

		if (calendarValue) {
			this.selectedDate = this.currentDate = calendarValue;
			return;
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

	private initializeElements() {
		this.inputElement = document.querySelector(
			`input[id="${this.prop("for")}"]`,
		);
		this.monthElement = this.querySelector("hyperkit-current-month");

		this.dayTemplate = this.querySelector<HTMLTemplateElement>(
			'template[slot="day-number"]',
		);

		this.dayTemplate?.remove();
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
			selector: "hyperkit-previous-month button",
			callback: () => this.changeMonth(-1),
		});

		this.setupButton({
			selector: "hyperkit-next-month button",
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
		return this.querySelector("hyperkit-days-list");
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
		if (!this.dayTemplate)
			throw new Error("Day button template is not defined");

		const dayButtonFragment = this.dayTemplate.content.cloneNode(
			true,
		) as DocumentFragment;
		const button = dayButtonFragment.querySelector(
			"button",
		) as HTMLButtonElement;
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
		const min = this.prop("min");
		const max = this.prop("max");

		return Boolean(
			(this.prop("future-only") && date < now) ||
				(this.prop("past-only") && date > now) ||
				(min && date < min) ||
				(max && date > max),
		);
	}

	private changeMonth(delta: number) {
		this.currentDate.setUTCMonth(this.currentDate.getUTCMonth() + delta);
		this.render();
	}

	private selectDate({ date }: { date: Date }) {
		const previous = this.selectedDate
			? this.formatDate(this.selectedDate)
			: undefined;
		this.selectedDate = date;
		this.updateInputElement();
		this.render();
		this.fire("change", {
			detail: { previous, current: this.formatDate(date) },
		});
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

class HyperkitDayNumber extends HyperkitElement {
	public requiredChildren = ["button"];
}

if (!customElements.get("hyperkit-day-number"))
	customElements.define("hyperkit-day-number", HyperkitDayNumber);

class ChildElement extends HyperkitElement {
	requiredParent = "hyperkit-calendar";
}

for (const tag of [
	"hyperkit-previous-month",
	"hyperkit-next-month",
	"hyperkit-current-month",
	"hyperkit-days-list",
]) {
	if (!customElements.get(tag))
		customElements.define(tag, class extends ChildElement {});
}
