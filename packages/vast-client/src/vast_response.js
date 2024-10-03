export function createVASTResponse({ ads, errorURLTemplates, version }) {
  return {
    ads: ads || [],
    errorURLTemplates: errorURLTemplates || [],
    version: version || null,
  };
}
