"use client";

import { use, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Briefcase, Calendar, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ProjectAssembler } from "@/features/projects/components/ProjectAssembler";
import SharedAssetsPanel from "@/features/projects/components/SharedAssetsPanel";
import { InlineLoader } from "@/components/InlineLoader";
import { InviteForm } from "@/features/projects/components/MembersPanel";
import { getErrorMessage } from "@/lib/error-utils";
import { apiDelete } from "@/lib/api/client";
import { z } from "zod";
import { useProjectDetails } from "@/features/projects/hooks/useProjectDetails";
import { useProjectInbox } from "@/features/projects/hooks/useProjectInbox";
import { useProjectMembers } from "@/features/projects/hooks/useProjectMembers";
import { ProjectHistoryTab } from "@/features/projects/components/ProjectHistoryTab";
import { ProjectMembersTab } from "@/features/projects/components/ProjectMembersTab";

const successSchema = z.object({ success: z.boolean() });

export default function ProjectDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const [activeTab, setActiveTab] = useState<"history" | "assembler" | "members">(
    "history",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [toolFilter, setToolFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { project, historyItems, loading, currentUserId, isOwner, uniqueTools } =
    useProjectDetails(params.id);
  const {
    members,
    membersLoading,
    membersPage,
    setMembersPage,
    membersPagination,
    loadMembers,
    updateRole,
    removeMember,
  } = useProjectMembers(params.id, activeTab === "members");
  const {
    notifications,
    projectInvites,
    inboxOpen,
    setInboxOpen,
    inboxLoading,
    loadInbox,
  } = useProjectInbox(params.id);

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
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                Created {project.createdAt ? format(new Date(project.createdAt), "PPP") : "-"}
              </div>
            </div>
          </div>

          <Dialog open={inboxOpen} onOpenChange={setInboxOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => void loadInbox()} className="gap-2">
                Inbox
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inbox</DialogTitle>
                <DialogDescription>Project-related notifications and invites</DialogDescription>
              </DialogHeader>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {inboxLoading ? (
                  <InlineLoader />
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      {notifications.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-6 text-center border-dashed border-2 rounded-lg">
                          No pending project notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className="p-4 border rounded-lg bg-muted/20 space-y-2"
                          >
                            <div className="font-medium capitalize">
                              {notification.type.replaceAll("_", " ")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {notification.data?.projectName || notification.data?.projectId}
                            </div>
                            <div className="text-[10px] text-muted-foreground opacity-70">
                              {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Pending Invites</h3>
                      {projectInvites.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-6 text-center border-dashed border-2 rounded-lg">
                          No pending invites
                        </div>
                      ) : (
                        projectInvites.map((invite) => (
                          <div
                            key={invite._id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <div className="font-medium">{invite.email}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {invite.role} • {invite.status}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                try {
                                  await apiDelete(`/api/projects/${params.id}/invites`, successSchema, {
                                    data: { inviteId: invite._id },
                                  });
                                  toast.success("Invite cancelled");
                                  await loadInbox();
                                } catch (error) {
                                  toast.error(getErrorMessage(error, "Cancel failed"));
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
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

        {project.description && (
          <p className="text-muted-foreground max-w-3xl">{project.description}</p>
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
          <FileText className="h-4 w-4" />
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
        <ProjectHistoryTab
          historyItems={historyItems}
          uniqueTools={uniqueTools}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          toolFilter={toolFilter}
          onToolChange={setToolFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />
      ) : activeTab === "assembler" ? (
        <ProjectAssembler items={historyItems} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project members</h2>
            {isOwner && (
              <div className="text-sm text-muted-foreground">You are the owner - full access</div>
            )}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
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
                    setInviteDialogOpen(false);
                    void loadMembers();
                  }}
                />
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setInviteDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ProjectMembersTab
            members={members}
            membersLoading={membersLoading}
            isOwner={isOwner}
            currentUserId={currentUserId}
            membersPage={membersPage}
            membersPagination={membersPagination}
            setMembersPage={setMembersPage}
            onUpdateRole={updateRole}
            onRemoveMember={removeMember}
          />
        </div>
      )}
    </div>
  );
}
