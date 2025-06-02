
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VoiceExpenseCaptureProps {
  onExpenseExtracted: (data: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  }) => void;
}

export const VoiceExpenseCapture = ({ onExpenseExtracted }: VoiceExpenseCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        processAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started! Speak your expense details...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // First convert speech to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (transcriptionError) throw transcriptionError;

      const transcription = transcriptionData.text;
      console.log('Transcription:', transcription);

      if (!transcription || transcription.trim().length === 0) {
        throw new Error("Could not understand the audio. Please try again.");
      }

      // Process transcription with Gemini to extract expense data
      const { data: expenseData, error: expenseError } = await supabase.functions.invoke('process-voice-expense', {
        body: { transcription }
      });

      if (expenseError) throw expenseError;

      const { amount, category, description, date } = expenseData;

      // Validate that we at least have an amount
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error("Could not extract a valid amount from your speech. Please try again with a clearer amount.");
      }

      // Pre-fill the form
      onExpenseExtracted({
        amount: amount.toString(),
        category: category || "others",
        description: description || "Voice expense",
        date: date
      });

      toast.success("Expense details extracted from voice! Please review and confirm.");
    } catch (error: any) {
      console.error("Error processing voice:", error);
      toast.error(error.message || "Failed to process voice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (isProcessing) {
    return (
      <div className="fixed bottom-24 left-6 z-50">
        <div className="bg-white rounded-full shadow-lg p-4 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="text-sm font-medium">Processing voice...</span>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="fixed bottom-24 left-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 z-50"
      onClick={isRecording ? stopRecording : startRecording}
    >
      {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
    </Button>
  );
};
