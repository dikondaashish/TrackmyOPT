'use client';

/**
 * Document Filters Component
 * 
 * Category filter, search, and sort controls
 */

interface DocumentFiltersProps {
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
}

export function DocumentFilters({
  selectedCategory,
  searchQuery,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: DocumentFiltersProps) {
  const categories = [
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category.value
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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

