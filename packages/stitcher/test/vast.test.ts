import "./mocks/mock-env";
import fetchMock from "fetch-mock";
import { extractInterstitialFromVmapAdbreak } from "../src/vast";
import { describe, test, expect, afterEach } from "@jest/globals";
import { addTranscodeJob } from "./mocks/import-artisan-producer";

describe("vmap", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  test("should extract interstitials from vmap adBreak", async () => {
    fetchMock.mock("https://vast", {
      status: 200,
      body: `
        <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
          <Ad id="mockAd">
            <InLine>
              <Creatives>
                <Creative id="mockCreative" AdID="mockAd" sequence="1">
                  <Linear>
                    <Duration>00:00:05</Duration>
                    <MediaFiles>
                      <MediaFile id="mockMediaFile" delivery="progressive" width="640" height="360" type="video/mp4" bitrate="148" scalable="true" maintainAspectRatio="true">
                        <![CDATA[ https://ad ]]>
                      </MediaFile>
                    </MediaFiles>
                  </Linear>
                </Creative>
              </Creatives>
            </InLine>
          </Ad>
        </VAST>
      `,
    });

    const adUuid = "212880b4-bc28-5194-a9a8-81203c6203f4";
    fetchMock.mock(`https://s3-public.com/package/${adUuid}/hls/master.m3u8`, {
      status: 200,
    });

    const interstitials = await extractInterstitialFromVmapAdbreak({
      timeOffset: 0,
      vastUrl: "https://vast",
    });

    expect(interstitials).toMatchInlineSnapshot(`
      [
        {
          "assetId": "212880b4-bc28-5194-a9a8-81203c6203f4",
          "timeOffset": 0,
          "type": "ad",
        },
      ]
    `);
  });

  test("should transcode ad creative when not found on s3", async () => {
    fetchMock.mock("https://vast", {
      status: 200,
      body: `
        <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
          <Ad id="mockAd">
            <InLine>
              <Creatives>
                <Creative id="mockCreative" AdID="mockAd" sequence="1">
                  <Linear>
                    <Duration>00:00:05</Duration>
                    <MediaFiles>
                      <MediaFile id="mockMediaFile" delivery="progressive" width="640" height="360" type="video/mp4" bitrate="148" scalable="true" maintainAspectRatio="true">
                        <![CDATA[ https://ad ]]>
                      </MediaFile>
                    </MediaFiles>
                  </Linear>
                </Creative>
              </Creatives>
            </InLine>
          </Ad>
        </VAST>
      `,
    });

    const adUuid = "212880b4-bc28-5194-a9a8-81203c6203f4";
    fetchMock.mock(`https://s3-public.com/package/${adUuid}/hls/master.m3u8`, {
      status: 404,
    });

    const interstitials = await extractInterstitialFromVmapAdbreak({
      timeOffset: 0,
      vastUrl: "https://vast",
    });

    expect(interstitials).toEqual([]);

    expect(addTranscodeJob.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "assetId": "212880b4-bc28-5194-a9a8-81203c6203f4",
        "inputs": [
          {
            "path": "https://ad",
            "type": "video",
          },
          {
            "language": "eng",
            "path": "https://ad",
            "type": "audio",
          },
        ],
        "packageAfter": true,
        "segmentSize": 4,
        "streams": [
          {
            "bitrate": 4000000,
            "codec": "h264",
            "framerate": 24,
            "height": 720,
            "type": "video",
          },
          {
            "bitrate": 1500000,
            "codec": "h264",
            "framerate": 24,
            "height": 480,
            "type": "video",
          },
          {
            "bitrate": 128000,
            "codec": "aac",
            "language": "eng",
            "type": "audio",
          },
        ],
        "tag": "ad",
      }
    `);
  });
});
