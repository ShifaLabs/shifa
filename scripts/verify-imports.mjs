import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ALLOWED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

// Legacy paths from the old architecture that caused prior Turbopack build failures.
const forbiddenPatterns = [
  "@/modules/ai/ShifaChatbot",
  "@/modules/chatbot/chatbot.service",
  "@/modules/users/user.service",
  "@/modules/users/user.validation",
  "../Navigation/Shared/Logo/Logo",
  "../Navigation/Shared/user-profile-dropdown",
  "../Shared/Heading/Heading",
  "../Shared/MotionDiv/MotionDiv",
  "../ui/button",
  "../../components/Navigation/Footer/Footer",
];

async function collectFiles(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, results);
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) continue;
    results.push(fullPath);
  }
  return results;
}

function findMatches(content) {
  const lines = content.split(/\r?\n/);
  const matches = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of forbiddenPatterns) {
      if (line.includes(pattern)) {
        matches.push({ line: i + 1, pattern, text: line.trim() });
      }
    }
  }

  return matches;
}

async function main() {
  const files = await collectFiles(SRC_DIR);
  const findings = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const matches = findMatches(content);
    if (matches.length === 0) continue;

    for (const match of matches) {
      findings.push({
        file: path.relative(ROOT, file).replace(/\\/g, "/"),
        ...match,
      });
    }
  }

  if (findings.length === 0) {
    console.log("Import verification passed: no legacy/broken paths found.");
    return;
  }

  console.error(
    "Import verification failed. Found legacy paths that can break Turbopack:",
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} -> ${finding.pattern}`);
    console.error(`  ${finding.text}`);
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Import verification crashed:", error);
  process.exitCode = 1;
});
