import { useQuery } from "@tanstack/react-query";

export interface User { id: string; orgId: string; name: string; }
export interface Organization { id: string; name: string; plan: string; }
export interface OrgMembers { members: { id: string; name: string }[] }

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function fetchOrganization(orgId: string): Promise<Organization> {
  const res = await fetch(`/api/organizations/${orgId}`);
  if (!res.ok) throw new Error("Organization not found");
  return res.json();
}

export async function fetchOrgMembers(orgId: string): Promise<OrgMembers> {
  const res = await fetch(`/api/organizations/${orgId}/members`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

// Pattern 1: Sequential — each query waits for the previous
export function useUserOrgChain() {
  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
  });

  const orgId = userQuery.data?.orgId;

  const orgQuery = useQuery({
    queryKey: ["orgs", orgId],
    queryFn: () => fetchOrganization(orgId!),
    enabled: !!orgId, // only runs when orgId is available
  });

  return { userQuery, orgQuery };
}

// Pattern 2: Fan-out — one query triggers multiple parallel dependent queries
export function useOrgData(orgId: string | undefined) {
  const orgQuery = useQuery({
    queryKey: ["orgs", orgId],
    queryFn: () => fetchOrganization(orgId!),
    enabled: !!orgId,
  });

  const membersQuery = useQuery({
    queryKey: ["orgs", orgId, "members"],
    queryFn: () => fetchOrgMembers(orgId!),
    enabled: !!orgId,
  });

  return {
    org: orgQuery.data,
    members: membersQuery.data?.members ?? [],
    isLoading: orgQuery.isLoading || membersQuery.isLoading,
    isError: orgQuery.isError || membersQuery.isError,
  };
}

// Component combining both patterns
export function OrganizationPage() {
  const { userQuery } = useUserOrgChain();
  const { org, members, isLoading } = useOrgData(userQuery.data?.orgId);

  if (userQuery.isLoading || isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{org?.name}</h1>
      <p>Plan: {org?.plan}</p>
      <ul>{members.map((m) => <li key={m.id}>{m.name}</li>)}</ul>
    </div>
  );
}
