import { Instance } from "../types/instance.ts";
import { Category } from "../types/category.ts";
import { Pagination } from "../types/pagination.ts";
import { Article } from "../types/article.ts";

export const getInstance = async (): Promise<Instance> => {
	const response: Response = await fetch(`/api/instance/`);

	if (!response.ok) {
		throw new Error("Failed to fetch instance data");
	}

	return response.json();
};

export const getCategories = async (): Promise<Category[]> => {
	const response: Response = await fetch(`/api/categories/`);

	if (!response.ok) {
		throw new Error("Failed to fetch categories");
	}

	const data: Pagination<Category> = await response.json();

	return data.results;
};

export const searchArticles = async (locale: string, categoriesId: number[], search: string): Promise<Article[]> => {
	const queryParams: URLSearchParams = new URLSearchParams({
		category: categoriesId.join(","),
		locale,
		search,
	});

	const response: Response = await fetch(`/api/search/articles/?${queryParams.toString()}`);

	if (!response.ok) {
		throw new Error("Failed to fetch articles");
	}

	const data: Pagination<Article> = await response.json();

	return data.results;
};
