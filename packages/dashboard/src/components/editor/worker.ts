import * as monaco from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    throw new Error("No worker found.");
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
