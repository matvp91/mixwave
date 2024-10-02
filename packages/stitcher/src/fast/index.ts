import { DateTime, Interval } from "luxon";
import { Channel, Schedule } from "./channel.js";

function createSchedule() {
  const schedule: Schedule = {
    items: [],
  };

  const now = DateTime.now();

  const interval = Interval.fromDateTimes(
    now.minus({ minutes: 10 }),
    now.plus({ minutes: 10 }),
  );

  interval.splitBy({ seconds: 30 }).forEach((d) => {
    schedule.items.push({
      start: d.start!.toISO(),
      end: d.end!.toISO(),
      uri: "mix://468ea987-2c3a-4301-9eca-fb89fd26b79b",
    });
  });

  return schedule;
}

const channel = new Channel(async () => {
  return createSchedule();
});

export async function getMasterPlaylist() {
  return channel.getMasterPlaylist();
}

export async function getMediaPlaylist(path: string) {
  return channel.getMediaPlaylist(path);
}
