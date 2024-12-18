import { component, defineMarkdocConfig } from "@astrojs/markdoc/config";
import shiki from "@astrojs/markdoc/shiki";

export default defineMarkdocConfig({
	tags: {
		code: {
			render: component("./src/astro-components/Code.astro"),
			attributes: {
				input: { type: String },
				lang: { type: String },
			},
		},
		example: {
			render: component("./src/astro-components/Example.astro"),
			attributes: {
				hero: { type: Boolean },
			},
		},
		calendar: {
			render: component("./src/astro-components/Examples/Calendar.astro"),
			attributes: {
				for: { type: String },
				value: { type: String },
				min: { type: String },
				max: { type: String },
				futureOnly: { type: Boolean },
				pastOnly: { type: Boolean },
				includeEventListenerExample: { type: Boolean },
			},
		},
		"masked-input": {
			render: component("./src/astro-components/Examples/MaskedInput.astro"),
			attributes: {
				id: { type: String },
				mask: { type: String },
				name: { type: String },
				placeholder: { type: String },
				value: { type: String },
			},
		},
		transition: {
			render: component("./src/astro-components/Examples/Transition.astro"),
			attributes: {
				enterOnConnect: { type: Boolean },
				hidden: { type: Boolean },
			},
		},
		popover: {
			render: component("./src/astro-components/Examples/Popover.astro"),
			attributes: {
				id: { type: String },
				contentHidden: { type: Boolean },
				useTransition: { type: Boolean },
			},
		},
		modal: {
			render: component("./src/astro-components/Examples/Modal.astro"),
			attributes: {
				id: { type: String },
				contentHidden: { type: Boolean },
				useTransition: { type: Boolean },
			},
		},
		detail: {
			render: component("./src/astro-components/Examples/Detail.astro"),
			attributes: {
				id: { type: String },
				useTransition: { type: Boolean },
			},
		},
		accordion: {
			render: component("./src/astro-components/Examples/Accordion.astro"),
			attributes: {
				useTransition: { type: Boolean },
			},
		},
		"arrow-nav": {
			render: component("./src/astro-components/Examples/ArrowNav.astro"),
		},
		select: {
			render: component("./src/astro-components/Examples/Select.astro"),
			attributes: {
				id: { type: String },
				useTransition: { type: Boolean },
				useArrowNav: { type: Boolean },
				for: { type: String },
				value: { type: String },
				optionsHidden: { type: Boolean },
			},
		},
		sortable: {
			render: component("./src/astro-components/Examples/Sortable.astro"),
			attributes: {
				id: { type: String },
				includeInputs: { type: Boolean },
			},
		},
		"fieldset-repeater": {
			render: component(
				"./src/astro-components/Examples/FieldsetRepeater/FieldsetRepeater.astro",
			),
		},
		"sortable-fieldset": {
			render: component(
				"./src/astro-components/Examples/FieldsetRepeater/SortableFieldsetRepeater.astro",
			),
		},
		"transition-fieldset": {
			render: component(
				"./src/astro-components/Examples/FieldsetRepeater/TransitionFieldsetRepeater.astro",
			),
		},
		copyable: {
			render: component("./src/astro-components/Examples/Copyable.astro"),
		},
	},
	extends: [
		shiki({
			themes: {
				light: "github-light-high-contrast",
				dark: "github-dark-high-contrast",
			},
			wrap: true,
		}),
	],
});
