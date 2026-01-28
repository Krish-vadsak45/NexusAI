"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Settings2,
  GripVertical,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTool: string;
  onToolChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  tools: string[];
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedTool,
  onToolChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  tools,
}: ProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"left" | "right">("right"); // Docked side
  const [top, setTop] = useState<number | null>(null); // Docked Y position

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Initial centering
    if (top === null) {
      setTop(window.innerHeight / 2 - 64);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Clamp Y to stay within screen
      const clampedY = Math.max(20, Math.min(window.innerHeight - 148, newY));

      // We don't clamp X tightly during drag to allow moving to other side freely
      // But we can keep it somewhat on screen
      const clampedX = Math.max(-100, Math.min(window.innerWidth - 50, newX));

      setDragPos({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      if (isDragging && dragPos) {
        // Snap logic
        const windowWidth = window.innerWidth;
        const centerX = windowWidth / 2;

        // Determine closest side
        // If center of component (approx dragPos.x + width/2) is > centerX -> Right
        // But simplified: where is the handle?
        if (dragPos.x + 24 < centerX) {
          // +24 is half button width
          setPosition("left");
        } else {
          setPosition("right");
        }

        // Persist the Y position
        setTop(dragPos.y);
      }
      setIsDragging(false);
      setDragPos(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, dragPos, top]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // Get the visual button element (parent of the handle) to calculate precise offset
    // This ensures that when we hide the content panel and the container shrinks,
    // we anchor the drag to the visible button, preventing visual jumps.
    const tabRect = e.currentTarget.parentElement?.getBoundingClientRect();

    if (tabRect) {
      dragOffset.current = {
        x: e.clientX - tabRect.left,
        y: e.clientY - tabRect.top,
      };
      setDragPos({ x: tabRect.left, y: tabRect.top });
    } else {
      // Fallback to container if something is odd, though structure is static
      const containerRect = e.currentTarget
        .closest(".fixed")
        ?.getBoundingClientRect();
      if (containerRect) {
        dragOffset.current = {
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        };
        setDragPos({ x: containerRect.left, y: containerRect.top });
      }
    }

    setIsDragging(true);
  };

  // Determine dynamic styles
  const style: React.CSSProperties =
    isDragging && dragPos
      ? {
          left: `${dragPos.x}px`,
          top: `${dragPos.y}px`,
          right: "auto", // Override right-0 class
          transform: "none", // Disable transitions/transforms during drag
          transition: "none",
        }
      : {
          top: top ? `${top}px` : "50%",
          // When not dragging, we rely on classes for Left/Right X positioning
          // and CSS transform for Open/Close
        };

  return (
    <div
      className={cn(
        "fixed z-40 flex items-start",
        // Position classes only apply when NOT dragging (drag uses inline styles)
        !isDragging &&
          (position === "right"
            ? "right-0 flex-row"
            : "left-0 flex-row-reverse"),
        !isDragging &&
          (isOpen
            ? "translate-x-0"
            : position === "right"
            ? "translate-x-[calc(100%-48px)]"
            : "-translate-x-[calc(100%-48px)]"),
        !isDragging &&
          "transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
      )}
      style={style}
    >
      {/* Toggle Tab Container */}
      <div
        className={cn(
          "flex flex-col shadow-2xl relative z-10 w-12 h-32 overflow-hidden border-y border-primary/20 bg-background",
          // Force border radius based on logical position, or just make it generic?
          // Let's stick to the side-specific look, it's nice.
          // When dragging, we keep the look of the side we started from?
          // Or update dynamically?
          // To update dynamically while dragging based on X:
          (
            isDragging
              ? dragPos && dragPos.x < window.innerWidth / 2
              : position === "left"
          )
            ? "rounded-r-xl border-r"
            : "rounded-l-xl border-l"
        )}
      >
        {/* Drag Handle Section */}
        <div
          className="h-10 w-full flex items-center justify-center bg-muted/80 hover:bg-muted cursor-grab active:cursor-grabbing transition-colors border-b"
          onMouseDown={handleMouseDown} // Attach handler to the Grip handle specifically? Or wrapper?
          // Previous implementation attached to wrapper. Let's attach to this handle to be specific as requested "one part drag".
          title="Drag to move"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground/70" />
        </div>

        {/* Clickable Toggle Section */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer bg-primary hover:bg-primary/90 transition-colors text-primary-foreground group"
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <div
              className="flex items-center gap-2 text-xs font-bold tracking-widest whitespace-nowrap py-2"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <Filter className="w-3 h-3 mb-1" />
              FILTERS
            </div>
          )}
        </button>
      </div>

      {/* Content Panel */}
      <div
        className={cn(
          "bg-background/95 backdrop-blur-md border shadow-2xl w-80 h-[500px] p-6 flex flex-col gap-6",
          position === "right"
            ? "rounded-bl-xl border-r-0"
            : "rounded-br-xl border-l-0",
          isDragging && "hidden"
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Filter Defaults
          </h3>
        </div>

        <div className="space-y-5 flex-1">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-muted/50 focus:bg-background transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Tool Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tool Type
            </label>
            <Select
              value={selectedTool || "all"}
              onValueChange={(val) => onToolChange(val === "all" ? "" : val)}
            >
              <SelectTrigger className="bg-muted/50 focus:bg-background transition-colors">
                <SelectValue placeholder="All Tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tools</SelectItem>
                {tools.map((tool) => (
                  <SelectItem key={tool} value={tool}>
                    {tool}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground ml-1">
                  From
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/50 focus:bg-background transition-colors text-xs h-9 px-2",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateFrom ? (
                        format(new Date(dateFrom), "LLL dd, y")
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom ? new Date(dateFrom) : undefined}
                      onSelect={(date) =>
                        onDateFromChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground ml-1">
                  To
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/50 focus:bg-background transition-colors text-xs h-9 px-2",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateTo ? (
                        format(new Date(dateTo), "LLL dd, y")
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo ? new Date(dateTo) : undefined}
                      onSelect={(date) =>
                        onDateToChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">Press toggle to hide</p>
        </div>
      </div>
    </div>
  );
}
