import { HyperkitElement } from "./hyperkit-element";

export class HyperkitSortableItem extends HyperkitElement {
	requiredParent = "hyperkit-sortable";
	public requiredChildren = ["hyperkit-sortable-handle"];

	connectedCallback() {
		super.connectedCallback();

		this.setAttribute("role", "listitem");
		this.setAttribute("aria-grabbed", "false"); // Initially not grabbed

		this.addEventListener("dragstart", () => {
			this.dataset.dragging = "true";
			this.setAttribute("draggable", "true");
			this.setAttribute("aria-grabbed", "true"); // Mark as grabbed
		});

		this.addEventListener("dragend", () => {
			delete this.dataset.dragging;
			this.removeAttribute("draggable");
			this.setAttribute("aria-grabbed", "false"); // Mark as released
		});
	}

	public updatePosition(position: number) {
		const positionInput = this.querySelector<HTMLInputElement>(
			"hyperkit-sortable-position input",
		);
		if (positionInput) positionInput.value = String(position);
	}
}

if (!customElements.get("hyperkit-sortable-item"))
	customElements.define("hyperkit-sortable-item", HyperkitSortableItem);

export class HyperkitSortableHandle extends HyperkitElement {
	requiredParent = "hyperkit-sortable-item";
	requiredChildren = ["button"];

	connectedCallback() {
		const button = this.querySelector("button");
		if (button) {
			button.setAttribute("aria-label", "Drag to reorder");
			button.setAttribute("aria-haspopup", "true");

			button.addEventListener("mousedown", () => {
				const item = this.closest<HyperkitSortableItem>(
					"hyperkit-sortable-item",
				);
				item?.setAttribute("draggable", "true");
				item?.setAttribute("aria-grabbed", "true");
			});

			button.addEventListener("touchstart", () => {
				const item = this.closest<HyperkitSortableItem>(
					"hyperkit-sortable-item",
				);
				item?.setAttribute("draggable", "true");
				item?.setAttribute("aria-grabbed", "true");
			});
		}
	}
}

if (!customElements.get("hyperkit-sortable-handle"))
	customElements.define("hyperkit-sortable-handle", HyperkitSortableHandle);

export class HyperkitSortable extends HyperkitElement<{
	events: { type: "sorted"; detail: { positions: string[] } };
	propagatedEvents: undefined;
}> {
	requiredChildren = ["hyperkit-sortable-item"];

	connectedCallback() {
		super.connectedCallback();

		this.setAttribute("role", "list");
		this.setAttribute("aria-live", "polite"); // Notify screen readers of changes

		requestAnimationFrame(() => {
			this.setupDragAndDrop();
			this.updatePositions();
		});
	}

	private setupDragAndDrop() {
		this.addEventListener("dragover", (event) => {
			event.preventDefault();

			const draggingItem = this.querySelector<HyperkitSortableItem>(
				'[data-dragging="true"]',
			);

			if (!draggingItem || draggingItem.closest("hyperkit-sortable") !== this)
				return;

			const afterElement = this.getDragAfterElement(event.clientY);

			this.clearDragIndicators();

			if (afterElement == null) {
				const lastItem = this.lastElementChild as HyperkitSortableItem;
				if (lastItem && lastItem !== draggingItem) lastItem.dataset.after = "";
			} else {
				afterElement.dataset.before = "";
				const previousSibling =
					afterElement.previousElementSibling as HyperkitSortableItem;
				if (previousSibling && previousSibling !== draggingItem)
					previousSibling.dataset.after = "";
			}
		});

		this.addEventListener("drop", (event) => {
			event.preventDefault();

			const draggingItem = this.querySelector(
				'[data-dragging="true"]',
			) as HTMLElement;

			if (!draggingItem || draggingItem.closest("hyperkit-sortable") !== this)
				return;

			const afterElement = this.getDragAfterElement(event.clientY);

			if (draggingItem) {
				afterElement == null
					? this.appendChild(draggingItem)
					: this.insertBefore(draggingItem, afterElement);
			}

			this.clearDragIndicators();
			this.updatePositions();
			this.emitSortedEvent();
		});

		this.addEventListener("dragend", () => {
			this.clearDragIndicators();
			this.updateLiveRegion("Item reordered.");
		});

		this.addEventListener("dragleave", () => this.clearDragIndicators());
	}

	private clearDragIndicators() {
		const items = this.querySelectorAll<HyperkitSortableItem>(
			"hyperkit-sortable-item",
		);
		for (const item of Array.from(items)) {
			delete item.dataset.after;
			delete item.dataset.before;
		}
	}

	private getDragAfterElement(y: number) {
		const draggableElements = Array.from(
			this.querySelectorAll<HyperkitSortableItem>(
				"hyperkit-sortable-item:not([data-dragging='true'])",
			),
		);

		return draggableElements.reduce<{
			offset: number;
			element: HyperkitSortableItem | null;
		}>(
			(closest, child) => {
				const box = child.getBoundingClientRect();
				const offset = y - box.top - box.height / 2;

				if (offset < 0 && offset > closest.offset)
					return { offset, element: child };

				return closest;
			},
			{ offset: Number.NEGATIVE_INFINITY, element: null },
		).element;
	}

	private updatePositions() {
		const items = this.querySelectorAll<HyperkitSortableItem>(
			"hyperkit-sortable-item",
		);
		items.forEach((item, index) => item.updatePosition(index + 1));
	}

	private emitSortedEvent() {
		const positions = Array.from(
			this.querySelectorAll<HyperkitSortableItem>("hyperkit-sortable-item"),
		).map((item) => item.id);
		this.fire("sorted", { detail: { positions } });
	}

	private updateLiveRegion(message: string) {
		const liveRegion = document.createElement("div");
		liveRegion.setAttribute("role", "alert");
		liveRegion.setAttribute("aria-live", "assertive");
		liveRegion.style.position = "absolute";
		liveRegion.style.height = "1px";
		liveRegion.style.width = "1px";
		liveRegion.style.overflow = "hidden";
		liveRegion.textContent = message;
		document.body.appendChild(liveRegion);
		setTimeout(() => {
			document.body.removeChild(liveRegion);
		}, 1000);
	}
}

if (!customElements.get("hyperkit-sortable"))
	customElements.define("hyperkit-sortable", HyperkitSortable);
