import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".jsx", ".js"],
  },
  esbuild: {
    charset: "utf8",
    include: /\.[jt]sx?$/,
  },
});
