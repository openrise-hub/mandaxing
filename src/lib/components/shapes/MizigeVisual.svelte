<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const gradientId = `hanzi-gradient-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="relative flex items-center justify-center w-full h-full select-none {className}">
	<svg viewBox="0 0 160 160" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<defs>
			<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--color-tone-1, #F59E0B)" />
				<stop offset="25%" stop-color="var(--color-tone-1, #F59E0B)" />
				<stop offset="25%" stop-color="var(--color-tone-2, #EA580C)" />
				<stop offset="50%" stop-color="var(--color-tone-2, #EA580C)" />
				<stop offset="50%" stop-color="var(--color-tone-3, #DC2626)" />
				<stop offset="75%" stop-color="var(--color-tone-3, #DC2626)" />
				<stop offset="75%" stop-color="var(--color-tone-4, #7F1D1D)" />
				<stop offset="100%" stop-color="var(--color-tone-4, #7F1D1D)" />
			</linearGradient>
		</defs>

		<text
			x="80"
			y="122"
			text-anchor="middle"
			font-family="var(--font-hanzi), 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
			font-weight="900"
			font-size="116"
			fill="url(#{gradientId})"
		>声</text>
	</svg>
</div>
