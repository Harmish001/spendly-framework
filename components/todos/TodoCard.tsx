import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Todo } from "@/hooks/useTodos";
import { getBackgroundGradientStyle, GRADIENTS } from "@/lib/constants/theme";
import { format } from "date-fns";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (todo: Todo) => void;
}

const priorityConfig: Record<
  Todo["priority"],
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: "#16a34a", bg: "#dcfce7" },
  medium: { label: "Medium", color: "#d97706", bg: "#fef3c7" },
  high: { label: "High", color: "#dc2626", bg: "#fee2e2" },
};

const statusConfig: Record<
  Todo["status"],
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  pending: { label: "Pending", icon: Circle },
  in_progress: { label: "In Progress", icon: Clock },
  completed: { label: "Completed", icon: CheckCircle2 },
};

export const TodoCard = ({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
}: TodoCardProps) => {
  const isCompleted = todo.status === "completed";
  const priority = priorityConfig[todo.priority];
  const statusInfo = statusConfig[todo.status];
  const StatusIcon = statusInfo.icon;

  const isOverdue =
    todo.dueDate &&
    !isCompleted &&
    new Date(todo.dueDate) < new Date(new Date().toDateString());

  return (
    <div className="relative overflow-hidden shadow-md rounded-[20px]">
      <Card
        className={`shadow-md border rounded-[20px] transition-all hover:border-gray-300 overflow-hidden ${
          isCompleted ? "opacity-75" : ""
        }`}
      >
        <CardContent className="flex items-center justify-between p-5 gap-3">
          {/* Complete toggle icon */}
          <button
            onClick={() => onToggleComplete(todo)}
            className="shrink-0 focus:outline-none"
            id={`toggle-complete-${todo._id}`}
            aria-label={isCompleted ? "Mark as pending" : "Mark as complete"}
          >
            <div
              className={`p-2 rounded-[14px] transition-all`}
              style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
            >
              <StatusIcon
                className={`h-6 w-6 text-white ${isCompleted ? "opacity-90" : ""}`}
              />
            </div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${
                isCompleted ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {todo.title}
            </p>

            {todo.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Priority badge */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: priority.color, background: priority.bg }}
              >
                {priority.label}
              </span>

              {/* Due date */}
              {todo.dueDate && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    isOverdue ? "text-red-500 font-semibold" : "text-gray-400"
                  }`}
                >
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                  {format(new Date(todo.dueDate), "d MMM")}
                </span>
              )}
            </div>
          </div>

          {/* Status badge + actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge
              variant="secondary"
              className="text-xs font-medium text-white whitespace-nowrap"
              style={getBackgroundGradientStyle(GRADIENTS.PRIMARY)}
            >
              {statusInfo.label}
            </Badge>

            <div className="flex gap-2 items-center">
              <Edit
                id={`edit-todo-${todo._id}`}
                className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => onEdit(todo)}
              />
              <Trash2
                id={`delete-todo-${todo._id}`}
                className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                onClick={() => onDelete(todo._id)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
