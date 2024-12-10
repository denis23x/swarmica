import { Article } from "./types/article.ts";
import { Instance, Locale } from "./types/instance.ts";
import { Category } from "./types/category.ts";
import { ChangeEvent, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { getCategories, getInstance, searchArticles } from "./services/api.ts";
import { marked } from "marked";
import { getLS, setLS } from "./services/localStorage.ts";

function App() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [locales, setLocales] = useState<Locale[]>([]);
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const [activeCategoriesId, setActiveCategoriesId] = useState<number[]>([]);
	const [activeLocale, setActiveLocale] = useState<Locale>("en");

	const [search, setSearch] = useState<string>("");
	const [searchDebounced] = useDebounce<string>(search, 1000);

	const [visitedArticlesId, setVisitedArticlesId] = useState<number[]>(getLS("visitedArticlesId") || []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [xInstance, xCategories]: [Instance, Category[]] = await Promise.all([getInstance(), getCategories()]);

				setActiveLocale(xInstance.default_locale);
				setLocales(xInstance.locales);
				setCategories(xCategories);
			} catch (error: unknown) {
				handleFetchError(error, "Failed to load data");
			} finally {
				setLoading(false);
			}
		};

		fetchData().then(() => console.debug("The data has been received"));
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (!searchDebounced) {
				setArticles([]);
				return;
			}

			setLoading(true);
			try {
				const articleList: Article[] = await searchArticles(activeLocale, activeCategoriesId, searchDebounced);

				setArticles(articleList);
			} catch (error: unknown) {
				handleFetchError(error, "Failed to fetch articles");
			} finally {
				setLoading(false);
			}
		};

		fetchData().then(() => console.debug("The articles has been received"));
	}, [searchDebounced, activeLocale, activeCategoriesId]);

	const handleFetchError = (error: unknown, message: string) => {
		// TODO: toast, alert, snack, ..etc

		console.debug(message);
		console.error(error);
	};

	const handleActiveCategoriesId = (newId: number) => {
		setActiveCategoriesId((activeCategoriesId: number[]) => {
			if (activeCategoriesId.includes(newId)) {
				return activeCategoriesId.filter((oldId: number) => oldId !== newId);
			} else {
				return activeCategoriesId.concat(newId);
			}
		});
	};

	const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, articleId: number) => {
		event.preventDefault();

		setVisitedArticlesId((visitedArticlesId: number[]) => {
			const newVisitedArticlesId: number[] = visitedArticlesId.concat(articleId);

			setLS("visitedArticlesId", newVisitedArticlesId);

			return newVisitedArticlesId;
		});

		window.open(event.currentTarget.href, "_blank");
	};

	return (
		<main className={"grid gap-4 max-w-[1280px] mx-auto p-4"}>
			<header className={"grid gap-4 border border-zinc-200 rounded-lg bg-white p-4"}>
				<h1 className={"text-2xl font-light"}>Search</h1>
				<input
					className={"border border-zinc-200 rounded p-2"}
					type={"search"}
					placeholder={"Type your query.."}
					value={search}
					disabled={loading}
					onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
				/>
				<p className={"text-sm opacity-50"}>
					Example:{" "}
					<span className={"underline cursor-pointer"} onClick={() => setSearch("Swarmica")}>
						Swarmica
					</span>
				</p>
			</header>
			<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg bg-white p-4"}>
				<span className={"text-2xl font-light"}>Locales ({locales?.length})</span>
				{locales?.length ? (
					<ul className={"flex flex-wrap gap-4"}>
						{locales.map((locale: Locale, i: number) => (
							<li key={i}>
								<button
									className={`${activeLocale === locale ? "bg-sky-400 text-neutral-50 border border-transparent" : "border border-zinc-200"} rounded uppercase p-2`}
									disabled={loading}
									onClick={() => setActiveLocale(locale)}
								>
									{locale}
								</button>
							</li>
						))}
					</ul>
				) : (
					<span className="text-lg">Loading..</span>
				)}
			</section>
			<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg bg-white p-4"}>
				<span className={"text-2xl font-light"}>Categories ({categories?.length})</span>
				{categories?.length ? (
					<ul className={"flex flex-wrap gap-4"}>
						{categories.map((category: Category) => (
							<li
								className={`${activeCategoriesId.includes(category.id) ? "bg-sky-400 text-neutral-50 border border-transparent" : "border border-zinc-200"} flex items-center rounded-lg cursor-pointer overflow-hidden`}
								key={category.id}
								onClick={() => handleActiveCategoriesId(category.id)}
							>
								<img
									className={"size-12 object-cover bg-zinc-200"}
									src={category.image_path}
									loading={"lazy"}
									alt={category.name[activeLocale]}
								/>
								<div className={"flex flex-col px-2"}>
									<span className={"font-base"}>{category.name[activeLocale]}</span>
									<span className={"text-sm"}>Id: {category.id}</span>
								</div>
							</li>
						))}
					</ul>
				) : (
					<span className="text-lg">Loading..</span>
				)}
			</section>
			{searchDebounced && (
				<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg bg-white p-4"}>
					<span className={"text-2xl font-light"}>Articles ({loading ? 0 : articles?.length})</span>
					{loading ? (
						<span className="text-lg">Loading..</span>
					) : articles?.length ? (
						<ul className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
							{articles.map((article: Article) => (
								<li className={"grid gap-4 border border-zinc-200 rounded-lg p-4"} key={article.id}>
									<article className={"relative flex flex-col gap-2 max-h-64 overflow-hidden"}>
										<span
											className={"text-2xl font-semibold prose max-w-full"}
											dangerouslySetInnerHTML={{ __html: marked(article.highlight.title) }}
										></span>
										<p
											className={"text-sm prose max-w-full"}
											dangerouslySetInnerHTML={{ __html: marked(article.highlight.body) }}
										></p>
										<span className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-white to-transparent pointer-events-none"></span>
									</article>
									{visitedArticlesId.includes(article.id) ? (
										<a
											className={"block border border-zinc-200 rounded text-center mt-auto p-2"}
											href={article.public_urls[activeLocale]}
											target={"_blank"}
											rel={"noreferrer"}
										>
											Already visited
										</a>
									) : (
										<a
											className={"block bg-sky-400 text-neutral-50 rounded text-center mt-auto p-2"}
											href={article.public_urls[activeLocale]}
											onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleLinkClick(e, article.id)}
										>
											Read more
										</a>
									)}
								</li>
							))}
						</ul>
					) : (
						<span className="text-lg">Not found</span>
					)}
				</section>
			)}
		</main>
	);
}

export default App;
