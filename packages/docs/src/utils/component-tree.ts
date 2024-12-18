import { getEntry } from "astro:content";

export async function getComponentTree() {
	const groups = {
		UI: ["modal", "popover", "detail"],
		UX: ["copyable"],
		Form: [
			"form",
			"select",
			"sortable",
			"fieldset-repeater",
			"calendar",
			"masked-input",
		],
		Primitives: ["transition", "link", "arrow-nav"],
	};

	return await Promise.all(
		Object.entries(groups).map(async ([group, items]) => ({
			name: group,
			items: await Promise.all(
				items.map((item) => getEntry("hyperkit-elements", item)),
			),
		})),
	);
}
