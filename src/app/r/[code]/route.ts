import { NextRequest, NextResponse } from "next/server";
import { initialQRCampaigns } from "@/lib/seed-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Find target campaign or fallback to general Falcon WhatsApp
  const target = initialQRCampaigns.find(
    (c) => c.tracking_code.toLowerCase() === code.toLowerCase() || c.redirect_slug === code
  );

  const phone = process.env.NEXT_PUBLIC_FALCON_WHATSAPP_PHONE || "201001112233";
  let destination = target?.destination_url;

  if (!destination) {
    const text = encodeURIComponent(
      `Hello Falcon CNC, I scanned the exhibition QR code [${code}]. Please connect with me.`
    );
    destination = `https://wa.me/${phone}?text=${text}`;
  }

  return NextResponse.redirect(destination, 307);
}
