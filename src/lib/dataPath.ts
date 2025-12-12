import path from "path";

/**
 * Returns the absolute path to the JSON data file.
 * If DATA_DIR environment variable is set, it uses that directory;
 * otherwise, it defaults to the ../data directory relative to this file.
 *
 * @param filename - The name of the data file (e.g., 'users.json')
 * @returns The absolute path to the data file
 */
export function dataPath(filename: string) {
  const dir = process.env.DATA_DIR ?? path.join(__dirname, "../data/");
  return path.join(dir, filename);
}
