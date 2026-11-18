"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

interface SortSelectProps {
  currentSort: string;
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "relevance") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", newSort);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
      <span className="text-stone-500 hidden sm:inline">Sort:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
      >
        <option value="relevance">Relevance</option>
        <option value="rating">Highest Rated</option>
        <option value="popularity">Most Popular</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
