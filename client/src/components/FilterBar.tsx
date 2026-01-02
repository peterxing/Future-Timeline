import React from "react";
import { TimelineState, Category, Region } from "../lib/types";
import { CATEGORIES, REGIONS } from "../lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FilterBarProps {
  filters: TimelineState["filters"];
  setFilters: (filters: TimelineState["filters"]) => void;
  displayMode: TimelineState["displayMode"];
  setDisplayMode: (mode: TimelineState["displayMode"]) => void;
}

export function FilterBar({ filters, setFilters, displayMode, setDisplayMode }: FilterBarProps) {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (val: string) => {
    if (val === "all") {
      setFilters({ ...filters, categories: CATEGORIES });
    } else {
      setFilters({ ...filters, categories: [val as Category] });
    }
  };

  const handleRegionChange = (val: string) => {
    if (val === "all") {
      setFilters({ ...filters, regions: REGIONS });
    } else {
      setFilters({ ...filters, regions: [val as Region] });
    }
  };

  const resetFilters = () => {
    setFilters({
      categories: CATEGORIES,
      regions: REGIONS,
      search: "",
      minProb: 0
    });
  };

  return (
    <div className="w-full bg-card border-b border-border p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between shadow-sm z-10">
      
      <div className="flex flex-1 items-center gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        
        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-8 bg-background/50"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <Separator orientation="vertical" className="h-8 hidden md:block" />

        {/* Category Filter */}
        <Select onValueChange={handleCategoryChange} defaultValue="all">
          <SelectTrigger className="w-[180px] bg-background/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Region Filter */}
        <Select onValueChange={handleRegionChange} defaultValue="all">
          <SelectTrigger className="w-[140px] bg-background/50">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-8 hidden md:block" />
        
        {/* Reset */}
        <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </Button>

      </div>

      <div className="flex items-center gap-4">
        {/* Display Mode Toggle */}
        <div className="flex items-center gap-2">
           <Label htmlFor="range-mode" className="text-xs font-medium text-muted-foreground cursor-pointer">Start Only</Label>
           <Switch 
              id="range-mode" 
              checked={displayMode === "range"}
              onCheckedChange={(checked) => setDisplayMode(checked ? "range" : "start-only")}
           />
           <Label htmlFor="range-mode" className="text-xs font-medium text-foreground cursor-pointer">Range Mode</Label>
        </div>
      </div>

    </div>
  );
}
