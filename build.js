import fs from 'fs';
import path from 'path';

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
    return { ...base, ...override };
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

function buildTarget(target) {
    const distDir = path.join(distRoot, target);

    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    const manifest = mergeManifest(target);
    fs.writeFileSync(
        path.join(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    copyFiles(srcDir, distDir);
    console.log(`Built ${target} to ${distDir}`);
}

function buildAll() {
    for (const target of targets) {
        buildTarget(target);
    }
}

const target = process.argv[2];
if (!target || target === 'all') {
    buildAll();
} else if (targets.includes(target)) {
    buildTarget(target);
} else {
    console.error(`Unknown target: ${target}`);
    process.exit(1);
}
