#!/usr/bin/env node

// @ts-check

import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { rm, writeFile } from 'node:fs/promises';
import pc from 'picocolors';

const buildCmd = 'tsc --build tsconfig.json --emitDeclarationOnly';

const exec = promisify(execCb);
const tsDistDir = join(import.meta.dirname, 'tsDist');
const fileToDelete = join(import.meta.dirname, 'packages', 'shared', 'src', 'product.ts');

if (!existsSync(fileToDelete)) {
    console.error(`Recreating ${relative(import.meta.dirname, fileToDelete)}`);

    await writeFile(
        fileToDelete,
        `export interface Product {
    id: string;
    name: string;
    price: number;
}

export const createProduct = (name: string, price: number): Product => ({
    id: \`prod_\${Math.random().toString(36).substr(2, 9)}\`,
    name,
    price
});

export const validateProduct = (product: Product): boolean => {
    return product.name.length > 0 && product.price > 0;
};`
    );
}

if (existsSync(tsDistDir)) {
    console.log('Removing existing tsDist directory...');
    await rm(tsDistDir, { recursive: true, force: true });
}

try {
    console.log(`\n${pc.bold('$')} ${pc.green(buildCmd)} ${pc.gray('# First build')}`);
    await exec(buildCmd);

    console.log('✅ First build succeeded.');
} catch (error) {
    console.log(error);
    console.log('❌ First build failed to run, this should not happen.');
    throw new Error('First build failed unexpectedly.');
}

console.log(`Deleting ${relative(import.meta.dirname, fileToDelete)} file...\n`);
await rm(fileToDelete);

try {
    console.log(`${pc.bold('$')} ${pc.green(buildCmd)} ${pc.gray('# Second build')}`);
    await exec(buildCmd);
    console.log('❌ Second build succeeded, but it should have failed because the file was deleted.');
} catch {
    console.log('✅ Second build failed, as it should have, because the file was deleted.');
}

await rm(join(tsDistDir, 'shared'), { recursive: true, force: true });
console.log('tsDist/shared directory removed successfully.\n');

console.log('Manually deleted cache for `shared` package...');
try {
    console.log(`${pc.bold('$')} ${pc.green(buildCmd)} ${pc.gray('# Third build')}`);
    await exec(buildCmd);
    console.log(
        '❌ Third build succeeded, but it should have failed because the cache for the `shared` package was deleted.'
    );
} catch {
    console.log('✅ Third build failed, as expected, because the cache for the `shared` package was deleted.');
}
