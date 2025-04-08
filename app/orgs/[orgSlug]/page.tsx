export default async function RoutePage(props: {
  params: Promise<{ orgSlug: string }>;
}) {
  const params = await props.params;
  return <div>Org {params.orgSlug}</div>;
}
