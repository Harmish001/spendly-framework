import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingChatButtonProps {
  onClick: () => void;
  hasNotifications?: boolean;
  notificationCount?: number;
}

export const FloatingChatButton = ({ 
  onClick, 
  hasNotifications = false, 
  notificationCount = 0 
}: FloatingChatButtonProps) => {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`fixed ${isMobile ? 'bottom-24 left-6' : 'bottom-24 left-6'}`}>
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
          bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}
      >
        <div className="relative">
          <Sparkles className="h-6 w-6 text-white" />
          {hasNotifications && notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </div>
        
        {/* Pulse animation for notifications */}
        {hasNotifications && (
          <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20" />
        )}
      </Button>
      
      {/* Tooltip */}
      {isHovered && !isMobile && (
        <div className="absolute bottom-16 right-0 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          Chat with Spendly Bot
          <div className="absolute top-full right-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
};