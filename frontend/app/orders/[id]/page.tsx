import { redirect } from "next/navigation";

export const instant = false;


export default async function OrderIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/orders/${resolvedParams.id}/details`);
}
