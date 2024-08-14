import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/mixwave/",
  title: "Mixwave",
  description: "A friendly API to simplify the complexities of video delivery.",
  appearance: "force-dark",
  themeConfig: {
    nav: [],
    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "What is Mixwave?", link: "what-is-mixwave" },
          { text: "Getting Started", link: "getting-started" },
        ],
      },
      {
        text: "Self-hosting",
        collapsed: false,
        items: [{ text: "Installation", link: "installation" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/matvp91/mixwave" },
    ],
  },
});
