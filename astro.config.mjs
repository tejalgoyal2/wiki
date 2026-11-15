import { defineConfig } from "astro/config"

// Notes are read straight from content/ (see src/lib/wiki.ts), so restart the dev server when one changes.
const reloadOnContent = {
  name: "reload-on-content",
  configureServer(server) {
    server.watcher.add("content")
    server.watcher.on("change", (file) => file.includes("/content/") && server.restart())
  },
}

export default defineConfig({
  site: "https://wiki.tgoyal.me",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  vite: { plugins: [reloadOnContent] },
})
