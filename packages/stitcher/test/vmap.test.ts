import fetchMock from "fetch-mock";
import { getVmap } from "../src/vmap";
import { describe, test, expect, afterEach } from "@jest/globals";

describe("vmap", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  test("getVmap with AdData", async () => {
    fetchMock.mock("https://vmap", {
      status: 200,
      body: `
        <vmap:VMAP xmlns:vmap="http://www.iab.net/vmap-1.0" version="1.0">
          <vmap:AdBreak breakId="mid-slot1" breakType="linear" timeOffset="00:10:20">
            <vmap:AdSource allowMultipleAds="true" followRedirects="true" id="1">
              <vmap:VASTAdData><VAST>Mocked</VAST></vmap:VASTAdData>
            </vmap:AdSource>
          </vmap:AdBreak>
        </vmap:VMAP>
      `,
    });

    const vmap = await getVmap("https://vmap");

    expect(vmap).toMatchSnapshot();
  });

  test("getVmap with AdTagURI", async () => {
    fetchMock.mock("https://vmap", {
      status: 200,
      body: `
        <vmap:VMAP xmlns:vmap="http://www.iab.net/vmap-1.0" version="1.0">
          <vmap:AdBreak breakId="mid-slot1" breakType="linear" timeOffset="00:30:40">
            <vmap:AdSource allowMultipleAds="true" followRedirects="true" id="1">
              <vmap:AdTagURI><![CDATA[ https://vast ]]></vmap:AdTagURI>
            </vmap:AdSource>
          </vmap:AdBreak>
        </vmap:VMAP>
      `,
    });

    const vmap = await getVmap("https://vmap");

    expect(vmap).toMatchSnapshot();
  });
});
