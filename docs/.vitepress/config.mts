import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/mixwave/",
  title: "Mixwave",
  description:
    "All-in-one toolkit handles everything from video source to player.",
  lang: "en-US",
  head: [
    [
      "script",
      {},
      `
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonProperties".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('phc_pNLByqSP4cjmxC6BcLttR3rpa4jbOpJlOmQeV9EzwBR',{api_host:'https://eu.i.posthog.com', person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
        })
      `,
    ],
  ],
  themeConfig: {
    search: {
      provider: "local",
    },
    sidebar: [
      { text: "Introduction", link: "introduction" },
      { text: "Getting Started", link: "getting-started" },
      {
        text: "Features",
        items: [
          {
            text: "Transcode",
            link: "features/transcode",
          },
          {
            text: "Package",
            link: "features/package",
          },
          {
            text: "Stitcher",
            link: "features/stitcher",
          },
        ],
      },
      {
        text: "Frontend",
        items: [
          {
            text: "Player",
            link: "frontend/player",
          },
          {
            text: "Dashboard",
            link: "frontend/dashboard",
          },
        ],
      },
      {
        text: "Miscellaneous",
        items: [
          { text: "Contribute", link: "misc/contribute" },
          { text: "Tips", link: "misc/tips" },
          { text: "Credits", link: "misc/credits" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/matvp91/mixwave" },
    ],
    footer: {
      message: "Released under the MPL-2.0 License.",
      copyright: "Copyright © 2024-present Matthias Van Parijs",
    },
    outline: {
      level: [1, 3],
    },
  },
  vite: {
    clearScreen: false,
  },
});
