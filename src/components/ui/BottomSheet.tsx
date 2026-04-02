import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  maxHeight?: string;
}

export const BottomSheet = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  className,
  contentClassName,
  headerClassName,
  maxHeight = "85vh",
}: BottomSheetProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent 
        className={cn(
          "rounded-t-[32px] border-0 outline-none", 
          className
        )}
        style={{ maxHeight }}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-200/80" />
        
        {(title || description) && (
          <DrawerHeader className={cn("text-center pb-2 pt-4 px-6", headerClassName)}>
            {title && (
              <DrawerTitle className="text-xl font-bold tracking-tight text-gray-900">
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription className="text-sm text-gray-500 mt-1">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}

        <div className={cn("px-6 pb-10 pt-2 overflow-y-auto outline-none", contentClassName)}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
