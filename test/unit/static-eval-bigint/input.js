// Regression test: the loader tracks `counter = null` as a known binding
// value, and previously crashed statically evaluating `counter + 1n`
// ("TypeError: Cannot mix BigInt and other types") instead of treating
// the expression as not statically computable.
// Pattern from dd-trace's packages/dd-trace/src/appsec/downstream_requests.js.
const KNUTH_FACTOR = 11400714819323199488n;
const UINT64_MAX = (1n << 64n) - 1n;

let counter;

function enable () {
  counter = 0n;
}

function disable () {
  counter = null;
}

function next () {
  counter = (counter + 1n) & UINT64_MAX;
  return (counter * KNUTH_FACTOR) % UINT64_MAX;
}

// unary + on a known BigInt binding previously threw
// "Cannot convert a BigInt value to a number"
const coerced = +KNUTH_FACTOR ? 1 : 0;

module.exports = { enable, disable, next, coerced };
