import { useEffect } from "react";

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: Iterable<Array<{ transcript: string }>> }) => void) | null;
  onerror: ((event: Event & { error?: unknown }) => void) | null;
  onend: (() => void) | null;
}

const VoiceTrigger = ({ setIsListening }: { setIsListening: (isListening: boolean) => void }) => {
	useEffect(() => {
	const SpeechRecognition =
			(window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).webkitSpeechRecognition ||
			(window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).SpeechRecognition;

		if (!SpeechRecognition) {
			console.error("SpeechRecognition not supported in this browser.");
			return;
		}

		const recognition = new (SpeechRecognition as new () => ISpeechRecognition)();
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = "en-US";

		const handleResult = (event: { results: Iterable<Array<{ transcript: string }>> }) => {
			const transcript = Array.from(event.results)
				.map((result: Array<{ transcript: string }>) => result[0].transcript)
				.join(" ")
				.toLowerCase();

			if (transcript.includes("hey spendly")) {
				setIsListening(true);
			}
		};

		recognition.onresult = handleResult;

		recognition.onend = () => {
			// Restart to ensure continuous listening
			try {
				recognition.start();
			} catch (e) {
				console.warn("Recognition restart failed:", e);
			}
		};

		recognition.onerror = (e: Event & { error?: unknown }) => {
			console.error("Speech recognition error:", e);
		};

		// Start listening immediately
		try {
			recognition.start();
		} catch (e) {
			console.error("Speech recognition start failed:", e);
		}

		// Cleanup on unmount
		return () => recognition.stop();
	}, []);

	return null;
};

export default VoiceTrigger;
