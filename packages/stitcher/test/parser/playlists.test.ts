import "bun";
import { test, expect, describe, beforeEach, setSystemTime } from "bun:test";
import * as fs from "node:fs";
import { parseMasterPlaylist, parseMediaPlaylist } from "../../src/parser";

async function readPlaylistFixtures() {
  const path = `${__dirname}/fixtures/playlists`;
  const files = fs.readdirSync(path);

  return Promise.all(
    files.map(async (file) => {
      return [file, await Bun.file(`${path}/${file}`).text()];
    }),
  );
}

describe("playlists", async () => {
  beforeEach(() => {
    // The day my son was born!
    setSystemTime(new Date(2021, 4, 2, 10, 12, 5, 250));
  });

  test.each(await readPlaylistFixtures())("playlist(%s)", (name, text) => {
    if (name.startsWith("master-")) {
      expect(parseMasterPlaylist(text)).toMatchSnapshot();
    }
    if (name.startsWith("media-")) {
      expect(parseMediaPlaylist(text)).toMatchSnapshot();
    }
  });
});
