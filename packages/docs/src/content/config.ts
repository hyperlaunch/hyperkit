import { defineCollection, z } from "astro:content";

const elementsCollection = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			tagline: z.string().optional(),
			thumbnail: image(),
		}),
});

export const collections = {
	"hyperkit-elements": elementsCollection,
};
