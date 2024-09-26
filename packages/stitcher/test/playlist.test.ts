import "./mocks/mock-env";
import fetchMock from "fetch-mock";
import { formatMasterPlaylist, formatMediaPlaylist } from "../src/playlist";
import { jest, describe, test, expect, afterEach } from "@jest/globals";

describe("playlist", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  test("should fetch and format master playlist", async () => {
    fetchMock.mock("https://s3-public.com/package/assetId/hls/master.m3u8", {
      status: 200,
      body: `
        #EXTM3U
        #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,NAME="720" 
        720.m3u8
      `,
    });

    const master = await formatMasterPlaylist({
      id: "sessionId",
      assetId: "assetId",
      interstitials: [],
    });

    expect(master).toMatchInlineSnapshot(`
      "#EXTM3U
      #EXT-X-DEFINE:NAME="mix-session-id",VALUE="sessionId"
      #EXT-X-DEFINE:NAME="mix-base",VALUE="https://s3-public.com/package/assetId/hls"
      #EXT-X-STREAM-INF:BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,PROGRAM-ID=1
      720.m3u8"
    `);
  });

  test("should fetch and format media playlist", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-02-21T17:35:00Z"));

    fetchMock.mock(
      "https://s3-public.com/package/assetId/hls/video_1080/playlist.m3u8",
      {
        status: 200,
        body: `
          #EXTM3U
          #EXT-X-VERSION:3
          #EXT-X-PLAYLIST-TYPE:VOD
          #EXT-X-TARGETDURATION:11
          #EXTINF:10.000,
          url_462/seg.ts
          #EXTINF:10.000,
          url_463/seg.ts
          #EXTINF:10.000,
          url_464/seg.ts
          #EXTINF:10.000,
          url_465/seg.ts
          #EXTINF:10.000,
          url_466/seg.ts
          #EXTINF:10.000,
          url_467/seg.ts
        `,
      },
    );

    const media = await formatMediaPlaylist(
      {
        id: "sessionId",
        assetId: "assetId",
        interstitials: [],
      },
      "video_1080",
    );

    expect(media).toMatchInlineSnapshot(`
      "#EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-DEFINE:IMPORT="mix-base"
      #EXT-X-DEFINE:NAME="mix-pbase",VALUE="{$mix-base}/video_1080"
      #EXT-X-TARGETDURATION:11
      #EXT-X-PLAYLIST-TYPE:VOD
      #EXTINF:10,
      {$mix-pbase}/url_462/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_463/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_464/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_465/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_466/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_467/seg.ts"
    `);
  });

  test("media playlist inserts interstitials", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-02-21T17:35:00Z"));

    fetchMock.mock(
      "https://s3-public.com/package/assetId/hls/video_1080/playlist.m3u8",
      {
        status: 200,
        body: `
          #EXTM3U
          #EXT-X-VERSION:3
          #EXT-X-PLAYLIST-TYPE:VOD
          #EXT-X-TARGETDURATION:11
          #EXTINF:10.000,
          url_462/seg.ts
          #EXTINF:10.000,
          url_463/seg.ts
          #EXTINF:10.000,
          url_464/seg.ts
          #EXTINF:10.000,
          url_465/seg.ts
          #EXTINF:10.000,
          url_466/seg.ts
          #EXTINF:10.000,
          url_467/seg.ts
        `,
      },
    );

    const media = await formatMediaPlaylist(
      {
        id: "sessionId",
        assetId: "assetId",
        interstitials: [
          {
            timeOffset: 0,
            assetId: "ad1",
          },
          {
            timeOffset: 0,
            assetId: "ad2",
          },
          {
            timeOffset: 10,
            assetId: "ad3",
          },
        ],
      },
      "video_1080",
    );

    expect(media).toMatchInlineSnapshot(`
      "#EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-DEFINE:IMPORT="mix-base"
      #EXT-X-DEFINE:NAME="mix-pbase",VALUE="{$mix-base}/video_1080"
      #EXT-X-TARGETDURATION:11
      #EXT-X-PLAYLIST-TYPE:VOD
      #EXT-X-PROGRAM-DATE-TIME:2022-02-21T17:35:00.000Z
      #EXTINF:10,
      {$mix-pbase}/url_462/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_463/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_464/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_465/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_466/seg.ts
      #EXTINF:10,
      {$mix-pbase}/url_467/seg.ts
      #EXT-X-DATERANGE:ID="0",CLASS="com.apple.hls.interstitial",START-DATE="2022-02-21T17:35:00.000Z",X-ASSET-LIST="/session/sessionId/asset-list.json?timeOffset=0",X-RESUME-OFFSET=0,X-RESTRICT="SKIP,JUMP",X-MIX-TYPES=""
      #EXT-X-DATERANGE:ID="10",CLASS="com.apple.hls.interstitial",START-DATE="2022-02-21T17:35:10.000Z",X-ASSET-LIST="/session/sessionId/asset-list.json?timeOffset=10",X-RESUME-OFFSET=0,X-RESTRICT="SKIP,JUMP",X-MIX-TYPES="""
    `);
  });

  test("should remove resolutions below resolution", async () => {
    fetchMock.mock("https://s3-public.com/package/assetId/hls/master.m3u8", {
      status: 200,
      body: `
        #EXTM3U
        #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=100x720,NAME="720" 
        720.m3u8
        #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=100x480,NAME="480" 
        480.m3u8
        #EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=100x360,NAME="360" 
        360.m3u8
      `,
    });

    const master = await formatMasterPlaylist({
      id: "sessionId",
      assetId: "assetId",
      interstitials: [],
      resolution: "> 480",
    });

    expect(master).toMatchInlineSnapshot(`
      "#EXTM3U
      #EXT-X-DEFINE:NAME="mix-session-id",VALUE="sessionId"
      #EXT-X-DEFINE:NAME="mix-base",VALUE="https://s3-public.com/package/assetId/hls"
      #EXT-X-STREAM-INF:BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=100x720,PROGRAM-ID=1
      720.m3u8"
    `);
  });
});
