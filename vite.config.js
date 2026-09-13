import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// إعدادات Vite لتطبيق Pack to Pack QMS
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Pack to Pack QMS",
        short_name: "P2P QMS",
        description: "نظام إدارة الجودة لمصنع حقن بلاستيك - عبوات الأغذية",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        id: "/",
        scope: "/",
        orientation: "any",
        prefer_related_applications: false,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "p2p-qms-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    // pdfmake يحتاج استيراد مسارات فرعية (deep imports)؛ بدون هذا السطر
    // قد يظهر تحذير/خطأ من Vite بخصوص "Avoid deep import" عند تصدير PDF.
    include: ["pdfmake/build/pdfmake", "pdfmake/build/vfs_fonts"],
  },
});
