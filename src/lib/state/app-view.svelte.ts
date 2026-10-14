export type AppView = "lab" | "studio" | "review";

class AppViewStore {
	current = $state<AppView>("lab");

	set(view: AppView): void {
		this.current = view;
	}
}

export const appView = new AppViewStore();
