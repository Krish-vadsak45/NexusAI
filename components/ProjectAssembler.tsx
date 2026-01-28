"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HistoryItemRenderer } from "./HistoryItemRenderer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  GripVertical,
  Plus,
  Minus,
  FileDown,
  FileText,
  Trash,
  Trash2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface HistoryItem {
  _id: string;
  tool: string;
  title: string;
  createdAt: string;
  input: any;
  output: any;
}

interface ProjectAssemblerProps {
  items: HistoryItem[];
}

interface CanvasItem {
  id: string;
  historyItem: HistoryItem;
}

function DraggableSourceItem({
  item,
  onAdd,
}: {
  item: HistoryItem;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `source-${item._id}`,
    data: { item },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-card border rounded-lg cursor-move hover:border-primary/50 transition-colors shadow-sm mb-2 group flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.tool}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 hover:bg-primary/10 hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SortableCanvasItem({
  item,
  onRemove,
}: {
  item: CanvasItem;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-card border rounded-xl shadow-sm mb-4"
    >
      <div
        className="absolute left-2 top-2 z-10 cursor-move p-1 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-0 z-10 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="p-4 pt-8">
        {/* We don't want the full renderer potentially. Or maybe we do? 
             The renderer has its own padding/styles. 
             If we use HistoryItemRenderer, it might have card-like styles.
             Let's check HistoryItemRenderer. It has `bg-background p-8` etc. 
             Ideally we stripping containers in Assembler?
             For now, just render it. */}
        <div className="pointer-events-none-if-dragging">
          <HistoryItemRenderer item={item.historyItem} />
        </div>
      </div>
    </div>
  );
}

export function ProjectAssembler({ items }: ProjectAssemblerProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());

    if (active.id.toString().startsWith("source-")) {
      const original = items.find((i) => `source-${i._id}` === active.id);
      if (original) setActiveItem(original);
    } else {
      // Must be a canvas item
      const original = canvasItems.find((i) => i.id === active.id);
      if (original) setActiveItem(original.historyItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    // Dropping Source -> Canvas
    if (active.id.toString().startsWith("source-")) {
      // Check if dropped over canvas area or an item in canvas
      const isOverCanvas =
        over.id === "canvas-area" ||
        over.id.toString().startsWith("canvas-item-");

      if (isOverCanvas) {
        const itemId = active.id.toString().replace("source-", "");
        const itemToAdd = items.find((i) => i._id === itemId);
        if (itemToAdd) {
          setCanvasItems((current) => [
            ...current,
            {
              id: `canvas-item-${Date.now()}-${Math.random()}`,
              historyItem: itemToAdd,
            },
          ]);
          toast.success("Added to Draft");
        }
      }
      return;
    }

    // Reordering Canvas
    if (active.id !== over.id) {
      setCanvasItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeCanvasItem = (id: string) => {
    setCanvasItems((items) => items.filter((i) => i.id !== id));
  };

  const exportToPDF = async () => {
    const element = document.getElementById("assembler-canvas");
    if (!element) return;

    try {
      toast.info("Generating PDF...");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // 1. Wipe the head to remove all stylesheets references (preventing oklch/lab parsing)
          clonedDoc.head.innerHTML = "";

          // 2. Inject a basic reset style for the clone
          const style = clonedDoc.createElement("style");
          style.innerHTML =
            "body { margin: 0; background: #ffffff; font-family: sans-serif; }";
          clonedDoc.head.appendChild(style);

          const clonedElement = clonedDoc.getElementById("assembler-canvas");
          const originalElement = document.getElementById("assembler-canvas");

          if (clonedElement && originalElement) {
            // Helper for color sanitization
            const ctx = clonedDoc.createElement("canvas").getContext("2d");

            // 3. Recursively bake computed styles and strip classes
            const bakeStyles = (source: Element, target: HTMLElement) => {
              const computed = window.getComputedStyle(source);

              const getSafeColor = (val: string, fallback: string) => {
                if (!val) return fallback;
                if (!val.includes("lab(") && !val.includes("oklch("))
                  return val;
                if (ctx) {
                  try {
                    ctx.fillStyle = val;
                    const c = ctx.fillStyle;
                    if (!c.includes("lab(") && !c.includes("oklch(")) return c;
                  } catch (e) {}
                }
                return fallback;
              };

              // Explicitly copy all relevant layout/visual properties
              // This converts variables/derived values into absolute pixels/rgb colors
              const props = [
                "display",
                "position",
                "width",
                "height",
                "margin",
                "padding",
                "borderWidth", // Split border to avoid shorthand issues
                "borderStyle",
                //"borderColor", // Handled safely below
                "borderRadius",
                //"backgroundColor", // Handled safely below
                //"color", // Handled safely below
                "font",
                "fontFamily",
                "fontSize",
                "fontWeight",
                "lineHeight",
                "textAlign",
                "flexDirection",
                "alignItems",
                "justifyContent",
                "gap",
                "gridTemplateColumns",
                "opacity",
                //"boxShadow", // Handled safely below
                "transform",
                "zIndex",
                "whiteSpace",
                "wordBreak",
                "textTransform",
                "overflow",
              ];

              props.forEach((prop) => {
                // @ts-ignore - Dynamic property access
                if (computed[prop]) target.style[prop] = computed[prop];
              });

              // Safe color handling
              target.style.backgroundColor = getSafeColor(
                computed.backgroundColor,
                "transparent",
              );
              target.style.color = getSafeColor(computed.color, "#000000");
              target.style.borderColor = getSafeColor(
                computed.borderColor,
                "transparent",
              );

              const shadow = computed.boxShadow;
              if (
                shadow &&
                (shadow.includes("lab(") || shadow.includes("oklch("))
              ) {
                target.style.boxShadow = "none";
              } else {
                target.style.boxShadow = shadow;
              }

              // Crucial: Clear class names so html2canvas doesn't try to look up removed styles
              if ("removeAttribute" in target) {
                target.removeAttribute("class");
              }

              // Recursively process children
              for (let i = 0; i < source.children.length; i++) {
                if (target.children[i] && source.children[i]) {
                  bakeStyles(
                    source.children[i],
                    target.children[i] as HTMLElement,
                  );
                }
              }
            };

            bakeStyles(originalElement, clonedElement);

            // Explicitly force white background on the container
            clonedElement.style.backgroundColor = "#ffffff";
          }
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("project-draft.pdf");
      toast.success("PDF Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    }
  };

  const exportToMarkdown = () => {
    let markdown = "# Project Draft\n\n";
    canvasItems.forEach((item) => {
      const { tool, output } = item.historyItem;
      markdown += `## ${item.historyItem.title} (${tool})\n\n`;

      if (tool === "Article Writer") {
        markdown += output.article + "\n\n";
      } else if (tool === "Code Generator") {
        markdown += "```" + (item.historyItem.input.language || "") + "\n";
        markdown += output.code + "\n";
        markdown += "```\n\n";
        if (output.explanation) markdown += `> ${output.explanation}\n\n`;
      } else if (tool === "Text Summarizer") {
        markdown += output + "\n\n";
      } else if (tool === "Image Generation") {
        markdown += `![Generated Image](${output})\n\n`;
      } else {
        // Fallback
        markdown += JSON.stringify(output) + "\n\n";
      }
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-draft.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Markdown Downloaded");
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Source List */}
        <div className="md:col-span-1 border rounded-xl bg-muted/10 p-4 overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded-md">
              <GripVertical className="h-4 w-4 text-primary" />
            </div>
            Components
          </h3>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {items.map((item) => (
              <DraggableSourceItem
                key={item._id}
                item={item}
                onAdd={() => {
                  setCanvasItems((current) => [
                    ...current,
                    {
                      id: `canvas-item-${Date.now()}-${Math.random()}`,
                      historyItem: item,
                    },
                  ]);
                  toast.success("Added to Draft");
                }}
              />
            ))}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No generated content available.
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="md:col-span-3 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Document Builder</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToMarkdown}>
                <FileText className="h-4 w-4 mr-2" /> Export MD
              </Button>
              <Button size="sm" onClick={exportToPDF}>
                <FileDown className="h-4 w-4 mr-2" /> Export PDF
              </Button>
            </div>
          </div>

          <div
            id="assembler-canvas"
            className="flex-1 border rounded-xl bg-background shadow-sm overflow-y-auto p-8"
          >
            <SortableContext
              items={canvasItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                ref={useDroppable({ id: "canvas-area" }).setNodeRef}
                className="min-h-full space-y-4"
              >
                {canvasItems.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <Plus className="h-10 w-10 mb-2 opacity-20" />
                    <p>Drag and drop items here to build your document</p>
                  </div>
                )}
                {canvasItems.map((item) => (
                  <SortableCanvasItem
                    key={item.id}
                    item={item}
                    onRemove={removeCanvasItem}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeItem ? (
          <div className="p-3 bg-card border rounded-lg shadow-xl w-[280px] cursor-grabbing flex items-center gap-3">
            <div className="p-1.5 bg-muted rounded-md shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{activeItem.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeItem.tool}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
