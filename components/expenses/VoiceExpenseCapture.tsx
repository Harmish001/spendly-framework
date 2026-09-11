import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EnhancedAnimation from "../layout/Animation";

interface VoiceExpenseCaptureProps {
  onExpenseExtracted: (data: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  }) => void;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: { results: Iterable<Array<{ transcript: string }>> }) => void) | null;
  onerror: ((event: Event & { error?: unknown }) => void) | null;
  onend: (() => void) | null;
}



export const VoiceExpenseCapture = ({
  onExpenseExtracted,
}: VoiceExpenseCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

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
      (window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).webkitSpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown }).SpeechRecognition;
    const recognition = new (SpeechRecognition as new () => ISpeechRecognition)();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: { results: Iterable<Array<{ transcript: string }>> }) => {
      const transcript = Array.from(event.results)[0][0].transcript;
      console.log("Speech recognition result:", transcript);
      processTranscription(transcript);
    };

    recognition.onerror = (event: Event & { error?: unknown }) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);

      if (event.error === "not-allowed") {
        toast.error(
          "Microphone permission denied. Please allow microphone access.",
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
  }, []);

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        toast.error("Speech recognition not supported in this browser");
        return;
      }

      recognitionRef.current.start();
      toast.success("Recording started! Speak your expense details...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
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
          "Could not understand the audio. Please try speaking clearly and try again.",
        );
      }

      console.log("Simulating Voice AI extraction...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const expenseData = {
        amount: "15.00",
        category: "transport",
        date: new Date().toISOString().split("T")[0],
        description: "Mocked Voice Expense: " + transcription,
      };

      const { amount, category, description, date } = expenseData;

      // Validate that we at least have an amount
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error(
          "Could not extract a valid amount from your speech. Please try again with a clearer amount.",
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
        "Expense details extracted from voice! Please review and confirm.",
      );
    } catch (error: unknown) {
      console.error("Error processing voice:", error);
      toast.error(
        (error as Error).message || "Failed to process voice. Please try again.",
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
