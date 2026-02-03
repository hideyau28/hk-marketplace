"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CategoryFilter =
  | "Air Jordan"
  | "Dunk/SB"
  | "Air Max"
  | "Air Force"
  | "Running"
  | "Basketball"
  | "Lifestyle"
  | "Training"
  | "Sandals"
  | null;

export type Filters = {
  shoeType: "adult" | "womens" | "kids" | null; // radio: only one at a time
  hot: boolean; // toggle: 今期熱賣
  sale: boolean; // toggle: has discount
  category: CategoryFilter; // radio: only one at a time
};

type FilterContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleShoeType: (type: "adult" | "womens" | "kids") => void;
  toggleHot: () => void;
  toggleSale: () => void;
  toggleCategory: (category: CategoryFilter) => void;
};

const defaultFilters: Filters = {
  shoeType: null,
  hot: false,
  sale: false,
  category: null,
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const toggleShoeType = (type: "adult" | "womens" | "kids") => {
    setFilters((prev) => ({
      ...prev,
      shoeType: prev.shoeType === type ? null : type,
    }));
  };

  const toggleHot = () => {
    setFilters((prev) => ({
      ...prev,
      hot: !prev.hot,
    }));
  };

  const toggleSale = () => {
    setFilters((prev) => ({
      ...prev,
      sale: !prev.sale,
    }));
  };

  const toggleCategory = (category: CategoryFilter) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, toggleShoeType, toggleHot, toggleSale, toggleCategory }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
