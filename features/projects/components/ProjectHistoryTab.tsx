"use client";

import { useMemo } from "react";
import {
  Calendar,
  ArrowRight,
  FileText,
  Type,
  Code2,
  FileType,
  ImageIcon,
  Scissors,
  Eraser,
  Video,
  Briefcase,
  History as HistoryIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SearchAndFilter } from "@/features/dashboard/components/SearchAndFilter";
import { HistoryItemRenderer } from "@/components/HistoryItemRenderer";
import type { HistoryItem, UnknownRecord } from "@/lib/shared-types";

function getIcon(tool: string) {
  switch (tool) {
    case "Article Writer":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "Title Generator":
      return <Type className="h-5 w-5 text-purple-500" />;
    case "Text Summarizer":
      return <FileType className="h-5 w-5 text-orange-500" />;
    case "Code Generator":
      return <Code2 className="h-5 w-5 text-green-500" />;
    case "Image Generation":
      return <ImageIcon className="h-5 w-5 text-pink-500" />;
    case "Background Removal":
      return <Scissors className="h-5 w-5 text-indigo-500" />;
    case "Object Removal":
      return <Eraser className="h-5 w-5 text-red-500" />;
    case "Resume Reviewer":
      return <Briefcase className="h-5 w-5 text-yellow-500" />;
    case "Video Repurposer":
      return <Video className="h-5 w-5 text-cyan-500" />;
    default:
      return <HistoryIcon className="h-5 w-5 text-gray-500" />;
  }
}

function renderInput(item: HistoryItem) {
  const input = item.input as UnknownRecord;
  if (!input) return null;
  const primaryInputValue = [
    input.text,
    input.prompt,
    input.context,
    input.jobDescription,
  ].find((value): value is string => typeof value === "string" && value.length > 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <span className="h-px w-4 bg-muted-foreground/50"></span>
        Input Parameters
        <span className="h-px flex-1 bg-muted-foreground/20"></span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
        {Object.entries(input).map(([key, value]) => {
          if (
            key === "text" ||
            key === "prompt" ||
            key === "context" ||
            key === "jobDescription"
          ) {
            return null;
          }
          return (
            <div key={key} className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {key}
              </span>
              <span className="text-sm font-medium bg-background px-2 py-1 rounded border w-fit max-w-full truncate">
                {String(value)}
              </span>
            </div>
          );
        })}
        {primaryInputValue && (
          <div className="col-span-1 md:col-span-2 flex flex-col space-y-1 mt-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {input.prompt
                ? "Prompt"
                : input.context
                  ? "Context"
                  : input.jobDescription
                    ? "Job Description"
                    : "Input Text"}
            </span>
            <div className="text-sm bg-background p-3 rounded-md border whitespace-pre-wrap max-h-40 overflow-y-auto shadow-sm">
              {primaryInputValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectHistoryTab(props: {
  historyItems: HistoryItem[];
  uniqueTools: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  toolFilter: string;
  onToolChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}) {
  const filteredItems = useMemo(() => {
    return props.historyItems.filter((item) => {
      const matchesSearch = (item.title || "")
        .toLowerCase()
        .includes(props.searchQuery.toLowerCase());
      const matchesTool = props.toolFilter ? item.tool === props.toolFilter : true;

      let matchesDate = true;
      const itemDate = new Date(item.createdAt);
      if (props.dateFrom) {
        const fromDate = new Date(props.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && itemDate >= fromDate;
      }
      if (props.dateTo) {
        const toDate = new Date(props.dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && itemDate <= toDate;
      }
      return matchesSearch && matchesTool && matchesDate;
    });
  }, [props.dateFrom, props.dateTo, props.historyItems, props.searchQuery, props.toolFilter]);

  return (
    <>
      <SearchAndFilter
        searchQuery={props.searchQuery}
        onSearchChange={props.onSearchChange}
        selectedTool={props.toolFilter}
        onToolChange={props.onToolChange}
        dateFrom={props.dateFrom}
        onDateFromChange={props.onDateFromChange}
        dateTo={props.dateTo}
        onDateToChange={props.onDateToChange}
        tools={props.uniqueTools}
      />
      <Separator />
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Project Content
          <Badge variant="secondary" className="ml-2">
            {filteredItems.length}
            {filteredItems.length !== props.historyItems.length &&
              ` / ${props.historyItems.length}`}
          </Badge>
        </h2>

        {props.historyItems.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">This project is empty.</p>
            <p className="text-sm text-gray-400 mt-1">
              Go to tools and select this project to save generations here.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No matching results found.</p>
            <Button
              variant="link"
              onClick={() => {
                props.onDateFromChange("");
                props.onDateToChange("");
                props.onToolChange("");
              }}
              className="mt-1"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Dialog key={item._id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{item.tool}</CardTitle>
                      {getIcon(item.tool)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold truncate mb-1">{item.title}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
                  <DialogHeader className="p-6 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      {getIcon(item.tool)}
                      {item.title}
                    </DialogTitle>
                    <DialogDescription>
                      Generated on {new Date(item.createdAt).toLocaleString()} using{" "}
                      {item.tool}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/10">
                    {renderInput(item)}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <span className="h-px w-4 bg-muted-foreground/50"></span>
                          Generated Output
                        </h3>
                        <span className="h-px flex-1 bg-muted-foreground/20 ml-4"></span>
                      </div>
                      <HistoryItemRenderer item={item} />
                    </div>
                  </div>
                  <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 sm:justify-between items-center">
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      ID: {item._id}
                    </div>
                    <DialogClose asChild>
                      <Button size="lg" className="w-full sm:w-auto min-w-[150px]">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
