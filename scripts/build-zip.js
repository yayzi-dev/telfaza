import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const output = fs.createWriteStream(path.resolve('public/perkvex-cloudflare.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`perkvex-cloudflare.zip created successfully: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Append files from dist directly into the root of the zip archive (ready for Cloudflare upload)
archive.directory(path.resolve('dist'), false);

archive.finalize();
