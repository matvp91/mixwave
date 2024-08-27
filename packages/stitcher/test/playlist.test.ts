import "./env-mock";
import fetchMock from "fetch-mock";
import { formatMasterPlaylist } from "../src/playlist";
import { describe, test, expect } from "@jest/globals";

describe("playlist", () => {
  test("formatMasterPlaylist", async () => {
    fetchMock.mock("https://s3-public.com/package/mock/hls/master.m3u8", {
      status: 200,
      body: `
        #EXTM3U
        #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,NAME="720" 
        720.m3u8
      `,
    });

    const master = await formatMasterPlaylist({
      id: "mock",
      assetId: "mock",
      interstitials: [],
    });

    expect(master).toMatchSnapshot();
  });
});
