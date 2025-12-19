import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src/assets';
const OUT = 'src/app/shared/assets/images.generated.ts';

function walk(dir, base = '') {
    return fs.readdirSync(dir).reduce((acc, file) => {
        const full = path.join(dir, file);
        const key = file.replace(/\.(jpg|png|svg|webp)$/i, '');
        if (fs.statSync(full).isDirectory()) {
            acc[file] = walk(full, path.join(base, file));
        } else {
            acc[key] = `assets/${path.join(base, file)}`;
        }
        return acc;
    }, {});
}

const data = walk(ROOT);

fs.writeFileSync(OUT, `export const IMAGES = ${JSON.stringify(data, null, 2)} as const;\n`);
