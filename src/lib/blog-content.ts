const UNSAFE_BLOCK_RE =
  /<(script|style|iframe|object|embed|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\1>/gi;
const UNSAFE_SELF_CLOSING_RE =
  /<(script|style|iframe|object|embed|form|input|button|textarea|select)\b[^>]*\/?>/gi;
const EVENT_ATTR_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URL_ATTR_RE =
  /\s+(href|src)\s*=\s*(["'])\s*(javascript:|data:text\/html|vbscript:)[\s\S]*?\2/gi;
const H1_OPEN_RE = /<h1(\s[^>]*)?>/gi;
const H1_CLOSE_RE = /<\/h1>/gi;

const DANGEROUS_STYLE_PROPS = [
  /position\s*:\s*(fixed|absolute)/gi,
  /expression\s*\(/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /behavior\s*:/gi,
  /-moz-binding\s*:/gi,
  /@import/gi,
  /@font-face/gi,
  /z-index\s*:\s*\d{4,}/gi,
  /opacity\s*:\s*0(\.0+)?\s*;/gi,
];

function sanitizeInlineStyle(styleValue: string): string {
  let clean = styleValue;
  for (const pattern of DANGEROUS_STYLE_PROPS) {
    clean = clean.replace(pattern, "");
  }
  return clean.trim();
}

export function sanitizeBlogHtml(html?: string | null) {
  let sanitized = (html || "")
    .replace(UNSAFE_BLOCK_RE, "")
    .replace(UNSAFE_SELF_CLOSING_RE, "")
    .replace(EVENT_ATTR_RE, "")
    .replace(DANGEROUS_URL_ATTR_RE, "")
    .replace(H1_OPEN_RE, "<h2>")
    .replace(H1_CLOSE_RE, "</h2>");

  sanitized = sanitized.replace(
    /\s+style\s*=\s*"([^"]*)"/gi,
    (match, styleContent) => {
      const cleaned = sanitizeInlineStyle(styleContent);
      return cleaned ? ` style="${cleaned}"` : "";
    },
  );

  sanitized = sanitized.replace(
    /\s+style\s*=\s*'([^']*)'/gi,
    (match, styleContent) => {
      const cleaned = sanitizeInlineStyle(styleContent);
      return cleaned ? ` style='${cleaned}'` : "";
    },
  );

  return sanitized;
}

export function blogText(html?: string | null) {
  return sanitizeBlogHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
