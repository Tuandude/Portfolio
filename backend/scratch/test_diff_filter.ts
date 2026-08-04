import { filterDiff, limitDiffSize } from '../src/utils/diffFilter';

const mockDiff = `diff --git a/backend/package-lock.json b/backend/package-lock.json
index 123456..7890ab 100644
--- a/backend/package-lock.json
+++ b/backend/package-lock.json
@@ -1,5 +1,10 @@
-{
-  "name": "something"
-}
+  "dependency": "something-new"

diff --git a/backend/src/server.ts b/backend/src/server.ts
index abcdef..123456 100644
--- a/backend/src/server.ts
+++ b/backend/src/server.ts
@@ -10,6 +10,7 @@
 import express from 'express';
+import axios from 'axios';

diff --git a/assets/logo.png b/assets/logo.png
new file mode 100644
Binary files /dev/null and b/assets/logo.png differ
`;

console.log("=== Testing filterDiff ===");
const filtered = filterDiff(mockDiff);
console.log("Filtered diff content:\n", filtered);

if (filtered.includes("package-lock.json")) {
  console.error("FAIL: package-lock.json was not filtered out!");
} else if (filtered.includes("logo.png")) {
  console.error("FAIL: logo.png was not filtered out!");
} else if (!filtered.includes("server.ts")) {
  console.error("FAIL: server.ts was incorrectly filtered out!");
} else {
  console.log("PASS: filterDiff works as expected!");
}

console.log("\n=== Testing limitDiffSize ===");
const largeDiff = "diff --git a/file.txt b/file.txt\n--- a/file.txt\n+++ b/file.txt\n@@ -1,2 +1,2 @@\n" + "a\n".repeat(10000);
console.log("Large diff original size:", largeDiff.length);
const limited = limitDiffSize(largeDiff, 1000);
console.log("Limited diff size:", limited.length);
console.log("Limited diff content:\n", limited);

if (limited.includes("WARNING: Git diff too large")) {
  console.log("PASS: limitDiffSize truncated large diff as expected!");
} else {
  console.error("FAIL: limitDiffSize did not truncate large diff!");
}
