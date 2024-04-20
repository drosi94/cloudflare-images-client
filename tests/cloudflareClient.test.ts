import { expect, test } from "vitest";
import { cloudflareClient } from "../src/index";

test("uploadImage From Url", async () => {
	const response = await cloudflareClient.uploadImageFromUrl({
		imageUrl:
			"https://images.squarespace-cdn.com/content/v1/60f1a490a90ed8713c41c36c/1629223610791-LCBJG5451DRKX4WOB4SP/37-design-powers-url-structure.jpeg",
		metadata: {},
	});

	expect(response.errors).toEqual([]);
	expect(response.messages).toEqual([]);
	expect(response.success).toBe(true);
	expect(response.result.filename).toBeTypeOf("string");
	expect(response.result.id).toBeTypeOf("string");
	expect(response.result.meta).toEqual({});
	expect(response.result.requireSignedURLs).toBe(false);
	expect(response.result.uploaded).toBeTypeOf("string");
	expect(response.result.variants.length).toBeGreaterThan(0);
});
