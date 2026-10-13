export interface ToneVariant {
	tone: number;
	pinyin: string;
}

export interface IsolatedToneItem {
	id: string;
	syllable: string;
	tones: ToneVariant[];
}

export interface TonePairItem {
	pair: string;
	pinyin: string;
	hanzi: string;
	en: string;
	es: string;
	syllables: string[];
	tones: number[];
}

export interface MinimalPairVariant {
	syllable: string;
	tone: number;
	pinyin: string;
	hanzi: string;
	en: string;
	es: string;
}

export interface MinimalPairItem {
	id: string;
	contrast: string;
	itemA: MinimalPairVariant;
	itemB: MinimalPairVariant;
}

export interface WordBankItem {
	id: string;
	characters: string;
	pinyin: string;
	syllables: string[];
	tones: number[];
	en: string;
	es: string;
}
