#!/usr/bin/env node

// @ts-check

import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { rm, writeFile } from 'node:fs/promises';
import { $ } from 'zx';
import pc from 'picocolors';

$.verbose = true;

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
    console.log(pc.dim(pc.bold('===== First build =====')));
    await $`tsc --build tsconfig.json --emitDeclarationOnly --verbose --pretty # First build`;

    console.log('✅ First build succeeded.');
} catch (error) {
    console.log(error);
    console.log('❌ First build failed to run, this should not happen.');
    throw new Error('First build failed unexpectedly.');
}

console.log(`Deleting ${relative(import.meta.dirname, fileToDelete)} file...\n`);
await rm(fileToDelete);

try {
    console.log(pc.dim(pc.bold('===== Second build =====')));
    await $`tsc --build tsconfig.json --emitDeclarationOnly --verbose --pretty # Second build`;
    console.log('❌ Second build succeeded, but it should have failed because the file was deleted.');
} catch {
    console.log('✅ Second build failed, as it should have, because the file was deleted.');
}

await rm(join(tsDistDir, 'shared'), { recursive: true, force: true });
console.log('tsDist/shared directory removed successfully.\n');

console.log('Manually deleted cache for `shared` package...');
try {
    console.log(pc.dim(pc.bold('===== Third build =====')));
    await $`tsc --build tsconfig.json --emitDeclarationOnly --verbose --pretty # Third build`;

    console.log(
        '❌ Third build succeeded, but it should have failed because the cache for the `shared` package was deleted.'
    );
} catch {
    console.log('✅ Third build failed, as expected, because the cache for the `shared` package was deleted.');
}
