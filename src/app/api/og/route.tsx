import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPublishedInvitation } from "@/lib/services/invitations";
import { getTemplate } from "@/templates/registry";
import { formatWeddingDate } from "@/lib/utils/date";

export const runtime = "nodejs";

/** Aperçu partagé sur WhatsApp : un carton gravé, pas une capture. */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const invitation = slug ? await getPublishedInvitation(slug) : null;

  const template = getTemplate(invitation?.template_id);
  const names = invitation
    ? `${invitation.bride_name} & ${invitation.groom_name}`
    : "Zevent";
  const date = invitation ? formatWeddingDate(invitation.wedding_date) : "";
  const venue = invitation?.venue ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: template.colors.background,
          color: template.colors.ink,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 300,
            width: 600,
            height: 550,
            border: `1px solid ${template.colors.accent}`,
            borderRadius: "300px 300px 4px 4px",
          }}
        />
        <div
          style={{
            fontSize: 22,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: template.colors.inkSoft,
          }}
        >
          Ils se marient
        </div>
        <div style={{ fontSize: 86, marginTop: 40, textAlign: "center", maxWidth: 900 }}>
          {names}
        </div>
        <div style={{ width: 64, height: 1, background: template.colors.accent, margin: "44px 0" }} />
        <div style={{ fontSize: 26, letterSpacing: 6, color: template.colors.inkSoft }}>{date}</div>
        {venue && (
          <div style={{ fontSize: 20, letterSpacing: 4, marginTop: 14, color: template.colors.inkSoft }}>
            {venue}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
