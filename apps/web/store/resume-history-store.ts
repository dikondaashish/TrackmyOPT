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
  isLoadingMore: boolean;
  search: string;
  page: number;
  pageSize: number;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchResumes: (userId: string) => Promise<void>;
  fetchMoreResumes: (userId: string) => Promise<void>;
  hasMore: () => boolean;
  deleteResumeOptimistic: (resumeId: string) => void;
  deleteFilenameOptimistic: (filename: string) => void;
  restoreResumes: (resumes: ResumeMetadata[], totalCount: number) => void;
  addResume: (resume: ResumeMetadata) => void;
}

export const useResumeHistoryStore = create<ResumeHistoryState>((set, get) => ({
  resumes: [],
  totalCount: 0,
  isLoading: false,
  isLoadingMore: false,
  search: '',
  page: 1,
  pageSize: 10,

  setSearch: (search: string) => {
    set({ search, page: 1 });
  },

  setPage: (page: number) => {
    set({ page });
  },

  hasMore: () => {
    const { resumes, totalCount } = get();
    return resumes.length < totalCount;
  },

  fetchResumes: async (userId: string) => {
    const { search, pageSize } = get();
    set({ isLoading: true, page: 1 });

    try {
      const response = await fetch(
        `/api/proxy/resume/list?userId=${userId}&limit=${pageSize}&offset=0&search=${encodeURIComponent(search)}`,
        { cache: 'no-store' },
      );

      if (!response.ok) throw new Error('Failed to fetch resumes');

      const result = await response.json();
      set({
        resumes: result.data || [],
        totalCount: result.total || 0,
        page: 1,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      set({ isLoading: false });
    }
  },

  fetchMoreResumes: async (userId: string) => {
    const { search, page, pageSize, resumes, totalCount, isLoading, isLoadingMore } =
      get();
    if (isLoading || isLoadingMore || resumes.length >= totalCount) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true });

    try {
      const offset = (nextPage - 1) * pageSize;
      const response = await fetch(
        `/api/proxy/resume/list?userId=${userId}&limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}`,
        { cache: 'no-store' },
      );

      if (!response.ok) throw new Error('Failed to fetch more resumes');

      const result = await response.json();
      const nextBatch: ResumeMetadata[] = result.data || [];
      const seen = new Set(resumes.map((r) => r.id));
      const appended = nextBatch.filter((r) => !seen.has(r.id));

      set({
        resumes: [...resumes, ...appended],
        totalCount: result.total ?? totalCount,
        page: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error('Error fetching more resumes:', error);
      set({ isLoadingMore: false });
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
