const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

function WriteFileBlob(currentPath) {
  const contents = fs.readFileSync(currentPath);
  const len = contents.length;
  const header = `blob ${len}\0`;
  const blob = Buffer.concat([Buffer.from(header), contents]);
  const hash = crypto.createHash("sha1").update(blob).digest("hex");
  const folder = hash.slice(0, 2);
  const file = hash.slice(2);

  const completeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
  if (!fs.existsSync(completeFolderPath)) {
    fs.mkdirSync(completeFolderPath, { recursive: true });
  }
  const compressedData = zlib.deflateSync(blob);
  fs.writeFileSync(path.join(completeFolderPath, file), compressedData);
  return hash;
}

class WriteTreeCommand {
  constructor() {}

  execute() {
    function recursiveCreateTree(basePath) {
      const entries = fs.readdirSync(basePath);
      const result = [];

      for (const entry of entries) {
        if (entry === ".git") continue;

        const currentPath = path.join(basePath, entry);
        const stat = fs.statSync(currentPath);

        if (stat.isDirectory()) {
          const sha = recursiveCreateTree(currentPath);
          if (sha) {
            result.push({
              mode: "40000",
              basename: path.basename(currentPath),
              sha,
            });
          }
        } else if (stat.isFile()) {
          const sha = WriteFileBlob(currentPath);
          result.push({
            mode: "100644",
            basename: path.basename(currentPath),
            sha,
          });
        }
      }

      if (result.length === 0) return null;

      const treeData = result.reduce((acc, current) => {
        const { mode, basename, sha } = current;
        return Buffer.concat([
          acc,
          Buffer.from(`${mode} ${basename}\0`),
          Buffer.from(sha, "hex"),
        ]);
      }, Buffer.alloc(0));

      const tree = Buffer.concat([
        Buffer.from(`tree ${treeData.length}\0`),
        treeData,
      ]);

      const hash = crypto.createHash("sha1").update(tree).digest("hex");
      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const treeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
      if (!fs.existsSync(treeFolderPath)) {
        fs.mkdirSync(treeFolderPath, { recursive: true });
      }

      const compressed = zlib.deflateSync(tree);
      fs.writeFileSync(path.join(treeFolderPath, file), compressed);
      return hash;
    }

    const sha = recursiveCreateTree(process.cwd());
    process.stdout.write(sha);
  }
}

module.exports = WriteTreeCommand;