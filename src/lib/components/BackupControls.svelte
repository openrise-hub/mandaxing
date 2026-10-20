<script lang="ts">
	import {
		exportDatabaseToJson,
		importDatabaseFromJson,
	} from "#lib/db/backup";
	import { t } from "#lib/i18n/index.svelte";

	type BackupStatus = "idle" | "success" | "error" | "exportError";

	let status = $state<BackupStatus>("idle");

	async function exportBackup(): Promise<void> {
		try {
			const json = await exportDatabaseToJson();
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `mandaxing-backup-${new Date().toISOString().slice(0, 10)}.json`;
			anchor.click();
			URL.revokeObjectURL(url);
			status = "idle";
		} catch {
			status = "exportError";
		}
	}

	async function importBackup(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			await importDatabaseFromJson(await file.text());
			status = "success";
		} catch {
			status = "error";
		} finally {
			input.value = "";
		}
	}
</script>

<section class="mech-card flex flex-col gap-3 p-4">
	<h2 class="font-display text-sm font-bold uppercase tracking-wide">
		{t().backup.title}
	</h2>
	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			class="mech-btn px-3 py-1.5 text-sm"
			onclick={() => void exportBackup()}
		>
			{t().backup.exportAction}
		</button>
		<label class="mech-btn cursor-pointer px-3 py-1.5 text-sm">
			{t().backup.importAction}
			<input
				type="file"
				accept="application/json,.json"
				class="hidden"
				onchange={(event) => void importBackup(event)}
			/>
		</label>
		<div role="status" aria-live="polite">
			{#if status === "success"}
				<span class="data-pill bg-success px-2 py-1 text-xs text-card font-bold">
					{t().backup.importSuccess}
				</span>
			{:else if status === "error"}
				<span class="data-pill bg-alert px-2 py-1 text-xs text-card font-bold">
					{t().backup.importError}
				</span>
			{:else if status === "exportError"}
				<span class="data-pill bg-alert px-2 py-1 text-xs text-card font-bold">
					{t().backup.exportError}
				</span>
			{/if}
		</div>
	</div>
</section>
