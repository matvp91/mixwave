import { jest } from "@jest/globals";

process.env = {
  S3_PUBLIC_URL: "https://s3-public.com",
};

jest.mock("find-config", () => ({
  default: () => null,
}));
