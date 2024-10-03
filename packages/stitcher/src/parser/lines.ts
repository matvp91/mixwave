const SKIP_IF_REDUNDANT = ["#EXT-X-MEDIA", "#EXT-X-MAP"];

export class Lines extends Array<string> {
  override push(...items: string[]) {
    for (const item of items) {
      if (
        this.includes(item) &&
        SKIP_IF_REDUNDANT.some((value) => item.startsWith(value))
      ) {
        continue;
      }
      super.push(item);
    }
    return this.length;
  }
}
