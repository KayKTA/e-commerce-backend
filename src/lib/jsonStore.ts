import { promises as fs } from "fs";
import path from "path";

/**
 * A simple JSON file-based store for generic type T
 */
export class JsonStore<T> {
    constructor(private filePath: string) { }

    private async ensureFile() {
        try {
            await fs.access(this.filePath);
        } catch {
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, "[]", "utf-8");
        }
    }

    async readAll(): Promise<T[]> {
        await this.ensureFile();
        const raw = await fs.readFile(this.filePath, "utf-8");
        return JSON.parse(raw) as T[];
    }

    async writeAll(data: T[]): Promise<void> {
        await this.ensureFile();
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
}
