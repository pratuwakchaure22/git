export function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || !colorStr.includes("oklch")) return colorStr;
  try {
    const dummy = document.createElement("div");
    dummy.style.color = colorStr;
    document.body.appendChild(dummy);
    const computed = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);
    return computed && !computed.includes("oklch") ? computed : "#000000";
  } catch {
    return "#000000";
  }
}

export function sanitizeOklchColors(container: HTMLElement) {
  const elements = [container, ...Array.from(container.querySelectorAll("*"))] as HTMLElement[];
  const colorProps = [
    "color",
    "background-color",
    "border-color",
    "border-top-color",
    "border-bottom-color",
    "border-left-color",
    "border-right-color",
    "outline-color",
    "fill",
    "stroke",
  ];

  elements.forEach((el) => {
    try {
      const computed = window.getComputedStyle(el);
      colorProps.forEach((prop) => {
        const val = computed.getPropertyValue(prop);
        if (val && val.includes("oklch")) {
          const rgb = convertOklchToRgb(val);
          el.style.setProperty(prop, rgb, "important");
        }
      });
    } catch {
      // Ignore if disconnected
    }

    const inlineStyle = el.getAttribute("style");
    if (inlineStyle && inlineStyle.includes("oklch")) {
      const cleaned = inlineStyle.replace(/oklch\([^)]+\)/g, (match) => convertOklchToRgb(match));
      el.setAttribute("style", cleaned);
    }
  });
}

export async function generateResumePDF(container: HTMLElement, filename: string) {
  // 1. Wait for all images inside container to finish loading
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          }
        })
    )
  );

  // 2. Pre-sanitize local element before html2canvas capture
  sanitizeOklchColors(container);

  // 3. Dynamically import html2pdf.js
  const html2pdf = (await import("html2pdf.js")).default;

  const opt = {
    margin: [8, 8, 8, 8] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc: HTMLDocument) => {
        const clonedTarget =
          clonedDoc.getElementById("public-resume-wrapper") ||
          clonedDoc.getElementById("resume-preview-wrapper") ||
          clonedDoc.getElementById("resume-document") ||
          clonedDoc.body;
        sanitizeOklchColors(clonedTarget as HTMLElement);
      },
    },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
  };

  await html2pdf().set(opt).from(container).save();
}
