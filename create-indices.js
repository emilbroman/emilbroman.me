const { readdir, stat, writeFile } = require("fs/promises");
const { join } = require("path");

async function run(path) {
  const children = await readdir(path);

  const entries = await Promise.all(
    children.map(async (childPath) => {
      const fullPath = join(path, childPath);
      const s = await stat(fullPath);
      const isDirectory = s.isDirectory();
      if (isDirectory) {
        await run(fullPath);
      }
      return {
        isDirectory,
        url: childPath,
      };
    })
  );

  const indexPath = join(path, "index.json");
  console.log("Writing", indexPath, `(${entries.length} files)`);
  await writeFile(indexPath, JSON.stringify(entries));
}

run("dist").catch((e) => console.error(e));
