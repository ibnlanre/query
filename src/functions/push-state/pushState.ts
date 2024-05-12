export function pushState(href: string) {
  const data = { ...self.history.state, as: href, url: href };
  self.history.replaceState(data, "", href);
}
