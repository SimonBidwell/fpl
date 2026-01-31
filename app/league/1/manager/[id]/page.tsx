import { MANAGERS } from "@/src/domain";
import { ManagerPageClient } from "./ManagerPageClient";

export function generateStaticParams() {
  return MANAGERS.map((manager) => ({ id: String(manager.id) }));
}

export default async function ManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManagerPageClient id={id} />;
}
