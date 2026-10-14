export type SyntaxRole =
	| "subject"
	| "time"
	| "location"
	| "negation"
	| "verb"
	| "object";

export interface SyntaxWord {
	id: string;
	characters: string;
	pinyin: string;
	role: SyntaxRole;
	en: string;
	es: string;
}

export interface SyntaxSentence {
	id: string;
	promptEn: string;
	promptEs: string;
	targetCharacters: string;
	targetOrder: string[];
	allowedAlternatives?: string[][];
	wordPool: SyntaxWord[];
}

export interface ValidationResult {
	valid: boolean;
	completed: boolean;
	messageEn: string;
	messageEs: string;
	mismatchIndex?: number;
}

/**
 * Validates whether an ordered sequence of syntax roles follows Mandarin grammatical rules:
 * Canonical: Subject -> Time -> Location -> Negation -> Verb -> Object
 * Allowed variation: Time -> Subject -> Location -> Negation -> Verb -> Object (Time fronting)
 */
export function validateRoleOrdering(roles: SyntaxRole[]): {
	valid: boolean;
	reasonEn: string;
	reasonEs: string;
} {
	if (roles.length <= 1) {
		return {
			valid: true,
			reasonEn: "Valid ordering",
			reasonEs: "Orden válido",
		};
	}

	const roleOrderCanonical: Record<SyntaxRole, number> = {
		subject: 1,
		time: 2,
		location: 3,
		negation: 4,
		verb: 5,
		object: 6,
	};

	const roleOrderTimeFronted: Record<SyntaxRole, number> = {
		time: 0,
		subject: 1,
		location: 3,
		negation: 4,
		verb: 5,
		object: 6,
	};

	const isMonotonic = (arr: number[]) =>
		arr.every((val, idx) => idx === 0 || val >= (arr[idx - 1] ?? 0));

	const canonicalRanks = roles.map((r) => roleOrderCanonical[r]);
	if (isMonotonic(canonicalRanks)) {
		return {
			valid: true,
			reasonEn: "Valid canonical order",
			reasonEs: "Orden canónico válido",
		};
	}

	const timeFrontedRanks = roles.map((r) => roleOrderTimeFronted[r]);
	if (isMonotonic(timeFrontedRanks)) {
		return {
			valid: true,
			reasonEn: "Valid time-fronted order",
			reasonEs: "Orden con tiempo inicial válido",
		};
	}

	// Specific diagnostic hints
	const verbIdx = roles.indexOf("verb");
	const timeIdx = roles.indexOf("time");
	const locIdx = roles.indexOf("location");

	if (verbIdx !== -1 && timeIdx !== -1 && timeIdx > verbIdx) {
		return {
			valid: false,
			reasonEn: "In Mandarin, time words must precede the main verb",
			reasonEs:
				"En mandarín, las palabras de tiempo deben colocarse antes del verbo principal",
		};
	}

	if (verbIdx !== -1 && locIdx !== -1 && locIdx > verbIdx) {
		return {
			valid: false,
			reasonEn:
				"In Mandarin, location (zai + place) precedes the main action verb",
			reasonEs:
				"En mandarín, el lugar (zai + lugar) precede al verbo de acción",
		};
	}

	return {
		valid: false,
		reasonEn:
			"Mandarin syntactic word order is: Subject + Time + Location + Verb + Object",
		reasonEs:
			"El orden de la oración en mandarín es: Sujeto + Tiempo + Lugar + Verbo + Objeto",
	};
}

/**
 * Validates user-placed words against the target sentence requirements.
 */
export function validateSentenceAssembly(
	placedIds: string[],
	sentence: SyntaxSentence,
): ValidationResult {
	if (placedIds.length === 0) {
		return {
			valid: false,
			completed: false,
			messageEn: "Assemble words onto the slot track",
			messageEs: "Arrastre o toque palabras para ubicarlas en la ranura",
		};
	}

	const isTargetMatch = (target: string[]) =>
		placedIds.length === target.length &&
		placedIds.every((id, idx) => id === target[idx]);

	if (isTargetMatch(sentence.targetOrder)) {
		return {
			valid: true,
			completed: true,
			messageEn: "Correct sentence structure!",
			messageEs: "¡Estructura de oración correcta!",
		};
	}

	if (sentence.allowedAlternatives) {
		for (const alt of sentence.allowedAlternatives) {
			if (isTargetMatch(alt)) {
				return {
					valid: true,
					completed: true,
					messageEn: "Correct alternative structure!",
					messageEs: "¡Estructura alternativa correcta!",
				};
			}
		}
	}

	// Check partial prefix correctness
	const isPrefix = (target: string[]) =>
		placedIds.length < target.length &&
		placedIds.every((id, idx) => id === target[idx]);

	if (isPrefix(sentence.targetOrder)) {
		return {
			valid: true,
			completed: false,
			messageEn: "Word order is correct so far, keep going",
			messageEs: "El orden es correcto hasta ahora, continúe",
		};
	}

	if (sentence.allowedAlternatives) {
		for (const alt of sentence.allowedAlternatives) {
			if (isPrefix(alt)) {
				return {
					valid: true,
					completed: false,
					messageEn: "Word order is correct so far, keep going",
					messageEs: "El orden es correcto hasta ahora, continúe",
				};
			}
		}
	}

	// Find the first mismatch index
	let mismatchIdx = 0;
	while (
		mismatchIdx < placedIds.length &&
		placedIds[mismatchIdx] === sentence.targetOrder[mismatchIdx]
	) {
		mismatchIdx++;
	}

	return {
		valid: false,
		completed: placedIds.length === sentence.targetOrder.length,
		messageEn:
			"Word order mismatch. Check standard Mandarin sentence structure",
		messageEs:
			"Orden incorrecto. Revise la estructura sintáctica estándar en mandarín",
		mismatchIndex: mismatchIdx,
	};
}
