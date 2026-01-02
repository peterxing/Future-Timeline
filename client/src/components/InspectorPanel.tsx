import React, { useEffect, useState } from "react";
import { TimelineEvent, Category } from "../lib/types";
import { CATEGORY_COLORS } from "../lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { X, ExternalLink, Calendar, MapPin, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
  event: TimelineEvent | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TimelineEvent>) => void;
}

export function InspectorPanel({ event, onClose, onUpdate }: InspectorPanelProps) {
  const [localProb, setLocalProb] = useState(0);
  const [localNotes, setLocalNotes] = useState("");

  useEffect(() => {
    if (event) {
      setLocalProb(event.yourProb ?? event.suggestedProb);
      setLocalNotes(event.notes || "");
    }
  }, [event]);

  if (!event) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-card/50 border-l border-border p-8 text-center">
        <Target className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-lg font-display font-medium">No Event Selected</h3>
        <p className="text-sm mt-2 max-w-[200px]">Select a datapoint on the timeline to view details and edit assumptions.</p>
      </div>
    );
  }

  const handleProbChange = (val: number[]) => {
    const newProb = val[0];
    setLocalProb(newProb);
    // Effective prob logic: if user overrides, use user prob, else suggested.
    // For now, let's just assume effective = yourProb if set, else suggested.
    // But since we are editing "yourProb", we update that.
    onUpdate(event.id, { 
      yourProb: newProb,
      effectiveProb: newProb // Simple logic: user override becomes effective
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNotes(e.target.value);
    onUpdate(event.id, { notes: e.target.value });
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border w-[400px] shadow-2xl relative z-30">
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-start relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-1 h-full" 
          style={{ backgroundColor: CATEGORY_COLORS[event.category] }} 
        />
        <div className="flex-1 pr-8">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1 flex items-center gap-2">
            <span style={{ color: CATEGORY_COLORS[event.category] }}>●</span> {event.category}
          </div>
          <h2 className="text-xl font-display font-bold leading-tight text-foreground">{event.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-2 -mt-2 hover:bg-white/10 text-muted-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Timeframe
              </span>
              <span className="font-mono">
                {event.startMonth} {event.endMonth && `→ ${event.endMonth}`}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Region
              </span>
              <span>{event.region}</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {event.rationale && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Rationale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                {event.rationale}
              </p>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* User Controls */}
          <div className="space-y-6 bg-muted/20 p-4 rounded-lg border border-border/50">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Probability Assessment</Label>
                <span className={cn(
                  "font-mono text-lg font-bold",
                  localProb > 70 ? "text-green-400" : localProb > 30 ? "text-yellow-400" : "text-red-400"
                )}>
                  {localProb}%
                </span>
              </div>
              <Slider 
                value={[localProb]} 
                min={0} 
                max={100} 
                step={5} 
                onValueChange={handleProbChange}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0% (Impossible)</span>
                <span>100% (Certain)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Planning Prompts</Label>
              <p className="text-sm text-accent-foreground/80 bg-accent/10 p-3 rounded border border-accent/20">
                {event.planningPrompts || "No planning prompts available."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs uppercase font-bold text-muted-foreground">My Notes</Label>
              <Textarea 
                id="notes"
                value={localNotes}
                onChange={handleNotesChange}
                placeholder="Add your strategic implications here..."
                className="bg-background/50 min-h-[100px] text-sm resize-none focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Sources */}
          {event.sources.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase font-bold text-muted-foreground">Sources</h3>
              <ul className="space-y-2">
                {event.sources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
