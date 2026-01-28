"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { FolderPlus } from "lucide-react";

interface Project {
  _id: string;
  name: string;
}

interface Props {
  value?: string;
  onValueChange: (value: string) => void;
}

export function ProjectSelector({ value, onValueChange }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch projects on mount
    axios
      .get("/api/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="w-full">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-background">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Save to Project (Optional)" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Project</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p._id} value={p._id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
