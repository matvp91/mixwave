import "bun";
import { test, expect, describe, beforeEach, setSystemTime } from "bun:test";
import * as fs from "node:fs";
import {
  parseMasterPlaylist,
  parseMediaPlaylist,
  stringifyMasterPlaylist,
  stringifyMediaPlaylist,
} from "../../src/parser";

async function readPlaylistFixtures(type: "m3u8" | "mjs") {
  const path = `${__dirname}/fixtures/playlists`;
  const files = fs.readdirSync(path).filter((name) => name.endsWith(type));

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

  test.each(await readPlaylistFixtures("m3u8"))(
    "parse playlist(%s)",
    (name, text) => {
      if (name.startsWith("master-")) {
        expect(parseMasterPlaylist(text)).toMatchSnapshot();
      }
      if (name.startsWith("media-")) {
        expect(parseMediaPlaylist(text)).toMatchSnapshot();
      }
    },
  );

  test.each(await readPlaylistFixtures("mjs"))(
    "stringify playlist(%s)",
    (name, text) => {
      const playlist = new Function(text)();
      if (name.startsWith("master-")) {
        expect(stringifyMasterPlaylist(playlist)).toMatchSnapshot();
      }
      if (name.startsWith("media-")) {
        expect(stringifyMediaPlaylist(playlist)).toMatchSnapshot();
      }
    },
  );
});
