const fs = require('node:fs/promises');
const path = require('node:path');
const packager = require('@electron/packager');
const root = path.resolve(__dirname, '..');
const version = require('../package.json').version;
(async () => {
  const buildRoot = path.join(root, '.build');
  await fs.mkdir(buildRoot, { recursive: true });
  const stage = await fs.mkdtemp(path.join(buildRoot, 'package-'));
  for (const folder of ['dist', 'electron', 'assets']) {
    await fs.cp(path.join(root, folder), path.join(stage, folder), {
      recursive: true, filter: file => !file.endsWith('.test.cjs') && !file.endsWith('README.md'),
    });
  }
  await fs.writeFile(path.join(stage, 'package.json'), JSON.stringify({
    name: 'tinta', productName: 'Tinta', version, main: 'electron/main.cjs', private: true,
  }, null, 2));
  const paths = await packager({
    dir: stage, name: 'Tinta', appVersion: version, platform: 'win32', arch: 'x64',
    electronVersion: require('electron/package.json').version,
    electronZipDir: process.env.TINTA_ELECTRON_ZIP_DIR || undefined,
    out: process.env.TINTA_RELEASE_DIR || path.join(root, '..', 'Tinta-' + version + '-Windows'), overwrite: false, asar: true, prune: false,
    icon: path.join(root, 'assets', 'tinta.ico'),
    win32metadata: { CompanyName: 'Tinta', FileDescription: 'Tinta — Notas Markdown', ProductName: 'Tinta', InternalName: 'Tinta', OriginalFilename: 'Tinta.exe' },
  });
  for (const output of paths) {
    try { await fs.copyFile(path.join(root, 'THIRD-PARTY-NOTICES.txt'), path.join(output, 'THIRD-PARTY-NOTICES.txt')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  console.log(paths.join('\n'));
})().catch(error => { console.error(error); process.exitCode = 1; });
