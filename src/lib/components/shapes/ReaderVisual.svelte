<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path
			d="M 76,128 Q 75,78 64,36"
			stroke="var(--color-tone-1, #F59E0B)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>
		<path
			d="M 84,128 Q 85,78 96,36"
			stroke="var(--color-tone-1, #F59E0B)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>

		<path
			d="M 76,128 Q 64,84 48,46"
			stroke="var(--color-tone-2, #EA580C)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>
		<path
			d="M 84,128 Q 96,84 112,46"
			stroke="var(--color-tone-2, #EA580C)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>

		<path
			d="M 76,128 Q 50,92 32,60"
			stroke="var(--color-tone-3, #DC2626)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>
		<path
			d="M 84,128 Q 110,92 128,60"
			stroke="var(--color-tone-3, #DC2626)"
			stroke-width="8"
			stroke-linecap="square"
			fill="none"
		/>
	</svg>
</div>
