const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class CommitCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    // Get tree hash from write-tree
    const writeTreeCommand = new WriteTreeCommand();
    const treeHash = writeTreeCommand.execute();

    // Get author info from environment variables
    const author = process.env.GIT_AUTHOR_NAME || "Unknown";
    const email = process.env.GIT_AUTHOR_EMAIL || "unknown@email.com";
    const timestamp = Math.floor(Date.now() / 1000);
    const timezone = "+0000";

    // Create commit content
    const parentHash = this.getParentCommit();
    const commitContent = [
      `tree ${treeHash}`,
      parentHash ? `parent ${parentHash}` : "",
      `author ${author} <${email}> ${timestamp} ${timezone}`,
      `committer ${author} <${email}> ${timestamp} ${timezone}`,
      "",
      this.message,
      ""
    ].filter(Boolean).join("\n");

    // Create commit object
    const header = `commit ${Buffer.from(commitContent).length}\0`;
    const commit = Buffer.concat([
      Buffer.from(header),
      Buffer.from(commitContent)
    ]);

    // Calculate hash and save
    const hash = crypto.createHash("sha1").update(commit).digest("hex");
    const folder = hash.slice(0, 2);
    const file = hash.slice(2);

    const folderPath = path.join(process.cwd(), ".git", "objects", folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const compressed = zlib.deflateSync(commit);
    fs.writeFileSync(path.join(folderPath, file), compressed);

    // Update HEAD reference
    this.updateRef(hash);

    return hash;
  }

  getParentCommit() {
    try {
      const headPath = path.join(process.cwd(), ".git", "HEAD");
      const headContent = fs.readFileSync(headPath, "utf8").trim();
      
      if (headContent.startsWith("ref: ")) {
        const ref = headContent.slice(5);
        const refPath = path.join(process.cwd(), ".git", ref);
        if (fs.existsSync(refPath)) {
          return fs.readFileSync(refPath, "utf8").trim();
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  updateRef(hash) {
    const headPath = path.join(process.cwd(), ".git", "HEAD");
    const headContent = fs.readFileSync(headPath, "utf8").trim();
    
    if (headContent.startsWith("ref: ")) {
      const ref = headContent.slice(5);
      const refPath = path.join(process.cwd(), ".git", ref);
      fs.mkdirSync(path.dirname(refPath), { recursive: true });
      fs.writeFileSync(refPath, hash + "\n");
    }
  }
}

module.exports = CommitCommand;