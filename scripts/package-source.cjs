const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createSourceZip() {
  const zip = new JSZip();
  const rootDir = path.resolve(__dirname, '..');

  const ignoreList = ['node_modules', '.git', 'dist', '.cache'];

  function addFiles(currentDir, zipFolder) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      if (ignoreList.includes(item)) continue;
      if (item.endsWith('.zip')) continue;

      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item);
        addFiles(fullPath, subFolder);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item, fileData);
      }
    }
  }

  addFiles(rootDir, zip);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outPath = path.resolve(__dirname, '../public/perkvex-source-code.zip');
  fs.writeFileSync(outPath, content);
  console.log(`SUCCESS: perkvex-source-code.zip generated (${(content.length / 1024).toFixed(1)} KB)`);
}

createSourceZip().catch(console.error);
