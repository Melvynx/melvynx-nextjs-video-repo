"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrganizationInviteMemberForm } from "./org-invite-member-form";
import type { Invitation, Member } from "./page";

type TeamsFormProps = {
  members: Member[];
  invitations: Invitation[];
  maxMembers?: number;
};

export function TeamsForm({
  members,
  invitations,
  maxMembers = 5,
}: TeamsFormProps) {
  const router = useRouter();
  const [localMembers, setLocalMembers] = useState(members);

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      // Placeholder for API call
      console.log("Update role", { memberId, role });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { memberId, role };
    },
    onMutate: ({ memberId, role }) => {
      // Optimistic update
      setLocalMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role } : member
        )
      );
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update role");
      router.refresh();
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      // Placeholder for API call
      console.log("Remove member", memberId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return memberId;
    },
    onMutate: (memberId) => {
      // Optimistic update
      setLocalMembers((prev) =>
        prev.filter((member) => member.id !== memberId)
      );
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to remove member");
      router.refresh();
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Placeholder for API call
      console.log("Cancel invitation", invitationId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return invitationId;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        {localMembers.length < maxMembers ? (
          <OrganizationInviteMemberForm />
        ) : (
          <Button variant="outline" disabled>
            Maximum members reached
          </Button>
        )}
      </CardHeader>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <CardContent>
            {localMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4 py-2">
                <Avatar>
                  <AvatarFallback>
                    {member.user.name.slice(0, 2)}
                  </AvatarFallback>
                  {member.user.image && <AvatarImage src={member.user.image} />}
                </Avatar>

                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-gray-500">
                    {member.user.email}
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) =>
                      updateRoleMutation.mutate({
                        memberId: member.id,
                        role: value,
                      })
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    disabled={removeMemberMutation.isPending}
                  >
                    {removeMemberMutation.isPending ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </TabsContent>

        <TabsContent value="invitations">
          <CardContent>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-4 py-2">
                <Avatar>
                  <AvatarFallback>
                    {invitation.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-medium">{invitation.email}</div>
                  <div className="text-sm text-gray-500">
                    {invitation.status}
                  </div>
                </div>

                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      cancelInvitationMutation.mutate(invitation.id)
                    }
                    disabled={cancelInvitationMutation.isPending}
                  >
                    {cancelInvitationMutation.isPending
                      ? "Cancelling..."
                      : "Cancel"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
