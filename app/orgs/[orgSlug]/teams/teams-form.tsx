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
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      const result = await authClient.organization.updateMemberRole({
        memberId: memberId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: role as any,
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },

    onSuccess: () => {
      toast.success("Role updated successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const result = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },

    onSuccess: () => {
      toast.success("Member removed successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        {members.length < maxMembers ? (
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
            {members.map((member) => (
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
                  {member.role === "owner" ? null : (
                    <>
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
                        {removeMemberMutation.isPending
                          ? "Removing..."
                          : "Remove"}
                      </Button>
                    </>
                  )}
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
