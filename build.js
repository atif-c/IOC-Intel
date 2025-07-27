import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const srcDir = './src';
const distRoot = './dist';
const targets = ['chromium', 'firefox'];

function mergeManifest(target) {
    const base = JSON.parse(
        fs.readFileSync(path.join(srcDir, 'manifest.base.json'), 'utf8')
    );
    const override = JSON.parse(
        fs.readFileSync(path.join(srcDir, `manifest.${target}.json`), 'utf8')
    );
    const packageJson = JSON.parse(
        fs.readFileSync(path.join('./package.json'), 'utf8')
    );

    return {
        ...base,
        ...override,
        version: packageJson.version,
    };
}

function copyPolyfill() {
    const srcPolyfillPath = path.join(
        'node_modules',
        'webextension-polyfill',
        'dist',
        'browser-polyfill.min.js'
    );
    const destDir = path.join(srcDir, 'lib');
    const destPolyfillPath = path.join(destDir, 'browser-polyfill.min.js');

    if (!fs.existsSync(srcPolyfillPath)) {
        console.error(`Polyfill not found at ${srcPolyfillPath}`);
        process.exit(1);
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPolyfillPath, destPolyfillPath);
    console.log(`Copied polyfill to ${destPolyfillPath}`);
}

function copyFiles(src, dest, skipManifest = true) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyFiles(srcPath, destPath, skipManifest);
        } else if (!entry.name.startsWith('manifest.') || !skipManifest) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function zipDirectory(sourceDir, outPath) {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}
async function buildTarget(target) {
    copyPolyfill(); // ensure polyfill is copied even in single-target builds
    const distDir = path.join(distRoot, target);

    // Clean and prepare output directory
    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    // Merge manifest and copy files
    const manifest = mergeManifest(target);
    fs.writeFileSync(
        path.join(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    copyFiles(srcDir, distDir);

    console.log(`Built ${target} to ${distDir}`);

    // Always zip the directory
    const zipPath = path.join(distRoot, `${target}.zip`);
    await zipDirectory(distDir, zipPath);
    console.log(`Zipped ${target} to ${zipPath}`);
}

async function buildAll() {
    copyPolyfill();
    for (const target of targets) {
        await buildTarget(target);
    }
}

const target = process.argv[2];

(async () => {
    if (!target || target === 'all') {
        await buildAll();
    } else if (targets.includes(target)) {
        await buildTarget(target);
    } else {
        console.error(`Unknown target: ${target}`);
        process.exit(1);
    }
})();
