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
				minDate: { type: String },
				maxDate: { type: String },
				futureOnly: { type: Boolean },
				pastOnly: { type: Boolean },
				includeEventListenerExample: { type: Boolean },
			},
		},
		"masked-input": {
			render: component("./src/astro-components/Examples/MaskedInput.astro"),
			attributes: {
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
				contentHidden: { type: Boolean },
				useTransition: { type: Boolean },
			},
		},
		modal: {
			render: component("./src/astro-components/Examples/Modal.astro"),
			attributes: {
				name: { type: String },
				contentHidden: { type: Boolean },
				useTransition: { type: Boolean },
			},
		},
		disclosure: {
			render: component("./src/astro-components/Examples/Disclosure.astro"),
			attributes: {
				accordion: { type: Boolean },
				useTransition: { type: Boolean },
			},
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
