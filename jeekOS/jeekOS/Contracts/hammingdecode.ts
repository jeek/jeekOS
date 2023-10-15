function hammingdecode(data) {
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let badbits = [];
	for (let i of powersoftwo.filter(x => x < data.length)) {
		let checksum = (new Array(data.length)).fill(0).map((_, i) => i).filter(x => x > i && (i & x)).map(x => parseInt(data.substring(x, x + 1))).reduce((a, b) => a ^ b);
		if (parseInt(data.substring(i, i + 1)) != checksum) {
			badbits.push(i);
		}
	}
	if (badbits.length == 0) { // No error in the data
		let checksum = data.substring(1).split("").map(x => parseInt(x)).reduce((a, b) => a ^ b);
		if (checksum == parseInt(data.substring(0, 1))) {
			let number = data.split("").map(x => parseInt(x));
			for (let i of powersoftwo.filter(x => x < data.length).reverse()) {
				number.splice(i, 1);
			}
			number.splice(0, 1);
			return number.reduce((a, b) => a * 2 + b);
		}
	}
	let badindex = badbits.reduce((a, b) => a | b, 0);
	return hammingdecode(data.substring(0, badindex).concat(data.substring(badindex, badindex + 1) == "0" ? "1" : "0").concat(data.substring(badindex + 1)));
}