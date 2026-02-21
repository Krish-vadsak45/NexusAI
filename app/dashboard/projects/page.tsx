"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Plus,
  Folder,
  Calendar,
  ArrowRight,
  Trash2,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpinnerLoader } from "@/components/SpinnerLoader";

// Project Type
interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Schema
const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        q: debouncedSearch,
      });
      const response = await axios.get(`/api/projects?${params.toString()}`);
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/projects", {
        ...values,
      });
      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      reset();
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error("Failed to create project", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone.",
      )
    )
      return;

    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-neutral-500 bg-clip-text text-transparent">
            Project Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize generations into dedicated workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-neutral-900/50 border-neutral-800"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0 neon-border">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your AI generations.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Summer Campaign 2026"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this project about?"
                    className="max-h-32"
                    {...register("description")}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg">
            <SpinnerLoader
              variant="neon"
              size="md"
              text="Loading projects..."
            />
          </div>
        )}

        {!loading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg border-muted bg-muted/5">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground max-w-sm text-center mt-2 mb-6">
              {searchTerm
                ? `We couldn't find any projects matching "${searchTerm}"`
                : "Create your first project to start organizing your AI content."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`space-y-8 transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col border-neutral-800 bg-neutral-900/30">
                    <CardHeader className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-600">
                          <Folder className="w-5 h-5" />
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Created{" "}
                          {format(new Date(project.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t bg-muted/20 flex justify-between items-center text-sm">
                      <span className="text-muted-foreground group-hover:text-primary flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 h-8 w-8"
                        onClick={(e) => handleDelete(e, project._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
                <div className="text-sm text-neutral-400">
                  Showing {projects.length} of {pagination.total} projects
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-neutral-800 bg-neutral-900/50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    )
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          (p >= page - 1 && p <= page + 1),
                      )
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p !== arr[idx - 1] + 1;
                        return (
                          <div key={p} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-neutral-600">...</span>
                            )}
                            <Button
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${p === page ? "bg-blue-600 border-blue-500" : "border-neutral-800 bg-neutral-900/50"}`}
                              onClick={() => setPage(p)}
                              disabled={loading}
                            >
                              {p}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-neutral-800 bg-neutral-900/50"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
