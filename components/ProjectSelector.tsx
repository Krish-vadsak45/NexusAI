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

interface Project {
  _id: string;
  name: string;
}

interface Props {
  value?: string;
  onValueChange: (value: string) => void;
}

export function ProjectSelector({ value, onValueChange }: Readonly<Props>) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch projects on mount
    axios.get("/api/projects").then((res) => {
      // Ensure we set projects correctly regardless of API structure
      const projectsData = Array.isArray(res.data)
        ? res.data
        : res.data?.projects || [];
      setProjects(projectsData);
    });
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Project *" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Project</SelectItem>
        {Array.isArray(projects) &&
          projects.map((p) => (
            <SelectItem key={p._id} value={p._id}>
              {p.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
