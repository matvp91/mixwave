import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/mixwave/",
  title: "Mixwave",
  description: "A friendly API to simplify the complexities of video delivery.",
  appearance: "force-dark",
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
      {
        text: "Examples",
        collapsed: false,
        items: [
          { text: "Transcode", link: "examples/transcode" },
          {
            text: "Package",
            link: "examples/package",
          },
          {
            text: "Stitcher",
            link: "examples/stitcher",
          },
        ],
      },
      { text: "Thank You", link: "thank-you" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/matvp91/mixwave" },
    ],
  },
});
