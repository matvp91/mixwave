import "./mocks/mock-env";
import fetchMock from "fetch-mock";
import { getVmap } from "../src/vmap";
import { describe, test, expect, afterEach } from "@jest/globals";

describe("vmap", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  test("should extract VASTAdData", async () => {
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

    expect(vmap).toMatchInlineSnapshot(`
      {
        "adBreaks": [
          {
            "timeOffset": 620,
            "vastData": "<VAST>Mocked</VAST>",
            "vastUrl": undefined,
          },
        ],
      }
    `);
  });

  test("should extract AdTagURI", async () => {
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

    expect(vmap).toMatchInlineSnapshot(`
      {
        "adBreaks": [
          {
            "timeOffset": 1840,
            "vastData": undefined,
            "vastUrl": "https://vast",
          },
        ],
      }
    `);
  });
});
