// No browser or test framework needed: check localization against actual API evidence.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("../frontend/node_modules/typescript");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "frontend/lib/i18n.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2021,
  },
}).outputText;
const localeExports = {};
vm.runInNewContext(compiled, { exports: localeExports, Intl });
const {
  translate,
  insightText,
  qualityText,
  chartTitle,
  formatNumber,
  messages,
} = localeExports;
assert.equal(translate("Overview", "ru"), "Обзор");
assert.equal(translate("Overview", "en"), "Overview");
assert.equal(
  translate("Remove {column} filter", "ru", { column: "income_USD" }),
  "Убрать фильтр income_USD",
);
assert.equal(translate("my raw column", "ru"), "my raw column");
assert.equal(formatNumber(null, "ru"), "—");
const finding = {
  type: "trend",
  title: "income_USD decreased 42%",
  description: "Original evidence",
  evidence: { metric: "income_USD", change_percent: -42, buckets: 4 },
};
const before = JSON.stringify(finding);
assert.match(insightText(finding, "ru").title, /income_USD: снижение на 42%/);
assert.match(insightText(finding, "ru").description, /4 завершённых/);
assert.equal(insightText(finding, "en").description, finding.description);
assert.equal(JSON.stringify(finding), before);
assert.match(
  insightText(
    {
      type: "segment",
      evidence: { column: "channel", value: "Organic", share: 0.34 },
    },
    "ru",
  ).description,
  /«Organic».*34%/,
);
assert.match(
  insightText({ type: "data_quality", evidence: { duplicate_rows: 8 } }, "ru")
    .description,
  /8 повторных/,
);
assert.equal(
  qualityText("date contains dates imported as text; normalized to UTC.", "ru"),
  "date содержит даты из текста; приведены к UTC.",
);
assert.equal(
  qualityText("Found 8 duplicate rows.", "ru"),
  "Найдено 8 повторных строк.",
);
assert.equal(
  chartTitle({ type: "bar", x: "channel", y: null }, "ru"),
  "Строки по channel",
);
// Every literal passed to t() in the UI must have a Russian counterpart.
for (const dir of ["frontend/app", "frontend/components"]) {
  for (const file of fs
    .readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(".tsx"))) {
    const text = fs.readFileSync(path.join(root, dir, file), "utf8");
    for (const match of text.matchAll(/\bt\("([^"\n]+)"/g))
      assert.ok(
        messages[match[1]],
        `${file}: missing translation for ${match[1]}`,
      );
  }
}
console.log(
  "Localization check passed: translations, evidence, original field values, dictionary coverage.",
);
