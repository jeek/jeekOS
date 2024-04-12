export function jFormat(number: number, format: string = " ") {
  if (number === null) {
    return "null";
  }
  if (number === 0) {
    return "0.000";
  }
  let sign = number < 0 ? "-" : "";
  if (number < 0) {
    number = -number;
  }
  let exp = Math.floor(Math.log(number) / Math.log(10));
  while (10 ** exp <= number) {
    exp += 3 - (exp % 3);
  }
  exp -= 3;
  while (number >= 1000) {
    number /= 1000;
    if (number > 1e309 || number == Infinity) {
      return "Inf";
    }
    if (number < -1e309 || number == -Infinity) {
      return "-Inf";
    }
  }
  exp = Math.max(exp, 0);
  return (
    (format.toString().includes("$") ? "$" : "") +
    sign +
    number.toFixed(3).toString() +
    (exp < 33
      ? ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"][
          Math.floor(exp / 3)
        ]
      : "e" + exp.toString())
  );
}
