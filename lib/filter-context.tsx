"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Filters = {
  shoeType: "adult" | "womens" | "kids" | null; // radio: only one at a time
  hot: boolean; // toggle: 今期熱賣
  sale: boolean; // toggle: has discount
};

type FilterContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleShoeType: (type: "adult" | "womens" | "kids") => void;
  toggleHot: () => void;
  toggleSale: () => void;
};

const defaultFilters: Filters = {
  shoeType: null,
  hot: false,
  sale: false,
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

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, toggleShoeType, toggleHot, toggleSale }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
