import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from '@capacitor/core';
import { ShareReceiver } from "@/services/ShareReceiver";

interface AIExpenseCaptureProps {
  onExpenseExtracted: (data: {
    amount: string;
    category: string;
    description: string;
    date?: string;
  }) => void;
}

export const AIExpenseCapture = ({ onExpenseExtracted }: AIExpenseCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Initialize share receiver for native platforms
    if (Capacitor.isNativePlatform()) {
      ShareReceiver.initialize();
    }

    // Listen for shared images
    const handleSharedImage = (event: CustomEvent) => {
      const { file } = event.detail;
      if (file) {
        toast.success("Shared image received! Processing...");
        processImageWithAI(file);
      }
    };

    window.addEventListener('processSharedImage', handleSharedImage as EventListener);

    return () => {
      window.removeEventListener('processSharedImage', handleSharedImage as EventListener);
    };
  }, []);

  const processImageWithAI = async (imageFile: File) => {
    setIsProcessing(true);
    setIsDrawerOpen(false);
    
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

      // Validate that we at least have an amount
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error("Could not extract a valid amount from the image. Please try with a clearer image.");
      }

      // Pre-fill the sidebar form instead of directly adding to database
      onExpenseExtracted({
        amount: amount.toString(),
        category: category || "others",
        description: description || "Expense from image",
        date: date
      });

      toast.success("Expense details extracted! Please review and confirm.");
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

  if (isProcessing) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-white rounded-full shadow-lg p-4 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="text-sm font-medium">Processing image...</span>
        </div>
      </div>
    );
  }

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 left-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 z-50"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[24px] border-0">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-lg font-semibold">Add Expense from Image</DrawerTitle>
          <p className="text-sm text-gray-600 mt-2">
            Capture or select a photo of your bill to extract expense details
          </p>
          {Capacitor.isNativePlatform() && (
            <p className="text-xs text-blue-600 mt-1">
              💡 You can also share screenshots directly from payment apps!
            </p>
          )}
        </DrawerHeader>
        
        <div className="px-6 pb-8">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={handleCameraCapture}
              className="flex flex-col items-center gap-3 h-24 rounded-[20px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            >
              <Camera className="h-8 w-8" />
              <span className="text-sm font-medium">Camera</span>
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 h-24 rounded-[20px] bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white justify-center transition-all duration-200 border-0">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Gallery</span>
              </div>
            </label>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
