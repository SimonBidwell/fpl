import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/fpl",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        //include 404 file for gh-pages SPA workaround
        "404": "404.html",
      },
    },
  },
});
