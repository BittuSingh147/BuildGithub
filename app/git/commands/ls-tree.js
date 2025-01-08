const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class LSTreeCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }

  execute() {
    const sha = this.sha;
    const folder = sha.slice(0, 2);
    const file = sha.slice(2);
    const folderPath = path.join(process.cwd(), ".git", "objects", folder);
    const filepath = path.join(folderPath, file);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Not a valid object name ${sha}`);
    }

    const fileContent = fs.readFileSync(filepath);
    const outputBuffer = zlib.inflateSync(fileContent);
    
    // Skip the header
    let headerEnd = 0;
    while (outputBuffer[headerEnd] !== 0x00) {
      headerEnd++;
    }
    headerEnd++; // Skip the null byte
    
    const entries = [];
    let currentIndex = headerEnd;
    
    while (currentIndex < outputBuffer.length) {
      // Read mode until space
      let modeEnd = currentIndex;
      while (outputBuffer[modeEnd] !== 0x20) { // space character
        modeEnd++;
      }
      const mode = outputBuffer.slice(currentIndex, modeEnd).toString();
      
      // Skip space
      currentIndex = modeEnd + 1;
      
      // Read name until null byte
      let nameEnd = currentIndex;
      while (outputBuffer[nameEnd] !== 0x00) {
        nameEnd++;
      }
      const name = outputBuffer.slice(currentIndex, nameEnd).toString();
      
      // Skip null byte
      currentIndex = nameEnd + 1;
      
      // Read 20 bytes for SHA-1
      const hash = outputBuffer.slice(currentIndex, currentIndex + 20).toString('hex');
      currentIndex += 20;
      
      // Determine type based on mode
      const type = mode.startsWith('04') ? 'tree' : 'blob';
      
      entries.push({ mode, type, hash, name });
    }
    
    // Print entries in sorted order
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      console.log(`${entry.mode} ${entry.type} ${entry.hash}\t${entry.name}`);
    }
  }
}

module.exports = LSTreeCommand;