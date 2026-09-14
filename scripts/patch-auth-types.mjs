// The pinned Convex passkey build ships declarations but omits the React
// export's types condition. Keep the fix reproducible after npm ci.
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL(
  "../node_modules/@convex-dev/auth/package.json",
  import.meta.url,
);
const pkg = JSON.parse(readFileSync(path, "utf8"));
pkg.exports["./react"] = {
  types: "./dist/react/index.d.ts",
  ...pkg.exports["./react"],
};
writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
