interface BaseEvent {
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	detail?: any;
}

export abstract class HyperkitElement<
	T extends BaseEvent | undefined = undefined,
> extends HTMLElement {
	public fire<K extends T extends BaseEvent ? T["type"] : never>(
		eventName: K,
		options?: CustomEventInit<Extract<T, { type: K }>["detail"]>,
	): void {
		const event = new CustomEvent(eventName as string, { ...options });
		this.dispatchEvent(event);
	}

	public on<K extends T extends BaseEvent ? T["type"] : never>(
		eventName: K,
		listener: (event: CustomEvent<Extract<T, { type: K }>["detail"]>) => void,
		options?: boolean | AddEventListenerOptions,
	): void {
		this.addEventListener(
			eventName as string,
			listener as EventListener,
			options,
		);
	}
}
