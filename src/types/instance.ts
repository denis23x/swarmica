type AuthenticationProvider = "email" | "usergate";

type Feature = "chats" | "telegram" | "sensitive_data" | "wfm" | "qa" | "csat_anytime" | "all"; // Add any other possible features

export type Locale = "en" | "ru"; // Add additional locales if necessary

type License = {
	code: string;
	expires_at: string; // ISO 8601 date string
	features: Feature[];
};

type Limits = {
	agents: number;
};

export type Instance = {
	authentication_providers: AuthenticationProvider[];
	base_url: string;
	brand: string;
	currency: string; // e.g., 'RUB', 'USD', etc.
	default_locale: Locale;
	favicon: string | null; // `null` if no favicon is provided
	features: Feature[];
	html_title: string;
	issue_tracker: "gitlab" | "jira" | "other"; // Expand for other issue trackers
	license: License;
	limits: Limits;
	status: "ACTIVE" | "INACTIVE"; // Add other possible statuses
	locales: Locale[];
	logo: string | null; // `null` if no logo is provided
	n_weekly_aqi: number; // Weekly AQI metric
	n_weekly_lai: number; // Weekly LAI metric
	plan: "ENTERPRISE" | "PRO" | "BASIC"; // Adjust based on your system's plans
	spinner: string | null; // Loading spinner asset, or `null` if not provided
	ticket_form: number; // Represents the ticket form ID
};
