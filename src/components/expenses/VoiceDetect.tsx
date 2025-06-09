import React, { useEffect } from "react";

const VoiceTrigger = ({ setIsListening }) => {
	useEffect(() => {
		const SpeechRecognition =
			(window as any).webkitSpeechRecognition ||
			(window as any).SpeechRecognition;

		if (!SpeechRecognition) {
			console.error("SpeechRecognition not supported in this browser.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = "en-US";

		const handleResult = (event) => {
			const transcript = Array.from(event.results)
				.map((result) => result[0].transcript)
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

		recognition.onerror = (e: any) => {
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
