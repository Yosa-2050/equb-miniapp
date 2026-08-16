import { EqubDetailPage } from "../equb-detail-page";

export default async function EqubDetailRoute({
  params,
}: {
  params: Promise<{ equbId: string }>;
}) {
  const { equbId } = await params;
  return <EqubDetailPage equbId={equbId} />;
}