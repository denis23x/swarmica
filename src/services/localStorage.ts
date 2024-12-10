export const setLS = <T>(key: string, value: T): void => {
	try {
		const serializedValue: string = JSON.stringify(value);

		localStorage.setItem(key, serializedValue);
	} catch (error: unknown) {
		console.error(`Error setting ${key} in localStorage`, error);
	}
};

export const getLS = <T>(key: string): T | null => {
	try {
		const serializedValue: string | null = localStorage.getItem(key);

		return serializedValue ? JSON.parse(serializedValue) : null;
	} catch (error: unknown) {
		console.error(`Error getting ${key} from localStorage`, error);

		return null;
	}
};
