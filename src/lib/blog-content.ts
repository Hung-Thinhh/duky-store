const UNSAFE_BLOCK_RE =
  /<(script|style|iframe|object|embed|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\1>/gi;
const UNSAFE_SELF_CLOSING_RE =
  /<(script|style|iframe|object|embed|form|input|button|textarea|select)\b[^>]*\/?>/gi;
const EVENT_ATTR_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URL_ATTR_RE =
  /\s+(href|src)\s*=\s*(["'])\s*(javascript:|data:text\/html|vbscript:)[\s\S]*?\2/gi;
const INLINE_STYLE_RE = /\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const H1_OPEN_RE = /<h1(\s[^>]*)?>/gi;
const H1_CLOSE_RE = /<\/h1>/gi;

export function convertImagesToLazyload(html: string): string {
  return html.replace(/<img\b([^>]*?)>/gi, (imgTag) => {
    let processedTag = imgTag;

    // Convert src to data-src
    if (processedTag.includes(" src=") && !processedTag.includes(" data-src=")) {
      processedTag = processedTag.replace(/\bsrc=(["'])(.*?)\1/gi, "data-src=$1$2$1");
    }

    // Add or append lazyload class
    if (processedTag.includes(" class=")) {
      processedTag = processedTag.replace(/\bclass=(["'])(.*?)\1/gi, "class=$1$2 lazyload$1");
    } else {
      processedTag = processedTag.replace(/<img\b/gi, '<img class="lazyload"');
    }

    return processedTag;
  });
}

export function sanitizeBlogHtml(html?: string | null) {
  const sanitized = (html || "")
    .replace(UNSAFE_BLOCK_RE, "")
    .replace(UNSAFE_SELF_CLOSING_RE, "")
    .replace(EVENT_ATTR_RE, "")
    .replace(DANGEROUS_URL_ATTR_RE, "")
    .replace(INLINE_STYLE_RE, "")
    .replace(H1_OPEN_RE, "<h2>")
    .replace(H1_CLOSE_RE, "</h2>");

  return convertImagesToLazyload(sanitized);
}

export function blogText(html?: string | null) {
  return sanitizeBlogHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
