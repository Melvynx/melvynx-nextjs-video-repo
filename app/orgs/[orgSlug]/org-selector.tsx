"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";
import { useRouter } from "next/navigation";

export const OrgSelector = () => {
  const router = useRouter();
  const orgs = [
    {
      id: "1901BB5D-A5D1-4963-940B-7DF6B9D90A08",
      slug: "codelynx-llc",
      name: "Codelynx, LLC",
    },
    {
      id: "CF75F783-2E1F-48CA-A0F6-49C4F19AB5A0",
      slug: "patrick-llc",
      name: "Patrick, LLC",
    },
  ];

  const handleOrgChange = (value: string) => {
    // Update active org
  };

  return (
    <Select onValueChange={handleOrgChange} defaultValue={orgs[0].slug}>
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
