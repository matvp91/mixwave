import fetchMock from "fetch-mock";
import { extractInterstitialFromVmapAdbreak } from "../src/vast";
import { describe, test, expect, afterEach } from "@jest/globals";
import { addTranscodeJob } from "@mixwave/artisan/producer";

describe("vmap", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  test("extractInterstitialFromVmapAdbreak", async () => {
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

    expect(interstitials).toMatchSnapshot();
  });

  test("extractInterstitialFromVmapAdbreak transcode", async () => {
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

    // @ts-expect-error
    expect(addTranscodeJob.mock.calls[0][0]).toMatchSnapshot();
  });
});
