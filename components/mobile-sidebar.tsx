"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DashboardSidebar from "./dashboardsidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog key={pathname} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="fixed left-0 top-0 bottom-0 translate-x-0 translate-y-0 h-full w-[300px] p-0 border-none bg-black max-w-none rounded-none"
        showCloseButton={false}
      >
        <DashboardSidebar />
      </DialogContent>
    </Dialog>
  );
}
