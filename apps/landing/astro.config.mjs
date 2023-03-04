import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import prefetch from "@astrojs/prefetch";
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [tailwind(), prefetch(), react()]
});