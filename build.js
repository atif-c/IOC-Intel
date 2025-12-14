/** Usage:
 *   node build-targets.js           # builds all targets in parallel
 *   node build-targets.js all       # same as above
 *   node build-targets.js firefox   # build single target
 */

import archiver from 'archiver';
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const fsp = fs.promises;

const CWD = process.cwd();
const manifestSrcDir = path.resolve(CWD, './src/manifests');
const viteOutputDir = path.resolve(CWD, './dist/vite-output');
const packageJsonPath = path.resolve(CWD, './package.json');
const distRoot = path.resolve(CWD, './dist');
const targets = ['firefox', 'chromium'];

const fileExists = async p => {
    try {
        await fsp.access(p);
        return true;
    } catch {
        return false;
    }
};

const readJson = async p => {
    const raw = await fsp.readFile(p, 'utf8');
    return JSON.parse(raw);
};

const writeJsonAtomic = async (p, obj) => {
    const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
    await fsp.rename(tmp, p);
};

const ensureDir = async dir => {
    await fsp.mkdir(dir, { recursive: true });
};

const cleanDir = async dir => {
    await fsp.rm(dir, { recursive: true, force: true });
    await ensureDir(dir);
};

const mergeManifest = async target => {
    const basePath = path.join(manifestSrcDir, 'manifest.base.json');
    const overridePath = path.join(manifestSrcDir, `manifest.${target}.json`);

    if (!(await fileExists(basePath))) {
        throw new Error(`Missing base manifest: ${basePath}`);
    }
    if (!(await fileExists(overridePath))) {
        throw new Error(`Missing target manifest: ${overridePath}`);
    }
    if (!(await fileExists(packageJsonPath))) {
        throw new Error(`Missing package.json at ${packageJsonPath}`);
    }

    const base = await readJson(basePath);
    const override = await readJson(overridePath);
    const pkg = await readJson(packageJsonPath);

    if (!pkg.version) {
        throw new Error('package.json has no "version" field');
    }

    return {
        ...base,
        ...override,
        version: pkg.version,
    };
};

const copyViteOutputTo = async distDir => {
    if (!(await fileExists(viteOutputDir))) {
        throw new Error(`Vite output directory not found: ${viteOutputDir}`);
    }

    // Node's fs.cp will create dest if doesn't exist and copy recursively
    await fsp.cp(viteOutputDir, distDir, { recursive: true });
};

const zipDirectory = async (sourceDir, outPath) => {
    await ensureDir(path.dirname(outPath));
    const tmpOut = `${outPath}.tmp`;

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(tmpOut);
        const archive = archiver('zip', { zlib: { level: 9 } });

        let finalised = false;

        output.on('close', async () => {
            finalised = true;
            try {
                // rename to final path atomically
                await fsp.rename(tmpOut, outPath);
                resolve(archive.pointer()); // bytes
            } catch (err) {
                reject(err);
            }
        });

        output.on('error', err => {
            reject(err);
        });

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                console.warn('Zip warning:', err.message);
            } else {
                reject(err);
            }
        });

        archive.on('error', err => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize().catch(err => {
            if (!finalised) reject(err);
        });
    });
};

/**
 * Transforms prompt.js to IIFE format for Firefox compatibility
 */
const transformPromptToIIFE = async distDir => {
    const promptPath = path.join(distDir, 'entries', 'prompt.js');

    if (!(await fileExists(promptPath))) {
        console.warn(
            `prompt.js not found at ${promptPath}, skipping IIFE transformation`
        );
        return;
    }

    try {
        // Use esbuild build API to bundle and transform to IIFE
        const result = await build({
            entryPoints: [promptPath],
            bundle: true,
            format: 'iife',
            target: 'es2015',
            outfile: promptPath,
            write: false,
            absWorkingDir: distDir,
            resolveExtensions: ['.js', '.mjs'],
        });

        if (result.outputFiles && result.outputFiles.length > 0) {
            await fsp.writeFile(promptPath, result.outputFiles[0].text, 'utf8');
            console.log(`Transformed prompt.js to IIFE format`);
        } else {
            console.warn(`esbuild transformation produced no output`);
        }
    } catch (error) {
        console.warn(`Failed to transform prompt.js to IIFE: ${error.message}`);
    }
};

const buildTarget = async target => {
    if (!targets.includes(target)) throw new Error(`Unknown target: ${target}`);

    const distDir = path.join(distRoot, target);

    // Clean target dir (atomic)
    await cleanDir(distDir);

    // Validate & merge manifest
    const manifest = await mergeManifest(target);

    // Copy vite output first (so files exist), but filter out manifests within vite output to be safe
    await copyViteOutputTo(distDir);

    // Transform prompt.js to IIFE
    await transformPromptToIIFE(distDir);

    // Now write the merged manifest (after copy so it cannot be overwritten)
    await writeJsonAtomic(path.join(distDir, 'manifest.json'), manifest);

    console.log(`[${target}] copied files and wrote manifest to ${distDir}`);

    // Zip
    const zipPath = path.join(distRoot, `${target}.zip`);
    const sizeBytes = await zipDirectory(distDir, zipPath);
    console.log(`[${target}] zipped to ${zipPath} (${sizeBytes} bytes)`);

    return { target, distDir, zipPath, sizeBytes };
};

const main = async () => {
    const rawArg = process.argv[2];

    // Determine requested target(s)
    let requestedTargets;
    if (!rawArg || rawArg === 'all') {
        requestedTargets = targets.slice(); // build all
    } else if (targets.includes(rawArg)) {
        requestedTargets = [rawArg]; // build single
    } else {
        console.error(`Unknown target: ${rawArg}`);
        console.error(`Valid targets: ${targets.join(', ')}`);
        process.exitCode = 1;
        return;
    }

    // Validate required paths exist
    if (!(await fileExists(packageJsonPath))) {
        throw new Error(`Cannot locate package.json at ${packageJsonPath}`);
    }
    if (!(await fileExists(manifestSrcDir))) {
        throw new Error(`Manifests directory not found: ${manifestSrcDir}`);
    }
    if (!(await fileExists(viteOutputDir))) {
        throw new Error(`Vite output directory not found: ${viteOutputDir}`);
    }

    // Build targets in parallel by default
    const results = await Promise.all(
        requestedTargets.map(t => buildTarget(t))
    );

    return results;
};

/* Execute with top-level error handling */
(async () => {
    try {
        const results = await main();
        console.log(
            'Build completed successfully for:',
            results.map(r => r.target).join(', ')
        );
        process.exitCode = 0;
    } catch (err) {
        console.error(
            'Build failed:',
            err && err.stack ? err.stack : String(err)
        );
        process.exitCode = 1;
    }
})();
