import styleDark from "react-syntax-highlighter/dist/esm/styles/hljs/stackoverflow-dark";

styleDark["hljs"].padding = "1rem";
delete styleDark["hljs"].background;

import styleLight from "react-syntax-highlighter/dist/esm/styles/hljs/stackoverflow-light";

styleLight["hljs"].padding = "1rem";
delete styleLight["hljs"].background;

export { styleLight, styleDark };
