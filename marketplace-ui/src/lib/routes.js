export function homePath() {
  return "/";
}

export function searchPath(query) {
  return query ? `/search?q=${encodeURIComponent(query)}` : "/search";
}

export function pluginPath(pluginName) {
  return `/plugins/${encodeURIComponent(pluginName)}`;
}

export function artifactPath(pluginName, kind, name) {
  return `/plugins/${encodeURIComponent(pluginName)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}`;
}

export function entryPath(entry) {
  return entry.type === "plugin"
    ? pluginPath(entry.plugin)
    : artifactPath(entry.plugin, entry.type, entry.name);
}

export function whatsNewPath() {
  return "/whats-new";
}

export function gettingStartedPath() {
  return "/getting-started";
}
