type Highlight = {
	title: string;
	body: string;
};

type PublicUrls = {
	en: string;
	ru: string;
};

type Title = {
	en: string;
	ru: string;
};

export type Article = {
	id: number;
	ext_id: number;
	rank: number;
	status: "PUBLISHED" | "DRAFT" | "ARCHIVED"; // Adjust with other possible statuses
	highlight: Highlight;
	public_urls: PublicUrls;
	created_at: string; // ISO 8601 date string
	updated_at: string; // ISO 8601 date string
	published_at: string | null; // ISO 8601 date string or null
	author: string;
	title: Title;
};
