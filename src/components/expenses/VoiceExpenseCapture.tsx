import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AndroidPermissions } from "@/utils/AndroidPermissions";
import { Capacitor } from "@capacitor/core";
import EnhancedAnimation from "../layout/Animation";

interface VoiceExpenseCaptureProps {
	onExpenseExtracted: (data: {
		amount: string;
		category: string;
		description: string;
		date?: string;
	}) => void;
}

declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}

export const VoiceExpenseCapture = ({
	onExpenseExtracted,
}: VoiceExpenseCaptureProps) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [hasPermission, setHasPermission] = useState(false);
	const recognitionRef = useRef<any>(null);

	useEffect(() => {
		// Check if browser supports speech recognition
		if (
			!("SpeechRecognition" in window) &&
			!("webkitSpeechRecognition" in window)
		) {
			console.warn("Speech recognition not supported");
			return;
		}

		// Initialize speech recognition
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new SpeechRecognition();

		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.lang = "en-US";

		recognition.onstart = () => {
			setIsRecording(true);
		};

		recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			console.log("Speech recognition result:", transcript);
			processTranscription(transcript);
		};

		recognition.onerror = (event: any) => {
			console.error("Speech recognition error:", event.error);
			setIsRecording(false);

			if (event.error === "not-allowed") {
				toast.error(
					"Microphone permission denied. Please allow microphone access."
				);
			} else if (event.error === "no-speech") {
				toast.error("No speech detected. Please try again.");
			} else {
				toast.error("Speech recognition failed. Please try again.");
			}
		};

		recognition.onend = () => {
			console.log("Speech recognition ended");
			setIsRecording(false);
		};

		recognitionRef.current = recognition;
		checkPermissions();
	}, []);

	const checkPermissions = async () => {
		if (Capacitor.isNativePlatform()) {
			const permissions = await AndroidPermissions.checkAllPermissions();
			setHasPermission(permissions.microphone);
		} else {
			// For web, assume permission is available
			setHasPermission(true);
		}
	};

	const requestPermission = async () => {
		const result = await AndroidPermissions.requestMicrophonePermission();
		if (result.granted) {
			setHasPermission(true);
			toast.success("Microphone permission granted!");
			return true;
		} else {
			toast.error(result.message);
			return false;
		}
	};

	const startRecording = async () => {
		try {
			// Check if speech recognition is available
			if (!recognitionRef.current) {
				toast.error("Speech recognition not supported in this browser");
				return;
			}

			// On Android, always request permission first
			if (Capacitor.isNativePlatform() && !hasPermission) {
				const granted = await requestPermission();
				if (!granted) {
					return;
				}
			}

			recognitionRef.current.start();
			toast.success("Recording started! Speak your expense details...");
		} catch (error) {
			console.error("Error starting recording:", error);

			// Try to request permission again on error
			if (Capacitor.isNativePlatform()) {
				await requestPermission();
			} else {
				toast.error("Could not access microphone. Please check permissions.");
			}
		}
	};

	const stopRecording = () => {
		if (recognitionRef.current && isRecording) {
			recognitionRef.current.stop();
		}
	};

	const processTranscription = async (transcription: string) => {
		setIsProcessing(true);
		try {
			console.log("Processing transcription:", transcription);

			if (!transcription || transcription.trim().length === 0) {
				throw new Error(
					"Could not understand the audio. Please try speaking clearly and try again."
				);
			}

			// Process transcription with Gemini to extract expense data
			const { data: expenseData, error: expenseError } =
				await supabase.functions.invoke("process-voice-expense", {
					body: {
						transcription,
					},
				});

			if (expenseError) {
				console.error("Expense processing error:", expenseError);
				throw expenseError;
			}

			const { amount, category, description, date } = expenseData;

			// Validate that we at least have an amount
			if (!amount || isNaN(parseFloat(amount))) {
				throw new Error(
					"Could not extract a valid amount from your speech. Please try again with a clearer amount."
				);
			}

			// Pre-fill the form
			onExpenseExtracted({
				amount: amount.toString(),
				category: category || "others",
				description: description || "Voice expense",
				date: date,
			});

			toast.success(
				"Expense details extracted from voice! Please review and confirm."
			);
		} catch (error: any) {
			console.error("Error processing voice:", error);
			toast.error(
				error.message || "Failed to process voice. Please try again."
			);
		} finally {
			setIsProcessing(false);
		}
	};

	if (isProcessing) {
		return (
			<div className="fixed bottom-32 left-4 z-50">
				<div className="bg-white rounded-full shadow-lg p-4 flex items-center gap-2">
					<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
					<span className="text-sm font-medium">Processing voice...</span>
				</div>
			</div>
		);
	}

	return (
		<>
			{isRecording && (
				<div
					className="fixed z-50"
					style={{
						transform: "translate(-50%, -50%)",
						top: "80%",
						left: "50%",
					}}
				>
					<EnhancedAnimation isActive={isRecording} />
				</div>
			)}
			<Button
				variant="outline"
				onClick={isRecording ? stopRecording : startRecording}
				className="fixed bottom-24 left-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 z-50"
			>
				{isRecording ? (
					<MicOff className="h-6 w-6" />
				) : (
					<Mic className="h-6 w-6" />
				)}
			</Button>
		</>
	);
};