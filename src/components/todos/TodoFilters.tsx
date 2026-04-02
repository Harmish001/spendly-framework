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
import { useIsMobile } from "@/hooks/use-mobile";
import { GRADIENTS } from "@/constants/theme";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";
import { BottomSheet } from "@/components/ui/BottomSheet";

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
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Filter Todos"
      trigger={
        <Button
          variant="outline"
          className={`rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${isMobile ? "w-14 h-14 p-0 flex items-center justify-center p-0" : "rounded-[24px] px-6 h-12"}`}
          style={{ background: GRADIENTS.PRIMARY, color: "white", border: "none" }}
          id="todo-filter-btn"
        >
          <Filter className={`h-6 w-6 ${!isMobile && "mr-2"}`} />
          {!isMobile && "Filters"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 ml-1">Status</p>
          <Select
            value={selectedStatus}
            onValueChange={(v) => onStatusChange(v as TodoStatusFilter)}
          >
            <SelectTrigger className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50">
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

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 ml-1">Priority</p>
          <Select
            value={selectedPriority}
            onValueChange={(v) => onPriorityChange(v as TodoPriorityFilter)}
          >
            <SelectTrigger className="rounded-[20px] h-12 border-gray-100 bg-gray-50/50">
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

        <div className="pt-2">
          <SlideToConfirm
            label="Apply Filters"
            onConfirm={() => {
              onFilter();
              setIsOpen(false);
            }}
            variant="confirm"
          />
        </div>
      </div>
    </BottomSheet>
  );
};
