import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export class TmpDir {
  private dirs_ = new Set<string>();

  async create() {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), `mixwave-${crypto.randomUUID()}`),
    );
    this.dirs_.add(dir);
    return dir;
  }

  async deleteAll() {
    const promises = Array.from(this.dirs_).map(async (dir) => {
      await fs.rm(dir, { recursive: true });
    });
    await Promise.all(promises);
  }
}
