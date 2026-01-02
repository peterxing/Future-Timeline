import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { TimelineEvent, Category, Region } from "../lib/types";
import { toast } from "@/hooks/use-toast";

interface ExcelHandlerProps {
  onDataLoaded: (events: TimelineEvent[]) => void;
  events: TimelineEvent[];
}

export function ExcelHandler({ onDataLoaded, events }: ExcelHandlerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        
        // Assume 'Events' sheet contains the data
        const wsname = wb.SheetNames.find(n => n.toLowerCase().includes("event"));
        if (!wsname) {
          toast({ title: "Error", description: "Could not find 'Events' sheet.", variant: "destructive" });
          return;
        }
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const parsedEvents: TimelineEvent[] = data.map((row: any, index: number) => ({
          id: `evt-${index}-${Date.now()}`,
          title: row["Title"] || row["Event"] || "Untitled Event",
          startMonth: row["Start Month"] || "2026-01",
          endMonth: row["End Month"],
          category: (row["Category"] as Category) || "Other",
          region: (row["Region"] as Region) || "Global",
          suggestedProb: Number(row["Suggested Probability"] || 50),
          yourProb: Number(row["Your Probability"] || row["Suggested Probability"] || 50),
          effectiveProb: Number(row["Effective Probability"] || row["Your Probability"] || row["Suggested Probability"] || 50),
          description: row["Description"] || "",
          rationale: row["Rationale"],
          planningPrompts: row["Planning Prompts"],
          notes: row["Notes"],
          sources: row["Sources"] ? [{ title: "Source", url: row["Sources"] }] : [] // Basic source parsing
        }));

        onDataLoaded(parsedEvents);
        toast({ title: "Success", description: `Loaded ${parsedEvents.length} events.` });

      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to parse spreadsheet.", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    try {
      // Map back to flat structure
      const rows = events.map(evt => ({
        "Title": evt.title,
        "Start Month": evt.startMonth,
        "End Month": evt.endMonth,
        "Category": evt.category,
        "Region": evt.region,
        "Suggested Probability": evt.suggestedProb,
        "Your Probability": evt.yourProb,
        "Effective Probability": evt.effectiveProb,
        "Description": evt.description,
        "Rationale": evt.rationale,
        "Planning Prompts": evt.planningPrompts,
        "Notes": evt.notes,
        "Sources": evt.sources.map(s => s.url).join("; ")
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Events");
      XLSX.writeFile(wb, "future_timeline_updated.xlsx");
      
      toast({ title: "Exported", description: "Spreadsheet downloaded successfully." });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to export spreadsheet.", variant: "destructive" });
    }
  };

  return (
    <div className="flex gap-2">
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
        <Upload className="w-4 h-4" /> Upload
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
        <Download className="w-4 h-4" /> Export
      </Button>
    </div>
  );
}
