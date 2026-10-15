<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<div class="relative flex items-center justify-center w-full h-full {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path
			d="M 30,124 L 54,124 A 44 44 0 1 1 106,124 L 130,124"
			stroke="var(--color-tone-2, #EA580C)"
			stroke-width="16"
			stroke-linecap="square"
			stroke-linejoin="miter"
			fill="none"
		/>
	</svg>
</div>
