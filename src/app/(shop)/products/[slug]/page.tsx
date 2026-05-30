import { permanentRedirect } from "next/navigation";

interface ProductLegacyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductLegacyPage({
  params,
}: ProductLegacyPageProps) {
  const { slug } = await params;
  permanentRedirect(`/san-pham/${slug}`);
}
