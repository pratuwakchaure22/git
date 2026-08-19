import { useEffect } from "react";

const SITE_NAME = "Alex Morgan";

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title === "Home" ? `${SITE_NAME} — ${title}` : `${title} — ${SITE_NAME}`;

    let metaDescription: HTMLMetaElement | null = null;
    let previousDescription: string | null = null;

    if (description) {
      metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        previousDescription = metaDescription.getAttribute("content");
        metaDescription.setAttribute("content", description);
      }
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription !== null) {
        metaDescription.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
