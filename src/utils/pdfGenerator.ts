import html2pdf from "html2pdf.js";

/**
 * Offscreen canvas context used to convert any CSS color string (oklch, oklab, color, etc.)
 * into accurate browser-computed rgb(...) or rgba(...) values.
 */
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreenCtx(): CanvasRenderingContext2D | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (!offscreenCtx) {
    offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 1;
    offscreenCanvas.height = 1;
    offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
  }
  return offscreenCtx;
}

/**
 * Converts a single CSS color value (including oklch, oklab, display-p3, etc.)
 * to standard rgb() or rgba() format using browser canvas rendering.
 */
export function cssColorToRgba(colorStr: string): string {
  if (!colorStr || colorStr === "transparent" || colorStr === "inherit" || colorStr === "initial" || colorStr === "none") {
    return colorStr;
  }
  const ctx = getOffscreenCtx();
  if (!ctx) return colorStr;

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const alpha = (a / 255).toFixed(3).replace(/\.?0+$/, "");
    return alpha === "1" ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return colorStr;
  }
}

/**
 * Scans a string (like a box-shadow, border, or inline style value)
 * and replaces any unsupported color functions (oklch, oklab, color, light-dark)
 * with browser-converted rgb()/rgba() values.
 */
export function sanitizeColorString(str: string): string {
  if (!str || typeof str !== "string") return str;
  if (!/oklch|oklab|color|light-dark/i.test(str)) return str;

  return str.replace(/(oklch|oklab|color|light-dark)\([^)]+\)/gi, (match) => {
    return cssColorToRgba(match);
  });
}

/**
 * Sanitizes all computed color properties on an element and its descendants.
 * Applied ONLY to temporary DOM clones created for PDF generation.
 */
export function sanitizeElementColors(originalEl: HTMLElement, cloneEl: HTMLElement): void {
  const origNodes = [originalEl, ...Array.from(originalEl.querySelectorAll<HTMLElement | SVGElement>("*"))];
  const cloneNodes = [cloneEl, ...Array.from(cloneEl.querySelectorAll<HTMLElement | SVGElement>("*"))];

  const colorProperties = [
    "color",
    "background-color",
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
    "box-shadow",
    "text-shadow",
    "fill",
    "stroke",
  ];

  for (let i = 0; i < origNodes.length; i++) {
    const origNode = origNodes[i];
    const cloneNode = cloneNodes[i];
    if (!origNode || !cloneNode) continue;

    const computed = window.getComputedStyle(origNode);

    for (const prop of colorProperties) {
      const val = computed.getPropertyValue(prop);
      if (val && typeof val === "string") {
        if (/oklch|oklab|color|light-dark/i.test(val)) {
          const cleanVal = sanitizeColorString(val);
          cloneNode.style.setProperty(prop, cleanVal, "important");
        } else if (val) {
          // Explicitly set computed RGB style on clone node to override CSS variables/rules
          cloneNode.style.setProperty(prop, val);
        }
      }
    }

    // Sanitize inline style attributes if any contain oklch/oklab
    const inlineStyle = cloneNode.getAttribute("style");
    if (inlineStyle && /oklch|oklab|color|light-dark/i.test(inlineStyle)) {
      cloneNode.setAttribute("style", sanitizeColorString(inlineStyle));
    }
  }
}

/**
 * Sanitizes style elements in cloned documents to remove oklch/oklab declarations.
 */
export function sanitizeDocumentStyles(doc: Document): void {
  const styleTags = Array.from(doc.querySelectorAll("style"));
  for (const styleTag of styleTags) {
    if (styleTag.textContent && /oklch|oklab|color|light-dark/i.test(styleTag.textContent)) {
      styleTag.textContent = sanitizeColorString(styleTag.textContent);
    }
  }
}

/**
 * Generates and triggers direct client-side PDF download for the resume element.
 */
export async function downloadResumePdf(originalElement: HTMLElement, filename = "Pratik-Wakchaure-Resume.pdf"): Promise<void> {
  if (!originalElement) throw new Error("Resume document container element not found.");

  // 1. Create temporary offscreen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "210mm"; // A4 dimensions
  container.style.backgroundColor = "#ffffff";
  container.style.zIndex = "-9999";

  // 2. Clone ONLY the resume DOM tree
  const clone = originalElement.cloneNode(true) as HTMLElement;
  clone.style.width = "100%";
  clone.style.maxWidth = "210mm";
  clone.style.minHeight = "297mm";
  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#111111";

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // 3. Convert all OKLCH/OKLAB/color values into RGB/RGBA on the clone ONLY
    sanitizeElementColors(originalElement, clone);

    // 4. Wait for images and fonts in clone to load
    const images = Array.from(clone.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 5. Configure html2pdf with A4 dimensions and CORS image handling
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc: Document) => {
          sanitizeDocumentStyles(clonedDoc);
        },
      },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    // 6. Generate and save PDF directly
    await html2pdf().set(opt).from(clone).save();
  } finally {
    // 7. Remove temporary container from document body
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
