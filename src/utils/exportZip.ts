import JSZip from 'jszip';

export async function generateAndDownloadZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('package.json', JSON.stringify({
    name: "flixstream-hd",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    dependencies: {
      "lucide-react": "^0.546.0",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "jszip": "^3.10.1"
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@types/node": "^22.14.0",
      "@types/react": "^19.3.0",
      "@types/react-dom": "^19.3.0",
      "@vitejs/plugin-react": "^6.1.1",
      "tailwindcss": "^4.3.3",
      "typescript": "^5.8.0",
      "vite": "^6.2.0"
    }
  }, null, 2));

  zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`);

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: "force",
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"]
  }, null, 2));

  zip.file('index.html', `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlixStream HD - Watch Movies & TV Shows in Ultra HD</title>
    <meta name="description" content="Free Full-Length Movies & TV Streaming with 6 Ultra HD Server Mirrors." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#141414] text-white antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

  zip.file('README.md', `# FlixStream HD - Production Movie & TV Streaming Web Application

FlixStream HD is a high-performance, Netflix-style video streaming application built with React, Vite, TypeScript, and Tailwind CSS.

## 🚀 Features
- **Real TMDB v3 Catalog**: Live trending, top-rated, and categorized Movies and TV Series with backdrops, high-res posters, cast, and overviews.
- **6 Ultra HD Streaming Mirrors (Verified for In-Page Streaming)**:
  1. VidLink Pro Ultra (Zero Buffer & 4K)
  2. SuperEmbed VIP (Multi-Source Mirror)
  3. Vidflix Prime (High Speed CDN)
  4. MultiEmbed HD (Multi-Audio & Multi-Language)
  5. 2Embed Cinema (Direct Mirror)
  6. VidSrc Cloud (Backup Server)
- **TV Show Episode Picker**: Instant Season & Episode selector with direct episode-by-episode routing.
- **CPA Monetization Locker (15-Second Hook)**: High-converting OGAds content locker prompt with dynamic tracking sub-IDs (\`aff_sub\` and \`aff_sub2\`).
- **Direct Tab Popout**: Fallback for browsers with strict adblockers or iframe sandboxing.
- **Personal Watchlist & History**: Automatically saved locally.
- **Trailer Previews**: Official YouTube video integration.
- **Zero-Config Deployment**: Ready to run anywhere.

## 🛠️ Quick Start
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser at http://localhost:5173
\`\`\`

## ⚙️ TMDB API Key & Settings
You can set your own TMDB API key or change the OGAds Locker ID via the in-app Settings modal (gear icon in the top right).
`);

  // We can fetch our current source files to include them into the zip
  const filesToFetch = [
    'src/types.ts',
    'src/config/servers.ts',
    'src/services/tmdb.ts',
    'src/index.css',
    'src/main.tsx',
    'src/App.tsx',
  ];

  for (const file of filesToFetch) {
    try {
      const res = await fetch(`/${file}`);
      if (res.ok) {
        const text = await res.text();
        zip.file(file, text);
      }
    } catch {
      // ignore
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'flixstream.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
