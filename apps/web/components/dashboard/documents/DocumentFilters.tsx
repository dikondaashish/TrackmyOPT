'use client';

/**
 * Document Filters Component
 *
 * Category filter, search, and sort controls
 * Supports custom document types from user documents
 */

import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';
import { DOCUMENT_TYPE_ICONS } from '@/lib/document-type-icons';

interface DocumentFiltersProps {
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  customCategories?: string[];
}

type CategoryOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: 'all', label: 'All Documents', icon: DOCUMENT_TYPE_ICONS.all },
  { value: 'passport', label: 'Passport', icon: DOCUMENT_TYPE_ICONS.passport },
  { value: 'visa', label: 'Visa', icon: DOCUMENT_TYPE_ICONS.visa },
  { value: 'i20', label: 'I-20', icon: DOCUMENT_TYPE_ICONS.i20 },
  { value: 'ead_card', label: 'EAD Card', icon: DOCUMENT_TYPE_ICONS.ead_card },
  { value: 'i983', label: 'I-983', icon: DOCUMENT_TYPE_ICONS.i983 },
  { value: 'offer_letter', label: 'Offer Letter', icon: DOCUMENT_TYPE_ICONS.offer_letter },
  { value: 'paystub', label: 'Paystub', icon: DOCUMENT_TYPE_ICONS.paystub },
  { value: 'receipt_notice', label: 'Receipt Notice', icon: DOCUMENT_TYPE_ICONS.receipt_notice },
  { value: 'other', label: 'Other', icon: DOCUMENT_TYPE_ICONS.other },
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
  const defaultValues = DEFAULT_CATEGORIES.map((c) => c.value);
  const uniqueCustomCategories = customCategories.filter((c) => !defaultValues.includes(c));

  const categories: CategoryOption[] = [
    ...DEFAULT_CATEGORIES.slice(0, -1),
    ...uniqueCustomCategories.map((c) => ({
      value: c,
      label: c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: FileText,
    })),
    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1],
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'expiring-soon', label: 'Expiring Soon' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
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
