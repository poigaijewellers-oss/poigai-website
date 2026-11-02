import { useEffect } from "react";

// Stops the casual ways of saving product photos: the right-click / long-press menu
// ("Save image", "Open image in new tab", "Copy image") and dragging an image out of the page.
// Screenshots can't be blocked by any website, so this is a deterrent, not a lock.
export function useImageProtection() {
  useEffect(() => {
    const blockOnImages = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "IMG") event.preventDefault();
    };
    document.addEventListener("contextmenu", blockOnImages);
    document.addEventListener("dragstart", blockOnImages);
    return () => {
      document.removeEventListener("contextmenu", blockOnImages);
      document.removeEventListener("dragstart", blockOnImages);
    };
  }, []);
}
