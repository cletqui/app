export function navigate(path: string) {
  window.history.pushState({}, "", path);
  // Dispatch so App's popstate listener fires
  window.dispatchEvent(new PopStateEvent("popstate"));
}
