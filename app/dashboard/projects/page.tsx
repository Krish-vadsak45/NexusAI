"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Folder, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

// Project Type
interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;

    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Organize your generated content into folders.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your AI generations.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Campaign 2026"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
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

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
            Create your first project to start organizing your AI content.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group h-full flex flex-col">
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
      )}
    </div>
  );
}
