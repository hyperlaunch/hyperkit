interface BaseEvent {
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: allow any detail
	detail?: any;
}

type PermittedPropTypes = "string" | "number" | "boolean" | "date";
type MappedReturnPropTypes = PermittedPropTypes & null;

export abstract class HyperkitElement<
	Options extends {
		events?: BaseEvent | undefined;
		propTypes?: Record<string, PermittedPropTypes>;
	} = { events: undefined; propTypes: Record<string, never> },
> extends HTMLElement {
	public props: Options["propTypes"] = {};

	public fire<
		K extends Options["events"] extends BaseEvent
			? Options["events"]["type"]
			: never,
	>(
		eventName: K,
		options?: CustomEventInit<
			Extract<Options["events"], { type: K }>["detail"]
		>,
	): void {
		const event = new CustomEvent(eventName as string, { ...options });
		this.dispatchEvent(event);
	}

	public on<
		K extends Options["events"] extends BaseEvent
			? Options["events"]["type"]
			: never,
	>(
		eventName: K,
		listener: (
			event: CustomEvent<Extract<Options["events"], { type: K }>["detail"]>,
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void {
		this.addEventListener(
			eventName as string,
			listener as EventListener,
			options,
		);
	}

	public prop<Name extends keyof Options["propTypes"]>(
		name: Name,
	): Options["propTypes"][Name] extends "string"
		? string
		: Options["propTypes"][Name] extends "number"
			? number
			: Options["propTypes"][Name] extends "boolean"
				? boolean
				: Options["propTypes"][Name] extends "date"
					? Date
					: null {
		const value = this.getAttribute(String(name));

		if (!value) return null as MappedReturnPropTypes;

		const type: string | undefined = this.props?.[name];
		if (type === "string") return String(value) as MappedReturnPropTypes;
		if (type === "number") return Number(value) as MappedReturnPropTypes;
		if (type === "boolean")
			return Boolean(value === "true") as MappedReturnPropTypes;
		if (type === "date") return new Date(value) as MappedReturnPropTypes;

		return null as MappedReturnPropTypes;
	}
}
