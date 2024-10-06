import { defineCollection, z } from "astro:content";

const componentsCollection = defineCollection({
	type: "content",
	schema: z.object({
		name: z.string(),
		tagline: z.string().optional(),
	}),
});

export const collections = {
	components: componentsCollection,
};
