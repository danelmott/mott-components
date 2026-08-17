import {existsSync, mkdirSync, copyFileSync} from 'fs';
import { dirname, join, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const packageRoot = join(__dirname, '..');

const isInstalledAsDependency = packageRoot
    .split(sep)
    .join('/')
    .includes('/node_modules/@danelmott/mott-design-components');

if (!isInstalledAsDependency) {
    console.log('[mott-design-components] desarrollo local del paquete - salta el postinstall');
    process.exit(0);
}

const projectRoot = process.env.INIT_CWD || process.cwd();

const source = join(packageRoot, 'dist', 'globals.css');
const target = join(projectRoot, 'app', 'globals.css');
const targetDir = dirname(target);


if(!existsSync(source)) {
    console.warn('[mott-design-components] no se encontro dist/globals.css - salta el postinstall');
    process.exit(0);
}


if(!existsSync(targetDir)) {
    mkdirSync(targetDir, {recursive: true});
}

copyFileSync(source, target);
console.log('[mott-design-components] app/globals.css reemplazado con mott-design-tokens');
