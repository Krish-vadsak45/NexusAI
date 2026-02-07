"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  FileText,
  Folder,
  Calendar,
  // Loader2 removed - using InlineLoader where needed
  History as HistoryIcon,
  Type,
  Code2,
  FileType,
  ArrowRight,
  X,
  ImageIcon,
  Scissors,
  Eraser,
  Video,
  Briefcase,
  Copy,
  Check,
  Download,
  Trash2,
  UserCog,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ProjectAssembler } from "@/components/ProjectAssembler";
import { HistoryItemRenderer } from "@/components/HistoryItemRenderer";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import SharedAssetsPanel from "@/components/SharedAssetsPanel";
import { InlineLoader } from "@/components/InlineLoader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InviteForm } from "@/components/MembersPanel";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  userId?: string; // added so we can detect legacy owner on client
}

interface HistoryItem {
  _id: string;
  tool: string;
  title: string;
  createdAt: string;
  input: any;
  output: any;
}

export default function ProjectDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const [project, setProject] = useState<Project | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "history" | "assembler" | "members"
  >("history");
  // const [copiedId, setCopiedId] = useState<string | null>(null); // Removed, handled in Renderer
  const [searchQuery, setSearchQuery] = useState("");
  const [toolFilter, setToolFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // New member-related state
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [projectInvites, setProjectInvites] = useState<any[]>([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${params.id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    }
    load();
  }, [params.id]);

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTool = toolFilter ? item.tool === toolFilter : true;

    let matchesDate = true;
    const itemDate = new Date(item.createdAt);

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && itemDate >= fromDate;
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && itemDate <= toDate;
    }

    return matchesSearch && matchesTool && matchesDate;
  });

  const uniqueTools = Array.from(
    new Set(historyItems.map((item) => item.tool)),
  );

  const getIcon = (tool: string) => {
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
  };

  const renderInput = (item: HistoryItem) => {
    const input = item.input;
    if (!input) return null;

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
            )
              return null;
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
          {(input.text ||
            input.prompt ||
            input.context ||
            input.jobDescription) && (
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
                {input.text ||
                  input.prompt ||
                  input.context ||
                  input.jobDescription}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOutput = (item: HistoryItem) => {
    return (
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
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch project + history + profile in parallel
        const [projectRes, historyRes, profileRes] = await Promise.all([
          axios.get(`/api/projects/${params.id}`),
          axios.get(`/api/history?projectId=${params.id}`),
          axios.get(`/api/profile`).catch(() => null),
        ]);

        setProject(projectRes.data);
        setHistoryItems(historyRes.data);
        if (profileRes?.data?.user?.id) {
          setCurrentUserId(profileRes.data.user.id);
          // detect owner (legacy project.userId or project.userId field)
          const projUserId =
            projectRes.data?.userId || projectRes.data?.createdBy || null;
          setIsOwner(String(projUserId) === String(profileRes.data.user.id));
        }
      } catch (error) {
        console.error("Failed to fetch project details", error);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Fetch members when tab becomes active
  useEffect(() => {
    if (activeTab !== "members") return;
    if (!params.id) return;
    setMembersLoading(true);
    fetch(`/api/projects/${params.id}/members`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load members");
        return r.json();
      })
      .then((d) => {
        console.log("Members data", d);
        setMembers(d.members || []);
        // if we don't have currentUserId, try to infer owner by member list:
        if (!currentUserId) {
          const ownerEntry = d.members?.find((m: any) => m.role === "owner");
          if (
            ownerEntry &&
            project &&
            String(project.userId) === String(ownerEntry.userId)
          ) {
            // nothing else; owner detection ideally comes from /api/profile
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load members");
      })
      .finally(() => setMembersLoading(false));
  }, [activeTab, params.id, currentUserId, project]);

  const handleUpdateRole = async (memberUserId: string, newRole: string) => {
    try {
      await axios.patch(`/api/projects/${params.id}/members/${memberUserId}`, {
        role: newRole,
      });
      toast.success("Role updated");
      // refresh members
      const res = await axios.get(`/api/projects/${params.id}/members`);
      setMembers(res.data.members || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(`/api/projects/${params.id}/members/${memberUserId}`);
      toast.success("Member removed");
      setMembers(members.filter((m) => m.userId !== memberUserId));
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to remove member");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Project not found</h2>
        <Link href="/dashboard/projects">
          <Button variant="link">Go back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8 relative">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/projects"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                Created {format(new Date(project.createdAt), "PPP")}
              </div>
            </div>
          </div>
          {/* Inbox button */}
          <div className="flex items-center gap-2">
            <Dialog
              open={inboxOpen}
              onOpenChange={(open) => setInboxOpen(open)}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={async () => {
                    // open will be set by DialogTrigger, but pre-fetch data
                    setInboxOpen(true);
                    setInboxLoading(true);
                    try {
                      const [nRes, iRes] = await Promise.all([
                        axios.get("/api/notifications"),
                        axios
                          .get(`/api/projects/${params.id}/invites`)
                          .catch(() => ({ data: { invites: [] } })),
                      ]);
                      setNotifications(nRes.data.notifications || []);
                      setProjectInvites(iRes.data?.invites || []);
                      console.log("Inbox data", nRes.data, iRes.data);
                    } catch (e) {
                      console.error(e);
                      toast.error("Failed to load inbox");
                    } finally {
                      setInboxLoading(false);
                    }
                  }}
                  className="gap-2"
                >
                  Inbox
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inbox</DialogTitle>
                  <DialogDescription>
                    Project-related notifications and invites
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {inboxLoading ? (
                    <InlineLoader />
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Notifications
                        </h3>
                        {notifications.filter(
                          (n) => n.data?.projectId === params.id,
                        ).length === 0 ? (
                          <div className="text-sm text-muted-foreground py-6 text-center border-dashed border-2 rounded-lg">
                            No pending project notifications
                          </div>
                        ) : (
                          notifications
                            .filter((n) => n.data?.projectId === params.id)
                            .map((n: any) => (
                              <div
                                key={n._id}
                                className="p-4 border rounded-lg bg-muted/20 space-y-3"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1 flex-1">
                                    <div className="text-sm font-semibold capitalize flex items-center gap-2">
                                      {n.type === "invite_sent" ? (
                                        <>
                                          <UserCog className="w-3.5 h-3.5 text-blue-500" />{" "}
                                          Invite Received
                                        </>
                                      ) : n.type === "invite_rejected" ? (
                                        <>
                                          <X className="w-3.5 h-3.5 text-red-500" />{" "}
                                          Invite Declined
                                        </>
                                      ) : (
                                        n.type.replace("_", " ")
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                      {n.type === "invite_sent" ? (
                                        <>
                                          <span className="font-medium text-foreground">
                                            {n.data?.invitedByName || "Someone"}
                                          </span>{" "}
                                          invited you to join
                                          <span className="font-medium text-foreground">
                                            {" "}
                                            {n.data?.projectName ||
                                              "the project"}
                                          </span>{" "}
                                          as
                                          <span className="font-medium text-foreground capitalize">
                                            {" "}
                                            {n.data?.role}
                                          </span>
                                          .
                                        </>
                                      ) : n.type === "invite_rejected" ? (
                                        <>
                                          <span className="font-medium text-foreground">
                                            {n.data?.rejectedByName ||
                                              "Someone"}
                                          </span>{" "}
                                          declined your invite to project.
                                        </>
                                      ) : (
                                        n.data?.projectName || n.data?.projectId
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground opacity-70">
                                      {format(
                                        new Date(n.createdAt),
                                        "MMM d, h:mm a",
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0">
                                    {n.type === "invite_sent" ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          className="h-8 px-3"
                                          onClick={async () => {
                                            try {
                                              await axios.post(
                                                "/api/invites/respond",
                                                {
                                                  inviteId: n.data.inviteId,
                                                  action: "accept",
                                                },
                                              );
                                              toast.success("Invite accepted");
                                              // refresh
                                              const res =
                                                await axios.get(
                                                  "/api/notifications",
                                                );
                                              setNotifications(
                                                res.data.notifications || [],
                                              );
                                            } catch (e: any) {
                                              console.error(e);
                                              toast.error(
                                                e?.response?.data?.error ||
                                                  "Accept failed",
                                              );
                                            }
                                          }}
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-3"
                                          onClick={async () => {
                                            try {
                                              await axios.post(
                                                "/api/invites/respond",
                                                {
                                                  inviteId: n.data.inviteId,
                                                  action: "reject",
                                                },
                                              );
                                              toast.success("Invite rejected");
                                              const res =
                                                await axios.get(
                                                  "/api/notifications",
                                                );
                                              setNotifications(
                                                res.data.notifications || [],
                                              );
                                            } catch (e: any) {
                                              console.error(e);
                                              toast.error(
                                                e?.response?.data?.error ||
                                                  "Reject failed",
                                              );
                                            }
                                          }}
                                        >
                                          Reject
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs h-fit py-1"
                                        onClick={async () => {
                                          try {
                                            await axios.patch(
                                              "/api/notifications",
                                              { id: n._id, mark: "read" },
                                            );
                                            setNotifications(
                                              notifications.filter(
                                                (prev) => prev._id !== n._id,
                                              ),
                                            );
                                          } catch (e) {
                                            toast.error("Failed to dismiss");
                                          }
                                        }}
                                      >
                                        Dismiss
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {isOwner && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5" /> Sent Invites
                          </h3>
                          {projectInvites.filter(
                            (iv: any) => iv.status === "pending",
                          ).length === 0 ? (
                            <div className="text-sm text-muted-foreground py-6 text-center border-dashed border-2 rounded-lg">
                              No pending invites
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {projectInvites
                                .filter((iv: any) => iv.status === "pending")
                                .map((iv: any) => (
                                  <div
                                    key={iv._id}
                                    className="p-4 border rounded-xl bg-muted/10 flex items-start justify-between gap-4"
                                  >
                                    <div className="space-y-1">
                                      <div className="font-semibold text-sm">
                                        {iv.email}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] h-4 px-1 capitalize font-normal"
                                        >
                                          {iv.role}
                                        </Badge>
                                        <span>
                                          Sent{" "}
                                          {format(
                                            new Date(iv.createdAt),
                                            "MMM d",
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                                        onClick={async () => {
                                          try {
                                            await axios.delete(
                                              `/api/projects/${params.id}/invites`,
                                              { data: { inviteId: iv._id } },
                                            );
                                            toast.success("Invite cancelled");
                                            const res = await axios.get(
                                              `/api/projects/${params.id}/invites`,
                                            );
                                            setProjectInvites(
                                              res.data.invites || [],
                                            );
                                          } catch (e: any) {
                                            console.error(e);
                                            toast.error(
                                              e?.response?.data?.error ||
                                                "Cancel failed",
                                            );
                                          }
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground max-w-3xl">
            {project.description}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2"></div>
          <aside className="md:col-span-1 space-y-6">
            <SharedAssetsPanel projectId={params.id} />
          </aside>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant={activeTab === "history" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("history")}
          className="gap-2"
        >
          <HistoryIcon className="h-4 w-4" />
          History
        </Button>
        <Button
          variant={activeTab === "assembler" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("assembler")}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Draft Board
        </Button>
        <Button
          variant={activeTab === "members" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("members")}
          className="gap-2"
        >
          <Briefcase className="h-4 w-4" />
          Members
        </Button>
      </div>

      {activeTab === "history" ? (
        <>
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTool={toolFilter}
            onToolChange={setToolFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            tools={uniqueTools}
          />
          <Separator />

          {/* Content */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Project Content
              <Badge variant="secondary" className="ml-2">
                {filteredItems.length}
                {filteredItems.length !== historyItems.length &&
                  ` / ${historyItems.length}`}
              </Badge>
            </h2>

            {historyItems.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">This project is empty.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Go to tools and select this project to save generations here.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">
                  No matching results found.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setToolFilter("");
                    // setDateFilter("");
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
                          <CardTitle className="text-sm font-medium">
                            {item.tool}
                          </CardTitle>
                          {getIcon(item.tool)}
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold truncate mb-1">
                            {item.title}
                          </div>
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
                          Generated on{" "}
                          {new Date(item.createdAt).toLocaleString()} using{" "}
                          {item.tool}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/10">
                        {renderInput(item)}
                        {renderOutput(item)}
                      </div>

                      <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 sm:justify-between items-center">
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          ID: {item._id}
                        </div>
                        <DialogClose asChild>
                          <Button
                            size="lg"
                            className="w-full sm:w-auto min-w-[150px]"
                          >
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
      ) : activeTab === "assembler" ? (
        <ProjectAssembler items={historyItems} />
      ) : (
        // Members tab
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project members</h2>
            {isOwner && (
              <div className="text-sm text-muted-foreground">
                You are the owner — full access
              </div>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Invite</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a collaborator</DialogTitle>
                  <DialogDescription>
                    Send an invite by email and choose a role.
                  </DialogDescription>
                </DialogHeader>
                <InviteForm
                  projectId={params.id}
                  onInvited={() => {
                    setOpen(false);
                    /* reload */ fetch(`/api/projects/${params.id}/members`)
                      .then((r) => r.json())
                      .then((d) => setMembers(d.members || []));
                  }}
                />
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {membersLoading ? (
            <div className="p-6">
              <InlineLoader />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">
                No members on this project.
              </p>
            </div>
          ) : isOwner ? (
            // Owner view: table
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-muted-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Invite status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Invited by
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y">
                  {members.map((m) => (
                    <tr key={m.userId || `${m.email}-${m.role}`}>
                      <td className="px-4 py-3 text-sm">{m.userName}</td>
                      <td className="px-4 py-3 text-sm capitalize">{m.role}</td>
                      <td className="px-4 py-3 text-sm">{m.userEmail}</td>
                      <td className="px-4 py-3 text-sm">
                        {m.inviteStatus || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {m.invitedBy || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {/* Don't show actions for the current user (the owner themselves) to prevent self-removal/demotion in this UI */}
                        {m.userId !== currentUserId && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                              <div className="flex flex-col gap-1">
                                <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                                  Change Role
                                </div>
                                {(["owner", "editor", "viewer"] as const).map(
                                  (r) => (
                                    <Button
                                      key={r}
                                      variant={
                                        m.role === r ? "secondary" : "ghost"
                                      }
                                      size="sm"
                                      className="justify-start font-normal capitalize"
                                      onClick={() =>
                                        handleUpdateRole(m.userId, r)
                                      }
                                    >
                                      <UserCog className="mr-2 h-4 w-4" />
                                      {r}
                                    </Button>
                                  ),
                                )}
                                <div className="h-px bg-muted my-1" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveMember(m.userId)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Non-owner view: simple list
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m.userId || `${m.email}-${m.role}`}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {m.userName || m.userEmail}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {m.role}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {m.inviteStatus || "active"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
