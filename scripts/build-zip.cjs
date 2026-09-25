const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createZip() {
  const zip = new JSZip();
  const distDir = path.resolve(__dirname, '../dist');

  function addFiles(currentDir, zipFolder) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item);
        addFiles(fullPath, subFolder);
      } else {
        if (item.endsWith('.zip')) continue;
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item, fileData);
      }
    }
  }

  addFiles(distDir, zip);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outPath = path.resolve(__dirname, '../public/perkvex-cloudflare.zip');
  fs.writeFileSync(outPath, content);
  console.log(`SUCCESS: perkvex-cloudflare.zip generated (${(content.length / 1024).toFixed(1)} KB)`);
}

createZip().catch(console.error);
