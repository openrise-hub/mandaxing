import sentencesData from "#lib/data/syntax-sentences.json";
import {
	type SyntaxSentence,
	type SyntaxWord,
	type ValidationResult,
	validateSentenceAssembly,
} from "#lib/syntax/validator";

class SyntaxAssemblyState {
	sentences = $state<SyntaxSentence[]>(sentencesData as SyntaxSentence[]);
	currentIndex = $state(0);
	placedWordIds = $state<string[]>([]);
	validation = $state<ValidationResult | null>(null);

	get currentSentence(): SyntaxSentence {
		return (
			this.sentences[this.currentIndex] ?? (this.sentences[0] as SyntaxSentence)
		);
	}

	get placedWords(): SyntaxWord[] {
		const poolMap = new Map(
			this.currentSentence.wordPool.map((w) => [w.id, w]),
		);
		return this.placedWordIds.flatMap((id) => {
			const item = poolMap.get(id);
			return item ? [item] : [];
		});
	}

	get availablePool(): SyntaxWord[] {
		const placedSet = new Set(this.placedWordIds);
		return this.currentSentence.wordPool.filter((w) => !placedSet.has(w.id));
	}

	placeWord(wordId: string): void {
		if (this.placedWordIds.includes(wordId)) return;
		this.placedWordIds = [...this.placedWordIds, wordId];
		this.validation = null;
	}

	removeWord(wordId: string): void {
		this.placedWordIds = this.placedWordIds.filter((id) => id !== wordId);
		this.validation = null;
	}

	clear(): void {
		this.placedWordIds = [];
		this.validation = null;
	}

	validate(): ValidationResult {
		const result = validateSentenceAssembly(
			this.placedWordIds,
			this.currentSentence,
		);
		this.validation = result;
		return result;
	}

	next(): void {
		if (this.currentIndex < this.sentences.length - 1) {
			this.currentIndex++;
			this.clear();
		}
	}

	previous(): void {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			this.clear();
		}
	}
}

export const syntaxAssembly = new SyntaxAssemblyState();
