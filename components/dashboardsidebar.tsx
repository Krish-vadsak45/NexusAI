"use client";

import {
  Brain,
  Check,
  Code,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Scissors,
  Sparkles,
  Trash2,
  VideoIcon,
  Zap,
  // Loader2 replaced by InlineLoader
  Folder,
} from "lucide-react";
import { InlineLoader } from "./InlineLoader";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans";
import axios from "axios";
import Image from "next/image";

const tools = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-primary",
  },
  {
    label: "Projects",
    icon: Folder,
    href: "/dashboard/projects",
    color: "text-blue-500",
  },
  {
    label: "Nexus Studio",
    icon: Zap,
    href: "/dashboard/studio",
    color: "text-amber-500",
  },
  {
    label: "Article Writer",
    icon: Brain,
    href: "/dashboard/article-writer",
    color: "text-violet-500",
  },
  {
    label: "Title Generator",
    icon: Sparkles,
    href: "/dashboard/title-generator",
    color: "text-emerald-500",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/dashboard/image-generation",
    color: "text-pink-700",
  },
  {
    label: "Background Removal",
    icon: Scissors,
    href: "/dashboard/background-removal",
    color: "text-orange-700",
  },
  {
    label: "Object Removal",
    icon: Trash2,
    href: "/dashboard/object-removal",
    color: "text-red-700",
  },
  {
    label: "Resume Reviewer",
    icon: FileText,
    href: "/dashboard/resume-reviewer",
    color: "text-green-700",
  },
  {
    label: "Text Summarizer",
    icon: Zap,
    href: "/dashboard/text-summarizer",
    color: "text-yellow-500",
  },
  {
    label: "Code Generator",
    icon: Code,
    href: "/dashboard/code-generator",
    color: "text-blue-700",
  },
  {
    label: "Video repurposer",
    icon: VideoIcon,
    href: "/dashboard/video-repurposer",
    color: "text-cyan-500",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/profile");
        if (res.data?.user?.subscription?.planId) {
          const planId = res.data.user.subscription.planId;
          // Capitalize first letter for display
          const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
          console.log("Fetched plan:", planName, planId);
          setCurrentPlan(planName);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handlePlanSwitch = async (planKey: string) => {
    const selectedPlan = PLANS[planKey as keyof typeof PLANS];
    const planName = selectedPlan.name;

    if (planName === currentPlan) {
      toast.info(`You are already on the ${planName} plan.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/stripe/checkout", {
        planId: selectedPlan.id,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
        toast.success(
          response.data.message || `Redirecting to ${planName} plan checkout.`,
        );
      } else {
        toast.error("Failed to start checkout process");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-black border-r border-border">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center justify-center">
          <div className="relative h-10 w-10">
            <Image
              src="/logo-1.png"
              alt="NexusAI Logo"
              fill
              className="object-contain relative h-40 w-40"
            />
          </div>
        </Link>
        <div className="space-y-1">
          {tools.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-border">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center p-3 w-full rounded-lg hover:bg-primary/10 cursor-pointer transition group">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3 uppercase">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-medium text-white truncate">
                  {session?.user?.name || session?.user?.email || "User"}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {currentPlan} Plan
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 rounded-md border bg-popover shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {session?.user?.name || session?.user?.email || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
                    {currentPlan} Plan
                  </span>
                </div>
              </div>
            </div>
            <div className="h-px bg-border my-3" />
            <div className="flex flex-col">
              <button
                onClick={() => {
                  setPopoverOpen(false);
                  router.push("/profile");
                }}
                className="text-left px-3 py-2 hover:bg-primary/5 rounded text-sm w-full"
              >
                Manage profile
              </button>
              <button
                onClick={() => {
                  setPopoverOpen(false);
                  setIsOpen(true);
                }}
                className="text-left px-3 py-2 hover:bg-primary/5 rounded text-sm w-full mt-1"
              >
                Switch plan
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Switch Plan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {Object.keys(PLANS).map((key) => {
                const plan = PLANS[key as keyof typeof PLANS];
                const isCurrent = currentPlan.toLowerCase() === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                      isCurrent
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "hover:border-primary hover:bg-secondary/50",
                    )}
                    onClick={() => handlePlanSwitch(key)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2">
                        {plan.name}
                        {isCurrent && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${plan.price}/month
                      </span>
                    </div>
                    {isLoading && !isCurrent ? (
                      <InlineLoader className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8">
                        Switch
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
