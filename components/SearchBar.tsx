"use client";

import { useState } from "react";

export default function SearchBar({ 
  onSearch 
}: { 
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
      <form onSubmit={handleSubmit} className="container mx-auto flex gap-2">
        <input
          type="text"
          placeholder="아지트 이름이나 주소로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-bunny-primary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-bunny-primary text-white rounded-lg hover:bg-bunny-secondary transition text-sm font-medium"
        >
          🔍 검색
        </button>
      </form>
    </div>
  );
}
