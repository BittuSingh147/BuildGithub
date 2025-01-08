const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand {
  constructor(flag, filepath) {
    this.flag = flag;
    this.filepath = filepath;
  }

  execute() {
    // Ensure the file exists
    const filepath = path.resolve(this.filepath);
    if (!fs.existsSync(filepath)) {
      throw new Error(`could not open ${this.filepath} for reading: No such file or directory`);
    }

    // Read the file contents
    const fileContents = fs.readFileSync(filepath);
    const fileLength = fileContents.length;

    // Create the correct header format
    const header = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContents]);

    // Calculate the SHA-1 hash over the header + file contents
    const hash = crypto.createHash("sha1").update(blob).digest("hex");

    // If the -w flag is set, write the object to the .git/objects directory
    if (this.flag && this.flag === "-w") {
      const folder = hash.slice(0, 2);  // First two characters
      const file = hash.slice(2);       // The remaining characters
      const completeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
      
      if (!fs.existsSync(completeFolderPath)) {
        fs.mkdirSync(completeFolderPath, { recursive: true });
      }

      // Compress the object with zlib
      const compressedData = zlib.deflateSync(blob);

      // Write the compressed data to the .git/objects directory
      fs.writeFileSync(path.join(completeFolderPath, file), compressedData);
    }

    // Output the hash
    process.stdout.write(hash);
  }
}

module.exports = HashObjectCommand;
