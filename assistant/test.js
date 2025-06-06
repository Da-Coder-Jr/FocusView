const assert = require('assert');
assert.strictEqual(Buffer.byteLength(require('crypto').randomBytes(8)), 8);
console.log('basic test passed');
