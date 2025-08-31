
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CloudDownload } from "lucide-react";
import { fetchGooglePayTransactions, importGooglePayTransactions } from "@/services/GooglePayService";
import { toast } from "sonner";

interface GooglePayImportProps {
  selectedMonth: string;
  selectedYear: string;
  onImportComplete: () => void;
}

export const GooglePayImport = ({
  selectedMonth,
  selectedYear,
  onImportComplete
}: GooglePayImportProps) => {
  const [loading, setLoading] = useState(false);
  
  const handleImport = async () => {
    setLoading(true);
    try {
      // Fetch transactions from Google Pay
      const transactions = await fetchGooglePayTransactions(selectedMonth, selectedYear);
      
      // Import transactions to our database
      const success = await importGooglePayTransactions(transactions);
      if (success) {
        onImportComplete();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to import transactions");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleImport}
      disabled={loading}
      className="rounded-[24px] flex items-center gap-2 border-purple-300"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CloudDownload className="h-4 w-4" />
      )}
      {loading ? "Importing..." : "Import from Google Pay"}
    </Button>
  );
};
