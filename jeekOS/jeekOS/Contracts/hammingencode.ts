function hammingencode(data) {
	let answer = [];

	// Convert the data to a bit array. Can't use & due to data possibly being larger than a 32-bit int.
	let encoded = [];
	let remaining = data;
	while (remaining > 0) {
		encoded = [remaining % 2].concat(encoded);
		remaining = Math.floor((remaining - remaining % 2) / 2 + .4);
	}

	// Set up the answer array, skipping over the entries with an index that is a power of 2, as they'll be the parity bits
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let a_i = 0; let e_i = 0;
	for (let e_i = 0; e_i < encoded.length; e_i++) {
		a_i += 1;
		while (powersoftwo.includes(a_i)) {
			a_i += 1;
		}
		answer[a_i] = encoded[e_i];
	}

	// Calculate the parity bits
	for (let i of powersoftwo.filter(x => x < answer.length)) {
		// Generate a list of indexes from 0 to answer.length-1
		answer[i] = (new Array(answer.length)).fill(0).map((_, i) => i);
		// Keep only the indexes that share a bit with i, which is a power of 2
		answer[i] = answer[i].filter(x => x > i && (i & x));
		// Map the indexes onto the values the represent
		answer[i] = answer[i].map(x => answer[x]);
		// Bitwise XOR reduction to a single value
		answer[i] = answer[i].reduce((a, b) => a ^ b, 0);
	}

	// Calculate the final parity bit and send it home
	answer[0] = answer.slice(1).reduce((a, b) => a ^ b);
	return answer.map(x => x.toString()).join("");
}