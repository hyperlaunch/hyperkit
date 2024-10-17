export interface BaseEvent {
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: allow any detail
	detail?: any;
}

type PermittedPropTypes = "string" | "number" | "boolean" | "date";
type MappedReturnPropTypes = PermittedPropTypes & null;

export abstract class HyperkitElement<
	Options extends {
		events?: BaseEvent | never;
		propagatedEvents?: BaseEvent | never;
		propTypes?: Record<string, PermittedPropTypes>;
	} = {
		events: never;
		propagatedEvents: never;
		propTypes: Record<string, never>;
	},
> extends HTMLElement {
	// TODO: Find out if I can avoid replicating this somehow
	propTypes?: Options["propTypes"];
	requiredParent?: string;
	requiredChildren?: string[];
	requiredSiblings?: string[];

	connectedCallback() {
		this.validateStructure();
	}

	private validateStructure() {
		for (const selector of this.requiredChildren || [])
			if (!this.querySelector(selector))
				console.error(
					`Required child for ${this.constructor.name} is missing: ${selector}`,
					this,
				);

		for (const selector of this.requiredSiblings || [])
			if (!document.querySelector(selector))
				console.error(
					`Required siblings for ${this.constructor.name} is missing: ${selector}`,
					this,
				);

		if (this.requiredParent && !this.parent())
			console.error(
				`${this.constructor.name} must belong to: ${this.requiredParent}`,
				this,
			);
	}

	private parent() {
		return this.requiredParent && this.closest(this.requiredParent);
	}

	public fire<E extends Options["events"] | Options["propagatedEvents"]>(
		eventName: E extends { type: infer T } ? T : never,
		options?: CustomEventInit<E extends { detail: infer D } ? D : never>,
	): void {
		const event = new CustomEvent(eventName as string, { ...options });
		this.dispatchEvent(event);
	}

	public on<
		E extends Options["events"] | Options["propagatedEvents"],
		K extends E extends { type: infer T } ? T : never,
	>(
		eventName: K,
		listener: (
			event: CustomEvent<Extract<E, { type: K }>["detail"]>, // Extract the event detail based on the event type
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void {
		this.addEventListener(
			eventName as string,
			listener as EventListener,
			options,
		);
	}

	// Just to be able to provide the return type xD
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

		const type: string | undefined = this.propTypes?.[name];
		if (type === "string") return String(value) as MappedReturnPropTypes;
		if (type === "number") return Number(value) as MappedReturnPropTypes;
		if (type === "boolean")
			return Boolean(value === "true") as MappedReturnPropTypes;
		if (type === "date") return new Date(value) as MappedReturnPropTypes;

		return null as MappedReturnPropTypes;
	}
}
