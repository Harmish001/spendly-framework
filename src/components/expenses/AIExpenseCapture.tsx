
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface AIExpenseCaptureProps {
  onExpenseAdded: () => void;
}

export const AIExpenseCapture = ({ onExpenseAdded }: AIExpenseCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const processImageWithAI = async (imageFile: File) => {
    setIsProcessing(true);
    try {
      console.log('Processing image:', imageFile.name, imageFile.size);
      
      // Convert image to base64
      const base64Image = await convertToBase64(imageFile);
      
      console.log('Calling process-expense-image function...');
      
      // Call our edge function to process the image
      const { data, error } = await supabase.functions.invoke('process-expense-image', {
        body: { image: base64Image }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Received data from AI:', data);

      const { amount, category, date, description } = data;

      // Add the expense to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: insertError } = await supabase.from("expenses").insert({
        amount: parseFloat(amount),
        description: description || "AI extracted expense",
        category: category || "others",
        user_id: user.id,
        date: date || new Date().toISOString().split('T')[0]
      });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      toast.success(`Expense of ₹${amount} added successfully!`);
      onExpenseAdded();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error(error.message || "Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, part
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageWithAI(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleCameraCapture = () => {
    // For web, we'll use file input with camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processImageWithAI(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 left-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Add Expense from Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <p className="text-sm text-gray-600 text-center">
            Take a photo or select an image of your bill/receipt to automatically extract expense details
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleCameraCapture}
              disabled={isProcessing}
              className="flex flex-col items-center gap-2 h-20 rounded-[24px]"
              style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">Camera</span>
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center gap-2 h-20 rounded-[24px] bg-gradient-to-r from-purple-500 to-blue-500 text-white justify-center hover:from-purple-600 hover:to-blue-600 transition-colors">
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">Gallery</span>
              </div>
            </label>
          </div>
          
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Processing image with AI...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
