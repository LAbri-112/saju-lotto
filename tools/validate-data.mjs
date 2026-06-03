import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

function fail(message) {
  throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(rootDir, path), "utf8"));
}

function assertDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))) {
    fail(`${label} must be YYYY-MM-DD.`);
  }
}

function assertIntegerRange(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    fail(`${label} must be an integer from ${min} to ${max}.`);
  }
}

function validateLottoDraw(draw, expectedDraw) {
  assertIntegerRange(draw.draw, 1, 10000, `lotto draw ${expectedDraw} number`);
  if (draw.draw !== expectedDraw) {
    fail(`lotto draw order mismatch: expected ${expectedDraw}, got ${draw.draw}.`);
  }
  assertDate(draw.date, `lotto draw ${draw.draw} date`);
  if (!Array.isArray(draw.numbers) || draw.numbers.length !== 6) {
    fail(`lotto draw ${draw.draw} must have six numbers.`);
  }
  const unique = new Set(draw.numbers);
  if (unique.size !== 6) fail(`lotto draw ${draw.draw} numbers must be unique.`);
  draw.numbers.forEach((number, index) =>
    assertIntegerRange(number, 1, 45, `lotto draw ${draw.draw} number ${index + 1}`),
  );
  assertIntegerRange(draw.bonus, 1, 45, `lotto draw ${draw.draw} bonus`);
}

function normalizePensionDigits(value, label) {
  const text = Array.isArray(value)
    ? value.join("")
    : String(value ?? "").replace(/\D/g, "").padStart(6, "0").slice(-6);
  const digits = text.split("").map(Number);
  if (digits.length !== 6 || digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)) {
    fail(`${label} must contain six digits from 0 to 9.`);
  }
  return digits;
}

function validatePensionDraw(draw, expectedRound) {
  assertIntegerRange(draw.round, 1, 10000, `pension round ${expectedRound} number`);
  if (draw.round !== expectedRound) {
    fail(`pension round order mismatch: expected ${expectedRound}, got ${draw.round}.`);
  }
  assertDate(draw.date, `pension round ${draw.round} date`);
  const group = Number(draw.group ?? draw.first?.group);
  assertIntegerRange(group, 1, 5, `pension round ${draw.round} group`);
  normalizePensionDigits(draw.digits?.length ? draw.digits : draw.number ?? draw.first?.number, `pension round ${draw.round} number`);
  const bonusSource = draw.bonusDigits?.length ? draw.bonusDigits : draw.bonusNumber ?? draw.bonus?.number;
  if (bonusSource != null && String(bonusSource).length) {
    normalizePensionDigits(bonusSource, `pension round ${draw.round} bonus`);
  }
}

function validateLotto(dataset) {
  if (!Array.isArray(dataset.draws) || !dataset.draws.length) {
    fail("lotto data must contain at least one draw.");
  }
  if (dataset.count !== dataset.draws.length) {
    fail(`lotto count mismatch: ${dataset.count} vs ${dataset.draws.length}.`);
  }
  if (dataset.latestDraw !== dataset.draws.at(-1)?.draw) {
    fail("lotto latestDraw must match the last draw.");
  }
  dataset.draws.forEach((draw, index) => validateLottoDraw(draw, index + 1));
}

function validatePension(dataset) {
  if (!Array.isArray(dataset.draws) || !dataset.draws.length) {
    fail("pension data must contain at least one round.");
  }
  if (dataset.count !== dataset.draws.length) {
    fail(`pension count mismatch: ${dataset.count} vs ${dataset.draws.length}.`);
  }
  if (dataset.latestRound !== dataset.draws.at(-1)?.round) {
    fail("pension latestRound must match the last round.");
  }
  dataset.draws.forEach((draw, index) => validatePensionDraw(draw, index + 1));
}

async function main() {
  const targets = new Set(process.argv.slice(2));
  const validateAll = targets.size === 0 || targets.has("all");
  const results = [];

  if (validateAll || targets.has("lotto")) {
    const lotto = await readJson("data/lotto-results.json");
    validateLotto(lotto);
    results.push(`lotto ${lotto.count} draws`);
  }

  if (validateAll || targets.has("pension")) {
    const pension = await readJson("data/pension-results.json");
    validatePension(pension);
    results.push(`pension ${pension.count} rounds`);
  }

  if (!results.length) {
    fail("Choose a validation target: lotto, pension, or all.");
  }

  process.stdout.write(`Data OK: ${results.join(", ")}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
