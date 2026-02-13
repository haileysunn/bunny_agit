"use client";

import { useState, useRef, useEffect } from "react";
import { SmokingArea } from "@/lib/supabase";

export default function SearchBar({ 
  onSearch,
  areas
}: { 
  onSearch: (query: string) => void;
  areas: SmokingArea[];
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SmokingArea[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const filtered = areas.filter(area => 
        area.name?.toLowerCase().includes(value.toLowerCase()) ||
        area.address?.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(query);
  };

  const handleSelectSuggestion = (area: SmokingArea) => {
    setQuery(area.name);
    setShowDropdown(false);
    onSearch(area.name);
  };

  const handleClear = () => {
    setQuery("");
    setShowDropdown(false);
    onSearch("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="container mx-auto flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="아지트 이름이나 주소로 검색..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query && filteredSuggestions.length > 0 && setShowDropdown(true)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-bunny-primary"
          />
          {showDropdown && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(area)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{area.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{area.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-bunny-primary text-white rounded-lg hover:bg-bunny-secondary transition text-sm font-medium shrink-0 whitespace-nowrap"
        >
          🔍 검색
        </button>
      </form>
    </div>
  );
}
