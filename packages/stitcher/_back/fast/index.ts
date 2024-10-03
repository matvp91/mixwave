import { Channel } from "./channel.js";
import { stringify } from "../parser/index.js";

const channel = new Channel();

channel.schedule("468ea987-2c3a-4301-9eca-fb89fd26b79b");
channel.schedule("468ea987-2c3a-4301-9eca-fb89fd26b79b");

export async function getMasterPlaylist() {
  const master = channel.getMasterPlaylist();
  return stringify(master);
}

export async function getMediaPlaylist(path: string) {
  // const media = channel.getMediaPlaylist(path);
  // return stringify(media);
  return null;
}
