import { 
  CheckCircle2, Circle, Clock, AlertCircle, ChevronsUp, ChevronUp, ChevronRight, 
  ChevronDown as ChevronDownIcon, Minus, CircleDot,
  LayoutGrid, List
} from 'lucide-react';

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
export type IssuePriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface MockProject {
  id: string;
  name: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'canceled';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  targetDate: string;
  description?: string;
}

export interface MockCycle {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface MockIssue {
  id: string;
  displayId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  dueDate: string;
  projectId: string | null;
  cycleId: string | null;
  labels: string[];
  createdAt: string;
}

// Helper để lấy Icon đại diện Status
export const getStatusIcon = (status: IssueStatus, className = "w-4 h-4") => {
  switch (status) {
    case 'backlog':
      return <Clock className={`${className} text-slate-400 dark:text-slate-500`} />;
    case 'todo':
      return <Circle className={`${className} text-blue-500 dark:text-blue-400`} />;
    case 'in_progress':
      return <CircleDot className={`${className} text-amber-500 dark:text-amber-450`} />;
    case 'done':
      return <CheckCircle2 className={`${className} text-emerald-500 dark:text-emerald-450`} />;
    case 'canceled':
      return <Minus className={`${className} text-zinc-400 dark:text-zinc-600 line-through`} />;
  }
};

// Helper để lấy Tên tiếng Việt của Status
export const getStatusLabel = (status: IssueStatus) => {
  switch (status) {
    case 'backlog': return 'Chờ thực hiện';
    case 'todo': return 'Cần làm';
    case 'in_progress': return 'Đang làm';
    case 'done': return 'Đã xong';
    case 'canceled': return 'Đã hủy';
  }
};

// Helper để lấy Icon đại diện Project Status
export const getProjectStatusIcon = (status: MockProject['status'], className = "w-4 h-4") => {
  switch (status) {
    case 'planned':
      return <Circle className={`${className} text-zinc-400 dark:text-zinc-500`} />;
    case 'active':
      return <CircleDot className={`${className} text-blue-500`} />;
    case 'paused':
      return <Clock className={`${className} text-orange-500`} />;
    case 'completed':
      return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'canceled':
      return <Minus className={`${className} text-zinc-500 line-through`} />;
    default:
      return <Circle className={`${className} text-zinc-400`} />;
  }
};

export const getProjectStatusLabel = (status: MockProject['status']) => {
  switch (status) {
    case 'planned': return 'Kế hoạch';
    case 'active': return 'Đang hoạt động';
    case 'paused': return 'Đang tạm dừng';
    case 'completed': return 'Đã hoàn thành';
    case 'canceled': return 'Đã hủy';
    default: return 'Không rõ';
  }
};

// Helper để lấy Icon/Badge đại diện Priority
export const getPriorityIcon = (priority: IssuePriority, className = "w-3.5 h-3.5") => {
  switch (priority) {
    case 'urgent':
      return <AlertCircle className={`${className} text-red-500 dark:text-red-400`} />;
    case 'high':
      return <ChevronsUp className={`${className} text-orange-500 dark:text-orange-400`} />;
    case 'medium':
      return <ChevronUp className={`${className} text-blue-500 dark:text-blue-400`} />;
    case 'low':
      return <ChevronDownIcon className={`${className} text-zinc-500 dark:text-zinc-400`} />;
    case 'none':
      return <Minus className={`${className} text-zinc-300 dark:text-zinc-700`} />;
  }
};

export const getPriorityLabel = (priority: IssuePriority) => {
  switch (priority) {
    case 'urgent': return 'Khẩn cấp';
    case 'high': return 'Cao';
    case 'medium': return 'Vừa';
    case 'low': return 'Thấp';
    case 'none': return 'Không ưu tiên';
  }
};

export const formatDueDate = (dateStr: string) => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
};

export const getIssueDisplayId = (createdAtStr: string, number: number): string => {
  if (!createdAtStr) return `ML-${number}`;
  const date = new Date(createdAtStr);
  if (isNaN(date.getTime())) return `ML-${number}`;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${month}${day}-${number}`;
};

