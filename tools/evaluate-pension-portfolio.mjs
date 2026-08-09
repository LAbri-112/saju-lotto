const GROUP_COUNT = 5;
const SERIAL_UNIVERSE = 1_000_000;
const TICKET_UNIVERSE = GROUP_COUNT * SERIAL_UNIVERSE;

function suffix(serial, length) {
  return serial.slice(-length);
}

function evaluate(items) {
  const ticketKeys = new Set(items.map((item) => `${item.group}-${item.serial}`));
  const serials = new Set(items.map((item) => item.serial));
  const suffixCounts = Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => {
      const length = index + 1;
      return [length, new Set(items.map((item) => suffix(item.serial, length))).size];
    }),
  );

  return {
    tickets: ticketKeys.size,
    uniqueSerials: serials.size,
    firstPrizeRate: ticketKeys.size / TICKET_UNIVERSE,
    firstOrSecondRate: serials.size / SERIAL_UNIVERSE,
    atLeastSeventhRate: suffixCounts[1] / 10,
    atLeastSixthRate: suffixCounts[2] / 100,
    atLeastFifthRate: suffixCounts[3] / 1_000,
    suffixCounts,
  };
}

const setPortfolio = Array.from({ length: 5 }, (_, index) => ({
  group: index + 1,
  serial: "123456",
}));
const diversifiedPortfolio = Array.from({ length: 5 }, (_, index) => ({
  group: index + 1,
  serial: `12345${index}`,
}));

const setMetrics = evaluate(setPortfolio);
const diversifiedMetrics = evaluate(diversifiedPortfolio);

if (setMetrics.uniqueSerials !== 1 || setMetrics.firstOrSecondRate !== 1 / 1_000_000) {
  throw new Error("세트형 5장의 1·2등 접점 계산이 올바르지 않습니다.");
}
if (diversifiedMetrics.uniqueSerials !== 5 || diversifiedMetrics.atLeastSeventhRate !== 0.5) {
  throw new Error("분산형 5장의 끝자리 접점 계산이 올바르지 않습니다.");
}
if (diversifiedMetrics.firstPrizeRate !== setMetrics.firstPrizeRate) {
  throw new Error("두 방식의 1등 당첨 확률은 같은 5장 기준으로 같아야 합니다.");
}
if (diversifiedMetrics.firstOrSecondRate !== 1 / 200_000) {
  throw new Error("분산형 5장의 1·2등 번호 접점은 1/200,000이어야 합니다.");
}

console.log(JSON.stringify({ set: setMetrics, diversified: diversifiedMetrics }, null, 2));
