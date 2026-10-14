export type AppView =
	| "dashboard"
	| "lab"
	| "studio"
	| "sentences"
	| "matrix"
	| "review"
	| "reader"
	| "settings";

class AppViewStore {
	current = $state<AppView>("dashboard");

	set(view: AppView): void {
		this.current = view;
	}
}

export const appView = new AppViewStore();
