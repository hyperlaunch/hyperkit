import { defineCollection, z } from "astro:content";

const elementsCollection = defineCollection({
	type: "content",
	schema: z.object({
		name: z.string(),
		tagline: z.string().optional(),
	}),
});

export const collections = {
	"hyperkit-elements": elementsCollection,
};
