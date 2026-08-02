import { create } from 'zustand';

interface ResumeMetadata {
  id: string;
  filename: string;
  description?: string;
  content: string;
  created_at: string;
  file_path: string | null;
  is_parsed?: boolean;
  structuredData?: any;
}

interface ResumeHistoryState {
  resumes: ResumeMetadata[];
  totalCount: number;
  isLoading: boolean;
  search: string;
  page: number;
  pageSize: number;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchResumes: (userId: string) => Promise<void>;
  deleteResumeOptimistic: (resumeId: string) => void;
  deleteFilenameOptimistic: (filename: string) => void;
  restoreResumes: (resumes: ResumeMetadata[], totalCount: number) => void;
  addResume: (resume: ResumeMetadata) => void;
}

export const useResumeHistoryStore = create<ResumeHistoryState>((set, get) => ({
  resumes: [],
  totalCount: 0,
  isLoading: false,
  search: '',
  page: 1,
  pageSize: 10,

  setSearch: (search: string) => {
    set({ search, page: 1 });
  },

  setPage: (page: number) => {
    set({ page });
  },

  fetchResumes: async (userId: string) => {
    const { search, page, pageSize } = get();
    set({ isLoading: true });

    try {
      const offset = (page - 1) * pageSize;
      const response = await fetch(
        `/api/proxy/resume/list?userId=${userId}&limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}`,
        { cache: 'no-store' },
      );

      if (!response.ok) throw new Error('Failed to fetch resumes');

      const result = await response.json();
      set({
        resumes: result.data || [],
        totalCount: result.total || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      set({ isLoading: false });
    }
  },

  deleteResumeOptimistic: (resumeId: string) => {
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== resumeId),
      totalCount: Math.max(0, state.totalCount - 1),
    }));
  },

  deleteFilenameOptimistic: (filename: string) => {
    set((state) => {
      const remaining = state.resumes.filter((r) => r.filename !== filename);
      const removed = state.resumes.length - remaining.length;
      return {
        resumes: remaining,
        totalCount: Math.max(0, state.totalCount - removed),
      };
    });
  },

  restoreResumes: (resumes, totalCount) => {
    set({ resumes, totalCount });
  },

  addResume: (resume: ResumeMetadata) => {
    set((state) => ({
      resumes: [resume, ...state.resumes],
      totalCount: state.totalCount + 1,
    }));
  },
}));
