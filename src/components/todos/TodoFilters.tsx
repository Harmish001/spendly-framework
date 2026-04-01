import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { GRADIENTS } from "@/constants/theme";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";

export type TodoStatusFilter = "all" | "pending" | "in_progress" | "completed";
export type TodoPriorityFilter = "all" | "low" | "medium" | "high";

interface TodoFiltersProps {
  selectedStatus: TodoStatusFilter;
  selectedPriority: TodoPriorityFilter;
  onStatusChange: (value: TodoStatusFilter) => void;
  onPriorityChange: (value: TodoPriorityFilter) => void;
  onFilter: () => void;
}

export const TodoFilters = ({
  selectedStatus,
  selectedPriority,
  onStatusChange,
  onPriorityChange,
  onFilter,
}: TodoFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={`rounded-full ${isMobile ? "w-14 h-14" : "rounded-[24px]"}`}
          style={{ background: GRADIENTS.PRIMARY, color: "white" }}
          onClick={() => setIsOpen(true)}
          id="todo-filter-btn"
        >
          <Filter className={`h-6 w-6 ${!isMobile && "mr-2"}`} />
          {!isMobile && "Filters"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-[24px] border-0 max-h-[85vh] mb-4">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle>Filter Todos</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 mx-4 pb-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 pl-1 font-medium">Status</p>
            <Select
              value={selectedStatus}
              onValueChange={(v) => onStatusChange(v as TodoStatusFilter)}
            >
              <SelectTrigger className="rounded-[24px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px]">
                <SelectItem value="all" className="rounded-[14px]">
                  All Statuses
                </SelectItem>
                <SelectItem value="pending" className="rounded-[14px]">
                  ⏳ Pending
                </SelectItem>
                <SelectItem value="in_progress" className="rounded-[14px]">
                  🔄 In Progress
                </SelectItem>
                <SelectItem value="completed" className="rounded-[14px]">
                  ✅ Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500 pl-1 font-medium">Priority</p>
            <Select
              value={selectedPriority}
              onValueChange={(v) => onPriorityChange(v as TodoPriorityFilter)}
            >
              <SelectTrigger className="rounded-[24px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px]">
                <SelectItem value="all" className="rounded-[14px]">
                  All Priorities
                </SelectItem>
                <SelectItem value="low" className="rounded-[14px]">
                  🟢 Low
                </SelectItem>
                <SelectItem value="medium" className="rounded-[14px]">
                  🟡 Medium
                </SelectItem>
                <SelectItem value="high" className="rounded-[14px]">
                  🔴 High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SlideToConfirm
            label="Apply filters"
            onConfirm={() => {
              onFilter();
              setIsOpen(false);
            }}
            variant="confirm"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
