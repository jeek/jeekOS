export function getTruePlayer() {
    return eval(
      `var hopefulPlayer = undefined; globalThis.webpack_require ?? webpackChunkbitburner.push([[-1], {}, w => globalThis.webpack_require = w]); Object.keys(webpack_require.m).forEach(k => Object.values(webpack_require(k)).forEach(p => hopefulPlayer = p?.whoAmI?.() == "Player" ? p : hopefulPlayer)); hopefulPlayer`
    );
  }
  
  // dev menu
  // /** @param {NS} ns */
  // export async function main(ns) {
  //    globalThis.webpack_require ?? webpackChunkbitburner.push([[-1], {}, w => globalThis.webpack_require = w]);
  //    Object.keys(webpack_require.m).forEach(k => Object.values(webpack_require(k)).forEach(p => p?.toPage?.('Dev')));
  //  }
  