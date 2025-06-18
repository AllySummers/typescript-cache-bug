# TypeScript Cache Test - File Deletion Issue

This repository demonstrates an issue with TypeScript's incremental compilation where it does not properly recheck when an imported file is deleted.

## Project Structure

This is a yarn workspace monorepo with two TypeScript projects:

-   `packages/shared` (`@test/shared`) - A shared library with user, product, and utility modules
-   `packages/app` (`@test/app`) - An application that depends on the shared library via workspace dependency

The root `tsconfig.json` uses project references to coordinate builds between packages.

## The Issue

When TypeScript builds with incremental compilation (`--incremental`) and project references:

1. Initial build creates cache files (`.tsbuildinfo`) and declaration files (`.d.ts`)
2. If an imported file is deleted from a referenced project
3. TypeScript may not detect the deletion and continue using cached information
4. This can result in successful builds even when source files are missing

The build command used: `tsc --build tsconfig.json --emitDeclarationOnly`

## Files Involved

### Shared Package (`packages/shared`)

-   `src/user.ts` - User interface and creation function
-   `src/product.ts` - **Target file for deletion test** (Product interface, creation, and validation)
-   `src/utils.ts` - Utility functions (currency formatting, tax calculation)
-   `src/index.ts` - Barrel export file that re-exports user and utils

### App Package (`packages/app`)

-   `src/order.ts` - Order logic that imports from shared package (uses Product, User, and utils)
-   `src/index.ts` - Main application entry point that processes sample orders

## Running the Test

```bash
# Install dependencies
yarn install

# Run the automated test
yarn test-deletion
```

The test script will:

1. Clean existing build artifacts (`tsDist` directory)
2. Perform initial build to create cache files
3. Delete `packages/shared/src/product.ts`
4. Attempt to build again (should fail but may not due to caching)
5. Manually delete the shared package cache (`tsDist/shared`)
6. Attempt to build a third time (should fail without cache)
7. Restore the deleted file for next test run

## Expected vs Actual Behavior

**Expected**: TypeScript should fail the build when `product.ts` is deleted because:

-   `packages/app/src/order.ts` directly imports `Product`, `validateProduct` from `@shared/product`
-   `packages/app/src/index.ts` imports `createProduct` from `@test/shared/product`
-   These imports should cause compilation errors when the file is missing

**Actual**: TypeScript may continue to build successfully using a cached `.tsbuildinfo`, and not detecting that the source file was deleted.

## Test Results Interpretation

The test runs three build phases:

1. **First build**: Should succeed (establishes baseline and cache)
2. **Second build** (after deleting `product.ts`): Should fail but succeeds due to caching bug
3. **Third build** (after deleting cache): Should fail and likely will fail

When the second build succeeds, it demonstrates the TypeScript caching issue where deleted files aren't properly detected.
