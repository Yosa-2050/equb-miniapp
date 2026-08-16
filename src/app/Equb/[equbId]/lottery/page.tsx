import LotteryPage from "./lottery-page";

export default async function LotteryRoute({
  params,
}: {
  params: Promise<{ equbId: string }>;
}) {
  const { equbId } = await params;
  return <LotteryPage equbId={equbId} />;
}