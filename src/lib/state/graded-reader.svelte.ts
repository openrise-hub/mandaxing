import { getAudioContext, resumeAudioContext } from "#lib/audio/audio-context";
import { fetchAudioBuffer } from "#lib/audio/cdn-resolver";
import { playSequence } from "#lib/audio/reference-audio";
import passagesData from "#lib/data/graded-passages.json";

export interface GradedSentence {
	id: string;
	hanzi: string;
	pinyin: string;
	en: string;
	es: string;
	syllables: string[];
	tones: number[];
}

export interface CharacterWordLookup {
	character: string;
	pinyin: string;
	en: string;
	es: string;
}

export interface GradedPassage {
	id: string;
	titleHanzi: string;
	titlePinyin: string;
	titleEn: string;
	titleEs: string;
	level: string;
	sentences: GradedSentence[];
	vocabulary: CharacterWordLookup[];
}

class GradedReaderState {
	passages = $state<GradedPassage[]>(passagesData as GradedPassage[]);
	currentPassageIndex = $state(0);
	activeSentenceId = $state<string | null>(null);
	selectedCharacter = $state<CharacterWordLookup | null>(null);
	playbackSpeed = $state<0.75 | 1.0>(1.0);
	isPlaying = $state(false);
	showPinyin = $state(false);

	get currentPassage(): GradedPassage {
		return (
			this.passages[this.currentPassageIndex] ??
			(this.passages[0] as GradedPassage)
		);
	}

	selectCharacter(character: string): void {
		const vocab = this.currentPassage.vocabulary;
		const found = vocab.find((v) => v.character === character);
		if (found) {
			this.selectedCharacter = found;
		} else {
			this.selectedCharacter = {
				character,
				pinyin: "",
				en: "Character",
				es: "Caracter",
			};
		}
	}

	closePopover(): void {
		this.selectedCharacter = null;
	}

	togglePinyin(): void {
		this.showPinyin = !this.showPinyin;
	}

	setSpeed(speed: 0.75 | 1.0): void {
		this.playbackSpeed = speed;
	}

	async playSentence(sentence: GradedSentence): Promise<void> {
		if (this.isPlaying || sentence.syllables.length === 0) return;
		this.isPlaying = true;
		this.activeSentenceId = sentence.id;
		try {
			await resumeAudioContext();
			const context = getAudioContext();
			const buffers = await Promise.all(
				sentence.syllables.map((syllable, index) =>
					fetchAudioBuffer(context, syllable, sentence.tones[index] ?? 0),
				),
			);
			await playSequence(context, buffers);
		} catch {
			// graceful audio fallback
		} finally {
			this.isPlaying = false;
			this.activeSentenceId = null;
		}
	}

	nextPassage(): void {
		if (this.currentPassageIndex < this.passages.length - 1) {
			this.currentPassageIndex++;
			this.closePopover();
			this.activeSentenceId = null;
		}
	}

	previousPassage(): void {
		if (this.currentPassageIndex > 0) {
			this.currentPassageIndex--;
			this.closePopover();
			this.activeSentenceId = null;
		}
	}
}

export const gradedReader = new GradedReaderState();
