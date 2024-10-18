import { swagger as elysiaSwagger } from "@elysiajs/swagger";

const CUSTOM_SCALAR_CSS = `
  .scalar-container.z-overlay {
    padding-left: 16px;
    padding-right: 16px;
  }

  .scalar-api-client__send-request-button, .show-api-client-button {
    background: var(--scalar-button-1);
  }
`;

export const swagger = elysiaSwagger({
  documentation: {
    info: {
      title: "Mixwave API",
      description:
        "The Mixwave API is organized around REST, returns JSON-encoded responses " +
        "and uses standard HTTP response codes and verbs.",
      version: "1.0.0",
    },
  },
  scalarConfig: {
    hideDownloadButton: true,
    customCss: CUSTOM_SCALAR_CSS,
  },
});

const scalarScript = `
  <script>
    const searchParams = new URLSearchParams(window.location.search);
    const theme = searchParams.get("theme");
    const isDark = localStorage.getItem("isDark") === "true";

    if (theme === "dark" && !isDark) {
      localStorage.setItem("isDark", "true");
      location.reload();
    } else if (theme !== "dark" && isDark) {
      localStorage.setItem("isDark", "false");
      location.reload();
    }
  </script>
`;

export async function onAfterHandle({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) {
  const url = new URL(request.url);

  if (url.pathname.endsWith("/swagger")) {
    const text = await response.text();
    const lines = text.split("\n");
    lines.splice(
      lines.findIndex((line) => line.trim() === "<body>"),
      0,
      scalarScript,
    );
    return new Response(lines.join(""), {
      headers: {
        "content-type": "text/html; charset=utf8",
      },
    });
  }

  return response;
}
