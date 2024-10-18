import { HyperkitElement } from "./hyperkit-element";

export class HyperkitMaskedInput extends HyperkitElement<{
	propTypes: { mask: "string" };
}> {
	public requiredChildren = ["input"];
	public propTypes = { mask: "string" } as const;

	connectedCallback() {
		super.connectedCallback();

		requestAnimationFrame(() => {
			const input = this.querySelector<HTMLInputElement>("input");

			const mask = this.prop("mask");

			const maskHandler = (event: Event) => {
				const target = event.target as HTMLInputElement;
				const cursorPosition = target.selectionStart || 0;
				const rawValue = target.value.replace(/[^a-zA-Z\d\-]/g, "");
				const formattedValue = this.formatByMask({ value: rawValue, mask });

				target.value = formattedValue;
				this.restoreCursorPosition({ target, cursorPosition, mask });
			};

			const deleteHandler = (event: KeyboardEvent) => {
				if (event.key === "Backspace") {
					const target = event.target as HTMLInputElement;
					const cursorPosition = target.selectionStart || 0;

					event.preventDefault();
					this.handleBackspace({ target, mask, cursorPosition });
				}
			};

			input?.addEventListener("input", maskHandler);
			input?.addEventListener("blur", maskHandler);
			input?.addEventListener("keydown", deleteHandler);
		});
	}

	private formatByMask({
		value,
		mask,
	}: {
		value: string;
		mask: string;
	}): string {
		let formattedValue = "";
		let valueIndex = 0;

		for (let i = 0; i < mask.length; i++) {
			const maskChar = mask[i];

			if (!this.isPlaceholder(maskChar)) {
				if (value[valueIndex] === maskChar) {
					formattedValue += maskChar;
					valueIndex++;
				} else if (valueIndex < value.length) {
					formattedValue += maskChar;
				}
				continue;
			}

			if (valueIndex < value.length) {
				const currentValue = value[valueIndex];
				if (
					this.isDigitPattern({ maskChar, currentValue }) ||
					this.isLetterPattern({ maskChar, currentValue })
				) {
					formattedValue += currentValue;
					valueIndex++;
				} else {
					break;
				}
			} else {
				break;
			}
		}

		return formattedValue;
	}

	private restoreCursorPosition({
		target,
		cursorPosition,
		mask,
	}: {
		target: HTMLInputElement;
		cursorPosition: number;
		mask: string;
	}) {
		let newCursorPosition = cursorPosition;

		for (let i = 0; i < cursorPosition && i < mask.length; i++) {
			if (!this.isPlaceholder(mask[i])) {
				newCursorPosition++;
			}
		}

		target.setSelectionRange(newCursorPosition, newCursorPosition);
	}

	private handleBackspace({
		target,
		mask,
		cursorPosition,
	}: {
		target: HTMLInputElement;
		mask: string;
		cursorPosition: number;
	}) {
		const rawValue = target.value.replace(/[^a-zA-Z\d\-]/g, "");

		const current =
			rawValue.slice(0, cursorPosition - 1) + rawValue.slice(cursorPosition);

		const formattedValue = this.formatByMask({ value: current, mask });
		target.value = formattedValue;

		const newCursorPosition = Math.max(cursorPosition - 1, 0);
		target.setSelectionRange(newCursorPosition, newCursorPosition);
	}

	private isDigitPattern({
		maskChar,
		currentValue,
	}: {
		maskChar: string;
		currentValue: string;
	}): boolean {
		return maskChar === "#" && /\d/.test(currentValue);
	}

	private isLetterPattern({
		maskChar,
		currentValue,
	}: {
		maskChar: string;
		currentValue: string;
	}): boolean {
		return maskChar === "L" && /[a-zA-Z]/.test(currentValue);
	}

	private isPlaceholder(char: string): boolean {
		return char === "#" || char === "L";
	}
}

if (!customElements.get("hyperkit-masked-input"))
	customElements.define("hyperkit-masked-input", HyperkitMaskedInput);
