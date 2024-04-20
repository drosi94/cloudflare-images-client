import { readFile } from "fs/promises";

interface uploadImageProps {
	metadata?: Record<string, unknown>;
	requireSignedURLs?: boolean;
}

interface uploadImageFromUrlProps extends uploadImageProps {
	imageUrl: string;
}

interface uploadImageFromFileProps extends uploadImageProps {
	filePath: string;
}

interface CloudflareImagesResponse {
	success: boolean;
	errors: string[];
	messages: string[];
	result?: {
		continuation_token: string;
		images: CloudflareImageResponse["result"][];
	};
}

interface CloudflareImageResponse {
	errors: string[];
	messages: string[];
	result: {
		filename: string;
		id: string;
		meta: Record<string, unknown>;
		requireSignedURLs: boolean;
		uploaded: string;
		variants: string[];
	};
	success: boolean;
}

interface CloudflareImageStatsResponse {
	errors: string[];
	messages: string[];
	result: {
		count: {
			allowed: number;
			current: number;
		};
	};
	success: boolean;
}
class CloudflareClient {
	private baseUrl = "https://api.cloudflare.com/client/v4";
	private readonly accountId: string;
	private readonly apiToken: string;
	constructor() {
		this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
		this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
	}

	async uploadImageFromUrl({
		imageUrl,
		metadata,
		requireSignedURLs,
	}: uploadImageFromUrlProps) {
		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v1`;

		const formData = new FormData();
		formData.append("url", imageUrl);
		formData.append("metadata", JSON.stringify(metadata));
		formData.append("requireSignedURLs", JSON.stringify(requireSignedURLs));

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
				body: formData,
			});

			const jsonResponse: CloudflareImageResponse = await response.json();

			return jsonResponse;
		} catch (error) {
			console.error("error", error);
			throw new Error("Error uploading image from URL");
		}
	}

	async uploadImageFromFile({ filePath, metadata }: uploadImageFromFileProps) {
		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v1`;

		try {
			const file = (await readFile(filePath)) as unknown as Blob;
			const blob = new Blob([file], { type: "image/png" });
			const formData = new FormData();
			formData.append("file", blob, "nikos");
			formData.append("metadata", JSON.stringify(metadata));

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type":
						"multipart/form-data; boundary=---011000010111000001101001",
					Authorization: `Bearer ${this.apiToken}`,
				},
				body: formData,
			});

			const jsonResponse: CloudflareImageResponse = await response.json();

			return jsonResponse;
		} catch (error) {
			console.log("error", error);
			throw new Error("Error uploading image from File");
		}
	}

	async getImageStatistics() {
		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v1/stats`;

		try {
			const response = await fetch(endpoint, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
			});

			const jsonResponse: CloudflareImageStatsResponse = await response.json();
			return jsonResponse;
		} catch (error) {
			console.error("error", error);
			throw new Error("Error getting image statistics");
		}
	}

	async getImageDetails(imageId: string) {
		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v1/${imageId}`;

		try {
			const response = await fetch(endpoint, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
			});

			const jsonResponse: CloudflareImageResponse = await response.json();
			return jsonResponse;
		} catch (error) {
			console.error("error", error);
			throw new Error("Error getting image details");
		}
	}

	async getImageBlob(imageId: string) {
		if (!imageId) {
			throw new Error("Image ID is required");
		}

		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v1/${imageId}/blob`;

		try {
			const response = await fetch(endpoint, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
			});

			const blob = await response.blob();
			return blob;
		} catch (error) {
			console.error("error", error);
			throw new Error("Error getting image blob");
		}
	}

	async listImages() {
		const endpoint = `${this.baseUrl}/accounts/${this.accountId}/images/v2`;

		try {
			const response = await fetch(endpoint, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.apiToken}`,
				},
			});

			const jsonResponse: CloudflareImagesResponse = await response.json();

			return jsonResponse;
		} catch (error) {
			console.error("error", error);
			throw new Error("Error getting list images");
		}
	}
}

const cloudflareClient = new CloudflareClient();
export default cloudflareClient;
