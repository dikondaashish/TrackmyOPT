// OPT Tools Types and Interfaces

export interface OptData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
  stem_end_date?: string;
}

export interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
  employer_name?: string;
}

export interface SyncStatus {
  lastSynced: Date | null;
  isSyncing: boolean;
  error: string | null;
}

export interface LiveStats {
  averageApprovalTime: number;
  recentApprovals: number;
  trend: 'faster' | 'slower' | 'stable';
  recentReports: {
    days: number;
    status: string;
    timestamp: string;
  }[];
  lastUpdated: Date;
}

export interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  gradient: string;
}

export type ToolType = 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
