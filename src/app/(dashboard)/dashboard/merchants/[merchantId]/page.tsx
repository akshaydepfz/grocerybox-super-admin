import { MerchantDetail } from "@/components/merchants/MerchantDetail";

type MerchantDetailPageProps = {
  params: Promise<{ merchantId: string }>;
};

export default async function MerchantDetailPage({ params }: MerchantDetailPageProps) {
  const { merchantId } = await params;
  return <MerchantDetail merchantId={merchantId} />;
}