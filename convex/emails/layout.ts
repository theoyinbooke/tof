// ─── Email Layout & Shared Components ───
// All emails use this master layout: dark header with logo + network SVG,
// green gradient divider, white content area, dark footer.

const BASE_URL = process.env.SITE_URL || "https://theoyinbookefoundation.com";
const LOGO_URL = `${BASE_URL}/logo-white.png`;

// ─── Shared building blocks ───

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#171717;line-height:1.3">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#525252">${text}</p>`;
}

export function button(
  text: string,
  url: string,
  color: string = "#00D632",
): string {
  const textColor = color === "#00D632" ? "#000000" : "#ffffff";
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
      <tr>
        <td align="center" style="border-radius:8px;background:${color}">
          <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:${textColor};text-decoration:none;border-radius:8px">${text}</a>
        </td>
      </tr>
    </table>`;
}

export function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#737373;width:140px;vertical-align:top">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:#171717;font-weight:500">${value}</td>
    </tr>`;
}

export function infoTable(rows: Array<{ label: string; value: string }>): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0 24px;border-collapse:collapse">
      ${rows.map((r) => infoRow(r.label, r.value)).join("")}
    </table>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />`;
}

export function statusBadge(
  text: string,
  color: string = "#00D632",
): string {
  return `<span style="display:inline-block;padding:4px 12px;font-size:12px;font-weight:600;color:${color === "#00D632" ? "#065F13" : "#fff"};background:${color}20;border:1px solid ${color}40;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">${text}</span>`;
}

// ─── Network SVG (static, email-safe) ───

function networkSVG(): string {
  return `
    <div style="margin:20px auto 0;width:200px;height:120px">
      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
        <!-- Grid dots -->
        <circle cx="30" cy="20" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="70" cy="20" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="110" cy="20" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="150" cy="20" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="30" cy="60" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="150" cy="60" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="30" cy="100" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="70" cy="100" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="110" cy="100" r="1" fill="white" fill-opacity="0.08"/>
        <circle cx="150" cy="100" r="1" fill="white" fill-opacity="0.08"/>

        <!-- Connection lines -->
        <line x1="100" y1="60" x2="50" y2="30" stroke="#00D632" stroke-opacity="0.2" stroke-width="0.8"/>
        <line x1="100" y1="60" x2="150" y2="30" stroke="#00D632" stroke-opacity="0.15" stroke-width="0.8"/>
        <line x1="100" y1="60" x2="165" y2="70" stroke="#00D632" stroke-opacity="0.18" stroke-width="0.8"/>
        <line x1="100" y1="60" x2="140" y2="100" stroke="#00D632" stroke-opacity="0.15" stroke-width="0.8"/>
        <line x1="100" y1="60" x2="55" y2="95" stroke="#00D632" stroke-opacity="0.2" stroke-width="0.8"/>
        <line x1="100" y1="60" x2="35" y2="65" stroke="#00D632" stroke-opacity="0.15" stroke-width="0.8"/>

        <!-- Cross-connections -->
        <line x1="50" y1="30" x2="150" y2="30" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>
        <line x1="150" y1="30" x2="165" y2="70" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>
        <line x1="165" y1="70" x2="140" y2="100" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>
        <line x1="140" y1="100" x2="55" y2="95" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>
        <line x1="55" y1="95" x2="35" y2="65" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>
        <line x1="35" y1="65" x2="50" y2="30" stroke="white" stroke-opacity="0.06" stroke-width="0.5"/>

        <!-- Outer ring -->
        <circle cx="100" cy="60" r="50" stroke="white" stroke-opacity="0.04" stroke-width="0.5" fill="none"/>

        <!-- Central glow -->
        <circle cx="100" cy="60" r="30" fill="#00D632" fill-opacity="0.06"/>
        <circle cx="100" cy="60" r="18" fill="#00D632" fill-opacity="0.08"/>

        <!-- Central node -->
        <circle cx="100" cy="60" r="10" fill="#0A0A0A" stroke="#00D632" stroke-width="1.5"/>
        <circle cx="100" cy="60" r="3.5" fill="#00D632" fill-opacity="0.9"/>

        <!-- Outer nodes: green accent -->
        <circle cx="50" cy="30" r="6" fill="#0A0A0A" stroke="#00D632" stroke-width="0.8" stroke-opacity="0.6"/>
        <circle cx="50" cy="30" r="2" fill="#00D632" fill-opacity="0.7"/>

        <circle cx="55" cy="95" r="7" fill="#0A0A0A" stroke="#00D632" stroke-width="0.8" stroke-opacity="0.5"/>
        <circle cx="55" cy="95" r="2.5" fill="#00D632" fill-opacity="0.6"/>

        <circle cx="165" cy="70" r="5.5" fill="#0A0A0A" stroke="#00D632" stroke-width="0.8" stroke-opacity="0.5"/>
        <circle cx="165" cy="70" r="2" fill="#00D632" fill-opacity="0.6"/>

        <!-- Outer nodes: white -->
        <circle cx="150" cy="30" r="5" fill="#0A0A0A" stroke="white" stroke-width="0.6" stroke-opacity="0.25"/>
        <circle cx="150" cy="30" r="1.5" fill="white" fill-opacity="0.35"/>

        <circle cx="140" cy="100" r="4.5" fill="#0A0A0A" stroke="white" stroke-width="0.6" stroke-opacity="0.2"/>
        <circle cx="140" cy="100" r="1.5" fill="white" fill-opacity="0.3"/>

        <circle cx="35" cy="65" r="5" fill="#0A0A0A" stroke="white" stroke-width="0.6" stroke-opacity="0.25"/>
        <circle cx="35" cy="65" r="1.5" fill="white" fill-opacity="0.35"/>

        <!-- Pulse ring (static representation) -->
        <circle cx="100" cy="60" r="40" fill="none" stroke="#00D632" stroke-width="0.5" stroke-opacity="0.1"/>
      </svg>
    </div>`;
}

// ─── Master Layout ───

export function emailLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>TheOyinbooke Foundation</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
    ${previewText}
    ${"&zwnj;&nbsp;".repeat(30)}
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5">
    <tr>
      <td align="center" style="padding:40px 16px">

        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

          <!-- ═══ DARK HEADER ═══ -->
          <tr>
            <td style="background-color:#0A0A0A;padding:32px 40px 0;text-align:center">
              <!-- Logo -->
              <img src="${LOGO_URL}" alt="TheOyinbooke Foundation" width="180" height="auto" style="display:block;margin:0 auto;max-width:180px;height:auto" />

              <!-- Network SVG -->
              ${networkSVG()}
            </td>
          </tr>

          <!-- ═══ GREEN GRADIENT DIVIDER ═══ -->
          <tr>
            <td style="background:linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 30%, #f4f4f5 30%, #f4f4f5 100%);padding:0;height:20px">
              <div style="margin:0 40px;height:3px;background:linear-gradient(90deg, #00D632 0%, #00B82B 40%, #009924 70%, transparent 100%);border-radius:2px"></div>
            </td>
          </tr>

          <!-- ═══ CONTENT AREA ═══ -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px 40px">
              ${content}
            </td>
          </tr>

          <!-- ═══ DARK FOOTER ═══ -->
          <tr>
            <td style="background-color:#0A0A0A;padding:28px 40px;text-align:center">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#ffffff;letter-spacing:0.3px">
                TheOyinbooke Foundation
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.5">
                Empowering futures through education.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25)">
                <a href="${BASE_URL}" style="color:rgba(255,255,255,0.35);text-decoration:none">theoyinbookefoundation.com</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
