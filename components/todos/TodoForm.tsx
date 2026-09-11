import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useTodos, Todo } from "@/hooks/useTodos";
import { SlideToConfirm } from "@/components/ui/SlideToConfirm";

type TodoStatus = Todo["status"];
type TodoPriority = Todo["priority"];

interface TodoFormProps {
  onTodoAdded: () => void;
  editingTodo?: Todo | null;
  onClose?: () => void;
}

export const TodoForm = ({
  onTodoAdded,
  editingTodo,
  onClose,
}: TodoFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [status, setStatus] = useState<TodoStatus>("pending");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingTodo;

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || "");
      setPriority(editingTodo.priority as TodoPriority);
      setStatus(editingTodo.status as TodoStatus);
      setDueDate(
        editingTodo.dueDate ? new Date(editingTodo.dueDate) : undefined,
      );
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate(undefined);
    }
  }, [editingTodo]);

  const { addTodoAsync, editTodo } = useTodos();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      };

      if (isEditing && editingTodo) {
        await editTodo({ id: editingTodo._id, ...payload });
      } else {
        await addTodoAsync(payload);
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate(undefined);

      onTodoAdded();
      onClose?.();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-[24px] font-medium"
        required
      />

      <Textarea
        placeholder="Add a description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-[18px] resize-none min-h-[80px]"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 pl-1">Priority</p>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TodoPriority)}
          >
            <SelectTrigger className="rounded-[24px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-[18px]">
              <SelectItem value="low" className="rounded-[14px]">
                Low
              </SelectItem>
              <SelectItem value="medium" className="rounded-[14px]">
                Medium
              </SelectItem>
              <SelectItem value="high" className="rounded-[14px]">
                High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 pl-1">Status</p>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TodoStatus)}
          >
            <SelectTrigger className="rounded-[24px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-[18px]">
              <SelectItem value="pending" className="rounded-[14px]">
                Pending
              </SelectItem>
              <SelectItem value="in_progress" className="rounded-[14px]">
                In Progress
              </SelectItem>
              <SelectItem value="completed" className="rounded-[14px]">
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-500 pl-1">Due Date (optional)</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal rounded-[24px]",
                !dueDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(d) => setDueDate(d)}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <SlideToConfirm
        label={isEditing ? "Update" : "Add todo"}
        onConfirm={handleSave}
        disabled={loading}
        loading={loading}
      />
    </div>
  );
};
