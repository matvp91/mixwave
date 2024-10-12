import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

export class DirManager {
  private dirs_ = new Set<string>();

  async tmpDir() {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), `mixwave-${crypto.randomUUID()}`),
    );
    this.dirs_.add(dir);
    return dir;
  }

  async deleteTmpDirs() {
    const promises = Array.from(this.dirs_).map(async (dir) => {
      await fs.rm(dir, { recursive: true });
    });
    await Promise.all(promises);
  }
}
