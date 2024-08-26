export function createExtension() {
  return {
    name: null,
    value: null,
    attributes: {},
    children: [],
  };
}

export function isEmptyExtension(extension) {
  return (
    extension.value === null &&
    Object.keys(extension.attributes).length === 0 &&
    extension.children.length === 0
  );
}
