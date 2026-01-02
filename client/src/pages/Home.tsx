import React, { useMemo, useState, useEffect } from "react";
import { TimelineEvent, TimelineState, InsertTimelineEvent, Category, Region } from "@/lib/types";
import { categoryValues, regionValues } from "@shared/schema";
import { TimelineGrid } from "@/components/TimelineGrid";
import { InspectorPanel } from "@/components/InspectorPanel";
import { FilterBar } from "@/components/FilterBar";
import { ExcelHandler } from "@/components/ExcelHandler";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, Layers, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEvents, importEvents, resetEvents, updateEvent } from "@/lib/api";

const DEFAULT_FILTERS: TimelineState["filters"] = {
  categories: [...categoryValues] as Category[],
  regions: [...regionValues] as Region[],
  search: "",
  minProb: 0,
};

export default function Home() {
  const queryClient = useQueryClient();
  const [displayMode, setDisplayMode] = useState<"range" | "start-only">("range");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(true);
  const [filters, setFilters] = useState<TimelineState["filters"]>(DEFAULT_FILTERS);

  const eventsQuery = useQuery<TimelineEvent[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const events = eventsQuery.data ?? [];

  useEffect(() => {
    if (!events.length) {
      setSelectedEventId(null);
    }
  }, [events.length]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TimelineEvent> }) =>
      updateEvent(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<TimelineEvent[]>(["events"], (prev = []) =>
        prev.map((evt) => (evt.id === updated.id ? updated : evt)),
      );
    },
    onError: () =>
      toast({ title: "Update failed", description: "Could not save your changes.", variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: (newEvents: InsertTimelineEvent[]) => importEvents(newEvents),
    onSuccess: (saved) => {
      queryClient.setQueryData(["events"], saved);
      setSelectedEventId(null);
      toast({ title: "Dataset imported", description: `${saved.length} events saved to the database.` });
    },
    onError: () =>
      toast({ title: "Import failed", description: "Could not save uploaded events.", variant: "destructive" }),
  });

  const resetMutation = useMutation({
    mutationFn: resetEvents,
    onSuccess: (reset) => {
      queryClient.setQueryData(["events"], reset);
      setSelectedEventId(null);
      setFilters(DEFAULT_FILTERS);
      toast({ title: "Reset complete", description: "Timeline restored to default research set." });
    },
    onError: () =>
      toast({ title: "Reset failed", description: "Could not reset dataset.", variant: "destructive" }),
  });

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (
        filters.search &&
        !evt.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !evt.description.toLowerCase().includes(filters.search.toLowerCase())
      ) {
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
    updateMutation.mutate({ id, updates });
  };

  const handleImport = (newEvents: InsertTimelineEvent[]) => {
    importMutation.mutate(newEvents);
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  if (eventsQuery.isError) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500">
        Failed to load timeline data.
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans">
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
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="gap-2 border-primary/20 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Data
          </Button>
          <ExcelHandler
            events={events}
            onDataLoaded={(newEvents) => {
              handleImport(newEvents);
            }}
          />
        </div>
      </header>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative bg-background/50">
          <TimelineGrid
            events={filteredEvents}
            displayMode={displayMode}
            onEventClick={handleEventClick}
            selectedEventId={selectedEventId}
          />

          {eventsQuery.isLoading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center text-muted-foreground">
              Loading timeline...
            </div>
          )}

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
