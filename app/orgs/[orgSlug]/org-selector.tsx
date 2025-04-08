"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { Building } from "lucide-react";

export const OrgSelector = (props: { currentOrgSlug: string }) => {
  const data = authClient.useListOrganizations();

  const setActiveOrganizationMutation = useMutation({
    mutationFn: async (orgSlug: string) => {
      const result = await authClient.organization.setActive({
        organizationSlug: orgSlug,
      });
      window.location.pathname = `/orgs/${result.data?.slug}`;
    },
  });

  const orgs = data.data;

  if (!orgs) return <p>Loading...</p>;

  return (
    <Select
      onValueChange={(orgSlug) => {
        setActiveOrganizationMutation.mutate(orgSlug);
      }}
      defaultValue={props.currentOrgSlug}
    >
      <SelectTrigger>
        <Building className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.slug}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
