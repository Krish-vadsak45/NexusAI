"use client";

import { MoreVertical, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/InlineLoader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProjectMember } from "@/lib/shared-types";

export function ProjectMembersTab(props: {
  members: ProjectMember[];
  membersLoading: boolean;
  isOwner: boolean;
  currentUserId: string | null;
  membersPage: number;
  membersPagination: { total: number; totalPages: number; limit: number };
  setMembersPage: (value: number | ((prev: number) => number)) => void;
  onUpdateRole: (memberUserId: string, newRole: string) => void;
  onRemoveMember: (memberUserId: string) => void;
}) {
  if (props.membersLoading) {
    return (
      <div className="p-6">
        <InlineLoader />
      </div>
    );
  }

  if (props.members.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No members on this project.</p>
      </div>
    );
  }

  if (props.isOwner) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y">
          <thead className="bg-muted-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Invite status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Invited by</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y">
            {props.members.map((member) => (
              <tr key={member.userId || `${member.email}-${member.role}`}>
                <td className="px-4 py-3 text-sm">{member.userName}</td>
                <td className="px-4 py-3 text-sm capitalize">{member.role}</td>
                <td className="px-4 py-3 text-sm">{member.userEmail}</td>
                <td className="px-4 py-3 text-sm">{member.inviteStatus || "-"}</td>
                <td className="px-4 py-3 text-sm">{member.invitedBy || "-"}</td>
                <td className="px-4 py-3 text-sm text-right">
                  {member.userId !== props.currentUserId && (
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
                          {(["owner", "editor", "viewer"] as const).map((role) => (
                            <Button
                              key={role}
                              variant={member.role === role ? "secondary" : "ghost"}
                              size="sm"
                              className="justify-start font-normal capitalize"
                              onClick={() => props.onUpdateRole(member.userId, role)}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              {role}
                            </Button>
                          ))}
                          <div className="h-px bg-muted my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => props.onRemoveMember(member.userId)}
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
        {props.membersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground italic">
              Showing {props.members.length} of {props.membersPagination.total} members
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => props.setMembersPage((p) => Math.max(1, p - 1))}
                disabled={props.membersPage === 1 || props.membersLoading}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {props.membersPage} of {props.membersPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  props.setMembersPage((p) =>
                    Math.min(props.membersPagination.totalPages, p + 1),
                  )
                }
                disabled={
                  props.membersPage === props.membersPagination.totalPages ||
                  props.membersLoading
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {props.members.map((member) => (
          <li
            key={member.userId || `${member.email}-${member.role}`}
            className="flex items-center justify-between p-3 border rounded shadow-sm bg-background"
          >
            <div>
              <div className="font-medium">{member.userName || member.userEmail}</div>
              <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
            </div>
            <div className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
              {member.inviteStatus || "active"}
            </div>
          </li>
        ))}
      </ul>
      {props.membersPagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.setMembersPage((p) => Math.max(1, p - 1))}
            disabled={props.membersPage === 1 || props.membersLoading}
          >
            Previous
          </Button>
          <span className="text-sm">
            {props.membersPage} / {props.membersPagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              props.setMembersPage((p) =>
                Math.min(props.membersPagination.totalPages, p + 1),
              )
            }
            disabled={
              props.membersPage === props.membersPagination.totalPages ||
              props.membersLoading
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
