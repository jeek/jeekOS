function findallvalidmathexpressions(data) {
	let queue = new Set();
	queue.add(data[0]);
	for (let current of queue) {
		let splitted = current.split("");
		for (let i = 1; i < splitted.length; i++) {
			if (!("+-*".includes(splitted[i - 1])) && !("+-*".includes(splitted[i]))) {
				queue.add((splitted.slice(0, i).concat("+").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("-").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("*").concat(splitted.slice(i))).join(""));
				//				queue.add((splitted.slice(0, i).concat("*-").concat(splitted.slice(i))).join(""));
			}
		}
	}
	let zeroes = Array.from(queue) //.concat(Array.from(queue).map(x => "-".concat(x)));
	for (let i = 0; i < 10; i++) {
		zeroes = zeroes.filter(x => !x.includes("+0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("-0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("*0".concat(i.toString())));
		zeroes = zeroes.filter(x => x.substring(0, 1) != "0" || "+-*".includes(x.substring(1, 2)));
	}
	return zeroes.filter(x => eval(x) == data[1]);
}