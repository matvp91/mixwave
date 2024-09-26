import { jest } from "@jest/globals";

process.env = {
  PUBLIC_S3_ENDPOINT: "https://s3-public.com",
};

jest.mock("find-config", () => ({
  default: () => null,
}));
