import { expect, test } from "vitest";
import * as fs from "node:fs";
import {
  parseMasterPlaylist,
  parseMediaPlaylist,
} from "../../src/parser/index.js";

function readPlaylistFixtures() {
  const path = `${__dirname}/fixtures/playlists`;
  const files = fs.readdirSync(path);
  return files.map<[string, string]>((file) => [
    file,
    fs.readFileSync(`${path}/${file}`, "utf-8"),
  ]);
}

test.each(readPlaylistFixtures())("playlist(%s)", (name, text) => {
  if (name.startsWith("master-")) {
    expect(parseMasterPlaylist(text)).toMatchSnapshot();
  }
  if (name.startsWith("media-")) {
    expect(parseMediaPlaylist(text)).toMatchSnapshot();
  }
});
