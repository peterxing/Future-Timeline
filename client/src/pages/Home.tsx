import React, { useState, useMemo, useEffect } from "react";
import { TimelineEvent, TimelineState, Category, Region } from "@/lib/types";
import { MOCK_EVENTS } from "@/data/mockData";
import { TimelineGrid } from "@/components/TimelineGrid";
import { InspectorPanel } from "@/components/InspectorPanel";
import { FilterBar } from "@/components/FilterBar";
import { ExcelHandler } from "@/components/ExcelHandler";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, Layers, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "future_timeline_data";

export default function Home() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
        return MOCK_EVENTS;
      }
    }
    return MOCK_EVENTS;
  });

  const [displayMode, setDisplayMode] = useState<"range" | "start-only">("range");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(true);

  const [filters, setFilters] = useState<TimelineState["filters"]>({
    categories: ["AI & Robotics", "Science & Technology", "Society & Policy", "Society & Culture", "Space", "Environment", "Other"],
    regions: ["Global", "USA", "EU", "China", "India", "Africa", "Other"],
    search: "",
    minProb: 0
  });

  // Persist data whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (filters.search && !evt.title.toLowerCase().includes(filters.search.toLowerCase()) && !evt.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(evt.category)) {
        return false;
      }
      if (filters.regions.length > 0 && !filters.regions.includes(evt.region)) {
        return false;
      }
      return true;
    });
  }, [events, filters]);

  const handleEventClick = (evt: TimelineEvent) => {
    setSelectedEventId(evt.id);
    setShowInspector(true);
  };

  const handleEventUpdate = (id: string, updates: Partial<TimelineEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const resetToDefault = () => {
    setEvents(MOCK_EVENTS);
    setSelectedEventId(null);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Reset Complete",
      description: "Dataset has been reset to the latest researched defaults.",
    });
  };

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId) || null
  , [events, selectedEventId]);

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans">
      
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            FUTURE<span className="text-primary">TIMELINE</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefault}
            className="gap-2 border-primary/20 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Data
          </Button>
          <ExcelHandler 
            events={events}
            onDataLoaded={(newEvents) => {
              setEvents(newEvents);
              setSelectedEventId(null);
            }} 
          />
        </div>
      </header>

      {/* Filter Controls */}
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        displayMode={displayMode} 
        setDisplayMode={setDisplayMode}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Timeline Area */}
        <div className="flex-1 relative bg-background/50">
          <TimelineGrid 
            events={filteredEvents} 
            displayMode={displayMode}
            onEventClick={handleEventClick}
            selectedEventId={selectedEventId}
          />
          
          {/* Toggle Inspector Button (if closed) */}
          {!showInspector && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="absolute top-4 right-4 z-10 shadow-lg bg-card border-primary/20 text-primary hover:bg-primary/10"
                 onClick={() => setShowInspector(true)}
               >
                 <PanelRightOpen className="w-4 h-4" />
               </Button>
             </motion.div>
          )}
        </div>

        {/* Inspector Panel (Animated) */}
        <AnimatePresence mode="popLayout">
          {showInspector && (
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full border-l border-border shadow-2xl relative z-30"
            >
              <InspectorPanel 
                event={selectedEvent} 
                onClose={() => setShowInspector(false)}
                onUpdate={handleEventUpdate}
              />
              {/* Toggle Button Inside Panel */}
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="absolute top-4 right-14 z-40 text-muted-foreground hover:text-foreground"
                 onClick={() => setShowInspector(false)}
                 title="Close Panel"
               >
                 <PanelRightClose className="w-4 h-4" />
               </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
