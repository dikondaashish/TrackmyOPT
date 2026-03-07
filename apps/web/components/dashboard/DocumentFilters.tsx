'use client';

/**
 * Document Filters Component
 * 
 * Category filter, search, and sort controls
 * Supports custom document types from user documents
 */

interface DocumentFiltersProps {
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  customCategories?: string[]; // Custom categories from user documents
}

// Default document categories
const DEFAULT_CATEGORIES = [
  { value: 'all', label: 'All Documents', icon: '📁' },
  { value: 'passport', label: 'Passport', icon: '📘' },
  { value: 'visa', label: 'Visa', icon: '🛂' },
  { value: 'i20', label: 'I-20', icon: '📋' },
  { value: 'ead_card', label: 'EAD Card', icon: '💳' },
  { value: 'i983', label: 'I-983', icon: '📄' },
  { value: 'offer_letter', label: 'Offer Letter', icon: '📨' },
  { value: 'paystub', label: 'Paystub', icon: '💰' },
  { value: 'receipt_notice', label: 'Receipt Notice', icon: '📬' },
  { value: 'other', label: 'Other', icon: '📁' },
];

export function DocumentFilters({
  selectedCategory,
  searchQuery,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  customCategories = [],
}: DocumentFiltersProps) {
  // Merge default categories with custom ones (excluding duplicates)
  const defaultValues = DEFAULT_CATEGORIES.map(c => c.value);
  const uniqueCustomCategories = customCategories.filter(c => !defaultValues.includes(c));

  // Create category list with custom types added before "Other"
  const categories = [
    ...DEFAULT_CATEGORIES.slice(0, -1), // All except "Other"
    ...uniqueCustomCategories.map(c => ({
      value: c,
      label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format label
      icon: '📄',
    })),
    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1], // Add "Other" at the end
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'expiring-soon', label: 'Expiring Soon' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedCategory === category.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800/60 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
          >
            <span className="text-sm">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-400"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800/60 dark:text-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

