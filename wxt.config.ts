import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

export default defineConfig({
  manifest: {
    name: "twitter-utils",
    version: "1.0.0",
    permissions: ["storage", "scripting"],
    host_permissions: ["<all_urls>"],
  },
  vite: () => ({
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    define: {
      global: "window",
    },
  }),
});
