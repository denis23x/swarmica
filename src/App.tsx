import { Article } from "./types/article.ts";
import { Instance, Locale } from "./types/instance.ts";
import { Category } from "./types/category.ts";
import { ChangeEvent, useEffect, useState } from "react";
import { Pagination } from "./types/pagination.ts";
import { useDebounce } from "use-debounce";

function App() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [locales, setLocales] = useState<Locale[]>([]);
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const [activeCategoriesId, setActiveCategoriesId] = useState<number[]>([]);
	const [activeLocale, setActiveLocale] = useState<Locale>("ru");

	const [search, setSearch] = useState<string>("");
	const [searchDebounced] = useDebounce<string>(search, 1000);

	useEffect(() => {
		const getLocales = async (): Promise<Locale[]> => {
			return fetch("/api/instance/")
				.then(r => r.json())
				.then((i: Instance) => {
					setActiveLocale(i.default_locale);

					return i.locales;
				});
		};

		const getCategories = async (): Promise<Category[]> => {
			return fetch("/api/categories/")
				.then(r => r.json())
				.then((a: Pagination<Category>) => a.results);
		};

		const fetchData = async () => {
			try {
				const [xLocales, xCategories]: [Locale[], Category[]] = await Promise.all([getLocales(), getCategories()]);

				setLocales(xLocales);
				setCategories(xCategories);
			} catch (error: unknown) {
				// TODO: toast, alert, snack, ..etc

				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData().then(() => console.debug("The data has been received"));
	}, []);

	useEffect(() => {
		if (searchDebounced) {
			const getArticles = async (): Promise<Article[]> => {
				const queryParams: string = new URLSearchParams({
					categories: activeCategoriesId.join(","),
					locale: activeLocale,
					search: searchDebounced,
				}).toString();

				return fetch("/api/search/articles/?" + queryParams)
					.then(r => r.json())
					.then((i: Pagination<Article>) => i.results);
			};

			const fetchData = async () => {
				setLoading(true);

				try {
					const xArticles: Article[] = await getArticles();

					setArticles(xArticles);
				} catch (error: unknown) {
					// TODO: toast, alert, snack, ..etc

					console.error(error);
				} finally {
					setLoading(false);
				}
			};

			fetchData().then(() => console.debug("Articles list has been received"));
		} else {
			setArticles([]);
		}
	}, [searchDebounced, activeLocale, activeCategoriesId]);

	const handleActiveCategoriesId = (newId: number) => {
		setActiveCategoriesId((activeCategoriesId: number[]) => {
			if (activeCategoriesId.includes(newId)) {
				return activeCategoriesId.filter((oldId: number) => oldId !== newId);
			} else {
				return activeCategoriesId.concat(newId);
			}
		});
	};

	return (
		<main className={"grid gap-4 max-w-[1440px] mx-auto p-4"}>
			<header className={"grid gap-4 border border-zinc-200 rounded-lg p-4"}>
				<h1 className={"text-2xl font-light uppercase"}>Swarmica</h1>
				<input
					className={"border border-zinc-200 rounded p-2"}
					type={"search"}
					placeholder={"Type your query.."}
					value={search}
					disabled={loading}
					onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
				/>
				<p className={"text-sm opacity-50"}>Example: How is hex radar diagram in a scorecard is built?</p>
			</header>
			<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg p-4"}>
				<span className={"text-2xl font-light"}>Locales ({locales?.length})</span>
				{locales?.length ? (
					<ul className={"flex flex-wrap gap-4"}>
						{locales.map((locale: Locale, i: number) => (
							<li key={i}>
								<button
									className={`${activeLocale === locale && "bg-sky-400 text-neutral-50"} rounded uppercase p-2`}
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
			<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg p-4"}>
				<span className={"text-2xl font-light"}>Categories ({categories?.length})</span>
				{categories?.length ? (
					<ul className={"flex flex-wrap gap-4"}>
						{categories.map((category: Category) => (
							<li
								className={`${activeCategoriesId.includes(category.id) && "bg-sky-400 text-neutral-50"} flex items-center border border-zinc-200 rounded-lg cursor-pointer overflow-hidden`}
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
				<section className={"flex flex-col gap-4 border border-zinc-200 rounded-lg p-4"}>
					<span className={"text-2xl font-light"}>Articles ({loading ? 0 : articles?.length})</span>
					{loading ? (
						<span className="text-lg">Loading..</span>
					) : articles?.length ? (
						<ul className={"flex flex-wrap gap-4"}>
							{articles.map((article: Article, i: number) => (
								<li key={i}>
									<a href={article.public_urls[activeLocale]} target={"_blank"} rel={"noreferrer"}>
										<article className={"bg-sky-400 text-neutral-50 rounded uppercase p-2"}>
											{article.title[activeLocale]}
										</article>
									</a>
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
