var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/tweetnacl/nacl-fast.js
var require_nacl_fast = __commonJS({
  "node_modules/tweetnacl/nacl-fast.js"(exports, module) {
    (function(nacl) {
      "use strict";
      var gf = function(init) {
        var i, r = new Float64Array(16);
        if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
        return r;
      };
      var randombytes = function() {
        throw new Error("no PRNG");
      };
      var _0 = new Uint8Array(16);
      var _9 = new Uint8Array(32);
      _9[0] = 9;
      var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D2 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
      function ts64(x, i, h, l) {
        x[i] = h >> 24 & 255;
        x[i + 1] = h >> 16 & 255;
        x[i + 2] = h >> 8 & 255;
        x[i + 3] = h & 255;
        x[i + 4] = l >> 24 & 255;
        x[i + 5] = l >> 16 & 255;
        x[i + 6] = l >> 8 & 255;
        x[i + 7] = l & 255;
      }
      function vn(x, xi, y, yi, n) {
        var i, d = 0;
        for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
        return (1 & d - 1 >>> 8) - 1;
      }
      function crypto_verify_16(x, xi, y, yi) {
        return vn(x, xi, y, yi, 16);
      }
      function crypto_verify_32(x, xi, y, yi) {
        return vn(x, xi, y, yi, 32);
      }
      function core_salsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        x0 = x0 + j0 | 0;
        x1 = x1 + j1 | 0;
        x2 = x2 + j2 | 0;
        x3 = x3 + j3 | 0;
        x4 = x4 + j4 | 0;
        x5 = x5 + j5 | 0;
        x6 = x6 + j6 | 0;
        x7 = x7 + j7 | 0;
        x8 = x8 + j8 | 0;
        x9 = x9 + j9 | 0;
        x10 = x10 + j10 | 0;
        x11 = x11 + j11 | 0;
        x12 = x12 + j12 | 0;
        x13 = x13 + j13 | 0;
        x14 = x14 + j14 | 0;
        x15 = x15 + j15 | 0;
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x1 >>> 0 & 255;
        o[5] = x1 >>> 8 & 255;
        o[6] = x1 >>> 16 & 255;
        o[7] = x1 >>> 24 & 255;
        o[8] = x2 >>> 0 & 255;
        o[9] = x2 >>> 8 & 255;
        o[10] = x2 >>> 16 & 255;
        o[11] = x2 >>> 24 & 255;
        o[12] = x3 >>> 0 & 255;
        o[13] = x3 >>> 8 & 255;
        o[14] = x3 >>> 16 & 255;
        o[15] = x3 >>> 24 & 255;
        o[16] = x4 >>> 0 & 255;
        o[17] = x4 >>> 8 & 255;
        o[18] = x4 >>> 16 & 255;
        o[19] = x4 >>> 24 & 255;
        o[20] = x5 >>> 0 & 255;
        o[21] = x5 >>> 8 & 255;
        o[22] = x5 >>> 16 & 255;
        o[23] = x5 >>> 24 & 255;
        o[24] = x6 >>> 0 & 255;
        o[25] = x6 >>> 8 & 255;
        o[26] = x6 >>> 16 & 255;
        o[27] = x6 >>> 24 & 255;
        o[28] = x7 >>> 0 & 255;
        o[29] = x7 >>> 8 & 255;
        o[30] = x7 >>> 16 & 255;
        o[31] = x7 >>> 24 & 255;
        o[32] = x8 >>> 0 & 255;
        o[33] = x8 >>> 8 & 255;
        o[34] = x8 >>> 16 & 255;
        o[35] = x8 >>> 24 & 255;
        o[36] = x9 >>> 0 & 255;
        o[37] = x9 >>> 8 & 255;
        o[38] = x9 >>> 16 & 255;
        o[39] = x9 >>> 24 & 255;
        o[40] = x10 >>> 0 & 255;
        o[41] = x10 >>> 8 & 255;
        o[42] = x10 >>> 16 & 255;
        o[43] = x10 >>> 24 & 255;
        o[44] = x11 >>> 0 & 255;
        o[45] = x11 >>> 8 & 255;
        o[46] = x11 >>> 16 & 255;
        o[47] = x11 >>> 24 & 255;
        o[48] = x12 >>> 0 & 255;
        o[49] = x12 >>> 8 & 255;
        o[50] = x12 >>> 16 & 255;
        o[51] = x12 >>> 24 & 255;
        o[52] = x13 >>> 0 & 255;
        o[53] = x13 >>> 8 & 255;
        o[54] = x13 >>> 16 & 255;
        o[55] = x13 >>> 24 & 255;
        o[56] = x14 >>> 0 & 255;
        o[57] = x14 >>> 8 & 255;
        o[58] = x14 >>> 16 & 255;
        o[59] = x14 >>> 24 & 255;
        o[60] = x15 >>> 0 & 255;
        o[61] = x15 >>> 8 & 255;
        o[62] = x15 >>> 16 & 255;
        o[63] = x15 >>> 24 & 255;
      }
      function core_hsalsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x5 >>> 0 & 255;
        o[5] = x5 >>> 8 & 255;
        o[6] = x5 >>> 16 & 255;
        o[7] = x5 >>> 24 & 255;
        o[8] = x10 >>> 0 & 255;
        o[9] = x10 >>> 8 & 255;
        o[10] = x10 >>> 16 & 255;
        o[11] = x10 >>> 24 & 255;
        o[12] = x15 >>> 0 & 255;
        o[13] = x15 >>> 8 & 255;
        o[14] = x15 >>> 16 & 255;
        o[15] = x15 >>> 24 & 255;
        o[16] = x6 >>> 0 & 255;
        o[17] = x6 >>> 8 & 255;
        o[18] = x6 >>> 16 & 255;
        o[19] = x6 >>> 24 & 255;
        o[20] = x7 >>> 0 & 255;
        o[21] = x7 >>> 8 & 255;
        o[22] = x7 >>> 16 & 255;
        o[23] = x7 >>> 24 & 255;
        o[24] = x8 >>> 0 & 255;
        o[25] = x8 >>> 8 & 255;
        o[26] = x8 >>> 16 & 255;
        o[27] = x8 >>> 24 & 255;
        o[28] = x9 >>> 0 & 255;
        o[29] = x9 >>> 8 & 255;
        o[30] = x9 >>> 16 & 255;
        o[31] = x9 >>> 24 & 255;
      }
      function crypto_core_salsa20(out, inp, k, c) {
        core_salsa20(out, inp, k, c);
      }
      function crypto_core_hsalsa20(out, inp, k, c) {
        core_hsalsa20(out, inp, k, c);
      }
      var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
      function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
          mpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
        }
        return 0;
      }
      function crypto_stream_salsa20(c, cpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = x[i];
        }
        return 0;
      }
      function crypto_stream(c, cpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20(c, cpos, d, sn, s);
      }
      function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
      }
      var poly1305 = function(key) {
        this.buffer = new Uint8Array(16);
        this.r = new Uint16Array(10);
        this.h = new Uint16Array(10);
        this.pad = new Uint16Array(8);
        this.leftover = 0;
        this.fin = 0;
        var t0, t1, t2, t3, t4, t5, t6, t7;
        t0 = key[0] & 255 | (key[1] & 255) << 8;
        this.r[0] = t0 & 8191;
        t1 = key[2] & 255 | (key[3] & 255) << 8;
        this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
        t2 = key[4] & 255 | (key[5] & 255) << 8;
        this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
        t3 = key[6] & 255 | (key[7] & 255) << 8;
        this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
        t4 = key[8] & 255 | (key[9] & 255) << 8;
        this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
        this.r[5] = t4 >>> 1 & 8190;
        t5 = key[10] & 255 | (key[11] & 255) << 8;
        this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
        t6 = key[12] & 255 | (key[13] & 255) << 8;
        this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
        t7 = key[14] & 255 | (key[15] & 255) << 8;
        this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
        this.r[9] = t7 >>> 5 & 127;
        this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
        this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
        this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
        this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
        this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
        this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
        this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
        this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
      };
      poly1305.prototype.blocks = function(m, mpos, bytes) {
        var hibit = this.fin ? 0 : 1 << 11;
        var t0, t1, t2, t3, t4, t5, t6, t7, c;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
        var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
        var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
        while (bytes >= 16) {
          t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
          h0 += t0 & 8191;
          t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
          h1 += (t0 >>> 13 | t1 << 3) & 8191;
          t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
          h2 += (t1 >>> 10 | t2 << 6) & 8191;
          t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
          h3 += (t2 >>> 7 | t3 << 9) & 8191;
          t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
          h4 += (t3 >>> 4 | t4 << 12) & 8191;
          h5 += t4 >>> 1 & 8191;
          t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
          h6 += (t4 >>> 14 | t5 << 2) & 8191;
          t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
          h7 += (t5 >>> 11 | t6 << 5) & 8191;
          t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
          h8 += (t6 >>> 8 | t7 << 8) & 8191;
          h9 += t7 >>> 5 | hibit;
          c = 0;
          d0 = c;
          d0 += h0 * r0;
          d0 += h1 * (5 * r9);
          d0 += h2 * (5 * r8);
          d0 += h3 * (5 * r7);
          d0 += h4 * (5 * r6);
          c = d0 >>> 13;
          d0 &= 8191;
          d0 += h5 * (5 * r5);
          d0 += h6 * (5 * r4);
          d0 += h7 * (5 * r3);
          d0 += h8 * (5 * r2);
          d0 += h9 * (5 * r1);
          c += d0 >>> 13;
          d0 &= 8191;
          d1 = c;
          d1 += h0 * r1;
          d1 += h1 * r0;
          d1 += h2 * (5 * r9);
          d1 += h3 * (5 * r8);
          d1 += h4 * (5 * r7);
          c = d1 >>> 13;
          d1 &= 8191;
          d1 += h5 * (5 * r6);
          d1 += h6 * (5 * r5);
          d1 += h7 * (5 * r4);
          d1 += h8 * (5 * r3);
          d1 += h9 * (5 * r2);
          c += d1 >>> 13;
          d1 &= 8191;
          d2 = c;
          d2 += h0 * r2;
          d2 += h1 * r1;
          d2 += h2 * r0;
          d2 += h3 * (5 * r9);
          d2 += h4 * (5 * r8);
          c = d2 >>> 13;
          d2 &= 8191;
          d2 += h5 * (5 * r7);
          d2 += h6 * (5 * r6);
          d2 += h7 * (5 * r5);
          d2 += h8 * (5 * r4);
          d2 += h9 * (5 * r3);
          c += d2 >>> 13;
          d2 &= 8191;
          d3 = c;
          d3 += h0 * r3;
          d3 += h1 * r2;
          d3 += h2 * r1;
          d3 += h3 * r0;
          d3 += h4 * (5 * r9);
          c = d3 >>> 13;
          d3 &= 8191;
          d3 += h5 * (5 * r8);
          d3 += h6 * (5 * r7);
          d3 += h7 * (5 * r6);
          d3 += h8 * (5 * r5);
          d3 += h9 * (5 * r4);
          c += d3 >>> 13;
          d3 &= 8191;
          d4 = c;
          d4 += h0 * r4;
          d4 += h1 * r3;
          d4 += h2 * r2;
          d4 += h3 * r1;
          d4 += h4 * r0;
          c = d4 >>> 13;
          d4 &= 8191;
          d4 += h5 * (5 * r9);
          d4 += h6 * (5 * r8);
          d4 += h7 * (5 * r7);
          d4 += h8 * (5 * r6);
          d4 += h9 * (5 * r5);
          c += d4 >>> 13;
          d4 &= 8191;
          d5 = c;
          d5 += h0 * r5;
          d5 += h1 * r4;
          d5 += h2 * r3;
          d5 += h3 * r2;
          d5 += h4 * r1;
          c = d5 >>> 13;
          d5 &= 8191;
          d5 += h5 * r0;
          d5 += h6 * (5 * r9);
          d5 += h7 * (5 * r8);
          d5 += h8 * (5 * r7);
          d5 += h9 * (5 * r6);
          c += d5 >>> 13;
          d5 &= 8191;
          d6 = c;
          d6 += h0 * r6;
          d6 += h1 * r5;
          d6 += h2 * r4;
          d6 += h3 * r3;
          d6 += h4 * r2;
          c = d6 >>> 13;
          d6 &= 8191;
          d6 += h5 * r1;
          d6 += h6 * r0;
          d6 += h7 * (5 * r9);
          d6 += h8 * (5 * r8);
          d6 += h9 * (5 * r7);
          c += d6 >>> 13;
          d6 &= 8191;
          d7 = c;
          d7 += h0 * r7;
          d7 += h1 * r6;
          d7 += h2 * r5;
          d7 += h3 * r4;
          d7 += h4 * r3;
          c = d7 >>> 13;
          d7 &= 8191;
          d7 += h5 * r2;
          d7 += h6 * r1;
          d7 += h7 * r0;
          d7 += h8 * (5 * r9);
          d7 += h9 * (5 * r8);
          c += d7 >>> 13;
          d7 &= 8191;
          d8 = c;
          d8 += h0 * r8;
          d8 += h1 * r7;
          d8 += h2 * r6;
          d8 += h3 * r5;
          d8 += h4 * r4;
          c = d8 >>> 13;
          d8 &= 8191;
          d8 += h5 * r3;
          d8 += h6 * r2;
          d8 += h7 * r1;
          d8 += h8 * r0;
          d8 += h9 * (5 * r9);
          c += d8 >>> 13;
          d8 &= 8191;
          d9 = c;
          d9 += h0 * r9;
          d9 += h1 * r8;
          d9 += h2 * r7;
          d9 += h3 * r6;
          d9 += h4 * r5;
          c = d9 >>> 13;
          d9 &= 8191;
          d9 += h5 * r4;
          d9 += h6 * r3;
          d9 += h7 * r2;
          d9 += h8 * r1;
          d9 += h9 * r0;
          c += d9 >>> 13;
          d9 &= 8191;
          c = (c << 2) + c | 0;
          c = c + d0 | 0;
          d0 = c & 8191;
          c = c >>> 13;
          d1 += c;
          h0 = d0;
          h1 = d1;
          h2 = d2;
          h3 = d3;
          h4 = d4;
          h5 = d5;
          h6 = d6;
          h7 = d7;
          h8 = d8;
          h9 = d9;
          mpos += 16;
          bytes -= 16;
        }
        this.h[0] = h0;
        this.h[1] = h1;
        this.h[2] = h2;
        this.h[3] = h3;
        this.h[4] = h4;
        this.h[5] = h5;
        this.h[6] = h6;
        this.h[7] = h7;
        this.h[8] = h8;
        this.h[9] = h9;
      };
      poly1305.prototype.finish = function(mac, macpos) {
        var g = new Uint16Array(10);
        var c, mask, f, i;
        if (this.leftover) {
          i = this.leftover;
          this.buffer[i++] = 1;
          for (; i < 16; i++) this.buffer[i] = 0;
          this.fin = 1;
          this.blocks(this.buffer, 0, 16);
        }
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        for (i = 2; i < 10; i++) {
          this.h[i] += c;
          c = this.h[i] >>> 13;
          this.h[i] &= 8191;
        }
        this.h[0] += c * 5;
        c = this.h[0] >>> 13;
        this.h[0] &= 8191;
        this.h[1] += c;
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        this.h[2] += c;
        g[0] = this.h[0] + 5;
        c = g[0] >>> 13;
        g[0] &= 8191;
        for (i = 1; i < 10; i++) {
          g[i] = this.h[i] + c;
          c = g[i] >>> 13;
          g[i] &= 8191;
        }
        g[9] -= 1 << 13;
        mask = (c ^ 1) - 1;
        for (i = 0; i < 10; i++) g[i] &= mask;
        mask = ~mask;
        for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
        this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
        this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
        this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
        this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
        this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
        this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
        this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
        this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
        f = this.h[0] + this.pad[0];
        this.h[0] = f & 65535;
        for (i = 1; i < 8; i++) {
          f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
          this.h[i] = f & 65535;
        }
        mac[macpos + 0] = this.h[0] >>> 0 & 255;
        mac[macpos + 1] = this.h[0] >>> 8 & 255;
        mac[macpos + 2] = this.h[1] >>> 0 & 255;
        mac[macpos + 3] = this.h[1] >>> 8 & 255;
        mac[macpos + 4] = this.h[2] >>> 0 & 255;
        mac[macpos + 5] = this.h[2] >>> 8 & 255;
        mac[macpos + 6] = this.h[3] >>> 0 & 255;
        mac[macpos + 7] = this.h[3] >>> 8 & 255;
        mac[macpos + 8] = this.h[4] >>> 0 & 255;
        mac[macpos + 9] = this.h[4] >>> 8 & 255;
        mac[macpos + 10] = this.h[5] >>> 0 & 255;
        mac[macpos + 11] = this.h[5] >>> 8 & 255;
        mac[macpos + 12] = this.h[6] >>> 0 & 255;
        mac[macpos + 13] = this.h[6] >>> 8 & 255;
        mac[macpos + 14] = this.h[7] >>> 0 & 255;
        mac[macpos + 15] = this.h[7] >>> 8 & 255;
      };
      poly1305.prototype.update = function(m, mpos, bytes) {
        var i, want;
        if (this.leftover) {
          want = 16 - this.leftover;
          if (want > bytes)
            want = bytes;
          for (i = 0; i < want; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          bytes -= want;
          mpos += want;
          this.leftover += want;
          if (this.leftover < 16)
            return;
          this.blocks(this.buffer, 0, 16);
          this.leftover = 0;
        }
        if (bytes >= 16) {
          want = bytes - bytes % 16;
          this.blocks(m, mpos, want);
          mpos += want;
          bytes -= want;
        }
        if (bytes) {
          for (i = 0; i < bytes; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          this.leftover += bytes;
        }
      };
      function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
        var s = new poly1305(k);
        s.update(m, mpos, n);
        s.finish(out, outpos);
        return 0;
      }
      function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
        var x = new Uint8Array(16);
        crypto_onetimeauth(x, 0, m, mpos, n, k);
        return crypto_verify_16(h, hpos, x, 0);
      }
      function crypto_secretbox(c, m, d, n, k) {
        var i;
        if (d < 32) return -1;
        crypto_stream_xor(c, 0, m, 0, d, n, k);
        crypto_onetimeauth(c, 16, c, 32, d - 32, c);
        for (i = 0; i < 16; i++) c[i] = 0;
        return 0;
      }
      function crypto_secretbox_open(m, c, d, n, k) {
        var i;
        var x = new Uint8Array(32);
        if (d < 32) return -1;
        crypto_stream(x, 0, 32, n, k);
        if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
        crypto_stream_xor(m, 0, c, 0, d, n, k);
        for (i = 0; i < 32; i++) m[i] = 0;
        return 0;
      }
      function set25519(r, a) {
        var i;
        for (i = 0; i < 16; i++) r[i] = a[i] | 0;
      }
      function car25519(o) {
        var i, v, c = 1;
        for (i = 0; i < 16; i++) {
          v = o[i] + c + 65535;
          c = Math.floor(v / 65536);
          o[i] = v - c * 65536;
        }
        o[0] += c - 1 + 37 * (c - 1);
      }
      function sel25519(p, q, b) {
        var t, c = ~(b - 1);
        for (var i = 0; i < 16; i++) {
          t = c & (p[i] ^ q[i]);
          p[i] ^= t;
          q[i] ^= t;
        }
      }
      function pack25519(o, n) {
        var i, j, b;
        var m = gf(), t = gf();
        for (i = 0; i < 16; i++) t[i] = n[i];
        car25519(t);
        car25519(t);
        car25519(t);
        for (j = 0; j < 2; j++) {
          m[0] = t[0] - 65517;
          for (i = 1; i < 15; i++) {
            m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
            m[i - 1] &= 65535;
          }
          m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
          b = m[15] >> 16 & 1;
          m[14] &= 65535;
          sel25519(t, m, 1 - b);
        }
        for (i = 0; i < 16; i++) {
          o[2 * i] = t[i] & 255;
          o[2 * i + 1] = t[i] >> 8;
        }
      }
      function neq25519(a, b) {
        var c = new Uint8Array(32), d = new Uint8Array(32);
        pack25519(c, a);
        pack25519(d, b);
        return crypto_verify_32(c, 0, d, 0);
      }
      function par25519(a) {
        var d = new Uint8Array(32);
        pack25519(d, a);
        return d[0] & 1;
      }
      function unpack25519(o, n) {
        var i;
        for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
        o[15] &= 32767;
      }
      function A(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
      }
      function Z(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
      }
      function M(o, a, b) {
        var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
        v = a[0];
        t0 += v * b0;
        t1 += v * b1;
        t2 += v * b2;
        t3 += v * b3;
        t4 += v * b4;
        t5 += v * b5;
        t6 += v * b6;
        t7 += v * b7;
        t8 += v * b8;
        t9 += v * b9;
        t10 += v * b10;
        t11 += v * b11;
        t12 += v * b12;
        t13 += v * b13;
        t14 += v * b14;
        t15 += v * b15;
        v = a[1];
        t1 += v * b0;
        t2 += v * b1;
        t3 += v * b2;
        t4 += v * b3;
        t5 += v * b4;
        t6 += v * b5;
        t7 += v * b6;
        t8 += v * b7;
        t9 += v * b8;
        t10 += v * b9;
        t11 += v * b10;
        t12 += v * b11;
        t13 += v * b12;
        t14 += v * b13;
        t15 += v * b14;
        t16 += v * b15;
        v = a[2];
        t2 += v * b0;
        t3 += v * b1;
        t4 += v * b2;
        t5 += v * b3;
        t6 += v * b4;
        t7 += v * b5;
        t8 += v * b6;
        t9 += v * b7;
        t10 += v * b8;
        t11 += v * b9;
        t12 += v * b10;
        t13 += v * b11;
        t14 += v * b12;
        t15 += v * b13;
        t16 += v * b14;
        t17 += v * b15;
        v = a[3];
        t3 += v * b0;
        t4 += v * b1;
        t5 += v * b2;
        t6 += v * b3;
        t7 += v * b4;
        t8 += v * b5;
        t9 += v * b6;
        t10 += v * b7;
        t11 += v * b8;
        t12 += v * b9;
        t13 += v * b10;
        t14 += v * b11;
        t15 += v * b12;
        t16 += v * b13;
        t17 += v * b14;
        t18 += v * b15;
        v = a[4];
        t4 += v * b0;
        t5 += v * b1;
        t6 += v * b2;
        t7 += v * b3;
        t8 += v * b4;
        t9 += v * b5;
        t10 += v * b6;
        t11 += v * b7;
        t12 += v * b8;
        t13 += v * b9;
        t14 += v * b10;
        t15 += v * b11;
        t16 += v * b12;
        t17 += v * b13;
        t18 += v * b14;
        t19 += v * b15;
        v = a[5];
        t5 += v * b0;
        t6 += v * b1;
        t7 += v * b2;
        t8 += v * b3;
        t9 += v * b4;
        t10 += v * b5;
        t11 += v * b6;
        t12 += v * b7;
        t13 += v * b8;
        t14 += v * b9;
        t15 += v * b10;
        t16 += v * b11;
        t17 += v * b12;
        t18 += v * b13;
        t19 += v * b14;
        t20 += v * b15;
        v = a[6];
        t6 += v * b0;
        t7 += v * b1;
        t8 += v * b2;
        t9 += v * b3;
        t10 += v * b4;
        t11 += v * b5;
        t12 += v * b6;
        t13 += v * b7;
        t14 += v * b8;
        t15 += v * b9;
        t16 += v * b10;
        t17 += v * b11;
        t18 += v * b12;
        t19 += v * b13;
        t20 += v * b14;
        t21 += v * b15;
        v = a[7];
        t7 += v * b0;
        t8 += v * b1;
        t9 += v * b2;
        t10 += v * b3;
        t11 += v * b4;
        t12 += v * b5;
        t13 += v * b6;
        t14 += v * b7;
        t15 += v * b8;
        t16 += v * b9;
        t17 += v * b10;
        t18 += v * b11;
        t19 += v * b12;
        t20 += v * b13;
        t21 += v * b14;
        t22 += v * b15;
        v = a[8];
        t8 += v * b0;
        t9 += v * b1;
        t10 += v * b2;
        t11 += v * b3;
        t12 += v * b4;
        t13 += v * b5;
        t14 += v * b6;
        t15 += v * b7;
        t16 += v * b8;
        t17 += v * b9;
        t18 += v * b10;
        t19 += v * b11;
        t20 += v * b12;
        t21 += v * b13;
        t22 += v * b14;
        t23 += v * b15;
        v = a[9];
        t9 += v * b0;
        t10 += v * b1;
        t11 += v * b2;
        t12 += v * b3;
        t13 += v * b4;
        t14 += v * b5;
        t15 += v * b6;
        t16 += v * b7;
        t17 += v * b8;
        t18 += v * b9;
        t19 += v * b10;
        t20 += v * b11;
        t21 += v * b12;
        t22 += v * b13;
        t23 += v * b14;
        t24 += v * b15;
        v = a[10];
        t10 += v * b0;
        t11 += v * b1;
        t12 += v * b2;
        t13 += v * b3;
        t14 += v * b4;
        t15 += v * b5;
        t16 += v * b6;
        t17 += v * b7;
        t18 += v * b8;
        t19 += v * b9;
        t20 += v * b10;
        t21 += v * b11;
        t22 += v * b12;
        t23 += v * b13;
        t24 += v * b14;
        t25 += v * b15;
        v = a[11];
        t11 += v * b0;
        t12 += v * b1;
        t13 += v * b2;
        t14 += v * b3;
        t15 += v * b4;
        t16 += v * b5;
        t17 += v * b6;
        t18 += v * b7;
        t19 += v * b8;
        t20 += v * b9;
        t21 += v * b10;
        t22 += v * b11;
        t23 += v * b12;
        t24 += v * b13;
        t25 += v * b14;
        t26 += v * b15;
        v = a[12];
        t12 += v * b0;
        t13 += v * b1;
        t14 += v * b2;
        t15 += v * b3;
        t16 += v * b4;
        t17 += v * b5;
        t18 += v * b6;
        t19 += v * b7;
        t20 += v * b8;
        t21 += v * b9;
        t22 += v * b10;
        t23 += v * b11;
        t24 += v * b12;
        t25 += v * b13;
        t26 += v * b14;
        t27 += v * b15;
        v = a[13];
        t13 += v * b0;
        t14 += v * b1;
        t15 += v * b2;
        t16 += v * b3;
        t17 += v * b4;
        t18 += v * b5;
        t19 += v * b6;
        t20 += v * b7;
        t21 += v * b8;
        t22 += v * b9;
        t23 += v * b10;
        t24 += v * b11;
        t25 += v * b12;
        t26 += v * b13;
        t27 += v * b14;
        t28 += v * b15;
        v = a[14];
        t14 += v * b0;
        t15 += v * b1;
        t16 += v * b2;
        t17 += v * b3;
        t18 += v * b4;
        t19 += v * b5;
        t20 += v * b6;
        t21 += v * b7;
        t22 += v * b8;
        t23 += v * b9;
        t24 += v * b10;
        t25 += v * b11;
        t26 += v * b12;
        t27 += v * b13;
        t28 += v * b14;
        t29 += v * b15;
        v = a[15];
        t15 += v * b0;
        t16 += v * b1;
        t17 += v * b2;
        t18 += v * b3;
        t19 += v * b4;
        t20 += v * b5;
        t21 += v * b6;
        t22 += v * b7;
        t23 += v * b8;
        t24 += v * b9;
        t25 += v * b10;
        t26 += v * b11;
        t27 += v * b12;
        t28 += v * b13;
        t29 += v * b14;
        t30 += v * b15;
        t0 += 38 * t16;
        t1 += 38 * t17;
        t2 += 38 * t18;
        t3 += 38 * t19;
        t4 += 38 * t20;
        t5 += 38 * t21;
        t6 += 38 * t22;
        t7 += 38 * t23;
        t8 += 38 * t24;
        t9 += 38 * t25;
        t10 += 38 * t26;
        t11 += 38 * t27;
        t12 += 38 * t28;
        t13 += 38 * t29;
        t14 += 38 * t30;
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        o[0] = t0;
        o[1] = t1;
        o[2] = t2;
        o[3] = t3;
        o[4] = t4;
        o[5] = t5;
        o[6] = t6;
        o[7] = t7;
        o[8] = t8;
        o[9] = t9;
        o[10] = t10;
        o[11] = t11;
        o[12] = t12;
        o[13] = t13;
        o[14] = t14;
        o[15] = t15;
      }
      function S(o, a) {
        M(o, a, a);
      }
      function inv25519(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 253; a >= 0; a--) {
          S(c, c);
          if (a !== 2 && a !== 4) M(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      function pow2523(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 250; a >= 0; a--) {
          S(c, c);
          if (a !== 1) M(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      function crypto_scalarmult(q, n, p) {
        var z = new Uint8Array(32);
        var x = new Float64Array(80), r, i;
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
        for (i = 0; i < 31; i++) z[i] = n[i];
        z[31] = n[31] & 127 | 64;
        z[0] &= 248;
        unpack25519(x, p);
        for (i = 0; i < 16; i++) {
          b[i] = x[i];
          d[i] = a[i] = c[i] = 0;
        }
        a[0] = d[0] = 1;
        for (i = 254; i >= 0; --i) {
          r = z[i >>> 3] >>> (i & 7) & 1;
          sel25519(a, b, r);
          sel25519(c, d, r);
          A(e, a, c);
          Z(a, a, c);
          A(c, b, d);
          Z(b, b, d);
          S(d, e);
          S(f, a);
          M(a, c, a);
          M(c, b, e);
          A(e, a, c);
          Z(a, a, c);
          S(b, a);
          Z(c, d, f);
          M(a, c, _121665);
          A(a, a, d);
          M(c, c, a);
          M(a, d, f);
          M(d, b, x);
          S(b, e);
          sel25519(a, b, r);
          sel25519(c, d, r);
        }
        for (i = 0; i < 16; i++) {
          x[i + 16] = a[i];
          x[i + 32] = c[i];
          x[i + 48] = b[i];
          x[i + 64] = d[i];
        }
        var x32 = x.subarray(32);
        var x16 = x.subarray(16);
        inv25519(x32, x32);
        M(x16, x16, x32);
        pack25519(q, x16);
        return 0;
      }
      function crypto_scalarmult_base(q, n) {
        return crypto_scalarmult(q, n, _9);
      }
      function crypto_box_keypair(y, x) {
        randombytes(x, 32);
        return crypto_scalarmult_base(y, x);
      }
      function crypto_box_beforenm(k, y, x) {
        var s = new Uint8Array(32);
        crypto_scalarmult(s, x, y);
        return crypto_core_hsalsa20(k, _0, s, sigma);
      }
      var crypto_box_afternm = crypto_secretbox;
      var crypto_box_open_afternm = crypto_secretbox_open;
      function crypto_box(c, m, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_afternm(c, m, d, n, k);
      }
      function crypto_box_open(m, c, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_open_afternm(m, c, d, n, k);
      }
      var K = [
        1116352408,
        3609767458,
        1899447441,
        602891725,
        3049323471,
        3964484399,
        3921009573,
        2173295548,
        961987163,
        4081628472,
        1508970993,
        3053834265,
        2453635748,
        2937671579,
        2870763221,
        3664609560,
        3624381080,
        2734883394,
        310598401,
        1164996542,
        607225278,
        1323610764,
        1426881987,
        3590304994,
        1925078388,
        4068182383,
        2162078206,
        991336113,
        2614888103,
        633803317,
        3248222580,
        3479774868,
        3835390401,
        2666613458,
        4022224774,
        944711139,
        264347078,
        2341262773,
        604807628,
        2007800933,
        770255983,
        1495990901,
        1249150122,
        1856431235,
        1555081692,
        3175218132,
        1996064986,
        2198950837,
        2554220882,
        3999719339,
        2821834349,
        766784016,
        2952996808,
        2566594879,
        3210313671,
        3203337956,
        3336571891,
        1034457026,
        3584528711,
        2466948901,
        113926993,
        3758326383,
        338241895,
        168717936,
        666307205,
        1188179964,
        773529912,
        1546045734,
        1294757372,
        1522805485,
        1396182291,
        2643833823,
        1695183700,
        2343527390,
        1986661051,
        1014477480,
        2177026350,
        1206759142,
        2456956037,
        344077627,
        2730485921,
        1290863460,
        2820302411,
        3158454273,
        3259730800,
        3505952657,
        3345764771,
        106217008,
        3516065817,
        3606008344,
        3600352804,
        1432725776,
        4094571909,
        1467031594,
        275423344,
        851169720,
        430227734,
        3100823752,
        506948616,
        1363258195,
        659060556,
        3750685593,
        883997877,
        3785050280,
        958139571,
        3318307427,
        1322822218,
        3812723403,
        1537002063,
        2003034995,
        1747873779,
        3602036899,
        1955562222,
        1575990012,
        2024104815,
        1125592928,
        2227730452,
        2716904306,
        2361852424,
        442776044,
        2428436474,
        593698344,
        2756734187,
        3733110249,
        3204031479,
        2999351573,
        3329325298,
        3815920427,
        3391569614,
        3928383900,
        3515267271,
        566280711,
        3940187606,
        3454069534,
        4118630271,
        4000239992,
        116418474,
        1914138554,
        174292421,
        2731055270,
        289380356,
        3203993006,
        460393269,
        320620315,
        685471733,
        587496836,
        852142971,
        1086792851,
        1017036298,
        365543100,
        1126000580,
        2618297676,
        1288033470,
        3409855158,
        1501505948,
        4234509866,
        1607167915,
        987167468,
        1816402316,
        1246189591
      ];
      function crypto_hashblocks_hl(hh, hl, m, n) {
        var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
        var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
        var pos = 0;
        while (n >= 128) {
          for (i = 0; i < 16; i++) {
            j = 8 * i + pos;
            wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
            wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
          }
          for (i = 0; i < 80; i++) {
            bh0 = ah0;
            bh1 = ah1;
            bh2 = ah2;
            bh3 = ah3;
            bh4 = ah4;
            bh5 = ah5;
            bh6 = ah6;
            bh7 = ah7;
            bl0 = al0;
            bl1 = al1;
            bl2 = al2;
            bl3 = al3;
            bl4 = al4;
            bl5 = al5;
            bl6 = al6;
            bl7 = al7;
            h = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
            l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = ah4 & ah5 ^ ~ah4 & ah6;
            l = al4 & al5 ^ ~al4 & al6;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = K[i * 2];
            l = K[i * 2 + 1];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = wh[i % 16];
            l = wl[i % 16];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            th = c & 65535 | d << 16;
            tl = a & 65535 | b << 16;
            h = th;
            l = tl;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
            l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
            l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh7 = c & 65535 | d << 16;
            bl7 = a & 65535 | b << 16;
            h = bh3;
            l = bl3;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = th;
            l = tl;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh3 = c & 65535 | d << 16;
            bl3 = a & 65535 | b << 16;
            ah1 = bh0;
            ah2 = bh1;
            ah3 = bh2;
            ah4 = bh3;
            ah5 = bh4;
            ah6 = bh5;
            ah7 = bh6;
            ah0 = bh7;
            al1 = bl0;
            al2 = bl1;
            al3 = bl2;
            al4 = bl3;
            al5 = bl4;
            al6 = bl5;
            al7 = bl6;
            al0 = bl7;
            if (i % 16 === 15) {
              for (j = 0; j < 16; j++) {
                h = wh[j];
                l = wl[j];
                a = l & 65535;
                b = l >>> 16;
                c = h & 65535;
                d = h >>> 16;
                h = wh[(j + 9) % 16];
                l = wl[(j + 9) % 16];
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                th = wh[(j + 1) % 16];
                tl = wl[(j + 1) % 16];
                h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                th = wh[(j + 14) % 16];
                tl = wl[(j + 14) % 16];
                h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                wh[j] = c & 65535 | d << 16;
                wl[j] = a & 65535 | b << 16;
              }
            }
          }
          h = ah0;
          l = al0;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[0];
          l = hl[0];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[0] = ah0 = c & 65535 | d << 16;
          hl[0] = al0 = a & 65535 | b << 16;
          h = ah1;
          l = al1;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[1];
          l = hl[1];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[1] = ah1 = c & 65535 | d << 16;
          hl[1] = al1 = a & 65535 | b << 16;
          h = ah2;
          l = al2;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[2];
          l = hl[2];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[2] = ah2 = c & 65535 | d << 16;
          hl[2] = al2 = a & 65535 | b << 16;
          h = ah3;
          l = al3;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[3];
          l = hl[3];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[3] = ah3 = c & 65535 | d << 16;
          hl[3] = al3 = a & 65535 | b << 16;
          h = ah4;
          l = al4;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[4];
          l = hl[4];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[4] = ah4 = c & 65535 | d << 16;
          hl[4] = al4 = a & 65535 | b << 16;
          h = ah5;
          l = al5;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[5];
          l = hl[5];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[5] = ah5 = c & 65535 | d << 16;
          hl[5] = al5 = a & 65535 | b << 16;
          h = ah6;
          l = al6;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[6];
          l = hl[6];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[6] = ah6 = c & 65535 | d << 16;
          hl[6] = al6 = a & 65535 | b << 16;
          h = ah7;
          l = al7;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[7];
          l = hl[7];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[7] = ah7 = c & 65535 | d << 16;
          hl[7] = al7 = a & 65535 | b << 16;
          pos += 128;
          n -= 128;
        }
        return n;
      }
      function crypto_hash(out, m, n) {
        var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
        hh[0] = 1779033703;
        hh[1] = 3144134277;
        hh[2] = 1013904242;
        hh[3] = 2773480762;
        hh[4] = 1359893119;
        hh[5] = 2600822924;
        hh[6] = 528734635;
        hh[7] = 1541459225;
        hl[0] = 4089235720;
        hl[1] = 2227873595;
        hl[2] = 4271175723;
        hl[3] = 1595750129;
        hl[4] = 2917565137;
        hl[5] = 725511199;
        hl[6] = 4215389547;
        hl[7] = 327033209;
        crypto_hashblocks_hl(hh, hl, m, n);
        n %= 128;
        for (i = 0; i < n; i++) x[i] = m[b - n + i];
        x[n] = 128;
        n = 256 - 128 * (n < 112 ? 1 : 0);
        x[n - 9] = 0;
        ts64(x, n - 8, b / 536870912 | 0, b << 3);
        crypto_hashblocks_hl(hh, hl, x, n);
        for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
        return 0;
      }
      function add(p, q) {
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
        Z(a, p[1], p[0]);
        Z(t, q[1], q[0]);
        M(a, a, t);
        A(b, p[0], p[1]);
        A(t, q[0], q[1]);
        M(b, b, t);
        M(c, p[3], q[3]);
        M(c, c, D2);
        M(d, p[2], q[2]);
        A(d, d, d);
        Z(e, b, a);
        Z(f, d, c);
        A(g, d, c);
        A(h, b, a);
        M(p[0], e, f);
        M(p[1], h, g);
        M(p[2], g, f);
        M(p[3], e, h);
      }
      function cswap(p, q, b) {
        var i;
        for (i = 0; i < 4; i++) {
          sel25519(p[i], q[i], b);
        }
      }
      function pack(r, p) {
        var tx = gf(), ty = gf(), zi = gf();
        inv25519(zi, p[2]);
        M(tx, p[0], zi);
        M(ty, p[1], zi);
        pack25519(r, ty);
        r[31] ^= par25519(tx) << 7;
      }
      function scalarmult(p, q, s) {
        var b, i;
        set25519(p[0], gf0);
        set25519(p[1], gf1);
        set25519(p[2], gf1);
        set25519(p[3], gf0);
        for (i = 255; i >= 0; --i) {
          b = s[i / 8 | 0] >> (i & 7) & 1;
          cswap(p, q, b);
          add(q, p);
          add(p, p);
          cswap(p, q, b);
        }
      }
      function scalarbase(p, s) {
        var q = [gf(), gf(), gf(), gf()];
        set25519(q[0], X);
        set25519(q[1], Y);
        set25519(q[2], gf1);
        M(q[3], X, Y);
        scalarmult(p, q, s);
      }
      function crypto_sign_keypair(pk, sk, seeded) {
        var d = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()];
        var i;
        if (!seeded) randombytes(sk, 32);
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        scalarbase(p, d);
        pack(pk, p);
        for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
        return 0;
      }
      var L = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
      function modL(r, x) {
        var carry, i, j, k;
        for (i = 63; i >= 32; --i) {
          carry = 0;
          for (j = i - 32, k = i - 12; j < k; ++j) {
            x[j] += carry - 16 * x[i] * L[j - (i - 32)];
            carry = Math.floor((x[j] + 128) / 256);
            x[j] -= carry * 256;
          }
          x[j] += carry;
          x[i] = 0;
        }
        carry = 0;
        for (j = 0; j < 32; j++) {
          x[j] += carry - (x[31] >> 4) * L[j];
          carry = x[j] >> 8;
          x[j] &= 255;
        }
        for (j = 0; j < 32; j++) x[j] -= carry * L[j];
        for (i = 0; i < 32; i++) {
          x[i + 1] += x[i] >> 8;
          r[i] = x[i] & 255;
        }
      }
      function reduce(r) {
        var x = new Float64Array(64), i;
        for (i = 0; i < 64; i++) x[i] = r[i];
        for (i = 0; i < 64; i++) r[i] = 0;
        modL(r, x);
      }
      function crypto_sign(sm, m, n, sk) {
        var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
        var i, j, x = new Float64Array(64);
        var p = [gf(), gf(), gf(), gf()];
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        var smlen = n + 64;
        for (i = 0; i < n; i++) sm[64 + i] = m[i];
        for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
        crypto_hash(r, sm.subarray(32), n + 32);
        reduce(r);
        scalarbase(p, r);
        pack(sm, p);
        for (i = 32; i < 64; i++) sm[i] = sk[i];
        crypto_hash(h, sm, n + 64);
        reduce(h);
        for (i = 0; i < 64; i++) x[i] = 0;
        for (i = 0; i < 32; i++) x[i] = r[i];
        for (i = 0; i < 32; i++) {
          for (j = 0; j < 32; j++) {
            x[i + j] += h[i] * d[j];
          }
        }
        modL(sm.subarray(32), x);
        return smlen;
      }
      function unpackneg(r, p) {
        var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
        set25519(r[2], gf1);
        unpack25519(r[1], p);
        S(num, r[1]);
        M(den, num, D);
        Z(num, num, r[2]);
        A(den, r[2], den);
        S(den2, den);
        S(den4, den2);
        M(den6, den4, den2);
        M(t, den6, num);
        M(t, t, den);
        pow2523(t, t);
        M(t, t, num);
        M(t, t, den);
        M(t, t, den);
        M(r[0], t, den);
        S(chk, r[0]);
        M(chk, chk, den);
        if (neq25519(chk, num)) M(r[0], r[0], I);
        S(chk, r[0]);
        M(chk, chk, den);
        if (neq25519(chk, num)) return -1;
        if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
        M(r[3], r[0], r[1]);
        return 0;
      }
      function crypto_sign_open(m, sm, n, pk) {
        var i;
        var t = new Uint8Array(32), h = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
        if (n < 64) return -1;
        if (unpackneg(q, pk)) return -1;
        for (i = 0; i < n; i++) m[i] = sm[i];
        for (i = 0; i < 32; i++) m[i + 32] = pk[i];
        crypto_hash(h, m, n);
        reduce(h);
        scalarmult(p, q, h);
        scalarbase(q, sm.subarray(32));
        add(p, q);
        pack(t, p);
        n -= 64;
        if (crypto_verify_32(sm, 0, t, 0)) {
          for (i = 0; i < n; i++) m[i] = 0;
          return -1;
        }
        for (i = 0; i < n; i++) m[i] = sm[i + 64];
        return n;
      }
      var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
      nacl.lowlevel = {
        crypto_core_hsalsa20,
        crypto_stream_xor,
        crypto_stream,
        crypto_stream_salsa20_xor,
        crypto_stream_salsa20,
        crypto_onetimeauth,
        crypto_onetimeauth_verify,
        crypto_verify_16,
        crypto_verify_32,
        crypto_secretbox,
        crypto_secretbox_open,
        crypto_scalarmult,
        crypto_scalarmult_base,
        crypto_box_beforenm,
        crypto_box_afternm,
        crypto_box,
        crypto_box_open,
        crypto_box_keypair,
        crypto_hash,
        crypto_sign,
        crypto_sign_keypair,
        crypto_sign_open,
        crypto_secretbox_KEYBYTES,
        crypto_secretbox_NONCEBYTES,
        crypto_secretbox_ZEROBYTES,
        crypto_secretbox_BOXZEROBYTES,
        crypto_scalarmult_BYTES,
        crypto_scalarmult_SCALARBYTES,
        crypto_box_PUBLICKEYBYTES,
        crypto_box_SECRETKEYBYTES,
        crypto_box_BEFORENMBYTES,
        crypto_box_NONCEBYTES,
        crypto_box_ZEROBYTES,
        crypto_box_BOXZEROBYTES,
        crypto_sign_BYTES,
        crypto_sign_PUBLICKEYBYTES,
        crypto_sign_SECRETKEYBYTES,
        crypto_sign_SEEDBYTES,
        crypto_hash_BYTES,
        gf,
        D,
        L,
        pack25519,
        unpack25519,
        M,
        A,
        S,
        Z,
        pow2523,
        add,
        set25519,
        modL,
        scalarmult,
        scalarbase
      };
      function checkLengths(k, n) {
        if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
        if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
      }
      function checkBoxLengths(pk, sk) {
        if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
        if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
      }
      function checkArrayTypes() {
        for (var i = 0; i < arguments.length; i++) {
          if (!(arguments[i] instanceof Uint8Array))
            throw new TypeError("unexpected type, use Uint8Array");
        }
      }
      function cleanup(arr) {
        for (var i = 0; i < arr.length; i++) arr[i] = 0;
      }
      nacl.randomBytes = function(n) {
        var b = new Uint8Array(n);
        randombytes(b, n);
        return b;
      };
      nacl.secretbox = function(msg, nonce, key) {
        checkArrayTypes(msg, nonce, key);
        checkLengths(key, nonce);
        var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
        var c = new Uint8Array(m.length);
        for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
        crypto_secretbox(c, m, m.length, nonce, key);
        return c.subarray(crypto_secretbox_BOXZEROBYTES);
      };
      nacl.secretbox.open = function(box, nonce, key) {
        checkArrayTypes(box, nonce, key);
        checkLengths(key, nonce);
        var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
        var m = new Uint8Array(c.length);
        for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
        if (c.length < 32) return null;
        if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
        return m.subarray(crypto_secretbox_ZEROBYTES);
      };
      nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
      nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
      nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
      nacl.scalarMult = function(n, p) {
        checkArrayTypes(n, p);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult(q, n, p);
        return q;
      };
      nacl.scalarMult.base = function(n) {
        checkArrayTypes(n);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult_base(q, n);
        return q;
      };
      nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
      nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
      nacl.box = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox(msg, nonce, k);
      };
      nacl.box.before = function(publicKey, secretKey) {
        checkArrayTypes(publicKey, secretKey);
        checkBoxLengths(publicKey, secretKey);
        var k = new Uint8Array(crypto_box_BEFORENMBYTES);
        crypto_box_beforenm(k, publicKey, secretKey);
        return k;
      };
      nacl.box.after = nacl.secretbox;
      nacl.box.open = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox.open(msg, nonce, k);
      };
      nacl.box.open.after = nacl.secretbox.open;
      nacl.box.keyPair = function() {
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
        crypto_box_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.box.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_box_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        crypto_scalarmult_base(pk, secretKey);
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
      nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
      nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
      nacl.box.nonceLength = crypto_box_NONCEBYTES;
      nacl.box.overheadLength = nacl.secretbox.overheadLength;
      nacl.sign = function(msg, secretKey) {
        checkArrayTypes(msg, secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
        crypto_sign(signedMsg, msg, msg.length, secretKey);
        return signedMsg;
      };
      nacl.sign.open = function(signedMsg, publicKey) {
        checkArrayTypes(signedMsg, publicKey);
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var tmp = new Uint8Array(signedMsg.length);
        var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
        if (mlen < 0) return null;
        var m = new Uint8Array(mlen);
        for (var i = 0; i < m.length; i++) m[i] = tmp[i];
        return m;
      };
      nacl.sign.detached = function(msg, secretKey) {
        var signedMsg = nacl.sign(msg, secretKey);
        var sig = new Uint8Array(crypto_sign_BYTES);
        for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
        return sig;
      };
      nacl.sign.detached.verify = function(msg, sig, publicKey) {
        checkArrayTypes(msg, sig, publicKey);
        if (sig.length !== crypto_sign_BYTES)
          throw new Error("bad signature size");
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
        var m = new Uint8Array(crypto_sign_BYTES + msg.length);
        var i;
        for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
        for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
        return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
      };
      nacl.sign.keyPair = function() {
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        crypto_sign_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.sign.keyPair.fromSeed = function(seed) {
        checkArrayTypes(seed);
        if (seed.length !== crypto_sign_SEEDBYTES)
          throw new Error("bad seed size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        for (var i = 0; i < 32; i++) sk[i] = seed[i];
        crypto_sign_keypair(pk, sk, true);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
      nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
      nacl.sign.seedLength = crypto_sign_SEEDBYTES;
      nacl.sign.signatureLength = crypto_sign_BYTES;
      nacl.hash = function(msg) {
        checkArrayTypes(msg);
        var h = new Uint8Array(crypto_hash_BYTES);
        crypto_hash(h, msg, msg.length);
        return h;
      };
      nacl.hash.hashLength = crypto_hash_BYTES;
      nacl.verify = function(x, y) {
        checkArrayTypes(x, y);
        if (x.length === 0 || y.length === 0) return false;
        if (x.length !== y.length) return false;
        return vn(x, 0, y, 0, x.length) === 0 ? true : false;
      };
      nacl.setPRNG = function(fn) {
        randombytes = fn;
      };
      (function() {
        var crypto = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
        if (crypto && crypto.getRandomValues) {
          var QUOTA = 65536;
          nacl.setPRNG(function(x, n) {
            var i, v = new Uint8Array(n);
            for (i = 0; i < n; i += QUOTA) {
              crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
            }
            for (i = 0; i < n; i++) x[i] = v[i];
            cleanup(v);
          });
        } else if (typeof __require !== "undefined") {
          crypto = require_crypto();
          if (crypto && crypto.randomBytes) {
            nacl.setPRNG(function(x, n) {
              var i, v = crypto.randomBytes(n);
              for (i = 0; i < n; i++) x[i] = v[i];
              cleanup(v);
            });
          }
        }
      })();
    })(typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {});
  }
});

// node_modules/tweetnacl-util/nacl-util.js
var require_nacl_util = __commonJS({
  "node_modules/tweetnacl-util/nacl-util.js"(exports, module) {
    (function(root, f) {
      "use strict";
      if (typeof module !== "undefined" && module.exports) module.exports = f();
      else if (root.nacl) root.nacl.util = f();
      else {
        root.nacl = {};
        root.nacl.util = f();
      }
    })(exports, function() {
      "use strict";
      var util = {};
      function validateBase64(s) {
        if (!/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s)) {
          throw new TypeError("invalid encoding");
        }
      }
      util.decodeUTF8 = function(s) {
        if (typeof s !== "string") throw new TypeError("expected string");
        var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
        for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
        return b;
      };
      util.encodeUTF8 = function(arr) {
        var i, s = [];
        for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
        return decodeURIComponent(escape(s.join("")));
      };
      if (typeof atob === "undefined") {
        if (typeof Buffer.from !== "undefined") {
          util.encodeBase64 = function(arr) {
            return Buffer.from(arr).toString("base64");
          };
          util.decodeBase64 = function(s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, "base64"), 0));
          };
        } else {
          util.encodeBase64 = function(arr) {
            return new Buffer(arr).toString("base64");
          };
          util.decodeBase64 = function(s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(new Buffer(s, "base64"), 0));
          };
        }
      } else {
        util.encodeBase64 = function(arr) {
          var i, s = [], len = arr.length;
          for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
          return btoa(s.join(""));
        };
        util.decodeBase64 = function(s) {
          validateBase64(s);
          var i, d = atob(s), b = new Uint8Array(d.length);
          for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
          return b;
        };
      }
      return util;
    });
  }
});

// src/utils/event-emitter.js
var require_event_emitter = __commonJS({
  "src/utils/event-emitter.js"(exports, module) {
    var EventEmitter = class {
      constructor() {
        this.handlers = /* @__PURE__ */ new Map();
      }
      /**
       * Register a handler for an event name.
       * Multiple handlers per event are supported; order is registration order.
       *
       * @param {string} eventName
       * @param {Function} handler - Called with a single payload argument when {@link EventEmitter#emit} runs.
       */
      on(eventName, handler) {
        if (!this.handlers.has(eventName)) {
          this.handlers.set(eventName, /* @__PURE__ */ new Set());
        }
        this.handlers.get(eventName).add(handler);
      }
      /**
       * Remove a previously registered handler. No-op if the handler was not registered.
       *
       * @param {string} eventName
       * @param {Function} handler
       */
      off(eventName, handler) {
        const eventHandlers = this.handlers.get(eventName);
        if (!eventHandlers) {
          return;
        }
        eventHandlers.delete(handler);
        if (eventHandlers.size === 0) {
          this.handlers.delete(eventName);
        }
      }
      /**
       * Invoke all handlers registered for `eventName` with `payload`.
       * No-op when no handlers are registered.
       *
       * @param {string} eventName
       * @param {*} payload
       */
      emit(eventName, payload) {
        const eventHandlers = this.handlers.get(eventName);
        if (!eventHandlers) {
          return;
        }
        for (const handler of eventHandlers) {
          handler(payload);
        }
      }
    };
    module.exports = EventEmitter;
  }
});

// src/security/sloth-vdf.js
var require_sloth_vdf = __commonJS({
  "src/security/sloth-vdf.js"(exports, module) {
    var _SlothPermutation = class _SlothPermutation {
      fastPow(base, exponent, modulus) {
        if (modulus === BigInt(1)) {
          return BigInt(0);
        }
        let result = BigInt(1);
        let powBase = base % modulus;
        let powExponent = exponent;
        while (powExponent > 0) {
          if ((powExponent & BigInt(1)) === BigInt(1)) {
            result = result * powBase % modulus;
          }
          powExponent = powExponent >> BigInt(1);
          powBase = powBase * powBase % modulus;
        }
        return result;
      }
      quadRes(x) {
        return this.fastPow(x, _SlothPermutation.pHalf, _SlothPermutation.p) === BigInt(1);
      }
      modSqrtOp(x) {
        let y;
        let value = x;
        if (this.quadRes(value)) {
          y = this.fastPow(value, _SlothPermutation.pQuarter, _SlothPermutation.p);
        } else {
          value = (-value + _SlothPermutation.p) % _SlothPermutation.p;
          y = this.fastPow(value, _SlothPermutation.pQuarter, _SlothPermutation.p);
        }
        return y;
      }
      modOp(x, t) {
        let value = x % _SlothPermutation.p;
        for (let i = BigInt(0); i < t; i += BigInt(1)) {
          value = this.modSqrtOp(value);
        }
        return value;
      }
      modVerif(y, x, t) {
        const input = x % _SlothPermutation.p;
        let value = y;
        for (let i = BigInt(0); i < t; i += BigInt(1)) {
          value = value ** BigInt(2) % _SlothPermutation.p;
        }
        if (!this.quadRes(value)) {
          value = (-value + _SlothPermutation.p) % _SlothPermutation.p;
        }
        return input === value || (-input + _SlothPermutation.p) % _SlothPermutation.p === value;
      }
      generateProofVDF(t, x) {
        return this.modOp(x, t);
      }
      verifyProofVDF(t, x, y) {
        return this.modVerif(y, x, t);
      }
    };
    __publicField(_SlothPermutation, "p", BigInt(
      "170082004324204494273811327264862981553264701145937538369570764779791492622392118654022654452947093285873855529044371650895045691292912712699015605832276411308653107069798639938826015099738961427172366594187783204437869906954750443653318078358839409699824714551430573905637228307966826784684174483831608534979"
    ));
    // precompute values for optimization:
    // (p - 1) / 2
    __publicField(_SlothPermutation, "pHalf", _SlothPermutation.p - BigInt(1) >> BigInt(1));
    // (p + 1) / 4
    // p ≡ 3 (mod 4) ⇒ (p+1) divisible by 4
    __publicField(_SlothPermutation, "pQuarter", _SlothPermutation.p + BigInt(1) >> BigInt(2));
    var SlothPermutation = _SlothPermutation;
    module.exports = SlothPermutation;
  }
});

// src/security/vdf.js
var require_vdf = __commonJS({
  "src/security/vdf.js"(exports, module) {
    var SlothPermutation = require_sloth_vdf();
    var VDF = class {
      static async compute(challengeHex, steps) {
        const vdfInstance = new SlothPermutation();
        const challengeBigInt = BigInt(`0x${challengeHex}`);
        const result = vdfInstance.generateProofVDF(steps, challengeBigInt);
        return result.toString(16);
      }
      static async verify(challengeHex, steps, resultHex) {
        const vdfInstance = new SlothPermutation();
        const challengeBigInt = BigInt(`0x${challengeHex}`);
        const resultBigInt = BigInt(`0x${resultHex}`);
        return vdfInstance.verifyProofVDF(steps, challengeBigInt, resultBigInt);
      }
    };
    module.exports = VDF;
  }
});

// src/security/derive-key-pair.js
var require_derive_key_pair = __commonJS({
  "src/security/derive-key-pair.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var { deriveBroadcastKey, DEFAULT_SECURITY_OPTIONS } = require_message_security_service();
    var SIGNING_INFO = "dignity-signing-v1";
    var ENCRYPTION_INFO = "dignity-encryption-v1";
    var COLD_RECOVERY_INFO = "dignity-cold-recovery-v1";
    function utf8ToBytes(value) {
      return naclUtil.decodeUTF8(value);
    }
    function concatBytes(...parts) {
      const total = parts.reduce((sum, part) => sum + part.length, 0);
      const result = new Uint8Array(total);
      let offset = 0;
      for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
      }
      return result;
    }
    function buildColdRecoverySalt(username, pepper = "") {
      if (!username || typeof username !== "string") {
        throw new Error("deriveColdRecoverySigningKey requires username");
      }
      const segments = ["dignity-cold-recovery-v1"];
      if (pepper) {
        segments.push(pepper);
      }
      segments.push(username, COLD_RECOVERY_INFO);
      return utf8ToBytes(segments.join("\0"));
    }
    async function deriveColdRecoverySigningKey({
      username,
      coldPassword,
      pepper = "",
      kdfIterations
    } = {}) {
      if (!coldPassword || typeof coldPassword !== "string") {
        throw new Error("deriveColdRecoverySigningKey requires coldPassword");
      }
      const salt = buildColdRecoverySalt(username, pepper);
      const iterations = typeof kdfIterations === "number" ? kdfIterations : DEFAULT_SECURITY_OPTIONS.kdfIterations;
      const seed = await deriveBroadcastKey(coldPassword, salt, iterations);
      const signing = nacl.sign.keyPair.fromSeed(seed);
      return {
        signing,
        recoveryPublicKey: naclUtil.encodeBase64(signing.publicKey)
      };
    }
    function buildIdentitySalt(username, info, pepper = "", generation = 1) {
      if (!username || typeof username !== "string") {
        throw new Error("deriveKeyPairFromCredentials requires username");
      }
      if (!info || typeof info !== "string") {
        throw new Error("deriveKeyPairFromCredentials requires info label");
      }
      const normalizedGeneration = Number(generation);
      if (!Number.isInteger(normalizedGeneration) || normalizedGeneration < 1) {
        throw new Error("deriveKeyPairFromCredentials requires generation >= 1");
      }
      const segments = ["dignity-identity-v1"];
      if (pepper) {
        segments.push(pepper);
      }
      segments.push(username, `gen:${normalizedGeneration}`, info);
      return utf8ToBytes(segments.join("\0"));
    }
    async function deriveIdentitySeed({ password, username, info, pepper, generation, kdfIterations }) {
      if (!password || typeof password !== "string") {
        throw new Error("deriveKeyPairFromCredentials requires password");
      }
      const salt = buildIdentitySalt(username, info, pepper, generation);
      const iterations = typeof kdfIterations === "number" ? kdfIterations : DEFAULT_SECURITY_OPTIONS.kdfIterations;
      return deriveBroadcastKey(password, salt, iterations);
    }
    async function deriveKeyPairFromCredentials({
      username,
      password,
      pepper = "",
      generation = 1,
      kdfIterations
    } = {}) {
      const signingSeed = await deriveIdentitySeed({
        password,
        username,
        info: SIGNING_INFO,
        pepper,
        generation,
        kdfIterations
      });
      const encryptionSecret = await deriveIdentitySeed({
        password,
        username,
        info: ENCRYPTION_INFO,
        pepper,
        generation,
        kdfIterations
      });
      return {
        signing: nacl.sign.keyPair.fromSeed(signingSeed),
        encryption: nacl.box.keyPair.fromSecretKey(encryptionSecret),
        generation
      };
    }
    function keyPairToPublicBundle(keyPair) {
      return {
        signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
        encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
      };
    }
    module.exports = {
      deriveKeyPairFromCredentials,
      deriveColdRecoverySigningKey,
      keyPairToPublicBundle,
      buildIdentitySalt,
      buildColdRecoverySalt,
      SIGNING_INFO,
      ENCRYPTION_INFO,
      COLD_RECOVERY_INFO,
      concatBytes
    };
  }
});

// src/security/identity-rotation.js
var require_identity_rotation = __commonJS({
  "src/security/identity-rotation.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var { stableStringify } = require_message_security_service();
    var {
      deriveKeyPairFromCredentials,
      deriveColdRecoverySigningKey,
      keyPairToPublicBundle
    } = require_derive_key_pair();
    var ROTATION_TYPES = /* @__PURE__ */ new Set(["compromise-recovery", "password-change"]);
    function utf8ToBytes(value) {
      return naclUtil.decodeUTF8(value);
    }
    function normalizePublicKeyBundle(publicKey) {
      if (!publicKey || !publicKey.signingPublicKey || !publicKey.encryptionPublicKey) {
        throw new Error("Public key bundle requires signingPublicKey and encryptionPublicKey");
      }
      return {
        signingPublicKey: publicKey.signingPublicKey,
        encryptionPublicKey: publicKey.encryptionPublicKey
      };
    }
    function buildIdentityRotationPayload({
      username,
      fromGeneration,
      toGeneration,
      previousPublicKey,
      nextPublicKey,
      rotationKind,
      reason,
      timestamp
    }) {
      if (!username) {
        throw new Error("Identity rotation requires username");
      }
      if (!ROTATION_TYPES.has(rotationKind)) {
        throw new Error(`Identity rotation kind must be one of: ${[...ROTATION_TYPES].join(", ")}`);
      }
      if (toGeneration !== fromGeneration + 1) {
        throw new Error("Identity rotation must advance generation by exactly 1");
      }
      return {
        version: 1,
        type: "identity:rotate",
        username,
        fromGeneration,
        toGeneration,
        previousPublicKey: normalizePublicKeyBundle(previousPublicKey),
        nextPublicKey: normalizePublicKeyBundle(nextPublicKey),
        rotationKind,
        reason: reason || "",
        timestamp: typeof timestamp === "number" ? timestamp : Date.now()
      };
    }
    function signIdentityRotationPayload(payload, signingSecretKey) {
      const message = utf8ToBytes(stableStringify(payload));
      const signature = nacl.sign.detached(message, signingSecretKey);
      return naclUtil.encodeBase64(signature);
    }
    function verifyDetachedSignature(payload, signatureBase64, signingPublicKeyBase64) {
      const message = utf8ToBytes(stableStringify(payload));
      const signatureBytes = naclUtil.decodeBase64(signatureBase64);
      const signingPublicKey = naclUtil.decodeBase64(signingPublicKeyBase64);
      return nacl.sign.detached.verify(message, signatureBytes, signingPublicKey);
    }
    function createIdentityRotation({
      username,
      fromGeneration,
      toGeneration,
      previousPublicKey,
      nextKeyPair,
      rotationKind,
      reason,
      timestamp,
      coldRecoverySigningSecretKey
    }) {
      if (!nextKeyPair || !nextKeyPair.signing || !nextKeyPair.signing.secretKey) {
        throw new Error("Identity rotation requires nextKeyPair with signing secret");
      }
      const payload = buildIdentityRotationPayload({
        username,
        fromGeneration,
        toGeneration,
        previousPublicKey,
        nextPublicKey: keyPairToPublicBundle(nextKeyPair),
        rotationKind,
        reason,
        timestamp
      });
      const rotation = {
        ...payload,
        signature: signIdentityRotationPayload(payload, nextKeyPair.signing.secretKey)
      };
      if (coldRecoverySigningSecretKey) {
        rotation.recoverySignature = signIdentityRotationPayload(
          payload,
          coldRecoverySigningSecretKey
        );
      }
      return rotation;
    }
    function buildColdRecoveryEnrollmentPayload({ username, recoveryPublicKey, timestamp }) {
      if (!username) {
        throw new Error("Cold recovery enrollment requires username");
      }
      if (!recoveryPublicKey) {
        throw new Error("Cold recovery enrollment requires recoveryPublicKey");
      }
      return {
        version: 1,
        type: "identity:cold-enroll",
        username,
        recoveryPublicKey,
        timestamp: typeof timestamp === "number" ? timestamp : Date.now()
      };
    }
    function createColdRecoveryEnrollment({
      username,
      coldRecoverySigningSecretKey,
      recoveryPublicKey,
      timestamp
    }) {
      if (!coldRecoverySigningSecretKey) {
        throw new Error("Cold recovery enrollment requires cold recovery signing secret");
      }
      if (!recoveryPublicKey) {
        throw new Error("Cold recovery enrollment requires recoveryPublicKey");
      }
      const payload = buildColdRecoveryEnrollmentPayload({
        username,
        recoveryPublicKey,
        timestamp
      });
      return {
        ...payload,
        signature: signIdentityRotationPayload(payload, coldRecoverySigningSecretKey)
      };
    }
    function verifyColdRecoveryEnrollment(enrollment) {
      if (!enrollment || enrollment.type !== "identity:cold-enroll" || enrollment.version !== 1) {
        return { ok: false, error: "invalid-enrollment-shape" };
      }
      if (!enrollment.signature || !enrollment.recoveryPublicKey) {
        return { ok: false, error: "missing-enrollment-fields" };
      }
      const { signature, ...payload } = enrollment;
      const verified = verifyDetachedSignature(payload, signature, enrollment.recoveryPublicKey);
      if (!verified) {
        return { ok: false, error: "invalid-enrollment-signature" };
      }
      return { ok: true, enrollment };
    }
    function verifyIdentityRotation(rotation, options = {}) {
      if (!rotation || rotation.type !== "identity:rotate" || rotation.version !== 1) {
        return { ok: false, error: "invalid-rotation-shape" };
      }
      if (!rotation.signature || !rotation.nextPublicKey || !rotation.previousPublicKey) {
        return { ok: false, error: "missing-rotation-fields" };
      }
      if (rotation.toGeneration !== rotation.fromGeneration + 1) {
        return { ok: false, error: "invalid-generation-step" };
      }
      if (!ROTATION_TYPES.has(rotation.rotationKind)) {
        return { ok: false, error: "invalid-rotation-kind" };
      }
      const { signature, recoverySignature, ...payload } = rotation;
      const verified = verifyDetachedSignature(payload, signature, rotation.nextPublicKey.signingPublicKey);
      if (!verified) {
        return { ok: false, error: "invalid-signature" };
      }
      const requiredRecoveryPublicKey = options.requiredRecoveryPublicKey || null;
      if (requiredRecoveryPublicKey) {
        if (!recoverySignature) {
          return { ok: false, error: "missing-recovery-signature" };
        }
        const recoveryVerified = verifyDetachedSignature(
          payload,
          recoverySignature,
          requiredRecoveryPublicKey
        );
        if (!recoveryVerified) {
          return { ok: false, error: "invalid-recovery-signature" };
        }
      }
      if (rotation.previousPublicKey.signingPublicKey === rotation.nextPublicKey.signingPublicKey) {
        return { ok: false, error: "unchanged-signing-key" };
      }
      return { ok: true, rotation };
    }
    async function resolveColdRecoverySigningSecretKey({
      username,
      coldPassword,
      pepper,
      kdfIterations
    }) {
      if (!coldPassword) {
        return null;
      }
      const coldRecovery = await deriveColdRecoverySigningKey({
        username,
        coldPassword,
        pepper,
        kdfIterations
      });
      return coldRecovery.signing.secretKey;
    }
    async function revokeAndRotateIdentity({
      username,
      password,
      coldPassword,
      currentGeneration = 1,
      reason = "compromise-recovery",
      pepper = "",
      kdfIterations,
      timestamp
    } = {}) {
      const currentKeyPair = await deriveKeyPairFromCredentials({
        username,
        password,
        generation: currentGeneration,
        pepper,
        kdfIterations
      });
      const nextGeneration = currentGeneration + 1;
      const nextKeyPair = await deriveKeyPairFromCredentials({
        username,
        password,
        generation: nextGeneration,
        pepper,
        kdfIterations
      });
      const coldRecoverySigningSecretKey = await resolveColdRecoverySigningSecretKey({
        username,
        coldPassword,
        pepper,
        kdfIterations
      });
      const rotation = createIdentityRotation({
        username,
        fromGeneration: currentGeneration,
        toGeneration: nextGeneration,
        previousPublicKey: keyPairToPublicBundle(currentKeyPair),
        nextKeyPair,
        rotationKind: "compromise-recovery",
        reason,
        timestamp,
        coldRecoverySigningSecretKey
      });
      return {
        rotation,
        currentKeyPair,
        nextKeyPair,
        nextGeneration,
        coldRecoveryUsed: Boolean(coldRecoverySigningSecretKey)
      };
    }
    async function rotateIdentityPassword({
      username,
      currentPassword,
      newPassword,
      coldPassword,
      currentGeneration = 1,
      reason = "password-change",
      pepper = "",
      kdfIterations,
      timestamp
    } = {}) {
      const currentKeyPair = await deriveKeyPairFromCredentials({
        username,
        password: currentPassword,
        generation: currentGeneration,
        pepper,
        kdfIterations
      });
      const nextGeneration = currentGeneration + 1;
      const nextKeyPair = await deriveKeyPairFromCredentials({
        username,
        password: newPassword,
        generation: nextGeneration,
        pepper,
        kdfIterations
      });
      const coldRecoverySigningSecretKey = await resolveColdRecoverySigningSecretKey({
        username,
        coldPassword,
        pepper,
        kdfIterations
      });
      const rotation = createIdentityRotation({
        username,
        fromGeneration: currentGeneration,
        toGeneration: nextGeneration,
        previousPublicKey: keyPairToPublicBundle(currentKeyPair),
        nextKeyPair,
        rotationKind: "password-change",
        reason,
        timestamp,
        coldRecoverySigningSecretKey
      });
      return {
        rotation,
        currentKeyPair,
        nextKeyPair,
        nextGeneration,
        coldRecoveryUsed: Boolean(coldRecoverySigningSecretKey)
      };
    }
    async function enrollColdRecoveryPassword({
      username,
      coldPassword,
      pepper = "",
      kdfIterations,
      timestamp
    } = {}) {
      const coldRecovery = await deriveColdRecoverySigningKey({
        username,
        coldPassword,
        pepper,
        kdfIterations
      });
      const enrollment = createColdRecoveryEnrollment({
        username,
        coldRecoverySigningSecretKey: coldRecovery.signing.secretKey,
        recoveryPublicKey: coldRecovery.recoveryPublicKey,
        timestamp
      });
      return {
        enrollment,
        recoveryPublicKey: coldRecovery.recoveryPublicKey,
        coldRecovery
      };
    }
    function shouldApplyIdentityRotation(currentState, rotation, options = {}) {
      const requiredRecoveryPublicKey = options.enrolledRecoveryPublicKey || currentState && currentState.recoveryPublicKey || null;
      const verified = verifyIdentityRotation(rotation, { requiredRecoveryPublicKey });
      if (!verified.ok) {
        return { apply: false, reason: verified.error };
      }
      if (currentState && rotation.toGeneration <= currentState.generation) {
        return { apply: false, reason: "stale-generation" };
      }
      if (currentState && currentState.publicKey && currentState.publicKey.signingPublicKey !== rotation.previousPublicKey.signingPublicKey) {
        return { apply: false, reason: "previous-key-mismatch" };
      }
      return { apply: true, rotation: verified.rotation };
    }
    module.exports = {
      createIdentityRotation,
      createColdRecoveryEnrollment,
      verifyIdentityRotation,
      verifyColdRecoveryEnrollment,
      revokeAndRotateIdentity,
      rotateIdentityPassword,
      enrollColdRecoveryPassword,
      shouldApplyIdentityRotation,
      keyPairToPublicBundle,
      buildIdentityRotationPayload,
      buildColdRecoveryEnrollmentPayload,
      signIdentityRotationPayload
    };
  }
});

// src/security/message-security-service.js
var require_message_security_service = __commonJS({
  "src/security/message-security-service.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var VDF = require_vdf();
    var DEFAULT_APP_PASSWORD = "change-this-app-password";
    var DEFAULT_SECURITY_OPTIONS = {
      enabled: true,
      signingEnabled: true,
      encryptionEnabled: true,
      powEnabled: true,
      powTargetMs: 1e3,
      appPassword: DEFAULT_APP_PASSWORD,
      broadcastPasswords: {},
      resolveBroadcastPassword: null,
      powSteps: 22,
      trustedPeerKeys: {},
      kdfIterations: 1e5
    };
    function stableStringify(value) {
      if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
      }
      if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
      }
      const keys = Object.keys(value).sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    function concatBytes(a, b) {
      const result = new Uint8Array(a.length + b.length);
      result.set(a, 0);
      result.set(b, a.length);
      return result;
    }
    function hash32(bytes) {
      return nacl.hash(bytes).slice(0, 32);
    }
    function bytesToHex(bytes) {
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    function utf8ToBytes(value) {
      return naclUtil.decodeUTF8(value);
    }
    async function deriveBroadcastKey(password, salt, iterations) {
      const subtle = globalThis.crypto && globalThis.crypto.subtle;
      if (subtle) {
        const keyMaterial = await subtle.importKey(
          "raw",
          utf8ToBytes(password),
          "PBKDF2",
          false,
          ["deriveBits"]
        );
        const bits = await subtle.deriveBits(
          { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
          keyMaterial,
          256
        );
        return new Uint8Array(bits);
      }
      try {
        const { pbkdf2Sync } = __require("crypto");
        return new Uint8Array(pbkdf2Sync(password, Buffer.from(salt), iterations, 32, "sha256"));
      } catch (_ignored) {
        return hash32(concatBytes(utf8ToBytes(password), salt));
      }
    }
    function legacyBroadcastKey(password, salt) {
      return hash32(concatBytes(utf8ToBytes(password), salt));
    }
    function normalizePeerPublicKey(publicKey) {
      if (!publicKey || typeof publicKey !== "object") {
        throw new Error("Public key must be an object with signingPublicKey and encryptionPublicKey");
      }
      if (!publicKey.signingPublicKey || !publicKey.encryptionPublicKey) {
        throw new Error("Public key object is missing signingPublicKey or encryptionPublicKey");
      }
      return {
        signingPublicKey: publicKey.signingPublicKey,
        encryptionPublicKey: publicKey.encryptionPublicKey
      };
    }
    var MessageSecurityService = class {
      constructor({ nodeId, options = {}, now } = {}) {
        if (!nodeId) {
          throw new Error("MessageSecurityService requires nodeId");
        }
        this.nodeId = nodeId;
        this.options = {
          ...DEFAULT_SECURITY_OPTIONS,
          ...options
        };
        this.now = now || (() => Date.now());
        const keyPair = options.keyPair || {
          signing: nacl.sign.keyPair(),
          encryption: nacl.box.keyPair()
        };
        this.signingSecretKey = keyPair.signing.secretKey;
        this.signingPublicKey = keyPair.signing.publicKey;
        this.encryptionSecretKey = keyPair.encryption.secretKey;
        this.encryptionPublicKey = keyPair.encryption.publicKey;
        this.publicKeyBundle = {
          signingPublicKey: naclUtil.encodeBase64(this.signingPublicKey),
          encryptionPublicKey: naclUtil.encodeBase64(this.encryptionPublicKey)
        };
        this.peerPublicKeys = /* @__PURE__ */ new Map();
        this.peerIdentityGenerations = /* @__PURE__ */ new Map();
        this.peerRecoveryPublicKeys = /* @__PURE__ */ new Map();
        for (const [peerId, peerKey] of Object.entries(this.options.trustedPeerKeys || {})) {
          this.peerPublicKeys.set(peerId, normalizePeerPublicKey(peerKey));
          this.peerIdentityGenerations.set(peerId, 1);
        }
        this.calibratedPowSteps = this.options.powSteps;
      }
      getPublicKey() {
        return { ...this.publicKeyBundle };
      }
      registerPeerPublicKey(peerId, publicKey, options = {}) {
        const normalized = normalizePeerPublicKey(publicKey);
        const generation = typeof options.generation === "number" ? options.generation : 1;
        const currentGeneration = this.peerIdentityGenerations.get(peerId) || 0;
        if (generation < currentGeneration && options.allowDowngrade !== true) {
          throw new Error(`Refusing older identity generation for peer ${peerId}`);
        }
        this.peerPublicKeys.set(peerId, normalized);
        this.peerIdentityGenerations.set(peerId, Math.max(currentGeneration, generation));
      }
      getPeerIdentityGeneration(peerId) {
        return this.peerIdentityGenerations.get(peerId) || 0;
      }
      getPeerIdentityState(peerId) {
        const publicKey = this.peerPublicKeys.get(peerId);
        const recoveryPublicKey = this.peerRecoveryPublicKeys.get(peerId) || null;
        if (!publicKey && !recoveryPublicKey) {
          return null;
        }
        return {
          publicKey: publicKey ? { ...publicKey } : null,
          generation: this.getPeerIdentityGeneration(peerId),
          recoveryPublicKey
        };
      }
      registerPeerRecoveryPublicKey(peerId, recoveryPublicKey) {
        if (!peerId || !recoveryPublicKey) {
          throw new Error("registerPeerRecoveryPublicKey requires peerId and recoveryPublicKey");
        }
        this.peerRecoveryPublicKeys.set(peerId, recoveryPublicKey);
      }
      getPeerRecoveryPublicKey(peerId) {
        return this.peerRecoveryPublicKeys.get(peerId) || null;
      }
      applyColdRecoveryEnrollment(peerId, enrollment) {
        const { verifyColdRecoveryEnrollment } = require_identity_rotation();
        const verified = verifyColdRecoveryEnrollment(enrollment);
        if (!verified.ok) {
          const error = new Error(`Invalid cold recovery enrollment: ${verified.error}`);
          error.code = "INVALID_COLD_RECOVERY_ENROLLMENT";
          throw error;
        }
        this.registerPeerRecoveryPublicKey(peerId, enrollment.recoveryPublicKey);
        return { applied: true, recoveryPublicKey: enrollment.recoveryPublicKey };
      }
      applyIdentityRotation(peerId, rotation) {
        const { shouldApplyIdentityRotation } = require_identity_rotation();
        const currentState = this.getPeerIdentityState(peerId);
        const decision = shouldApplyIdentityRotation(currentState, rotation, {
          enrolledRecoveryPublicKey: this.getPeerRecoveryPublicKey(peerId)
        });
        if (!decision.apply) {
          if (decision.reason && decision.reason !== "stale-generation" && decision.reason !== "previous-key-mismatch") {
            const error = new Error(`Invalid identity rotation: ${decision.reason}`);
            error.code = "INVALID_IDENTITY_ROTATION";
            throw error;
          }
          return { applied: false, reason: decision.reason };
        }
        this.registerPeerPublicKey(peerId, rotation.nextPublicKey, {
          generation: rotation.toGeneration
        });
        return {
          applied: true,
          fromGeneration: rotation.fromGeneration,
          toGeneration: rotation.toGeneration,
          rotationKind: rotation.rotationKind
        };
      }
      resolvePeerPublicKey(peerId, fallbackPublicKey) {
        const trusted = this.peerPublicKeys.get(peerId);
        const fallback = fallbackPublicKey ? normalizePeerPublicKey(fallbackPublicKey) : null;
        if (trusted && fallback) {
          const mismatch = trusted.signingPublicKey !== fallback.signingPublicKey || trusted.encryptionPublicKey !== fallback.encryptionPublicKey;
          if (mismatch) {
            throw new Error(`Public key mismatch for peer ${peerId}`);
          }
        }
        return trusted || fallback || null;
      }
      buildEnvelopeBase({ messageType, payload, targetId = null }) {
        return {
          version: 1,
          senderId: this.nodeId,
          senderPublicKey: this.getPublicKey(),
          targetId,
          messageType,
          timestamp: this.now(),
          payload
        };
      }
      async secureOutgoingMessage({ messageType, payload, targetId = null, securityContext = {} }) {
        if (!this.options.enabled) {
          return this.buildEnvelopeBase({ messageType, payload, targetId });
        }
        const envelope = this.buildEnvelopeBase({ messageType, payload, targetId });
        const encryptionInfo = await this.encryptPayload({ payload, targetId, securityContext });
        envelope.payload = encryptionInfo.payload;
        envelope.security = {
          encryption: encryptionInfo.security,
          signing: { enabled: false },
          pow: { enabled: false }
        };
        if (this.options.powEnabled) {
          const pow = await this.generatePow(envelope);
          envelope.security.pow = {
            enabled: true,
            messageHash: pow.messageHash,
            challenge: pow.challenge,
            proof: pow.proof,
            steps: pow.steps,
            durationMs: pow.durationMs
          };
        }
        if (this.options.signingEnabled) {
          const signatureBase = this.canonicalSigningInput(envelope);
          const signature = nacl.sign.detached(
            naclUtil.decodeUTF8(signatureBase),
            this.signingSecretKey
          );
          envelope.security.signing = {
            enabled: true,
            algorithm: "ed25519",
            signature: naclUtil.encodeBase64(signature)
          };
        }
        return envelope;
      }
      canonicalSigningInput(envelope) {
        return stableStringify({
          version: envelope.version,
          senderId: envelope.senderId,
          senderPublicKey: envelope.senderPublicKey,
          targetId: envelope.targetId,
          messageType: envelope.messageType,
          timestamp: envelope.timestamp,
          payload: envelope.payload,
          security: {
            encryption: envelope.security ? envelope.security.encryption : { enabled: false },
            pow: envelope.security ? envelope.security.pow : { enabled: false }
          }
        });
      }
      canonicalPowInput(envelope) {
        return stableStringify({
          version: envelope.version,
          senderId: envelope.senderId,
          senderPublicKey: envelope.senderPublicKey,
          targetId: envelope.targetId,
          messageType: envelope.messageType,
          timestamp: envelope.timestamp,
          payload: envelope.payload,
          security: {
            encryption: envelope.security ? envelope.security.encryption : { enabled: false }
          }
        });
      }
      computePowMessageHash(envelope) {
        return bytesToHex(hash32(utf8ToBytes(this.canonicalPowInput(envelope))));
      }
      async decryptIncomingMessage(envelope) {
        if (!this.options.enabled) {
          return {
            ignored: false,
            messageType: envelope.messageType,
            senderId: envelope.senderId,
            targetId: envelope.targetId,
            payload: envelope.payload
          };
        }
        if (!envelope || typeof envelope !== "object") {
          throw new Error("Incoming message is invalid");
        }
        if (envelope.targetId && envelope.targetId !== this.nodeId) {
          return { ignored: true };
        }
        if (envelope.security && envelope.security.pow && envelope.security.pow.enabled && this.options.powEnabled) {
          await this.verifyPow(envelope);
        }
        if (envelope.security && envelope.security.signing && envelope.security.signing.enabled && this.options.signingEnabled) {
          this.verifySignature(envelope);
        }
        const payload = await this.decryptPayload(envelope);
        return {
          ignored: false,
          messageType: envelope.messageType,
          senderId: envelope.senderId,
          targetId: envelope.targetId,
          payload
        };
      }
      resolveBroadcastPassword(scope) {
        const normalizedScope = scope || "default";
        if (typeof this.options.resolveBroadcastPassword === "function") {
          const resolved = this.options.resolveBroadcastPassword({
            scope: normalizedScope,
            nodeId: this.nodeId,
            defaultPassword: this.options.appPassword,
            broadcastPasswords: this.options.broadcastPasswords || {}
          });
          if (typeof resolved === "string" && resolved.length > 0) {
            return resolved;
          }
        }
        const scopePassword = this.options.broadcastPasswords ? this.options.broadcastPasswords[normalizedScope] : null;
        if (typeof scopePassword === "string" && scopePassword.length > 0) {
          return scopePassword;
        }
        return this.options.appPassword;
      }
      async encryptPayload({ payload, targetId, securityContext = {} }) {
        if (!this.options.encryptionEnabled) {
          return {
            payload,
            security: {
              enabled: false,
              mode: "none"
            }
          };
        }
        const plainText = naclUtil.decodeUTF8(JSON.stringify(payload));
        if (targetId) {
          const recipientPublicKey = this.resolvePeerPublicKey(targetId, null);
          if (!recipientPublicKey) {
            throw new Error(`Missing public key for target peer ${targetId}`);
          }
          const nonce2 = nacl.randomBytes(nacl.box.nonceLength);
          const encrypted2 = nacl.box(
            plainText,
            nonce2,
            naclUtil.decodeBase64(recipientPublicKey.encryptionPublicKey),
            this.encryptionSecretKey
          );
          return {
            payload: naclUtil.encodeBase64(encrypted2),
            security: {
              enabled: true,
              mode: "direct",
              nonce: naclUtil.encodeBase64(nonce2),
              senderEncryptionPublicKey: this.publicKeyBundle.encryptionPublicKey
            }
          };
        }
        const scope = securityContext.broadcastScope || "default";
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
        const salt = nacl.randomBytes(16);
        const password = this.resolveBroadcastPassword(scope);
        const iterations = this.options.kdfIterations || DEFAULT_SECURITY_OPTIONS.kdfIterations;
        const key = await deriveBroadcastKey(password, salt, iterations);
        const encrypted = nacl.secretbox(plainText, nonce, key);
        return {
          payload: naclUtil.encodeBase64(encrypted),
          security: {
            enabled: true,
            mode: "broadcast",
            scope,
            nonce: naclUtil.encodeBase64(nonce),
            salt: naclUtil.encodeBase64(salt),
            kdf: "pbkdf2",
            kdfIterations: iterations
          }
        };
      }
      async decryptPayload(envelope) {
        const encryption = envelope.security ? envelope.security.encryption : null;
        if (!encryption || !encryption.enabled || !this.options.encryptionEnabled) {
          return envelope.payload;
        }
        const encryptedBuffer = naclUtil.decodeBase64(envelope.payload);
        if (encryption.mode === "broadcast") {
          const scope = encryption.scope || "default";
          const password = this.resolveBroadcastPassword(scope);
          const salt = naclUtil.decodeBase64(encryption.salt);
          const nonce = naclUtil.decodeBase64(encryption.nonce);
          let key;
          if (encryption.kdf === "pbkdf2") {
            const configuredIterations = this.options.kdfIterations || DEFAULT_SECURITY_OPTIONS.kdfIterations;
            const requestedIterations = encryption.kdfIterations || configuredIterations;
            const minIterations = Math.max(1e3, Math.floor(configuredIterations * 0.1));
            const maxIterations = configuredIterations * 2;
            if (requestedIterations < minIterations || requestedIterations > maxIterations) {
              throw new Error(`Invalid kdfIterations: ${requestedIterations}`);
            }
            key = await deriveBroadcastKey(password, salt, requestedIterations);
          } else {
            key = legacyBroadcastKey(password, salt);
          }
          const decrypted = nacl.secretbox.open(encryptedBuffer, nonce, key);
          if (!decrypted) {
            throw new Error("Unable to decrypt broadcast payload");
          }
          return JSON.parse(naclUtil.encodeUTF8(decrypted));
        }
        if (encryption.mode === "direct") {
          const senderPublicKey = naclUtil.decodeBase64(encryption.senderEncryptionPublicKey);
          const nonce = naclUtil.decodeBase64(encryption.nonce);
          const decrypted = nacl.box.open(
            encryptedBuffer,
            nonce,
            senderPublicKey,
            this.encryptionSecretKey
          );
          if (!decrypted) {
            throw new Error("Unable to decrypt direct payload");
          }
          return JSON.parse(naclUtil.encodeUTF8(decrypted));
        }
        throw new Error(`Unsupported encryption mode: ${encryption.mode}`);
      }
      verifySignature(envelope) {
        const senderPublicKey = this.resolvePeerPublicKey(envelope.senderId, envelope.senderPublicKey);
        if (!senderPublicKey) {
          throw new Error(`Missing public key for sender ${envelope.senderId}`);
        }
        const signatureBase = this.canonicalSigningInput(envelope);
        const isValid = nacl.sign.detached.verify(
          naclUtil.decodeUTF8(signatureBase),
          naclUtil.decodeBase64(envelope.security.signing.signature),
          naclUtil.decodeBase64(senderPublicKey.signingPublicKey)
        );
        if (!isValid) {
          const error = new Error(`Invalid signature for sender ${envelope.senderId}`);
          error.code = "INVALID_SIGNATURE";
          throw error;
        }
        return true;
      }
      async determinePowSteps() {
        if (typeof this.calibratedPowSteps === "bigint") {
          return this.calibratedPowSteps;
        }
        if (typeof this.options.powSteps === "number") {
          this.calibratedPowSteps = BigInt(Math.max(1, this.options.powSteps));
          return this.calibratedPowSteps;
        }
        const targetMs = Math.max(1, Number(this.options.powTargetMs || 1));
        const probeChallenge = bytesToHex(hash32(utf8ToBytes(`probe:${this.nodeId}:${this.now()}`)));
        const probeSteps = BigInt(2);
        const start = this.now();
        await VDF.compute(probeChallenge, probeSteps);
        const elapsedMs = Math.max(1, this.now() - start);
        const scaled = Math.max(1, Math.round(targetMs / elapsedMs * Number(probeSteps)));
        this.calibratedPowSteps = BigInt(scaled);
        return this.calibratedPowSteps;
      }
      async generatePow(envelope) {
        const messageHash = this.computePowMessageHash(envelope);
        const challenge = messageHash;
        const steps = await this.determinePowSteps();
        const start = this.now();
        const proof = await VDF.compute(challenge, steps);
        const durationMs = this.now() - start;
        return {
          messageHash,
          challenge,
          proof,
          steps: steps.toString(),
          durationMs
        };
      }
      async verifyPow(envelope) {
        const expectedMessageHash = this.computePowMessageHash(envelope);
        const pow = envelope.security.pow;
        if (!pow || !pow.messageHash || pow.messageHash !== expectedMessageHash || pow.challenge !== pow.messageHash) {
          const error = new Error("PoW challenge mismatch");
          error.code = "INVALID_POW";
          throw error;
        }
        const verified = await VDF.verify(pow.messageHash, BigInt(pow.steps), pow.proof);
        if (!verified) {
          const error = new Error("PoW verification failed");
          error.code = "INVALID_POW";
          throw error;
        }
        return true;
      }
    };
    module.exports = {
      MessageSecurityService,
      stableStringify,
      deriveBroadcastKey,
      legacyBroadcastKey,
      DEFAULT_SECURITY_OPTIONS,
      DEFAULT_APP_PASSWORD
    };
  }
});

// src/gossip/peer-group.js
var require_peer_group = __commonJS({
  "src/gossip/peer-group.js"(exports, module) {
    var PEER_GROUP_SCOPE_PREFIX = "gossip:";
    var DEFAULT_PEER_GROUP_OPTIONS = {
      fanout: 3,
      maxActivePeers: 8,
      maxHops: 64,
      relayEnabled: true
    };
    function peerGroupScope(groupId) {
      if (!groupId) {
        throw new Error("peerGroupScope requires groupId");
      }
      return `${PEER_GROUP_SCOPE_PREFIX}${groupId}`;
    }
    function parsePeerGroupScope(scope) {
      if (!scope || !scope.startsWith(PEER_GROUP_SCOPE_PREFIX)) {
        return null;
      }
      return scope.slice(PEER_GROUP_SCOPE_PREFIX.length);
    }
    function shufflePeerIds(peerIds, randomFn = Math.random) {
      const list = [...peerIds];
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(randomFn() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
    function selectFanoutPeers({
      peers,
      count,
      excludePeerIds = [],
      connectedPeerIds = [],
      randomFn = Math.random
    }) {
      const excluded = new Set(excludePeerIds.filter(Boolean));
      const candidates = peers.map((entry) => entry.peerId || entry).filter((peerId) => peerId && !excluded.has(peerId));
      const connected = new Set(connectedPeerIds.filter(Boolean));
      const preferred = candidates.filter((peerId) => connected.has(peerId));
      const others = candidates.filter((peerId) => !connected.has(peerId));
      const ordered = [
        ...shufflePeerIds(preferred, randomFn),
        ...shufflePeerIds(others, randomFn)
      ];
      return ordered.slice(0, Math.max(0, count));
    }
    module.exports = {
      PEER_GROUP_SCOPE_PREFIX,
      DEFAULT_PEER_GROUP_OPTIONS,
      peerGroupScope,
      parsePeerGroupScope,
      shufflePeerIds,
      selectFanoutPeers
    };
  }
});

// src/cqrs/domain-events.js
var require_domain_events = __commonJS({
  "src/cqrs/domain-events.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var { stableStringify } = require_message_security_service();
    var DOMAIN_EVENT_SCHEMA_VERSION = 1;
    var OPERATION_KIND_TO_EVENT_KIND = {
      create: "record:created",
      update: "record:updated",
      delete: "record:removed",
      "transfer-ownership": "ownership:transferred"
    };
    function computeContentHash(data) {
      const canonical = stableStringify(data || {});
      const bytes = naclUtil.decodeUTF8(canonical);
      const hash = nacl.hash(bytes);
      const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      return `sha512:${hex}`;
    }
    function canonicalEventBody(event) {
      return stableStringify({
        schemaVersion: event.schemaVersion,
        eventId: event.eventId,
        groupId: event.groupId,
        publisherId: event.publisherId,
        kind: event.kind,
        collectionName: event.collectionName,
        id: event.id,
        payload: event.payload,
        timestamp: event.timestamp,
        baseVersion: event.baseVersion,
        prevHash: event.prevHash || null,
        newOwnerId: event.newOwnerId || null
      });
    }
    function computeEventHash(event) {
      const canonical = canonicalEventBody(event);
      const bytes = naclUtil.decodeUTF8(canonical);
      const hash = nacl.hash(bytes);
      const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      return `sha512:${hex}`;
    }
    function operationToDomainEvent(operation, { publisherId, groupId, prevHash, eventIdGenerator }) {
      if (!operation || !publisherId || !groupId) {
        throw new Error("operationToDomainEvent requires operation, publisherId, and groupId");
      }
      const kind = OPERATION_KIND_TO_EVENT_KIND[operation.kind];
      if (!kind) {
        throw new Error(`Unsupported operation kind for domain event: ${operation.kind}`);
      }
      const event = {
        schemaVersion: DOMAIN_EVENT_SCHEMA_VERSION,
        eventId: eventIdGenerator ? eventIdGenerator() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        groupId,
        publisherId,
        kind,
        collectionName: operation.collectionName,
        id: operation.id,
        payload: operation.payload || {},
        timestamp: operation.timestamp,
        baseVersion: operation.baseVersion || null,
        prevHash: prevHash || null,
        newOwnerId: operation.newOwnerId || null,
        verificationHash: operation.verificationHash || null,
        verificationVersion: operation.verificationVersion || null,
        eventHash: null,
        signature: null
      };
      event.eventHash = computeEventHash(event);
      return event;
    }
    function signDomainEvent(event, signingSecretKey) {
      if (!signingSecretKey) {
        return { ...event };
      }
      const unsigned = { ...event, signature: null };
      const eventHash = computeEventHash(unsigned);
      const signature = nacl.sign.detached(
        naclUtil.decodeUTF8(eventHash),
        signingSecretKey
      );
      return {
        ...unsigned,
        eventHash,
        signature: naclUtil.encodeBase64(signature)
      };
    }
    function verifyDomainEventSignature(event, signingPublicKey) {
      if (!event || !event.eventHash) {
        return { ok: false, reason: "missing-event-hash" };
      }
      const recomputed = computeEventHash({ ...event, signature: null });
      if (recomputed !== event.eventHash) {
        return { ok: false, reason: "event-hash-mismatch" };
      }
      if (!event.signature) {
        return { ok: true, unsigned: true };
      }
      if (!signingPublicKey) {
        return { ok: false, reason: "missing-public-key" };
      }
      const keyBytes = typeof signingPublicKey === "string" ? naclUtil.decodeBase64(signingPublicKey) : signingPublicKey;
      const valid = nacl.sign.detached.verify(
        naclUtil.decodeUTF8(event.eventHash),
        naclUtil.decodeBase64(event.signature),
        keyBytes
      );
      return valid ? { ok: true } : { ok: false, reason: "invalid-signature" };
    }
    function verifyDomainEvent(event, { signingPublicKey, supportedVersions } = {}) {
      if (!event || typeof event !== "object") {
        return { ok: false, reason: "invalid-event" };
      }
      const versions = supportedVersions || [DOMAIN_EVENT_SCHEMA_VERSION];
      if (!versions.includes(event.schemaVersion)) {
        return { ok: false, reason: "unsupported-schema-version", schemaVersion: event.schemaVersion };
      }
      if (!event.eventId || !event.groupId || !event.publisherId || !event.kind) {
        return { ok: false, reason: "missing-required-fields" };
      }
      return verifyDomainEventSignature(event, signingPublicKey);
    }
    function createEmptyView(collections = []) {
      const view = /* @__PURE__ */ new Map();
      for (const name of collections) {
        view.set(name, /* @__PURE__ */ new Map());
      }
      return view;
    }
    function ensureCollectionView(view, collectionName) {
      if (!view.has(collectionName)) {
        view.set(collectionName, /* @__PURE__ */ new Map());
      }
      return view.get(collectionName);
    }
    function applyDomainEventToView(view, event, { collectionsFilter } = {}) {
      if (!event || !event.collectionName) {
        return { applied: false, reason: "invalid-event" };
      }
      if (Array.isArray(collectionsFilter) && collectionsFilter.length > 0 && !collectionsFilter.includes(event.collectionName)) {
        return { applied: false, reason: "collection-filtered" };
      }
      const collection = ensureCollectionView(view, event.collectionName);
      if (event.kind === "record:created") {
        if (collection.has(event.id)) {
          return { applied: false, reason: "already-exists" };
        }
        collection.set(event.id, {
          id: event.id,
          ownerId: event.publisherId,
          data: { ...event.payload || {} },
          hash: computeContentHash(event.payload || {}),
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          deletedAt: null,
          version: 1
        });
        return { applied: true, kind: event.kind };
      }
      const current = collection.get(event.id);
      if (!current || current.deletedAt) {
        if (event.kind === "record:removed") {
          return { applied: false, reason: "not-found" };
        }
        return { applied: false, reason: "missing-record" };
      }
      if (event.kind === "record:updated") {
        if (typeof event.baseVersion === "number" && current.version !== event.baseVersion) {
          return { applied: false, reason: "version-conflict", currentVersion: current.version };
        }
        current.data = { ...current.data, ...event.payload || {} };
        current.hash = computeContentHash(current.data);
        current.updatedAt = event.timestamp;
        current.version += 1;
        return { applied: true, kind: event.kind };
      }
      if (event.kind === "record:removed") {
        if (typeof event.baseVersion === "number" && current.version !== event.baseVersion) {
          return { applied: false, reason: "version-conflict", currentVersion: current.version };
        }
        current.deletedAt = event.timestamp;
        current.version += 1;
        return { applied: true, kind: event.kind };
      }
      if (event.kind === "ownership:transferred") {
        if (typeof event.baseVersion === "number" && current.version !== event.baseVersion) {
          return { applied: false, reason: "version-conflict", currentVersion: current.version };
        }
        current.ownerId = event.newOwnerId;
        current.updatedAt = event.timestamp;
        current.version += 1;
        return { applied: true, kind: event.kind };
      }
      return { applied: false, reason: "unknown-kind" };
    }
    function verifyEventChain(events, { genesisHash = null } = {}) {
      if (!Array.isArray(events) || events.length === 0) {
        return { ok: true, length: 0 };
      }
      let expectedPrev = genesisHash;
      for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        const prevHash = event.prevHash || null;
        if (prevHash !== expectedPrev) {
          return {
            ok: false,
            reason: "chain-break",
            index,
            expectedPrev,
            actualPrev: prevHash
          };
        }
        const hashCheck = verifyDomainEventSignature(event, null);
        if (!hashCheck.ok) {
          return { ok: false, reason: hashCheck.reason, index };
        }
        expectedPrev = event.eventHash;
      }
      return { ok: true, length: events.length, lastHash: expectedPrev };
    }
    function buildCheckpoint(groupId, events, { publisherId } = {}) {
      const chain = verifyEventChain(events);
      return {
        schemaVersion: DOMAIN_EVENT_SCHEMA_VERSION,
        groupId,
        publisherId: publisherId || null,
        lastEventHash: chain.lastHash || null,
        recordCount: events.length,
        timestamp: Date.now()
      };
    }
    module.exports = {
      DOMAIN_EVENT_SCHEMA_VERSION,
      OPERATION_KIND_TO_EVENT_KIND,
      computeEventHash,
      operationToDomainEvent,
      signDomainEvent,
      verifyDomainEvent,
      verifyDomainEventSignature,
      createEmptyView,
      applyDomainEventToView,
      verifyEventChain,
      buildCheckpoint
    };
  }
});

// src/cqrs/peer-group-tiers.js
var require_peer_group_tiers = __commonJS({
  "src/cqrs/peer-group-tiers.js"(exports, module) {
    var DEFAULT_LIVE_CAP = 5e3;
    var DEFAULT_BULK_INTERVAL_MS = 3e4;
    function assignPeerGroupTier({ joinIndex, liveCap = DEFAULT_LIVE_CAP, requestedTier, role }) {
      if (role === "publisher") {
        return "live";
      }
      if (requestedTier === "live" || requestedTier === "bulk") {
        if (requestedTier === "live" && joinIndex >= liveCap) {
          return "bulk";
        }
        return requestedTier;
      }
      return joinIndex < liveCap ? "live" : "bulk";
    }
    function getPeerTier(peer) {
      return peer?.metadata?.peerGroupTier || peer?.peerGroupTier || null;
    }
    function filterPeersByTier(peers, tier) {
      if (!tier) {
        return peers;
      }
      return peers.filter((peer) => getPeerTier(peer) === tier);
    }
    function countLivePeers(peers) {
      return peers.filter((peer) => getPeerTier(peer) === "live").length;
    }
    function countBulkPeers(peers) {
      return peers.filter((peer) => getPeerTier(peer) === "bulk").length;
    }
    module.exports = {
      DEFAULT_LIVE_CAP,
      DEFAULT_BULK_INTERVAL_MS,
      assignPeerGroupTier,
      getPeerTier,
      filterPeersByTier,
      countLivePeers,
      countBulkPeers
    };
  }
});

// src/cqrs/bulk-relay.js
var require_bulk_relay = __commonJS({
  "src/cqrs/bulk-relay.js"(exports, module) {
    var { getPeerTier } = require_peer_group_tiers();
    var DEFAULT_BULK_RELAY_COUNT = 3;
    function electBulkRelays(peers, { count = DEFAULT_BULK_RELAY_COUNT } = {}) {
      const bulkPeers = peers.filter((peer) => getPeerTier(peer) === "bulk").map((peer) => peer.peerId || peer).filter(Boolean).sort();
      return bulkPeers.slice(0, Math.max(0, count));
    }
    function isBulkRelay(metadata) {
      return metadata?.bulkRelay === true;
    }
    function applyBulkRelayFlags(peers, relayPeerIds) {
      const relaySet = new Set(relayPeerIds);
      return peers.map((peer) => ({
        ...peer,
        metadata: {
          ...peer.metadata || {},
          bulkRelay: relaySet.has(peer.peerId)
        }
      }));
    }
    module.exports = {
      DEFAULT_BULK_RELAY_COUNT,
      electBulkRelays,
      isBulkRelay,
      applyBulkRelayFlags
    };
  }
});

// node_modules/acorn/dist/acorn.js
var require_acorn = __commonJS({
  "node_modules/acorn/dist/acorn.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.acorn = {}));
    })(exports, (function(exports2) {
      "use strict";
      var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
      var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
      var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
      var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
      var reservedWords = {
        3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
        5: "class enum extends super const export import",
        6: "enum",
        strict: "implements interface let package private protected public static yield",
        strictBind: "eval arguments"
      };
      var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
      var keywords$1 = {
        5: ecma5AndLessKeywords,
        "5module": ecma5AndLessKeywords + " export import",
        6: ecma5AndLessKeywords + " const class extends export import super"
      };
      var keywordRelationalOperator = /^in(stanceof)?$/;
      var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
      var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
      function isInAstralSet(code, set) {
        var pos = 65536;
        for (var i2 = 0; i2 < set.length; i2 += 2) {
          pos += set[i2];
          if (pos > code) {
            return false;
          }
          pos += set[i2 + 1];
          if (pos >= code) {
            return true;
          }
        }
        return false;
      }
      function isIdentifierStart(code, astral) {
        if (code < 65) {
          return code === 36;
        }
        if (code < 91) {
          return true;
        }
        if (code < 97) {
          return code === 95;
        }
        if (code < 123) {
          return true;
        }
        if (code <= 65535) {
          return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes);
      }
      function isIdentifierChar(code, astral) {
        if (code < 48) {
          return code === 36;
        }
        if (code < 58) {
          return true;
        }
        if (code < 65) {
          return false;
        }
        if (code < 91) {
          return true;
        }
        if (code < 97) {
          return code === 95;
        }
        if (code < 123) {
          return true;
        }
        if (code <= 65535) {
          return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
      }
      var TokenType = function TokenType2(label, conf) {
        if (conf === void 0) conf = {};
        this.label = label;
        this.keyword = conf.keyword;
        this.beforeExpr = !!conf.beforeExpr;
        this.startsExpr = !!conf.startsExpr;
        this.isLoop = !!conf.isLoop;
        this.isAssign = !!conf.isAssign;
        this.prefix = !!conf.prefix;
        this.postfix = !!conf.postfix;
        this.binop = conf.binop || null;
        this.updateContext = null;
      };
      function binop(name, prec) {
        return new TokenType(name, { beforeExpr: true, binop: prec });
      }
      var beforeExpr = { beforeExpr: true }, startsExpr = { startsExpr: true };
      var keywords = {};
      function kw(name, options) {
        if (options === void 0) options = {};
        options.keyword = name;
        return keywords[name] = new TokenType(name, options);
      }
      var types$1 = {
        num: new TokenType("num", startsExpr),
        regexp: new TokenType("regexp", startsExpr),
        string: new TokenType("string", startsExpr),
        name: new TokenType("name", startsExpr),
        privateId: new TokenType("privateId", startsExpr),
        eof: new TokenType("eof"),
        // Punctuation token types.
        bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
        bracketR: new TokenType("]"),
        braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
        braceR: new TokenType("}"),
        parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
        parenR: new TokenType(")"),
        comma: new TokenType(",", beforeExpr),
        semi: new TokenType(";", beforeExpr),
        colon: new TokenType(":", beforeExpr),
        dot: new TokenType("."),
        question: new TokenType("?", beforeExpr),
        questionDot: new TokenType("?."),
        arrow: new TokenType("=>", beforeExpr),
        template: new TokenType("template"),
        invalidTemplate: new TokenType("invalidTemplate"),
        ellipsis: new TokenType("...", beforeExpr),
        backQuote: new TokenType("`", startsExpr),
        dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
        // Operators. These carry several kinds of properties to help the
        // parser use them properly (the presence of these properties is
        // what categorizes them as operators).
        //
        // `binop`, when present, specifies that this operator is a binary
        // operator, and will refer to its precedence.
        //
        // `prefix` and `postfix` mark the operator as a prefix or postfix
        // unary operator.
        //
        // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
        // binary operators with a very low precedence, that should result
        // in AssignmentExpression nodes.
        eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
        assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
        incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
        prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
        logicalOR: binop("||", 1),
        logicalAND: binop("&&", 2),
        bitwiseOR: binop("|", 3),
        bitwiseXOR: binop("^", 4),
        bitwiseAND: binop("&", 5),
        equality: binop("==/!=/===/!==", 6),
        relational: binop("</>/<=/>=", 7),
        bitShift: binop("<</>>/>>>", 8),
        plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
        modulo: binop("%", 10),
        star: binop("*", 10),
        slash: binop("/", 10),
        starstar: new TokenType("**", { beforeExpr: true }),
        coalesce: binop("??", 1),
        // Keyword token types.
        _break: kw("break"),
        _case: kw("case", beforeExpr),
        _catch: kw("catch"),
        _continue: kw("continue"),
        _debugger: kw("debugger"),
        _default: kw("default", beforeExpr),
        _do: kw("do", { isLoop: true, beforeExpr: true }),
        _else: kw("else", beforeExpr),
        _finally: kw("finally"),
        _for: kw("for", { isLoop: true }),
        _function: kw("function", startsExpr),
        _if: kw("if"),
        _return: kw("return", beforeExpr),
        _switch: kw("switch"),
        _throw: kw("throw", beforeExpr),
        _try: kw("try"),
        _var: kw("var"),
        _const: kw("const"),
        _while: kw("while", { isLoop: true }),
        _with: kw("with"),
        _new: kw("new", { beforeExpr: true, startsExpr: true }),
        _this: kw("this", startsExpr),
        _super: kw("super", startsExpr),
        _class: kw("class", startsExpr),
        _extends: kw("extends", beforeExpr),
        _export: kw("export"),
        _import: kw("import", startsExpr),
        _null: kw("null", startsExpr),
        _true: kw("true", startsExpr),
        _false: kw("false", startsExpr),
        _in: kw("in", { beforeExpr: true, binop: 7 }),
        _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
        _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
        _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
        _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
      };
      var lineBreak = /\r\n?|\n|\u2028|\u2029/;
      var lineBreakG = new RegExp(lineBreak.source, "g");
      function isNewLine(code) {
        return code === 10 || code === 13 || code === 8232 || code === 8233;
      }
      function nextLineBreak(code, from, end) {
        if (end === void 0) end = code.length;
        for (var i2 = from; i2 < end; i2++) {
          var next = code.charCodeAt(i2);
          if (isNewLine(next)) {
            return i2 < end - 1 && next === 13 && code.charCodeAt(i2 + 1) === 10 ? i2 + 2 : i2 + 1;
          }
        }
        return -1;
      }
      var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
      var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
      var ref = Object.prototype;
      var hasOwnProperty = ref.hasOwnProperty;
      var toString = ref.toString;
      var hasOwn = Object.hasOwn || (function(obj, propName) {
        return hasOwnProperty.call(obj, propName);
      });
      var isArray = Array.isArray || (function(obj) {
        return toString.call(obj) === "[object Array]";
      });
      var regexpCache = /* @__PURE__ */ Object.create(null);
      function wordsRegexp(words) {
        return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
      }
      function codePointToString(code) {
        if (code <= 65535) {
          return String.fromCharCode(code);
        }
        code -= 65536;
        return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
      }
      var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
      var Position = function Position2(line, col) {
        this.line = line;
        this.column = col;
      };
      Position.prototype.offset = function offset(n) {
        return new Position(this.line, this.column + n);
      };
      var SourceLocation = function SourceLocation2(p, start, end) {
        this.start = start;
        this.end = end;
        if (p.sourceFile !== null) {
          this.source = p.sourceFile;
        }
      };
      function getLineInfo(input, offset) {
        for (var line = 1, cur = 0; ; ) {
          var nextBreak = nextLineBreak(input, cur, offset);
          if (nextBreak < 0) {
            return new Position(line, offset - cur);
          }
          ++line;
          cur = nextBreak;
        }
      }
      var defaultOptions = {
        // `ecmaVersion` indicates the ECMAScript version to parse. Must be
        // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
        // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
        // (the latest version the library supports). This influences
        // support for strict mode, the set of reserved words, and support
        // for new syntax features.
        ecmaVersion: null,
        // `sourceType` indicates the mode the code should be parsed in.
        // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
        // strict mode and parsing of `import` and `export` declarations.
        sourceType: "script",
        // When set to true, enable strict parsing mode even if `sourceType`
        // is `"script"`.
        strict: false,
        // `onInsertedSemicolon` can be a callback that will be called when
        // a semicolon is automatically inserted. It will be passed the
        // position of the inserted semicolon as an offset, and if
        // `locations` is enabled, it is given the location as a `{line,
        // column}` object as second argument.
        onInsertedSemicolon: null,
        // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
        // trailing commas.
        onTrailingComma: null,
        // By default, reserved words are only enforced if ecmaVersion >= 5.
        // Set `allowReserved` to a boolean value to explicitly turn this on
        // an off. When this option has the value "never", reserved words
        // and keywords can also not be used as property names.
        allowReserved: null,
        // When enabled, a return at the top level is not considered an
        // error.
        allowReturnOutsideFunction: false,
        // When enabled, import/export statements are not constrained to
        // appearing at the top of the program, and an import.meta expression
        // in a script isn't considered an error.
        allowImportExportEverywhere: false,
        // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
        // When enabled, await identifiers are allowed to appear at the top-level scope,
        // but they are still not allowed in non-async functions.
        allowAwaitOutsideFunction: null,
        // When enabled, super identifiers are not constrained to
        // appearing in methods and do not raise an error when they appear elsewhere.
        allowSuperOutsideMethod: null,
        // When enabled, hashbang directive in the beginning of file is
        // allowed and treated as a line comment. Enabled by default when
        // `ecmaVersion` >= 2023.
        allowHashBang: false,
        // By default, the parser will verify that private properties are
        // only used in places where they are valid and have been declared.
        // Set this to false to turn such checks off.
        checkPrivateFields: true,
        // When `locations` is on, `loc` properties holding objects with
        // `start` and `end` properties in `{line, column}` form (with
        // line being 1-based and column 0-based) will be attached to the
        // nodes.
        locations: false,
        // A function can be passed as `onToken` option, which will
        // cause Acorn to call that function with object in the same
        // format as tokens returned from `tokenizer().getToken()`. Note
        // that you are not allowed to call the parser from the
        // callback—that will corrupt its internal state.
        onToken: null,
        // A function can be passed as `onComment` option, which will
        // cause Acorn to call that function with `(block, text, start,
        // end)` parameters whenever a comment is skipped. `block` is a
        // boolean indicating whether this is a block (`/* */`) comment,
        // `text` is the content of the comment, and `start` and `end` are
        // character offsets that denote the start and end of the comment.
        // When the `locations` option is on, two more parameters are
        // passed, the full `{line, column}` locations of the start and
        // end of the comments. Note that you are not allowed to call the
        // parser from the callback—that will corrupt its internal state.
        // When this option has an array as value, objects representing the
        // comments are pushed to it.
        onComment: null,
        // Nodes have their start and end characters offsets recorded in
        // `start` and `end` properties (directly on the node, rather than
        // the `loc` object, which holds line/column data. To also add a
        // [semi-standardized][range] `range` property holding a `[start,
        // end]` array with the same numbers, set the `ranges` option to
        // `true`.
        //
        // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
        ranges: false,
        // It is possible to parse multiple files into a single AST by
        // passing the tree produced by parsing the first file as
        // `program` option in subsequent parses. This will add the
        // toplevel forms of the parsed file to the `Program` (top) node
        // of an existing parse tree.
        program: null,
        // When `locations` is on, you can pass this to record the source
        // file in every node's `loc` object.
        sourceFile: null,
        // This value, if given, is stored in every node, whether
        // `locations` is on or off.
        directSourceFile: null,
        // When enabled, parenthesized expressions are represented by
        // (non-standard) ParenthesizedExpression nodes
        preserveParens: false
      };
      var warnedAboutEcmaVersion = false;
      function getOptions(opts) {
        var options = {};
        for (var opt in defaultOptions) {
          options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
        }
        if (options.ecmaVersion === "latest") {
          options.ecmaVersion = 1e8;
        } else if (options.ecmaVersion == null) {
          if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
            warnedAboutEcmaVersion = true;
            console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
          }
          options.ecmaVersion = 11;
        } else if (options.ecmaVersion >= 2015) {
          options.ecmaVersion -= 2009;
        }
        if (options.allowReserved == null) {
          options.allowReserved = options.ecmaVersion < 5;
        }
        if (!opts || opts.allowHashBang == null) {
          options.allowHashBang = options.ecmaVersion >= 14;
        }
        if (isArray(options.onToken)) {
          var tokens = options.onToken;
          options.onToken = function(token) {
            return tokens.push(token);
          };
        }
        if (isArray(options.onComment)) {
          options.onComment = pushComment(options, options.onComment);
        }
        if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
          throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
        }
        return options;
      }
      function pushComment(options, array) {
        return function(block, text, start, end, startLoc, endLoc) {
          var comment = {
            type: block ? "Block" : "Line",
            value: text,
            start,
            end
          };
          if (options.locations) {
            comment.loc = new SourceLocation(this, startLoc, endLoc);
          }
          if (options.ranges) {
            comment.range = [start, end];
          }
          array.push(comment);
        };
      }
      var SCOPE_TOP = 1, SCOPE_FUNCTION = 2, SCOPE_ASYNC = 4, SCOPE_GENERATOR = 8, SCOPE_ARROW = 16, SCOPE_SIMPLE_CATCH = 32, SCOPE_SUPER = 64, SCOPE_DIRECT_SUPER = 128, SCOPE_CLASS_STATIC_BLOCK = 256, SCOPE_CLASS_FIELD_INIT = 512, SCOPE_SWITCH = 1024, SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
      function functionFlags(async, generator) {
        return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
      }
      var BIND_NONE = 0, BIND_VAR = 1, BIND_LEXICAL = 2, BIND_FUNCTION = 3, BIND_SIMPLE_CATCH = 4, BIND_OUTSIDE = 5;
      var Parser = function Parser2(options, input, startPos) {
        this.options = options = getOptions(options);
        this.sourceFile = options.sourceFile;
        this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
        var reserved = "";
        if (options.allowReserved !== true) {
          reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
          if (options.sourceType === "module") {
            reserved += " await";
          }
        }
        this.reservedWords = wordsRegexp(reserved);
        var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
        this.reservedWordsStrict = wordsRegexp(reservedStrict);
        this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
        this.input = String(input);
        this.containsEsc = false;
        if (startPos) {
          this.pos = startPos;
          this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
          this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
        } else {
          this.pos = this.lineStart = 0;
          this.curLine = 1;
        }
        this.type = types$1.eof;
        this.value = null;
        this.start = this.end = this.pos;
        this.startLoc = this.endLoc = this.curPosition();
        this.lastTokEndLoc = this.lastTokStartLoc = null;
        this.lastTokStart = this.lastTokEnd = this.pos;
        this.context = this.initialContext();
        this.exprAllowed = true;
        this.inModule = options.sourceType === "module";
        this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);
        this.potentialArrowAt = -1;
        this.potentialArrowInForAwait = false;
        this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
        this.labels = [];
        this.undefinedExports = /* @__PURE__ */ Object.create(null);
        if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
          this.skipLineComment(2);
        }
        this.scopeStack = [];
        this.enterScope(
          this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP
        );
        this.regexpState = null;
        this.privateNameStack = [];
      };
      var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
      Parser.prototype.parse = function parse2() {
        var this$1$1 = this;
        var node = this.options.program || this.startNode();
        this.nextToken();
        return this.catchStackOverflow(function() {
          return this$1$1.parseTopLevel(node);
        });
      };
      prototypeAccessors.inFunction.get = function() {
        return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
      };
      prototypeAccessors.inGenerator.get = function() {
        return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
      };
      prototypeAccessors.inAsync.get = function() {
        return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
      };
      prototypeAccessors.canAwait.get = function() {
        for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
          var ref2 = this.scopeStack[i2];
          var flags = ref2.flags;
          if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
            return false;
          }
          if (flags & SCOPE_FUNCTION) {
            return (flags & SCOPE_ASYNC) > 0;
          }
        }
        return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
      };
      prototypeAccessors.allowReturn.get = function() {
        if (this.inFunction) {
          return true;
        }
        if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
          return true;
        }
        return false;
      };
      prototypeAccessors.allowSuper.get = function() {
        var ref2 = this.currentThisScope();
        var flags = ref2.flags;
        return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
      };
      prototypeAccessors.allowDirectSuper.get = function() {
        return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
      };
      prototypeAccessors.treatFunctionsAsVar.get = function() {
        return this.treatFunctionsAsVarInScope(this.currentScope());
      };
      prototypeAccessors.allowNewDotTarget.get = function() {
        for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
          var ref2 = this.scopeStack[i2];
          var flags = ref2.flags;
          if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
            return true;
          }
        }
        return false;
      };
      prototypeAccessors.allowUsing.get = function() {
        var ref2 = this.currentScope();
        var flags = ref2.flags;
        if (flags & SCOPE_SWITCH) {
          return false;
        }
        if (!this.inModule && flags & SCOPE_TOP) {
          return false;
        }
        return true;
      };
      prototypeAccessors.inClassStaticBlock.get = function() {
        return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
      };
      Parser.extend = function extend() {
        var plugins = [], len = arguments.length;
        while (len--) plugins[len] = arguments[len];
        var cls = this;
        for (var i2 = 0; i2 < plugins.length; i2++) {
          cls = plugins[i2](cls);
        }
        return cls;
      };
      Parser.parse = function parse2(input, options) {
        return new this(options, input).parse();
      };
      Parser.parseExpressionAt = function parseExpressionAt2(input, pos, options) {
        var parser = new this(options, input, pos);
        parser.nextToken();
        return parser.parseExpression();
      };
      Parser.tokenizer = function tokenizer2(input, options) {
        return new this(options, input);
      };
      Object.defineProperties(Parser.prototype, prototypeAccessors);
      var pp$9 = Parser.prototype;
      var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
      pp$9.strictDirective = function(start) {
        if (this.options.ecmaVersion < 5) {
          return false;
        }
        for (; ; ) {
          skipWhiteSpace.lastIndex = start;
          start += skipWhiteSpace.exec(this.input)[0].length;
          var match = literal.exec(this.input.slice(start));
          if (!match) {
            return false;
          }
          if ((match[1] || match[2]) === "use strict") {
            skipWhiteSpace.lastIndex = start + match[0].length;
            var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
            var next = this.input.charAt(end);
            return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
          }
          start += match[0].length;
          skipWhiteSpace.lastIndex = start;
          start += skipWhiteSpace.exec(this.input)[0].length;
          if (this.input[start] === ";") {
            start++;
          }
        }
      };
      pp$9.eat = function(type) {
        if (this.type === type) {
          this.next();
          return true;
        } else {
          return false;
        }
      };
      pp$9.isContextual = function(name) {
        return this.type === types$1.name && this.value === name && !this.containsEsc;
      };
      pp$9.eatContextual = function(name) {
        if (!this.isContextual(name)) {
          return false;
        }
        this.next();
        return true;
      };
      pp$9.catchStackOverflow = function(f) {
        try {
          return f();
        } catch (e) {
          if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message))) {
            this.raise(this.start, "Not enough stack space to parse input");
          } else {
            throw e;
          }
        }
      };
      pp$9.expectContextual = function(name) {
        if (!this.eatContextual(name)) {
          this.unexpected();
        }
      };
      pp$9.canInsertSemicolon = function() {
        return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      };
      pp$9.insertSemicolon = function() {
        if (this.canInsertSemicolon()) {
          if (this.options.onInsertedSemicolon) {
            this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
          }
          return true;
        }
      };
      pp$9.semicolon = function() {
        if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
          this.unexpected();
        }
      };
      pp$9.afterTrailingComma = function(tokType, notNext) {
        if (this.type === tokType) {
          if (this.options.onTrailingComma) {
            this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
          }
          if (!notNext) {
            this.next();
          }
          return true;
        }
      };
      pp$9.expect = function(type) {
        this.eat(type) || this.unexpected();
      };
      pp$9.unexpected = function(pos) {
        this.raise(pos != null ? pos : this.start, "Unexpected token");
      };
      var DestructuringErrors = function DestructuringErrors2() {
        this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
      };
      pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
        if (!refDestructuringErrors) {
          return;
        }
        if (refDestructuringErrors.trailingComma > -1) {
          this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
        }
        var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
        if (parens > -1) {
          this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
        }
      };
      pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
        if (!refDestructuringErrors) {
          return false;
        }
        var shorthandAssign = refDestructuringErrors.shorthandAssign;
        var doubleProto = refDestructuringErrors.doubleProto;
        if (!andThrow) {
          return shorthandAssign >= 0 || doubleProto >= 0;
        }
        if (shorthandAssign >= 0) {
          this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
        }
        if (doubleProto >= 0) {
          this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
        }
      };
      pp$9.checkYieldAwaitInDefaultParams = function() {
        if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
          this.raise(this.yieldPos, "Yield expression cannot be a default value");
        }
        if (this.awaitPos) {
          this.raise(this.awaitPos, "Await expression cannot be a default value");
        }
      };
      pp$9.isSimpleAssignTarget = function(expr) {
        if (expr.type === "ParenthesizedExpression") {
          return this.isSimpleAssignTarget(expr.expression);
        }
        return expr.type === "Identifier" || expr.type === "MemberExpression";
      };
      var pp$8 = Parser.prototype;
      pp$8.parseTopLevel = function(node) {
        var exports$1 = /* @__PURE__ */ Object.create(null);
        if (!node.body) {
          node.body = [];
        }
        while (this.type !== types$1.eof) {
          var stmt = this.parseStatement(null, true, exports$1);
          node.body.push(stmt);
        }
        if (this.inModule) {
          for (var i2 = 0, list2 = Object.keys(this.undefinedExports); i2 < list2.length; i2 += 1) {
            var name = list2[i2];
            this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
          }
        }
        this.adaptDirectivePrologue(node.body);
        this.next();
        node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
        return this.finishNode(node, "Program");
      };
      var loopLabel = { kind: "loop" }, switchLabel = { kind: "switch" };
      pp$8.isLet = function(context) {
        if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
          return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
        if (nextCh === 91 || nextCh === 92) {
          return true;
        }
        if (context) {
          return false;
        }
        if (nextCh === 123) {
          return true;
        }
        if (isIdentifierStart(nextCh)) {
          var start = next;
          do {
            next += nextCh <= 65535 ? 1 : 2;
          } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
          if (nextCh === 92) {
            return true;
          }
          var ident = this.input.slice(start, next);
          if (!keywordRelationalOperator.test(ident)) {
            return true;
          }
        }
        return false;
      };
      pp$8.isAsyncFunction = function() {
        if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
          return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, after;
        return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
      };
      pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
        if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
          return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length;
        if (lineBreak.test(this.input.slice(this.pos, next))) {
          return false;
        }
        if (isAwaitUsing) {
          var usingEndPos = next + 5, after;
          if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
            return false;
          }
          skipWhiteSpace.lastIndex = usingEndPos;
          var skipAfterUsing = skipWhiteSpace.exec(this.input);
          next = usingEndPos + skipAfterUsing[0].length;
          if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
            return false;
          }
        }
        var ch = this.fullCharCodeAt(next);
        if (!isIdentifierStart(ch) && ch !== 92) {
          return false;
        }
        var idStart = next;
        do {
          next += ch <= 65535 ? 1 : 2;
        } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
        if (ch === 92) {
          return true;
        }
        var id = this.input.slice(idStart, next);
        if (keywordRelationalOperator.test(id)) {
          return false;
        }
        if (isFor && !isAwaitUsing && id === "of") {
          skipWhiteSpace.lastIndex = next;
          var skipAfterOf = skipWhiteSpace.exec(this.input);
          next = next + skipAfterOf[0].length;
          if (this.input.charCodeAt(next) !== 61 || // Check for ==, === and => operators
          (ch = this.input.charCodeAt(next + 1)) === 61 || ch === 62) {
            return false;
          }
        }
        return true;
      };
      pp$8.isAwaitUsing = function(isFor) {
        return this.isUsingKeyword(true, isFor);
      };
      pp$8.isUsing = function(isFor) {
        return this.isUsingKeyword(false, isFor);
      };
      pp$8.parseStatement = function(context, topLevel, exports$1) {
        var starttype = this.type, node = this.startNode(), kind;
        if (this.isLet(context)) {
          starttype = types$1._var;
          kind = "let";
        }
        switch (starttype) {
          case types$1._break:
          case types$1._continue:
            return this.parseBreakContinueStatement(node, starttype.keyword);
          case types$1._debugger:
            return this.parseDebuggerStatement(node);
          case types$1._do:
            return this.parseDoStatement(node);
          case types$1._for:
            return this.parseForStatement(node);
          case types$1._function:
            if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
              this.unexpected();
            }
            return this.parseFunctionStatement(node, false, !context);
          case types$1._class:
            if (context) {
              this.unexpected();
            }
            return this.parseClass(node, true);
          case types$1._if:
            return this.parseIfStatement(node);
          case types$1._return:
            return this.parseReturnStatement(node);
          case types$1._switch:
            return this.parseSwitchStatement(node);
          case types$1._throw:
            return this.parseThrowStatement(node);
          case types$1._try:
            return this.parseTryStatement(node);
          case types$1._const:
          case types$1._var:
            kind = kind || this.value;
            if (context && kind !== "var") {
              this.unexpected();
            }
            return this.parseVarStatement(node, kind);
          case types$1._while:
            return this.parseWhileStatement(node);
          case types$1._with:
            return this.parseWithStatement(node);
          case types$1.braceL:
            return this.parseBlock(true, node);
          case types$1.semi:
            return this.parseEmptyStatement(node);
          case types$1._export:
          case types$1._import:
            if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
              skipWhiteSpace.lastIndex = this.pos;
              var skip = skipWhiteSpace.exec(this.input);
              var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
              if (nextCh === 40 || nextCh === 46) {
                return this.parseExpressionStatement(node, this.parseExpression());
              }
            }
            if (!this.options.allowImportExportEverywhere) {
              if (!topLevel) {
                this.raise(this.start, "'import' and 'export' may only appear at the top level");
              }
              if (!this.inModule) {
                this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
              }
            }
            return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
          // If the statement does not start with a statement keyword or a
          // brace, it's an ExpressionStatement or LabeledStatement. We
          // simply start parsing an expression, and afterwards, if the
          // next token is a colon and the expression was a simple
          // Identifier node, we switch to interpreting it as a label.
          default:
            if (this.isAsyncFunction()) {
              if (context) {
                this.unexpected();
              }
              this.next();
              return this.parseFunctionStatement(node, true, !context);
            }
            var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
            if (usingKind) {
              if (!this.allowUsing) {
                this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
              }
              if (context) {
                this.raise(this.start, "Using declaration is not allowed in single-statement positions");
              }
              if (usingKind === "await using") {
                if (!this.canAwait) {
                  this.raise(this.start, "Await using cannot appear outside of async function");
                }
                this.next();
              }
              this.next();
              this.parseVar(node, false, usingKind);
              this.semicolon();
              return this.finishNode(node, "VariableDeclaration");
            }
            var maybeName = this.value, expr = this.parseExpression();
            if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
              return this.parseLabeledStatement(node, maybeName, expr, context);
            } else {
              return this.parseExpressionStatement(node, expr);
            }
        }
      };
      pp$8.parseBreakContinueStatement = function(node, keyword) {
        var isBreak = keyword === "break";
        this.next();
        if (this.eat(types$1.semi) || this.insertSemicolon()) {
          node.label = null;
        } else if (this.type !== types$1.name) {
          this.unexpected();
        } else {
          node.label = this.parseIdent();
          this.semicolon();
        }
        var i2 = 0;
        for (; i2 < this.labels.length; ++i2) {
          var lab = this.labels[i2];
          if (node.label == null || lab.name === node.label.name) {
            if (lab.kind != null && (isBreak || lab.kind === "loop")) {
              break;
            }
            if (node.label && isBreak) {
              break;
            }
          }
        }
        if (i2 === this.labels.length) {
          this.raise(node.start, "Unsyntactic " + keyword);
        }
        return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
      };
      pp$8.parseDebuggerStatement = function(node) {
        this.next();
        this.semicolon();
        return this.finishNode(node, "DebuggerStatement");
      };
      pp$8.parseDoStatement = function(node) {
        this.next();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("do");
        this.labels.pop();
        this.expect(types$1._while);
        node.test = this.parseParenExpression();
        if (this.options.ecmaVersion >= 6) {
          this.eat(types$1.semi);
        } else {
          this.semicolon();
        }
        return this.finishNode(node, "DoWhileStatement");
      };
      pp$8.parseForStatement = function(node) {
        this.next();
        var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
        this.labels.push(loopLabel);
        this.enterScope(0);
        this.expect(types$1.parenL);
        if (this.type === types$1.semi) {
          if (awaitAt > -1) {
            this.unexpected(awaitAt);
          }
          return this.parseFor(node, null);
        }
        var isLet = this.isLet();
        if (this.type === types$1._var || this.type === types$1._const || isLet) {
          var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
          this.next();
          this.parseVar(init$1, true, kind);
          this.finishNode(init$1, "VariableDeclaration");
          return this.parseForAfterInit(node, init$1, awaitAt);
        }
        var startsWithLet = this.isContextual("let"), isForOf = false;
        var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
        if (usingKind) {
          var init$2 = this.startNode();
          this.next();
          if (usingKind === "await using") {
            if (!this.canAwait) {
              this.raise(this.start, "Await using cannot appear outside of async function");
            }
            this.next();
          }
          this.parseVar(init$2, true, usingKind);
          this.finishNode(init$2, "VariableDeclaration");
          return this.parseForAfterInit(node, init$2, awaitAt);
        }
        var containsEsc = this.containsEsc;
        var refDestructuringErrors = new DestructuringErrors();
        var initPos = this.start;
        var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
        if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
          if (awaitAt > -1) {
            if (this.type === types$1._in) {
              this.unexpected(awaitAt);
            }
            node.await = true;
          } else if (isForOf && this.options.ecmaVersion >= 8) {
            if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
              this.unexpected();
            } else if (this.options.ecmaVersion >= 9) {
              node.await = false;
            }
          }
          if (startsWithLet && isForOf) {
            this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
          }
          this.toAssignable(init, false, refDestructuringErrors);
          this.checkLValPattern(init);
          return this.parseForIn(node, init);
        } else {
          this.checkExpressionErrors(refDestructuringErrors, true);
        }
        if (awaitAt > -1) {
          this.unexpected(awaitAt);
        }
        return this.parseFor(node, init);
      };
      pp$8.parseForAfterInit = function(node, init, awaitAt) {
        if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
          if (this.type === types$1._in) {
            if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
              this.raise(this.start, "Using declaration is not allowed in for-in loops");
            }
            if (this.options.ecmaVersion >= 9 && awaitAt > -1) {
              this.unexpected(awaitAt);
            }
          } else if (this.options.ecmaVersion >= 9) {
            node.await = awaitAt > -1;
          }
          return this.parseForIn(node, init);
        }
        if (awaitAt > -1) {
          this.unexpected(awaitAt);
        }
        return this.parseFor(node, init);
      };
      pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
        this.next();
        return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
      };
      pp$8.parseIfStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        node.consequent = this.parseStatement("if");
        node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
        return this.finishNode(node, "IfStatement");
      };
      pp$8.parseReturnStatement = function(node) {
        if (!this.allowReturn) {
          this.raise(this.start, "'return' outside of function");
        }
        this.next();
        if (this.eat(types$1.semi) || this.insertSemicolon()) {
          node.argument = null;
        } else {
          node.argument = this.parseExpression();
          this.semicolon();
        }
        return this.finishNode(node, "ReturnStatement");
      };
      pp$8.parseSwitchStatement = function(node) {
        this.next();
        node.discriminant = this.parseParenExpression();
        node.cases = [];
        this.expect(types$1.braceL);
        this.labels.push(switchLabel);
        this.enterScope(SCOPE_SWITCH);
        var cur;
        for (var sawDefault = false; this.type !== types$1.braceR; ) {
          if (this.type === types$1._case || this.type === types$1._default) {
            var isCase = this.type === types$1._case;
            if (cur) {
              this.finishNode(cur, "SwitchCase");
            }
            node.cases.push(cur = this.startNode());
            cur.consequent = [];
            this.next();
            if (isCase) {
              cur.test = this.parseExpression();
            } else {
              if (sawDefault) {
                this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
              }
              sawDefault = true;
              cur.test = null;
            }
            this.expect(types$1.colon);
          } else {
            if (!cur) {
              this.unexpected();
            }
            cur.consequent.push(this.parseStatement(null));
          }
        }
        this.exitScope();
        if (cur) {
          this.finishNode(cur, "SwitchCase");
        }
        this.next();
        this.labels.pop();
        return this.finishNode(node, "SwitchStatement");
      };
      pp$8.parseThrowStatement = function(node) {
        this.next();
        if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
          this.raise(this.lastTokEnd, "Illegal newline after throw");
        }
        node.argument = this.parseExpression();
        this.semicolon();
        return this.finishNode(node, "ThrowStatement");
      };
      var empty$1 = [];
      pp$8.parseCatchClauseParam = function() {
        var param = this.parseBindingAtom();
        var simple = param.type === "Identifier";
        this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
        this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
        this.expect(types$1.parenR);
        return param;
      };
      pp$8.parseTryStatement = function(node) {
        this.next();
        node.block = this.parseBlock();
        node.handler = null;
        if (this.type === types$1._catch) {
          var clause = this.startNode();
          this.next();
          if (this.eat(types$1.parenL)) {
            clause.param = this.parseCatchClauseParam();
          } else {
            if (this.options.ecmaVersion < 10) {
              this.unexpected();
            }
            clause.param = null;
            this.enterScope(0);
          }
          clause.body = this.parseBlock(false);
          this.exitScope();
          node.handler = this.finishNode(clause, "CatchClause");
        }
        node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
        if (!node.handler && !node.finalizer) {
          this.raise(node.start, "Missing catch or finally clause");
        }
        return this.finishNode(node, "TryStatement");
      };
      pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
        this.next();
        this.parseVar(node, false, kind, allowMissingInitializer);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      };
      pp$8.parseWhileStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("while");
        this.labels.pop();
        return this.finishNode(node, "WhileStatement");
      };
      pp$8.parseWithStatement = function(node) {
        if (this.strict) {
          this.raise(this.start, "'with' in strict mode");
        }
        this.next();
        node.object = this.parseParenExpression();
        node.body = this.parseStatement("with");
        return this.finishNode(node, "WithStatement");
      };
      pp$8.parseEmptyStatement = function(node) {
        this.next();
        return this.finishNode(node, "EmptyStatement");
      };
      pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
        for (var i$1 = 0, list2 = this.labels; i$1 < list2.length; i$1 += 1) {
          var label = list2[i$1];
          if (label.name === maybeName) {
            this.raise(expr.start, "Label '" + maybeName + "' is already declared");
          }
        }
        var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
        for (var i2 = this.labels.length - 1; i2 >= 0; i2--) {
          var label$1 = this.labels[i2];
          if (label$1.statementStart === node.start) {
            label$1.statementStart = this.start;
            label$1.kind = kind;
          } else {
            break;
          }
        }
        this.labels.push({ name: maybeName, kind, statementStart: this.start });
        node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
        this.labels.pop();
        node.label = expr;
        return this.finishNode(node, "LabeledStatement");
      };
      pp$8.parseExpressionStatement = function(node, expr) {
        node.expression = expr;
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement");
      };
      pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
        if (createNewLexicalScope === void 0) createNewLexicalScope = true;
        if (node === void 0) node = this.startNode();
        node.body = [];
        this.expect(types$1.braceL);
        if (createNewLexicalScope) {
          this.enterScope(0);
        }
        while (this.type !== types$1.braceR) {
          var stmt = this.parseStatement(null);
          node.body.push(stmt);
        }
        if (exitStrict) {
          this.strict = false;
        }
        this.next();
        if (createNewLexicalScope) {
          this.exitScope();
        }
        return this.finishNode(node, "BlockStatement");
      };
      pp$8.parseFor = function(node, init) {
        node.init = init;
        this.expect(types$1.semi);
        node.test = this.type === types$1.semi ? null : this.parseExpression();
        this.expect(types$1.semi);
        node.update = this.type === types$1.parenR ? null : this.parseExpression();
        this.expect(types$1.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, "ForStatement");
      };
      pp$8.parseForIn = function(node, init) {
        var isForIn = this.type === types$1._in;
        this.next();
        if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
          this.raise(
            init.start,
            (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
          );
        }
        node.left = init;
        node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
        this.expect(types$1.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
      };
      pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
        node.declarations = [];
        node.kind = kind;
        for (; ; ) {
          var decl = this.startNode();
          this.parseVarId(decl, kind);
          if (this.eat(types$1.eq)) {
            decl.init = this.parseMaybeAssign(isFor);
          } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
            this.unexpected();
          } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
            this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
          } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
            this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
          } else {
            decl.init = null;
          }
          node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
          if (!this.eat(types$1.comma)) {
            break;
          }
        }
        return node;
      };
      pp$8.parseVarId = function(decl, kind) {
        decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
        this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
      };
      var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;
      pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
        this.initFunction(node);
        if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
          if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
            this.unexpected();
          }
          node.generator = this.eat(types$1.star);
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        if (statement & FUNC_STATEMENT) {
          node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
          if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
            this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
          }
        }
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(node.async, node.generator));
        if (!(statement & FUNC_STATEMENT)) {
          node.id = this.type === types$1.name ? this.parseIdent() : null;
        }
        this.parseFunctionParams(node);
        this.parseFunctionBody(node, allowExpressionBody, false, forInit);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
      };
      pp$8.parseFunctionParams = function(node) {
        this.expect(types$1.parenL);
        node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
      };
      pp$8.parseClass = function(node, isStatement) {
        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, isStatement);
        this.parseClassSuper(node);
        var privateNameMap = this.enterClassBody();
        var classBody = this.startNode();
        var hadConstructor = false;
        classBody.body = [];
        this.expect(types$1.braceL);
        while (this.type !== types$1.braceR) {
          var element = this.parseClassElement(node.superClass !== null);
          if (element) {
            classBody.body.push(element);
            if (element.type === "MethodDefinition" && element.kind === "constructor") {
              if (hadConstructor) {
                this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
              }
              hadConstructor = true;
            } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
              this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
            }
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "ClassBody");
        this.exitClassBody();
        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
      };
      pp$8.parseClassElement = function(constructorAllowsSuper) {
        if (this.eat(types$1.semi)) {
          return null;
        }
        var ecmaVersion2 = this.options.ecmaVersion;
        var node = this.startNode();
        var keyName = "";
        var isGenerator = false;
        var isAsync = false;
        var kind = "method";
        var isStatic = false;
        if (this.eatContextual("static")) {
          if (ecmaVersion2 >= 13 && this.eat(types$1.braceL)) {
            this.parseClassStaticBlock(node);
            return node;
          }
          if (this.isClassElementNameStart() || this.type === types$1.star) {
            isStatic = true;
          } else {
            keyName = "static";
          }
        }
        node.static = isStatic;
        if (!keyName && ecmaVersion2 >= 8 && this.eatContextual("async")) {
          if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
            isAsync = true;
          } else {
            keyName = "async";
          }
        }
        if (!keyName && (ecmaVersion2 >= 9 || !isAsync) && this.eat(types$1.star)) {
          isGenerator = true;
        }
        if (!keyName && !isAsync && !isGenerator) {
          var lastValue = this.value;
          if (this.eatContextual("get") || this.eatContextual("set")) {
            if (this.isClassElementNameStart()) {
              kind = lastValue;
            } else {
              keyName = lastValue;
            }
          }
        }
        if (keyName) {
          node.computed = false;
          node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
          node.key.name = keyName;
          this.finishNode(node.key, "Identifier");
        } else {
          this.parseClassElementName(node);
        }
        if (ecmaVersion2 < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
          var isConstructor = !node.static && checkKeyName(node, "constructor");
          var allowsDirectSuper = isConstructor && constructorAllowsSuper;
          if (isConstructor && kind !== "method") {
            this.raise(node.key.start, "Constructor can't have get/set modifier");
          }
          node.kind = isConstructor ? "constructor" : kind;
          this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
        } else {
          this.parseClassField(node);
        }
        return node;
      };
      pp$8.isClassElementNameStart = function() {
        return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
      };
      pp$8.parseClassElementName = function(element) {
        if (this.type === types$1.privateId) {
          if (this.value === "constructor") {
            this.raise(this.start, "Classes can't have an element named '#constructor'");
          }
          element.computed = false;
          element.key = this.parsePrivateIdent();
        } else {
          this.parsePropertyName(element);
        }
      };
      pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
        var key = method.key;
        if (method.kind === "constructor") {
          if (isGenerator) {
            this.raise(key.start, "Constructor can't be a generator");
          }
          if (isAsync) {
            this.raise(key.start, "Constructor can't be an async method");
          }
        } else if (method.static && checkKeyName(method, "prototype")) {
          this.raise(key.start, "Classes may not have a static property named prototype");
        }
        var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
        if (method.kind === "get" && value.params.length !== 0) {
          this.raiseRecoverable(value.start, "getter should have no params");
        }
        if (method.kind === "set" && value.params.length !== 1) {
          this.raiseRecoverable(value.start, "setter should have exactly one param");
        }
        if (method.kind === "set" && value.params[0].type === "RestElement") {
          this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
        }
        return this.finishNode(method, "MethodDefinition");
      };
      pp$8.parseClassField = function(field) {
        if (checkKeyName(field, "constructor")) {
          this.raise(field.key.start, "Classes can't have a field named 'constructor'");
        } else if (field.static && checkKeyName(field, "prototype")) {
          this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
        }
        if (this.eat(types$1.eq)) {
          this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
          field.value = this.parseMaybeAssign();
          this.exitScope();
        } else {
          field.value = null;
        }
        this.semicolon();
        return this.finishNode(field, "PropertyDefinition");
      };
      pp$8.parseClassStaticBlock = function(node) {
        node.body = [];
        var oldLabels = this.labels;
        this.labels = [];
        this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
        while (this.type !== types$1.braceR) {
          var stmt = this.parseStatement(null);
          node.body.push(stmt);
        }
        this.next();
        this.exitScope();
        this.labels = oldLabels;
        return this.finishNode(node, "StaticBlock");
      };
      pp$8.parseClassId = function(node, isStatement) {
        if (this.type === types$1.name) {
          node.id = this.parseIdent();
          if (isStatement) {
            this.checkLValSimple(node.id, BIND_LEXICAL, false);
          }
        } else {
          if (isStatement === true) {
            this.unexpected();
          }
          node.id = null;
        }
      };
      pp$8.parseClassSuper = function(node) {
        node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
      };
      pp$8.enterClassBody = function() {
        var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
        this.privateNameStack.push(element);
        return element.declared;
      };
      pp$8.exitClassBody = function() {
        var ref2 = this.privateNameStack.pop();
        var declared = ref2.declared;
        var used = ref2.used;
        if (!this.options.checkPrivateFields) {
          return;
        }
        var len = this.privateNameStack.length;
        var parent = len === 0 ? null : this.privateNameStack[len - 1];
        for (var i2 = 0; i2 < used.length; ++i2) {
          var id = used[i2];
          if (!hasOwn(declared, id.name)) {
            if (parent) {
              parent.used.push(id);
            } else {
              this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
            }
          }
        }
      };
      function isPrivateNameConflicted(privateNameMap, element) {
        var name = element.key.name;
        var curr = privateNameMap[name];
        var next = "true";
        if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
          next = (element.static ? "s" : "i") + element.kind;
        }
        if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
          privateNameMap[name] = "true";
          return false;
        } else if (!curr) {
          privateNameMap[name] = next;
          return false;
        } else {
          return true;
        }
      }
      function checkKeyName(node, name) {
        var computed = node.computed;
        var key = node.key;
        return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
      }
      pp$8.parseExportAllDeclaration = function(node, exports$1) {
        if (this.options.ecmaVersion >= 11) {
          if (this.eatContextual("as")) {
            node.exported = this.parseModuleExportName();
            this.checkExport(exports$1, node.exported, this.lastTokStart);
          } else {
            node.exported = null;
          }
        }
        this.expectContextual("from");
        if (this.type !== types$1.string) {
          this.unexpected();
        }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16) {
          node.attributes = this.parseWithClause();
        }
        this.semicolon();
        return this.finishNode(node, "ExportAllDeclaration");
      };
      pp$8.parseExport = function(node, exports$1) {
        this.next();
        if (this.eat(types$1.star)) {
          return this.parseExportAllDeclaration(node, exports$1);
        }
        if (this.eat(types$1._default)) {
          this.checkExport(exports$1, "default", this.lastTokStart);
          node.declaration = this.parseExportDefaultDeclaration();
          return this.finishNode(node, "ExportDefaultDeclaration");
        }
        if (this.shouldParseExportStatement()) {
          node.declaration = this.parseExportDeclaration(node);
          if (node.declaration.type === "VariableDeclaration") {
            this.checkVariableExport(exports$1, node.declaration.declarations);
          } else {
            this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
          }
          node.specifiers = [];
          node.source = null;
          if (this.options.ecmaVersion >= 16) {
            node.attributes = [];
          }
        } else {
          node.declaration = null;
          node.specifiers = this.parseExportSpecifiers(exports$1);
          if (this.eatContextual("from")) {
            if (this.type !== types$1.string) {
              this.unexpected();
            }
            node.source = this.parseExprAtom();
            if (this.options.ecmaVersion >= 16) {
              node.attributes = this.parseWithClause();
            }
          } else {
            for (var i2 = 0, list2 = node.specifiers; i2 < list2.length; i2 += 1) {
              var spec = list2[i2];
              this.checkUnreserved(spec.local);
              this.checkLocalExport(spec.local);
              if (spec.local.type === "Literal") {
                this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
              }
            }
            node.source = null;
            if (this.options.ecmaVersion >= 16) {
              node.attributes = [];
            }
          }
          this.semicolon();
        }
        return this.finishNode(node, "ExportNamedDeclaration");
      };
      pp$8.parseExportDeclaration = function(node) {
        return this.parseStatement(null);
      };
      pp$8.parseExportDefaultDeclaration = function() {
        var isAsync;
        if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
          var fNode = this.startNode();
          this.next();
          if (isAsync) {
            this.next();
          }
          return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
        } else if (this.type === types$1._class) {
          var cNode = this.startNode();
          return this.parseClass(cNode, "nullableID");
        } else {
          var declaration = this.parseMaybeAssign();
          this.semicolon();
          return declaration;
        }
      };
      pp$8.checkExport = function(exports$1, name, pos) {
        if (!exports$1) {
          return;
        }
        if (typeof name !== "string") {
          name = name.type === "Identifier" ? name.name : name.value;
        }
        if (hasOwn(exports$1, name)) {
          this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
        }
        exports$1[name] = true;
      };
      pp$8.checkPatternExport = function(exports$1, pat) {
        var type = pat.type;
        if (type === "Identifier") {
          this.checkExport(exports$1, pat, pat.start);
        } else if (type === "ObjectPattern") {
          for (var i2 = 0, list2 = pat.properties; i2 < list2.length; i2 += 1) {
            var prop = list2[i2];
            this.checkPatternExport(exports$1, prop);
          }
        } else if (type === "ArrayPattern") {
          for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
            var elt = list$1[i$1];
            if (elt) {
              this.checkPatternExport(exports$1, elt);
            }
          }
        } else if (type === "Property") {
          this.checkPatternExport(exports$1, pat.value);
        } else if (type === "AssignmentPattern") {
          this.checkPatternExport(exports$1, pat.left);
        } else if (type === "RestElement") {
          this.checkPatternExport(exports$1, pat.argument);
        }
      };
      pp$8.checkVariableExport = function(exports$1, decls) {
        if (!exports$1) {
          return;
        }
        for (var i2 = 0, list2 = decls; i2 < list2.length; i2 += 1) {
          var decl = list2[i2];
          this.checkPatternExport(exports$1, decl.id);
        }
      };
      pp$8.shouldParseExportStatement = function() {
        return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
      };
      pp$8.parseExportSpecifier = function(exports$1) {
        var node = this.startNode();
        node.local = this.parseModuleExportName();
        node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
        this.checkExport(
          exports$1,
          node.exported,
          node.exported.start
        );
        return this.finishNode(node, "ExportSpecifier");
      };
      pp$8.parseExportSpecifiers = function(exports$1) {
        var nodes = [], first = true;
        this.expect(types$1.braceL);
        while (!this.eat(types$1.braceR)) {
          if (!first) {
            this.expect(types$1.comma);
            if (this.afterTrailingComma(types$1.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          nodes.push(this.parseExportSpecifier(exports$1));
        }
        return nodes;
      };
      pp$8.parseImport = function(node) {
        this.next();
        if (this.type === types$1.string) {
          node.specifiers = empty$1;
          node.source = this.parseExprAtom();
        } else {
          node.specifiers = this.parseImportSpecifiers();
          this.expectContextual("from");
          node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
        }
        if (this.options.ecmaVersion >= 16) {
          node.attributes = this.parseWithClause();
        }
        this.semicolon();
        return this.finishNode(node, "ImportDeclaration");
      };
      pp$8.parseImportSpecifier = function() {
        var node = this.startNode();
        node.imported = this.parseModuleExportName();
        if (this.eatContextual("as")) {
          node.local = this.parseIdent();
        } else {
          this.checkUnreserved(node.imported);
          node.local = node.imported;
        }
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportSpecifier");
      };
      pp$8.parseImportDefaultSpecifier = function() {
        var node = this.startNode();
        node.local = this.parseIdent();
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportDefaultSpecifier");
      };
      pp$8.parseImportNamespaceSpecifier = function() {
        var node = this.startNode();
        this.next();
        this.expectContextual("as");
        node.local = this.parseIdent();
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportNamespaceSpecifier");
      };
      pp$8.parseImportSpecifiers = function() {
        var nodes = [], first = true;
        if (this.type === types$1.name) {
          nodes.push(this.parseImportDefaultSpecifier());
          if (!this.eat(types$1.comma)) {
            return nodes;
          }
        }
        if (this.type === types$1.star) {
          nodes.push(this.parseImportNamespaceSpecifier());
          return nodes;
        }
        this.expect(types$1.braceL);
        while (!this.eat(types$1.braceR)) {
          if (!first) {
            this.expect(types$1.comma);
            if (this.afterTrailingComma(types$1.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          nodes.push(this.parseImportSpecifier());
        }
        return nodes;
      };
      pp$8.parseWithClause = function() {
        var nodes = [];
        if (!this.eat(types$1._with)) {
          return nodes;
        }
        this.expect(types$1.braceL);
        var attributeKeys = {};
        var first = true;
        while (!this.eat(types$1.braceR)) {
          if (!first) {
            this.expect(types$1.comma);
            if (this.afterTrailingComma(types$1.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          var attr = this.parseImportAttribute();
          var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
          if (hasOwn(attributeKeys, keyName)) {
            this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
          }
          attributeKeys[keyName] = true;
          nodes.push(attr);
        }
        return nodes;
      };
      pp$8.parseImportAttribute = function() {
        var node = this.startNode();
        node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
        this.expect(types$1.colon);
        if (this.type !== types$1.string) {
          this.unexpected();
        }
        node.value = this.parseExprAtom();
        return this.finishNode(node, "ImportAttribute");
      };
      pp$8.parseModuleExportName = function() {
        if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
          var stringLiteral = this.parseLiteral(this.value);
          if (loneSurrogate.test(stringLiteral.value)) {
            this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
          }
          return stringLiteral;
        }
        return this.parseIdent(true);
      };
      pp$8.adaptDirectivePrologue = function(statements) {
        for (var i2 = 0; i2 < statements.length && this.isDirectiveCandidate(statements[i2]); ++i2) {
          statements[i2].directive = statements[i2].expression.raw.slice(1, -1);
        }
      };
      pp$8.isDirectiveCandidate = function(statement) {
        return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
        (this.input[statement.start] === '"' || this.input[statement.start] === "'");
      };
      var pp$7 = Parser.prototype;
      pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 6 && node) {
          switch (node.type) {
            case "Identifier":
              if (this.inAsync && node.name === "await") {
                this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
              }
              break;
            case "ObjectPattern":
            case "ArrayPattern":
            case "AssignmentPattern":
            case "RestElement":
              break;
            case "ObjectExpression":
              node.type = "ObjectPattern";
              if (refDestructuringErrors) {
                this.checkPatternErrors(refDestructuringErrors, true);
              }
              for (var i2 = 0, list2 = node.properties; i2 < list2.length; i2 += 1) {
                var prop = list2[i2];
                this.toAssignable(prop, isBinding);
                if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
                  this.raise(prop.argument.start, "Unexpected token");
                }
              }
              break;
            case "Property":
              if (node.kind !== "init") {
                this.raise(node.key.start, "Object pattern can't contain getter or setter");
              }
              this.toAssignable(node.value, isBinding);
              break;
            case "ArrayExpression":
              node.type = "ArrayPattern";
              if (refDestructuringErrors) {
                this.checkPatternErrors(refDestructuringErrors, true);
              }
              this.toAssignableList(node.elements, isBinding);
              break;
            case "SpreadElement":
              node.type = "RestElement";
              this.toAssignable(node.argument, isBinding);
              if (node.argument.type === "AssignmentPattern") {
                this.raise(node.argument.start, "Rest elements cannot have a default value");
              }
              break;
            case "AssignmentExpression":
              if (node.operator !== "=") {
                this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
              }
              node.type = "AssignmentPattern";
              delete node.operator;
              this.toAssignable(node.left, isBinding);
              break;
            case "ParenthesizedExpression":
              this.toAssignable(node.expression, isBinding, refDestructuringErrors);
              break;
            case "ChainExpression":
              this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
              break;
            case "MemberExpression":
              if (!isBinding) {
                break;
              }
            default:
              this.raise(node.start, "Assigning to rvalue");
          }
        } else if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        return node;
      };
      pp$7.toAssignableList = function(exprList, isBinding) {
        var end = exprList.length;
        for (var i2 = 0; i2 < end; i2++) {
          var elt = exprList[i2];
          if (elt) {
            this.toAssignable(elt, isBinding);
          }
        }
        if (end) {
          var last = exprList[end - 1];
          if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
            this.unexpected(last.argument.start);
          }
        }
        return exprList;
      };
      pp$7.parseSpread = function(refDestructuringErrors) {
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
        return this.finishNode(node, "SpreadElement");
      };
      pp$7.parseRestBinding = function() {
        var node = this.startNode();
        this.next();
        if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
          this.unexpected();
        }
        node.argument = this.parseBindingAtom();
        return this.finishNode(node, "RestElement");
      };
      pp$7.parseBindingAtom = function() {
        if (this.options.ecmaVersion >= 6) {
          switch (this.type) {
            case types$1.bracketL:
              var node = this.startNode();
              this.next();
              node.elements = this.parseBindingList(types$1.bracketR, true, true);
              return this.finishNode(node, "ArrayPattern");
            case types$1.braceL:
              return this.parseObj(true);
          }
        }
        return this.parseIdent();
      };
      pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
        var elts = [], first = true;
        while (!this.eat(close)) {
          if (first) {
            first = false;
          } else {
            this.expect(types$1.comma);
          }
          if (allowEmpty && this.type === types$1.comma) {
            elts.push(null);
          } else if (allowTrailingComma && this.afterTrailingComma(close)) {
            break;
          } else if (this.type === types$1.ellipsis) {
            var rest = this.parseRestBinding();
            this.parseBindingListItem(rest);
            elts.push(rest);
            if (this.type === types$1.comma) {
              this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
            }
            this.expect(close);
            break;
          } else {
            elts.push(this.parseAssignableListItem(allowModifiers));
          }
        }
        return elts;
      };
      pp$7.parseAssignableListItem = function(allowModifiers) {
        var elem = this.parseMaybeDefault(this.start, this.startLoc);
        this.parseBindingListItem(elem);
        return elem;
      };
      pp$7.parseBindingListItem = function(param) {
        return param;
      };
      pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
        left = left || this.parseBindingAtom();
        if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
          return left;
        }
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.right = this.parseMaybeAssign();
        return this.finishNode(node, "AssignmentPattern");
      };
      pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        var isBind = bindingType !== BIND_NONE;
        switch (expr.type) {
          case "Identifier":
            if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
              this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
            }
            if (isBind) {
              if (bindingType === BIND_LEXICAL && expr.name === "let") {
                this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
              }
              if (checkClashes) {
                if (hasOwn(checkClashes, expr.name)) {
                  this.raiseRecoverable(expr.start, "Argument name clash");
                }
                checkClashes[expr.name] = true;
              }
              if (bindingType !== BIND_OUTSIDE) {
                this.declareName(expr.name, bindingType, expr.start);
              }
            }
            break;
          case "ChainExpression":
            this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
            break;
          case "MemberExpression":
            if (isBind) {
              this.raiseRecoverable(expr.start, "Binding member expression");
            }
            break;
          case "ParenthesizedExpression":
            if (isBind) {
              this.raiseRecoverable(expr.start, "Binding parenthesized expression");
            }
            return this.checkLValSimple(expr.expression, bindingType, checkClashes);
          default:
            this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
        }
      };
      pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        switch (expr.type) {
          case "ObjectPattern":
            for (var i2 = 0, list2 = expr.properties; i2 < list2.length; i2 += 1) {
              var prop = list2[i2];
              this.checkLValInnerPattern(prop, bindingType, checkClashes);
            }
            break;
          case "ArrayPattern":
            for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
              var elem = list$1[i$1];
              if (elem) {
                this.checkLValInnerPattern(elem, bindingType, checkClashes);
              }
            }
            break;
          default:
            this.checkLValSimple(expr, bindingType, checkClashes);
        }
      };
      pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        switch (expr.type) {
          case "Property":
            this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
            break;
          case "AssignmentPattern":
            this.checkLValPattern(expr.left, bindingType, checkClashes);
            break;
          case "RestElement":
            this.checkLValPattern(expr.argument, bindingType, checkClashes);
            break;
          default:
            this.checkLValPattern(expr, bindingType, checkClashes);
        }
      };
      var TokContext = function TokContext2(token, isExpr, preserveSpace, override, generator) {
        this.token = token;
        this.isExpr = !!isExpr;
        this.preserveSpace = !!preserveSpace;
        this.override = override;
        this.generator = !!generator;
      };
      var types = {
        b_stat: new TokContext("{", false),
        b_expr: new TokContext("{", true),
        b_tmpl: new TokContext("${", false),
        p_stat: new TokContext("(", false),
        p_expr: new TokContext("(", true),
        q_tmpl: new TokContext("`", true, true, function(p) {
          return p.tryReadTemplateToken();
        }),
        f_stat: new TokContext("function", false),
        f_expr: new TokContext("function", true),
        f_expr_gen: new TokContext("function", true, false, null, true),
        f_gen: new TokContext("function", false, false, null, true)
      };
      var pp$6 = Parser.prototype;
      pp$6.initialContext = function() {
        return [types.b_stat];
      };
      pp$6.curContext = function() {
        return this.context[this.context.length - 1];
      };
      pp$6.braceIsBlock = function(prevType) {
        var parent = this.curContext();
        if (parent === types.f_expr || parent === types.f_stat) {
          return true;
        }
        if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
          return !parent.isExpr;
        }
        if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
          return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
        }
        if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
          return true;
        }
        if (prevType === types$1.braceL) {
          return parent === types.b_stat;
        }
        if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
          return false;
        }
        return !this.exprAllowed;
      };
      pp$6.inGeneratorContext = function() {
        for (var i2 = this.context.length - 1; i2 >= 1; i2--) {
          var context = this.context[i2];
          if (context.token === "function") {
            return context.generator;
          }
        }
        return false;
      };
      pp$6.updateContext = function(prevType) {
        var update, type = this.type;
        if (type.keyword && prevType === types$1.dot) {
          this.exprAllowed = false;
        } else if (update = type.updateContext) {
          update.call(this, prevType);
        } else {
          this.exprAllowed = type.beforeExpr;
        }
      };
      pp$6.overrideContext = function(tokenCtx) {
        if (this.curContext() !== tokenCtx) {
          this.context[this.context.length - 1] = tokenCtx;
        }
      };
      types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
        if (this.context.length === 1) {
          this.exprAllowed = true;
          return;
        }
        var out = this.context.pop();
        if (out === types.b_stat && this.curContext().token === "function") {
          out = this.context.pop();
        }
        this.exprAllowed = !out.isExpr;
      };
      types$1.braceL.updateContext = function(prevType) {
        this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
        this.exprAllowed = true;
      };
      types$1.dollarBraceL.updateContext = function() {
        this.context.push(types.b_tmpl);
        this.exprAllowed = true;
      };
      types$1.parenL.updateContext = function(prevType) {
        var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
        this.context.push(statementParens ? types.p_stat : types.p_expr);
        this.exprAllowed = true;
      };
      types$1.incDec.updateContext = function() {
      };
      types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
        if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
          this.context.push(types.f_expr);
        } else {
          this.context.push(types.f_stat);
        }
        this.exprAllowed = false;
      };
      types$1.colon.updateContext = function() {
        if (this.curContext().token === "function") {
          this.context.pop();
        }
        this.exprAllowed = true;
      };
      types$1.backQuote.updateContext = function() {
        if (this.curContext() === types.q_tmpl) {
          this.context.pop();
        } else {
          this.context.push(types.q_tmpl);
        }
        this.exprAllowed = false;
      };
      types$1.star.updateContext = function(prevType) {
        if (prevType === types$1._function) {
          var index = this.context.length - 1;
          if (this.context[index] === types.f_expr) {
            this.context[index] = types.f_expr_gen;
          } else {
            this.context[index] = types.f_gen;
          }
        }
        this.exprAllowed = true;
      };
      types$1.name.updateContext = function(prevType) {
        var allowed = false;
        if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
          if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
            allowed = true;
          }
        }
        this.exprAllowed = allowed;
      };
      var pp$5 = Parser.prototype;
      pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
          return;
        }
        if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
          return;
        }
        var key = prop.key;
        var name;
        switch (key.type) {
          case "Identifier":
            name = key.name;
            break;
          case "Literal":
            name = String(key.value);
            break;
          default:
            return;
        }
        var kind = prop.kind;
        if (this.options.ecmaVersion >= 6) {
          if (name === "__proto__" && kind === "init") {
            if (propHash.proto) {
              if (refDestructuringErrors) {
                if (refDestructuringErrors.doubleProto < 0) {
                  refDestructuringErrors.doubleProto = key.start;
                }
              } else {
                this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
              }
            }
            propHash.proto = true;
          }
          return;
        }
        name = "$" + name;
        var other = propHash[name];
        if (other) {
          var redefinition;
          if (kind === "init") {
            redefinition = this.strict && other.init || other.get || other.set;
          } else {
            redefinition = other.init || other[kind];
          }
          if (redefinition) {
            this.raiseRecoverable(key.start, "Redefinition of property");
          }
        } else {
          other = propHash[name] = {
            init: false,
            get: false,
            set: false
          };
        }
        other[kind] = true;
      };
      pp$5.parseExpression = function(forInit, refDestructuringErrors) {
        var this$1$1 = this;
        return this.catchStackOverflow(function() {
          var startPos = this$1$1.start, startLoc = this$1$1.startLoc;
          var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
          if (this$1$1.type === types$1.comma) {
            var node = this$1$1.startNodeAt(startPos, startLoc);
            node.expressions = [expr];
            while (this$1$1.eat(types$1.comma)) {
              node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors));
            }
            return this$1$1.finishNode(node, "SequenceExpression");
          }
          return expr;
        });
      };
      pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
        if (this.isContextual("yield")) {
          if (this.inGenerator) {
            return this.parseYield(forInit);
          } else {
            this.exprAllowed = false;
          }
        }
        var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
        if (refDestructuringErrors) {
          oldParenAssign = refDestructuringErrors.parenthesizedAssign;
          oldTrailingComma = refDestructuringErrors.trailingComma;
          oldDoubleProto = refDestructuringErrors.doubleProto;
          refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
        } else {
          refDestructuringErrors = new DestructuringErrors();
          ownDestructuringErrors = true;
        }
        var startPos = this.start, startLoc = this.startLoc;
        if (this.type === types$1.parenL || this.type === types$1.name) {
          this.potentialArrowAt = this.start;
          this.potentialArrowInForAwait = forInit === "await";
        }
        var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
        if (afterLeftParse) {
          left = afterLeftParse.call(this, left, startPos, startLoc);
        }
        if (this.type.isAssign) {
          var node = this.startNodeAt(startPos, startLoc);
          node.operator = this.value;
          if (this.type === types$1.eq) {
            left = this.toAssignable(left, false, refDestructuringErrors);
          }
          if (!ownDestructuringErrors) {
            refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
          }
          if (refDestructuringErrors.shorthandAssign >= left.start) {
            refDestructuringErrors.shorthandAssign = -1;
          }
          if (this.type === types$1.eq) {
            this.checkLValPattern(left);
          } else {
            this.checkLValSimple(left);
          }
          node.left = left;
          this.next();
          node.right = this.parseMaybeAssign(forInit);
          if (oldDoubleProto > -1) {
            refDestructuringErrors.doubleProto = oldDoubleProto;
          }
          return this.finishNode(node, "AssignmentExpression");
        } else {
          if (ownDestructuringErrors) {
            this.checkExpressionErrors(refDestructuringErrors, true);
          }
        }
        if (oldParenAssign > -1) {
          refDestructuringErrors.parenthesizedAssign = oldParenAssign;
        }
        if (oldTrailingComma > -1) {
          refDestructuringErrors.trailingComma = oldTrailingComma;
        }
        return left;
      };
      pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprOps(forInit, refDestructuringErrors);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
          return expr;
        }
        if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.test = expr;
          node.consequent = this.parseMaybeAssign();
          this.expect(types$1.colon);
          node.alternate = this.parseMaybeAssign(forInit);
          return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
      };
      pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
          return expr;
        }
        return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
      };
      pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
        var prec = this.type.binop;
        if (prec != null && (!forInit || this.type !== types$1._in)) {
          if (prec > minPrec) {
            var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
            var coalesce = this.type === types$1.coalesce;
            if (coalesce) {
              prec = types$1.logicalAND.binop;
            }
            var op = this.value;
            this.next();
            var startPos = this.start, startLoc = this.startLoc;
            var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
            var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
            if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
              this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
            }
            return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
          }
        }
        return left;
      };
      pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
        if (right.type === "PrivateIdentifier") {
          this.raise(right.start, "Private identifier can only be left side of binary expression");
        }
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.operator = op;
        node.right = right;
        return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
      };
      pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
        var startPos = this.start, startLoc = this.startLoc, expr;
        if (this.isContextual("await") && this.canAwait) {
          expr = this.parseAwait(forInit);
          sawUnary = true;
        } else if (this.type.prefix) {
          var node = this.startNode(), update = this.type === types$1.incDec;
          node.operator = this.value;
          node.prefix = true;
          this.next();
          node.argument = this.parseMaybeUnary(null, true, update, forInit);
          this.checkExpressionErrors(refDestructuringErrors, true);
          if (update) {
            this.checkLValSimple(node.argument);
          } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
            this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
          } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
            this.raiseRecoverable(node.start, "Private fields can not be deleted");
          } else {
            sawUnary = true;
          }
          expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        } else if (!sawUnary && this.type === types$1.privateId) {
          if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
            this.unexpected();
          }
          expr = this.parsePrivateIdent();
          if (this.type !== types$1._in) {
            this.unexpected();
          }
        } else {
          expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
          if (this.checkExpressionErrors(refDestructuringErrors)) {
            return expr;
          }
          while (this.type.postfix && !this.canInsertSemicolon()) {
            var node$1 = this.startNodeAt(startPos, startLoc);
            node$1.operator = this.value;
            node$1.prefix = false;
            node$1.argument = expr;
            this.checkLValSimple(expr);
            this.next();
            expr = this.finishNode(node$1, "UpdateExpression");
          }
        }
        if (!incDec && this.eat(types$1.starstar)) {
          if (sawUnary) {
            this.unexpected(this.lastTokStart);
          } else {
            return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
          }
        } else {
          return expr;
        }
      };
      function isLocalVariableAccess(node) {
        return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
      }
      function isPrivateFieldAccess(node) {
        return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
      }
      pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprAtom(refDestructuringErrors, forInit);
        if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
          return expr;
        }
        var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
        if (refDestructuringErrors && result.type === "MemberExpression") {
          if (refDestructuringErrors.parenthesizedAssign >= result.start) {
            refDestructuringErrors.parenthesizedAssign = -1;
          }
          if (refDestructuringErrors.parenthesizedBind >= result.start) {
            refDestructuringErrors.parenthesizedBind = -1;
          }
          if (refDestructuringErrors.trailingComma >= result.start) {
            refDestructuringErrors.trailingComma = -1;
          }
        }
        return result;
      };
      pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
        var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
        var optionalChained = false;
        while (true) {
          var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
          if (element.optional) {
            optionalChained = true;
          }
          if (element === base || element.type === "ArrowFunctionExpression") {
            if (optionalChained) {
              var chainNode = this.startNodeAt(startPos, startLoc);
              chainNode.expression = element;
              element = this.finishNode(chainNode, "ChainExpression");
            }
            return element;
          }
          base = element;
        }
      };
      pp$5.shouldParseAsyncArrow = function() {
        return !this.canInsertSemicolon() && this.eat(types$1.arrow);
      };
      pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
      };
      pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
        var optionalSupported = this.options.ecmaVersion >= 11;
        var optional = optionalSupported && this.eat(types$1.questionDot);
        if (noCalls && optional) {
          this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
        }
        var computed = this.eat(types$1.bracketL);
        if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          if (computed) {
            node.property = this.parseExpression();
            this.expect(types$1.bracketR);
          } else if (this.type === types$1.privateId && base.type !== "Super") {
            node.property = this.parsePrivateIdent();
          } else {
            node.property = this.parseIdent(this.options.allowReserved !== "never");
          }
          node.computed = !!computed;
          if (optionalSupported) {
            node.optional = optional;
          }
          base = this.finishNode(node, "MemberExpression");
        } else if (!noCalls && this.eat(types$1.parenL)) {
          var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
          this.yieldPos = 0;
          this.awaitPos = 0;
          this.awaitIdentPos = 0;
          var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
          if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
            this.checkPatternErrors(refDestructuringErrors, false);
            this.checkYieldAwaitInDefaultParams();
            if (this.awaitIdentPos > 0) {
              this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
            }
            this.yieldPos = oldYieldPos;
            this.awaitPos = oldAwaitPos;
            this.awaitIdentPos = oldAwaitIdentPos;
            return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
          }
          this.checkExpressionErrors(refDestructuringErrors, true);
          this.yieldPos = oldYieldPos || this.yieldPos;
          this.awaitPos = oldAwaitPos || this.awaitPos;
          this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
          var node$1 = this.startNodeAt(startPos, startLoc);
          node$1.callee = base;
          node$1.arguments = exprList;
          if (optionalSupported) {
            node$1.optional = optional;
          }
          base = this.finishNode(node$1, "CallExpression");
        } else if (this.type === types$1.backQuote) {
          if (optional || optionalChained) {
            this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
          }
          var node$2 = this.startNodeAt(startPos, startLoc);
          node$2.tag = base;
          node$2.quasi = this.parseTemplate({ isTagged: true });
          base = this.finishNode(node$2, "TaggedTemplateExpression");
        }
        return base;
      };
      pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
        if (this.type === types$1.slash) {
          this.readRegexp();
        }
        var node, canBeArrow = this.potentialArrowAt === this.start;
        switch (this.type) {
          case types$1._super:
            if (!this.allowSuper) {
              this.raise(this.start, "'super' keyword outside a method");
            }
            node = this.startNode();
            this.next();
            if (this.type === types$1.parenL && !this.allowDirectSuper) {
              this.raise(node.start, "super() call outside constructor of a subclass");
            }
            if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
              this.unexpected();
            }
            return this.finishNode(node, "Super");
          case types$1._this:
            node = this.startNode();
            this.next();
            return this.finishNode(node, "ThisExpression");
          case types$1.name:
            var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
            var id = this.parseIdent(false);
            if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
              this.overrideContext(types.f_expr);
              return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
            }
            if (canBeArrow && !this.canInsertSemicolon()) {
              if (this.eat(types$1.arrow)) {
                return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
              }
              if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
                id = this.parseIdent(false);
                if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
                  this.unexpected();
                }
                return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
              }
            }
            return id;
          case types$1.regexp:
            var value = this.value;
            node = this.parseLiteral(value.value);
            node.regex = { pattern: value.pattern, flags: value.flags };
            return node;
          case types$1.num:
          case types$1.string:
            return this.parseLiteral(this.value);
          case types$1._null:
          case types$1._true:
          case types$1._false:
            node = this.startNode();
            node.value = this.type === types$1._null ? null : this.type === types$1._true;
            node.raw = this.type.keyword;
            this.next();
            return this.finishNode(node, "Literal");
          case types$1.parenL:
            var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
            if (refDestructuringErrors) {
              if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
                refDestructuringErrors.parenthesizedAssign = start;
              }
              if (refDestructuringErrors.parenthesizedBind < 0) {
                refDestructuringErrors.parenthesizedBind = start;
              }
            }
            return expr;
          case types$1.bracketL:
            node = this.startNode();
            this.next();
            node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
            return this.finishNode(node, "ArrayExpression");
          case types$1.braceL:
            this.overrideContext(types.b_expr);
            return this.parseObj(false, refDestructuringErrors);
          case types$1._function:
            node = this.startNode();
            this.next();
            return this.parseFunction(node, 0);
          case types$1._class:
            return this.parseClass(this.startNode(), false);
          case types$1._new:
            return this.parseNew();
          case types$1.backQuote:
            return this.parseTemplate();
          case types$1._import:
            if (this.options.ecmaVersion >= 11) {
              return this.parseExprImport(forNew);
            } else {
              return this.unexpected();
            }
          default:
            return this.parseExprAtomDefault();
        }
      };
      pp$5.parseExprAtomDefault = function() {
        this.unexpected();
      };
      pp$5.parseExprImport = function(forNew) {
        var node = this.startNode();
        if (this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword import");
        }
        this.next();
        if (this.type === types$1.parenL && !forNew) {
          return this.parseDynamicImport(node);
        } else if (this.type === types$1.dot) {
          var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
          meta.name = "import";
          node.meta = this.finishNode(meta, "Identifier");
          return this.parseImportMeta(node);
        } else {
          this.unexpected();
        }
      };
      pp$5.parseDynamicImport = function(node) {
        this.next();
        node.source = this.parseMaybeAssign();
        if (this.options.ecmaVersion >= 16) {
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              node.options = this.parseMaybeAssign();
              if (!this.eat(types$1.parenR)) {
                this.expect(types$1.comma);
                if (!this.afterTrailingComma(types$1.parenR)) {
                  this.unexpected();
                }
              }
            } else {
              node.options = null;
            }
          } else {
            node.options = null;
          }
        } else {
          if (!this.eat(types$1.parenR)) {
            var errorPos = this.start;
            if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
              this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
            } else {
              this.unexpected(errorPos);
            }
          }
        }
        return this.finishNode(node, "ImportExpression");
      };
      pp$5.parseImportMeta = function(node) {
        this.next();
        var containsEsc = this.containsEsc;
        node.property = this.parseIdent(true);
        if (node.property.name !== "meta") {
          this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
        }
        if (containsEsc) {
          this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
        }
        if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
          this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
        }
        return this.finishNode(node, "MetaProperty");
      };
      pp$5.parseLiteral = function(value) {
        var node = this.startNode();
        node.value = value;
        node.raw = this.input.slice(this.start, this.end);
        if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
          node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
        }
        this.next();
        return this.finishNode(node, "Literal");
      };
      pp$5.parseParenExpression = function() {
        this.expect(types$1.parenL);
        var val = this.parseExpression();
        this.expect(types$1.parenR);
        return val;
      };
      pp$5.shouldParseArrow = function(exprList) {
        return !this.canInsertSemicolon();
      };
      pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
        var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
        if (this.options.ecmaVersion >= 6) {
          this.next();
          var innerStartPos = this.start, innerStartLoc = this.startLoc;
          var exprList = [], first = true, lastIsComma = false;
          var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
          this.yieldPos = 0;
          this.awaitPos = 0;
          while (this.type !== types$1.parenR) {
            first ? first = false : this.expect(types$1.comma);
            if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
              lastIsComma = true;
              break;
            } else if (this.type === types$1.ellipsis) {
              spreadStart = this.start;
              exprList.push(this.parseParenItem(this.parseRestBinding()));
              if (this.type === types$1.comma) {
                this.raiseRecoverable(
                  this.start,
                  "Comma is not permitted after the rest element"
                );
              }
              break;
            } else {
              exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
            }
          }
          var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
          this.expect(types$1.parenR);
          if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
            this.checkPatternErrors(refDestructuringErrors, false);
            this.checkYieldAwaitInDefaultParams();
            this.yieldPos = oldYieldPos;
            this.awaitPos = oldAwaitPos;
            return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
          }
          if (!exprList.length || lastIsComma) {
            this.unexpected(this.lastTokStart);
          }
          if (spreadStart) {
            this.unexpected(spreadStart);
          }
          this.checkExpressionErrors(refDestructuringErrors, true);
          this.yieldPos = oldYieldPos || this.yieldPos;
          this.awaitPos = oldAwaitPos || this.awaitPos;
          if (exprList.length > 1) {
            val = this.startNodeAt(innerStartPos, innerStartLoc);
            val.expressions = exprList;
            this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
          } else {
            val = exprList[0];
          }
        } else {
          val = this.parseParenExpression();
        }
        if (this.options.preserveParens) {
          var par = this.startNodeAt(startPos, startLoc);
          par.expression = val;
          return this.finishNode(par, "ParenthesizedExpression");
        } else {
          return val;
        }
      };
      pp$5.parseParenItem = function(item) {
        return item;
      };
      pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
      };
      var empty = [];
      pp$5.parseNew = function() {
        if (this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword new");
        }
        var node = this.startNode();
        this.next();
        if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
          var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
          meta.name = "new";
          node.meta = this.finishNode(meta, "Identifier");
          this.next();
          var containsEsc = this.containsEsc;
          node.property = this.parseIdent(true);
          if (node.property.name !== "target") {
            this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
          }
          if (containsEsc) {
            this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
          }
          if (!this.allowNewDotTarget) {
            this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
          }
          return this.finishNode(node, "MetaProperty");
        }
        var startPos = this.start, startLoc = this.startLoc;
        node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
        if (node.callee.type === "Super") {
          this.raiseRecoverable(startPos, "Invalid use of 'super'");
        }
        if (this.eat(types$1.parenL)) {
          node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
        } else {
          node.arguments = empty;
        }
        return this.finishNode(node, "NewExpression");
      };
      pp$5.parseTemplateElement = function(ref2) {
        var isTagged = ref2.isTagged;
        var elem = this.startNode();
        if (this.type === types$1.invalidTemplate) {
          if (!isTagged) {
            this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
          }
          elem.value = {
            raw: this.value.replace(/\r\n?/g, "\n"),
            cooked: null
          };
        } else {
          elem.value = {
            raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
            cooked: this.value
          };
        }
        this.next();
        elem.tail = this.type === types$1.backQuote;
        return this.finishNode(elem, "TemplateElement");
      };
      pp$5.parseTemplate = function(ref2) {
        if (ref2 === void 0) ref2 = {};
        var isTagged = ref2.isTagged;
        if (isTagged === void 0) isTagged = false;
        var node = this.startNode();
        this.next();
        node.expressions = [];
        var curElt = this.parseTemplateElement({ isTagged });
        node.quasis = [curElt];
        while (!curElt.tail) {
          if (this.type === types$1.eof) {
            this.raise(this.pos, "Unterminated template literal");
          }
          this.expect(types$1.dollarBraceL);
          node.expressions.push(this.parseExpression());
          this.expect(types$1.braceR);
          node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
        }
        this.next();
        return this.finishNode(node, "TemplateLiteral");
      };
      pp$5.isAsyncProp = function(prop) {
        return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      };
      pp$5.parseObj = function(isPattern, refDestructuringErrors) {
        var node = this.startNode(), first = true, propHash = {};
        node.properties = [];
        this.next();
        while (!this.eat(types$1.braceR)) {
          if (!first) {
            this.expect(types$1.comma);
            if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
              break;
            }
          } else {
            first = false;
          }
          var prop = this.parseProperty(isPattern, refDestructuringErrors);
          if (!isPattern) {
            this.checkPropClash(prop, propHash, refDestructuringErrors);
          }
          node.properties.push(prop);
        }
        return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
      };
      pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
        var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
        if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
          if (isPattern) {
            prop.argument = this.parseIdent(false);
            if (this.type === types$1.comma) {
              this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
            }
            return this.finishNode(prop, "RestElement");
          }
          prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
          if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
            refDestructuringErrors.trailingComma = this.start;
          }
          return this.finishNode(prop, "SpreadElement");
        }
        if (this.options.ecmaVersion >= 6) {
          prop.method = false;
          prop.shorthand = false;
          if (isPattern || refDestructuringErrors) {
            startPos = this.start;
            startLoc = this.startLoc;
          }
          if (!isPattern) {
            isGenerator = this.eat(types$1.star);
          }
        }
        var containsEsc = this.containsEsc;
        this.parsePropertyName(prop);
        if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
          isAsync = true;
          isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
          this.parsePropertyName(prop);
        } else {
          isAsync = false;
        }
        this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
        return this.finishNode(prop, "Property");
      };
      pp$5.parseGetterSetter = function(prop) {
        var kind = prop.key.name;
        this.parsePropertyName(prop);
        prop.value = this.parseMethod(false);
        prop.kind = kind;
        var paramCount = prop.kind === "get" ? 0 : 1;
        if (prop.value.params.length !== paramCount) {
          var start = prop.value.start;
          if (prop.kind === "get") {
            this.raiseRecoverable(start, "getter should have no params");
          } else {
            this.raiseRecoverable(start, "setter should have exactly one param");
          }
        } else {
          if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
            this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
          }
        }
      };
      pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
        if ((isGenerator || isAsync) && this.type === types$1.colon) {
          this.unexpected();
        }
        if (this.eat(types$1.colon)) {
          prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
          prop.kind = "init";
        } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
          if (isPattern) {
            this.unexpected();
          }
          prop.method = true;
          prop.value = this.parseMethod(isGenerator, isAsync);
          prop.kind = "init";
        } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
          if (isGenerator || isAsync) {
            this.unexpected();
          }
          this.parseGetterSetter(prop);
        } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
          if (isGenerator || isAsync) {
            this.unexpected();
          }
          this.checkUnreserved(prop.key);
          if (prop.key.name === "await" && !this.awaitIdentPos) {
            this.awaitIdentPos = startPos;
          }
          if (isPattern) {
            prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
          } else if (this.type === types$1.eq && refDestructuringErrors) {
            if (refDestructuringErrors.shorthandAssign < 0) {
              refDestructuringErrors.shorthandAssign = this.start;
            }
            prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
          } else {
            prop.value = this.copyNode(prop.key);
          }
          prop.kind = "init";
          prop.shorthand = true;
        } else {
          this.unexpected();
        }
      };
      pp$5.parsePropertyName = function(prop) {
        if (this.options.ecmaVersion >= 6) {
          if (this.eat(types$1.bracketL)) {
            prop.computed = true;
            prop.key = this.parseMaybeAssign();
            this.expect(types$1.bracketR);
            return prop.key;
          } else {
            prop.computed = false;
          }
        }
        return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
      };
      pp$5.initFunction = function(node) {
        node.id = null;
        if (this.options.ecmaVersion >= 6) {
          node.generator = node.expression = false;
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = false;
        }
      };
      pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
        var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.initFunction(node);
        if (this.options.ecmaVersion >= 6) {
          node.generator = isGenerator;
        }
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
        this.expect(types$1.parenL);
        node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
        this.parseFunctionBody(node, false, true, false);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "FunctionExpression");
      };
      pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
        this.initFunction(node);
        if (this.options.ecmaVersion >= 8) {
          node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        node.params = this.toAssignableList(params, true);
        this.parseFunctionBody(node, true, false, forInit);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "ArrowFunctionExpression");
      };
      pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
        var isExpression = isArrowFunction && this.type !== types$1.braceL;
        var oldStrict = this.strict, useStrict = false;
        if (isExpression) {
          node.body = this.parseMaybeAssign(forInit);
          node.expression = true;
          this.checkParams(node, false);
        } else {
          var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
          if (!oldStrict || nonSimple) {
            useStrict = this.strictDirective(this.end);
            if (useStrict && nonSimple) {
              this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
            }
          }
          var oldLabels = this.labels;
          this.labels = [];
          if (useStrict) {
            this.strict = true;
          }
          this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
          if (this.strict && node.id) {
            this.checkLValSimple(node.id, BIND_OUTSIDE);
          }
          node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
          node.expression = false;
          this.adaptDirectivePrologue(node.body.body);
          this.labels = oldLabels;
        }
        this.exitScope();
      };
      pp$5.isSimpleParamList = function(params) {
        for (var i2 = 0, list2 = params; i2 < list2.length; i2 += 1) {
          var param = list2[i2];
          if (param.type !== "Identifier") {
            return false;
          }
        }
        return true;
      };
      pp$5.checkParams = function(node, allowDuplicates) {
        var nameHash = /* @__PURE__ */ Object.create(null);
        for (var i2 = 0, list2 = node.params; i2 < list2.length; i2 += 1) {
          var param = list2[i2];
          this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
        }
      };
      pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
        var elts = [], first = true;
        while (!this.eat(close)) {
          if (!first) {
            this.expect(types$1.comma);
            if (allowTrailingComma && this.afterTrailingComma(close)) {
              break;
            }
          } else {
            first = false;
          }
          var elt = void 0;
          if (allowEmpty && this.type === types$1.comma) {
            elt = null;
          } else if (this.type === types$1.ellipsis) {
            elt = this.parseSpread(refDestructuringErrors);
            if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
              refDestructuringErrors.trailingComma = this.start;
            }
          } else {
            elt = this.parseMaybeAssign(false, refDestructuringErrors);
          }
          elts.push(elt);
        }
        return elts;
      };
      pp$5.checkUnreserved = function(ref2) {
        var start = ref2.start;
        var end = ref2.end;
        var name = ref2.name;
        if (this.inGenerator && name === "yield") {
          this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
        }
        if (this.inAsync && name === "await") {
          this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
        }
        if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
          this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
        }
        if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
          this.raise(start, "Cannot use " + name + " in class static initialization block");
        }
        if (this.keywords.test(name)) {
          this.raise(start, "Unexpected keyword '" + name + "'");
        }
        if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
          return;
        }
        var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
        if (re.test(name)) {
          if (!this.inAsync && name === "await") {
            this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
          }
          this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
        }
      };
      pp$5.parseIdent = function(liberal) {
        var node = this.parseIdentNode();
        this.next(!!liberal);
        this.finishNode(node, "Identifier");
        if (!liberal) {
          this.checkUnreserved(node);
          if (node.name === "await" && !this.awaitIdentPos) {
            this.awaitIdentPos = node.start;
          }
        }
        return node;
      };
      pp$5.parseIdentNode = function() {
        var node = this.startNode();
        if (this.type === types$1.name) {
          node.name = this.value;
        } else if (this.type.keyword) {
          node.name = this.type.keyword;
          if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
            this.context.pop();
          }
          this.type = types$1.name;
        } else {
          this.unexpected();
        }
        return node;
      };
      pp$5.parsePrivateIdent = function() {
        var node = this.startNode();
        if (this.type === types$1.privateId) {
          node.name = this.value;
        } else {
          this.unexpected();
        }
        this.next();
        this.finishNode(node, "PrivateIdentifier");
        if (this.options.checkPrivateFields) {
          if (this.privateNameStack.length === 0) {
            this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
          } else {
            this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
          }
        }
        return node;
      };
      pp$5.parseYield = function(forInit) {
        if (!this.yieldPos) {
          this.yieldPos = this.start;
        }
        var node = this.startNode();
        this.next();
        if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
          node.delegate = false;
          node.argument = null;
        } else {
          node.delegate = this.eat(types$1.star);
          node.argument = this.parseMaybeAssign(forInit);
        }
        return this.finishNode(node, "YieldExpression");
      };
      pp$5.parseAwait = function(forInit) {
        if (!this.awaitPos) {
          this.awaitPos = this.start;
        }
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeUnary(null, true, false, forInit);
        return this.finishNode(node, "AwaitExpression");
      };
      var pp$4 = Parser.prototype;
      pp$4.raise = function(pos, message) {
        var loc = getLineInfo(this.input, pos);
        message += " (" + loc.line + ":" + loc.column + ")";
        if (this.sourceFile) {
          message += " in " + this.sourceFile;
        }
        var err = new SyntaxError(message);
        err.pos = pos;
        err.loc = loc;
        err.raisedAt = this.pos;
        throw err;
      };
      pp$4.raiseRecoverable = pp$4.raise;
      pp$4.curPosition = function() {
        if (this.options.locations) {
          return new Position(this.curLine, this.pos - this.lineStart);
        }
      };
      var pp$3 = Parser.prototype;
      var Scope = function Scope2(flags) {
        this.flags = flags;
        this.var = [];
        this.lexical = [];
        this.functions = [];
      };
      pp$3.enterScope = function(flags) {
        this.scopeStack.push(new Scope(flags));
      };
      pp$3.exitScope = function() {
        this.scopeStack.pop();
      };
      pp$3.treatFunctionsAsVarInScope = function(scope) {
        return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
      };
      pp$3.declareName = function(name, bindingType, pos) {
        var redeclared = false;
        if (bindingType === BIND_LEXICAL) {
          var scope = this.currentScope();
          redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
          scope.lexical.push(name);
          if (this.inModule && scope.flags & SCOPE_TOP) {
            delete this.undefinedExports[name];
          }
        } else if (bindingType === BIND_SIMPLE_CATCH) {
          var scope$1 = this.currentScope();
          scope$1.lexical.push(name);
        } else if (bindingType === BIND_FUNCTION) {
          var scope$2 = this.currentScope();
          if (this.treatFunctionsAsVar) {
            redeclared = scope$2.lexical.indexOf(name) > -1;
          } else {
            redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
          }
          scope$2.functions.push(name);
        } else {
          for (var i2 = this.scopeStack.length - 1; i2 >= 0; --i2) {
            var scope$3 = this.scopeStack[i2];
            if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
              redeclared = true;
              break;
            }
            scope$3.var.push(name);
            if (this.inModule && scope$3.flags & SCOPE_TOP) {
              delete this.undefinedExports[name];
            }
            if (scope$3.flags & SCOPE_VAR) {
              break;
            }
          }
        }
        if (redeclared) {
          this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
        }
      };
      pp$3.checkLocalExport = function(id) {
        if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
          this.undefinedExports[id.name] = id;
        }
      };
      pp$3.currentScope = function() {
        return this.scopeStack[this.scopeStack.length - 1];
      };
      pp$3.currentVarScope = function() {
        for (var i2 = this.scopeStack.length - 1; ; i2--) {
          var scope = this.scopeStack[i2];
          if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
            return scope;
          }
        }
      };
      pp$3.currentThisScope = function() {
        for (var i2 = this.scopeStack.length - 1; ; i2--) {
          var scope = this.scopeStack[i2];
          if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
            return scope;
          }
        }
      };
      var Node = function Node2(parser, pos, loc) {
        this.type = "";
        this.start = pos;
        this.end = 0;
        if (parser.options.locations) {
          this.loc = new SourceLocation(parser, loc);
        }
        if (parser.options.directSourceFile) {
          this.sourceFile = parser.options.directSourceFile;
        }
        if (parser.options.ranges) {
          this.range = [pos, 0];
        }
      };
      var pp$2 = Parser.prototype;
      pp$2.startNode = function() {
        return new Node(this, this.start, this.startLoc);
      };
      pp$2.startNodeAt = function(pos, loc) {
        return new Node(this, pos, loc);
      };
      function finishNodeAt(node, type, pos, loc) {
        node.type = type;
        node.end = pos;
        if (this.options.locations) {
          node.loc.end = loc;
        }
        if (this.options.ranges) {
          node.range[1] = pos;
        }
        return node;
      }
      pp$2.finishNode = function(node, type) {
        return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
      };
      pp$2.finishNodeAt = function(node, type, pos, loc) {
        return finishNodeAt.call(this, node, type, pos, loc);
      };
      pp$2.copyNode = function(node) {
        var newNode = new Node(this, node.start, this.startLoc);
        for (var prop in node) {
          newNode[prop] = node[prop];
        }
        return newNode;
      };
      var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";
      var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
      var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
      var ecma11BinaryProperties = ecma10BinaryProperties;
      var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
      var ecma13BinaryProperties = ecma12BinaryProperties;
      var ecma14BinaryProperties = ecma13BinaryProperties;
      var unicodeBinaryProperties = {
        9: ecma9BinaryProperties,
        10: ecma10BinaryProperties,
        11: ecma11BinaryProperties,
        12: ecma12BinaryProperties,
        13: ecma13BinaryProperties,
        14: ecma14BinaryProperties
      };
      var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
      var unicodeBinaryPropertiesOfStrings = {
        9: "",
        10: "",
        11: "",
        12: "",
        13: "",
        14: ecma14BinaryPropertiesOfStrings
      };
      var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
      var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
      var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
      var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
      var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
      var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
      var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
      var unicodeScriptValues = {
        9: ecma9ScriptValues,
        10: ecma10ScriptValues,
        11: ecma11ScriptValues,
        12: ecma12ScriptValues,
        13: ecma13ScriptValues,
        14: ecma14ScriptValues
      };
      var data = {};
      function buildUnicodeData(ecmaVersion2) {
        var d = data[ecmaVersion2] = {
          binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion2] + " " + unicodeGeneralCategoryValues),
          binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion2]),
          nonBinary: {
            General_Category: wordsRegexp(unicodeGeneralCategoryValues),
            Script: wordsRegexp(unicodeScriptValues[ecmaVersion2])
          }
        };
        d.nonBinary.Script_Extensions = d.nonBinary.Script;
        d.nonBinary.gc = d.nonBinary.General_Category;
        d.nonBinary.sc = d.nonBinary.Script;
        d.nonBinary.scx = d.nonBinary.Script_Extensions;
      }
      for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
        var ecmaVersion = list[i];
        buildUnicodeData(ecmaVersion);
      }
      var pp$1 = Parser.prototype;
      var BranchID = function BranchID2(parent, base) {
        this.parent = parent;
        this.base = base || this;
      };
      BranchID.prototype.separatedFrom = function separatedFrom(alt) {
        for (var self2 = this; self2; self2 = self2.parent) {
          for (var other = alt; other; other = other.parent) {
            if (self2.base === other.base && self2 !== other) {
              return true;
            }
          }
        }
        return false;
      };
      BranchID.prototype.sibling = function sibling() {
        return new BranchID(this.parent, this.base);
      };
      var RegExpValidationState = function RegExpValidationState2(parser) {
        this.parser = parser;
        this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
        this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
        this.source = "";
        this.flags = "";
        this.start = 0;
        this.switchU = false;
        this.switchV = false;
        this.switchN = false;
        this.pos = 0;
        this.lastIntValue = 0;
        this.lastStringValue = "";
        this.lastAssertionIsQuantifiable = false;
        this.numCapturingParens = 0;
        this.maxBackReference = 0;
        this.groupNames = /* @__PURE__ */ Object.create(null);
        this.backReferenceNames = [];
        this.branchID = null;
      };
      RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
        var unicodeSets = flags.indexOf("v") !== -1;
        var unicode = flags.indexOf("u") !== -1;
        this.start = start | 0;
        this.source = pattern + "";
        this.flags = flags;
        if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
          this.switchU = true;
          this.switchV = true;
          this.switchN = true;
        } else {
          this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
          this.switchV = false;
          this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
        }
      };
      RegExpValidationState.prototype.raise = function raise(message) {
        this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
      };
      RegExpValidationState.prototype.at = function at(i2, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i2 >= l) {
          return -1;
        }
        var c = s.charCodeAt(i2);
        if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l) {
          return c;
        }
        var next = s.charCodeAt(i2 + 1);
        return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
      };
      RegExpValidationState.prototype.nextIndex = function nextIndex(i2, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i2 >= l) {
          return l;
        }
        var c = s.charCodeAt(i2), next;
        if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l || (next = s.charCodeAt(i2 + 1)) < 56320 || next > 57343) {
          return i2 + 1;
        }
        return i2 + 2;
      };
      RegExpValidationState.prototype.current = function current(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.pos, forceU);
      };
      RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.nextIndex(this.pos, forceU), forceU);
      };
      RegExpValidationState.prototype.advance = function advance(forceU) {
        if (forceU === void 0) forceU = false;
        this.pos = this.nextIndex(this.pos, forceU);
      };
      RegExpValidationState.prototype.eat = function eat(ch, forceU) {
        if (forceU === void 0) forceU = false;
        if (this.current(forceU) === ch) {
          this.advance(forceU);
          return true;
        }
        return false;
      };
      RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
        if (forceU === void 0) forceU = false;
        var pos = this.pos;
        for (var i2 = 0, list2 = chs; i2 < list2.length; i2 += 1) {
          var ch = list2[i2];
          var current = this.at(pos, forceU);
          if (current === -1 || current !== ch) {
            return false;
          }
          pos = this.nextIndex(pos, forceU);
        }
        this.pos = pos;
        return true;
      };
      pp$1.validateRegExpFlags = function(state) {
        var validFlags = state.validFlags;
        var flags = state.flags;
        var u = false;
        var v = false;
        for (var i2 = 0; i2 < flags.length; i2++) {
          var flag = flags.charAt(i2);
          if (validFlags.indexOf(flag) === -1) {
            this.raise(state.start, "Invalid regular expression flag");
          }
          if (flags.indexOf(flag, i2 + 1) > -1) {
            this.raise(state.start, "Duplicate regular expression flag");
          }
          if (flag === "u") {
            u = true;
          }
          if (flag === "v") {
            v = true;
          }
        }
        if (this.options.ecmaVersion >= 15 && u && v) {
          this.raise(state.start, "Invalid regular expression flag");
        }
      };
      function hasProp(obj) {
        for (var _ in obj) {
          return true;
        }
        return false;
      }
      pp$1.validateRegExpPattern = function(state) {
        this.regexp_pattern(state);
        if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
          state.switchN = true;
          this.regexp_pattern(state);
        }
      };
      pp$1.regexp_pattern = function(state) {
        state.pos = 0;
        state.lastIntValue = 0;
        state.lastStringValue = "";
        state.lastAssertionIsQuantifiable = false;
        state.numCapturingParens = 0;
        state.maxBackReference = 0;
        state.groupNames = /* @__PURE__ */ Object.create(null);
        state.backReferenceNames.length = 0;
        state.branchID = null;
        this.regexp_disjunction(state);
        if (state.pos !== state.source.length) {
          if (state.eat(
            41
            /* ) */
          )) {
            state.raise("Unmatched ')'");
          }
          if (state.eat(
            93
            /* ] */
          ) || state.eat(
            125
            /* } */
          )) {
            state.raise("Lone quantifier brackets");
          }
        }
        if (state.maxBackReference > state.numCapturingParens) {
          state.raise("Invalid escape");
        }
        for (var i2 = 0, list2 = state.backReferenceNames; i2 < list2.length; i2 += 1) {
          var name = list2[i2];
          if (!state.groupNames[name]) {
            state.raise("Invalid named capture referenced");
          }
        }
      };
      pp$1.regexp_disjunction = function(state) {
        var trackDisjunction = this.options.ecmaVersion >= 16;
        if (trackDisjunction) {
          state.branchID = new BranchID(state.branchID, null);
        }
        this.regexp_alternative(state);
        while (state.eat(
          124
          /* | */
        )) {
          if (trackDisjunction) {
            state.branchID = state.branchID.sibling();
          }
          this.regexp_alternative(state);
        }
        if (trackDisjunction) {
          state.branchID = state.branchID.parent;
        }
        if (this.regexp_eatQuantifier(state, true)) {
          state.raise("Nothing to repeat");
        }
        if (state.eat(
          123
          /* { */
        )) {
          state.raise("Lone quantifier brackets");
        }
      };
      pp$1.regexp_alternative = function(state) {
        while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
        }
      };
      pp$1.regexp_eatTerm = function(state) {
        if (this.regexp_eatAssertion(state)) {
          if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
            if (state.switchU) {
              state.raise("Invalid quantifier");
            }
          }
          return true;
        }
        if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
          this.regexp_eatQuantifier(state);
          return true;
        }
        return false;
      };
      pp$1.regexp_eatAssertion = function(state) {
        var start = state.pos;
        state.lastAssertionIsQuantifiable = false;
        if (state.eat(
          94
          /* ^ */
        ) || state.eat(
          36
          /* $ */
        )) {
          return true;
        }
        if (state.eat(
          92
          /* \ */
        )) {
          if (state.eat(
            66
            /* B */
          ) || state.eat(
            98
            /* b */
          )) {
            return true;
          }
          state.pos = start;
        }
        if (state.eat(
          40
          /* ( */
        ) && state.eat(
          63
          /* ? */
        )) {
          var lookbehind = false;
          if (this.options.ecmaVersion >= 9) {
            lookbehind = state.eat(
              60
              /* < */
            );
          }
          if (state.eat(
            61
            /* = */
          ) || state.eat(
            33
            /* ! */
          )) {
            this.regexp_disjunction(state);
            if (!state.eat(
              41
              /* ) */
            )) {
              state.raise("Unterminated group");
            }
            state.lastAssertionIsQuantifiable = !lookbehind;
            return true;
          }
        }
        state.pos = start;
        return false;
      };
      pp$1.regexp_eatQuantifier = function(state, noError) {
        if (noError === void 0) noError = false;
        if (this.regexp_eatQuantifierPrefix(state, noError)) {
          state.eat(
            63
            /* ? */
          );
          return true;
        }
        return false;
      };
      pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
        return state.eat(
          42
          /* * */
        ) || state.eat(
          43
          /* + */
        ) || state.eat(
          63
          /* ? */
        ) || this.regexp_eatBracedQuantifier(state, noError);
      };
      pp$1.regexp_eatBracedQuantifier = function(state, noError) {
        var start = state.pos;
        if (state.eat(
          123
          /* { */
        )) {
          var min = 0, max = -1;
          if (this.regexp_eatDecimalDigits(state)) {
            min = state.lastIntValue;
            if (state.eat(
              44
              /* , */
            ) && this.regexp_eatDecimalDigits(state)) {
              max = state.lastIntValue;
            }
            if (state.eat(
              125
              /* } */
            )) {
              if (max !== -1 && max < min && !noError) {
                state.raise("numbers out of order in {} quantifier");
              }
              return true;
            }
          }
          if (state.switchU && !noError) {
            state.raise("Incomplete quantifier");
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatAtom = function(state) {
        return this.regexp_eatPatternCharacters(state) || state.eat(
          46
          /* . */
        ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
      };
      pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
        var start = state.pos;
        if (state.eat(
          92
          /* \ */
        )) {
          if (this.regexp_eatAtomEscape(state)) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatUncapturingGroup = function(state) {
        var start = state.pos;
        if (state.eat(
          40
          /* ( */
        )) {
          if (state.eat(
            63
            /* ? */
          )) {
            if (this.options.ecmaVersion >= 16) {
              var addModifiers = this.regexp_eatModifiers(state);
              var hasHyphen = state.eat(
                45
                /* - */
              );
              if (addModifiers || hasHyphen) {
                for (var i2 = 0; i2 < addModifiers.length; i2++) {
                  var modifier = addModifiers.charAt(i2);
                  if (addModifiers.indexOf(modifier, i2 + 1) > -1) {
                    state.raise("Duplicate regular expression modifiers");
                  }
                }
                if (hasHyphen) {
                  var removeModifiers = this.regexp_eatModifiers(state);
                  if (!addModifiers && !removeModifiers && state.current() === 58) {
                    state.raise("Invalid regular expression modifiers");
                  }
                  for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                    var modifier$1 = removeModifiers.charAt(i$1);
                    if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                      state.raise("Duplicate regular expression modifiers");
                    }
                  }
                }
              }
            }
            if (state.eat(
              58
              /* : */
            )) {
              this.regexp_disjunction(state);
              if (state.eat(
                41
                /* ) */
              )) {
                return true;
              }
              state.raise("Unterminated group");
            }
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatCapturingGroup = function(state) {
        if (state.eat(
          40
          /* ( */
        )) {
          if (this.options.ecmaVersion >= 9) {
            this.regexp_groupSpecifier(state);
          } else if (state.current() === 63) {
            state.raise("Invalid group");
          }
          this.regexp_disjunction(state);
          if (state.eat(
            41
            /* ) */
          )) {
            state.numCapturingParens += 1;
            return true;
          }
          state.raise("Unterminated group");
        }
        return false;
      };
      pp$1.regexp_eatModifiers = function(state) {
        var modifiers = "";
        var ch = 0;
        while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
          modifiers += codePointToString(ch);
          state.advance();
        }
        return modifiers;
      };
      function isRegularExpressionModifier(ch) {
        return ch === 105 || ch === 109 || ch === 115;
      }
      pp$1.regexp_eatExtendedAtom = function(state) {
        return state.eat(
          46
          /* . */
        ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
      };
      pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
        if (this.regexp_eatBracedQuantifier(state, true)) {
          state.raise("Nothing to repeat");
        }
        return false;
      };
      pp$1.regexp_eatSyntaxCharacter = function(state) {
        var ch = state.current();
        if (isSyntaxCharacter(ch)) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      function isSyntaxCharacter(ch) {
        return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
      }
      pp$1.regexp_eatPatternCharacters = function(state) {
        var start = state.pos;
        var ch = 0;
        while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
          state.advance();
        }
        return state.pos !== start;
      };
      pp$1.regexp_eatExtendedPatternCharacter = function(state) {
        var ch = state.current();
        if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_groupSpecifier = function(state) {
        if (state.eat(
          63
          /* ? */
        )) {
          if (!this.regexp_eatGroupName(state)) {
            state.raise("Invalid group");
          }
          var trackDisjunction = this.options.ecmaVersion >= 16;
          var known = state.groupNames[state.lastStringValue];
          if (known) {
            if (trackDisjunction) {
              for (var i2 = 0, list2 = known; i2 < list2.length; i2 += 1) {
                var altID = list2[i2];
                if (!altID.separatedFrom(state.branchID)) {
                  state.raise("Duplicate capture group name");
                }
              }
            } else {
              state.raise("Duplicate capture group name");
            }
          }
          if (trackDisjunction) {
            (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
          } else {
            state.groupNames[state.lastStringValue] = true;
          }
        }
      };
      pp$1.regexp_eatGroupName = function(state) {
        state.lastStringValue = "";
        if (state.eat(
          60
          /* < */
        )) {
          if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
            62
            /* > */
          )) {
            return true;
          }
          state.raise("Invalid capture group name");
        }
        return false;
      };
      pp$1.regexp_eatRegExpIdentifierName = function(state) {
        state.lastStringValue = "";
        if (this.regexp_eatRegExpIdentifierStart(state)) {
          state.lastStringValue += codePointToString(state.lastIntValue);
          while (this.regexp_eatRegExpIdentifierPart(state)) {
            state.lastStringValue += codePointToString(state.lastIntValue);
          }
          return true;
        }
        return false;
      };
      pp$1.regexp_eatRegExpIdentifierStart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
          ch = state.lastIntValue;
        }
        if (isRegExpIdentifierStart(ch)) {
          state.lastIntValue = ch;
          return true;
        }
        state.pos = start;
        return false;
      };
      function isRegExpIdentifierStart(ch) {
        return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
      }
      pp$1.regexp_eatRegExpIdentifierPart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
          ch = state.lastIntValue;
        }
        if (isRegExpIdentifierPart(ch)) {
          state.lastIntValue = ch;
          return true;
        }
        state.pos = start;
        return false;
      };
      function isRegExpIdentifierPart(ch) {
        return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
      }
      pp$1.regexp_eatAtomEscape = function(state) {
        if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
          return true;
        }
        if (state.switchU) {
          if (state.current() === 99) {
            state.raise("Invalid unicode escape");
          }
          state.raise("Invalid escape");
        }
        return false;
      };
      pp$1.regexp_eatBackReference = function(state) {
        var start = state.pos;
        if (this.regexp_eatDecimalEscape(state)) {
          var n = state.lastIntValue;
          if (state.switchU) {
            if (n > state.maxBackReference) {
              state.maxBackReference = n;
            }
            return true;
          }
          if (n <= state.numCapturingParens) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatKGroupName = function(state) {
        if (state.eat(
          107
          /* k */
        )) {
          if (this.regexp_eatGroupName(state)) {
            state.backReferenceNames.push(state.lastStringValue);
            return true;
          }
          state.raise("Invalid named reference");
        }
        return false;
      };
      pp$1.regexp_eatCharacterEscape = function(state) {
        return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
      };
      pp$1.regexp_eatCControlLetter = function(state) {
        var start = state.pos;
        if (state.eat(
          99
          /* c */
        )) {
          if (this.regexp_eatControlLetter(state)) {
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatZero = function(state) {
        if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
          state.lastIntValue = 0;
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_eatControlEscape = function(state) {
        var ch = state.current();
        if (ch === 116) {
          state.lastIntValue = 9;
          state.advance();
          return true;
        }
        if (ch === 110) {
          state.lastIntValue = 10;
          state.advance();
          return true;
        }
        if (ch === 118) {
          state.lastIntValue = 11;
          state.advance();
          return true;
        }
        if (ch === 102) {
          state.lastIntValue = 12;
          state.advance();
          return true;
        }
        if (ch === 114) {
          state.lastIntValue = 13;
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_eatControlLetter = function(state) {
        var ch = state.current();
        if (isControlLetter(ch)) {
          state.lastIntValue = ch % 32;
          state.advance();
          return true;
        }
        return false;
      };
      function isControlLetter(ch) {
        return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
      }
      pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
        if (forceU === void 0) forceU = false;
        var start = state.pos;
        var switchU = forceU || state.switchU;
        if (state.eat(
          117
          /* u */
        )) {
          if (this.regexp_eatFixedHexDigits(state, 4)) {
            var lead = state.lastIntValue;
            if (switchU && lead >= 55296 && lead <= 56319) {
              var leadSurrogateEnd = state.pos;
              if (state.eat(
                92
                /* \ */
              ) && state.eat(
                117
                /* u */
              ) && this.regexp_eatFixedHexDigits(state, 4)) {
                var trail = state.lastIntValue;
                if (trail >= 56320 && trail <= 57343) {
                  state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
                  return true;
                }
              }
              state.pos = leadSurrogateEnd;
              state.lastIntValue = lead;
            }
            return true;
          }
          if (switchU && state.eat(
            123
            /* { */
          ) && this.regexp_eatHexDigits(state) && state.eat(
            125
            /* } */
          ) && isValidUnicode(state.lastIntValue)) {
            return true;
          }
          if (switchU) {
            state.raise("Invalid unicode escape");
          }
          state.pos = start;
        }
        return false;
      };
      function isValidUnicode(ch) {
        return ch >= 0 && ch <= 1114111;
      }
      pp$1.regexp_eatIdentityEscape = function(state) {
        if (state.switchU) {
          if (this.regexp_eatSyntaxCharacter(state)) {
            return true;
          }
          if (state.eat(
            47
            /* / */
          )) {
            state.lastIntValue = 47;
            return true;
          }
          return false;
        }
        var ch = state.current();
        if (ch !== 99 && (!state.switchN || ch !== 107)) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_eatDecimalEscape = function(state) {
        state.lastIntValue = 0;
        var ch = state.current();
        if (ch >= 49 && ch <= 57) {
          do {
            state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
            state.advance();
          } while ((ch = state.current()) >= 48 && ch <= 57);
          return true;
        }
        return false;
      };
      var CharSetNone = 0;
      var CharSetOk = 1;
      var CharSetString = 2;
      pp$1.regexp_eatCharacterClassEscape = function(state) {
        var ch = state.current();
        if (isCharacterClassEscape(ch)) {
          state.lastIntValue = -1;
          state.advance();
          return CharSetOk;
        }
        var negate = false;
        if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
          state.lastIntValue = -1;
          state.advance();
          var result;
          if (state.eat(
            123
            /* { */
          ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
            125
            /* } */
          )) {
            if (negate && result === CharSetString) {
              state.raise("Invalid property name");
            }
            return result;
          }
          state.raise("Invalid property name");
        }
        return CharSetNone;
      };
      function isCharacterClassEscape(ch) {
        return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
      }
      pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
        var start = state.pos;
        if (this.regexp_eatUnicodePropertyName(state) && state.eat(
          61
          /* = */
        )) {
          var name = state.lastStringValue;
          if (this.regexp_eatUnicodePropertyValue(state)) {
            var value = state.lastStringValue;
            this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
            return CharSetOk;
          }
        }
        state.pos = start;
        if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
          var nameOrValue = state.lastStringValue;
          return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
        }
        return CharSetNone;
      };
      pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
        if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
          state.raise("Invalid property name");
        }
        if (!state.unicodeProperties.nonBinary[name].test(value)) {
          state.raise("Invalid property value");
        }
      };
      pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
        if (state.unicodeProperties.binary.test(nameOrValue)) {
          return CharSetOk;
        }
        if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
          return CharSetString;
        }
        state.raise("Invalid property name");
      };
      pp$1.regexp_eatUnicodePropertyName = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while (isUnicodePropertyNameCharacter(ch = state.current())) {
          state.lastStringValue += codePointToString(ch);
          state.advance();
        }
        return state.lastStringValue !== "";
      };
      function isUnicodePropertyNameCharacter(ch) {
        return isControlLetter(ch) || ch === 95;
      }
      pp$1.regexp_eatUnicodePropertyValue = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while (isUnicodePropertyValueCharacter(ch = state.current())) {
          state.lastStringValue += codePointToString(ch);
          state.advance();
        }
        return state.lastStringValue !== "";
      };
      function isUnicodePropertyValueCharacter(ch) {
        return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
      }
      pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
        return this.regexp_eatUnicodePropertyValue(state);
      };
      pp$1.regexp_eatCharacterClass = function(state) {
        if (state.eat(
          91
          /* [ */
        )) {
          var negate = state.eat(
            94
            /* ^ */
          );
          var result = this.regexp_classContents(state);
          if (!state.eat(
            93
            /* ] */
          )) {
            state.raise("Unterminated character class");
          }
          if (negate && result === CharSetString) {
            state.raise("Negated character class may contain strings");
          }
          return true;
        }
        return false;
      };
      pp$1.regexp_classContents = function(state) {
        if (state.current() === 93) {
          return CharSetOk;
        }
        if (state.switchV) {
          return this.regexp_classSetExpression(state);
        }
        this.regexp_nonEmptyClassRanges(state);
        return CharSetOk;
      };
      pp$1.regexp_nonEmptyClassRanges = function(state) {
        while (this.regexp_eatClassAtom(state)) {
          var left = state.lastIntValue;
          if (state.eat(
            45
            /* - */
          ) && this.regexp_eatClassAtom(state)) {
            var right = state.lastIntValue;
            if (state.switchU && (left === -1 || right === -1)) {
              state.raise("Invalid character class");
            }
            if (left !== -1 && right !== -1 && left > right) {
              state.raise("Range out of order in character class");
            }
          }
        }
      };
      pp$1.regexp_eatClassAtom = function(state) {
        var start = state.pos;
        if (state.eat(
          92
          /* \ */
        )) {
          if (this.regexp_eatClassEscape(state)) {
            return true;
          }
          if (state.switchU) {
            var ch$1 = state.current();
            if (ch$1 === 99 || isOctalDigit(ch$1)) {
              state.raise("Invalid class escape");
            }
            state.raise("Invalid escape");
          }
          state.pos = start;
        }
        var ch = state.current();
        if (ch !== 93) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_eatClassEscape = function(state) {
        var start = state.pos;
        if (state.eat(
          98
          /* b */
        )) {
          state.lastIntValue = 8;
          return true;
        }
        if (state.switchU && state.eat(
          45
          /* - */
        )) {
          state.lastIntValue = 45;
          return true;
        }
        if (!state.switchU && state.eat(
          99
          /* c */
        )) {
          if (this.regexp_eatClassControlLetter(state)) {
            return true;
          }
          state.pos = start;
        }
        return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
      };
      pp$1.regexp_classSetExpression = function(state) {
        var result = CharSetOk, subResult;
        if (this.regexp_eatClassSetRange(state)) ;
        else if (subResult = this.regexp_eatClassSetOperand(state)) {
          if (subResult === CharSetString) {
            result = CharSetString;
          }
          var start = state.pos;
          while (state.eatChars(
            [38, 38]
            /* && */
          )) {
            if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
              if (subResult !== CharSetString) {
                result = CharSetOk;
              }
              continue;
            }
            state.raise("Invalid character in character class");
          }
          if (start !== state.pos) {
            return result;
          }
          while (state.eatChars(
            [45, 45]
            /* -- */
          )) {
            if (this.regexp_eatClassSetOperand(state)) {
              continue;
            }
            state.raise("Invalid character in character class");
          }
          if (start !== state.pos) {
            return result;
          }
        } else {
          state.raise("Invalid character in character class");
        }
        for (; ; ) {
          if (this.regexp_eatClassSetRange(state)) {
            continue;
          }
          subResult = this.regexp_eatClassSetOperand(state);
          if (!subResult) {
            return result;
          }
          if (subResult === CharSetString) {
            result = CharSetString;
          }
        }
      };
      pp$1.regexp_eatClassSetRange = function(state) {
        var start = state.pos;
        if (this.regexp_eatClassSetCharacter(state)) {
          var left = state.lastIntValue;
          if (state.eat(
            45
            /* - */
          ) && this.regexp_eatClassSetCharacter(state)) {
            var right = state.lastIntValue;
            if (left !== -1 && right !== -1 && left > right) {
              state.raise("Range out of order in character class");
            }
            return true;
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatClassSetOperand = function(state) {
        if (this.regexp_eatClassSetCharacter(state)) {
          return CharSetOk;
        }
        return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
      };
      pp$1.regexp_eatNestedClass = function(state) {
        var start = state.pos;
        if (state.eat(
          91
          /* [ */
        )) {
          var negate = state.eat(
            94
            /* ^ */
          );
          var result = this.regexp_classContents(state);
          if (state.eat(
            93
            /* ] */
          )) {
            if (negate && result === CharSetString) {
              state.raise("Negated character class may contain strings");
            }
            return result;
          }
          state.pos = start;
        }
        if (state.eat(
          92
          /* \ */
        )) {
          var result$1 = this.regexp_eatCharacterClassEscape(state);
          if (result$1) {
            return result$1;
          }
          state.pos = start;
        }
        return null;
      };
      pp$1.regexp_eatClassStringDisjunction = function(state) {
        var start = state.pos;
        if (state.eatChars(
          [92, 113]
          /* \q */
        )) {
          if (state.eat(
            123
            /* { */
          )) {
            var result = this.regexp_classStringDisjunctionContents(state);
            if (state.eat(
              125
              /* } */
            )) {
              return result;
            }
          } else {
            state.raise("Invalid escape");
          }
          state.pos = start;
        }
        return null;
      };
      pp$1.regexp_classStringDisjunctionContents = function(state) {
        var result = this.regexp_classString(state);
        while (state.eat(
          124
          /* | */
        )) {
          if (this.regexp_classString(state) === CharSetString) {
            result = CharSetString;
          }
        }
        return result;
      };
      pp$1.regexp_classString = function(state) {
        var count = 0;
        while (this.regexp_eatClassSetCharacter(state)) {
          count++;
        }
        return count === 1 ? CharSetOk : CharSetString;
      };
      pp$1.regexp_eatClassSetCharacter = function(state) {
        var start = state.pos;
        if (state.eat(
          92
          /* \ */
        )) {
          if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
            return true;
          }
          if (state.eat(
            98
            /* b */
          )) {
            state.lastIntValue = 8;
            return true;
          }
          state.pos = start;
          return false;
        }
        var ch = state.current();
        if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
          return false;
        }
        if (isClassSetSyntaxCharacter(ch)) {
          return false;
        }
        state.advance();
        state.lastIntValue = ch;
        return true;
      };
      function isClassSetReservedDoublePunctuatorCharacter(ch) {
        return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
      }
      function isClassSetSyntaxCharacter(ch) {
        return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
      }
      pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
        var ch = state.current();
        if (isClassSetReservedPunctuator(ch)) {
          state.lastIntValue = ch;
          state.advance();
          return true;
        }
        return false;
      };
      function isClassSetReservedPunctuator(ch) {
        return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
      }
      pp$1.regexp_eatClassControlLetter = function(state) {
        var ch = state.current();
        if (isDecimalDigit(ch) || ch === 95) {
          state.lastIntValue = ch % 32;
          state.advance();
          return true;
        }
        return false;
      };
      pp$1.regexp_eatHexEscapeSequence = function(state) {
        var start = state.pos;
        if (state.eat(
          120
          /* x */
        )) {
          if (this.regexp_eatFixedHexDigits(state, 2)) {
            return true;
          }
          if (state.switchU) {
            state.raise("Invalid escape");
          }
          state.pos = start;
        }
        return false;
      };
      pp$1.regexp_eatDecimalDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while (isDecimalDigit(ch = state.current())) {
          state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
          state.advance();
        }
        return state.pos !== start;
      };
      function isDecimalDigit(ch) {
        return ch >= 48 && ch <= 57;
      }
      pp$1.regexp_eatHexDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while (isHexDigit(ch = state.current())) {
          state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
          state.advance();
        }
        return state.pos !== start;
      };
      function isHexDigit(ch) {
        return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
      }
      function hexToInt(ch) {
        if (ch >= 65 && ch <= 70) {
          return 10 + (ch - 65);
        }
        if (ch >= 97 && ch <= 102) {
          return 10 + (ch - 97);
        }
        return ch - 48;
      }
      pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
        if (this.regexp_eatOctalDigit(state)) {
          var n1 = state.lastIntValue;
          if (this.regexp_eatOctalDigit(state)) {
            var n2 = state.lastIntValue;
            if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
              state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
            } else {
              state.lastIntValue = n1 * 8 + n2;
            }
          } else {
            state.lastIntValue = n1;
          }
          return true;
        }
        return false;
      };
      pp$1.regexp_eatOctalDigit = function(state) {
        var ch = state.current();
        if (isOctalDigit(ch)) {
          state.lastIntValue = ch - 48;
          state.advance();
          return true;
        }
        state.lastIntValue = 0;
        return false;
      };
      function isOctalDigit(ch) {
        return ch >= 48 && ch <= 55;
      }
      pp$1.regexp_eatFixedHexDigits = function(state, length) {
        var start = state.pos;
        state.lastIntValue = 0;
        for (var i2 = 0; i2 < length; ++i2) {
          var ch = state.current();
          if (!isHexDigit(ch)) {
            state.pos = start;
            return false;
          }
          state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
          state.advance();
        }
        return true;
      };
      var Token = function Token2(p) {
        this.type = p.type;
        this.value = p.value;
        this.start = p.start;
        this.end = p.end;
        if (p.options.locations) {
          this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
        }
        if (p.options.ranges) {
          this.range = [p.start, p.end];
        }
      };
      var pp = Parser.prototype;
      pp.next = function(ignoreEscapeSequenceInKeyword) {
        if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
          this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
        }
        if (this.options.onToken) {
          this.options.onToken(new Token(this));
        }
        this.lastTokEnd = this.end;
        this.lastTokStart = this.start;
        this.lastTokEndLoc = this.endLoc;
        this.lastTokStartLoc = this.startLoc;
        this.nextToken();
      };
      pp.getToken = function() {
        this.next();
        return new Token(this);
      };
      if (typeof Symbol !== "undefined") {
        pp[Symbol.iterator] = function() {
          var this$1$1 = this;
          return {
            next: function() {
              var token = this$1$1.getToken();
              return {
                done: token.type === types$1.eof,
                value: token
              };
            }
          };
        };
      }
      pp.nextToken = function() {
        var curContext = this.curContext();
        if (!curContext || !curContext.preserveSpace) {
          this.skipSpace();
        }
        this.start = this.pos;
        if (this.options.locations) {
          this.startLoc = this.curPosition();
        }
        if (this.pos >= this.input.length) {
          return this.finishToken(types$1.eof);
        }
        if (curContext.override) {
          return curContext.override(this);
        } else {
          this.readToken(this.fullCharCodeAtPos());
        }
      };
      pp.readToken = function(code) {
        if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
          return this.readWord();
        }
        return this.getTokenFromCode(code);
      };
      pp.fullCharCodeAt = function(pos) {
        var code = this.input.charCodeAt(pos);
        if (code <= 55295 || code >= 56320) {
          return code;
        }
        var next = this.input.charCodeAt(pos + 1);
        return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
      };
      pp.fullCharCodeAtPos = function() {
        return this.fullCharCodeAt(this.pos);
      };
      pp.skipBlockComment = function() {
        var startLoc = this.options.onComment && this.curPosition();
        var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
        if (end === -1) {
          this.raise(this.pos - 2, "Unterminated comment");
        }
        this.pos = end + 2;
        if (this.options.locations) {
          for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
            ++this.curLine;
            pos = this.lineStart = nextBreak;
          }
        }
        if (this.options.onComment) {
          this.options.onComment(
            true,
            this.input.slice(start + 2, end),
            start,
            this.pos,
            startLoc,
            this.curPosition()
          );
        }
      };
      pp.skipLineComment = function(startSkip) {
        var start = this.pos;
        var startLoc = this.options.onComment && this.curPosition();
        var ch = this.input.charCodeAt(this.pos += startSkip);
        while (this.pos < this.input.length && !isNewLine(ch)) {
          ch = this.input.charCodeAt(++this.pos);
        }
        if (this.options.onComment) {
          this.options.onComment(
            false,
            this.input.slice(start + startSkip, this.pos),
            start,
            this.pos,
            startLoc,
            this.curPosition()
          );
        }
      };
      pp.skipSpace = function() {
        loop: while (this.pos < this.input.length) {
          var ch = this.input.charCodeAt(this.pos);
          switch (ch) {
            case 32:
            case 160:
              ++this.pos;
              break;
            case 13:
              if (this.input.charCodeAt(this.pos + 1) === 10) {
                ++this.pos;
              }
            case 10:
            case 8232:
            case 8233:
              ++this.pos;
              if (this.options.locations) {
                ++this.curLine;
                this.lineStart = this.pos;
              }
              break;
            case 47:
              switch (this.input.charCodeAt(this.pos + 1)) {
                case 42:
                  this.skipBlockComment();
                  break;
                case 47:
                  this.skipLineComment(2);
                  break;
                default:
                  break loop;
              }
              break;
            default:
              if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                ++this.pos;
              } else {
                break loop;
              }
          }
        }
      };
      pp.finishToken = function(type, val) {
        this.end = this.pos;
        if (this.options.locations) {
          this.endLoc = this.curPosition();
        }
        var prevType = this.type;
        this.type = type;
        this.value = val;
        this.updateContext(prevType);
      };
      pp.readToken_dot = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next >= 48 && next <= 57) {
          return this.readNumber(true);
        }
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
          this.pos += 3;
          return this.finishToken(types$1.ellipsis);
        } else {
          ++this.pos;
          return this.finishToken(types$1.dot);
        }
      };
      pp.readToken_slash = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (this.exprAllowed) {
          ++this.pos;
          return this.readRegexp();
        }
        if (next === 61) {
          return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.slash, 1);
      };
      pp.readToken_mult_modulo_exp = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        var tokentype = code === 42 ? types$1.star : types$1.modulo;
        if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
          ++size;
          tokentype = types$1.starstar;
          next = this.input.charCodeAt(this.pos + 2);
        }
        if (next === 61) {
          return this.finishOp(types$1.assign, size + 1);
        }
        return this.finishOp(tokentype, size);
      };
      pp.readToken_pipe_amp = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) {
          if (this.options.ecmaVersion >= 12) {
            var next2 = this.input.charCodeAt(this.pos + 2);
            if (next2 === 61) {
              return this.finishOp(types$1.assign, 3);
            }
          }
          return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
        }
        if (next === 61) {
          return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
      };
      pp.readToken_caret = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
          return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.bitwiseXOR, 1);
      };
      pp.readToken_plus_min = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) {
          if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
            this.skipLineComment(3);
            this.skipSpace();
            return this.nextToken();
          }
          return this.finishOp(types$1.incDec, 2);
        }
        if (next === 61) {
          return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.plusMin, 1);
      };
      pp.readToken_lt_gt = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        if (next === code) {
          size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
          if (this.input.charCodeAt(this.pos + size) === 61) {
            return this.finishOp(types$1.assign, size + 1);
          }
          return this.finishOp(types$1.bitShift, size);
        }
        if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
          this.skipLineComment(4);
          this.skipSpace();
          return this.nextToken();
        }
        if (next === 61) {
          size = 2;
        }
        return this.finishOp(types$1.relational, size);
      };
      pp.readToken_eq_excl = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
          return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
        }
        if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
          this.pos += 2;
          return this.finishToken(types$1.arrow);
        }
        return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
      };
      pp.readToken_question = function() {
        var ecmaVersion2 = this.options.ecmaVersion;
        if (ecmaVersion2 >= 11) {
          var next = this.input.charCodeAt(this.pos + 1);
          if (next === 46) {
            var next2 = this.input.charCodeAt(this.pos + 2);
            if (next2 < 48 || next2 > 57) {
              return this.finishOp(types$1.questionDot, 2);
            }
          }
          if (next === 63) {
            if (ecmaVersion2 >= 12) {
              var next2$1 = this.input.charCodeAt(this.pos + 2);
              if (next2$1 === 61) {
                return this.finishOp(types$1.assign, 3);
              }
            }
            return this.finishOp(types$1.coalesce, 2);
          }
        }
        return this.finishOp(types$1.question, 1);
      };
      pp.readToken_numberSign = function() {
        var ecmaVersion2 = this.options.ecmaVersion;
        var code = 35;
        if (ecmaVersion2 >= 13) {
          ++this.pos;
          code = this.fullCharCodeAtPos();
          if (isIdentifierStart(code, true) || code === 92) {
            return this.finishToken(types$1.privateId, this.readWord1());
          }
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
      };
      pp.getTokenFromCode = function(code) {
        switch (code) {
          // The interpretation of a dot depends on whether it is followed
          // by a digit or another two dots.
          case 46:
            return this.readToken_dot();
          // Punctuation tokens.
          case 40:
            ++this.pos;
            return this.finishToken(types$1.parenL);
          case 41:
            ++this.pos;
            return this.finishToken(types$1.parenR);
          case 59:
            ++this.pos;
            return this.finishToken(types$1.semi);
          case 44:
            ++this.pos;
            return this.finishToken(types$1.comma);
          case 91:
            ++this.pos;
            return this.finishToken(types$1.bracketL);
          case 93:
            ++this.pos;
            return this.finishToken(types$1.bracketR);
          case 123:
            ++this.pos;
            return this.finishToken(types$1.braceL);
          case 125:
            ++this.pos;
            return this.finishToken(types$1.braceR);
          case 58:
            ++this.pos;
            return this.finishToken(types$1.colon);
          case 96:
            if (this.options.ecmaVersion < 6) {
              break;
            }
            ++this.pos;
            return this.finishToken(types$1.backQuote);
          case 48:
            var next = this.input.charCodeAt(this.pos + 1);
            if (next === 120 || next === 88) {
              return this.readRadixNumber(16);
            }
            if (this.options.ecmaVersion >= 6) {
              if (next === 111 || next === 79) {
                return this.readRadixNumber(8);
              }
              if (next === 98 || next === 66) {
                return this.readRadixNumber(2);
              }
            }
          // Anything else beginning with a digit is an integer, octal
          // number, or float.
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
            return this.readNumber(false);
          // Quotes produce strings.
          case 34:
          case 39:
            return this.readString(code);
          // Operators are parsed inline in tiny state machines. '=' (61) is
          // often referred to. `finishOp` simply skips the amount of
          // characters it is given as second argument, and returns a token
          // of the type given by its first argument.
          case 47:
            return this.readToken_slash();
          case 37:
          case 42:
            return this.readToken_mult_modulo_exp(code);
          case 124:
          case 38:
            return this.readToken_pipe_amp(code);
          case 94:
            return this.readToken_caret();
          case 43:
          case 45:
            return this.readToken_plus_min(code);
          case 60:
          case 62:
            return this.readToken_lt_gt(code);
          case 61:
          case 33:
            return this.readToken_eq_excl(code);
          case 63:
            return this.readToken_question();
          case 126:
            return this.finishOp(types$1.prefix, 1);
          case 35:
            return this.readToken_numberSign();
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
      };
      pp.finishOp = function(type, size) {
        var str = this.input.slice(this.pos, this.pos + size);
        this.pos += size;
        return this.finishToken(type, str);
      };
      pp.readRegexp = function() {
        var escaped, inClass, start = this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(start, "Unterminated regular expression");
          }
          var ch = this.input.charAt(this.pos);
          if (lineBreak.test(ch)) {
            this.raise(start, "Unterminated regular expression");
          }
          if (!escaped) {
            if (ch === "[") {
              inClass = true;
            } else if (ch === "]" && inClass) {
              inClass = false;
            } else if (ch === "/" && !inClass) {
              break;
            }
            escaped = ch === "\\";
          } else {
            escaped = false;
          }
          ++this.pos;
        }
        var pattern = this.input.slice(start, this.pos);
        ++this.pos;
        var flagsStart = this.pos;
        var flags = this.readWord1();
        if (this.containsEsc) {
          this.unexpected(flagsStart);
        }
        var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
        state.reset(start, pattern, flags);
        this.validateRegExpFlags(state);
        this.validateRegExpPattern(state);
        var value = null;
        try {
          value = new RegExp(pattern, flags);
        } catch (e) {
        }
        return this.finishToken(types$1.regexp, { pattern, flags, value });
      };
      pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
        var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
        var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
        var start = this.pos, total = 0, lastCode = 0;
        for (var i2 = 0, e = len == null ? Infinity : len; i2 < e; ++i2, ++this.pos) {
          var code = this.input.charCodeAt(this.pos), val = void 0;
          if (allowSeparators && code === 95) {
            if (isLegacyOctalNumericLiteral) {
              this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
            }
            if (lastCode === 95) {
              this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
            }
            if (i2 === 0) {
              this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
            }
            lastCode = code;
            continue;
          }
          if (code >= 97) {
            val = code - 97 + 10;
          } else if (code >= 65) {
            val = code - 65 + 10;
          } else if (code >= 48 && code <= 57) {
            val = code - 48;
          } else {
            val = Infinity;
          }
          if (val >= radix) {
            break;
          }
          lastCode = code;
          total = total * radix + val;
        }
        if (allowSeparators && lastCode === 95) {
          this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
        }
        if (this.pos === start || len != null && this.pos - start !== len) {
          return null;
        }
        return total;
      };
      function stringToNumber(str, isLegacyOctalNumericLiteral) {
        if (isLegacyOctalNumericLiteral) {
          return parseInt(str, 8);
        }
        return parseFloat(str.replace(/_/g, ""));
      }
      function stringToBigInt(str) {
        if (typeof BigInt !== "function") {
          return null;
        }
        return BigInt(str.replace(/_/g, ""));
      }
      pp.readRadixNumber = function(radix) {
        var start = this.pos;
        this.pos += 2;
        var val = this.readInt(radix);
        if (val == null) {
          this.raise(this.start + 2, "Expected number in radix " + radix);
        }
        if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
          val = stringToBigInt(this.input.slice(start, this.pos));
          ++this.pos;
        } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
          this.raise(this.pos, "Identifier directly after number");
        }
        return this.finishToken(types$1.num, val);
      };
      pp.readNumber = function(startsWithDot) {
        var start = this.pos;
        if (!startsWithDot && this.readInt(10, void 0, true) === null) {
          this.raise(start, "Invalid number");
        }
        var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
        if (octal && this.strict) {
          this.raise(start, "Invalid number");
        }
        var next = this.input.charCodeAt(this.pos);
        if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
          var val$1 = stringToBigInt(this.input.slice(start, this.pos));
          ++this.pos;
          if (isIdentifierStart(this.fullCharCodeAtPos())) {
            this.raise(this.pos, "Identifier directly after number");
          }
          return this.finishToken(types$1.num, val$1);
        }
        if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
          octal = false;
        }
        if (next === 46 && !octal) {
          ++this.pos;
          this.readInt(10);
          next = this.input.charCodeAt(this.pos);
        }
        if ((next === 69 || next === 101) && !octal) {
          next = this.input.charCodeAt(++this.pos);
          if (next === 43 || next === 45) {
            ++this.pos;
          }
          if (this.readInt(10) === null) {
            this.raise(start, "Invalid number");
          }
        }
        if (isIdentifierStart(this.fullCharCodeAtPos())) {
          this.raise(this.pos, "Identifier directly after number");
        }
        var val = stringToNumber(this.input.slice(start, this.pos), octal);
        return this.finishToken(types$1.num, val);
      };
      pp.readCodePoint = function() {
        var ch = this.input.charCodeAt(this.pos), code;
        if (ch === 123) {
          if (this.options.ecmaVersion < 6) {
            this.unexpected();
          }
          var codePos = ++this.pos;
          code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
          ++this.pos;
          if (code > 1114111) {
            this.invalidStringToken(codePos, "Code point out of bounds");
          }
        } else {
          code = this.readHexChar(4);
        }
        return code;
      };
      pp.readString = function(quote) {
        var out = "", chunkStart = ++this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(this.start, "Unterminated string constant");
          }
          var ch = this.input.charCodeAt(this.pos);
          if (ch === quote) {
            break;
          }
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar(false);
            chunkStart = this.pos;
          } else if (ch === 8232 || ch === 8233) {
            if (this.options.ecmaVersion < 10) {
              this.raise(this.start, "Unterminated string constant");
            }
            ++this.pos;
            if (this.options.locations) {
              this.curLine++;
              this.lineStart = this.pos;
            }
          } else {
            if (isNewLine(ch)) {
              this.raise(this.start, "Unterminated string constant");
            }
            ++this.pos;
          }
        }
        out += this.input.slice(chunkStart, this.pos++);
        return this.finishToken(types$1.string, out);
      };
      var INVALID_TEMPLATE_ESCAPE_ERROR = {};
      pp.tryReadTemplateToken = function() {
        this.inTemplateElement = true;
        try {
          this.readTmplToken();
        } catch (err) {
          if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
            this.readInvalidTemplateToken();
          } else {
            throw err;
          }
        }
        this.inTemplateElement = false;
      };
      pp.invalidStringToken = function(position, message) {
        if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
          throw INVALID_TEMPLATE_ESCAPE_ERROR;
        } else {
          this.raise(position, message);
        }
      };
      pp.readTmplToken = function() {
        var out = "", chunkStart = this.pos;
        for (; ; ) {
          if (this.pos >= this.input.length) {
            this.raise(this.start, "Unterminated template");
          }
          var ch = this.input.charCodeAt(this.pos);
          if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
            if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
              if (ch === 36) {
                this.pos += 2;
                return this.finishToken(types$1.dollarBraceL);
              } else {
                ++this.pos;
                return this.finishToken(types$1.backQuote);
              }
            }
            out += this.input.slice(chunkStart, this.pos);
            return this.finishToken(types$1.template, out);
          }
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar(true);
            chunkStart = this.pos;
          } else if (isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.pos);
            ++this.pos;
            switch (ch) {
              case 13:
                if (this.input.charCodeAt(this.pos) === 10) {
                  ++this.pos;
                }
              case 10:
                out += "\n";
                break;
              default:
                out += String.fromCharCode(ch);
                break;
            }
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
            chunkStart = this.pos;
          } else {
            ++this.pos;
          }
        }
      };
      pp.readInvalidTemplateToken = function() {
        for (; this.pos < this.input.length; this.pos++) {
          switch (this.input[this.pos]) {
            case "\\":
              ++this.pos;
              break;
            case "$":
              if (this.input[this.pos + 1] !== "{") {
                break;
              }
            // fall through
            case "`":
              return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
            case "\r":
              if (this.input[this.pos + 1] === "\n") {
                ++this.pos;
              }
            // fall through
            case "\n":
            case "\u2028":
            case "\u2029":
              ++this.curLine;
              this.lineStart = this.pos + 1;
              break;
          }
        }
        this.raise(this.start, "Unterminated template");
      };
      pp.readEscapedChar = function(inTemplate) {
        var ch = this.input.charCodeAt(++this.pos);
        ++this.pos;
        switch (ch) {
          case 110:
            return "\n";
          // 'n' -> '\n'
          case 114:
            return "\r";
          // 'r' -> '\r'
          case 120:
            return String.fromCharCode(this.readHexChar(2));
          // 'x'
          case 117:
            return codePointToString(this.readCodePoint());
          // 'u'
          case 116:
            return "	";
          // 't' -> '\t'
          case 98:
            return "\b";
          // 'b' -> '\b'
          case 118:
            return "\v";
          // 'v' -> '\u000b'
          case 102:
            return "\f";
          // 'f' -> '\f'
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
            }
          // '\r\n'
          case 10:
            if (this.options.locations) {
              this.lineStart = this.pos;
              ++this.curLine;
            }
            return "";
          case 56:
          case 57:
            if (this.strict) {
              this.invalidStringToken(
                this.pos - 1,
                "Invalid escape sequence"
              );
            }
            if (inTemplate) {
              var codePos = this.pos - 1;
              this.invalidStringToken(
                codePos,
                "Invalid escape sequence in template string"
              );
            }
          default:
            if (ch >= 48 && ch <= 55) {
              var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
              var octal = parseInt(octalStr, 8);
              if (octal > 255) {
                octalStr = octalStr.slice(0, -1);
                octal = parseInt(octalStr, 8);
              }
              this.pos += octalStr.length - 1;
              ch = this.input.charCodeAt(this.pos);
              if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
                this.invalidStringToken(
                  this.pos - 1 - octalStr.length,
                  inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
                );
              }
              return String.fromCharCode(octal);
            }
            if (isNewLine(ch)) {
              if (this.options.locations) {
                this.lineStart = this.pos;
                ++this.curLine;
              }
              return "";
            }
            return String.fromCharCode(ch);
        }
      };
      pp.readHexChar = function(len) {
        var codePos = this.pos;
        var n = this.readInt(16, len);
        if (n === null) {
          this.invalidStringToken(codePos, "Bad character escape sequence");
        }
        return n;
      };
      pp.readWord1 = function() {
        this.containsEsc = false;
        var word = "", first = true, chunkStart = this.pos;
        var astral = this.options.ecmaVersion >= 6;
        while (this.pos < this.input.length) {
          var ch = this.fullCharCodeAtPos();
          if (isIdentifierChar(ch, astral)) {
            this.pos += ch <= 65535 ? 1 : 2;
          } else if (ch === 92) {
            this.containsEsc = true;
            word += this.input.slice(chunkStart, this.pos);
            var escStart = this.pos;
            if (this.input.charCodeAt(++this.pos) !== 117) {
              this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
            }
            ++this.pos;
            var esc = this.readCodePoint();
            if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
              this.invalidStringToken(escStart, "Invalid Unicode escape");
            }
            word += codePointToString(esc);
            chunkStart = this.pos;
          } else {
            break;
          }
          first = false;
        }
        return word + this.input.slice(chunkStart, this.pos);
      };
      pp.readWord = function() {
        var word = this.readWord1();
        var type = types$1.name;
        if (this.keywords.test(word)) {
          type = keywords[word];
        }
        return this.finishToken(type, word);
      };
      var version = "8.17.0";
      Parser.acorn = {
        Parser,
        version,
        defaultOptions,
        Position,
        SourceLocation,
        getLineInfo,
        Node,
        TokenType,
        tokTypes: types$1,
        keywordTypes: keywords,
        TokContext,
        tokContexts: types,
        isIdentifierChar,
        isIdentifierStart,
        Token,
        isNewLine,
        lineBreak,
        lineBreakG,
        nonASCIIwhitespace
      };
      function parse(input, options) {
        return Parser.parse(input, options);
      }
      function parseExpressionAt(input, pos, options) {
        return Parser.parseExpressionAt(input, pos, options);
      }
      function tokenizer(input, options) {
        return Parser.tokenizer(input, options);
      }
      exports2.Node = Node;
      exports2.Parser = Parser;
      exports2.Position = Position;
      exports2.SourceLocation = SourceLocation;
      exports2.TokContext = TokContext;
      exports2.Token = Token;
      exports2.TokenType = TokenType;
      exports2.defaultOptions = defaultOptions;
      exports2.getLineInfo = getLineInfo;
      exports2.isIdentifierChar = isIdentifierChar;
      exports2.isIdentifierStart = isIdentifierStart;
      exports2.isNewLine = isNewLine;
      exports2.keywordTypes = keywords;
      exports2.lineBreak = lineBreak;
      exports2.lineBreakG = lineBreakG;
      exports2.nonASCIIwhitespace = nonASCIIwhitespace;
      exports2.parse = parse;
      exports2.parseExpressionAt = parseExpressionAt;
      exports2.tokContexts = types;
      exports2.tokTypes = types$1;
      exports2.tokenizer = tokenizer;
      exports2.version = version;
    }));
  }
});

// node_modules/astring/dist/astring.js
var require_astring = __commonJS({
  "node_modules/astring/dist/astring.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.generate = generate;
    exports.baseGenerator = exports.GENERATOR = exports.EXPRESSIONS_PRECEDENCE = exports.NEEDS_PARENTHESES = void 0;
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }
    var stringify = JSON.stringify;
    if (!String.prototype.repeat) {
      throw new Error("String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation");
    }
    if (!String.prototype.endsWith) {
      throw new Error("String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation");
    }
    var OPERATOR_PRECEDENCE = {
      "||": 2,
      "??": 3,
      "&&": 4,
      "|": 5,
      "^": 6,
      "&": 7,
      "==": 8,
      "!=": 8,
      "===": 8,
      "!==": 8,
      "<": 9,
      ">": 9,
      "<=": 9,
      ">=": 9,
      "in": 9,
      "instanceof": 9,
      "<<": 10,
      ">>": 10,
      ">>>": 10,
      "+": 11,
      "-": 11,
      "*": 12,
      "%": 12,
      "/": 12,
      "**": 13
    };
    var NEEDS_PARENTHESES = 17;
    exports.NEEDS_PARENTHESES = NEEDS_PARENTHESES;
    var EXPRESSIONS_PRECEDENCE = {
      ArrayExpression: 20,
      TaggedTemplateExpression: 20,
      ThisExpression: 20,
      Identifier: 20,
      PrivateIdentifier: 20,
      Literal: 18,
      TemplateLiteral: 20,
      Super: 20,
      SequenceExpression: 20,
      MemberExpression: 19,
      ChainExpression: 19,
      CallExpression: 19,
      NewExpression: 19,
      ArrowFunctionExpression: NEEDS_PARENTHESES,
      ClassExpression: NEEDS_PARENTHESES,
      FunctionExpression: NEEDS_PARENTHESES,
      ObjectExpression: NEEDS_PARENTHESES,
      UpdateExpression: 16,
      UnaryExpression: 15,
      AwaitExpression: 15,
      BinaryExpression: 14,
      LogicalExpression: 13,
      ConditionalExpression: 4,
      AssignmentExpression: 3,
      YieldExpression: 2,
      RestElement: 1
    };
    exports.EXPRESSIONS_PRECEDENCE = EXPRESSIONS_PRECEDENCE;
    function formatSequence(state, nodes) {
      var generator = state.generator;
      state.write("(");
      if (nodes != null && nodes.length > 0) {
        generator[nodes[0].type](nodes[0], state);
        var length = nodes.length;
        for (var i = 1; i < length; i++) {
          var param = nodes[i];
          state.write(", ");
          generator[param.type](param, state);
        }
      }
      state.write(")");
    }
    function expressionNeedsParenthesis(state, node, parentNode, isRightHand) {
      var nodePrecedence = state.expressionsPrecedence[node.type];
      if (nodePrecedence === NEEDS_PARENTHESES) {
        return true;
      }
      var parentNodePrecedence = state.expressionsPrecedence[parentNode.type];
      if (nodePrecedence !== parentNodePrecedence) {
        return !isRightHand && nodePrecedence === 15 && parentNodePrecedence === 14 && parentNode.operator === "**" || nodePrecedence < parentNodePrecedence;
      }
      if (nodePrecedence !== 13 && nodePrecedence !== 14) {
        return false;
      }
      if (node.operator === "**" && parentNode.operator === "**") {
        return !isRightHand;
      }
      if (nodePrecedence === 13 && parentNodePrecedence === 13 && (node.operator === "??" || parentNode.operator === "??")) {
        return true;
      }
      if (isRightHand) {
        return OPERATOR_PRECEDENCE[node.operator] <= OPERATOR_PRECEDENCE[parentNode.operator];
      }
      return OPERATOR_PRECEDENCE[node.operator] < OPERATOR_PRECEDENCE[parentNode.operator];
    }
    function formatExpression(state, node, parentNode, isRightHand) {
      var generator = state.generator;
      if (expressionNeedsParenthesis(state, node, parentNode, isRightHand)) {
        state.write("(");
        generator[node.type](node, state);
        state.write(")");
      } else {
        generator[node.type](node, state);
      }
    }
    function reindent(state, text, indent, lineEnd) {
      var lines = text.split("\n");
      var end = lines.length - 1;
      state.write(lines[0].trim());
      if (end > 0) {
        state.write(lineEnd);
        for (var i = 1; i < end; i++) {
          state.write(indent + lines[i].trim() + lineEnd);
        }
        state.write(indent + lines[end].trim());
      }
    }
    function formatComments(state, comments, indent, lineEnd) {
      var length = comments.length;
      for (var i = 0; i < length; i++) {
        var comment = comments[i];
        state.write(indent);
        if (comment.type[0] === "L") {
          state.write("// " + comment.value.trim() + "\n", comment);
        } else {
          state.write("/*");
          reindent(state, comment.value, indent, lineEnd);
          state.write("*/" + lineEnd);
        }
      }
    }
    function hasCallExpression(node) {
      var currentNode = node;
      while (currentNode != null) {
        var _currentNode = currentNode, type = _currentNode.type;
        if (type[0] === "C" && type[1] === "a") {
          return true;
        } else if (type[0] === "M" && type[1] === "e" && type[2] === "m") {
          currentNode = currentNode.object;
        } else {
          return false;
        }
      }
    }
    function formatVariableDeclaration(state, node) {
      var generator = state.generator;
      var declarations = node.declarations;
      state.write(node.kind + " ");
      var length = declarations.length;
      if (length > 0) {
        generator.VariableDeclarator(declarations[0], state);
        for (var i = 1; i < length; i++) {
          state.write(", ");
          generator.VariableDeclarator(declarations[i], state);
        }
      }
    }
    var ForInStatement;
    var FunctionDeclaration;
    var RestElement;
    var BinaryExpression;
    var ArrayExpression;
    var BlockStatement;
    var GENERATOR = {
      Program: function Program(node, state) {
        var indent = state.indent.repeat(state.indentLevel);
        var lineEnd = state.lineEnd, writeComments = state.writeComments;
        if (writeComments && node.comments != null) {
          formatComments(state, node.comments, indent, lineEnd);
        }
        var statements = node.body;
        var length = statements.length;
        for (var i = 0; i < length; i++) {
          var statement = statements[i];
          if (writeComments && statement.comments != null) {
            formatComments(state, statement.comments, indent, lineEnd);
          }
          state.write(indent);
          this[statement.type](statement, state);
          state.write(lineEnd);
        }
        if (writeComments && node.trailingComments != null) {
          formatComments(state, node.trailingComments, indent, lineEnd);
        }
      },
      BlockStatement: BlockStatement = function BlockStatement2(node, state) {
        var indent = state.indent.repeat(state.indentLevel++);
        var lineEnd = state.lineEnd, writeComments = state.writeComments;
        var statementIndent = indent + state.indent;
        state.write("{");
        var statements = node.body;
        if (statements != null && statements.length > 0) {
          state.write(lineEnd);
          if (writeComments && node.comments != null) {
            formatComments(state, node.comments, statementIndent, lineEnd);
          }
          var length = statements.length;
          for (var i = 0; i < length; i++) {
            var statement = statements[i];
            if (writeComments && statement.comments != null) {
              formatComments(state, statement.comments, statementIndent, lineEnd);
            }
            state.write(statementIndent);
            this[statement.type](statement, state);
            state.write(lineEnd);
          }
          state.write(indent);
        } else {
          if (writeComments && node.comments != null) {
            state.write(lineEnd);
            formatComments(state, node.comments, statementIndent, lineEnd);
            state.write(indent);
          }
        }
        if (writeComments && node.trailingComments != null) {
          formatComments(state, node.trailingComments, statementIndent, lineEnd);
        }
        state.write("}");
        state.indentLevel--;
      },
      ClassBody: BlockStatement,
      StaticBlock: function StaticBlock(node, state) {
        state.write("static ");
        this.BlockStatement(node, state);
      },
      EmptyStatement: function EmptyStatement(node, state) {
        state.write(";");
      },
      ExpressionStatement: function ExpressionStatement(node, state) {
        var precedence = state.expressionsPrecedence[node.expression.type];
        if (precedence === NEEDS_PARENTHESES || precedence === 3 && node.expression.left.type[0] === "O") {
          state.write("(");
          this[node.expression.type](node.expression, state);
          state.write(")");
        } else {
          this[node.expression.type](node.expression, state);
        }
        state.write(";");
      },
      IfStatement: function IfStatement(node, state) {
        state.write("if (");
        this[node.test.type](node.test, state);
        state.write(") ");
        this[node.consequent.type](node.consequent, state);
        if (node.alternate != null) {
          state.write(" else ");
          this[node.alternate.type](node.alternate, state);
        }
      },
      LabeledStatement: function LabeledStatement(node, state) {
        this[node.label.type](node.label, state);
        state.write(": ");
        this[node.body.type](node.body, state);
      },
      BreakStatement: function BreakStatement(node, state) {
        state.write("break");
        if (node.label != null) {
          state.write(" ");
          this[node.label.type](node.label, state);
        }
        state.write(";");
      },
      ContinueStatement: function ContinueStatement(node, state) {
        state.write("continue");
        if (node.label != null) {
          state.write(" ");
          this[node.label.type](node.label, state);
        }
        state.write(";");
      },
      WithStatement: function WithStatement(node, state) {
        state.write("with (");
        this[node.object.type](node.object, state);
        state.write(") ");
        this[node.body.type](node.body, state);
      },
      SwitchStatement: function SwitchStatement(node, state) {
        var indent = state.indent.repeat(state.indentLevel++);
        var lineEnd = state.lineEnd, writeComments = state.writeComments;
        state.indentLevel++;
        var caseIndent = indent + state.indent;
        var statementIndent = caseIndent + state.indent;
        state.write("switch (");
        this[node.discriminant.type](node.discriminant, state);
        state.write(") {" + lineEnd);
        var occurences = node.cases;
        var occurencesCount = occurences.length;
        for (var i = 0; i < occurencesCount; i++) {
          var occurence = occurences[i];
          if (writeComments && occurence.comments != null) {
            formatComments(state, occurence.comments, caseIndent, lineEnd);
          }
          if (occurence.test) {
            state.write(caseIndent + "case ");
            this[occurence.test.type](occurence.test, state);
            state.write(":" + lineEnd);
          } else {
            state.write(caseIndent + "default:" + lineEnd);
          }
          var consequent = occurence.consequent;
          var consequentCount = consequent.length;
          for (var _i = 0; _i < consequentCount; _i++) {
            var statement = consequent[_i];
            if (writeComments && statement.comments != null) {
              formatComments(state, statement.comments, statementIndent, lineEnd);
            }
            state.write(statementIndent);
            this[statement.type](statement, state);
            state.write(lineEnd);
          }
        }
        state.indentLevel -= 2;
        state.write(indent + "}");
      },
      ReturnStatement: function ReturnStatement(node, state) {
        state.write("return");
        if (node.argument) {
          state.write(" ");
          this[node.argument.type](node.argument, state);
        }
        state.write(";");
      },
      ThrowStatement: function ThrowStatement(node, state) {
        state.write("throw ");
        this[node.argument.type](node.argument, state);
        state.write(";");
      },
      TryStatement: function TryStatement(node, state) {
        state.write("try ");
        this[node.block.type](node.block, state);
        if (node.handler) {
          var handler = node.handler;
          if (handler.param == null) {
            state.write(" catch ");
          } else {
            state.write(" catch (");
            this[handler.param.type](handler.param, state);
            state.write(") ");
          }
          this[handler.body.type](handler.body, state);
        }
        if (node.finalizer) {
          state.write(" finally ");
          this[node.finalizer.type](node.finalizer, state);
        }
      },
      WhileStatement: function WhileStatement(node, state) {
        state.write("while (");
        this[node.test.type](node.test, state);
        state.write(") ");
        this[node.body.type](node.body, state);
      },
      DoWhileStatement: function DoWhileStatement(node, state) {
        state.write("do ");
        this[node.body.type](node.body, state);
        state.write(" while (");
        this[node.test.type](node.test, state);
        state.write(");");
      },
      ForStatement: function ForStatement(node, state) {
        state.write("for (");
        if (node.init != null) {
          var init = node.init;
          if (init.type[0] === "V") {
            formatVariableDeclaration(state, init);
          } else {
            this[init.type](init, state);
          }
        }
        state.write("; ");
        if (node.test) {
          this[node.test.type](node.test, state);
        }
        state.write("; ");
        if (node.update) {
          this[node.update.type](node.update, state);
        }
        state.write(") ");
        this[node.body.type](node.body, state);
      },
      ForInStatement: ForInStatement = function ForInStatement2(node, state) {
        state.write("for ".concat(node["await"] ? "await " : "", "("));
        var left = node.left;
        if (left.type[0] === "V") {
          formatVariableDeclaration(state, left);
        } else {
          this[left.type](left, state);
        }
        state.write(node.type[3] === "I" ? " in " : " of ");
        this[node.right.type](node.right, state);
        state.write(") ");
        this[node.body.type](node.body, state);
      },
      ForOfStatement: ForInStatement,
      DebuggerStatement: function DebuggerStatement(node, state) {
        state.write("debugger;", node);
      },
      FunctionDeclaration: FunctionDeclaration = function FunctionDeclaration2(node, state) {
        state.write((node.async ? "async " : "") + (node.generator ? "function* " : "function ") + (node.id ? node.id.name : ""), node);
        formatSequence(state, node.params);
        state.write(" ");
        this[node.body.type](node.body, state);
      },
      FunctionExpression: FunctionDeclaration,
      VariableDeclaration: function VariableDeclaration(node, state) {
        formatVariableDeclaration(state, node);
        state.write(";");
      },
      VariableDeclarator: function VariableDeclarator(node, state) {
        this[node.id.type](node.id, state);
        if (node.init != null) {
          state.write(" = ");
          this[node.init.type](node.init, state);
        }
      },
      ClassDeclaration: function ClassDeclaration(node, state) {
        state.write("class " + (node.id ? "".concat(node.id.name, " ") : ""), node);
        if (node.superClass) {
          state.write("extends ");
          var superClass = node.superClass;
          var type = superClass.type;
          var precedence = state.expressionsPrecedence[type];
          if ((type[0] !== "C" || type[1] !== "l" || type[5] !== "E") && (precedence === NEEDS_PARENTHESES || precedence < state.expressionsPrecedence.ClassExpression)) {
            state.write("(");
            this[node.superClass.type](superClass, state);
            state.write(")");
          } else {
            this[superClass.type](superClass, state);
          }
          state.write(" ");
        }
        this.ClassBody(node.body, state);
      },
      ImportDeclaration: function ImportDeclaration(node, state) {
        state.write("import ");
        var specifiers = node.specifiers, attributes = node.attributes;
        var length = specifiers.length;
        var i = 0;
        if (length > 0) {
          for (; i < length; ) {
            if (i > 0) {
              state.write(", ");
            }
            var specifier = specifiers[i];
            var type = specifier.type[6];
            if (type === "D") {
              state.write(specifier.local.name, specifier);
              i++;
            } else if (type === "N") {
              state.write("* as " + specifier.local.name, specifier);
              i++;
            } else {
              break;
            }
          }
          if (i < length) {
            state.write("{");
            for (; ; ) {
              var _specifier = specifiers[i];
              var name = _specifier.imported.name;
              state.write(name, _specifier);
              if (name !== _specifier.local.name) {
                state.write(" as " + _specifier.local.name);
              }
              if (++i < length) {
                state.write(", ");
              } else {
                break;
              }
            }
            state.write("}");
          }
          state.write(" from ");
        }
        this.Literal(node.source, state);
        if (attributes && attributes.length > 0) {
          state.write(" with { ");
          for (var _i2 = 0; _i2 < attributes.length; _i2++) {
            this.ImportAttribute(attributes[_i2], state);
            if (_i2 < attributes.length - 1) state.write(", ");
          }
          state.write(" }");
        }
        state.write(";");
      },
      ImportAttribute: function ImportAttribute(node, state) {
        this.Identifier(node.key, state);
        state.write(": ");
        this.Literal(node.value, state);
      },
      ImportExpression: function ImportExpression(node, state) {
        state.write("import(");
        this[node.source.type](node.source, state);
        state.write(")");
      },
      ExportDefaultDeclaration: function ExportDefaultDeclaration(node, state) {
        state.write("export default ");
        this[node.declaration.type](node.declaration, state);
        if (state.expressionsPrecedence[node.declaration.type] != null && node.declaration.type[0] !== "F") {
          state.write(";");
        }
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(node, state) {
        state.write("export ");
        if (node.declaration) {
          this[node.declaration.type](node.declaration, state);
        } else {
          state.write("{");
          var specifiers = node.specifiers, length = specifiers.length;
          if (length > 0) {
            for (var i = 0; ; ) {
              var specifier = specifiers[i];
              var name = specifier.local.name;
              state.write(name, specifier);
              if (name !== specifier.exported.name) {
                state.write(" as " + specifier.exported.name);
              }
              if (++i < length) {
                state.write(", ");
              } else {
                break;
              }
            }
          }
          state.write("}");
          if (node.source) {
            state.write(" from ");
            this.Literal(node.source, state);
          }
          if (node.attributes && node.attributes.length > 0) {
            state.write(" with { ");
            for (var _i3 = 0; _i3 < node.attributes.length; _i3++) {
              this.ImportAttribute(node.attributes[_i3], state);
              if (_i3 < node.attributes.length - 1) state.write(", ");
            }
            state.write(" }");
          }
          state.write(";");
        }
      },
      ExportAllDeclaration: function ExportAllDeclaration(node, state) {
        if (node.exported != null) {
          state.write("export * as " + node.exported.name + " from ");
        } else {
          state.write("export * from ");
        }
        this.Literal(node.source, state);
        if (node.attributes && node.attributes.length > 0) {
          state.write(" with { ");
          for (var i = 0; i < node.attributes.length; i++) {
            this.ImportAttribute(node.attributes[i], state);
            if (i < node.attributes.length - 1) state.write(", ");
          }
          state.write(" }");
        }
        state.write(";");
      },
      MethodDefinition: function MethodDefinition(node, state) {
        if (node["static"]) {
          state.write("static ");
        }
        var kind = node.kind[0];
        if (kind === "g" || kind === "s") {
          state.write(node.kind + " ");
        }
        if (node.value.async) {
          state.write("async ");
        }
        if (node.value.generator) {
          state.write("*");
        }
        if (node.computed) {
          state.write("[");
          this[node.key.type](node.key, state);
          state.write("]");
        } else {
          this[node.key.type](node.key, state);
        }
        formatSequence(state, node.value.params);
        state.write(" ");
        this[node.value.body.type](node.value.body, state);
      },
      ClassExpression: function ClassExpression(node, state) {
        this.ClassDeclaration(node, state);
      },
      ArrowFunctionExpression: function ArrowFunctionExpression(node, state) {
        state.write(node.async ? "async " : "", node);
        var params = node.params;
        if (params != null) {
          if (params.length === 1 && params[0].type[0] === "I") {
            state.write(params[0].name, params[0]);
          } else {
            formatSequence(state, node.params);
          }
        }
        state.write(" => ");
        if (node.body.type[0] === "O") {
          state.write("(");
          this.ObjectExpression(node.body, state);
          state.write(")");
        } else {
          this[node.body.type](node.body, state);
        }
      },
      ThisExpression: function ThisExpression(node, state) {
        state.write("this", node);
      },
      Super: function Super(node, state) {
        state.write("super", node);
      },
      RestElement: RestElement = function RestElement2(node, state) {
        state.write("...");
        this[node.argument.type](node.argument, state);
      },
      SpreadElement: RestElement,
      YieldExpression: function YieldExpression(node, state) {
        state.write(node.delegate ? "yield*" : "yield");
        if (node.argument) {
          state.write(" ");
          this[node.argument.type](node.argument, state);
        }
      },
      AwaitExpression: function AwaitExpression(node, state) {
        state.write("await ", node);
        formatExpression(state, node.argument, node);
      },
      TemplateLiteral: function TemplateLiteral(node, state) {
        var quasis = node.quasis, expressions = node.expressions;
        state.write("`");
        var length = expressions.length;
        for (var i = 0; i < length; i++) {
          var expression = expressions[i];
          var _quasi = quasis[i];
          state.write(_quasi.value.raw, _quasi);
          state.write("${");
          this[expression.type](expression, state);
          state.write("}");
        }
        var quasi = quasis[quasis.length - 1];
        state.write(quasi.value.raw, quasi);
        state.write("`");
      },
      TemplateElement: function TemplateElement(node, state) {
        state.write(node.value.raw, node);
      },
      TaggedTemplateExpression: function TaggedTemplateExpression(node, state) {
        formatExpression(state, node.tag, node);
        this[node.quasi.type](node.quasi, state);
      },
      ArrayExpression: ArrayExpression = function ArrayExpression2(node, state) {
        state.write("[");
        if (node.elements.length > 0) {
          var elements = node.elements, length = elements.length;
          for (var i = 0; ; ) {
            var element = elements[i];
            if (element != null) {
              this[element.type](element, state);
            }
            if (++i < length) {
              state.write(", ");
            } else {
              if (element == null) {
                state.write(", ");
              }
              break;
            }
          }
        }
        state.write("]");
      },
      ArrayPattern: ArrayExpression,
      ObjectExpression: function ObjectExpression(node, state) {
        var indent = state.indent.repeat(state.indentLevel++);
        var lineEnd = state.lineEnd, writeComments = state.writeComments;
        var propertyIndent = indent + state.indent;
        state.write("{");
        if (node.properties.length > 0) {
          state.write(lineEnd);
          if (writeComments && node.comments != null) {
            formatComments(state, node.comments, propertyIndent, lineEnd);
          }
          var comma = "," + lineEnd;
          var properties = node.properties, length = properties.length;
          for (var i = 0; ; ) {
            var property = properties[i];
            if (writeComments && property.comments != null) {
              formatComments(state, property.comments, propertyIndent, lineEnd);
            }
            state.write(propertyIndent);
            this[property.type](property, state);
            if (++i < length) {
              state.write(comma);
            } else {
              break;
            }
          }
          state.write(lineEnd);
          if (writeComments && node.trailingComments != null) {
            formatComments(state, node.trailingComments, propertyIndent, lineEnd);
          }
          state.write(indent + "}");
        } else if (writeComments) {
          if (node.comments != null) {
            state.write(lineEnd);
            formatComments(state, node.comments, propertyIndent, lineEnd);
            if (node.trailingComments != null) {
              formatComments(state, node.trailingComments, propertyIndent, lineEnd);
            }
            state.write(indent + "}");
          } else if (node.trailingComments != null) {
            state.write(lineEnd);
            formatComments(state, node.trailingComments, propertyIndent, lineEnd);
            state.write(indent + "}");
          } else {
            state.write("}");
          }
        } else {
          state.write("}");
        }
        state.indentLevel--;
      },
      Property: function Property(node, state) {
        if (node.method || node.kind[0] !== "i") {
          this.MethodDefinition(node, state);
        } else {
          if (!node.shorthand) {
            if (node.computed) {
              state.write("[");
              this[node.key.type](node.key, state);
              state.write("]");
            } else {
              this[node.key.type](node.key, state);
            }
            state.write(": ");
          }
          this[node.value.type](node.value, state);
        }
      },
      PropertyDefinition: function PropertyDefinition(node, state) {
        if (node["static"]) {
          state.write("static ");
        }
        if (node.computed) {
          state.write("[");
        }
        this[node.key.type](node.key, state);
        if (node.computed) {
          state.write("]");
        }
        if (node.value == null) {
          if (node.key.type[0] !== "F") {
            state.write(";");
          }
          return;
        }
        state.write(" = ");
        this[node.value.type](node.value, state);
        state.write(";");
      },
      ObjectPattern: function ObjectPattern(node, state) {
        state.write("{");
        if (node.properties.length > 0) {
          var properties = node.properties, length = properties.length;
          for (var i = 0; ; ) {
            this[properties[i].type](properties[i], state);
            if (++i < length) {
              state.write(", ");
            } else {
              break;
            }
          }
        }
        state.write("}");
      },
      SequenceExpression: function SequenceExpression(node, state) {
        formatSequence(state, node.expressions);
      },
      UnaryExpression: function UnaryExpression(node, state) {
        if (node.prefix) {
          var operator = node.operator, argument = node.argument, type = node.argument.type;
          state.write(operator);
          var needsParentheses = expressionNeedsParenthesis(state, argument, node);
          if (!needsParentheses && (operator.length > 1 || type[0] === "U" && (type[1] === "n" || type[1] === "p") && argument.prefix && argument.operator[0] === operator && (operator === "+" || operator === "-"))) {
            state.write(" ");
          }
          if (needsParentheses) {
            state.write(operator.length > 1 ? " (" : "(");
            this[type](argument, state);
            state.write(")");
          } else {
            this[type](argument, state);
          }
        } else {
          this[node.argument.type](node.argument, state);
          state.write(node.operator);
        }
      },
      UpdateExpression: function UpdateExpression(node, state) {
        if (node.prefix) {
          state.write(node.operator);
          this[node.argument.type](node.argument, state);
        } else {
          this[node.argument.type](node.argument, state);
          state.write(node.operator);
        }
      },
      AssignmentExpression: function AssignmentExpression(node, state) {
        this[node.left.type](node.left, state);
        state.write(" " + node.operator + " ");
        this[node.right.type](node.right, state);
      },
      AssignmentPattern: function AssignmentPattern(node, state) {
        this[node.left.type](node.left, state);
        state.write(" = ");
        this[node.right.type](node.right, state);
      },
      BinaryExpression: BinaryExpression = function BinaryExpression2(node, state) {
        var isIn = node.operator === "in";
        if (isIn) {
          state.write("(");
        }
        formatExpression(state, node.left, node, false);
        state.write(" " + node.operator + " ");
        formatExpression(state, node.right, node, true);
        if (isIn) {
          state.write(")");
        }
      },
      LogicalExpression: BinaryExpression,
      ConditionalExpression: function ConditionalExpression(node, state) {
        var test = node.test;
        var precedence = state.expressionsPrecedence[test.type];
        if (precedence === NEEDS_PARENTHESES || precedence <= state.expressionsPrecedence.ConditionalExpression) {
          state.write("(");
          this[test.type](test, state);
          state.write(")");
        } else {
          this[test.type](test, state);
        }
        state.write(" ? ");
        this[node.consequent.type](node.consequent, state);
        state.write(" : ");
        this[node.alternate.type](node.alternate, state);
      },
      NewExpression: function NewExpression(node, state) {
        state.write("new ");
        var precedence = state.expressionsPrecedence[node.callee.type];
        if (precedence === NEEDS_PARENTHESES || precedence < state.expressionsPrecedence.CallExpression || hasCallExpression(node.callee)) {
          state.write("(");
          this[node.callee.type](node.callee, state);
          state.write(")");
        } else {
          this[node.callee.type](node.callee, state);
        }
        formatSequence(state, node["arguments"]);
      },
      CallExpression: function CallExpression(node, state) {
        var precedence = state.expressionsPrecedence[node.callee.type];
        if (precedence === NEEDS_PARENTHESES || precedence < state.expressionsPrecedence.CallExpression) {
          state.write("(");
          this[node.callee.type](node.callee, state);
          state.write(")");
        } else {
          this[node.callee.type](node.callee, state);
        }
        if (node.optional) {
          state.write("?.");
        }
        formatSequence(state, node["arguments"]);
      },
      ChainExpression: function ChainExpression(node, state) {
        this[node.expression.type](node.expression, state);
      },
      MemberExpression: function MemberExpression(node, state) {
        var precedence = state.expressionsPrecedence[node.object.type];
        if (precedence === NEEDS_PARENTHESES || precedence < state.expressionsPrecedence.MemberExpression) {
          state.write("(");
          this[node.object.type](node.object, state);
          state.write(")");
        } else {
          this[node.object.type](node.object, state);
        }
        if (node.computed) {
          if (node.optional) {
            state.write("?.");
          }
          state.write("[");
          this[node.property.type](node.property, state);
          state.write("]");
        } else {
          if (node.optional) {
            state.write("?.");
          } else {
            state.write(".");
          }
          this[node.property.type](node.property, state);
        }
      },
      MetaProperty: function MetaProperty(node, state) {
        state.write(node.meta.name + "." + node.property.name, node);
      },
      Identifier: function Identifier(node, state) {
        state.write(node.name, node);
      },
      PrivateIdentifier: function PrivateIdentifier(node, state) {
        state.write("#".concat(node.name), node);
      },
      Literal: function Literal(node, state) {
        if (node.raw != null) {
          state.write(node.raw, node);
        } else if (node.regex != null) {
          this.RegExpLiteral(node, state);
        } else if (node.bigint != null) {
          state.write(node.bigint + "n", node);
        } else {
          state.write(stringify(node.value), node);
        }
      },
      RegExpLiteral: function RegExpLiteral(node, state) {
        var regex = node.regex;
        state.write("/".concat(regex.pattern, "/").concat(regex.flags), node);
      }
    };
    exports.GENERATOR = GENERATOR;
    var EMPTY_OBJECT = {};
    var baseGenerator = GENERATOR;
    exports.baseGenerator = baseGenerator;
    var State = (function() {
      function State2(options) {
        _classCallCheck(this, State2);
        var setup = options == null ? EMPTY_OBJECT : options;
        this.output = "";
        if (setup.output != null) {
          this.output = setup.output;
          this.write = this.writeToStream;
        } else {
          this.output = "";
        }
        this.generator = setup.generator != null ? setup.generator : GENERATOR;
        this.expressionsPrecedence = setup.expressionsPrecedence != null ? setup.expressionsPrecedence : EXPRESSIONS_PRECEDENCE;
        this.indent = setup.indent != null ? setup.indent : "  ";
        this.lineEnd = setup.lineEnd != null ? setup.lineEnd : "\n";
        this.indentLevel = setup.startingIndentLevel != null ? setup.startingIndentLevel : 0;
        this.writeComments = setup.comments ? setup.comments : false;
        if (setup.sourceMap != null) {
          this.write = setup.output == null ? this.writeAndMap : this.writeToStreamAndMap;
          this.sourceMap = setup.sourceMap;
          this.line = 1;
          this.column = 0;
          this.lineEndSize = this.lineEnd.split("\n").length - 1;
          this.mapping = {
            original: null,
            generated: this,
            name: void 0,
            source: setup.sourceMap.file || setup.sourceMap._file
          };
        }
      }
      _createClass(State2, [{
        key: "write",
        value: function write(code) {
          this.output += code;
        }
      }, {
        key: "writeToStream",
        value: function writeToStream(code) {
          this.output.write(code);
        }
      }, {
        key: "writeAndMap",
        value: function writeAndMap(code, node) {
          this.output += code;
          this.map(code, node);
        }
      }, {
        key: "writeToStreamAndMap",
        value: function writeToStreamAndMap(code, node) {
          this.output.write(code);
          this.map(code, node);
        }
      }, {
        key: "map",
        value: function map(code, node) {
          if (node != null) {
            var type = node.type;
            if (type[0] === "L" && type[2] === "n") {
              this.column = 0;
              this.line++;
              return;
            }
            if (node.loc != null) {
              var mapping = this.mapping;
              mapping.original = node.loc.start;
              mapping.name = node.name;
              this.sourceMap.addMapping(mapping);
            }
            if (type[0] === "T" && type[8] === "E" || type[0] === "L" && type[1] === "i" && typeof node.value === "string") {
              var _length = code.length;
              var column = this.column, line = this.line;
              for (var i = 0; i < _length; i++) {
                if (code[i] === "\n") {
                  column = 0;
                  line++;
                } else {
                  column++;
                }
              }
              this.column = column;
              this.line = line;
              return;
            }
          }
          var length = code.length;
          var lineEnd = this.lineEnd;
          if (length > 0) {
            if (this.lineEndSize > 0 && (lineEnd.length === 1 ? code[length - 1] === lineEnd : code.endsWith(lineEnd))) {
              this.line += this.lineEndSize;
              this.column = 0;
            } else {
              this.column += length;
            }
          }
        }
      }, {
        key: "toString",
        value: function toString() {
          return this.output;
        }
      }]);
      return State2;
    })();
    function generate(node, options) {
      var state = new State(options);
      state.generator[node.type](node, state);
      return state.output;
    }
  }
});

// src/security/reflective-logic.js
var require_reflective_logic = __commonJS({
  "src/security/reflective-logic.js"(exports, module) {
    var acorn = require_acorn();
    var { generate } = require_astring();
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var { stableStringify } = require_message_security_service();
    var DANGEROUS_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
    var PARSE_OPTIONS = { ecmaVersion: "latest", sourceType: "script" };
    var GENERATE_OPTIONS = { indent: "", lineEnd: "" };
    function parseFunctionSource(source) {
      const trimmed = String(source).trim();
      if (!trimmed) {
        return null;
      }
      const candidates = [];
      if (/^(async\s+)?function\b/.test(trimmed)) {
        candidates.push(trimmed, `(${trimmed})`);
      } else if (/^[a-zA-Z_$][\w$]*\s*\(/.test(trimmed)) {
        candidates.push(`({${trimmed}})`);
      } else {
        candidates.push(`const __fn = ${trimmed};`, trimmed, `(${trimmed})`);
      }
      for (const candidate of candidates) {
        try {
          const program = acorn.parse(candidate, PARSE_OPTIONS);
          const fn = extractFunctionNode(program);
          if (fn) {
            return fn;
          }
        } catch (_) {
        }
      }
      return null;
    }
    function extractFunctionNode(program) {
      const queue = [program];
      while (queue.length > 0) {
        const node = queue.shift();
        if (!node || typeof node !== "object") {
          continue;
        }
        if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
          return node;
        }
        if (node.type === "Program" || node.type === "BlockStatement") {
          queue.push(...node.body || []);
          continue;
        }
        if (node.type === "ExpressionStatement") {
          queue.push(node.expression);
          continue;
        }
        if (node.type === "AssignmentExpression") {
          queue.push(node.right);
          continue;
        }
        if (node.type === "VariableDeclaration") {
          for (const decl of node.declarations) {
            queue.push(decl.init);
          }
          continue;
        }
        if (node.type === "ObjectExpression") {
          for (const prop of node.properties) {
            if (prop.type === "MethodDefinition") {
              return prop.value;
            }
            if (prop.type === "Property") {
              queue.push(prop.value);
            }
          }
        }
      }
      return null;
    }
    function canonicalizeFunctionNode(node) {
      if (node.type === "FunctionDeclaration") {
        return generate({
          ...node,
          type: "FunctionExpression",
          id: null
        }, GENERATE_OPTIONS);
      }
      if (node.type === "FunctionExpression" && node.id) {
        return generate({
          ...node,
          id: null
        }, GENERATE_OPTIONS);
      }
      return generate(node, GENERATE_OPTIONS);
    }
    function normalizeFunctionSource(source, options = {}) {
      const astCanonicalize = options.astCanonicalize !== false;
      if (astCanonicalize) {
        const fnNode = parseFunctionSource(source);
        if (fnNode) {
          return canonicalizeFunctionNode(fnNode);
        }
      }
      const stripComments = options.stripComments !== false;
      const collapseWhitespace = options.collapseWhitespace !== false;
      let normalized = String(source);
      if (stripComments) {
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
      }
      if (collapseWhitespace) {
        normalized = normalized.replace(/\s+/g, " ").trim();
      }
      return normalized;
    }
    function extractFunctionSource(fn, options = {}) {
      const source = fn.toString();
      if (!options.allowNative && /\[native code\]/.test(source)) {
        throw new Error("native functions cannot be fingerprinted reflectively");
      }
      return normalizeFunctionSource(source, options);
    }
    function collectReflectiveFingerprints(input, options = {}) {
      const fingerprints = options.fingerprints || /* @__PURE__ */ new Map();
      const seen = options.seen || /* @__PURE__ */ new WeakSet();
      const path = options.path || "$";
      const walkOptions = {
        allowNative: options.allowNative === true,
        stripComments: options.stripComments !== false,
        collapseWhitespace: options.collapseWhitespace !== false,
        astCanonicalize: options.astCanonicalize !== false,
        fingerprints,
        seen
      };
      function walk(value, currentPath) {
        if (value === null || value === void 0) {
          return value;
        }
        const valueType = typeof value;
        if (valueType === "function") {
          const normalized = extractFunctionSource(value, walkOptions);
          fingerprints.set(currentPath, normalized);
          return { __reflectiveFunction__: currentPath };
        }
        if (valueType === "string" || valueType === "number" || valueType === "boolean") {
          return value;
        }
        if (valueType !== "object") {
          return String(value);
        }
        if (seen.has(value)) {
          return { __reflectiveRef__: currentPath };
        }
        seen.add(value);
        if (Array.isArray(value)) {
          return value.map((item, index) => walk(item, `${currentPath}[${index}]`));
        }
        const out = {};
        const keys = Reflect.ownKeys(value).map((key) => String(key)).filter((key) => !DANGEROUS_KEYS.has(key)).sort();
        for (const key of keys) {
          out[key] = walk(value[key], `${currentPath}.${key}`);
        }
        return out;
      }
      return {
        canonical: walk(input, path),
        fingerprints
      };
    }
    function hashReflectiveLogic(input, options = {}) {
      const { canonical, fingerprints } = collectReflectiveFingerprints(input, options);
      const fingerprintEntries = [...fingerprints.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([path, source]) => ({
        path,
        source,
        hash: digestSha512(source)
      }));
      const payload = stableStringify({
        canonical,
        fingerprints: fingerprintEntries.map((entry) => ({
          path: entry.path,
          source: entry.source
        })),
        policy: options.policy || null
      });
      return {
        hash: digestSha512(payload),
        fingerprints,
        fingerprintList: fingerprintEntries.map(({ path, hash }) => ({ path, hash }))
      };
    }
    function digestSha512(value) {
      const bytes = naclUtil.decodeUTF8(String(value));
      const hash = nacl.hash(bytes);
      const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      return `sha512:${hex}`;
    }
    module.exports = {
      parseFunctionSource,
      canonicalizeFunctionNode,
      normalizeFunctionSource,
      extractFunctionSource,
      collectReflectiveFingerprints,
      hashReflectiveLogic,
      digestSha512
    };
  }
});

// src/security/verification-code.js
var require_verification_code = __commonJS({
  "src/security/verification-code.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var { stableStringify } = require_message_security_service();
    var { hashReflectiveLogic } = require_reflective_logic();
    var COMPATIBILITY_POLICIES = Object.freeze([
      "strict",
      "backward-compatible",
      "patch-only",
      "minor-and-patch",
      "advisory"
    ]);
    var DEFAULT_COMPATIBILITY_POLICY = "advisory";
    var SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;
    function normalizeVerificationCode(codeOrRules, options = {}) {
      if (codeOrRules === null || codeOrRules === void 0) {
        throw new Error("verification code is required");
      }
      if (options.reflective === true) {
        if (typeof codeOrRules === "function" || typeof codeOrRules === "object") {
          return stableStringify(hashReflectiveLogic(codeOrRules, options).fingerprintList);
        }
      }
      if (typeof codeOrRules === "function") {
        return codeOrRules.toString().replace(/\s+/g, " ").trim();
      }
      if (typeof codeOrRules === "string") {
        return codeOrRules.replace(/\s+/g, " ").trim();
      }
      if (typeof codeOrRules === "object") {
        return stableStringify(codeOrRules);
      }
      return String(codeOrRules);
    }
    function hashVerificationCode(codeOrRules, options = {}) {
      const policy = options.policy || DEFAULT_COMPATIBILITY_POLICY;
      if (!COMPATIBILITY_POLICIES.includes(policy)) {
        throw new Error(`invalid compatibility policy: ${policy}`);
      }
      if (options.reflective === true && (typeof codeOrRules === "function" || typeof codeOrRules === "object")) {
        return hashReflectiveLogic(codeOrRules, options).hash;
      }
      const canonical = stableStringify({
        code: normalizeVerificationCode(codeOrRules, options),
        policy
      });
      const bytes = naclUtil.decodeUTF8(canonical);
      const hash = nacl.hash(bytes);
      const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      return `sha512:${hex}`;
    }
    function parseSemver(version) {
      if (typeof version !== "string" || !version.trim()) {
        throw new Error("verificationVersion must be a non-empty semver string");
      }
      const match = version.trim().match(SEMVER_PATTERN);
      if (!match) {
        throw new Error(`invalid semver: ${version}`);
      }
      return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4] || null,
        build: match[5] || null
      };
    }
    function compareSemver(a, b) {
      const left = parseSemver(a);
      const right = parseSemver(b);
      if (left.major !== right.major) {
        return left.major > right.major ? 1 : -1;
      }
      if (left.minor !== right.minor) {
        return left.minor > right.minor ? 1 : -1;
      }
      if (left.patch !== right.patch) {
        return left.patch > right.patch ? 1 : -1;
      }
      return 0;
    }
    function buildPublisherVerificationKey(publisherId, collectionName) {
      if (!publisherId || !collectionName) {
        throw new Error("publisherId and collectionName are required");
      }
      return `${publisherId}:${collectionName}`;
    }
    function buildVerificationEntry({
      code,
      version = null,
      policy = DEFAULT_COMPATIBILITY_POLICY,
      publisherId = null,
      dappId = null,
      reflective = false,
      stripComments = true,
      collapseWhitespace = true,
      allowNative = false
    }) {
      const normalizedPolicy = policy || DEFAULT_COMPATIBILITY_POLICY;
      if (!COMPATIBILITY_POLICIES.includes(normalizedPolicy)) {
        throw new Error(`invalid compatibility policy: ${normalizedPolicy}`);
      }
      const hashOptions = {
        policy: normalizedPolicy,
        reflective,
        stripComments,
        collapseWhitespace,
        allowNative
      };
      const hash = hashVerificationCode(code, hashOptions);
      const versionRegistry = /* @__PURE__ */ new Map();
      let fingerprintList = null;
      if (reflective && (typeof code === "function" || typeof code === "object")) {
        fingerprintList = hashReflectiveLogic(code, hashOptions).fingerprintList;
      }
      if (version) {
        parseSemver(version);
        versionRegistry.set(version, hash);
      }
      return {
        code,
        policy: normalizedPolicy,
        hash,
        version: version || null,
        publisherId: publisherId || null,
        dappId: dappId || null,
        reflective: reflective === true,
        fingerprintList,
        versionRegistry
      };
    }
    function evaluateVerificationCompatibility(localEntry, remoteMeta = {}, context = {}) {
      if (!localEntry) {
        return { action: "accept" };
      }
      const events = [];
      const remoteHash = remoteMeta.verificationHash || null;
      const remoteVersion = remoteMeta.verificationVersion || null;
      const localHash = localEntry.hash;
      const localVersion = localEntry.version;
      const policy = localEntry.policy || DEFAULT_COMPATIBILITY_POLICY;
      if (remoteVersion && localEntry.versionRegistry) {
        const registeredHash = localEntry.versionRegistry.get(remoteVersion);
        if (registeredHash && remoteHash && registeredHash !== remoteHash) {
          events.push({
            type: "warning",
            payload: {
              type: "verification-version-spoof",
              collection: context.collection,
              senderId: context.senderId,
              declaredVersion: remoteVersion,
              declaredHash: remoteHash,
              registeredHash
            }
          });
          if (policy !== "advisory") {
            return {
              action: "reject",
              reason: "verification-version-spoof",
              events: events.concat([{
                type: "policyrejected",
                payload: {
                  policy,
                  collection: context.collection,
                  senderId: context.senderId,
                  localVersion,
                  remoteVersion,
                  localHash,
                  remoteHash,
                  reason: "verification-version-spoof"
                }
              }])
            };
          }
        }
      }
      if (!remoteHash) {
        if (policy === "advisory") {
          events.push({
            type: "warning",
            payload: {
              type: "verification-hash-missing",
              collection: context.collection,
              senderId: context.senderId,
              localHash
            }
          });
          return { action: "accept", events };
        }
        return {
          action: "reject",
          reason: "verification-hash-missing",
          events: events.concat([{
            type: "policyrejected",
            payload: {
              policy,
              collection: context.collection,
              senderId: context.senderId,
              localVersion,
              remoteVersion,
              localHash,
              remoteHash: null,
              reason: "verification-hash-missing"
            }
          }])
        };
      }
      if (remoteHash === localHash) {
        return { action: "accept", events };
      }
      events.push({
        type: "verificationmismatch",
        payload: {
          collection: context.collection,
          senderId: context.senderId,
          localHash,
          remoteHash,
          localVersion,
          remoteVersion
        }
      });
      if (policy === "advisory") {
        events.push({
          type: "warning",
          payload: {
            type: "verification-hash-mismatch",
            collection: context.collection,
            senderId: context.senderId,
            localHash,
            remoteHash
          }
        });
        return { action: "accept", events };
      }
      if (policy === "strict") {
        return {
          action: "reject",
          reason: "strict-hash-mismatch",
          events: events.concat([{
            type: "policyrejected",
            payload: {
              policy,
              collection: context.collection,
              senderId: context.senderId,
              localVersion,
              remoteVersion,
              localHash,
              remoteHash,
              reason: "strict-hash-mismatch"
            }
          }])
        };
      }
      if (!localVersion || !remoteVersion) {
        return {
          action: "reject",
          reason: "version-required-for-policy",
          events: events.concat([{
            type: "policyrejected",
            payload: {
              policy,
              collection: context.collection,
              senderId: context.senderId,
              localVersion,
              remoteVersion,
              localHash,
              remoteHash,
              reason: "version-required-for-policy"
            }
          }])
        };
      }
      const localParsed = parseSemver(localVersion);
      const remoteParsed = parseSemver(remoteVersion);
      let compatible = false;
      if (policy === "backward-compatible") {
        compatible = compareSemver(localVersion, remoteVersion) >= 0;
      } else if (policy === "patch-only") {
        compatible = localParsed.major === remoteParsed.major && localParsed.minor === remoteParsed.minor;
      } else if (policy === "minor-and-patch") {
        compatible = localParsed.major === remoteParsed.major;
      }
      if (compatible) {
        return { action: "accept", events };
      }
      return {
        action: "reject",
        reason: "policy-version-incompatible",
        events: events.concat([{
          type: "policyrejected",
          payload: {
            policy,
            collection: context.collection,
            senderId: context.senderId,
            localVersion,
            remoteVersion,
            localHash,
            remoteHash,
            reason: "policy-version-incompatible"
          }
        }])
      };
    }
    function buildVerificationPresenceMetadata(registry) {
      const out = {};
      if (!registry || registry.size === 0) {
        return out;
      }
      for (const [collection, entry] of registry.entries()) {
        if (entry.version) {
          out[collection] = {
            verificationVersion: entry.version,
            verificationHash: entry.hash
          };
        } else if (entry.hash) {
          out[collection] = { verificationHash: entry.hash };
        }
        if (entry.reflective && Array.isArray(entry.fingerprintList) && entry.fingerprintList.length > 0) {
          out[collection].reflective = true;
          out[collection].logicFingerprints = entry.fingerprintList.map((item) => item.path);
        }
      }
      return out;
    }
    function buildPublisherVerificationPresenceMetadata(publisherRegistry) {
      const out = {};
      if (!publisherRegistry || publisherRegistry.size === 0) {
        return out;
      }
      for (const [key, entry] of publisherRegistry.entries()) {
        const [publisherId, collection] = key.split(":");
        if (!publisherId || !collection || !entry) {
          continue;
        }
        if (!out[publisherId]) {
          out[publisherId] = {};
        }
        const meta = {
          verificationHash: entry.hash
        };
        if (entry.version) {
          meta.verificationVersion = entry.version;
        }
        if (entry.dappId) {
          meta.dappId = entry.dappId;
        }
        if (entry.reflective) {
          meta.reflective = true;
        }
        out[publisherId][collection] = meta;
      }
      return out;
    }
    module.exports = {
      COMPATIBILITY_POLICIES,
      DEFAULT_COMPATIBILITY_POLICY,
      normalizeVerificationCode,
      hashVerificationCode,
      parseSemver,
      compareSemver,
      buildPublisherVerificationKey,
      buildVerificationEntry,
      evaluateVerificationCompatibility,
      buildVerificationPresenceMetadata,
      buildPublisherVerificationPresenceMetadata,
      hashReflectiveLogic
    };
  }
});

// src/core/dignity-p2p.js
var require_dignity_p2p = __commonJS({
  "src/core/dignity-p2p.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var EventEmitter = require_event_emitter();
    var {
      MessageSecurityService,
      stableStringify,
      DEFAULT_APP_PASSWORD
    } = require_message_security_service();
    var {
      revokeAndRotateIdentity,
      rotateIdentityPassword,
      enrollColdRecoveryPassword
    } = require_identity_rotation();
    var { deriveKeyPairFromCredentials } = require_derive_key_pair();
    var {
      DEFAULT_PEER_GROUP_OPTIONS,
      peerGroupScope,
      parsePeerGroupScope,
      selectFanoutPeers
    } = require_peer_group();
    var {
      operationToDomainEvent,
      signDomainEvent,
      verifyDomainEvent,
      applyDomainEventToView,
      createEmptyView,
      buildCheckpoint
    } = require_domain_events();
    var {
      DEFAULT_LIVE_CAP,
      DEFAULT_BULK_INTERVAL_MS,
      assignPeerGroupTier,
      filterPeersByTier
    } = require_peer_group_tiers();
    var { electBulkRelays } = require_bulk_relay();
    var {
      COMPATIBILITY_POLICIES,
      DEFAULT_COMPATIBILITY_POLICY,
      buildVerificationEntry,
      buildPublisherVerificationKey,
      evaluateVerificationCompatibility,
      buildVerificationPresenceMetadata,
      buildPublisherVerificationPresenceMetadata
    } = require_verification_code();
    function computeContentHash(data) {
      const canonical = stableStringify(data || {});
      const bytes = naclUtil.decodeUTF8(canonical);
      const hash = nacl.hash(bytes);
      const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      return `sha512:${hex}`;
    }
    var DignityP2P = class extends EventEmitter {
      constructor({ nodeId, networkAdapter, idGenerator, now, security } = {}) {
        super();
        if (!nodeId) {
          throw new Error("DignityP2P requires nodeId");
        }
        if (!networkAdapter) {
          throw new Error("DignityP2P requires networkAdapter");
        }
        this.nodeId = nodeId;
        this.networkAdapter = networkAdapter;
        this.idGenerator = idGenerator || (() => `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        this.now = now || (() => Date.now());
        this.securityService = new MessageSecurityService({
          nodeId: this.nodeId,
          options: security || {},
          now: this.now
        });
        this.bannedPeers = /* @__PURE__ */ new Map();
        this.peerBanDurationMs = security && typeof security.banDurationMs === "number" ? security.banDurationMs : 48 * 60 * 60 * 1e3;
        this.resolveBroadcastScope = security && typeof security.resolveBroadcastScope === "function" ? security.resolveBroadcastScope : (() => "default");
        this.defaultDiscoveryHeartbeatMs = security && typeof security.discoveryHeartbeatMs === "number" ? security.discoveryHeartbeatMs : 15e3;
        this.defaultPresenceTtlMs = security && typeof security.presenceTtlMs === "number" ? security.presenceTtlMs : 45e3;
        this.discoveryRooms = /* @__PURE__ */ new Map();
        this.presenceByScope = /* @__PURE__ */ new Map();
        this.peerGroups = /* @__PURE__ */ new Map();
        this.seenGossipIds = /* @__PURE__ */ new Map();
        this.defaultPeerGroupFanout = security && typeof security.peerGroupFanout === "number" ? security.peerGroupFanout : DEFAULT_PEER_GROUP_OPTIONS.fanout;
        this.defaultPeerGroupMaxActivePeers = security && typeof security.peerGroupMaxActivePeers === "number" ? security.peerGroupMaxActivePeers : DEFAULT_PEER_GROUP_OPTIONS.maxActivePeers;
        this.defaultGossipMaxHops = security && typeof security.gossipMaxHops === "number" ? security.gossipMaxHops : DEFAULT_PEER_GROUP_OPTIONS.maxHops;
        this.globalMaxOpenConnections = security && typeof security.globalMaxOpenConnections === "number" ? security.globalMaxOpenConnections : 32;
        this.gossipIdTtlMs = security && typeof security.gossipIdTtlMs === "number" ? security.gossipIdTtlMs : 5 * 60 * 1e3;
        this.maxSeenGossipIds = security && typeof security.maxSeenGossipIds === "number" ? security.maxSeenGossipIds : 1e5;
        this.gossipPublishMinIntervalMs = security && typeof security.gossipPublishMinIntervalMs === "number" ? security.gossipPublishMinIntervalMs : 0;
        this.lastGossipPublishAt = /* @__PURE__ */ new Map();
        this.maxAppliedOperations = security && typeof security.maxAppliedOperations === "number" ? security.maxAppliedOperations : 5e4;
        this.domainEventLogs = /* @__PURE__ */ new Map();
        this.lastEventHashByGroup = /* @__PURE__ */ new Map();
        this.bulkRelayByGroup = /* @__PURE__ */ new Map();
        this.replicaViews = /* @__PURE__ */ new Map();
        this.state = /* @__PURE__ */ new Map();
        this.appliedOperations = /* @__PURE__ */ new Map();
        this.verificationRegistry = /* @__PURE__ */ new Map();
        this.publisherVerificationRegistry = /* @__PURE__ */ new Map();
        this.boundMessageHandler = this.handleIncomingMessage.bind(this);
      }
      async start() {
        this.networkAdapter.onMessage(this.boundMessageHandler);
        await this.networkAdapter.start(this.nodeId);
        const appPassword = this.securityService.options.appPassword;
        if (!appPassword || appPassword === DEFAULT_APP_PASSWORD) {
          this.emit("warning", {
            type: "default-app-password",
            message: "Using the default appPassword is insecure; set a strong shared secret in production."
          });
        }
      }
      async stop() {
        const joinedGroups = Array.from(this.peerGroups.keys());
        for (const groupId of joinedGroups) {
          try {
            await this.leavePeerGroup(groupId);
          } catch (error) {
            this.emit("warning", { type: "peer-group-leave-failed", groupId, error });
          }
        }
        const joinedScopes = Array.from(this.discoveryRooms.keys());
        for (const scope of joinedScopes) {
          try {
            await this.leaveDiscovery(scope);
          } catch (error) {
            this.emit("warning", { type: "presence-leave-failed", scope, error });
          }
        }
        this.networkAdapter.offMessage(this.boundMessageHandler);
        await this.networkAdapter.stop();
      }
      getCollection(collectionName) {
        if (!collectionName) {
          throw new Error("collectionName is required");
        }
        if (!this.state.has(collectionName)) {
          this.state.set(collectionName, /* @__PURE__ */ new Map());
        }
        return this.state.get(collectionName);
      }
      normalizeRecord(record) {
        if (!record || record.deletedAt) {
          return null;
        }
        const normalizedData = { ...record.data || {} };
        return {
          id: record.id,
          ownerId: record.ownerId,
          collaboratorIds: Array.isArray(record.collaboratorIds) ? [...record.collaboratorIds] : [],
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
          hash: record.hash || computeContentHash(normalizedData),
          data: normalizedData
        };
      }
      canUpdateRecord(record, actorId) {
        if (!record || !actorId) {
          return false;
        }
        if (record.ownerId === actorId) {
          return true;
        }
        return Array.isArray(record.collaboratorIds) && record.collaboratorIds.includes(actorId);
      }
      normalizeCollaboratorIds(collaborators) {
        if (!Array.isArray(collaborators)) {
          return [];
        }
        return [...new Set(collaborators.filter(Boolean))];
      }
      getRecordPeerIds(collectionName, id, options = {}) {
        const record = options.fromRecord || this.getCollection(collectionName).get(id);
        if (!record) {
          return [];
        }
        const includeSelf = options.includeSelf === true;
        const peerIds = [record.ownerId, ...record.collaboratorIds || []];
        return [...new Set(peerIds.filter(Boolean).filter((peerId) => includeSelf || peerId !== this.nodeId))];
      }
      resolveReplicationPeers(collectionName, id, options = {}, hints = {}) {
        if (options.connectToPeers === false) {
          return void 0;
        }
        if (Array.isArray(options.connectToPeers)) {
          return options.connectToPeers;
        }
        const peerIds = /* @__PURE__ */ new Set();
        if (hints.fromRecord) {
          for (const peerId of this.getRecordPeerIds(collectionName, id, {
            fromRecord: hints.fromRecord,
            includeSelf: true
          })) {
            peerIds.add(peerId);
          }
        } else if (id) {
          for (const peerId of this.getRecordPeerIds(collectionName, id, { includeSelf: true })) {
            peerIds.add(peerId);
          }
        }
        if (Array.isArray(options.collaborators)) {
          for (const peerId of this.normalizeCollaboratorIds(options.collaborators)) {
            peerIds.add(peerId);
          }
        }
        if (Array.isArray(hints.extraPeerIds)) {
          for (const peerId of hints.extraPeerIds) {
            if (peerId) {
              peerIds.add(peerId);
            }
          }
        }
        return [...peerIds].filter((peerId) => peerId && peerId !== this.nodeId);
      }
      async create(collectionName, data, options = {}) {
        const collection = this.getCollection(collectionName);
        const id = options.id || this.idGenerator();
        if (collection.has(id) && !collection.get(id).deletedAt) {
          throw new Error(`Object ${id} already exists in ${collectionName}`);
        }
        const timestamp = this.now();
        const collaboratorIds = this.normalizeCollaboratorIds(options.collaborators);
        const operation = {
          opId: this.idGenerator(),
          kind: "create",
          collectionName,
          id,
          actorId: this.nodeId,
          ownerId: this.nodeId,
          collaboratorIds,
          timestamp,
          payload: { ...data || {} }
        };
        this.attachVerificationMetadata(operation);
        this.applyOperation(operation);
        await this.maybePublishDomainEvent(operation, options);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
          }),
          connectToPeers: this.resolveReplicationPeers(collectionName, null, options, {
            extraPeerIds: options.collaborators
          })
        });
        return this.read(collectionName, id);
      }
      read(collectionName, id) {
        const collection = this.getCollection(collectionName);
        return this.normalizeRecord(collection.get(id));
      }
      list(collectionName, options = {}) {
        const collection = this.getCollection(collectionName);
        const includeDeleted = options.includeDeleted || false;
        const records = [];
        for (const record of collection.values()) {
          if (record.deletedAt && !includeDeleted) {
            continue;
          }
          if (record.deletedAt && includeDeleted) {
            records.push({
              id: record.id,
              ownerId: record.ownerId,
              deletedAt: record.deletedAt,
              version: record.version
            });
            continue;
          }
          records.push(this.normalizeRecord(record));
        }
        return records;
      }
      async update(collectionName, id, partialData, options = {}) {
        const existing = this.getCollection(collectionName).get(id);
        if (!existing || existing.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        if (!this.canUpdateRecord(existing, this.nodeId)) {
          throw new Error(`Only owner ${existing.ownerId} or collaborators can update object ${id}`);
        }
        if (options.collaborators !== void 0 && existing.ownerId !== this.nodeId) {
          throw new Error(`Only owner ${existing.ownerId} can change collaborators on object ${id}`);
        }
        if (typeof options.expectedVersion === "number" && existing.version !== options.expectedVersion) {
          this.emitConflict({
            kind: "update",
            collection: collectionName,
            id,
            expectedVersion: options.expectedVersion,
            currentVersion: existing.version,
            phase: "local"
          });
          const error = new Error(
            `Version conflict on ${collectionName}/${id}: expected ${options.expectedVersion}, current ${existing.version}`
          );
          error.code = "VERSION_CONFLICT";
          throw error;
        }
        const operation = {
          opId: this.idGenerator(),
          kind: "update",
          collectionName,
          id,
          actorId: this.nodeId,
          timestamp: this.now(),
          baseVersion: existing.version,
          payload: { ...partialData }
        };
        if (options.collaborators !== void 0) {
          operation.collaboratorIds = this.normalizeCollaboratorIds(options.collaborators);
        }
        this.attachVerificationMetadata(operation);
        this.applyOperation(operation);
        await this.maybePublishDomainEvent(operation, options);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
          }),
          connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: existing })
        });
        return this.read(collectionName, id);
      }
      async updateWithRetry(collectionName, id, patchFn, options = {}) {
        const maxAttempts = typeof options.maxAttempts === "number" ? options.maxAttempts : 5;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const current = this.read(collectionName, id);
          if (!current) {
            throw new Error(`Object ${id} does not exist in ${collectionName}`);
          }
          const patch = await patchFn(current);
          try {
            return await this.update(collectionName, id, patch, {
              ...options,
              expectedVersion: current.version
            });
          } catch (error) {
            if (error.code !== "VERSION_CONFLICT" || attempt === maxAttempts - 1) {
              throw error;
            }
          }
        }
        throw new Error(`Unable to update ${collectionName}/${id} after ${maxAttempts} attempts`);
      }
      /**
       * Propose an update to the record owner (non-owner turn-based games, #13).
       * @param {string} collectionName
       * @param {string} id
       * @param {object} patch
       * @param {object} [options]
       * @returns {Promise<{ proposalId: string }>}
       */
      async proposeUpdate(collectionName, id, patch, options = {}) {
        const existing = this.getCollection(collectionName).get(id);
        if (!existing || existing.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        if (existing.ownerId === this.nodeId) {
          throw new Error("Owner should call update() directly");
        }
        if (this.isPeerBanned(this.nodeId)) {
          throw new Error("Proposer is banned");
        }
        const proposalId = `prop-${this.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const payload = {
          proposalId,
          collection: collectionName,
          id,
          patch: { ...patch },
          proposerId: this.nodeId,
          baseVersion: existing.version
        };
        await this.sendDirectMessage(existing.ownerId, "proposal", payload);
        if (options.connectToPeers) {
          await this.ensureConnectedToPeers(options.connectToPeers);
        }
        return { proposalId };
      }
      /**
       * Accept a proposal and apply the patch as owner (#13).
       * @param {object} proposal
       * @param {object} [options]
       * @returns {Promise<object>} updated record
       */
      async acceptProposal(proposal, options = {}) {
        if (!proposal || !proposal.collection || !proposal.id) {
          throw new Error("acceptProposal requires a valid proposal");
        }
        const existing = this.read(proposal.collection, proposal.id);
        if (!existing || existing.ownerId !== this.nodeId) {
          throw new Error("Only the record owner can accept proposals");
        }
        if (proposal.proposerId && this.isPeerBanned(proposal.proposerId)) {
          await this.rejectProposal(proposal, "proposer-banned");
          throw new Error("Proposer is banned");
        }
        if (!proposal.patch || typeof proposal.patch !== "object" || Array.isArray(proposal.patch)) {
          await this.rejectProposal(proposal, "invalid-patch");
          throw new Error("Proposal patch must be a plain object");
        }
        try {
          const record = await this.update(proposal.collection, proposal.id, proposal.patch, {
            ...options,
            expectedVersion: proposal.baseVersion
          });
          await this.sendDirectMessage(proposal.proposerId, "proposal:result", {
            proposalId: proposal.proposalId,
            ok: true,
            collection: proposal.collection,
            id: proposal.id
          });
          return record;
        } catch (error) {
          await this.sendDirectMessage(proposal.proposerId, "proposal:result", {
            proposalId: proposal.proposalId,
            ok: false,
            reason: error.message || "rejected",
            code: error.code || "proposal-rejected"
          });
          throw error;
        }
      }
      /**
       * Reject a proposal without applying a patch (#13).
       * @param {object} proposal
       * @param {string} [reason]
       * @returns {Promise<void>}
       */
      async rejectProposal(proposal, reason = "rejected") {
        if (!proposal || !proposal.proposerId) {
          throw new Error("rejectProposal requires proposerId");
        }
        await this.sendDirectMessage(proposal.proposerId, "proposal:result", {
          proposalId: proposal.proposalId,
          ok: false,
          reason,
          code: "proposal-rejected"
        });
      }
      async transferOwnership(collectionName, id, newOwnerId, options = {}) {
        if (!newOwnerId) {
          throw new Error("newOwnerId is required");
        }
        const existing = this.getCollection(collectionName).get(id);
        if (!existing || existing.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        if (existing.ownerId !== this.nodeId) {
          throw new Error(`Only owner ${existing.ownerId} can transfer object ${id}`);
        }
        const operation = {
          opId: this.idGenerator(),
          kind: "transfer-ownership",
          collectionName,
          id,
          actorId: this.nodeId,
          timestamp: this.now(),
          baseVersion: existing.version,
          newOwnerId,
          keepPreviousOwnerAsCollaborator: options.keepAsCollaborator !== false
        };
        this.attachVerificationMetadata(operation);
        this.applyOperation(operation);
        await this.maybePublishDomainEvent(operation, options);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
          }),
          connectToPeers: this.resolveReplicationPeers(collectionName, id, options, {
            fromRecord: existing,
            extraPeerIds: [newOwnerId]
          })
        });
        return this.read(collectionName, id);
      }
      async remove(collectionName, id, options = {}) {
        const existing = this.getCollection(collectionName).get(id);
        if (!existing || existing.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        if (existing.ownerId !== this.nodeId) {
          throw new Error(`Only owner ${existing.ownerId} can delete object ${id}`);
        }
        const operation = {
          opId: this.idGenerator(),
          kind: "delete",
          collectionName,
          id,
          actorId: this.nodeId,
          timestamp: this.now(),
          baseVersion: existing.version
        };
        this.attachVerificationMetadata(operation);
        this.applyOperation(operation);
        await this.maybePublishDomainEvent(operation, options);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
          }),
          connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: existing })
        });
      }
      /**
       * Register verification code and optional compatibility policy for a collection (#115–#117).
       * @param {string} collectionName
       * @param {object} options
       * @param {Function|string|object} options.code
       * @param {string} [options.version] semver
       * @param {string} [options.policy]
       * @returns {object} entry summary
       */
      registerVerification(collectionName, options = {}) {
        if (!collectionName) {
          throw new Error("registerVerification requires collectionName");
        }
        if (!options.code) {
          throw new Error("registerVerification requires code");
        }
        const entry = buildVerificationEntry({
          code: options.code,
          version: options.version || null,
          policy: options.policy || DEFAULT_COMPATIBILITY_POLICY,
          reflective: options.reflective === true,
          stripComments: options.stripComments,
          collapseWhitespace: options.collapseWhitespace,
          allowNative: options.allowNative === true
        });
        this.verificationRegistry.set(collectionName, entry);
        this._refreshDiscoveryVerificationMetadata();
        return {
          collection: collectionName,
          verificationHash: entry.hash,
          verificationVersion: entry.version,
          policy: entry.policy,
          reflective: entry.reflective,
          logicFingerprints: entry.fingerprintList || []
        };
      }
      /**
       * Register official dapp logic for a specific publisher + collection (#123 decentralized trust).
       * Subscribers opt in to this publisher's semver + hash as the official version for that collection.
       * No central registry — trust is peer-to-peer, keyed by publisherId (signed mesh identity).
       *
       * @param {string} publisherId official publisher peer id
       * @param {string} collectionName
       * @param {object} options
       * @param {Function|string|object} options.code
       * @param {string} [options.version] official dapp semver (e.g. 0.13.0)
       * @param {string} [options.policy]
       * @param {string} [options.dappId] manifest id for the decentralized app
       * @returns {object}
       */
      registerPublisherVerification(publisherId, collectionName, options = {}) {
        if (!publisherId) {
          throw new Error("registerPublisherVerification requires publisherId");
        }
        if (!collectionName) {
          throw new Error("registerPublisherVerification requires collectionName");
        }
        if (!options.code) {
          throw new Error("registerPublisherVerification requires code");
        }
        const entry = buildVerificationEntry({
          code: options.code,
          version: options.version || null,
          policy: options.policy || DEFAULT_COMPATIBILITY_POLICY,
          publisherId,
          dappId: options.dappId || null,
          reflective: options.reflective === true,
          stripComments: options.stripComments,
          collapseWhitespace: options.collapseWhitespace,
          allowNative: options.allowNative === true
        });
        const key = buildPublisherVerificationKey(publisherId, collectionName);
        this.publisherVerificationRegistry.set(key, entry);
        if (publisherId === this.nodeId) {
          this._refreshDiscoveryVerificationMetadata();
        }
        return {
          publisherId,
          collection: collectionName,
          dappId: entry.dappId,
          verificationHash: entry.hash,
          verificationVersion: entry.version,
          policy: entry.policy,
          reflective: entry.reflective,
          logicFingerprints: entry.fingerprintList || []
        };
      }
      getVerificationEntry(collectionName) {
        return this.verificationRegistry.get(collectionName) || null;
      }
      getPublisherVerificationEntry(publisherId, collectionName) {
        if (!publisherId || !collectionName) {
          return null;
        }
        return this.publisherVerificationRegistry.get(
          buildPublisherVerificationKey(publisherId, collectionName)
        ) || null;
      }
      resolveVerificationEntry(collectionName, senderId = null) {
        if (senderId) {
          const publisherEntry = this.getPublisherVerificationEntry(senderId, collectionName);
          if (publisherEntry) {
            return publisherEntry;
          }
        }
        return this.getVerificationEntry(collectionName);
      }
      _buildDiscoveryVerificationMetadata() {
        const verification = buildVerificationPresenceMetadata(this.verificationRegistry);
        const officialPublishers = buildPublisherVerificationPresenceMetadata(
          this.publisherVerificationRegistry
        );
        if (Object.keys(officialPublishers).length === 0) {
          return { verification };
        }
        return { verification, officialPublishers };
      }
      _refreshDiscoveryVerificationMetadata() {
        const verificationMeta = this._buildDiscoveryVerificationMetadata();
        for (const [scope, room] of this.discoveryRooms.entries()) {
          if (room) {
            room.metadata = {
              ...room.metadata || {},
              ...verificationMeta
            };
            this.upsertPresence(scope, this.nodeId, room.metadata, room.ttlMs, this.now());
          }
        }
      }
      attachVerificationMetadata(target) {
        if (!target || !target.collectionName) {
          return target;
        }
        const entry = this.resolveVerificationEntry(target.collectionName, this.nodeId);
        if (!entry) {
          return target;
        }
        target.verificationHash = entry.hash;
        if (entry.version) {
          target.verificationVersion = entry.version;
        }
        return target;
      }
      _listOfficialPublisherIdsForCollection(collectionName) {
        const publisherIds = [];
        for (const key of this.publisherVerificationRegistry.keys()) {
          const separator = key.indexOf(":");
          if (separator === -1) {
            continue;
          }
          const collection = key.slice(separator + 1);
          if (collection === collectionName) {
            publisherIds.push(key.slice(0, separator));
          }
        }
        return publisherIds;
      }
      checkVerificationOnIngest(collectionName, remoteMeta = {}, senderId = null) {
        const officialPublishers = this._listOfficialPublisherIdsForCollection(collectionName);
        if (officialPublishers.length > 0 && senderId && !officialPublishers.includes(senderId)) {
          this.emit("policyrejected", {
            policy: "official-publisher-only",
            collection: collectionName,
            senderId,
            officialPublishers,
            reason: "untrusted-publisher"
          });
          return false;
        }
        const entry = this.resolveVerificationEntry(collectionName, senderId);
        const result = evaluateVerificationCompatibility(entry, remoteMeta, {
          collection: collectionName,
          senderId
        });
        for (const evt of result.events || []) {
          this.emit(evt.type, evt.payload);
        }
        return result.action !== "reject";
      }
      registerPeerPublicKey(peerId, publicKey, options = {}) {
        this.securityService.registerPeerPublicKey(peerId, publicKey, options);
      }
      getPeerIdentityGeneration(peerId) {
        return this.securityService.getPeerIdentityGeneration(peerId);
      }
      getPeerIdentityState(peerId) {
        return this.securityService.getPeerIdentityState(peerId);
      }
      applyPeerIdentityRotation(peerId, rotation) {
        const result = this.securityService.applyIdentityRotation(peerId, rotation);
        if (result.applied) {
          this.emit("identityrotated", {
            peerId,
            username: rotation.username,
            fromGeneration: result.fromGeneration,
            toGeneration: result.toGeneration,
            rotationKind: result.rotationKind
          });
        }
        return result;
      }
      async broadcastIdentityRotation(rotation, options = {}) {
        return this.broadcastMessage("identity:rotate", rotation, options);
      }
      async broadcastColdRecoveryEnrollment(enrollment, options = {}) {
        return this.broadcastMessage("identity:cold-enroll", enrollment, options);
      }
      applyPeerColdRecoveryEnrollment(peerId, enrollment) {
        const result = this.securityService.applyColdRecoveryEnrollment(peerId, enrollment);
        if (result.applied) {
          this.emit("coldrecoveryenrolled", {
            peerId,
            username: enrollment.username,
            recoveryPublicKey: enrollment.recoveryPublicKey
          });
        }
        return result;
      }
      async enrollAndBroadcastColdRecovery({
        username,
        coldPassword,
        pepper = "",
        kdfIterations,
        broadcastOptions = {}
      } = {}) {
        const result = await enrollColdRecoveryPassword({
          username,
          coldPassword,
          pepper,
          kdfIterations
        });
        await this.broadcastColdRecoveryEnrollment(result.enrollment, broadcastOptions);
        return result;
      }
      async revokeAndRotateDerivedIdentity({
        username,
        password,
        coldPassword,
        currentGeneration = 1,
        reason = "compromise-recovery",
        pepper = "",
        kdfIterations,
        broadcast = false,
        broadcastOptions = {}
      } = {}) {
        const result = await revokeAndRotateIdentity({
          username,
          password,
          coldPassword,
          currentGeneration,
          reason,
          pepper,
          kdfIterations
        });
        if (broadcast) {
          await this.broadcastIdentityRotation(result.rotation, broadcastOptions);
        }
        return result;
      }
      async rotateDerivedIdentityPassword({
        username,
        currentPassword,
        newPassword,
        coldPassword,
        currentGeneration = 1,
        reason = "password-change",
        pepper = "",
        kdfIterations,
        broadcast = false,
        broadcastOptions = {}
      } = {}) {
        const result = await rotateIdentityPassword({
          username,
          currentPassword,
          newPassword,
          coldPassword,
          currentGeneration,
          reason,
          pepper,
          kdfIterations
        });
        if (broadcast) {
          await this.broadcastIdentityRotation(result.rotation, broadcastOptions);
        }
        return result;
      }
      async adoptDerivedIdentityKeyPair(keyPair, { generation = 1 } = {}) {
        if (!keyPair || !keyPair.signing || !keyPair.encryption) {
          throw new Error("adoptDerivedIdentityKeyPair requires a derived keyPair");
        }
        this.securityService.signingSecretKey = keyPair.signing.secretKey;
        this.securityService.signingPublicKey = keyPair.signing.publicKey;
        this.securityService.encryptionSecretKey = keyPair.encryption.secretKey;
        this.securityService.encryptionPublicKey = keyPair.encryption.publicKey;
        this.securityService.publicKeyBundle = {
          signingPublicKey: naclUtil.encodeBase64(keyPair.signing.publicKey),
          encryptionPublicKey: naclUtil.encodeBase64(keyPair.encryption.publicKey)
        };
        this.securityService.options.keyPair = keyPair;
        this.securityService.options.identityGeneration = generation;
      }
      async deriveAndAdoptIdentity({ username, password, generation = 1, pepper = "", kdfIterations } = {}) {
        const keyPair = await deriveKeyPairFromCredentials({
          username,
          password,
          generation,
          pepper,
          kdfIterations
        });
        await this.adoptDerivedIdentityKeyPair(keyPair, { generation });
        return keyPair;
      }
      trustPeerPublicKey(peerId, publicKey) {
        if (!peerId || !publicKey) {
          return false;
        }
        try {
          this.registerPeerPublicKey(peerId, publicKey);
          return true;
        } catch (error) {
          this.emit("warning", { type: "peer-key-trust-failed", peerId, error });
          return false;
        }
      }
      trustPeerFromMetadata(peerId, metadata) {
        if (!metadata || !metadata.publicKey) {
          return false;
        }
        return this.trustPeerPublicKey(peerId, metadata.publicKey);
      }
      getPublicKey() {
        return this.securityService.getPublicKey();
      }
      async connectToPeer(peerId) {
        if (!peerId || peerId === this.nodeId) {
          return null;
        }
        if (typeof this.networkAdapter.connectToPeer !== "function") {
          throw new Error("Network adapter does not support connectToPeer");
        }
        return this.networkAdapter.connectToPeer(peerId);
      }
      getConnectionStats() {
        const adapter = this.networkAdapter;
        if (!adapter) {
          return { openCount: 0, peerIds: [] };
        }
        const peerIds = typeof adapter.listOpenPeerIds === "function" ? adapter.listOpenPeerIds() : [];
        const openCount = typeof adapter.getOpenConnectionCount === "function" ? adapter.getOpenConnectionCount() : peerIds.length;
        return { openCount, peerIds };
      }
      async ensureConnectedToPeers(peerIds = []) {
        const normalized = [...new Set((peerIds || []).filter(Boolean))];
        const results = [];
        for (const peerId of normalized) {
          if (peerId === this.nodeId) {
            continue;
          }
          try {
            await this.connectToPeer(peerId);
            results.push({ peerId, ok: true });
          } catch (error) {
            this.emit("warning", { type: "peer-connect-failed", peerId, error });
            results.push({ peerId, ok: false, error });
          }
        }
        return results;
      }
      async broadcastMessage(messageType, payload, securityContext = {}) {
        const connectToPeers = securityContext.connectToPeers;
        if (Array.isArray(connectToPeers) && connectToPeers.length > 0) {
          await this.ensureConnectedToPeers(connectToPeers);
          await this.enforceConnectionBudget();
        }
        const envelope = await this.securityService.secureOutgoingMessage({
          messageType,
          payload,
          targetId: null,
          securityContext
        });
        const fanoutPeerIds = securityContext.fanoutPeerIds;
        if (Array.isArray(fanoutPeerIds) && fanoutPeerIds.length > 0 && typeof this.networkAdapter.sendToPeers === "function") {
          await this.networkAdapter.sendToPeers(envelope, fanoutPeerIds);
          return;
        }
        await this.networkAdapter.broadcast(envelope);
      }
      async sendDirectMessage(targetId, messageType, payload) {
        if (targetId) {
          try {
            await this.connectToPeer(targetId);
          } catch (error) {
            this.emit("warning", { type: "direct-message-connect-failed", targetId, error });
          }
        }
        const envelope = await this.securityService.secureOutgoingMessage({
          messageType,
          payload,
          targetId
        });
        if (targetId && typeof this.networkAdapter.sendToPeers === "function") {
          await this.networkAdapter.sendToPeers(envelope, [targetId]);
          return;
        }
        await this.networkAdapter.broadcast(envelope);
      }
      peerGroupScopeFor(groupId) {
        return peerGroupScope(groupId);
      }
      getPeerGroupConfig(groupId) {
        return this.peerGroups.get(groupId) || null;
      }
      listPeerGroupMembers(groupId, options = {}) {
        return this.listPeers(this.peerGroupScopeFor(groupId), options);
      }
      getPeerGroupStats() {
        const adapter = this.networkAdapter;
        const openPeerIds = typeof adapter.listOpenPeerIds === "function" ? adapter.listOpenPeerIds() : [];
        return {
          joinedGroups: Array.from(this.peerGroups.keys()),
          seenGossipCount: this.seenGossipIds.size,
          openConnectionCount: openPeerIds.length,
          globalMaxOpenConnections: this.globalMaxOpenConnections
        };
      }
      pruneSeenGossip() {
        const now = this.now();
        for (const [gossipId, expiresAt] of this.seenGossipIds.entries()) {
          if (expiresAt <= now) {
            this.seenGossipIds.delete(gossipId);
          }
        }
        while (this.seenGossipIds.size > this.maxSeenGossipIds) {
          const oldestGossipId = this.seenGossipIds.keys().next().value;
          if (!oldestGossipId) {
            break;
          }
          this.seenGossipIds.delete(oldestGossipId);
        }
      }
      hasSeenGossip(gossipId) {
        if (!gossipId) {
          return false;
        }
        this.pruneSeenGossip();
        return this.seenGossipIds.has(gossipId);
      }
      markSeenGossip(gossipId) {
        if (!gossipId) {
          return;
        }
        this.seenGossipIds.set(gossipId, this.now() + this.gossipIdTtlMs);
        this.pruneSeenGossip();
      }
      listConnectedPeerIds() {
        if (typeof this.networkAdapter.listOpenPeerIds === "function") {
          return this.networkAdapter.listOpenPeerIds();
        }
        return [];
      }
      selectPeerGroupFanout(groupId, count, excludePeerIds = [], fanoutOptions = {}) {
        const scope = this.peerGroupScopeFor(groupId);
        const group = this.peerGroups.get(groupId);
        let peers = this.listPeers(scope, { includeSelf: false });
        if (group && group.tiered && fanoutOptions.tier) {
          peers = filterPeersByTier(peers, fanoutOptions.tier);
        }
        if (fanoutOptions.bulkRelayOnly) {
          peers = peers.filter((peer) => peer.metadata?.bulkRelay === true);
        }
        return selectFanoutPeers({
          peers,
          count,
          excludePeerIds: [...excludePeerIds, this.nodeId],
          connectedPeerIds: this.listConnectedPeerIds()
        });
      }
      async enforceConnectionBudget() {
        const adapter = this.networkAdapter;
        if (typeof adapter.listOpenPeerIds !== "function" || typeof adapter.disconnectPeer !== "function") {
          return;
        }
        const openPeerIds = adapter.listOpenPeerIds();
        if (openPeerIds.length <= this.globalMaxOpenConnections) {
          return;
        }
        const excess = openPeerIds.length - this.globalMaxOpenConnections;
        const toClose = openPeerIds.slice(0, excess);
        for (const peerId of toClose) {
          try {
            await adapter.disconnectPeer(peerId);
          } catch (error) {
            this.emit("warning", { type: "peer-disconnect-failed", peerId, error });
          }
        }
      }
      async joinPeerGroup(groupId, options = {}) {
        if (!groupId) {
          throw new Error("joinPeerGroup requires groupId");
        }
        const scope = this.peerGroupScopeFor(groupId);
        const role = options.role || options.metadata?.role || "subscriber";
        const tierMode = options.tierMode || "auto";
        const tiered = options.tiered === true || options.tierMode !== void 0 || options.role !== void 0 || typeof options.liveCap === "number";
        const liveCap = typeof options.liveCap === "number" ? options.liveCap : DEFAULT_LIVE_CAP;
        const existingMembers = this.listPeerGroupMembers(groupId, { includeSelf: false });
        const existingSubscriberCount = existingMembers.filter((member) => {
          const memberRole = member.metadata?.peerGroupRole || member.metadata?.role;
          return memberRole !== "publisher";
        }).length;
        let assignedTier = tiered ? assignPeerGroupTier({
          joinIndex: existingSubscriberCount,
          liveCap,
          requestedTier: tierMode === "auto" ? null : tierMode,
          role
        }) : null;
        const publisherId = options.publisherId || (role === "publisher" ? this.nodeId : null);
        const config = {
          fanout: typeof options.fanout === "number" ? options.fanout : this.defaultPeerGroupFanout,
          maxActivePeers: typeof options.maxActivePeers === "number" ? options.maxActivePeers : this.defaultPeerGroupMaxActivePeers,
          maxHops: typeof options.maxHops === "number" ? options.maxHops : this.defaultGossipMaxHops,
          relayEnabled: options.relayEnabled !== false,
          tiered,
          tierMode,
          liveCap,
          bulkIntervalMs: typeof options.bulkIntervalMs === "number" ? options.bulkIntervalMs : DEFAULT_BULK_INTERVAL_MS,
          domainEvents: options.domainEvents !== false,
          autoPublishDomainEvents: options.autoPublishDomainEvents !== false,
          role,
          publisherId,
          commandCapable: options.commandCapable !== false,
          peerGroupTier: assignedTier
        };
        await this.joinDiscovery(scope, {
          metadata: {
            peerGroup: groupId,
            ...assignedTier ? { peerGroupTier: assignedTier } : {},
            peerGroupRole: role,
            ...publisherId ? { publisherId } : {},
            bulkRelay: false,
            ...options.metadata || {}
          },
          bootstrapPeerIds: options.bootstrapPeerIds,
          heartbeatIntervalMs: options.heartbeatIntervalMs,
          ttlMs: options.ttlMs
        });
        this.peerGroups.set(groupId, config);
        if (!this.domainEventLogs.has(groupId)) {
          this.domainEventLogs.set(groupId, []);
        }
        if (!this.replicaViews.has(groupId)) {
          this.replicaViews.set(groupId, createEmptyView());
        }
        this.refreshBulkRelays(groupId);
        if (tiered && tierMode === "auto" && role === "subscriber") {
          assignedTier = this.recalculateOwnPeerGroupTier(groupId) || assignedTier;
          config.peerGroupTier = assignedTier;
        }
        this.emit("peergroupjoined", { groupId, config, tier: assignedTier });
        return config;
      }
      recalculateOwnPeerGroupTier(groupId) {
        const group = this.peerGroups.get(groupId);
        if (!group || !group.tiered || group.role !== "subscriber") {
          return group ? group.peerGroupTier : null;
        }
        if (group.tierMode !== "auto") {
          return group.peerGroupTier;
        }
        const scope = this.peerGroupScopeFor(groupId);
        const members = this.listPeerGroupMembers(groupId, { includeSelf: true });
        const subscribers = members.filter((member) => {
          const memberRole = member.metadata?.peerGroupRole || member.metadata?.role;
          return memberRole !== "publisher";
        }).map((member) => member.peerId).sort();
        const joinIndex = subscribers.indexOf(this.nodeId);
        if (joinIndex < 0) {
          return group.peerGroupTier;
        }
        const newTier = assignPeerGroupTier({
          joinIndex,
          liveCap: group.liveCap,
          requestedTier: null,
          role: "subscriber"
        });
        if (newTier === group.peerGroupTier) {
          return newTier;
        }
        group.peerGroupTier = newTier;
        const room = this.discoveryRooms.get(scope);
        if (room) {
          room.metadata = {
            ...room.metadata || {},
            peerGroupTier: newTier
          };
          this.upsertPresence(scope, this.nodeId, room.metadata, room.ttlMs, this.now());
          this.announcePresence(scope).catch((error) => {
            this.emit("warning", { type: "tier-announce-failed", groupId, error });
          });
        }
        return newTier;
      }
      async leavePeerGroup(groupId) {
        if (!groupId) {
          return;
        }
        const scope = this.peerGroupScopeFor(groupId);
        await this.leaveDiscovery(scope);
        this.peerGroups.delete(groupId);
        this.bulkRelayByGroup.delete(groupId);
        this.emit("peergroupleft", { groupId });
      }
      async publishToPeerGroup(groupId, innerMessageType, innerPayload, options = {}) {
        if (!groupId) {
          throw new Error("publishToPeerGroup requires groupId");
        }
        const group = this.peerGroups.get(groupId);
        if (!group && options.allowUnjoined !== true) {
          throw new Error(`PeerGroup ${groupId} has not been joined`);
        }
        if (this.gossipPublishMinIntervalMs > 0) {
          const lastPublishAt = this.lastGossipPublishAt.get(groupId) || 0;
          const elapsed = this.now() - lastPublishAt;
          if (elapsed < this.gossipPublishMinIntervalMs) {
            const error = new Error(`Gossip publish rate limit exceeded for group ${groupId}`);
            error.code = "GOSSIP_RATE_LIMIT";
            throw error;
          }
        }
        const fanout = typeof options.fanout === "number" ? options.fanout : group ? group.fanout : this.defaultPeerGroupFanout;
        const maxActivePeers = group ? group.maxActivePeers : this.defaultPeerGroupMaxActivePeers;
        const maxHop = typeof options.maxHops === "number" ? options.maxHops : group ? group.maxHops : this.defaultGossipMaxHops;
        const fanoutOptions = {};
        if (group && group.tiered && options.tier !== "bulk") {
          fanoutOptions.tier = options.tier || "live";
        }
        const fanoutPeerIds = this.selectPeerGroupFanout(groupId, fanout, [this.nodeId], fanoutOptions);
        if (fanoutPeerIds.length > 0) {
          await this.ensureConnectedToPeers(fanoutPeerIds.slice(0, maxActivePeers));
          await this.enforceConnectionBudget();
        }
        const gossipId = options.gossipId || this.idGenerator();
        this.markSeenGossip(gossipId);
        this.lastGossipPublishAt.set(groupId, this.now());
        await this.broadcastMessage("peer-group:gossip", {
          groupId,
          gossipId,
          publisherId: this.nodeId,
          hop: 0,
          maxHop,
          innerMessageType,
          innerPayload
        }, {
          broadcastScope: this.peerGroupScopeFor(groupId),
          fanoutPeerIds
        });
        return { gossipId, fanoutPeerIds };
      }
      async publishPeerGroupBulk(groupId, innerMessageType, innerPayload, options = {}) {
        const group = this.peerGroups.get(groupId);
        if (!group && options.allowUnjoined !== true) {
          throw new Error(`PeerGroup ${groupId} has not been joined`);
        }
        if (group && group.role !== "publisher") {
          throw new Error(`Only publisher can bulk-publish to PeerGroup ${groupId}`);
        }
        const fanout = typeof options.fanout === "number" ? options.fanout : group ? group.fanout : this.defaultPeerGroupFanout;
        const maxActivePeers = group ? group.maxActivePeers : this.defaultPeerGroupMaxActivePeers;
        const maxHop = typeof options.maxHops === "number" ? options.maxHops : group ? group.maxHops : this.defaultGossipMaxHops;
        const fanoutPeerIds = this.selectPeerGroupFanout(
          groupId,
          fanout,
          [this.nodeId],
          { tier: "bulk", bulkRelayOnly: group?.tiered === true }
        );
        if (fanoutPeerIds.length > 0) {
          await this.ensureConnectedToPeers(fanoutPeerIds.slice(0, maxActivePeers));
          await this.enforceConnectionBudget();
        }
        const gossipId = options.gossipId || this.idGenerator();
        this.markSeenGossip(gossipId);
        await this.broadcastMessage("peer-group:gossip", {
          groupId,
          gossipId,
          publisherId: this.nodeId,
          hop: 0,
          maxHop,
          deliveryTier: "bulk",
          innerMessageType,
          innerPayload
        }, {
          broadcastScope: this.peerGroupScopeFor(groupId),
          fanoutPeerIds
        });
        return { gossipId, fanoutPeerIds };
      }
      async publishPeerGroupCheckpoint(groupId, options = {}) {
        const group = this.peerGroups.get(groupId);
        if (!group) {
          throw new Error(`PeerGroup ${groupId} has not been joined`);
        }
        const events = this.domainEventLogs.get(groupId) || [];
        const checkpoint = buildCheckpoint(groupId, events, {
          publisherId: options.publisherId || group.publisherId || this.nodeId
        });
        await this.publishPeerGroupBulk(groupId, "domain:checkpoint", checkpoint, options);
        this.emit("checkpointpublished", { groupId, checkpoint });
        return checkpoint;
      }
      resolvePublisherGroupIds(options = {}) {
        if (options.peerGroupId) {
          return [options.peerGroupId];
        }
        const groups = [];
        for (const [groupId, config] of this.peerGroups.entries()) {
          if (config.domainEvents && config.autoPublishDomainEvents && config.role === "publisher") {
            groups.push(groupId);
          }
        }
        return groups;
      }
      async maybePublishDomainEvent(operation, options = {}) {
        const groupIds = this.resolvePublisherGroupIds(options);
        if (groupIds.length === 0) {
          return;
        }
        for (const groupId of groupIds) {
          await this.publishDomainEventForOperation(groupId, operation);
        }
      }
      async publishDomainEventForOperation(groupId, operation) {
        const group = this.peerGroups.get(groupId);
        if (!group || !group.domainEvents) {
          return null;
        }
        if (group.role !== "publisher") {
          throw new Error(`Only publisher can emit domain events for PeerGroup ${groupId}`);
        }
        const prevHash = this.lastEventHashByGroup.get(groupId) || null;
        let event = operationToDomainEvent(operation, {
          publisherId: this.nodeId,
          groupId,
          prevHash,
          eventIdGenerator: () => this.idGenerator()
        });
        if (this.securityService.options.signingEnabled && this.securityService.signingSecretKey) {
          event = signDomainEvent(event, this.securityService.signingSecretKey);
        }
        const log = this.domainEventLogs.get(groupId) || [];
        log.push(event);
        this.domainEventLogs.set(groupId, log);
        this.lastEventHashByGroup.set(groupId, event.eventHash);
        this.emit("domainevent", event);
        if (group.autoPublishDomainEvents) {
          await this.publishToPeerGroup(groupId, "domain:event", event, { tier: "live" });
          if (group.tiered) {
            await this.publishPeerGroupBulk(groupId, "domain:event", event);
          }
        }
        return event;
      }
      refreshBulkRelays(groupId) {
        const group = this.peerGroups.get(groupId);
        if (!group || !group.tiered) {
          return [];
        }
        const peers = this.listPeerGroupMembers(groupId, { includeSelf: false });
        const relays = electBulkRelays(peers);
        const previous = this.bulkRelayByGroup.get(groupId) || [];
        this.bulkRelayByGroup.set(groupId, relays);
        const changed = previous.length !== relays.length || previous.some((id, index) => id !== relays[index]);
        if (changed) {
          this.emit("bulkrelaychanged", { groupId, relays, previous });
        }
        return relays;
      }
      ingestRemoteDomainEvent(event, context = {}) {
        const groupId = event.groupId || context.groupId;
        if (!groupId) {
          return false;
        }
        const group = this.peerGroups.get(groupId);
        if (!group) {
          return false;
        }
        const publisherId = event.publisherId || context.publisherId;
        if (group.publisherId && publisherId !== group.publisherId) {
          this.emit("warning", {
            type: "domain-event-rejected",
            groupId,
            reason: "publisher-mismatch",
            eventId: event.eventId,
            expectedPublisher: group.publisherId,
            actualPublisher: publisherId
          });
          return false;
        }
        let signingPublicKey = null;
        if (this.securityService.options.signingEnabled && publisherId) {
          const peerKey = this.securityService.resolvePeerPublicKey(publisherId, null);
          signingPublicKey = peerKey ? peerKey.signingPublicKey : null;
          if (!signingPublicKey) {
            this.emit("warning", {
              type: "domain-event-rejected",
              groupId,
              reason: "missing-publisher-key",
              eventId: event.eventId,
              publisherId
            });
            return false;
          }
        }
        const verified = verifyDomainEvent(event, { signingPublicKey });
        if (!verified.ok) {
          this.emit("warning", {
            type: "domain-event-rejected",
            groupId,
            reason: verified.reason,
            eventId: event.eventId
          });
          return false;
        }
        if (this.securityService.options.signingEnabled && verified.unsigned) {
          this.emit("warning", {
            type: "domain-event-rejected",
            groupId,
            reason: "unsigned-event",
            eventId: event.eventId
          });
          return false;
        }
        if (!this.checkVerificationOnIngest(event.collectionName, {
          verificationHash: event.verificationHash,
          verificationVersion: event.verificationVersion
        }, context.senderId || publisherId)) {
          return false;
        }
        const log = this.domainEventLogs.get(groupId) || [];
        if (log.some((entry) => entry.eventId === event.eventId)) {
          return false;
        }
        const expectedPrev = log.length > 0 ? log[log.length - 1].eventHash : null;
        if (event.prevHash !== expectedPrev) {
          this.emit("chainbroken", {
            groupId,
            expectedPrev,
            actualPrev: event.prevHash,
            eventId: event.eventId
          });
          return false;
        }
        log.push(event);
        this.domainEventLogs.set(groupId, log);
        this.lastEventHashByGroup.set(groupId, event.eventHash);
        if (!group.commandCapable) {
          const view = this.replicaViews.get(groupId) || createEmptyView();
          applyDomainEventToView(view, event);
          this.replicaViews.set(groupId, view);
        }
        this.emit("domainevent", event);
        return true;
      }
      async publishRecordToPeerGroup(groupId, collectionName, id, options = {}) {
        const collection = this.getCollection(collectionName);
        const raw = collection.get(id);
        if (!raw || raw.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        const record = this.normalizeRecord(raw);
        return this.publishToPeerGroup(groupId, "record:snapshot", {
          collectionName,
          record
        }, options);
      }
      async handlePeerGroupGossip(decrypted) {
        const payload = decrypted.payload || {};
        const {
          groupId,
          gossipId,
          publisherId = decrypted.senderId,
          hop = 0,
          maxHop: payloadMaxHop,
          innerMessageType,
          innerPayload
        } = payload;
        if (!groupId || !innerMessageType || !gossipId) {
          return;
        }
        if (!this.peerGroups.has(groupId)) {
          return;
        }
        if (this.hasSeenGossip(gossipId)) {
          return;
        }
        this.markSeenGossip(gossipId);
        await this.dispatchPeerGroupInnerMessage(innerMessageType, innerPayload, {
          groupId,
          senderId: decrypted.senderId,
          publisherId
        });
        const group = this.peerGroups.get(groupId);
        const deliveryTier = payload.deliveryTier || "live";
        if (group && group.tiered && group.peerGroupTier === "bulk" && deliveryTier !== "bulk") {
          return;
        }
        const configuredMaxHop = group ? group.maxHops : this.defaultGossipMaxHops;
        const maxHop = typeof payloadMaxHop === "number" ? Math.min(payloadMaxHop, configuredMaxHop) : configuredMaxHop;
        if (!group || group.relayEnabled === false || hop >= maxHop) {
          return;
        }
        const relayOptions = {};
        if (group.tiered) {
          relayOptions.tier = deliveryTier === "bulk" ? "bulk" : "live";
          if (deliveryTier === "bulk") {
            relayOptions.bulkRelayOnly = true;
          }
        }
        const relayPeers = this.selectPeerGroupFanout(groupId, group.fanout, [
          decrypted.senderId,
          this.nodeId
        ], relayOptions);
        if (relayPeers.length === 0) {
          return;
        }
        await this.ensureConnectedToPeers(relayPeers.slice(0, group.maxActivePeers));
        await this.enforceConnectionBudget();
        await this.broadcastMessage("peer-group:gossip", {
          groupId,
          gossipId,
          publisherId,
          hop: hop + 1,
          maxHop,
          deliveryTier,
          innerMessageType,
          innerPayload
        }, {
          broadcastScope: this.peerGroupScopeFor(groupId),
          fanoutPeerIds: relayPeers
        });
      }
      normalizeGossipOperation(operation, publisherId) {
        if (!operation || !publisherId) {
          return null;
        }
        if (operation.actorId && operation.actorId !== publisherId) {
          this.emit("warning", {
            type: "gossip-operation-actor-mismatch",
            publisherId,
            actorId: operation.actorId,
            kind: operation.kind,
            collection: operation.collectionName,
            id: operation.id
          });
          return null;
        }
        const normalized = {
          ...operation,
          actorId: publisherId
        };
        if (normalized.kind === "create") {
          normalized.ownerId = publisherId;
        }
        return normalized;
      }
      async dispatchPeerGroupInnerMessage(innerMessageType, innerPayload, context = {}) {
        if (innerMessageType === "operation") {
          const operation = this.normalizeGossipOperation(
            innerPayload,
            context.publisherId || context.senderId
          );
          if (operation) {
            this.applyOperation(operation, { senderId: context.senderId });
          }
          return;
        }
        if (innerMessageType === "domain:event") {
          this.ingestRemoteDomainEvent(innerPayload, context);
          return;
        }
        if (innerMessageType === "domain:checkpoint") {
          this.emit("peergroupmessage", {
            groupId: context.groupId,
            senderId: context.senderId,
            type: "domain:checkpoint",
            payload: innerPayload
          });
          return;
        }
        if (innerMessageType === "record:snapshot") {
          const { collectionName, record } = innerPayload || {};
          if (collectionName && record) {
            const applied = this.restoreRecord(collectionName, record, {
              rejectOnHashMismatch: true,
              rejectOnOwnershipMismatch: true,
              via: "peer-group",
              senderId: context.senderId
            });
            if (applied) {
              this.emit("change", {
                kind: "snapshot",
                collection: collectionName,
                id: record.id,
                via: "peer-group",
                groupId: context.groupId
              });
            }
          }
          return;
        }
        this.emit("peergroupmessage", {
          groupId: context.groupId,
          senderId: context.senderId,
          type: innerMessageType,
          payload: innerPayload
        });
      }
      getPresenceMap(scope) {
        if (!this.presenceByScope.has(scope)) {
          this.presenceByScope.set(scope, /* @__PURE__ */ new Map());
        }
        return this.presenceByScope.get(scope);
      }
      upsertPresence(scope, peerId, metadata, ttlMs, announcedAt) {
        const map = this.getPresenceMap(scope);
        const existing = map.get(peerId);
        const next = {
          peerId,
          scope,
          metadata: metadata ? { ...metadata } : {},
          lastSeenAt: announcedAt,
          expiresAt: announcedAt + ttlMs
        };
        map.set(peerId, next);
        this.trustPeerFromMetadata(peerId, next.metadata);
        const groupId = parsePeerGroupScope(scope);
        if (groupId && this.peerGroups.has(groupId)) {
          this.refreshBulkRelays(groupId);
          if (peerId !== this.nodeId) {
            this.recalculateOwnPeerGroupTier(groupId);
          }
        }
        if (!existing) {
          this.emit("peerdiscovered", { scope, peerId, metadata: next.metadata });
        }
        return next;
      }
      prunePresence(scope) {
        const map = this.presenceByScope.get(scope);
        if (!map) {
          return;
        }
        const now = this.now();
        for (const [peerId, entry] of map.entries()) {
          if (entry.expiresAt <= now) {
            map.delete(peerId);
            this.emit("peerleft", { scope, peerId, reason: "timeout" });
          }
        }
      }
      async joinDiscovery(scope = "main", options = {}) {
        const normalizedScope = scope || "main";
        const heartbeatIntervalMs = options.heartbeatIntervalMs || this.defaultDiscoveryHeartbeatMs;
        const ttlMs = options.ttlMs || this.defaultPresenceTtlMs;
        const metadata = {
          publicKey: this.getPublicKey(),
          ...this._buildDiscoveryVerificationMetadata(),
          ...options.metadata || {}
        };
        const bootstrapPeerIds = Array.isArray(options.bootstrapPeerIds) ? [...new Set(options.bootstrapPeerIds.filter(Boolean))] : [];
        const existing = this.discoveryRooms.get(normalizedScope);
        if (existing && existing.timer) {
          clearInterval(existing.timer);
        }
        if (bootstrapPeerIds.length > 0) {
          await this.ensureConnectedToPeers(bootstrapPeerIds);
        }
        const timer = setInterval(() => {
          this.announcePresence(normalizedScope).catch((error) => {
            this.emit("warning", { type: "presence-heartbeat-failed", scope: normalizedScope, error });
          });
        }, heartbeatIntervalMs);
        this.discoveryRooms.set(normalizedScope, {
          metadata,
          bootstrapPeerIds,
          heartbeatIntervalMs,
          ttlMs,
          timer
        });
        this.upsertPresence(normalizedScope, this.nodeId, metadata, ttlMs, this.now());
        await this.announcePresence(normalizedScope);
      }
      async announcePresence(scope = "main", metadataOverride = null) {
        const normalizedScope = scope || "main";
        const room = this.discoveryRooms.get(normalizedScope);
        if (!room) {
          throw new Error(`Scope ${normalizedScope} has not been joined for discovery`);
        }
        const metadata = metadataOverride || room.metadata || {};
        const announcedAt = this.now();
        this.upsertPresence(normalizedScope, this.nodeId, metadata, room.ttlMs, announcedAt);
        await this.broadcastMessage(
          "presence:announce",
          {
            scope: normalizedScope,
            peerId: this.nodeId,
            metadata,
            ttlMs: room.ttlMs,
            announcedAt
          },
          { broadcastScope: normalizedScope }
        );
      }
      async leaveDiscovery(scope = "main") {
        const normalizedScope = scope || "main";
        const room = this.discoveryRooms.get(normalizedScope);
        if (!room) {
          return;
        }
        if (room.timer) {
          clearInterval(room.timer);
        }
        this.discoveryRooms.delete(normalizedScope);
        const map = this.presenceByScope.get(normalizedScope);
        if (map) {
          map.delete(this.nodeId);
        }
        await this.broadcastMessage(
          "presence:leave",
          {
            scope: normalizedScope,
            peerId: this.nodeId,
            leftAt: this.now()
          },
          { broadcastScope: normalizedScope }
        );
      }
      listPeers(scope = "main", options = {}) {
        const normalizedScope = scope || "main";
        const includeSelf = options.includeSelf !== false;
        this.prunePresence(normalizedScope);
        const map = this.presenceByScope.get(normalizedScope);
        if (!map) {
          return [];
        }
        return Array.from(map.values()).filter((entry) => includeSelf || entry.peerId !== this.nodeId).map((entry) => ({
          peerId: entry.peerId,
          scope: entry.scope,
          metadata: { ...entry.metadata },
          lastSeenAt: entry.lastSeenAt,
          expiresAt: entry.expiresAt
        }));
      }
      async handleIncomingMessage(message) {
        if (message && message.opId && message.kind) {
          if (this.securityService.options.enabled) {
            this.emit("messageignored", {
              reason: "raw-operation-rejected",
              hint: "Unsigned raw operations are disabled when security is enabled"
            });
            return;
          }
          this.applyOperation(message);
          return;
        }
        if (message && message.senderId && this.isPeerBanned(message.senderId)) {
          this.emit("messageignored", {
            senderId: message.senderId,
            reason: "peer-banned"
          });
          return;
        }
        let decrypted;
        try {
          decrypted = await this.securityService.decryptIncomingMessage(message);
        } catch (error) {
          const senderId = message ? message.senderId : null;
          if (senderId && (error.code === "INVALID_SIGNATURE" || error.code === "INVALID_POW")) {
            this.banPeer(senderId, this.peerBanDurationMs, error.code);
          }
          this.emit("securityerror", {
            senderId,
            error
          });
          return;
        }
        if (!decrypted || decrypted.ignored) {
          return;
        }
        if (decrypted.messageType === "identity:rotate") {
          const peerId = decrypted.senderId || decrypted.payload?.username;
          if (peerId && decrypted.payload) {
            const result = this.applyPeerIdentityRotation(peerId, decrypted.payload);
            if (!result.applied) {
              this.emit("warning", {
                type: "identity-rotation-ignored",
                peerId,
                reason: result.reason
              });
            }
          }
          return;
        }
        if (decrypted.messageType === "identity:cold-enroll") {
          const peerId = decrypted.senderId || decrypted.payload?.username;
          if (peerId && decrypted.payload) {
            try {
              this.applyPeerColdRecoveryEnrollment(peerId, decrypted.payload);
            } catch (error) {
              this.emit("warning", {
                type: "cold-recovery-enrollment-rejected",
                peerId,
                error
              });
            }
          }
          return;
        }
        if (message && message.senderId && message.senderPublicKey) {
          this.trustPeerPublicKey(message.senderId, message.senderPublicKey);
        }
        if (decrypted.messageType === "operation") {
          this.applyOperation(decrypted.payload, { senderId: decrypted.senderId });
          return;
        }
        if (decrypted.messageType === "record:snapshot") {
          const payload = decrypted.payload || {};
          const { collectionName, record } = payload;
          if (collectionName && record) {
            const applied = this.restoreRecord(collectionName, record, {
              rejectOnHashMismatch: true,
              via: "direct-mesh",
              senderId: decrypted.senderId
            });
            if (applied) {
              this.emit("change", {
                kind: "snapshot",
                collection: collectionName,
                id: record.id
              });
            }
          }
          return;
        }
        if (decrypted.messageType === "presence:announce") {
          const payload = decrypted.payload || {};
          const scope = payload.scope || "main";
          const peerId = payload.peerId || decrypted.senderId;
          if (!peerId || peerId !== decrypted.senderId) {
            return;
          }
          if (!this.discoveryRooms.has(scope)) {
            return;
          }
          const room = this.discoveryRooms.get(scope);
          const presenceMap = this.getPresenceMap(scope);
          const isNewPeerInScope = !presenceMap.has(peerId);
          const requestedTtl = typeof payload.ttlMs === "number" ? payload.ttlMs : room.ttlMs;
          const ttlMs = Math.min(requestedTtl, room.ttlMs);
          this.upsertPresence(
            scope,
            peerId,
            payload.metadata || {},
            ttlMs,
            this.now()
          );
          if (payload.metadata && payload.metadata.publicKey) {
            this.trustPeerPublicKey(peerId, payload.metadata.publicKey);
          }
          if (isNewPeerInScope && peerId !== this.nodeId && this.discoveryRooms.has(scope)) {
            if (typeof this.networkAdapter.connectToPeer === "function") {
              Promise.resolve(this.connectToPeer(peerId)).catch((error) => {
                this.emit("warning", { type: "peer-connect-failed", scope, peerId, error });
              });
            }
            this.announcePresence(scope).catch((error) => {
              this.emit("warning", { type: "presence-handshake-failed", scope, error });
            });
          }
          return;
        }
        if (decrypted.messageType === "presence:leave") {
          const payload = decrypted.payload || {};
          const scope = payload.scope || "main";
          const peerId = payload.peerId || decrypted.senderId;
          if (!peerId || peerId !== decrypted.senderId) {
            return;
          }
          const map = this.presenceByScope.get(scope);
          if (map && peerId && map.has(peerId)) {
            map.delete(peerId);
            this.emit("peerleft", { scope, peerId, reason: "leave" });
          }
          return;
        }
        if (decrypted.messageType === "peer-group:gossip") {
          await this.handlePeerGroupGossip(decrypted);
          return;
        }
        if (decrypted.messageType === "proposal") {
          const payload = decrypted.payload || {};
          if (!payload.proposalId || payload.proposerId !== decrypted.senderId) {
            return;
          }
          if (!payload.patch || typeof payload.patch !== "object" || Array.isArray(payload.patch)) {
            return;
          }
          const record = this.read(payload.collection, payload.id);
          if (!record || record.ownerId !== this.nodeId) {
            return;
          }
          if (this.isPeerBanned(decrypted.senderId)) {
            return;
          }
          this.emit("proposal", {
            proposalId: payload.proposalId,
            collection: payload.collection,
            id: payload.id,
            patch: payload.patch,
            proposerId: decrypted.senderId,
            baseVersion: payload.baseVersion
          });
          return;
        }
        if (decrypted.messageType === "proposal:result") {
          this.emit("proposalresult", {
            ...decrypted.payload,
            fromPeerId: decrypted.senderId
          });
          return;
        }
        this.emit("message", {
          senderId: decrypted.senderId,
          targetId: decrypted.targetId,
          type: decrypted.messageType,
          payload: decrypted.payload
        });
      }
      banPeer(peerId, durationMs = this.peerBanDurationMs, reason = "manual") {
        if (!peerId) {
          return;
        }
        const bannedUntil = this.now() + Math.max(1, durationMs);
        this.bannedPeers.set(peerId, {
          peerId,
          reason,
          bannedAt: this.now(),
          bannedUntil
        });
        this.emit("peerbanned", {
          peerId,
          reason,
          bannedUntil
        });
      }
      unbanPeer(peerId) {
        this.bannedPeers.delete(peerId);
        this.emit("peerunbanned", { peerId });
      }
      getBanInfo(peerId) {
        const info = this.bannedPeers.get(peerId);
        if (!info) {
          return null;
        }
        if (info.bannedUntil <= this.now()) {
          this.bannedPeers.delete(peerId);
          return null;
        }
        return { ...info };
      }
      isPeerBanned(peerId) {
        return this.getBanInfo(peerId) !== null;
      }
      emitConflict(details) {
        this.emit("conflict", details);
      }
      restoreRecord(collectionName, record, options = {}) {
        if (!record || !record.id) {
          return false;
        }
        if (options.senderId && !this.checkVerificationOnIngest(collectionName, {
          verificationHash: record.verificationHash,
          verificationVersion: record.verificationVersion
        }, options.senderId)) {
          return false;
        }
        const collection = this.getCollection(collectionName);
        const current = collection.get(record.id);
        if (current && current.version >= record.version) {
          return false;
        }
        const restoredData = { ...record.data || {} };
        const computedHash = computeContentHash(restoredData);
        const rejectOnHashMismatch = options.rejectOnHashMismatch === true;
        const rejectOnOwnershipMismatch = options.rejectOnOwnershipMismatch === true;
        if (rejectOnOwnershipMismatch && current && record.ownerId && current.ownerId !== record.ownerId) {
          this.emit("warning", {
            type: "ownership-mismatch",
            collection: collectionName,
            id: record.id,
            currentOwnerId: current.ownerId,
            advertisedOwnerId: record.ownerId,
            via: options.via || null
          });
          return false;
        }
        if (!record.hash) {
          const warning = {
            type: "content-hash-missing",
            collection: collectionName,
            id: record.id,
            via: options.via || null
          };
          this.emit("warning", warning);
          if (rejectOnHashMismatch) {
            return false;
          }
        } else if (record.hash !== computedHash) {
          this.emit("warning", {
            type: "content-hash-mismatch",
            collection: collectionName,
            id: record.id,
            advertisedHash: record.hash,
            computedHash,
            via: options.via || null
          });
          if (rejectOnHashMismatch) {
            return false;
          }
        }
        collection.set(record.id, {
          id: record.id,
          ownerId: record.ownerId,
          collaboratorIds: this.normalizeCollaboratorIds(record.collaboratorIds),
          data: restoredData,
          hash: computedHash,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt || null,
          version: record.version
        });
        return true;
      }
      async pushRecordSnapshot(collectionName, id, options = {}) {
        const collection = this.getCollection(collectionName);
        const raw = collection.get(id);
        if (!raw || raw.deletedAt) {
          throw new Error(`Object ${id} does not exist in ${collectionName}`);
        }
        const record = {
          id: raw.id,
          ownerId: raw.ownerId,
          collaboratorIds: Array.isArray(raw.collaboratorIds) ? [...raw.collaboratorIds] : [],
          data: { ...raw.data || {} },
          hash: raw.hash || computeContentHash(raw.data || {}),
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
          deletedAt: raw.deletedAt || null,
          version: raw.version
        };
        const verificationEntry = this.resolveVerificationEntry(collectionName, this.nodeId);
        if (verificationEntry) {
          record.verificationHash = verificationEntry.hash;
          if (verificationEntry.version) {
            record.verificationVersion = verificationEntry.version;
          }
        }
        await this.broadcastMessage("record:snapshot", { collectionName, record }, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "record:snapshot",
            collectionName,
            id
          }),
          connectToPeers: this.resolveReplicationPeers(collectionName, id, options, { fromRecord: raw })
        });
        return record;
      }
      pruneAppliedOperations() {
        while (this.appliedOperations.size > this.maxAppliedOperations) {
          const oldestOpId = this.appliedOperations.keys().next().value;
          if (!oldestOpId) {
            break;
          }
          this.appliedOperations.delete(oldestOpId);
        }
      }
      applyOperation(operation, options = {}) {
        if (!operation || !operation.opId || this.appliedOperations.has(operation.opId)) {
          return false;
        }
        if (options.senderId && !this.checkVerificationOnIngest(operation.collectionName, {
          verificationHash: operation.verificationHash,
          verificationVersion: operation.verificationVersion
        }, options.senderId)) {
          return false;
        }
        const collection = this.getCollection(operation.collectionName);
        const current = collection.get(operation.id);
        if (operation.kind === "create") {
          if (current && !current.deletedAt) {
            return false;
          }
          collection.set(operation.id, {
            id: operation.id,
            ownerId: operation.ownerId,
            collaboratorIds: this.normalizeCollaboratorIds(operation.collaboratorIds),
            data: { ...operation.payload || {} },
            hash: computeContentHash(operation.payload || {}),
            createdAt: operation.timestamp,
            updatedAt: operation.timestamp,
            deletedAt: null,
            version: 1
          });
          this.appliedOperations.set(operation.opId, this.now());
          this.pruneAppliedOperations();
          this.emit("change", { kind: "create", collection: operation.collectionName, id: operation.id });
          return true;
        }
        if (!current || current.deletedAt) {
          if (operation.kind !== "create") {
            this.emit("warning", {
              type: "orphan-operation",
              kind: operation.kind,
              collection: operation.collectionName,
              id: operation.id,
              actorId: operation.actorId,
              hint: "Peer is missing the record; pushRecordSnapshot from the owner to catch up."
            });
          }
          return false;
        }
        if (operation.kind === "transfer-ownership") {
          if (operation.actorId !== current.ownerId) {
            return false;
          }
          if (typeof operation.baseVersion === "number" && operation.baseVersion !== current.version) {
            this.emitConflict({
              kind: operation.kind,
              collection: operation.collectionName,
              id: operation.id,
              expectedVersion: operation.baseVersion,
              currentVersion: current.version,
              phase: "remote",
              operation
            });
            return false;
          }
          const previousOwnerId = current.ownerId;
          current.ownerId = operation.newOwnerId;
          if (operation.keepPreviousOwnerAsCollaborator !== false) {
            const collaborators = this.normalizeCollaboratorIds(current.collaboratorIds);
            if (!collaborators.includes(previousOwnerId)) {
              collaborators.push(previousOwnerId);
            }
            current.collaboratorIds = collaborators.filter((peerId) => peerId !== operation.newOwnerId);
          }
          current.updatedAt = operation.timestamp;
          current.version += 1;
          this.appliedOperations.set(operation.opId, this.now());
          this.pruneAppliedOperations();
          this.emit("change", {
            kind: "transfer-ownership",
            collection: operation.collectionName,
            id: operation.id,
            previousOwnerId,
            newOwnerId: operation.newOwnerId
          });
          return true;
        }
        if (operation.kind === "delete") {
          if (operation.actorId !== current.ownerId) {
            return false;
          }
          if (typeof operation.baseVersion === "number" && operation.baseVersion !== current.version) {
            this.emitConflict({
              kind: operation.kind,
              collection: operation.collectionName,
              id: operation.id,
              expectedVersion: operation.baseVersion,
              currentVersion: current.version,
              phase: "remote",
              operation
            });
            return false;
          }
          current.deletedAt = operation.timestamp;
          current.updatedAt = operation.timestamp;
          current.version += 1;
          this.appliedOperations.set(operation.opId, this.now());
          this.pruneAppliedOperations();
          this.emit("change", { kind: "delete", collection: operation.collectionName, id: operation.id });
          return true;
        }
        if (!this.canUpdateRecord(current, operation.actorId)) {
          return false;
        }
        if (typeof operation.baseVersion === "number" && operation.baseVersion !== current.version) {
          this.emitConflict({
            kind: operation.kind,
            collection: operation.collectionName,
            id: operation.id,
            expectedVersion: operation.baseVersion,
            currentVersion: current.version,
            phase: "remote",
            operation
          });
          return false;
        }
        if (operation.kind === "update") {
          current.data = {
            ...current.data,
            ...operation.payload
          };
          current.hash = computeContentHash(current.data);
          if (Array.isArray(operation.collaboratorIds) && operation.actorId === current.ownerId) {
            current.collaboratorIds = this.normalizeCollaboratorIds(operation.collaboratorIds);
          }
          current.updatedAt = operation.timestamp;
          current.version += 1;
          this.appliedOperations.set(operation.opId, this.now());
          this.pruneAppliedOperations();
          this.emit("change", { kind: "update", collection: operation.collectionName, id: operation.id });
          return true;
        }
        return false;
      }
    };
    module.exports = DignityP2P;
  }
});

// src/signaling/signaling-pool.js
var require_signaling_pool = __commonJS({
  "src/signaling/signaling-pool.js"(exports, module) {
    var SignalingPool = class {
      constructor(providers = []) {
        this.providers = [...providers];
        this.activeProvider = null;
      }
      registerProvider(provider) {
        this.providers.push(provider);
      }
      getProvidersByPriority() {
        return [...this.providers].sort((a, b) => (a.priority || 0) - (b.priority || 0));
      }
      async connect(excludedProviderIds = /* @__PURE__ */ new Set()) {
        const providers = this.getProvidersByPriority().filter(
          (provider) => !excludedProviderIds.has(provider.id)
        );
        let lastError;
        for (const provider of providers) {
          try {
            await provider.connect();
            this.activeProvider = provider;
            return provider;
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError || new Error("No signaling provider could connect");
      }
      async send(message) {
        if (!this.activeProvider) {
          await this.connect();
        }
        try {
          await this.activeProvider.send(message);
        } catch (error) {
          if (this.activeProvider && typeof this.activeProvider.disconnect === "function") {
            await this.activeProvider.disconnect();
          }
          const failedProviderId = this.activeProvider ? this.activeProvider.id : null;
          this.activeProvider = null;
          const excludedProviderIds = failedProviderId ? /* @__PURE__ */ new Set([failedProviderId]) : /* @__PURE__ */ new Set();
          await this.connect(excludedProviderIds);
          await this.activeProvider.send(message);
          return error;
        }
        return null;
      }
      onMessage(handler) {
        for (const provider of this.providers) {
          if (typeof provider.onMessage === "function") {
            provider.onMessage(handler);
          }
        }
      }
      async disconnect() {
        const disconnections = this.providers.filter((provider) => typeof provider.disconnect === "function").map((provider) => provider.disconnect());
        await Promise.all(disconnections);
        this.activeProvider = null;
      }
    };
    module.exports = SignalingPool;
  }
});

// src/signaling/websocket-signaling-provider.js
var require_websocket_signaling_provider = __commonJS({
  "src/signaling/websocket-signaling-provider.js"(exports, module) {
    function randomBase36(length) {
      let value = "";
      while (value.length < length) {
        const chunk = Math.random().toString(36).slice(2);
        value += chunk.length > 0 ? chunk : "0";
      }
      return value.slice(0, length);
    }
    var WebSocketSignalingProvider = class {
      constructor({ id, url, WebSocketImpl, priority = 0 }) {
        if (!url) {
          throw new Error("WebSocket signaling provider requires a url");
        }
        this.id = id || url;
        this.url = url;
        this.priority = priority;
        this.WebSocketImpl = WebSocketImpl || globalThis.WebSocket;
        this.socket = null;
        this.messageHandlers = /* @__PURE__ */ new Set();
      }
      async connect() {
        if (!this.WebSocketImpl) {
          throw new Error("WebSocket implementation is not available");
        }
        await new Promise((resolve, reject) => {
          const socket = new this.WebSocketImpl(this.buildConnectionUrl());
          socket.onopen = () => {
            this.socket = socket;
            resolve();
          };
          socket.onerror = () => {
            reject(new Error(`Unable to connect to signaling url ${this.url}`));
          };
          socket.onmessage = (event) => {
            let payload = event.data;
            try {
              payload = JSON.parse(event.data);
            } catch (error) {
              payload = event.data;
            }
            for (const handler of this.messageHandlers) {
              handler(payload);
            }
          };
        });
      }
      buildConnectionUrl() {
        const peerJsHostPattern = /^wss:\/\/(peerjs\.92k\.de|0\.peerjs\.com)(\/|$)/;
        if (!peerJsHostPattern.test(this.url)) {
          return this.url;
        }
        const connectionId = `dignityjs_${randomBase36(10)}`;
        const token = randomBase36(10);
        const hasQuery = this.url.includes("?");
        const hasId = /[?&]id=/.test(this.url);
        const hasToken = /[?&]token=/.test(this.url);
        let url = this.url;
        if (!hasId) {
          url += `${hasQuery ? "&" : "?"}id=${connectionId}`;
        }
        if (!hasToken) {
          url += `${url.includes("?") ? "&" : "?"}token=${token}`;
        }
        return url;
      }
      onMessage(handler) {
        this.messageHandlers.add(handler);
      }
      async send(message) {
        if (!this.socket || this.socket.readyState !== 1) {
          throw new Error(`Signaling socket is not open for ${this.url}`);
        }
        this.socket.send(JSON.stringify(message));
      }
      async disconnect() {
        if (!this.socket) {
          return;
        }
        this.socket.close();
        this.socket = null;
      }
    };
    module.exports = WebSocketSignalingProvider;
  }
});

// src/signaling/parse-peerjs-url.js
var require_parse_peerjs_url = __commonJS({
  "src/signaling/parse-peerjs-url.js"(exports, module) {
    function parsePeerJsServerUrl(url) {
      const parsed = new URL(url);
      const secure = parsed.protocol === "wss:";
      const host = parsed.hostname;
      const port = parsed.port ? Number(parsed.port) : secure ? 443 : 80;
      const key = parsed.searchParams.get("key") || "peerjs";
      let path = parsed.pathname || "/";
      if (path.endsWith("/peerjs")) {
        path = path.slice(0, -"/peerjs".length) || "/";
      }
      if (path !== "/" && !path.endsWith("/")) {
        path += "/";
      }
      return { secure, host, port, path, key };
    }
    module.exports = parsePeerJsServerUrl;
  }
});

// node_modules/peerjs-js-binarypack/dist/binarypack.cjs
var require_binarypack = __commonJS({
  "node_modules/peerjs-js-binarypack/dist/binarypack.cjs"(exports, module) {
    function $parcel$export(e, n, v, s) {
      Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
    }
    $parcel$export(module.exports, "unpack", () => $305e16fc3067229c$export$417857010dc9287f);
    $parcel$export(module.exports, "pack", () => $305e16fc3067229c$export$2a703dbb0cb35339);
    $parcel$export(module.exports, "Packer", () => $305e16fc3067229c$export$b9ec4b114aa40074);
    var $df5e3223d81bc678$export$93654d4f2d6cd524 = class {
      constructor() {
        this.encoder = new TextEncoder();
        this._pieces = [];
        this._parts = [];
      }
      append_buffer(data) {
        this.flush();
        this._parts.push(data);
      }
      append(data) {
        this._pieces.push(data);
      }
      flush() {
        if (this._pieces.length > 0) {
          const buf = new Uint8Array(this._pieces);
          this._parts.push(buf);
          this._pieces = [];
        }
      }
      toArrayBuffer() {
        const buffer = [];
        for (const part of this._parts) buffer.push(part);
        return $df5e3223d81bc678$var$concatArrayBuffers(buffer).buffer;
      }
    };
    function $df5e3223d81bc678$var$concatArrayBuffers(bufs) {
      let size = 0;
      for (const buf of bufs) size += buf.byteLength;
      const result = new Uint8Array(size);
      let offset = 0;
      for (const buf of bufs) {
        const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        result.set(view, offset);
        offset += buf.byteLength;
      }
      return result;
    }
    function $305e16fc3067229c$export$417857010dc9287f(data) {
      const unpacker = new $305e16fc3067229c$var$Unpacker(data);
      return unpacker.unpack();
    }
    function $305e16fc3067229c$export$2a703dbb0cb35339(data) {
      const packer = new $305e16fc3067229c$export$b9ec4b114aa40074();
      const res = packer.pack(data);
      if (res instanceof Promise) return res.then(() => packer.getBuffer());
      return packer.getBuffer();
    }
    var $305e16fc3067229c$var$Unpacker = class {
      constructor(data) {
        this.index = 0;
        this.dataBuffer = data;
        this.dataView = new Uint8Array(this.dataBuffer);
        this.length = this.dataBuffer.byteLength;
      }
      unpack() {
        const type = this.unpack_uint8();
        if (type < 128) return type;
        else if ((type ^ 224) < 32) return (type ^ 224) - 32;
        let size;
        if ((size = type ^ 160) <= 15) return this.unpack_raw(size);
        else if ((size = type ^ 176) <= 15) return this.unpack_string(size);
        else if ((size = type ^ 144) <= 15) return this.unpack_array(size);
        else if ((size = type ^ 128) <= 15) return this.unpack_map(size);
        switch (type) {
          case 192:
            return null;
          case 193:
            return void 0;
          case 194:
            return false;
          case 195:
            return true;
          case 202:
            return this.unpack_float();
          case 203:
            return this.unpack_double();
          case 204:
            return this.unpack_uint8();
          case 205:
            return this.unpack_uint16();
          case 206:
            return this.unpack_uint32();
          case 207:
            return this.unpack_uint64();
          case 208:
            return this.unpack_int8();
          case 209:
            return this.unpack_int16();
          case 210:
            return this.unpack_int32();
          case 211:
            return this.unpack_int64();
          case 212:
            return void 0;
          case 213:
            return void 0;
          case 214:
            return void 0;
          case 215:
            return void 0;
          case 216:
            size = this.unpack_uint16();
            return this.unpack_string(size);
          case 217:
            size = this.unpack_uint32();
            return this.unpack_string(size);
          case 218:
            size = this.unpack_uint16();
            return this.unpack_raw(size);
          case 219:
            size = this.unpack_uint32();
            return this.unpack_raw(size);
          case 220:
            size = this.unpack_uint16();
            return this.unpack_array(size);
          case 221:
            size = this.unpack_uint32();
            return this.unpack_array(size);
          case 222:
            size = this.unpack_uint16();
            return this.unpack_map(size);
          case 223:
            size = this.unpack_uint32();
            return this.unpack_map(size);
        }
      }
      unpack_uint8() {
        const byte = this.dataView[this.index] & 255;
        this.index++;
        return byte;
      }
      unpack_uint16() {
        const bytes = this.read(2);
        const uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
        this.index += 2;
        return uint16;
      }
      unpack_uint32() {
        const bytes = this.read(4);
        const uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
        this.index += 4;
        return uint32;
      }
      unpack_uint64() {
        const bytes = this.read(8);
        const uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
        this.index += 8;
        return uint64;
      }
      unpack_int8() {
        const uint8 = this.unpack_uint8();
        return uint8 < 128 ? uint8 : uint8 - 256;
      }
      unpack_int16() {
        const uint16 = this.unpack_uint16();
        return uint16 < 32768 ? uint16 : uint16 - 65536;
      }
      unpack_int32() {
        const uint32 = this.unpack_uint32();
        return uint32 < 2 ** 31 ? uint32 : uint32 - 2 ** 32;
      }
      unpack_int64() {
        const uint64 = this.unpack_uint64();
        return uint64 < 2 ** 63 ? uint64 : uint64 - 2 ** 64;
      }
      unpack_raw(size) {
        if (this.length < this.index + size) throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${size} ${this.length}`);
        const buf = this.dataBuffer.slice(this.index, this.index + size);
        this.index += size;
        return buf;
      }
      unpack_string(size) {
        const bytes = this.read(size);
        let i = 0;
        let str = "";
        let c;
        let code;
        while (i < size) {
          c = bytes[i];
          if (c < 160) {
            code = c;
            i++;
          } else if ((c ^ 192) < 32) {
            code = (c & 31) << 6 | bytes[i + 1] & 63;
            i += 2;
          } else if ((c ^ 224) < 16) {
            code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
            i += 3;
          } else {
            code = (c & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
            i += 4;
          }
          str += String.fromCodePoint(code);
        }
        this.index += size;
        return str;
      }
      unpack_array(size) {
        const objects = new Array(size);
        for (let i = 0; i < size; i++) objects[i] = this.unpack();
        return objects;
      }
      unpack_map(size) {
        const map = {};
        for (let i = 0; i < size; i++) {
          const key = this.unpack();
          map[key] = this.unpack();
        }
        return map;
      }
      unpack_float() {
        const uint32 = this.unpack_uint32();
        const sign = uint32 >> 31;
        const exp = (uint32 >> 23 & 255) - 127;
        const fraction = uint32 & 8388607 | 8388608;
        return (sign === 0 ? 1 : -1) * fraction * 2 ** (exp - 23);
      }
      unpack_double() {
        const h32 = this.unpack_uint32();
        const l32 = this.unpack_uint32();
        const sign = h32 >> 31;
        const exp = (h32 >> 20 & 2047) - 1023;
        const hfrac = h32 & 1048575 | 1048576;
        const frac = hfrac * 2 ** (exp - 20) + l32 * 2 ** (exp - 52);
        return (sign === 0 ? 1 : -1) * frac;
      }
      read(length) {
        const j = this.index;
        if (j + length <= this.length) return this.dataView.subarray(j, j + length);
        else throw new Error("BinaryPackFailure: read index out of range");
      }
    };
    var $305e16fc3067229c$export$b9ec4b114aa40074 = class {
      getBuffer() {
        return this._bufferBuilder.toArrayBuffer();
      }
      pack(value) {
        if (typeof value === "string") this.pack_string(value);
        else if (typeof value === "number") {
          if (Math.floor(value) === value) this.pack_integer(value);
          else this.pack_double(value);
        } else if (typeof value === "boolean") {
          if (value === true) this._bufferBuilder.append(195);
          else if (value === false) this._bufferBuilder.append(194);
        } else if (value === void 0) this._bufferBuilder.append(192);
        else if (typeof value === "object") {
          if (value === null) this._bufferBuilder.append(192);
          else {
            const constructor = value.constructor;
            if (value instanceof Array) {
              const res = this.pack_array(value);
              if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
            } else if (value instanceof ArrayBuffer) this.pack_bin(new Uint8Array(value));
            else if ("BYTES_PER_ELEMENT" in value) {
              const v = value;
              this.pack_bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
            } else if (value instanceof Date) this.pack_string(value.toString());
            else if (value instanceof Blob) return value.arrayBuffer().then((buffer) => {
              this.pack_bin(new Uint8Array(buffer));
              this._bufferBuilder.flush();
            });
            else if (constructor == Object || constructor.toString().startsWith("class")) {
              const res = this.pack_object(value);
              if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
            } else throw new Error(`Type "${constructor.toString()}" not yet supported`);
          }
        } else throw new Error(`Type "${typeof value}" not yet supported`);
        this._bufferBuilder.flush();
      }
      pack_bin(blob) {
        const length = blob.length;
        if (length <= 15) this.pack_uint8(160 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(218);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(219);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        this._bufferBuilder.append_buffer(blob);
      }
      pack_string(str) {
        const encoded = this._textEncoder.encode(str);
        const length = encoded.length;
        if (length <= 15) this.pack_uint8(176 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(216);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(217);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        this._bufferBuilder.append_buffer(encoded);
      }
      pack_array(ary) {
        const length = ary.length;
        if (length <= 15) this.pack_uint8(144 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(220);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(221);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        const packNext = (index) => {
          if (index < length) {
            const res = this.pack(ary[index]);
            if (res instanceof Promise) return res.then(() => packNext(index + 1));
            return packNext(index + 1);
          }
        };
        return packNext(0);
      }
      pack_integer(num) {
        if (num >= -32 && num <= 127) this._bufferBuilder.append(num & 255);
        else if (num >= 0 && num <= 255) {
          this._bufferBuilder.append(204);
          this.pack_uint8(num);
        } else if (num >= -128 && num <= 127) {
          this._bufferBuilder.append(208);
          this.pack_int8(num);
        } else if (num >= 0 && num <= 65535) {
          this._bufferBuilder.append(205);
          this.pack_uint16(num);
        } else if (num >= -32768 && num <= 32767) {
          this._bufferBuilder.append(209);
          this.pack_int16(num);
        } else if (num >= 0 && num <= 4294967295) {
          this._bufferBuilder.append(206);
          this.pack_uint32(num);
        } else if (num >= -2147483648 && num <= 2147483647) {
          this._bufferBuilder.append(210);
          this.pack_int32(num);
        } else if (num >= -9223372036854776e3 && num <= 9223372036854776e3) {
          this._bufferBuilder.append(211);
          this.pack_int64(num);
        } else if (num >= 0 && num <= 18446744073709552e3) {
          this._bufferBuilder.append(207);
          this.pack_uint64(num);
        } else throw new Error("Invalid integer");
      }
      pack_double(num) {
        let sign = 0;
        if (num < 0) {
          sign = 1;
          num = -num;
        }
        const exp = Math.floor(Math.log(num) / Math.LN2);
        const frac0 = num / 2 ** exp - 1;
        const frac1 = Math.floor(frac0 * 2 ** 52);
        const b32 = 2 ** 32;
        const h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
        const l32 = frac1 % b32;
        this._bufferBuilder.append(203);
        this.pack_int32(h32);
        this.pack_int32(l32);
      }
      pack_object(obj) {
        const keys = Object.keys(obj);
        const length = keys.length;
        if (length <= 15) this.pack_uint8(128 + length);
        else if (length <= 65535) {
          this._bufferBuilder.append(222);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this._bufferBuilder.append(223);
          this.pack_uint32(length);
        } else throw new Error("Invalid length");
        const packNext = (index) => {
          if (index < keys.length) {
            const prop = keys[index];
            if (obj.hasOwnProperty(prop)) {
              this.pack(prop);
              const res = this.pack(obj[prop]);
              if (res instanceof Promise) return res.then(() => packNext(index + 1));
            }
            return packNext(index + 1);
          }
        };
        return packNext(0);
      }
      pack_uint8(num) {
        this._bufferBuilder.append(num);
      }
      pack_uint16(num) {
        this._bufferBuilder.append(num >> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_uint32(num) {
        const n = num & 4294967295;
        this._bufferBuilder.append((n & 4278190080) >>> 24);
        this._bufferBuilder.append((n & 16711680) >>> 16);
        this._bufferBuilder.append((n & 65280) >>> 8);
        this._bufferBuilder.append(n & 255);
      }
      pack_uint64(num) {
        const high = num / 2 ** 32;
        const low = num % 2 ** 32;
        this._bufferBuilder.append((high & 4278190080) >>> 24);
        this._bufferBuilder.append((high & 16711680) >>> 16);
        this._bufferBuilder.append((high & 65280) >>> 8);
        this._bufferBuilder.append(high & 255);
        this._bufferBuilder.append((low & 4278190080) >>> 24);
        this._bufferBuilder.append((low & 16711680) >>> 16);
        this._bufferBuilder.append((low & 65280) >>> 8);
        this._bufferBuilder.append(low & 255);
      }
      pack_int8(num) {
        this._bufferBuilder.append(num & 255);
      }
      pack_int16(num) {
        this._bufferBuilder.append((num & 65280) >> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_int32(num) {
        this._bufferBuilder.append(num >>> 24 & 255);
        this._bufferBuilder.append((num & 16711680) >>> 16);
        this._bufferBuilder.append((num & 65280) >>> 8);
        this._bufferBuilder.append(num & 255);
      }
      pack_int64(num) {
        const high = Math.floor(num / 2 ** 32);
        const low = num % 2 ** 32;
        this._bufferBuilder.append((high & 4278190080) >>> 24);
        this._bufferBuilder.append((high & 16711680) >>> 16);
        this._bufferBuilder.append((high & 65280) >>> 8);
        this._bufferBuilder.append(high & 255);
        this._bufferBuilder.append((low & 4278190080) >>> 24);
        this._bufferBuilder.append((low & 16711680) >>> 16);
        this._bufferBuilder.append((low & 65280) >>> 8);
        this._bufferBuilder.append(low & 255);
      }
      constructor() {
        this._bufferBuilder = new (0, $df5e3223d81bc678$export$93654d4f2d6cd524)();
        this._textEncoder = new TextEncoder();
      }
    };
  }
});

// node_modules/webrtc-adapter/dist/utils.js
var require_utils = __commonJS({
  "node_modules/webrtc-adapter/dist/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.compactObject = compactObject;
    exports.deprecated = deprecated;
    exports.detectBrowser = detectBrowser;
    exports.disableLog = disableLog;
    exports.disableWarnings = disableWarnings;
    exports.extractVersion = extractVersion;
    exports.filterStats = filterStats;
    exports.log = log;
    exports.walkStats = walkStats;
    exports.wrapPeerConnectionEvent = wrapPeerConnectionEvent;
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == _typeof(i) ? i : i + "";
    }
    function _toPrimitive(t, r) {
      if ("object" != _typeof(t) || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var logDisabled_ = true;
    var deprecationWarnings_ = true;
    function extractVersion(uastring, expr, pos) {
      var match = uastring.match(expr);
      return match && match.length >= pos && parseFloat(match[pos], 10);
    }
    function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
      if (!window2.RTCPeerConnection) {
        return;
      }
      var proto = window2.RTCPeerConnection.prototype;
      var nativeAddEventListener = proto.addEventListener;
      proto.addEventListener = function(nativeEventName, cb) {
        if (nativeEventName !== eventNameToWrap) {
          return nativeAddEventListener.apply(this, arguments);
        }
        var wrappedCallback = function wrappedCallback2(e) {
          var modifiedEvent = wrapper(e);
          if (modifiedEvent) {
            if (cb.handleEvent) {
              cb.handleEvent(modifiedEvent);
            } else {
              cb(modifiedEvent);
            }
          }
        };
        this._eventMap = this._eventMap || {};
        if (!this._eventMap[eventNameToWrap]) {
          this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
        }
        this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
        return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
      };
      var nativeRemoveEventListener = proto.removeEventListener;
      proto.removeEventListener = function(nativeEventName, cb) {
        if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
          return nativeRemoveEventListener.apply(this, arguments);
        }
        if (!this._eventMap[eventNameToWrap].has(cb)) {
          return nativeRemoveEventListener.apply(this, arguments);
        }
        var unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
        this._eventMap[eventNameToWrap]["delete"](cb);
        if (this._eventMap[eventNameToWrap].size === 0) {
          delete this._eventMap[eventNameToWrap];
        }
        if (Object.keys(this._eventMap).length === 0) {
          delete this._eventMap;
        }
        return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
      };
      Object.defineProperty(proto, "on" + eventNameToWrap, {
        get: function get() {
          return this["_on" + eventNameToWrap];
        },
        set: function set(cb) {
          if (this["_on" + eventNameToWrap]) {
            this.removeEventListener(eventNameToWrap, this["_on" + eventNameToWrap]);
            delete this["_on" + eventNameToWrap];
          }
          if (cb) {
            this.addEventListener(eventNameToWrap, this["_on" + eventNameToWrap] = cb);
          }
        },
        enumerable: true,
        configurable: true
      });
    }
    function disableLog(bool) {
      if (typeof bool !== "boolean") {
        return new Error("Argument type: " + _typeof(bool) + ". Please use a boolean.");
      }
      logDisabled_ = bool;
      return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
    }
    function disableWarnings(bool) {
      if (typeof bool !== "boolean") {
        return new Error("Argument type: " + _typeof(bool) + ". Please use a boolean.");
      }
      deprecationWarnings_ = !bool;
      return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
    }
    function log() {
      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") {
        if (logDisabled_) {
          return;
        }
        if (typeof console !== "undefined" && typeof console.log === "function") {
          console.log.apply(console, arguments);
        }
      }
    }
    function deprecated(oldMethod, newMethod) {
      if (!deprecationWarnings_) {
        return;
      }
      console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
    }
    function detectBrowser(window2) {
      var result = {
        browser: null,
        version: null
      };
      if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
        result.browser = "Not a browser.";
        return result;
      }
      var navigator2 = window2.navigator;
      if (navigator2.userAgentData && navigator2.userAgentData.brands) {
        var chromium = navigator2.userAgentData.brands.find(function(brand) {
          return brand.brand === "Chromium";
        });
        if (chromium) {
          return {
            browser: "chrome",
            version: parseInt(chromium.version, 10)
          };
        }
      }
      if (navigator2.mozGetUserMedia) {
        result.browser = "firefox";
        result.version = parseInt(extractVersion(navigator2.userAgent, /Firefox\/(\d+)\./, 1));
      } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
        result.browser = "chrome";
        result.version = parseInt(extractVersion(navigator2.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) || null;
      } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
        result.browser = "safari";
        result.version = parseInt(extractVersion(navigator2.userAgent, /AppleWebKit\/(\d+)\./, 1));
        result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
        result._safariVersion = extractVersion(navigator2.userAgent, /Version\/(\d+(\.?\d+))/, 1);
      } else {
        result.browser = "Not a supported browser.";
        return result;
      }
      return result;
    }
    function isObject(val) {
      return Object.prototype.toString.call(val) === "[object Object]";
    }
    function compactObject(data) {
      if (!isObject(data)) {
        return data;
      }
      return Object.keys(data).reduce(function(accumulator, key) {
        var isObj = isObject(data[key]);
        var value = isObj ? compactObject(data[key]) : data[key];
        var isEmptyObject = isObj && !Object.keys(value).length;
        if (value === void 0 || isEmptyObject) {
          return accumulator;
        }
        return Object.assign(accumulator, _defineProperty({}, key, value));
      }, {});
    }
    function walkStats(stats, base, resultSet) {
      if (!base || resultSet.has(base.id)) {
        return;
      }
      resultSet.set(base.id, base);
      Object.keys(base).forEach(function(name) {
        if (name.endsWith("Id")) {
          walkStats(stats, stats.get(base[name]), resultSet);
        } else if (name.endsWith("Ids")) {
          base[name].forEach(function(id) {
            walkStats(stats, stats.get(id), resultSet);
          });
        }
      });
    }
    function filterStats(result, track, outbound) {
      var streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
      var filteredResult = /* @__PURE__ */ new Map();
      if (track === null) {
        return filteredResult;
      }
      var trackStats = [];
      result.forEach(function(value) {
        if (value.type === "track" && value.trackIdentifier === track.id) {
          trackStats.push(value);
        }
      });
      trackStats.forEach(function(trackStat) {
        result.forEach(function(stats) {
          if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
            walkStats(result, stats, filteredResult);
          }
        });
      });
      return filteredResult;
    }
  }
});

// node_modules/webrtc-adapter/dist/chrome/getusermedia.js
var require_getusermedia = __commonJS({
  "node_modules/webrtc-adapter/dist/chrome/getusermedia.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.shimGetUserMedia = shimGetUserMedia;
    var utils = _interopRequireWildcard(require_utils());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var logging = utils.log;
    function shimGetUserMedia(window2, browserDetails) {
      var navigator2 = window2 && window2.navigator;
      if (!navigator2.mediaDevices) {
        return;
      }
      var constraintsToChrome_ = function constraintsToChrome_2(c) {
        if (_typeof(c) !== "object" || c.mandatory || c.optional) {
          return c;
        }
        var cc = {};
        Object.keys(c).forEach(function(key) {
          if (key === "require" || key === "advanced" || key === "mediaSource") {
            return;
          }
          var r = _typeof(c[key]) === "object" ? c[key] : {
            ideal: c[key]
          };
          if (r.exact !== void 0 && typeof r.exact === "number") {
            r.min = r.max = r.exact;
          }
          var oldname_ = function oldname_2(prefix, name) {
            if (prefix) {
              return prefix + name.charAt(0).toUpperCase() + name.slice(1);
            }
            return name === "deviceId" ? "sourceId" : name;
          };
          if (r.ideal !== void 0) {
            cc.optional = cc.optional || [];
            var oc = {};
            if (typeof r.ideal === "number") {
              oc[oldname_("min", key)] = r.ideal;
              cc.optional.push(oc);
              oc = {};
              oc[oldname_("max", key)] = r.ideal;
              cc.optional.push(oc);
            } else {
              oc[oldname_("", key)] = r.ideal;
              cc.optional.push(oc);
            }
          }
          if (r.exact !== void 0 && typeof r.exact !== "number") {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_("", key)] = r.exact;
          } else {
            ["min", "max"].forEach(function(mix) {
              if (r[mix] !== void 0) {
                cc.mandatory = cc.mandatory || {};
                cc.mandatory[oldname_(mix, key)] = r[mix];
              }
            });
          }
        });
        if (c.advanced) {
          cc.optional = (cc.optional || []).concat(c.advanced);
        }
        return cc;
      };
      var shimConstraints_ = function shimConstraints_2(constraints, func) {
        if (browserDetails.version >= 61) {
          return func(constraints);
        }
        constraints = JSON.parse(JSON.stringify(constraints));
        if (constraints && _typeof(constraints.audio) === "object") {
          var remap = function remap2(obj, a, b) {
            if (a in obj && !(b in obj)) {
              obj[b] = obj[a];
              delete obj[a];
            }
          };
          constraints = JSON.parse(JSON.stringify(constraints));
          remap(constraints.audio, "autoGainControl", "googAutoGainControl");
          remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
          constraints.audio = constraintsToChrome_(constraints.audio);
        }
        if (constraints && _typeof(constraints.video) === "object") {
          var face = constraints.video.facingMode;
          face = face && (_typeof(face) === "object" ? face : {
            ideal: face
          });
          var getSupportedFacingModeLies = browserDetails.version < 66;
          if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
            delete constraints.video.facingMode;
            var matches;
            if (face.exact === "environment" || face.ideal === "environment") {
              matches = ["back", "rear"];
            } else if (face.exact === "user" || face.ideal === "user") {
              matches = ["front"];
            }
            if (matches) {
              return navigator2.mediaDevices.enumerateDevices().then(function(devices) {
                devices = devices.filter(function(d) {
                  return d.kind === "videoinput";
                });
                var dev = devices.find(function(d) {
                  return matches.some(function(match) {
                    return d.label.toLowerCase().includes(match);
                  });
                });
                if (!dev && devices.length && matches.includes("back")) {
                  dev = devices[devices.length - 1];
                }
                if (dev) {
                  constraints.video.deviceId = face.exact ? {
                    exact: dev.deviceId
                  } : {
                    ideal: dev.deviceId
                  };
                }
                constraints.video = constraintsToChrome_(constraints.video);
                logging("chrome: " + JSON.stringify(constraints));
                return func(constraints);
              });
            }
          }
          constraints.video = constraintsToChrome_(constraints.video);
        }
        logging("chrome: " + JSON.stringify(constraints));
        return func(constraints);
      };
      var shimError_ = function shimError_2(e) {
        if (browserDetails.version >= 64) {
          return e;
        }
        return {
          name: {
            PermissionDeniedError: "NotAllowedError",
            PermissionDismissedError: "NotAllowedError",
            InvalidStateError: "NotAllowedError",
            DevicesNotFoundError: "NotFoundError",
            ConstraintNotSatisfiedError: "OverconstrainedError",
            TrackStartError: "NotReadableError",
            MediaDeviceFailedDueToShutdown: "NotAllowedError",
            MediaDeviceKillSwitchOn: "NotAllowedError",
            TabCaptureError: "AbortError",
            ScreenCaptureError: "AbortError",
            DeviceCaptureError: "AbortError"
          }[e.name] || e.name,
          message: e.message,
          constraint: e.constraint || e.constraintName,
          toString: function toString() {
            return this.name + (this.message && ": ") + this.message;
          }
        };
      };
      var getUserMedia_ = function getUserMedia_2(constraints, onSuccess, onError) {
        shimConstraints_(constraints, function(c) {
          navigator2.webkitGetUserMedia(c, onSuccess, function(e) {
            if (onError) {
              onError(shimError_(e));
            }
          });
        });
      };
      navigator2.getUserMedia = getUserMedia_.bind(navigator2);
      if (navigator2.mediaDevices.getUserMedia) {
        var origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
        navigator2.mediaDevices.getUserMedia = function(cs) {
          return shimConstraints_(cs, function(c) {
            return origGetUserMedia(c).then(function(stream) {
              if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                stream.getTracks().forEach(function(track) {
                  track.stop();
                });
                throw new DOMException("", "NotFoundError");
              }
              return stream;
            }, function(e) {
              return Promise.reject(shimError_(e));
            });
          });
        };
      }
    }
  }
});

// node_modules/webrtc-adapter/dist/chrome/chrome_shim.js
var require_chrome_shim = __commonJS({
  "node_modules/webrtc-adapter/dist/chrome/chrome_shim.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.fixNegotiationNeeded = fixNegotiationNeeded;
    exports.shimAddTrackRemoveTrack = shimAddTrackRemoveTrack;
    exports.shimAddTrackRemoveTrackWithNative = shimAddTrackRemoveTrackWithNative;
    exports.shimGetSendersWithDtmf = shimGetSendersWithDtmf;
    Object.defineProperty(exports, "shimGetUserMedia", {
      enumerable: true,
      get: function get() {
        return _getusermedia.shimGetUserMedia;
      }
    });
    exports.shimMediaStream = shimMediaStream;
    exports.shimOnTrack = shimOnTrack;
    exports.shimPeerConnection = shimPeerConnection;
    exports.shimSenderReceiverGetStats = shimSenderReceiverGetStats;
    var utils = _interopRequireWildcard(require_utils());
    var _getusermedia = require_getusermedia();
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == _typeof(i) ? i : i + "";
    }
    function _toPrimitive(t, r) {
      if ("object" != _typeof(t) || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function shimMediaStream(window2) {
      window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
    }
    function shimOnTrack(window2) {
      if (_typeof(window2) === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
        Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
          get: function get() {
            return this._ontrack;
          },
          set: function set(f) {
            if (this._ontrack) {
              this.removeEventListener("track", this._ontrack);
            }
            this.addEventListener("track", this._ontrack = f);
          },
          enumerable: true,
          configurable: true
        });
        var origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
        window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
          var _this = this;
          if (!this._ontrackpoly) {
            this._ontrackpoly = function(e) {
              e.stream.addEventListener("addtrack", function(te) {
                var receiver;
                if (window2.RTCPeerConnection.prototype.getReceivers) {
                  receiver = _this.getReceivers().find(function(r) {
                    return r.track && r.track.id === te.track.id;
                  });
                } else {
                  receiver = {
                    track: te.track
                  };
                }
                var event = new Event("track");
                event.track = te.track;
                event.receiver = receiver;
                event.transceiver = {
                  receiver
                };
                event.streams = [e.stream];
                _this.dispatchEvent(event);
              });
              e.stream.getTracks().forEach(function(track) {
                var receiver;
                if (window2.RTCPeerConnection.prototype.getReceivers) {
                  receiver = _this.getReceivers().find(function(r) {
                    return r.track && r.track.id === track.id;
                  });
                } else {
                  receiver = {
                    track
                  };
                }
                var event = new Event("track");
                event.track = track;
                event.receiver = receiver;
                event.transceiver = {
                  receiver
                };
                event.streams = [e.stream];
                _this.dispatchEvent(event);
              });
            };
            this.addEventListener("addstream", this._ontrackpoly);
          }
          return origSetRemoteDescription.apply(this, arguments);
        };
      } else {
        utils.wrapPeerConnectionEvent(window2, "track", function(e) {
          if (!e.transceiver) {
            Object.defineProperty(e, "transceiver", {
              value: {
                receiver: e.receiver
              }
            });
          }
          return e;
        });
      }
    }
    function shimGetSendersWithDtmf(window2) {
      if (_typeof(window2) === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
        var shimSenderWithDtmf = function shimSenderWithDtmf2(pc, track) {
          return {
            track,
            get dtmf() {
              if (this._dtmf === void 0) {
                if (track.kind === "audio") {
                  this._dtmf = pc.createDTMFSender(track);
                } else {
                  this._dtmf = null;
                }
              }
              return this._dtmf;
            },
            _pc: pc
          };
        };
        if (!window2.RTCPeerConnection.prototype.getSenders) {
          window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
            this._senders = this._senders || [];
            return this._senders.slice();
          };
          var origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
          window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
            var sender = origAddTrack.apply(this, arguments);
            if (!sender) {
              sender = shimSenderWithDtmf(this, track);
              this._senders.push(sender);
            }
            return sender;
          };
          var origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
          window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
            origRemoveTrack.apply(this, arguments);
            var idx = this._senders.indexOf(sender);
            if (idx !== -1) {
              this._senders.splice(idx, 1);
            }
          };
        }
        var origAddStream = window2.RTCPeerConnection.prototype.addStream;
        window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
          var _this2 = this;
          this._senders = this._senders || [];
          origAddStream.apply(this, [stream]);
          stream.getTracks().forEach(function(track) {
            _this2._senders.push(shimSenderWithDtmf(_this2, track));
          });
        };
        var origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
        window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
          var _this3 = this;
          this._senders = this._senders || [];
          origRemoveStream.apply(this, [stream]);
          stream.getTracks().forEach(function(track) {
            var sender = _this3._senders.find(function(s) {
              return s.track === track;
            });
            if (sender) {
              _this3._senders.splice(_this3._senders.indexOf(sender), 1);
            }
          });
        };
      } else if (_typeof(window2) === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
        var origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
        window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
          var _this4 = this;
          var senders = origGetSenders.apply(this, []);
          senders.forEach(function(sender) {
            return sender._pc = _this4;
          });
          return senders;
        };
        Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
          get: function get() {
            if (this._dtmf === void 0) {
              if (this.track.kind === "audio") {
                this._dtmf = this._pc.createDTMFSender(this.track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          }
        });
      }
    }
    function shimSenderReceiverGetStats(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
        return;
      }
      if (!("getStats" in window2.RTCRtpSender.prototype)) {
        var origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
        if (origGetSenders) {
          window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
            var _this5 = this;
            var senders = origGetSenders.apply(this, []);
            senders.forEach(function(sender) {
              return sender._pc = _this5;
            });
            return senders;
          };
        }
        var origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
        if (origAddTrack) {
          window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
            var sender = origAddTrack.apply(this, arguments);
            sender._pc = this;
            return sender;
          };
        }
        window2.RTCRtpSender.prototype.getStats = function getStats() {
          var sender = this;
          return this._pc.getStats().then(function(result) {
            return (
              /* Note: this will include stats of all senders that
               *   send a track with the same id as sender.track as
               *   it is not possible to identify the RTCRtpSender.
               */
              utils.filterStats(result, sender.track, true)
            );
          });
        };
      }
      if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
        var origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
        if (origGetReceivers) {
          window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
            var _this6 = this;
            var receivers = origGetReceivers.apply(this, []);
            receivers.forEach(function(receiver) {
              return receiver._pc = _this6;
            });
            return receivers;
          };
        }
        utils.wrapPeerConnectionEvent(window2, "track", function(e) {
          e.receiver._pc = e.srcElement;
          return e;
        });
        window2.RTCRtpReceiver.prototype.getStats = function getStats() {
          var receiver = this;
          return this._pc.getStats().then(function(result) {
            return utils.filterStats(result, receiver.track, false);
          });
        };
      }
      if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
        return;
      }
      var origGetStats = window2.RTCPeerConnection.prototype.getStats;
      window2.RTCPeerConnection.prototype.getStats = function getStats() {
        if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
          var track = arguments[0];
          var sender;
          var receiver;
          var err;
          this.getSenders().forEach(function(s) {
            if (s.track === track) {
              if (sender) {
                err = true;
              } else {
                sender = s;
              }
            }
          });
          this.getReceivers().forEach(function(r) {
            if (r.track === track) {
              if (receiver) {
                err = true;
              } else {
                receiver = r;
              }
            }
            return r.track === track;
          });
          if (err || sender && receiver) {
            return Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError"));
          } else if (sender) {
            return sender.getStats();
          } else if (receiver) {
            return receiver.getStats();
          }
          return Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
        }
        return origGetStats.apply(this, arguments);
      };
    }
    function shimAddTrackRemoveTrackWithNative(window2) {
      window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
        var _this7 = this;
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
          return _this7._shimmedLocalStreams[streamId][0];
        });
      };
      var origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        if (!stream) {
          return origAddTrack.apply(this, arguments);
        }
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        var sender = origAddTrack.apply(this, arguments);
        if (!this._shimmedLocalStreams[stream.id]) {
          this._shimmedLocalStreams[stream.id] = [stream, sender];
        } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
          this._shimmedLocalStreams[stream.id].push(sender);
        }
        return sender;
      };
      var origAddStream = window2.RTCPeerConnection.prototype.addStream;
      window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        var _this8 = this;
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        stream.getTracks().forEach(function(track) {
          var alreadyExists = _this8.getSenders().find(function(s) {
            return s.track === track;
          });
          if (alreadyExists) {
            throw new DOMException("Track already exists.", "InvalidAccessError");
          }
        });
        var existingSenders = this.getSenders();
        origAddStream.apply(this, arguments);
        var newSenders = this.getSenders().filter(function(newSender) {
          return existingSenders.indexOf(newSender) === -1;
        });
        this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
      };
      var origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
      window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        delete this._shimmedLocalStreams[stream.id];
        return origRemoveStream.apply(this, arguments);
      };
      var origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        var _this9 = this;
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        if (sender) {
          Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
            var idx = _this9._shimmedLocalStreams[streamId].indexOf(sender);
            if (idx !== -1) {
              _this9._shimmedLocalStreams[streamId].splice(idx, 1);
            }
            if (_this9._shimmedLocalStreams[streamId].length === 1) {
              delete _this9._shimmedLocalStreams[streamId];
            }
          });
        }
        return origRemoveTrack.apply(this, arguments);
      };
    }
    function shimAddTrackRemoveTrack(window2, browserDetails) {
      if (!window2.RTCPeerConnection) {
        return;
      }
      if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
        return shimAddTrackRemoveTrackWithNative(window2);
      }
      var origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
      window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
        var _this0 = this;
        var nativeStreams = origGetLocalStreams.apply(this);
        this._reverseStreams = this._reverseStreams || {};
        return nativeStreams.map(function(stream) {
          return _this0._reverseStreams[stream.id];
        });
      };
      var origAddStream = window2.RTCPeerConnection.prototype.addStream;
      window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        var _this1 = this;
        this._streams = this._streams || {};
        this._reverseStreams = this._reverseStreams || {};
        stream.getTracks().forEach(function(track) {
          var alreadyExists = _this1.getSenders().find(function(s) {
            return s.track === track;
          });
          if (alreadyExists) {
            throw new DOMException("Track already exists.", "InvalidAccessError");
          }
        });
        if (!this._reverseStreams[stream.id]) {
          var newStream = new window2.MediaStream(stream.getTracks());
          this._streams[stream.id] = newStream;
          this._reverseStreams[newStream.id] = stream;
          stream = newStream;
        }
        origAddStream.apply(this, [stream]);
      };
      var origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
      window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        this._streams = this._streams || {};
        this._reverseStreams = this._reverseStreams || {};
        origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
        delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
        delete this._streams[stream.id];
      };
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        var _this10 = this;
        if (this.signalingState === "closed") {
          throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
        }
        var streams = [].slice.call(arguments, 1);
        if (streams.length !== 1 || !streams[0].getTracks().find(function(t) {
          return t === track;
        })) {
          throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
        }
        var alreadyExists = this.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException("Track already exists.", "InvalidAccessError");
        }
        this._streams = this._streams || {};
        this._reverseStreams = this._reverseStreams || {};
        var oldStream = this._streams[stream.id];
        if (oldStream) {
          oldStream.addTrack(track);
          Promise.resolve().then(function() {
            _this10.dispatchEvent(new Event("negotiationneeded"));
          });
        } else {
          var newStream = new window2.MediaStream([track]);
          this._streams[stream.id] = newStream;
          this._reverseStreams[newStream.id] = stream;
          this.addStream(newStream);
        }
        return this.getSenders().find(function(s) {
          return s.track === track;
        });
      };
      function replaceInternalStreamId(pc, description) {
        var sdp = description.sdp;
        Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
          var externalStream = pc._reverseStreams[internalId];
          var internalStream = pc._streams[externalStream.id];
          sdp = sdp.replace(new RegExp(internalStream.id, "g"), externalStream.id);
        });
        return new RTCSessionDescription({
          type: description.type,
          sdp
        });
      }
      function replaceExternalStreamId(pc, description) {
        var sdp = description.sdp;
        Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
          var externalStream = pc._reverseStreams[internalId];
          var internalStream = pc._streams[externalStream.id];
          sdp = sdp.replace(new RegExp(externalStream.id, "g"), internalStream.id);
        });
        return new RTCSessionDescription({
          type: description.type,
          sdp
        });
      }
      ["createOffer", "createAnswer"].forEach(function(method) {
        var nativeMethod = window2.RTCPeerConnection.prototype[method];
        var methodObj = _defineProperty({}, method, function() {
          var _this11 = this;
          var args = arguments;
          var isLegacyCall = arguments.length && typeof arguments[0] === "function";
          if (isLegacyCall) {
            return nativeMethod.apply(this, [function(description) {
              var desc = replaceInternalStreamId(_this11, description);
              args[0].apply(null, [desc]);
            }, function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]]);
          }
          return nativeMethod.apply(this, arguments).then(function(description) {
            return replaceInternalStreamId(_this11, description);
          });
        });
        window2.RTCPeerConnection.prototype[method] = methodObj[method];
      });
      var origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
      window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
        if (!arguments.length || !arguments[0].type) {
          return origSetLocalDescription.apply(this, arguments);
        }
        arguments[0] = replaceExternalStreamId(this, arguments[0]);
        return origSetLocalDescription.apply(this, arguments);
      };
      var origLocalDescription = Object.getOwnPropertyDescriptor(window2.RTCPeerConnection.prototype, "localDescription");
      Object.defineProperty(window2.RTCPeerConnection.prototype, "localDescription", {
        get: function get() {
          var description = origLocalDescription.get.apply(this);
          if (description.type === "") {
            return description;
          }
          return replaceInternalStreamId(this, description);
        }
      });
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        var _this12 = this;
        if (this.signalingState === "closed") {
          throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
        }
        if (!sender._pc) {
          throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
        }
        var isLocal = sender._pc === this;
        if (!isLocal) {
          throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
        }
        this._streams = this._streams || {};
        var stream;
        Object.keys(this._streams).forEach(function(streamid) {
          var hasTrack = _this12._streams[streamid].getTracks().find(function(track) {
            return sender.track === track;
          });
          if (hasTrack) {
            stream = _this12._streams[streamid];
          }
        });
        if (stream) {
          if (stream.getTracks().length === 1) {
            this.removeStream(this._reverseStreams[stream.id]);
          } else {
            stream.removeTrack(sender.track);
          }
          this.dispatchEvent(new Event("negotiationneeded"));
        }
      };
    }
    function shimPeerConnection(window2, browserDetails) {
      if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
        window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
      }
      if (!window2.RTCPeerConnection) {
        return;
      }
      if (browserDetails.version < 53) {
        ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
          var nativeMethod = window2.RTCPeerConnection.prototype[method];
          var methodObj = _defineProperty({}, method, function() {
            arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          });
          window2.RTCPeerConnection.prototype[method] = methodObj[method];
        });
      }
    }
    function fixNegotiationNeeded(window2, browserDetails) {
      utils.wrapPeerConnectionEvent(window2, "negotiationneeded", function(e) {
        var pc = e.target;
        if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
          if (pc.signalingState !== "stable") {
            return;
          }
        }
        return e;
      });
    }
  }
});

// node_modules/webrtc-adapter/dist/firefox/getusermedia.js
var require_getusermedia2 = __commonJS({
  "node_modules/webrtc-adapter/dist/firefox/getusermedia.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.shimGetUserMedia = shimGetUserMedia;
    var utils = _interopRequireWildcard(require_utils());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function shimGetUserMedia(window2, browserDetails) {
      var navigator2 = window2 && window2.navigator;
      var MediaStreamTrack = window2 && window2.MediaStreamTrack;
      navigator2.getUserMedia = function(constraints, onSuccess, onError) {
        utils.deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia");
        navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
      };
      if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
        var remap = function remap2(obj, a, b) {
          if (a in obj && !(b in obj)) {
            obj[b] = obj[a];
            delete obj[a];
          }
        };
        var nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
        navigator2.mediaDevices.getUserMedia = function(c) {
          if (_typeof(c) === "object" && _typeof(c.audio) === "object") {
            c = JSON.parse(JSON.stringify(c));
            remap(c.audio, "autoGainControl", "mozAutoGainControl");
            remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
          }
          return nativeGetUserMedia(c);
        };
        if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
          var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
          MediaStreamTrack.prototype.getSettings = function() {
            var obj = nativeGetSettings.apply(this, arguments);
            remap(obj, "mozAutoGainControl", "autoGainControl");
            remap(obj, "mozNoiseSuppression", "noiseSuppression");
            return obj;
          };
        }
        if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
          var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
          MediaStreamTrack.prototype.applyConstraints = function(c) {
            if (this.kind === "audio" && _typeof(c) === "object") {
              c = JSON.parse(JSON.stringify(c));
              remap(c, "autoGainControl", "mozAutoGainControl");
              remap(c, "noiseSuppression", "mozNoiseSuppression");
            }
            return nativeApplyConstraints.apply(this, [c]);
          };
        }
      }
    }
  }
});

// node_modules/webrtc-adapter/dist/firefox/getdisplaymedia.js
var require_getdisplaymedia = __commonJS({
  "node_modules/webrtc-adapter/dist/firefox/getdisplaymedia.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.shimGetDisplayMedia = shimGetDisplayMedia;
    function shimGetDisplayMedia(window2, preferredMediaSource) {
      if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
        return;
      }
      if (!window2.navigator.mediaDevices) {
        return;
      }
      window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
        if (!(constraints && constraints.video)) {
          var err = new DOMException("getDisplayMedia without video constraints is undefined");
          err.name = "NotFoundError";
          err.code = 8;
          return Promise.reject(err);
        }
        if (constraints.video === true) {
          constraints.video = {
            mediaSource: preferredMediaSource
          };
        } else {
          constraints.video.mediaSource = preferredMediaSource;
        }
        return window2.navigator.mediaDevices.getUserMedia(constraints);
      };
    }
  }
});

// node_modules/webrtc-adapter/dist/firefox/firefox_shim.js
var require_firefox_shim = __commonJS({
  "node_modules/webrtc-adapter/dist/firefox/firefox_shim.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.shimAddTransceiver = shimAddTransceiver;
    exports.shimCreateAnswer = shimCreateAnswer;
    exports.shimCreateOffer = shimCreateOffer;
    Object.defineProperty(exports, "shimGetDisplayMedia", {
      enumerable: true,
      get: function get() {
        return _getdisplaymedia.shimGetDisplayMedia;
      }
    });
    exports.shimGetParameters = shimGetParameters;
    Object.defineProperty(exports, "shimGetUserMedia", {
      enumerable: true,
      get: function get() {
        return _getusermedia.shimGetUserMedia;
      }
    });
    exports.shimOnTrack = shimOnTrack;
    exports.shimPeerConnection = shimPeerConnection;
    exports.shimRTCDataChannel = shimRTCDataChannel;
    exports.shimReceiverGetStats = shimReceiverGetStats;
    exports.shimRemoveStream = shimRemoveStream;
    exports.shimSenderGetStats = shimSenderGetStats;
    var utils = _interopRequireWildcard(require_utils());
    var _getusermedia = require_getusermedia2();
    var _getdisplaymedia = require_getdisplaymedia();
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _toConsumableArray(r) {
      return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _iterableToArray(r) {
      if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
    }
    function _arrayWithoutHoles(r) {
      if (Array.isArray(r)) return _arrayLikeToArray(r);
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == _typeof(i) ? i : i + "";
    }
    function _toPrimitive(t, r) {
      if ("object" != _typeof(t) || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function shimOnTrack(window2) {
      if (_typeof(window2) === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
        Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
          get: function get() {
            return {
              receiver: this.receiver
            };
          }
        });
      }
    }
    function shimPeerConnection(window2, browserDetails) {
      if (_typeof(window2) !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
        return;
      }
      if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
        window2.RTCPeerConnection = window2.mozRTCPeerConnection;
      }
      if (browserDetails.version < 53) {
        ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
          var nativeMethod = window2.RTCPeerConnection.prototype[method];
          var methodObj = _defineProperty({}, method, function() {
            arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          });
          window2.RTCPeerConnection.prototype[method] = methodObj[method];
        });
      }
      var modernStatsTypes = {
        inboundrtp: "inbound-rtp",
        outboundrtp: "outbound-rtp",
        candidatepair: "candidate-pair",
        localcandidate: "local-candidate",
        remotecandidate: "remote-candidate"
      };
      var nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
      window2.RTCPeerConnection.prototype.getStats = function getStats() {
        var _arguments = Array.prototype.slice.call(arguments), selector = _arguments[0], onSucc = _arguments[1], onErr = _arguments[2];
        return nativeGetStats.apply(this, [selector || null]).then(function(stats) {
          if (browserDetails.version < 53 && !onSucc) {
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== "TypeError") {
                throw e;
              }
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        }).then(onSucc, onErr);
      };
    }
    function shimSenderGetStats(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
        return;
      }
      if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
        return;
      }
      var origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
          var _this = this;
          var senders = origGetSenders.apply(this, []);
          senders.forEach(function(sender) {
            return sender._pc = _this;
          });
          return senders;
        };
      }
      var origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
          var sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window2.RTCRtpSender.prototype.getStats = function getStats() {
        return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
      };
    }
    function shimReceiverGetStats(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
        return;
      }
      if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
        return;
      }
      var origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
          var _this2 = this;
          var receivers = origGetReceivers.apply(this, []);
          receivers.forEach(function(receiver) {
            return receiver._pc = _this2;
          });
          return receivers;
        };
      }
      utils.wrapPeerConnectionEvent(window2, "track", function(e) {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window2.RTCRtpReceiver.prototype.getStats = function getStats() {
        return this._pc.getStats(this.track);
      };
    }
    function shimRemoveStream(window2) {
      if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
        return;
      }
      window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        var _this3 = this;
        utils.deprecated("removeStream", "removeTrack");
        this.getSenders().forEach(function(sender) {
          if (sender.track && stream.getTracks().includes(sender.track)) {
            _this3.removeTrack(sender);
          }
        });
      };
    }
    function shimRTCDataChannel(window2) {
      if (window2.DataChannel && !window2.RTCDataChannel) {
        window2.RTCDataChannel = window2.DataChannel;
      }
    }
    function shimAddTransceiver(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection)) {
        return;
      }
      var origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
      if (origAddTransceiver) {
        window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
          this.setParametersPromises = [];
          var sendEncodings = arguments[1] && arguments[1].sendEncodings;
          if (sendEncodings === void 0) {
            sendEncodings = [];
          }
          sendEncodings = _toConsumableArray(sendEncodings);
          var shouldPerformCheck = sendEncodings.length > 0;
          if (shouldPerformCheck) {
            sendEncodings.forEach(function(encodingParam) {
              if ("rid" in encodingParam) {
                var ridRegex = /^[a-z0-9]{0,16}$/i;
                if (!ridRegex.test(encodingParam.rid)) {
                  throw new TypeError("Invalid RID value provided.");
                }
              }
              if ("scaleResolutionDownBy" in encodingParam) {
                if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
                  throw new RangeError("scale_resolution_down_by must be >= 1.0");
                }
              }
              if ("maxFramerate" in encodingParam) {
                if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                  throw new RangeError("max_framerate must be >= 0.0");
                }
              }
            });
          }
          var transceiver = origAddTransceiver.apply(this, arguments);
          if (shouldPerformCheck) {
            var sender = transceiver.sender;
            var params = sender.getParameters();
            if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
            params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
              params.encodings = sendEncodings;
              sender.sendEncodings = sendEncodings;
              this.setParametersPromises.push(sender.setParameters(params).then(function() {
                delete sender.sendEncodings;
              })["catch"](function() {
                delete sender.sendEncodings;
              }));
            }
          }
          return transceiver;
        };
      }
    }
    function shimGetParameters(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCRtpSender)) {
        return;
      }
      var origGetParameters = window2.RTCRtpSender.prototype.getParameters;
      if (origGetParameters) {
        window2.RTCRtpSender.prototype.getParameters = function getParameters() {
          var params = origGetParameters.apply(this, arguments);
          if (!("encodings" in params)) {
            params.encodings = [].concat(this.sendEncodings || [{}]);
          }
          return params;
        };
      }
    }
    function shimCreateOffer(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection)) {
        return;
      }
      var origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
      window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
        var _arguments2 = arguments, _this4 = this;
        if (this.setParametersPromises && this.setParametersPromises.length) {
          return Promise.all(this.setParametersPromises).then(function() {
            return origCreateOffer.apply(_this4, _arguments2);
          })["finally"](function() {
            _this4.setParametersPromises = [];
          });
        }
        return origCreateOffer.apply(this, arguments);
      };
    }
    function shimCreateAnswer(window2) {
      if (!(_typeof(window2) === "object" && window2.RTCPeerConnection)) {
        return;
      }
      var origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
      window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
        var _arguments3 = arguments, _this5 = this;
        if (this.setParametersPromises && this.setParametersPromises.length) {
          return Promise.all(this.setParametersPromises).then(function() {
            return origCreateAnswer.apply(_this5, _arguments3);
          })["finally"](function() {
            _this5.setParametersPromises = [];
          });
        }
        return origCreateAnswer.apply(this, arguments);
      };
    }
  }
});

// node_modules/webrtc-adapter/dist/safari/safari_shim.js
var require_safari_shim = __commonJS({
  "node_modules/webrtc-adapter/dist/safari/safari_shim.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.shimAudioContext = shimAudioContext;
    exports.shimCallbacksAPI = shimCallbacksAPI;
    exports.shimConstraints = shimConstraints;
    exports.shimCreateOfferLegacy = shimCreateOfferLegacy;
    exports.shimGetUserMedia = shimGetUserMedia;
    exports.shimLocalStreamsAPI = shimLocalStreamsAPI;
    exports.shimRTCIceServerUrls = shimRTCIceServerUrls;
    exports.shimRemoteStreamsAPI = shimRemoteStreamsAPI;
    exports.shimTrackEventTransceiver = shimTrackEventTransceiver;
    var utils = _interopRequireWildcard(require_utils());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function shimLocalStreamsAPI(window2) {
      if (_typeof(window2) !== "object" || !window2.RTCPeerConnection) {
        return;
      }
      if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
        window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
          if (!this._localStreams) {
            this._localStreams = [];
          }
          return this._localStreams;
        };
      }
      if (!("addStream" in window2.RTCPeerConnection.prototype)) {
        var _addTrack = window2.RTCPeerConnection.prototype.addTrack;
        window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
          var _this = this;
          if (!this._localStreams) {
            this._localStreams = [];
          }
          if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
          stream.getAudioTracks().forEach(function(track) {
            return _addTrack.call(_this, track, stream);
          });
          stream.getVideoTracks().forEach(function(track) {
            return _addTrack.call(_this, track, stream);
          });
        };
        window2.RTCPeerConnection.prototype.addTrack = function addTrack(track) {
          var _this2 = this;
          for (var _len = arguments.length, streams = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            streams[_key - 1] = arguments[_key];
          }
          if (streams) {
            streams.forEach(function(stream) {
              if (!_this2._localStreams) {
                _this2._localStreams = [stream];
              } else if (!_this2._localStreams.includes(stream)) {
                _this2._localStreams.push(stream);
              }
            });
          }
          return _addTrack.apply(this, arguments);
        };
      }
      if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
        window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
          var _this3 = this;
          if (!this._localStreams) {
            this._localStreams = [];
          }
          var index = this._localStreams.indexOf(stream);
          if (index === -1) {
            return;
          }
          this._localStreams.splice(index, 1);
          var tracks = stream.getTracks();
          this.getSenders().forEach(function(sender) {
            if (tracks.includes(sender.track)) {
              _this3.removeTrack(sender);
            }
          });
        };
      }
    }
    function shimRemoteStreamsAPI(window2) {
      if (_typeof(window2) !== "object" || !window2.RTCPeerConnection) {
        return;
      }
      if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
        window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
          return this._remoteStreams ? this._remoteStreams : [];
        };
      }
      if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
        Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
          get: function get() {
            return this._onaddstream;
          },
          set: function set(f) {
            var _this4 = this;
            if (this._onaddstream) {
              this.removeEventListener("addstream", this._onaddstream);
              this.removeEventListener("track", this._onaddstreampoly);
            }
            this.addEventListener("addstream", this._onaddstream = f);
            this.addEventListener("track", this._onaddstreampoly = function(e) {
              e.streams.forEach(function(stream) {
                if (!_this4._remoteStreams) {
                  _this4._remoteStreams = [];
                }
                if (_this4._remoteStreams.includes(stream)) {
                  return;
                }
                _this4._remoteStreams.push(stream);
                var event = new Event("addstream");
                event.stream = stream;
                _this4.dispatchEvent(event);
              });
            });
          }
        });
        var origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
        window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
          var pc = this;
          if (!this._onaddstreampoly) {
            this.addEventListener("track", this._onaddstreampoly = function(e) {
              e.streams.forEach(function(stream) {
                if (!pc._remoteStreams) {
                  pc._remoteStreams = [];
                }
                if (pc._remoteStreams.indexOf(stream) >= 0) {
                  return;
                }
                pc._remoteStreams.push(stream);
                var event = new Event("addstream");
                event.stream = stream;
                pc.dispatchEvent(event);
              });
            });
          }
          return origSetRemoteDescription.apply(pc, arguments);
        };
      }
    }
    function shimCallbacksAPI(window2) {
      if (_typeof(window2) !== "object" || !window2.RTCPeerConnection) {
        return;
      }
      var prototype = window2.RTCPeerConnection.prototype;
      var origCreateOffer = prototype.createOffer;
      var origCreateAnswer = prototype.createAnswer;
      var setLocalDescription = prototype.setLocalDescription;
      var setRemoteDescription = prototype.setRemoteDescription;
      var addIceCandidate = prototype.addIceCandidate;
      prototype.createOffer = function createOffer(successCallback, failureCallback) {
        var options = arguments.length >= 2 ? arguments[2] : arguments[0];
        var promise = origCreateOffer.apply(this, [options]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
        var options = arguments.length >= 2 ? arguments[2] : arguments[0];
        var promise = origCreateAnswer.apply(this, [options]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      var withCallback = function withCallback2(description, successCallback, failureCallback) {
        var promise = setLocalDescription.apply(this, [description]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.setLocalDescription = withCallback;
      withCallback = function withCallback2(description, successCallback, failureCallback) {
        var promise = setRemoteDescription.apply(this, [description]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.setRemoteDescription = withCallback;
      withCallback = function withCallback2(candidate, successCallback, failureCallback) {
        var promise = addIceCandidate.apply(this, [candidate]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
      };
      prototype.addIceCandidate = withCallback;
    }
    function shimGetUserMedia(window2) {
      var navigator2 = window2 && window2.navigator;
      if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
        var mediaDevices = navigator2.mediaDevices;
        var _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
        navigator2.mediaDevices.getUserMedia = function(constraints) {
          return _getUserMedia(shimConstraints(constraints));
        };
      }
      if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
        navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
          navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
        }.bind(navigator2);
      }
    }
    function shimConstraints(constraints) {
      if (constraints && constraints.video !== void 0) {
        return Object.assign({}, constraints, {
          video: utils.compactObject(constraints.video)
        });
      }
      return constraints;
    }
    function shimRTCIceServerUrls(window2) {
      if (!window2.RTCPeerConnection) {
        return;
      }
      var OrigPeerConnection = window2.RTCPeerConnection;
      window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (server.urls === void 0 && server.url) {
              utils.deprecated("RTCIceServer.url", "RTCIceServer.urls");
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              delete server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      if ("generateCertificate" in OrigPeerConnection) {
        Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
          get: function get() {
            return OrigPeerConnection.generateCertificate;
          }
        });
      }
    }
    function shimTrackEventTransceiver(window2) {
      if (_typeof(window2) === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
        Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
          get: function get() {
            return {
              receiver: this.receiver
            };
          }
        });
      }
    }
    function shimCreateOfferLegacy(window2) {
      var origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
      window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
        if (offerOptions) {
          if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
            offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
          }
          var audioTransceiver = this.getTransceivers().find(function(transceiver) {
            return transceiver.receiver.track.kind === "audio";
          });
          if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
            if (audioTransceiver.direction === "sendrecv") {
              if (audioTransceiver.setDirection) {
                audioTransceiver.setDirection("sendonly");
              } else {
                audioTransceiver.direction = "sendonly";
              }
            } else if (audioTransceiver.direction === "recvonly") {
              if (audioTransceiver.setDirection) {
                audioTransceiver.setDirection("inactive");
              } else {
                audioTransceiver.direction = "inactive";
              }
            }
          } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
            this.addTransceiver("audio", {
              direction: "recvonly"
            });
          }
          if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
            offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
          }
          var videoTransceiver = this.getTransceivers().find(function(transceiver) {
            return transceiver.receiver.track.kind === "video";
          });
          if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
            if (videoTransceiver.direction === "sendrecv") {
              if (videoTransceiver.setDirection) {
                videoTransceiver.setDirection("sendonly");
              } else {
                videoTransceiver.direction = "sendonly";
              }
            } else if (videoTransceiver.direction === "recvonly") {
              if (videoTransceiver.setDirection) {
                videoTransceiver.setDirection("inactive");
              } else {
                videoTransceiver.direction = "inactive";
              }
            }
          } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
            this.addTransceiver("video", {
              direction: "recvonly"
            });
          }
        }
        return origCreateOffer.apply(this, arguments);
      };
    }
    function shimAudioContext(window2) {
      if (_typeof(window2) !== "object" || window2.AudioContext) {
        return;
      }
      window2.AudioContext = window2.webkitAudioContext;
    }
  }
});

// node_modules/sdp/dist/sdp.js
var require_sdp = __commonJS({
  "node_modules/sdp/dist/sdp.js"(exports, module) {
    "use strict";
    var SDPUtils = {};
    SDPUtils.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils.localCName = SDPUtils.generateIdentifier();
    SDPUtils.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils.getDescription = function(blob) {
      const sections = SDPUtils.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils.getMediaSections = function(blob) {
      const sections = SDPUtils.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils.matchPrefix = function(blob, prefix) {
      return SDPUtils.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case "raddr":
            candidate.relatedAddress = parts[i + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i + 1];
            candidate.usernameFragment = parts[i + 1];
            break;
          default:
            if (candidate[parts[i]] === void 0) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils.writeCandidate = function(candidate) {
      const sdp = [];
      sdp.push(candidate.foundation);
      const component = candidate.component;
      if (component === "rtp") {
        sdp.push(1);
      } else if (component === "rtcp") {
        sdp.push(2);
      } else {
        sdp.push(component);
      }
      sdp.push(candidate.protocol.toUpperCase());
      sdp.push(candidate.priority);
      sdp.push(candidate.address || candidate.ip);
      sdp.push(candidate.port);
      const type = candidate.type;
      sdp.push("typ");
      sdp.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort !== void 0) {
        sdp.push("raddr");
        sdp.push(candidate.relatedAddress);
        sdp.push("rport");
        sdp.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp.push("tcptype");
        sdp.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp.push("ufrag");
        sdp.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp.join(" ");
    };
    SDPUtils.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils.writeFmtp = function(codec) {
      let line = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils.writeRtcpFb = function(codec) {
      let lines = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils.getMid = function(mediaSection) {
      const mid = SDPUtils.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=fingerprint:");
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils.parseFingerprint)
      };
    };
    SDPUtils.writeDtlsParameters = function(params, setupType) {
      let sdp = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp;
    };
    SDPUtils.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=crypto:");
      return lines.map(SDPUtils.parseCryptoLine);
    };
    SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=ice-ufrag:")[0];
      const pwd = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=ice-pwd:")[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils.writeIceParameters = function(params) {
      let sdp = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp += "a=ice-lite\r\n";
      }
      return sdp;
    };
    SDPUtils.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i = 3; i < mline.length; i++) {
        const pt = mline[i];
        const rtpmapline = SDPUtils.matchPrefix(mediaSection, "a=rtpmap:" + pt + " ")[0];
        if (rtpmapline) {
          const codec = SDPUtils.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils.matchPrefix(mediaSection, "a=fmtp:" + pt + " ");
          codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, "a=rtcp-fb:" + pt + " ").map(SDPUtils.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
            default:
              break;
          }
        }
      }
      SDPUtils.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils.writeRtpDescription = function(kind, caps) {
      let sdp = "";
      sdp += "m=" + kind + " ";
      sdp += caps.codecs.length > 0 ? "9" : "0";
      sdp += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp += "c=IN IP4 0.0.0.0\r\n";
      sdp += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp += SDPUtils.writeRtpMap(codec);
        sdp += SDPUtils.writeFmtp(codec);
        sdp += SDPUtils.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp += SDPUtils.writeExtmap(extension);
        });
      }
      return sdp;
    };
    SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = { ssrc: secondarySsrc };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils.writeRtcpParameters = function(rtcpParameters) {
      let sdp = "";
      if (rtcpParameters.reducedSize) {
        sdp += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp;
    };
    SDPUtils.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return { stream: parts[0], track: parts[1] };
      }
      const planB = SDPUtils.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return { stream: parts[0], track: parts[1] };
      }
    };
    SDPUtils.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = ["m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n", "c=IN IP4 0.0.0.0\r\n", "a=sctp-port:" + sctp.port + "\r\n"];
      } else {
        output = ["m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n", "c=IN IP4 0.0.0.0\r\n", "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i].substring(2);
          default:
        }
      }
      if (sessionpart) {
        return SDPUtils.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils.getKind = function(mediaSection) {
      const lines = SDPUtils.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils.parseMLine = function(mediaSection) {
      const lines = SDPUtils.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils.parseOLine = function(mediaSection) {
      const line = SDPUtils.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    if (typeof module === "object") {
      module.exports = SDPUtils;
    }
  }
});

// node_modules/webrtc-adapter/dist/common_shim.js
var require_common_shim = __commonJS({
  "node_modules/webrtc-adapter/dist/common_shim.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.removeExtmapAllowMixed = removeExtmapAllowMixed;
    exports.shimAddIceCandidateNullOrEmpty = shimAddIceCandidateNullOrEmpty;
    exports.shimConnectionState = shimConnectionState;
    exports.shimMaxMessageSize = shimMaxMessageSize;
    exports.shimParameterlessSetLocalDescription = shimParameterlessSetLocalDescription;
    exports.shimRTCIceCandidate = shimRTCIceCandidate;
    exports.shimRTCIceCandidateRelayProtocol = shimRTCIceCandidateRelayProtocol;
    exports.shimSendThrowTypeError = shimSendThrowTypeError;
    var _sdp = _interopRequireDefault(require_sdp());
    var utils = _interopRequireWildcard(require_utils());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { "default": e };
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function shimRTCIceCandidate(window2) {
      if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
        return;
      }
      var NativeRTCIceCandidate = window2.RTCIceCandidate;
      window2.RTCIceCandidate = function RTCIceCandidate(args) {
        if (_typeof(args) === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
          args = JSON.parse(JSON.stringify(args));
          args.candidate = args.candidate.substring(2);
        }
        if (args.candidate && args.candidate.length) {
          var nativeCandidate = new NativeRTCIceCandidate(args);
          var parsedCandidate = _sdp["default"].parseCandidate(args.candidate);
          for (var key in parsedCandidate) {
            if (!(key in nativeCandidate)) {
              Object.defineProperty(nativeCandidate, key, {
                value: parsedCandidate[key]
              });
            }
          }
          nativeCandidate.toJSON = function toJSON() {
            return {
              candidate: nativeCandidate.candidate,
              sdpMid: nativeCandidate.sdpMid,
              sdpMLineIndex: nativeCandidate.sdpMLineIndex,
              usernameFragment: nativeCandidate.usernameFragment
            };
          };
          return nativeCandidate;
        }
        return new NativeRTCIceCandidate(args);
      };
      window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
      utils.wrapPeerConnectionEvent(window2, "icecandidate", function(e) {
        if (e.candidate) {
          Object.defineProperty(e, "candidate", {
            value: new window2.RTCIceCandidate(e.candidate),
            writable: "false"
          });
        }
        return e;
      });
    }
    function shimRTCIceCandidateRelayProtocol(window2) {
      if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
        return;
      }
      utils.wrapPeerConnectionEvent(window2, "icecandidate", function(e) {
        if (e.candidate) {
          var parsedCandidate = _sdp["default"].parseCandidate(e.candidate.candidate);
          if (parsedCandidate.type === "relay") {
            e.candidate.relayProtocol = {
              0: "tls",
              1: "tcp",
              2: "udp"
            }[parsedCandidate.priority >> 24];
          }
        }
        return e;
      });
    }
    function shimMaxMessageSize(window2, browserDetails) {
      if (!window2.RTCPeerConnection) {
        return;
      }
      if (!("sctp" in window2.RTCPeerConnection.prototype)) {
        Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
          get: function get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          }
        });
      }
      var sctpInDescription = function sctpInDescription2(description) {
        if (!description || !description.sdp) {
          return false;
        }
        var sections = _sdp["default"].splitSections(description.sdp);
        sections.shift();
        return sections.some(function(mediaSection) {
          var mLine = _sdp["default"].parseMLine(mediaSection);
          return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
        });
      };
      var getRemoteFirefoxVersion = function getRemoteFirefoxVersion2(description) {
        var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
        if (match === null || match.length < 2) {
          return -1;
        }
        var version = parseInt(match[1], 10);
        return version !== version ? -1 : version;
      };
      var getCanSendMaxMessageSize = function getCanSendMaxMessageSize2(remoteIsFirefox) {
        var canSendMaxMessageSize = 65536;
        if (browserDetails.browser === "firefox") {
          if (browserDetails.version < 57) {
            if (remoteIsFirefox === -1) {
              canSendMaxMessageSize = 16384;
            } else {
              canSendMaxMessageSize = 2147483637;
            }
          } else if (browserDetails.version < 60) {
            canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
          } else {
            canSendMaxMessageSize = 2147483637;
          }
        }
        return canSendMaxMessageSize;
      };
      var getMaxMessageSize = function getMaxMessageSize2(description, remoteIsFirefox) {
        var maxMessageSize = 65536;
        if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
          maxMessageSize = 65535;
        }
        var match = _sdp["default"].matchPrefix(description.sdp, "a=max-message-size:");
        if (match.length > 0) {
          maxMessageSize = parseInt(match[0].substring(19), 10);
        } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
          maxMessageSize = 2147483637;
        }
        return maxMessageSize;
      };
      var origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
      window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        this._sctp = null;
        if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
          var _this$getConfiguratio = this.getConfiguration(), sdpSemantics = _this$getConfiguratio.sdpSemantics;
          if (sdpSemantics === "plan-b") {
            Object.defineProperty(this, "sctp", {
              get: function get() {
                return typeof this._sctp === "undefined" ? null : this._sctp;
              },
              enumerable: true,
              configurable: true
            });
          }
        }
        if (sctpInDescription(arguments[0])) {
          var isFirefox = getRemoteFirefoxVersion(arguments[0]);
          var canSendMMS = getCanSendMaxMessageSize(isFirefox);
          var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
          var maxMessageSize;
          if (canSendMMS === 0 && remoteMMS === 0) {
            maxMessageSize = Number.POSITIVE_INFINITY;
          } else if (canSendMMS === 0 || remoteMMS === 0) {
            maxMessageSize = Math.max(canSendMMS, remoteMMS);
          } else {
            maxMessageSize = Math.min(canSendMMS, remoteMMS);
          }
          var sctp = {};
          Object.defineProperty(sctp, "maxMessageSize", {
            get: function get() {
              return maxMessageSize;
            }
          });
          this._sctp = sctp;
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
    }
    function shimSendThrowTypeError(window2) {
      if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
        return;
      }
      function wrapDcSend(dc, pc) {
        var origDataChannelSend = dc.send;
        dc.send = function send() {
          var data = arguments[0];
          var length = data.length || data.size || data.byteLength;
          if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
            throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
          }
          return origDataChannelSend.apply(dc, arguments);
        };
      }
      var origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
      window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
        var dataChannel = origCreateDataChannel.apply(this, arguments);
        wrapDcSend(dataChannel, this);
        return dataChannel;
      };
      utils.wrapPeerConnectionEvent(window2, "datachannel", function(e) {
        wrapDcSend(e.channel, e.target);
        return e;
      });
    }
    function shimConnectionState(window2) {
      if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
        return;
      }
      var proto = window2.RTCPeerConnection.prototype;
      Object.defineProperty(proto, "connectionState", {
        get: function get() {
          return {
            completed: "connected",
            checking: "connecting"
          }[this.iceConnectionState] || this.iceConnectionState;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(proto, "onconnectionstatechange", {
        get: function get() {
          return this._onconnectionstatechange || null;
        },
        set: function set(cb) {
          if (this._onconnectionstatechange) {
            this.removeEventListener("connectionstatechange", this._onconnectionstatechange);
            delete this._onconnectionstatechange;
          }
          if (cb) {
            this.addEventListener("connectionstatechange", this._onconnectionstatechange = cb);
          }
        },
        enumerable: true,
        configurable: true
      });
      ["setLocalDescription", "setRemoteDescription"].forEach(function(method) {
        var origMethod = proto[method];
        proto[method] = function() {
          if (!this._connectionstatechangepoly) {
            this._connectionstatechangepoly = function(e) {
              var pc = e.target;
              if (pc._lastConnectionState !== pc.connectionState) {
                pc._lastConnectionState = pc.connectionState;
                var newEvent = new Event("connectionstatechange", e);
                pc.dispatchEvent(newEvent);
              }
              return e;
            };
            this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly);
          }
          return origMethod.apply(this, arguments);
        };
      });
    }
    function removeExtmapAllowMixed(window2, browserDetails) {
      if (!window2.RTCPeerConnection) {
        return;
      }
      if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
        return;
      }
      if (browserDetails.browser === "safari" && browserDetails._safariVersion >= 13.1) {
        return;
      }
      var nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
      window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
        if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
          var sdp = desc.sdp.split("\n").filter(function(line) {
            return line.trim() !== "a=extmap-allow-mixed";
          }).join("\n");
          if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
            arguments[0] = new window2.RTCSessionDescription({
              type: desc.type,
              sdp
            });
          } else {
            desc.sdp = sdp;
          }
        }
        return nativeSRD.apply(this, arguments);
      };
    }
    function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
      if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
        return;
      }
      var nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
      if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
        return;
      }
      window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
        if (!arguments[0]) {
          if (arguments[1]) {
            arguments[1].apply(null);
          }
          return Promise.resolve();
        }
        if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
          return Promise.resolve();
        }
        return nativeAddIceCandidate.apply(this, arguments);
      };
    }
    function shimParameterlessSetLocalDescription(window2, browserDetails) {
      if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
        return;
      }
      var nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
      if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
        return;
      }
      window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
        var _this = this;
        var desc = arguments[0] || {};
        if (_typeof(desc) !== "object" || desc.type && desc.sdp) {
          return nativeSetLocalDescription.apply(this, arguments);
        }
        desc = {
          type: desc.type,
          sdp: desc.sdp
        };
        if (!desc.type) {
          switch (this.signalingState) {
            case "stable":
            case "have-local-offer":
            case "have-remote-pranswer":
              desc.type = "offer";
              break;
            default:
              desc.type = "answer";
              break;
          }
        }
        if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
          return nativeSetLocalDescription.apply(this, [desc]);
        }
        var func = desc.type === "offer" ? this.createOffer : this.createAnswer;
        return func.apply(this).then(function(d) {
          return nativeSetLocalDescription.apply(_this, [d]);
        });
      };
    }
  }
});

// node_modules/webrtc-adapter/dist/adapter_factory.js
var require_adapter_factory = __commonJS({
  "node_modules/webrtc-adapter/dist/adapter_factory.js"(exports) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.adapterFactory = adapterFactory;
    var utils = _interopRequireWildcard(require_utils());
    var chromeShim = _interopRequireWildcard(require_chrome_shim());
    var firefoxShim = _interopRequireWildcard(require_firefox_shim());
    var safariShim = _interopRequireWildcard(require_safari_shim());
    var commonShim = _interopRequireWildcard(require_common_shim());
    var sdp = _interopRequireWildcard(require_sdp());
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function adapterFactory() {
      var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, window2 = _ref.window;
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
        shimChrome: true,
        shimFirefox: true,
        shimSafari: true
      };
      var logging = utils.log;
      var browserDetails = utils.detectBrowser(window2);
      var adapter = {
        browserDetails,
        commonShim,
        extractVersion: utils.extractVersion,
        disableLog: utils.disableLog,
        disableWarnings: utils.disableWarnings,
        // Expose sdp as a convenience. For production apps include directly.
        sdp
      };
      switch (browserDetails.browser) {
        case "chrome":
          if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
            logging("Chrome shim is not included in this adapter release.");
            return adapter;
          }
          if (browserDetails.version === null) {
            logging("Chrome shim can not determine version, not shimming.");
            return adapter;
          }
          logging("adapter.js shimming chrome.");
          adapter.browserShim = chromeShim;
          commonShim.shimAddIceCandidateNullOrEmpty(window2, browserDetails);
          commonShim.shimParameterlessSetLocalDescription(window2, browserDetails);
          chromeShim.shimGetUserMedia(window2, browserDetails);
          chromeShim.shimMediaStream(window2, browserDetails);
          chromeShim.shimPeerConnection(window2, browserDetails);
          chromeShim.shimOnTrack(window2, browserDetails);
          chromeShim.shimAddTrackRemoveTrack(window2, browserDetails);
          chromeShim.shimGetSendersWithDtmf(window2, browserDetails);
          chromeShim.shimSenderReceiverGetStats(window2, browserDetails);
          chromeShim.fixNegotiationNeeded(window2, browserDetails);
          commonShim.shimRTCIceCandidate(window2, browserDetails);
          commonShim.shimRTCIceCandidateRelayProtocol(window2, browserDetails);
          commonShim.shimConnectionState(window2, browserDetails);
          commonShim.shimMaxMessageSize(window2, browserDetails);
          commonShim.shimSendThrowTypeError(window2, browserDetails);
          commonShim.removeExtmapAllowMixed(window2, browserDetails);
          break;
        case "firefox":
          if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
            logging("Firefox shim is not included in this adapter release.");
            return adapter;
          }
          logging("adapter.js shimming firefox.");
          adapter.browserShim = firefoxShim;
          commonShim.shimAddIceCandidateNullOrEmpty(window2, browserDetails);
          commonShim.shimParameterlessSetLocalDescription(window2, browserDetails);
          firefoxShim.shimGetUserMedia(window2, browserDetails);
          firefoxShim.shimPeerConnection(window2, browserDetails);
          firefoxShim.shimOnTrack(window2, browserDetails);
          firefoxShim.shimRemoveStream(window2, browserDetails);
          firefoxShim.shimSenderGetStats(window2, browserDetails);
          firefoxShim.shimReceiverGetStats(window2, browserDetails);
          firefoxShim.shimRTCDataChannel(window2, browserDetails);
          firefoxShim.shimAddTransceiver(window2, browserDetails);
          firefoxShim.shimGetParameters(window2, browserDetails);
          firefoxShim.shimCreateOffer(window2, browserDetails);
          firefoxShim.shimCreateAnswer(window2, browserDetails);
          commonShim.shimRTCIceCandidate(window2, browserDetails);
          commonShim.shimConnectionState(window2, browserDetails);
          commonShim.shimMaxMessageSize(window2, browserDetails);
          commonShim.shimSendThrowTypeError(window2, browserDetails);
          break;
        case "safari":
          if (!safariShim || !options.shimSafari) {
            logging("Safari shim is not included in this adapter release.");
            return adapter;
          }
          logging("adapter.js shimming safari.");
          adapter.browserShim = safariShim;
          commonShim.shimAddIceCandidateNullOrEmpty(window2, browserDetails);
          commonShim.shimParameterlessSetLocalDescription(window2, browserDetails);
          safariShim.shimRTCIceServerUrls(window2, browserDetails);
          safariShim.shimCreateOfferLegacy(window2, browserDetails);
          safariShim.shimCallbacksAPI(window2, browserDetails);
          safariShim.shimLocalStreamsAPI(window2, browserDetails);
          safariShim.shimRemoteStreamsAPI(window2, browserDetails);
          safariShim.shimTrackEventTransceiver(window2, browserDetails);
          safariShim.shimGetUserMedia(window2, browserDetails);
          safariShim.shimAudioContext(window2, browserDetails);
          commonShim.shimRTCIceCandidate(window2, browserDetails);
          commonShim.shimRTCIceCandidateRelayProtocol(window2, browserDetails);
          commonShim.shimMaxMessageSize(window2, browserDetails);
          commonShim.shimSendThrowTypeError(window2, browserDetails);
          commonShim.removeExtmapAllowMixed(window2, browserDetails);
          break;
        default:
          logging("Unsupported browser!");
          break;
      }
      return adapter;
    }
  }
});

// node_modules/webrtc-adapter/dist/adapter_core.js
var require_adapter_core = __commonJS({
  "node_modules/webrtc-adapter/dist/adapter_core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _adapter_factory = require_adapter_factory();
    var adapter = (0, _adapter_factory.adapterFactory)({
      window: typeof window === "undefined" ? void 0 : window
    });
    var _default = exports["default"] = adapter;
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports, module) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if ("undefined" !== typeof module) {
      module.exports = EventEmitter;
    }
  }
});

// node_modules/@msgpack/msgpack/dist/utils/int.js
var require_int = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/int.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUint64 = exports.getInt64 = exports.setInt64 = exports.setUint64 = exports.UINT32_MAX = void 0;
    exports.UINT32_MAX = 4294967295;
    function setUint64(view, offset, value) {
      const high = value / 4294967296;
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    exports.setUint64 = setUint64;
    function setInt64(view, offset, value) {
      const high = Math.floor(value / 4294967296);
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    exports.setInt64 = setInt64;
    function getInt64(view, offset) {
      const high = view.getInt32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
    exports.getInt64 = getInt64;
    function getUint64(view, offset) {
      const high = view.getUint32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
    exports.getUint64 = getUint64;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/utf8.js
var require_utf8 = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/utf8.js"(exports) {
    "use strict";
    var _a;
    var _b;
    var _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utf8DecodeTD = exports.TEXT_DECODER_THRESHOLD = exports.utf8DecodeJs = exports.utf8EncodeTE = exports.TEXT_ENCODER_THRESHOLD = exports.utf8EncodeJs = exports.utf8Count = void 0;
    var int_1 = require_int();
    var TEXT_ENCODING_AVAILABLE = (typeof process === "undefined" || ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a["TEXT_ENCODING"]) !== "never") && typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined";
    function utf8Count(str) {
      const strLength = str.length;
      let byteLength = 0;
      let pos = 0;
      while (pos < strLength) {
        let value = str.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          byteLength++;
          continue;
        } else if ((value & 4294965248) === 0) {
          byteLength += 2;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            byteLength += 3;
          } else {
            byteLength += 4;
          }
        }
      }
      return byteLength;
    }
    exports.utf8Count = utf8Count;
    function utf8EncodeJs(str, output, outputOffset) {
      const strLength = str.length;
      let offset = outputOffset;
      let pos = 0;
      while (pos < strLength) {
        let value = str.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          output[offset++] = value;
          continue;
        } else if ((value & 4294965248) === 0) {
          output[offset++] = value >> 6 & 31 | 192;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            output[offset++] = value >> 12 & 15 | 224;
            output[offset++] = value >> 6 & 63 | 128;
          } else {
            output[offset++] = value >> 18 & 7 | 240;
            output[offset++] = value >> 12 & 63 | 128;
            output[offset++] = value >> 6 & 63 | 128;
          }
        }
        output[offset++] = value & 63 | 128;
      }
    }
    exports.utf8EncodeJs = utf8EncodeJs;
    var sharedTextEncoder = TEXT_ENCODING_AVAILABLE ? new TextEncoder() : void 0;
    exports.TEXT_ENCODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE ? int_1.UINT32_MAX : typeof process !== "undefined" && ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b["TEXT_ENCODING"]) !== "force" ? 200 : 0;
    function utf8EncodeTEencode(str, output, outputOffset) {
      output.set(sharedTextEncoder.encode(str), outputOffset);
    }
    function utf8EncodeTEencodeInto(str, output, outputOffset) {
      sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
    }
    exports.utf8EncodeTE = (sharedTextEncoder === null || sharedTextEncoder === void 0 ? void 0 : sharedTextEncoder.encodeInto) ? utf8EncodeTEencodeInto : utf8EncodeTEencode;
    var CHUNK_SIZE = 4096;
    function utf8DecodeJs(bytes, inputOffset, byteLength) {
      let offset = inputOffset;
      const end = offset + byteLength;
      const units = [];
      let result = "";
      while (offset < end) {
        const byte1 = bytes[offset++];
        if ((byte1 & 128) === 0) {
          units.push(byte1);
        } else if ((byte1 & 224) === 192) {
          const byte2 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 6 | byte2);
        } else if ((byte1 & 240) === 224) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
        } else if ((byte1 & 248) === 240) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          const byte4 = bytes[offset++] & 63;
          let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
          if (unit > 65535) {
            unit -= 65536;
            units.push(unit >>> 10 & 1023 | 55296);
            unit = 56320 | unit & 1023;
          }
          units.push(unit);
        } else {
          units.push(byte1);
        }
        if (units.length >= CHUNK_SIZE) {
          result += String.fromCharCode(...units);
          units.length = 0;
        }
      }
      if (units.length > 0) {
        result += String.fromCharCode(...units);
      }
      return result;
    }
    exports.utf8DecodeJs = utf8DecodeJs;
    var sharedTextDecoder = TEXT_ENCODING_AVAILABLE ? new TextDecoder() : null;
    exports.TEXT_DECODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE ? int_1.UINT32_MAX : typeof process !== "undefined" && ((_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c["TEXT_DECODER"]) !== "force" ? 200 : 0;
    function utf8DecodeTD(bytes, inputOffset, byteLength) {
      const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
      return sharedTextDecoder.decode(stringBytes);
    }
    exports.utf8DecodeTD = utf8DecodeTD;
  }
});

// node_modules/@msgpack/msgpack/dist/ExtData.js
var require_ExtData = __commonJS({
  "node_modules/@msgpack/msgpack/dist/ExtData.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtData = void 0;
    var ExtData = class {
      constructor(type, data) {
        this.type = type;
        this.data = data;
      }
    };
    exports.ExtData = ExtData;
  }
});

// node_modules/@msgpack/msgpack/dist/DecodeError.js
var require_DecodeError = __commonJS({
  "node_modules/@msgpack/msgpack/dist/DecodeError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecodeError = void 0;
    var DecodeError = class _DecodeError extends Error {
      constructor(message) {
        super(message);
        const proto = Object.create(_DecodeError.prototype);
        Object.setPrototypeOf(this, proto);
        Object.defineProperty(this, "name", {
          configurable: true,
          enumerable: false,
          value: _DecodeError.name
        });
      }
    };
    exports.DecodeError = DecodeError;
  }
});

// node_modules/@msgpack/msgpack/dist/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/@msgpack/msgpack/dist/timestamp.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.timestampExtension = exports.decodeTimestampExtension = exports.decodeTimestampToTimeSpec = exports.encodeTimestampExtension = exports.encodeDateToTimeSpec = exports.encodeTimeSpecToTimestamp = exports.EXT_TIMESTAMP = void 0;
    var DecodeError_1 = require_DecodeError();
    var int_1 = require_int();
    exports.EXT_TIMESTAMP = -1;
    var TIMESTAMP32_MAX_SEC = 4294967296 - 1;
    var TIMESTAMP64_MAX_SEC = 17179869184 - 1;
    function encodeTimeSpecToTimestamp({ sec, nsec }) {
      if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
        if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
          const rv = new Uint8Array(4);
          const view = new DataView(rv.buffer);
          view.setUint32(0, sec);
          return rv;
        } else {
          const secHigh = sec / 4294967296;
          const secLow = sec & 4294967295;
          const rv = new Uint8Array(8);
          const view = new DataView(rv.buffer);
          view.setUint32(0, nsec << 2 | secHigh & 3);
          view.setUint32(4, secLow);
          return rv;
        }
      } else {
        const rv = new Uint8Array(12);
        const view = new DataView(rv.buffer);
        view.setUint32(0, nsec);
        (0, int_1.setInt64)(view, 4, sec);
        return rv;
      }
    }
    exports.encodeTimeSpecToTimestamp = encodeTimeSpecToTimestamp;
    function encodeDateToTimeSpec(date) {
      const msec = date.getTime();
      const sec = Math.floor(msec / 1e3);
      const nsec = (msec - sec * 1e3) * 1e6;
      const nsecInSec = Math.floor(nsec / 1e9);
      return {
        sec: sec + nsecInSec,
        nsec: nsec - nsecInSec * 1e9
      };
    }
    exports.encodeDateToTimeSpec = encodeDateToTimeSpec;
    function encodeTimestampExtension(object) {
      if (object instanceof Date) {
        const timeSpec = encodeDateToTimeSpec(object);
        return encodeTimeSpecToTimestamp(timeSpec);
      } else {
        return null;
      }
    }
    exports.encodeTimestampExtension = encodeTimestampExtension;
    function decodeTimestampToTimeSpec(data) {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      switch (data.byteLength) {
        case 4: {
          const sec = view.getUint32(0);
          const nsec = 0;
          return { sec, nsec };
        }
        case 8: {
          const nsec30AndSecHigh2 = view.getUint32(0);
          const secLow32 = view.getUint32(4);
          const sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
          const nsec = nsec30AndSecHigh2 >>> 2;
          return { sec, nsec };
        }
        case 12: {
          const sec = (0, int_1.getInt64)(view, 4);
          const nsec = view.getUint32(0);
          return { sec, nsec };
        }
        default:
          throw new DecodeError_1.DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
      }
    }
    exports.decodeTimestampToTimeSpec = decodeTimestampToTimeSpec;
    function decodeTimestampExtension(data) {
      const timeSpec = decodeTimestampToTimeSpec(data);
      return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
    }
    exports.decodeTimestampExtension = decodeTimestampExtension;
    exports.timestampExtension = {
      type: exports.EXT_TIMESTAMP,
      encode: encodeTimestampExtension,
      decode: decodeTimestampExtension
    };
  }
});

// node_modules/@msgpack/msgpack/dist/ExtensionCodec.js
var require_ExtensionCodec = __commonJS({
  "node_modules/@msgpack/msgpack/dist/ExtensionCodec.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionCodec = void 0;
    var ExtData_1 = require_ExtData();
    var timestamp_1 = require_timestamp();
    var ExtensionCodec = class {
      constructor() {
        this.builtInEncoders = [];
        this.builtInDecoders = [];
        this.encoders = [];
        this.decoders = [];
        this.register(timestamp_1.timestampExtension);
      }
      register({ type, encode, decode }) {
        if (type >= 0) {
          this.encoders[type] = encode;
          this.decoders[type] = decode;
        } else {
          const index = 1 + type;
          this.builtInEncoders[index] = encode;
          this.builtInDecoders[index] = decode;
        }
      }
      tryToEncode(object, context) {
        for (let i = 0; i < this.builtInEncoders.length; i++) {
          const encodeExt = this.builtInEncoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = -1 - i;
              return new ExtData_1.ExtData(type, data);
            }
          }
        }
        for (let i = 0; i < this.encoders.length; i++) {
          const encodeExt = this.encoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = i;
              return new ExtData_1.ExtData(type, data);
            }
          }
        }
        if (object instanceof ExtData_1.ExtData) {
          return object;
        }
        return null;
      }
      decode(data, type, context) {
        const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
        if (decodeExt) {
          return decodeExt(data, type, context);
        } else {
          return new ExtData_1.ExtData(type, data);
        }
      }
    };
    exports.ExtensionCodec = ExtensionCodec;
    ExtensionCodec.defaultCodec = new ExtensionCodec();
  }
});

// node_modules/@msgpack/msgpack/dist/utils/typedArrays.js
var require_typedArrays = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/typedArrays.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDataView = exports.ensureUint8Array = void 0;
    function ensureUint8Array(buffer) {
      if (buffer instanceof Uint8Array) {
        return buffer;
      } else if (ArrayBuffer.isView(buffer)) {
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      } else if (buffer instanceof ArrayBuffer) {
        return new Uint8Array(buffer);
      } else {
        return Uint8Array.from(buffer);
      }
    }
    exports.ensureUint8Array = ensureUint8Array;
    function createDataView(buffer) {
      if (buffer instanceof ArrayBuffer) {
        return new DataView(buffer);
      }
      const bufferView = ensureUint8Array(buffer);
      return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
    }
    exports.createDataView = createDataView;
  }
});

// node_modules/@msgpack/msgpack/dist/Encoder.js
var require_Encoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/Encoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Encoder = exports.DEFAULT_INITIAL_BUFFER_SIZE = exports.DEFAULT_MAX_DEPTH = void 0;
    var utf8_1 = require_utf8();
    var ExtensionCodec_1 = require_ExtensionCodec();
    var int_1 = require_int();
    var typedArrays_1 = require_typedArrays();
    exports.DEFAULT_MAX_DEPTH = 100;
    exports.DEFAULT_INITIAL_BUFFER_SIZE = 2048;
    var Encoder = class {
      constructor(extensionCodec = ExtensionCodec_1.ExtensionCodec.defaultCodec, context = void 0, maxDepth = exports.DEFAULT_MAX_DEPTH, initialBufferSize = exports.DEFAULT_INITIAL_BUFFER_SIZE, sortKeys = false, forceFloat32 = false, ignoreUndefined = false, forceIntegerToFloat = false) {
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxDepth = maxDepth;
        this.initialBufferSize = initialBufferSize;
        this.sortKeys = sortKeys;
        this.forceFloat32 = forceFloat32;
        this.ignoreUndefined = ignoreUndefined;
        this.forceIntegerToFloat = forceIntegerToFloat;
        this.pos = 0;
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      reinitializeState() {
        this.pos = 0;
      }
      /**
       * This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
       *
       * @returns Encodes the object and returns a shared reference the encoder's internal buffer.
       */
      encodeSharedRef(object) {
        this.reinitializeState();
        this.doEncode(object, 1);
        return this.bytes.subarray(0, this.pos);
      }
      /**
       * @returns Encodes the object and returns a copy of the encoder's internal buffer.
       */
      encode(object) {
        this.reinitializeState();
        this.doEncode(object, 1);
        return this.bytes.slice(0, this.pos);
      }
      doEncode(object, depth) {
        if (depth > this.maxDepth) {
          throw new Error(`Too deep objects in depth ${depth}`);
        }
        if (object == null) {
          this.encodeNil();
        } else if (typeof object === "boolean") {
          this.encodeBoolean(object);
        } else if (typeof object === "number") {
          this.encodeNumber(object);
        } else if (typeof object === "string") {
          this.encodeString(object);
        } else {
          this.encodeObject(object, depth);
        }
      }
      ensureBufferSizeToWrite(sizeToWrite) {
        const requiredSize = this.pos + sizeToWrite;
        if (this.view.byteLength < requiredSize) {
          this.resizeBuffer(requiredSize * 2);
        }
      }
      resizeBuffer(newSize) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this.bytes);
        this.view = newView;
        this.bytes = newBytes;
      }
      encodeNil() {
        this.writeU8(192);
      }
      encodeBoolean(object) {
        if (object === false) {
          this.writeU8(194);
        } else {
          this.writeU8(195);
        }
      }
      encodeNumber(object) {
        if (Number.isSafeInteger(object) && !this.forceIntegerToFloat) {
          if (object >= 0) {
            if (object < 128) {
              this.writeU8(object);
            } else if (object < 256) {
              this.writeU8(204);
              this.writeU8(object);
            } else if (object < 65536) {
              this.writeU8(205);
              this.writeU16(object);
            } else if (object < 4294967296) {
              this.writeU8(206);
              this.writeU32(object);
            } else {
              this.writeU8(207);
              this.writeU64(object);
            }
          } else {
            if (object >= -32) {
              this.writeU8(224 | object + 32);
            } else if (object >= -128) {
              this.writeU8(208);
              this.writeI8(object);
            } else if (object >= -32768) {
              this.writeU8(209);
              this.writeI16(object);
            } else if (object >= -2147483648) {
              this.writeU8(210);
              this.writeI32(object);
            } else {
              this.writeU8(211);
              this.writeI64(object);
            }
          }
        } else {
          if (this.forceFloat32) {
            this.writeU8(202);
            this.writeF32(object);
          } else {
            this.writeU8(203);
            this.writeF64(object);
          }
        }
      }
      writeStringHeader(byteLength) {
        if (byteLength < 32) {
          this.writeU8(160 + byteLength);
        } else if (byteLength < 256) {
          this.writeU8(217);
          this.writeU8(byteLength);
        } else if (byteLength < 65536) {
          this.writeU8(218);
          this.writeU16(byteLength);
        } else if (byteLength < 4294967296) {
          this.writeU8(219);
          this.writeU32(byteLength);
        } else {
          throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
      }
      encodeString(object) {
        const maxHeaderSize = 1 + 4;
        const strLength = object.length;
        if (strLength > utf8_1.TEXT_ENCODER_THRESHOLD) {
          const byteLength = (0, utf8_1.utf8Count)(object);
          this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
          this.writeStringHeader(byteLength);
          (0, utf8_1.utf8EncodeTE)(object, this.bytes, this.pos);
          this.pos += byteLength;
        } else {
          const byteLength = (0, utf8_1.utf8Count)(object);
          this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
          this.writeStringHeader(byteLength);
          (0, utf8_1.utf8EncodeJs)(object, this.bytes, this.pos);
          this.pos += byteLength;
        }
      }
      encodeObject(object, depth) {
        const ext = this.extensionCodec.tryToEncode(object, this.context);
        if (ext != null) {
          this.encodeExtension(ext);
        } else if (Array.isArray(object)) {
          this.encodeArray(object, depth);
        } else if (ArrayBuffer.isView(object)) {
          this.encodeBinary(object);
        } else if (typeof object === "object") {
          this.encodeMap(object, depth);
        } else {
          throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
      }
      encodeBinary(object) {
        const size = object.byteLength;
        if (size < 256) {
          this.writeU8(196);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(197);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(198);
          this.writeU32(size);
        } else {
          throw new Error(`Too large binary: ${size}`);
        }
        const bytes = (0, typedArrays_1.ensureUint8Array)(object);
        this.writeU8a(bytes);
      }
      encodeArray(object, depth) {
        const size = object.length;
        if (size < 16) {
          this.writeU8(144 + size);
        } else if (size < 65536) {
          this.writeU8(220);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(221);
          this.writeU32(size);
        } else {
          throw new Error(`Too large array: ${size}`);
        }
        for (const item of object) {
          this.doEncode(item, depth + 1);
        }
      }
      countWithoutUndefined(object, keys) {
        let count = 0;
        for (const key of keys) {
          if (object[key] !== void 0) {
            count++;
          }
        }
        return count;
      }
      encodeMap(object, depth) {
        const keys = Object.keys(object);
        if (this.sortKeys) {
          keys.sort();
        }
        const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
        if (size < 16) {
          this.writeU8(128 + size);
        } else if (size < 65536) {
          this.writeU8(222);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(223);
          this.writeU32(size);
        } else {
          throw new Error(`Too large map object: ${size}`);
        }
        for (const key of keys) {
          const value = object[key];
          if (!(this.ignoreUndefined && value === void 0)) {
            this.encodeString(key);
            this.doEncode(value, depth + 1);
          }
        }
      }
      encodeExtension(ext) {
        const size = ext.data.length;
        if (size === 1) {
          this.writeU8(212);
        } else if (size === 2) {
          this.writeU8(213);
        } else if (size === 4) {
          this.writeU8(214);
        } else if (size === 8) {
          this.writeU8(215);
        } else if (size === 16) {
          this.writeU8(216);
        } else if (size < 256) {
          this.writeU8(199);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(200);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(201);
          this.writeU32(size);
        } else {
          throw new Error(`Too large extension object: ${size}`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
      }
      writeU8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.pos, value);
        this.pos++;
      }
      writeU8a(values) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.pos);
        this.pos += size;
      }
      writeI8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setInt8(this.pos, value);
        this.pos++;
      }
      writeU16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.pos, value);
        this.pos += 2;
      }
      writeI16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setInt16(this.pos, value);
        this.pos += 2;
      }
      writeU32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.pos, value);
        this.pos += 4;
      }
      writeI32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setInt32(this.pos, value);
        this.pos += 4;
      }
      writeF32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setFloat32(this.pos, value);
        this.pos += 4;
      }
      writeF64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.pos, value);
        this.pos += 8;
      }
      writeU64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_1.setUint64)(this.view, this.pos, value);
        this.pos += 8;
      }
      writeI64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_1.setInt64)(this.view, this.pos, value);
        this.pos += 8;
      }
    };
    exports.Encoder = Encoder;
  }
});

// node_modules/@msgpack/msgpack/dist/encode.js
var require_encode = __commonJS({
  "node_modules/@msgpack/msgpack/dist/encode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encode = void 0;
    var Encoder_1 = require_Encoder();
    var defaultEncodeOptions = {};
    function encode(value, options = defaultEncodeOptions) {
      const encoder = new Encoder_1.Encoder(options.extensionCodec, options.context, options.maxDepth, options.initialBufferSize, options.sortKeys, options.forceFloat32, options.ignoreUndefined, options.forceIntegerToFloat);
      return encoder.encodeSharedRef(value);
    }
    exports.encode = encode;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/prettyByte.js
var require_prettyByte = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/prettyByte.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prettyByte = void 0;
    function prettyByte(byte) {
      return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
    }
    exports.prettyByte = prettyByte;
  }
});

// node_modules/@msgpack/msgpack/dist/CachedKeyDecoder.js
var require_CachedKeyDecoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/CachedKeyDecoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedKeyDecoder = void 0;
    var utf8_1 = require_utf8();
    var DEFAULT_MAX_KEY_LENGTH = 16;
    var DEFAULT_MAX_LENGTH_PER_KEY = 16;
    var CachedKeyDecoder = class {
      constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
        this.maxKeyLength = maxKeyLength;
        this.maxLengthPerKey = maxLengthPerKey;
        this.hit = 0;
        this.miss = 0;
        this.caches = [];
        for (let i = 0; i < this.maxKeyLength; i++) {
          this.caches.push([]);
        }
      }
      canBeCached(byteLength) {
        return byteLength > 0 && byteLength <= this.maxKeyLength;
      }
      find(bytes, inputOffset, byteLength) {
        const records = this.caches[byteLength - 1];
        FIND_CHUNK: for (const record of records) {
          const recordBytes = record.bytes;
          for (let j = 0; j < byteLength; j++) {
            if (recordBytes[j] !== bytes[inputOffset + j]) {
              continue FIND_CHUNK;
            }
          }
          return record.str;
        }
        return null;
      }
      store(bytes, value) {
        const records = this.caches[bytes.length - 1];
        const record = { bytes, str: value };
        if (records.length >= this.maxLengthPerKey) {
          records[Math.random() * records.length | 0] = record;
        } else {
          records.push(record);
        }
      }
      decode(bytes, inputOffset, byteLength) {
        const cachedValue = this.find(bytes, inputOffset, byteLength);
        if (cachedValue != null) {
          this.hit++;
          return cachedValue;
        }
        this.miss++;
        const str = (0, utf8_1.utf8DecodeJs)(bytes, inputOffset, byteLength);
        const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
        this.store(slicedCopyOfBytes, str);
        return str;
      }
    };
    exports.CachedKeyDecoder = CachedKeyDecoder;
  }
});

// node_modules/@msgpack/msgpack/dist/Decoder.js
var require_Decoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/Decoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Decoder = exports.DataViewIndexOutOfBoundsError = void 0;
    var prettyByte_1 = require_prettyByte();
    var ExtensionCodec_1 = require_ExtensionCodec();
    var int_1 = require_int();
    var utf8_1 = require_utf8();
    var typedArrays_1 = require_typedArrays();
    var CachedKeyDecoder_1 = require_CachedKeyDecoder();
    var DecodeError_1 = require_DecodeError();
    var isValidMapKeyType = (key) => {
      const keyType = typeof key;
      return keyType === "string" || keyType === "number";
    };
    var HEAD_BYTE_REQUIRED = -1;
    var EMPTY_VIEW = new DataView(new ArrayBuffer(0));
    var EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
    exports.DataViewIndexOutOfBoundsError = (() => {
      try {
        EMPTY_VIEW.getInt8(0);
      } catch (e) {
        return e.constructor;
      }
      throw new Error("never reached");
    })();
    var MORE_DATA = new exports.DataViewIndexOutOfBoundsError("Insufficient data");
    var sharedCachedKeyDecoder = new CachedKeyDecoder_1.CachedKeyDecoder();
    var Decoder = class {
      constructor(extensionCodec = ExtensionCodec_1.ExtensionCodec.defaultCodec, context = void 0, maxStrLength = int_1.UINT32_MAX, maxBinLength = int_1.UINT32_MAX, maxArrayLength = int_1.UINT32_MAX, maxMapLength = int_1.UINT32_MAX, maxExtLength = int_1.UINT32_MAX, keyDecoder = sharedCachedKeyDecoder) {
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxStrLength = maxStrLength;
        this.maxBinLength = maxBinLength;
        this.maxArrayLength = maxArrayLength;
        this.maxMapLength = maxMapLength;
        this.maxExtLength = maxExtLength;
        this.keyDecoder = keyDecoder;
        this.totalPos = 0;
        this.pos = 0;
        this.view = EMPTY_VIEW;
        this.bytes = EMPTY_BYTES;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack = [];
      }
      reinitializeState() {
        this.totalPos = 0;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack.length = 0;
      }
      setBuffer(buffer) {
        this.bytes = (0, typedArrays_1.ensureUint8Array)(buffer);
        this.view = (0, typedArrays_1.createDataView)(this.bytes);
        this.pos = 0;
      }
      appendBuffer(buffer) {
        if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
          this.setBuffer(buffer);
        } else {
          const remainingData = this.bytes.subarray(this.pos);
          const newData = (0, typedArrays_1.ensureUint8Array)(buffer);
          const newBuffer = new Uint8Array(remainingData.length + newData.length);
          newBuffer.set(remainingData);
          newBuffer.set(newData, remainingData.length);
          this.setBuffer(newBuffer);
        }
      }
      hasRemaining(size) {
        return this.view.byteLength - this.pos >= size;
      }
      createExtraByteError(posToShow) {
        const { view, pos } = this;
        return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
      }
      /**
       * @throws {@link DecodeError}
       * @throws {@link RangeError}
       */
      decode(buffer) {
        this.reinitializeState();
        this.setBuffer(buffer);
        const object = this.doDecodeSync();
        if (this.hasRemaining(1)) {
          throw this.createExtraByteError(this.pos);
        }
        return object;
      }
      *decodeMulti(buffer) {
        this.reinitializeState();
        this.setBuffer(buffer);
        while (this.hasRemaining(1)) {
          yield this.doDecodeSync();
        }
      }
      async decodeAsync(stream) {
        let decoded = false;
        let object;
        for await (const buffer of stream) {
          if (decoded) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          try {
            object = this.doDecodeSync();
            decoded = true;
          } catch (e) {
            if (!(e instanceof exports.DataViewIndexOutOfBoundsError)) {
              throw e;
            }
          }
          this.totalPos += this.pos;
        }
        if (decoded) {
          if (this.hasRemaining(1)) {
            throw this.createExtraByteError(this.totalPos);
          }
          return object;
        }
        const { headByte, pos, totalPos } = this;
        throw new RangeError(`Insufficient data in parsing ${(0, prettyByte_1.prettyByte)(headByte)} at ${totalPos} (${pos} in the current buffer)`);
      }
      decodeArrayStream(stream) {
        return this.decodeMultiAsync(stream, true);
      }
      decodeStream(stream) {
        return this.decodeMultiAsync(stream, false);
      }
      async *decodeMultiAsync(stream, isArray) {
        let isArrayHeaderRequired = isArray;
        let arrayItemsLeft = -1;
        for await (const buffer of stream) {
          if (isArray && arrayItemsLeft === 0) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          if (isArrayHeaderRequired) {
            arrayItemsLeft = this.readArraySize();
            isArrayHeaderRequired = false;
            this.complete();
          }
          try {
            while (true) {
              yield this.doDecodeSync();
              if (--arrayItemsLeft === 0) {
                break;
              }
            }
          } catch (e) {
            if (!(e instanceof exports.DataViewIndexOutOfBoundsError)) {
              throw e;
            }
          }
          this.totalPos += this.pos;
        }
      }
      doDecodeSync() {
        DECODE: while (true) {
          const headByte = this.readHeadByte();
          let object;
          if (headByte >= 224) {
            object = headByte - 256;
          } else if (headByte < 192) {
            if (headByte < 128) {
              object = headByte;
            } else if (headByte < 144) {
              const size = headByte - 128;
              if (size !== 0) {
                this.pushMapState(size);
                this.complete();
                continue DECODE;
              } else {
                object = {};
              }
            } else if (headByte < 160) {
              const size = headByte - 144;
              if (size !== 0) {
                this.pushArrayState(size);
                this.complete();
                continue DECODE;
              } else {
                object = [];
              }
            } else {
              const byteLength = headByte - 160;
              object = this.decodeUtf8String(byteLength, 0);
            }
          } else if (headByte === 192) {
            object = null;
          } else if (headByte === 194) {
            object = false;
          } else if (headByte === 195) {
            object = true;
          } else if (headByte === 202) {
            object = this.readF32();
          } else if (headByte === 203) {
            object = this.readF64();
          } else if (headByte === 204) {
            object = this.readU8();
          } else if (headByte === 205) {
            object = this.readU16();
          } else if (headByte === 206) {
            object = this.readU32();
          } else if (headByte === 207) {
            object = this.readU64();
          } else if (headByte === 208) {
            object = this.readI8();
          } else if (headByte === 209) {
            object = this.readI16();
          } else if (headByte === 210) {
            object = this.readI32();
          } else if (headByte === 211) {
            object = this.readI64();
          } else if (headByte === 217) {
            const byteLength = this.lookU8();
            object = this.decodeUtf8String(byteLength, 1);
          } else if (headByte === 218) {
            const byteLength = this.lookU16();
            object = this.decodeUtf8String(byteLength, 2);
          } else if (headByte === 219) {
            const byteLength = this.lookU32();
            object = this.decodeUtf8String(byteLength, 4);
          } else if (headByte === 220) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 221) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 222) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 223) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 196) {
            const size = this.lookU8();
            object = this.decodeBinary(size, 1);
          } else if (headByte === 197) {
            const size = this.lookU16();
            object = this.decodeBinary(size, 2);
          } else if (headByte === 198) {
            const size = this.lookU32();
            object = this.decodeBinary(size, 4);
          } else if (headByte === 212) {
            object = this.decodeExtension(1, 0);
          } else if (headByte === 213) {
            object = this.decodeExtension(2, 0);
          } else if (headByte === 214) {
            object = this.decodeExtension(4, 0);
          } else if (headByte === 215) {
            object = this.decodeExtension(8, 0);
          } else if (headByte === 216) {
            object = this.decodeExtension(16, 0);
          } else if (headByte === 199) {
            const size = this.lookU8();
            object = this.decodeExtension(size, 1);
          } else if (headByte === 200) {
            const size = this.lookU16();
            object = this.decodeExtension(size, 2);
          } else if (headByte === 201) {
            const size = this.lookU32();
            object = this.decodeExtension(size, 4);
          } else {
            throw new DecodeError_1.DecodeError(`Unrecognized type byte: ${(0, prettyByte_1.prettyByte)(headByte)}`);
          }
          this.complete();
          const stack = this.stack;
          while (stack.length > 0) {
            const state = stack[stack.length - 1];
            if (state.type === 0) {
              state.array[state.position] = object;
              state.position++;
              if (state.position === state.size) {
                stack.pop();
                object = state.array;
              } else {
                continue DECODE;
              }
            } else if (state.type === 1) {
              if (!isValidMapKeyType(object)) {
                throw new DecodeError_1.DecodeError("The type of key must be string or number but " + typeof object);
              }
              if (object === "__proto__") {
                throw new DecodeError_1.DecodeError("The key __proto__ is not allowed");
              }
              state.key = object;
              state.type = 2;
              continue DECODE;
            } else {
              state.map[state.key] = object;
              state.readCount++;
              if (state.readCount === state.size) {
                stack.pop();
                object = state.map;
              } else {
                state.key = null;
                state.type = 1;
                continue DECODE;
              }
            }
          }
          return object;
        }
      }
      readHeadByte() {
        if (this.headByte === HEAD_BYTE_REQUIRED) {
          this.headByte = this.readU8();
        }
        return this.headByte;
      }
      complete() {
        this.headByte = HEAD_BYTE_REQUIRED;
      }
      readArraySize() {
        const headByte = this.readHeadByte();
        switch (headByte) {
          case 220:
            return this.readU16();
          case 221:
            return this.readU32();
          default: {
            if (headByte < 160) {
              return headByte - 144;
            } else {
              throw new DecodeError_1.DecodeError(`Unrecognized array type byte: ${(0, prettyByte_1.prettyByte)(headByte)}`);
            }
          }
        }
      }
      pushMapState(size) {
        if (size > this.maxMapLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
        }
        this.stack.push({
          type: 1,
          size,
          key: null,
          readCount: 0,
          map: {}
        });
      }
      pushArrayState(size) {
        if (size > this.maxArrayLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
        }
        this.stack.push({
          type: 0,
          size,
          array: new Array(size),
          position: 0
        });
      }
      decodeUtf8String(byteLength, headerOffset) {
        var _a;
        if (byteLength > this.maxStrLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
        }
        if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
          throw MORE_DATA;
        }
        const offset = this.pos + headerOffset;
        let object;
        if (this.stateIsMapKey() && ((_a = this.keyDecoder) === null || _a === void 0 ? void 0 : _a.canBeCached(byteLength))) {
          object = this.keyDecoder.decode(this.bytes, offset, byteLength);
        } else if (byteLength > utf8_1.TEXT_DECODER_THRESHOLD) {
          object = (0, utf8_1.utf8DecodeTD)(this.bytes, offset, byteLength);
        } else {
          object = (0, utf8_1.utf8DecodeJs)(this.bytes, offset, byteLength);
        }
        this.pos += headerOffset + byteLength;
        return object;
      }
      stateIsMapKey() {
        if (this.stack.length > 0) {
          const state = this.stack[this.stack.length - 1];
          return state.type === 1;
        }
        return false;
      }
      decodeBinary(byteLength, headOffset) {
        if (byteLength > this.maxBinLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
        }
        if (!this.hasRemaining(byteLength + headOffset)) {
          throw MORE_DATA;
        }
        const offset = this.pos + headOffset;
        const object = this.bytes.subarray(offset, offset + byteLength);
        this.pos += headOffset + byteLength;
        return object;
      }
      decodeExtension(size, headOffset) {
        if (size > this.maxExtLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
        }
        const extType = this.view.getInt8(this.pos + headOffset);
        const data = this.decodeBinary(
          size,
          headOffset + 1
          /* extType */
        );
        return this.extensionCodec.decode(data, extType, this.context);
      }
      lookU8() {
        return this.view.getUint8(this.pos);
      }
      lookU16() {
        return this.view.getUint16(this.pos);
      }
      lookU32() {
        return this.view.getUint32(this.pos);
      }
      readU8() {
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
      }
      readI8() {
        const value = this.view.getInt8(this.pos);
        this.pos++;
        return value;
      }
      readU16() {
        const value = this.view.getUint16(this.pos);
        this.pos += 2;
        return value;
      }
      readI16() {
        const value = this.view.getInt16(this.pos);
        this.pos += 2;
        return value;
      }
      readU32() {
        const value = this.view.getUint32(this.pos);
        this.pos += 4;
        return value;
      }
      readI32() {
        const value = this.view.getInt32(this.pos);
        this.pos += 4;
        return value;
      }
      readU64() {
        const value = (0, int_1.getUint64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readI64() {
        const value = (0, int_1.getInt64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readF32() {
        const value = this.view.getFloat32(this.pos);
        this.pos += 4;
        return value;
      }
      readF64() {
        const value = this.view.getFloat64(this.pos);
        this.pos += 8;
        return value;
      }
    };
    exports.Decoder = Decoder;
  }
});

// node_modules/@msgpack/msgpack/dist/decode.js
var require_decode = __commonJS({
  "node_modules/@msgpack/msgpack/dist/decode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeMulti = exports.decode = exports.defaultDecodeOptions = void 0;
    var Decoder_1 = require_Decoder();
    exports.defaultDecodeOptions = {};
    function decode(buffer, options = exports.defaultDecodeOptions) {
      const decoder = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder.decode(buffer);
    }
    exports.decode = decode;
    function decodeMulti(buffer, options = exports.defaultDecodeOptions) {
      const decoder = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder.decodeMulti(buffer);
    }
    exports.decodeMulti = decodeMulti;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/stream.js
var require_stream = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/stream.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ensureAsyncIterable = exports.asyncIterableFromStream = exports.isAsyncIterable = void 0;
    function isAsyncIterable(object) {
      return object[Symbol.asyncIterator] != null;
    }
    exports.isAsyncIterable = isAsyncIterable;
    function assertNonNull(value) {
      if (value == null) {
        throw new Error("Assertion Failure: value must not be null nor undefined");
      }
    }
    async function* asyncIterableFromStream(stream) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          assertNonNull(value);
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
    exports.asyncIterableFromStream = asyncIterableFromStream;
    function ensureAsyncIterable(streamLike) {
      if (isAsyncIterable(streamLike)) {
        return streamLike;
      } else {
        return asyncIterableFromStream(streamLike);
      }
    }
    exports.ensureAsyncIterable = ensureAsyncIterable;
  }
});

// node_modules/@msgpack/msgpack/dist/decodeAsync.js
var require_decodeAsync = __commonJS({
  "node_modules/@msgpack/msgpack/dist/decodeAsync.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeStream = exports.decodeMultiStream = exports.decodeArrayStream = exports.decodeAsync = void 0;
    var Decoder_1 = require_Decoder();
    var stream_1 = require_stream();
    var decode_1 = require_decode();
    async function decodeAsync(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder.decodeAsync(stream);
    }
    exports.decodeAsync = decodeAsync;
    function decodeArrayStream(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder.decodeArrayStream(stream);
    }
    exports.decodeArrayStream = decodeArrayStream;
    function decodeMultiStream(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder.decodeStream(stream);
    }
    exports.decodeMultiStream = decodeMultiStream;
    function decodeStream(streamLike, options = decode_1.defaultDecodeOptions) {
      return decodeMultiStream(streamLike, options);
    }
    exports.decodeStream = decodeStream;
  }
});

// node_modules/@msgpack/msgpack/dist/index.js
var require_dist = __commonJS({
  "node_modules/@msgpack/msgpack/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeTimestampExtension = exports.encodeTimestampExtension = exports.decodeTimestampToTimeSpec = exports.encodeTimeSpecToTimestamp = exports.encodeDateToTimeSpec = exports.EXT_TIMESTAMP = exports.ExtData = exports.ExtensionCodec = exports.Encoder = exports.DataViewIndexOutOfBoundsError = exports.DecodeError = exports.Decoder = exports.decodeStream = exports.decodeMultiStream = exports.decodeArrayStream = exports.decodeAsync = exports.decodeMulti = exports.decode = exports.encode = void 0;
    var encode_1 = require_encode();
    Object.defineProperty(exports, "encode", { enumerable: true, get: function() {
      return encode_1.encode;
    } });
    var decode_1 = require_decode();
    Object.defineProperty(exports, "decode", { enumerable: true, get: function() {
      return decode_1.decode;
    } });
    Object.defineProperty(exports, "decodeMulti", { enumerable: true, get: function() {
      return decode_1.decodeMulti;
    } });
    var decodeAsync_1 = require_decodeAsync();
    Object.defineProperty(exports, "decodeAsync", { enumerable: true, get: function() {
      return decodeAsync_1.decodeAsync;
    } });
    Object.defineProperty(exports, "decodeArrayStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeArrayStream;
    } });
    Object.defineProperty(exports, "decodeMultiStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeMultiStream;
    } });
    Object.defineProperty(exports, "decodeStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeStream;
    } });
    var Decoder_1 = require_Decoder();
    Object.defineProperty(exports, "Decoder", { enumerable: true, get: function() {
      return Decoder_1.Decoder;
    } });
    Object.defineProperty(exports, "DataViewIndexOutOfBoundsError", { enumerable: true, get: function() {
      return Decoder_1.DataViewIndexOutOfBoundsError;
    } });
    var DecodeError_1 = require_DecodeError();
    Object.defineProperty(exports, "DecodeError", { enumerable: true, get: function() {
      return DecodeError_1.DecodeError;
    } });
    var Encoder_1 = require_Encoder();
    Object.defineProperty(exports, "Encoder", { enumerable: true, get: function() {
      return Encoder_1.Encoder;
    } });
    var ExtensionCodec_1 = require_ExtensionCodec();
    Object.defineProperty(exports, "ExtensionCodec", { enumerable: true, get: function() {
      return ExtensionCodec_1.ExtensionCodec;
    } });
    var ExtData_1 = require_ExtData();
    Object.defineProperty(exports, "ExtData", { enumerable: true, get: function() {
      return ExtData_1.ExtData;
    } });
    var timestamp_1 = require_timestamp();
    Object.defineProperty(exports, "EXT_TIMESTAMP", { enumerable: true, get: function() {
      return timestamp_1.EXT_TIMESTAMP;
    } });
    Object.defineProperty(exports, "encodeDateToTimeSpec", { enumerable: true, get: function() {
      return timestamp_1.encodeDateToTimeSpec;
    } });
    Object.defineProperty(exports, "encodeTimeSpecToTimestamp", { enumerable: true, get: function() {
      return timestamp_1.encodeTimeSpecToTimestamp;
    } });
    Object.defineProperty(exports, "decodeTimestampToTimeSpec", { enumerable: true, get: function() {
      return timestamp_1.decodeTimestampToTimeSpec;
    } });
    Object.defineProperty(exports, "encodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_1.encodeTimestampExtension;
    } });
    Object.defineProperty(exports, "decodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_1.decodeTimestampExtension;
    } });
  }
});

// node_modules/peerjs/dist/bundler.cjs
var require_bundler = __commonJS({
  "node_modules/peerjs/dist/bundler.cjs"(exports, module) {
    var $2QID2$peerjsjsbinarypack = require_binarypack();
    var $2QID2$webrtcadapter = require_adapter_core();
    var $2QID2$eventemitter3 = require_eventemitter3();
    var $2QID2$msgpackmsgpack = require_dist();
    function $parcel$defineInteropFlag(a) {
      Object.defineProperty(a, "__esModule", { value: true, configurable: true });
    }
    function $parcel$exportWildcard(dest, source) {
      Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(dest, key)) {
          return;
        }
        Object.defineProperty(dest, key, {
          enumerable: true,
          get: function get() {
            return source[key];
          }
        });
      });
      return dest;
    }
    function $parcel$export(e, n, v, s) {
      Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
    }
    function $parcel$interopDefault(a) {
      return a && a.__esModule ? a.default : a;
    }
    $parcel$defineInteropFlag(module.exports);
    $parcel$export(module.exports, "default", () => $8c8bca0fa9aa4b8b$export$2e2bcd8739ae039);
    $parcel$export(module.exports, "util", () => $b83e6a166cc3008f$export$7debb50ef11d5e0b);
    $parcel$export(module.exports, "BufferedConnection", () => $8d5124d0cf36ebe0$export$ff7c9d4c11d94e8b);
    $parcel$export(module.exports, "StreamConnection", () => $544799118fa637e6$export$72aa44612e2200cd);
    $parcel$export(module.exports, "MsgPack", () => $7e477efb76e02214$export$80f5de1a66c4d624);
    $parcel$export(module.exports, "Peer", () => $2ddecb16305b5a82$export$ecd1fc136c422448);
    $parcel$export(module.exports, "MsgPackPeer", () => $8c8805059443e9b3$export$d72c7bf8eef50853);
    $parcel$export(module.exports, "PeerError", () => $cf62563e7a9fbce5$export$98871882f492de82);
    var $7ce5389b504cc06c$export$f1c5f4c9cb95390b = class {
      constructor() {
        this.chunkedMTU = 16300;
        this._dataCount = 1;
        this.chunk = (blob) => {
          const chunks = [];
          const size = blob.byteLength;
          const total = Math.ceil(size / this.chunkedMTU);
          let index = 0;
          let start = 0;
          while (start < size) {
            const end = Math.min(size, start + this.chunkedMTU);
            const b = blob.slice(start, end);
            const chunk = {
              __peerData: this._dataCount,
              n: index,
              data: b,
              total
            };
            chunks.push(chunk);
            start = end;
            index++;
          }
          this._dataCount++;
          return chunks;
        };
      }
    };
    function $7ce5389b504cc06c$export$52c89ebcdc4f53f2(bufs) {
      let size = 0;
      for (const buf of bufs) size += buf.byteLength;
      const result = new Uint8Array(size);
      let offset = 0;
      for (const buf of bufs) {
        result.set(buf, offset);
        offset += buf.byteLength;
      }
      return result;
    }
    var $07e4f6a369d1179a$var$webRTCAdapter = (
      //@ts-ignore
      (0, $parcel$interopDefault($2QID2$webrtcadapter)).default || (0, $parcel$interopDefault($2QID2$webrtcadapter))
    );
    var $07e4f6a369d1179a$export$25be9502477c137d = new class {
      isWebRTCSupported() {
        return typeof RTCPeerConnection !== "undefined";
      }
      isBrowserSupported() {
        const browser = this.getBrowser();
        const version = this.getVersion();
        const validBrowser = this.supportedBrowsers.includes(browser);
        if (!validBrowser) return false;
        if (browser === "chrome") return version >= this.minChromeVersion;
        if (browser === "firefox") return version >= this.minFirefoxVersion;
        if (browser === "safari") return !this.isIOS && version >= this.minSafariVersion;
        return false;
      }
      getBrowser() {
        return $07e4f6a369d1179a$var$webRTCAdapter.browserDetails.browser;
      }
      getVersion() {
        return $07e4f6a369d1179a$var$webRTCAdapter.browserDetails.version || 0;
      }
      isUnifiedPlanSupported() {
        const browser = this.getBrowser();
        const version = $07e4f6a369d1179a$var$webRTCAdapter.browserDetails.version || 0;
        if (browser === "chrome" && version < this.minChromeVersion) return false;
        if (browser === "firefox" && version >= this.minFirefoxVersion) return true;
        if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype)) return false;
        let tempPc;
        let supported = false;
        try {
          tempPc = new RTCPeerConnection();
          tempPc.addTransceiver("audio");
          supported = true;
        } catch (e) {
        } finally {
          if (tempPc) tempPc.close();
        }
        return supported;
      }
      toString() {
        return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
      }
      constructor() {
        this.isIOS = typeof navigator !== "undefined" ? [
          "iPad",
          "iPhone",
          "iPod"
        ].includes(navigator.platform) : false;
        this.supportedBrowsers = [
          "firefox",
          "chrome",
          "safari"
        ];
        this.minFirefoxVersion = 59;
        this.minChromeVersion = 72;
        this.minSafariVersion = 605;
      }
    }();
    var $706cd7d90eca90d6$export$f35f128fd59ea256 = (id) => {
      return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
    };
    var $6a375544f634961e$export$4e61f672936bec77 = () => Math.random().toString(36).slice(2);
    var $b83e6a166cc3008f$var$DEFAULT_CONFIG = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: [
            "turn:eu-0.turn.peerjs.com:3478",
            "turn:us-0.turn.peerjs.com:3478"
          ],
          username: "peerjs",
          credential: "peerjsp"
        }
      ],
      sdpSemantics: "unified-plan"
    };
    var $b83e6a166cc3008f$export$f8f26dd395d7e1bd = class extends (0, $7ce5389b504cc06c$export$f1c5f4c9cb95390b) {
      noop() {
      }
      blobToArrayBuffer(blob, cb) {
        const fr = new FileReader();
        fr.onload = function(evt) {
          if (evt.target) cb(evt.target.result);
        };
        fr.readAsArrayBuffer(blob);
        return fr;
      }
      binaryStringToArrayBuffer(binary) {
        const byteArray = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) byteArray[i] = binary.charCodeAt(i) & 255;
        return byteArray.buffer;
      }
      isSecure() {
        return location.protocol === "https:";
      }
      constructor(...args) {
        super(...args), this.CLOUD_HOST = "0.peerjs.com", this.CLOUD_PORT = 443, // Browsers that need chunking:
        this.chunkedBrowsers = {
          Chrome: 1,
          chrome: 1
        }, // Returns browser-agnostic default config
        this.defaultConfig = $b83e6a166cc3008f$var$DEFAULT_CONFIG, this.browser = (0, $07e4f6a369d1179a$export$25be9502477c137d).getBrowser(), this.browserVersion = (0, $07e4f6a369d1179a$export$25be9502477c137d).getVersion(), this.pack = $2QID2$peerjsjsbinarypack.pack, this.unpack = $2QID2$peerjsjsbinarypack.unpack, /**
        * A hash of WebRTC features mapped to booleans that correspond to whether the feature is supported by the current browser.
        *
        * :::caution
        * Only the properties documented here are guaranteed to be present on `util.supports`
        * :::
        */
        this.supports = (function() {
          const supported = {
            browser: (0, $07e4f6a369d1179a$export$25be9502477c137d).isBrowserSupported(),
            webRTC: (0, $07e4f6a369d1179a$export$25be9502477c137d).isWebRTCSupported(),
            audioVideo: false,
            data: false,
            binaryBlob: false,
            reliable: false
          };
          if (!supported.webRTC) return supported;
          let pc;
          try {
            pc = new RTCPeerConnection($b83e6a166cc3008f$var$DEFAULT_CONFIG);
            supported.audioVideo = true;
            let dc;
            try {
              dc = pc.createDataChannel("_PEERJSTEST", {
                ordered: true
              });
              supported.data = true;
              supported.reliable = !!dc.ordered;
              try {
                dc.binaryType = "blob";
                supported.binaryBlob = !(0, $07e4f6a369d1179a$export$25be9502477c137d).isIOS;
              } catch (e) {
              }
            } catch (e) {
            } finally {
              if (dc) dc.close();
            }
          } catch (e) {
          } finally {
            if (pc) pc.close();
          }
          return supported;
        })(), // Ensure alphanumeric ids
        this.validateId = (0, $706cd7d90eca90d6$export$f35f128fd59ea256), this.randomToken = (0, $6a375544f634961e$export$4e61f672936bec77);
      }
    };
    var $b83e6a166cc3008f$export$7debb50ef11d5e0b = new $b83e6a166cc3008f$export$f8f26dd395d7e1bd();
    var $df9d8b89ee908b8b$var$LOG_PREFIX = "PeerJS: ";
    var $df9d8b89ee908b8b$var$Logger = class {
      get logLevel() {
        return this._logLevel;
      }
      set logLevel(logLevel) {
        this._logLevel = logLevel;
      }
      log(...args) {
        if (this._logLevel >= 3) this._print(3, ...args);
      }
      warn(...args) {
        if (this._logLevel >= 2) this._print(2, ...args);
      }
      error(...args) {
        if (this._logLevel >= 1) this._print(1, ...args);
      }
      setLogFunction(fn) {
        this._print = fn;
      }
      _print(logLevel, ...rest) {
        const copy = [
          $df9d8b89ee908b8b$var$LOG_PREFIX,
          ...rest
        ];
        for (const i in copy) if (copy[i] instanceof Error) copy[i] = "(" + copy[i].name + ") " + copy[i].message;
        if (logLevel >= 3) console.log(...copy);
        else if (logLevel >= 2) console.warn("WARNING", ...copy);
        else if (logLevel >= 1) console.error("ERROR", ...copy);
      }
      constructor() {
        this._logLevel = 0;
      }
    };
    var $df9d8b89ee908b8b$export$2e2bcd8739ae039 = new $df9d8b89ee908b8b$var$Logger();
    var $1a7e7edd560505fc$exports = {};
    $parcel$export($1a7e7edd560505fc$exports, "ConnectionType", () => $1a7e7edd560505fc$export$3157d57b4135e3bc);
    $parcel$export($1a7e7edd560505fc$exports, "PeerErrorType", () => $1a7e7edd560505fc$export$9547aaa2e39030ff);
    $parcel$export($1a7e7edd560505fc$exports, "BaseConnectionErrorType", () => $1a7e7edd560505fc$export$7974935686149686);
    $parcel$export($1a7e7edd560505fc$exports, "DataConnectionErrorType", () => $1a7e7edd560505fc$export$49ae800c114df41d);
    $parcel$export($1a7e7edd560505fc$exports, "SerializationType", () => $1a7e7edd560505fc$export$89f507cf986a947);
    $parcel$export($1a7e7edd560505fc$exports, "SocketEventType", () => $1a7e7edd560505fc$export$3b5c4a4b6354f023);
    $parcel$export($1a7e7edd560505fc$exports, "ServerMessageType", () => $1a7e7edd560505fc$export$adb4a1754da6f10d);
    var $1a7e7edd560505fc$export$3157d57b4135e3bc = /* @__PURE__ */ (function(ConnectionType) {
      ConnectionType["Data"] = "data";
      ConnectionType["Media"] = "media";
      return ConnectionType;
    })({});
    var $1a7e7edd560505fc$export$9547aaa2e39030ff = /* @__PURE__ */ (function(PeerErrorType) {
      PeerErrorType["BrowserIncompatible"] = "browser-incompatible";
      PeerErrorType["Disconnected"] = "disconnected";
      PeerErrorType["InvalidID"] = "invalid-id";
      PeerErrorType["InvalidKey"] = "invalid-key";
      PeerErrorType["Network"] = "network";
      PeerErrorType["PeerUnavailable"] = "peer-unavailable";
      PeerErrorType["SslUnavailable"] = "ssl-unavailable";
      PeerErrorType["ServerError"] = "server-error";
      PeerErrorType["SocketError"] = "socket-error";
      PeerErrorType["SocketClosed"] = "socket-closed";
      PeerErrorType["UnavailableID"] = "unavailable-id";
      PeerErrorType["WebRTC"] = "webrtc";
      return PeerErrorType;
    })({});
    var $1a7e7edd560505fc$export$7974935686149686 = /* @__PURE__ */ (function(BaseConnectionErrorType) {
      BaseConnectionErrorType["NegotiationFailed"] = "negotiation-failed";
      BaseConnectionErrorType["ConnectionClosed"] = "connection-closed";
      return BaseConnectionErrorType;
    })({});
    var $1a7e7edd560505fc$export$49ae800c114df41d = /* @__PURE__ */ (function(DataConnectionErrorType) {
      DataConnectionErrorType["NotOpenYet"] = "not-open-yet";
      DataConnectionErrorType["MessageToBig"] = "message-too-big";
      return DataConnectionErrorType;
    })({});
    var $1a7e7edd560505fc$export$89f507cf986a947 = /* @__PURE__ */ (function(SerializationType) {
      SerializationType["Binary"] = "binary";
      SerializationType["BinaryUTF8"] = "binary-utf8";
      SerializationType["JSON"] = "json";
      SerializationType["None"] = "raw";
      return SerializationType;
    })({});
    var $1a7e7edd560505fc$export$3b5c4a4b6354f023 = /* @__PURE__ */ (function(SocketEventType) {
      SocketEventType["Message"] = "message";
      SocketEventType["Disconnected"] = "disconnected";
      SocketEventType["Error"] = "error";
      SocketEventType["Close"] = "close";
      return SocketEventType;
    })({});
    var $1a7e7edd560505fc$export$adb4a1754da6f10d = /* @__PURE__ */ (function(ServerMessageType) {
      ServerMessageType["Heartbeat"] = "HEARTBEAT";
      ServerMessageType["Candidate"] = "CANDIDATE";
      ServerMessageType["Offer"] = "OFFER";
      ServerMessageType["Answer"] = "ANSWER";
      ServerMessageType["Open"] = "OPEN";
      ServerMessageType["Error"] = "ERROR";
      ServerMessageType["IdTaken"] = "ID-TAKEN";
      ServerMessageType["InvalidKey"] = "INVALID-KEY";
      ServerMessageType["Leave"] = "LEAVE";
      ServerMessageType["Expire"] = "EXPIRE";
      return ServerMessageType;
    })({});
    var $3a25eea6a06ee968$export$83d89fbfd8236492 = "1.5.5";
    var $e5e868bf3ea73e5b$export$4798917dbf149b79 = class extends (0, $2QID2$eventemitter3.EventEmitter) {
      constructor(secure, host, port, path, key, pingInterval = 5e3) {
        super(), this.pingInterval = pingInterval, this._disconnected = true, this._messagesQueue = [];
        const wsProtocol = secure ? "wss://" : "ws://";
        this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
      }
      start(id, token) {
        this._id = id;
        const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;
        if (!!this._socket || !this._disconnected) return;
        this._socket = new WebSocket(wsUrl + "&version=" + (0, $3a25eea6a06ee968$export$83d89fbfd8236492));
        this._disconnected = false;
        this._socket.onmessage = (event) => {
          let data;
          try {
            data = JSON.parse(event.data);
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Server message received:", data);
          } catch (e) {
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Invalid server message", event.data);
            return;
          }
          this.emit((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Message, data);
        };
        this._socket.onclose = (event) => {
          if (this._disconnected) return;
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Socket closed.", event);
          this._cleanup();
          this._disconnected = true;
          this.emit((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Disconnected);
        };
        this._socket.onopen = () => {
          if (this._disconnected) return;
          this._sendQueuedMessages();
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Socket open");
          this._scheduleHeartbeat();
        };
      }
      _scheduleHeartbeat() {
        this._wsPingTimer = setTimeout(() => {
          this._sendHeartbeat();
        }, this.pingInterval);
      }
      _sendHeartbeat() {
        if (!this._wsOpen()) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Cannot send heartbeat, because socket closed`);
          return;
        }
        const message = JSON.stringify({
          type: (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Heartbeat
        });
        this._socket.send(message);
        this._scheduleHeartbeat();
      }
      /** Is the websocket currently open? */
      _wsOpen() {
        return !!this._socket && this._socket.readyState === 1;
      }
      /** Send queued messages. */
      _sendQueuedMessages() {
        const copiedQueue = [
          ...this._messagesQueue
        ];
        this._messagesQueue = [];
        for (const message of copiedQueue) this.send(message);
      }
      /** Exposed send for DC & Peer. */
      send(data) {
        if (this._disconnected) return;
        if (!this._id) {
          this._messagesQueue.push(data);
          return;
        }
        if (!data.type) {
          this.emit((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Error, "Invalid message");
          return;
        }
        if (!this._wsOpen()) return;
        const message = JSON.stringify(data);
        this._socket.send(message);
      }
      close() {
        if (this._disconnected) return;
        this._cleanup();
        this._disconnected = true;
      }
      _cleanup() {
        if (this._socket) {
          this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
          this._socket.close();
          this._socket = void 0;
        }
        clearTimeout(this._wsPingTimer);
      }
    };
    var $a8347a6741c5df8a$export$89e6bb5ad64bf4a = class {
      constructor(connection) {
        this.connection = connection;
      }
      /** Returns a PeerConnection object set up correctly (for data, media). */
      startConnection(options) {
        const peerConnection = this._startPeerConnection();
        this.connection.peerConnection = peerConnection;
        if (this.connection.type === (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Media && options._stream) this._addTracksToConnection(options._stream, peerConnection);
        if (options.originator) {
          const dataConnection = this.connection;
          const config = {
            ordered: !!options.reliable
          };
          const dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
          dataConnection._initializeDataChannel(dataChannel);
          this._makeOffer();
        } else this.handleSDP("OFFER", options.sdp);
      }
      /** Start a PC. */
      _startPeerConnection() {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Creating RTCPeerConnection.");
        const peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
        this._setupListeners(peerConnection);
        return peerConnection;
      }
      /** Set up various WebRTC listeners. */
      _setupListeners(peerConnection) {
        const peerId = this.connection.peer;
        const connectionId = this.connection.connectionId;
        const connectionType = this.connection.type;
        const provider = this.connection.provider;
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Listening for ICE candidates.");
        peerConnection.onicecandidate = (evt) => {
          if (!evt.candidate || !evt.candidate.candidate) return;
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Received ICE candidates for ${peerId}:`, evt.candidate);
          provider.socket.send({
            type: (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Candidate,
            payload: {
              candidate: evt.candidate,
              type: connectionType,
              connectionId
            },
            dst: peerId
          });
        };
        peerConnection.oniceconnectionstatechange = () => {
          switch (peerConnection.iceConnectionState) {
            case "failed":
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("iceConnectionState is failed, closing connections to " + peerId);
              this.connection.emitError((0, $1a7e7edd560505fc$export$7974935686149686).NegotiationFailed, "Negotiation of connection to " + peerId + " failed.");
              this.connection.close();
              break;
            case "closed":
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("iceConnectionState is closed, closing connections to " + peerId);
              this.connection.emitError((0, $1a7e7edd560505fc$export$7974935686149686).ConnectionClosed, "Connection to " + peerId + " closed.");
              this.connection.close();
              break;
            case "disconnected":
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("iceConnectionState changed to disconnected on the connection with " + peerId);
              break;
            case "completed":
              peerConnection.onicecandidate = () => {
              };
              break;
          }
          this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
        };
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Listening for data channel");
        peerConnection.ondatachannel = (evt) => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Received data channel");
          const dataChannel = evt.channel;
          const connection = provider.getConnection(peerId, connectionId);
          connection._initializeDataChannel(dataChannel);
        };
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Listening for remote stream");
        peerConnection.ontrack = (evt) => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Received remote stream");
          const stream = evt.streams[0];
          const connection = provider.getConnection(peerId, connectionId);
          if (connection.type === (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Media) {
            const mediaConnection = connection;
            this._addStreamToMediaConnection(stream, mediaConnection);
          }
        };
      }
      cleanup() {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Cleaning up PeerConnection to " + this.connection.peer);
        const peerConnection = this.connection.peerConnection;
        if (!peerConnection) return;
        this.connection.peerConnection = null;
        peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => {
        };
        const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
        let dataChannelNotClosed = false;
        const dataChannel = this.connection.dataChannel;
        if (dataChannel) dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
        if (peerConnectionNotClosed || dataChannelNotClosed) peerConnection.close();
      }
      async _makeOffer() {
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        try {
          const offer = await peerConnection.createOffer(this.connection.options.constraints);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Created offer.");
          if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
          try {
            await peerConnection.setLocalDescription(offer);
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Set localDescription:", offer, `for:${this.connection.peer}`);
            let payload = {
              sdp: offer,
              type: this.connection.type,
              connectionId: this.connection.connectionId,
              metadata: this.connection.metadata
            };
            if (this.connection.type === (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Data) {
              const dataConnection = this.connection;
              payload = {
                ...payload,
                label: dataConnection.label,
                reliable: dataConnection.reliable,
                serialization: dataConnection.serialization
              };
            }
            provider.socket.send({
              type: (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Offer,
              payload,
              dst: this.connection.peer
            });
          } catch (err) {
            if (err != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
              provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err);
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
            }
          }
        } catch (err_1) {
          provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err_1);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to createOffer, ", err_1);
        }
      }
      async _makeAnswer() {
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        try {
          const answer = await peerConnection.createAnswer();
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Created answer.");
          if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
          try {
            await peerConnection.setLocalDescription(answer);
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Set localDescription:`, answer, `for:${this.connection.peer}`);
            provider.socket.send({
              type: (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Answer,
              payload: {
                sdp: answer,
                type: this.connection.type,
                connectionId: this.connection.connectionId
              },
              dst: this.connection.peer
            });
          } catch (err) {
            provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err);
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
          }
        } catch (err_1) {
          provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err_1);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to create answer, ", err_1);
        }
      }
      /** Handle an SDP. */
      async handleSDP(type, sdp) {
        sdp = new RTCSessionDescription(sdp);
        const peerConnection = this.connection.peerConnection;
        const provider = this.connection.provider;
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Setting remote description", sdp);
        const self2 = this;
        try {
          await peerConnection.setRemoteDescription(sdp);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Set remoteDescription:${type} for:${this.connection.peer}`);
          if (type === "OFFER") await self2._makeAnswer();
        } catch (err) {
          provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to setRemoteDescription, ", err);
        }
      }
      /** Handle a candidate. */
      async handleCandidate(ice) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`handleCandidate:`, ice);
        try {
          await this.connection.peerConnection.addIceCandidate(ice);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Added ICE candidate for:${this.connection.peer}`);
        } catch (err) {
          this.connection.provider.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).WebRTC, err);
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Failed to handleCandidate, ", err);
        }
      }
      _addTracksToConnection(stream, peerConnection) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`add tracks from stream ${stream.id} to peer connection`);
        if (!peerConnection.addTrack) return (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }
      _addStreamToMediaConnection(stream, mediaConnection) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`);
        mediaConnection.addStream(stream);
      }
    };
    var $cf62563e7a9fbce5$export$6a678e589c8a4542 = class extends (0, $2QID2$eventemitter3.EventEmitter) {
      /**
      * Emits a typed error message.
      *
      * @internal
      */
      emitError(type, err) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("Error:", err);
        this.emit("error", new $cf62563e7a9fbce5$export$98871882f492de82(`${type}`, err));
      }
    };
    var $cf62563e7a9fbce5$export$98871882f492de82 = class extends Error {
      /**
      * @internal
      */
      constructor(type, err) {
        if (typeof err === "string") super(err);
        else {
          super();
          Object.assign(this, err);
        }
        this.type = type;
      }
    };
    var $cb834ab0363d9153$export$23a2a68283c24d80 = class extends (0, $cf62563e7a9fbce5$export$6a678e589c8a4542) {
      /**
      * Whether the media connection is active (e.g. your call has been answered).
      * You can check this if you want to set a maximum wait time for a one-sided call.
      */
      get open() {
        return this._open;
      }
      constructor(peer, provider, options) {
        super(), this.peer = peer, this.provider = provider, this.options = options, this._open = false;
        this.metadata = options.metadata;
      }
    };
    var __;
    var _$f3a554d4328c6b5f$export$4a84e95a2324ac29 = class _$f3a554d4328c6b5f$export$4a84e95a2324ac29 extends (0, $cb834ab0363d9153$export$23a2a68283c24d80) {
      /**
      * For media connections, this is always 'media'.
      */
      get type() {
        return (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Media;
      }
      get localStream() {
        return this._localStream;
      }
      get remoteStream() {
        return this._remoteStream;
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options);
        this._localStream = this.options._stream;
        this.connectionId = this.options.connectionId || _$f3a554d4328c6b5f$export$4a84e95a2324ac29.ID_PREFIX + (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).randomToken();
        this._negotiator = new (0, $a8347a6741c5df8a$export$89e6bb5ad64bf4a)(this);
        if (this._localStream) this._negotiator.startConnection({
          _stream: this._localStream,
          originator: true
        });
      }
      /** Called by the Negotiator when the DataChannel is ready. */
      _initializeDataChannel(dc) {
        this.dataChannel = dc;
        this.dataChannel.onopen = () => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
          this.emit("willCloseOnRemote");
        };
        this.dataChannel.onclose = () => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
          this.close();
        };
      }
      addStream(remoteStream) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log("Receiving stream", remoteStream);
        this._remoteStream = remoteStream;
        super.emit("stream", remoteStream);
      }
      /**
      * @internal
      */
      handleMessage(message) {
        const type = message.type;
        const payload = message.payload;
        switch (message.type) {
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Answer:
            this._negotiator.handleSDP(type, payload.sdp);
            this._open = true;
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Candidate:
            this._negotiator.handleCandidate(payload.candidate);
            break;
          default:
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn(`Unrecognized message type:${type} from peer:${this.peer}`);
            break;
        }
      }
      /**
           * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
           * `answer` on the media connection provided by the callback to accept the call
           * and optionally send your own media stream.
      
           *
           * @param stream A WebRTC media stream.
           * @param options
           * @returns
           */
      answer(stream, options = {}) {
        if (this._localStream) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
          return;
        }
        this._localStream = stream;
        if (options && options.sdpTransform) this.options.sdpTransform = options.sdpTransform;
        this._negotiator.startConnection({
          ...this.options._payload,
          _stream: stream
        });
        const messages = this.provider._getMessages(this.connectionId);
        for (const message of messages) this.handleMessage(message);
        this._open = true;
      }
      /**
      * Exposed functionality for users.
      */
      /**
      * Closes the media connection.
      */
      close() {
        if (this._negotiator) {
          this._negotiator.cleanup();
          this._negotiator = null;
        }
        this._localStream = null;
        this._remoteStream = null;
        if (this.provider) {
          this.provider._removeConnection(this);
          this.provider = null;
        }
        if (this.options && this.options._stream) this.options._stream = null;
        if (!this.open) return;
        this._open = false;
        super.emit("close");
      }
    };
    __ = new WeakMap();
    __privateAdd(_$f3a554d4328c6b5f$export$4a84e95a2324ac29, __, _$f3a554d4328c6b5f$export$4a84e95a2324ac29.ID_PREFIX = "mc_");
    var $f3a554d4328c6b5f$export$4a84e95a2324ac29 = _$f3a554d4328c6b5f$export$4a84e95a2324ac29;
    var $684fc411629b137b$export$2c4e825dc9120f87 = class {
      constructor(_options) {
        this._options = _options;
      }
      _buildRequest(method) {
        const protocol = this._options.secure ? "https" : "http";
        const { host, port, path, key } = this._options;
        const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
        url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
        url.searchParams.set("version", (0, $3a25eea6a06ee968$export$83d89fbfd8236492));
        return fetch(url.href, {
          referrerPolicy: this._options.referrerPolicy
        });
      }
      /** Get a unique ID from the server via XHR and initialize with it. */
      async retrieveId() {
        try {
          const response = await this._buildRequest("id");
          if (response.status !== 200) throw new Error(`Error. Status:${response.status}`);
          return response.text();
        } catch (error) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("Error retrieving ID", error);
          let pathError = "";
          if (this._options.path === "/" && this._options.host !== (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_HOST) pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
          throw new Error("Could not get an ID from the server." + pathError);
        }
      }
      /** @deprecated */
      async listAllPeers() {
        try {
          const response = await this._buildRequest("peers");
          if (response.status !== 200) {
            if (response.status === 401) {
              let helpfulError = "";
              if (this._options.host === (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_HOST) helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
              else helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
              throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
            }
            throw new Error(`Error. Status:${response.status}`);
          }
          return response.json();
        } catch (error) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("Error retrieving list peers", error);
          throw new Error("Could not get list peers from the server." + error);
        }
      }
    };
    var __2, __22;
    var _$f188f8cb0f63b180$export$d365f7ad9d7df9c9 = class _$f188f8cb0f63b180$export$d365f7ad9d7df9c9 extends (0, $cb834ab0363d9153$export$23a2a68283c24d80) {
      get type() {
        return (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Data;
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options);
        this.connectionId = this.options.connectionId || _$f188f8cb0f63b180$export$d365f7ad9d7df9c9.ID_PREFIX + (0, $6a375544f634961e$export$4e61f672936bec77)();
        this.label = this.options.label || this.connectionId;
        this.reliable = !!this.options.reliable;
        this._negotiator = new (0, $a8347a6741c5df8a$export$89e6bb5ad64bf4a)(this);
        this._negotiator.startConnection(this.options._payload || {
          originator: true,
          reliable: this.reliable
        });
      }
      /** Called by the Negotiator when the DataChannel is ready. */
      _initializeDataChannel(dc) {
        this.dataChannel = dc;
        this.dataChannel.onopen = () => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc connection success`);
          this._open = true;
          this.emit("open");
        };
        this.dataChannel.onmessage = (e) => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc onmessage:`, e.data);
        };
        this.dataChannel.onclose = () => {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} dc closed for:`, this.peer);
          this.close();
        };
      }
      /**
      * Exposed functionality for users.
      */
      /** Allows user to close connection. */
      close(options) {
        if (options?.flush) {
          this.send({
            __peerData: {
              type: "close"
            }
          });
          return;
        }
        if (this._negotiator) {
          this._negotiator.cleanup();
          this._negotiator = null;
        }
        if (this.provider) {
          this.provider._removeConnection(this);
          this.provider = null;
        }
        if (this.dataChannel) {
          this.dataChannel.onopen = null;
          this.dataChannel.onmessage = null;
          this.dataChannel.onclose = null;
          this.dataChannel = null;
        }
        if (!this.open) return;
        this._open = false;
        super.emit("close");
      }
      /** Allows user to send data. */
      send(data, chunked = false) {
        if (!this.open) {
          this.emitError((0, $1a7e7edd560505fc$export$49ae800c114df41d).NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
          return;
        }
        return this._send(data, chunked);
      }
      async handleMessage(message) {
        const payload = message.payload;
        switch (message.type) {
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Answer:
            await this._negotiator.handleSDP(message.type, payload.sdp);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Candidate:
            await this._negotiator.handleCandidate(payload.candidate);
            break;
          default:
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn("Unrecognized message type:", message.type, "from peer:", this.peer);
            break;
        }
      }
    };
    __2 = new WeakMap();
    __22 = new WeakMap();
    __privateAdd(_$f188f8cb0f63b180$export$d365f7ad9d7df9c9, __2, _$f188f8cb0f63b180$export$d365f7ad9d7df9c9.ID_PREFIX = "dc_");
    __privateAdd(_$f188f8cb0f63b180$export$d365f7ad9d7df9c9, __22, _$f188f8cb0f63b180$export$d365f7ad9d7df9c9.MAX_BUFFERED_AMOUNT = 8388608);
    var $f188f8cb0f63b180$export$d365f7ad9d7df9c9 = _$f188f8cb0f63b180$export$d365f7ad9d7df9c9;
    var $8d5124d0cf36ebe0$export$ff7c9d4c11d94e8b = class extends (0, $f188f8cb0f63b180$export$d365f7ad9d7df9c9) {
      get bufferSize() {
        return this._bufferSize;
      }
      _initializeDataChannel(dc) {
        super._initializeDataChannel(dc);
        this.dataChannel.binaryType = "arraybuffer";
        this.dataChannel.addEventListener("message", (e) => this._handleDataMessage(e));
      }
      _bufferedSend(msg) {
        if (this._buffering || !this._trySend(msg)) {
          this._buffer.push(msg);
          this._bufferSize = this._buffer.length;
        }
      }
      // Returns true if the send succeeds.
      _trySend(msg) {
        if (!this.open) return false;
        if (this.dataChannel.bufferedAmount > (0, $f188f8cb0f63b180$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT) {
          this._buffering = true;
          setTimeout(() => {
            this._buffering = false;
            this._tryBuffer();
          }, 50);
          return false;
        }
        try {
          this.dataChannel.send(msg);
        } catch (e) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error(`DC#:${this.connectionId} Error when sending:`, e);
          this._buffering = true;
          this.close();
          return false;
        }
        return true;
      }
      // Try to send the first message in the buffer.
      _tryBuffer() {
        if (!this.open) return;
        if (this._buffer.length === 0) return;
        const msg = this._buffer[0];
        if (this._trySend(msg)) {
          this._buffer.shift();
          this._bufferSize = this._buffer.length;
          this._tryBuffer();
        }
      }
      close(options) {
        if (options?.flush) {
          this.send({
            __peerData: {
              type: "close"
            }
          });
          return;
        }
        this._buffer = [];
        this._bufferSize = 0;
        super.close();
      }
      constructor(...args) {
        super(...args), this._buffer = [], this._bufferSize = 0, this._buffering = false;
      }
    };
    var $9cfea3ad93e740b9$export$f0a5a64d5bb37108 = class extends (0, $8d5124d0cf36ebe0$export$ff7c9d4c11d94e8b) {
      close(options) {
        super.close(options);
        this._chunkedData = {};
      }
      constructor(peerId, provider, options) {
        super(peerId, provider, options), this.chunker = new (0, $7ce5389b504cc06c$export$f1c5f4c9cb95390b)(), this.serialization = (0, $1a7e7edd560505fc$export$89f507cf986a947).Binary, this._chunkedData = {};
      }
      // Handles a DataChannel message.
      _handleDataMessage({ data }) {
        const deserializedData = (0, $2QID2$peerjsjsbinarypack.unpack)(data);
        const peerData = deserializedData["__peerData"];
        if (peerData) {
          if (peerData.type === "close") {
            this.close();
            return;
          }
          this._handleChunk(deserializedData);
          return;
        }
        this.emit("data", deserializedData);
      }
      _handleChunk(data) {
        const id = data.__peerData;
        const chunkInfo = this._chunkedData[id] || {
          data: [],
          count: 0,
          total: data.total
        };
        chunkInfo.data[data.n] = new Uint8Array(data.data);
        chunkInfo.count++;
        this._chunkedData[id] = chunkInfo;
        if (chunkInfo.total === chunkInfo.count) {
          delete this._chunkedData[id];
          const data2 = (0, $7ce5389b504cc06c$export$52c89ebcdc4f53f2)(chunkInfo.data);
          this._handleDataMessage({
            data: data2
          });
        }
      }
      _send(data, chunked) {
        const blob = (0, $2QID2$peerjsjsbinarypack.pack)(data);
        if (blob instanceof Promise) return this._send_blob(blob);
        if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
          this._sendChunks(blob);
          return;
        }
        this._bufferedSend(blob);
      }
      async _send_blob(blobPromise) {
        const blob = await blobPromise;
        if (blob.byteLength > this.chunker.chunkedMTU) {
          this._sendChunks(blob);
          return;
        }
        this._bufferedSend(blob);
      }
      _sendChunks(blob) {
        const blobs = this.chunker.chunk(blob);
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);
        for (const blob2 of blobs) this.send(blob2, true);
      }
    };
    var $c1c7a35edd5f55d2$export$6f88fe47d32c9c94 = class extends (0, $8d5124d0cf36ebe0$export$ff7c9d4c11d94e8b) {
      _handleDataMessage({ data }) {
        super.emit("data", data);
      }
      _send(data, _chunked) {
        this._bufferedSend(data);
      }
      constructor(...args) {
        super(...args), this.serialization = (0, $1a7e7edd560505fc$export$89f507cf986a947).None;
      }
    };
    var $f3415bb65bf67923$export$48880ac635f47186 = class extends (0, $8d5124d0cf36ebe0$export$ff7c9d4c11d94e8b) {
      // Handles a DataChannel message.
      _handleDataMessage({ data }) {
        const deserializedData = this.parse(this.decoder.decode(data));
        const peerData = deserializedData["__peerData"];
        if (peerData && peerData.type === "close") {
          this.close();
          return;
        }
        this.emit("data", deserializedData);
      }
      _send(data, _chunked) {
        const encodedData = this.encoder.encode(this.stringify(data));
        if (encodedData.byteLength >= (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).chunkedMTU) {
          this.emitError((0, $1a7e7edd560505fc$export$49ae800c114df41d).MessageToBig, "Message too big for JSON channel");
          return;
        }
        this._bufferedSend(encodedData);
      }
      constructor(...args) {
        super(...args), this.serialization = (0, $1a7e7edd560505fc$export$89f507cf986a947).JSON, this.encoder = new TextEncoder(), this.decoder = new TextDecoder(), this.stringify = JSON.stringify, this.parse = JSON.parse;
      }
    };
    var __3;
    var _$2ddecb16305b5a82$export$ecd1fc136c422448 = class _$2ddecb16305b5a82$export$ecd1fc136c422448 extends (0, $cf62563e7a9fbce5$export$6a678e589c8a4542) {
      /**
      * The brokering ID of this peer
      *
      * If no ID was specified in {@apilink Peer | the constructor},
      * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
      */
      get id() {
        return this._id;
      }
      get options() {
        return this._options;
      }
      get open() {
        return this._open;
      }
      /**
      * @internal
      */
      get socket() {
        return this._socket;
      }
      /**
      * A hash of all connections associated with this peer, keyed by the remote peer's ID.
      * @deprecated
      * Return type will change from Object to Map<string,[]>
      */
      get connections() {
        const plainConnections = /* @__PURE__ */ Object.create(null);
        for (const [k, v] of this._connections) plainConnections[k] = v;
        return plainConnections;
      }
      /**
      * true if this peer and all of its connections can no longer be used.
      */
      get destroyed() {
        return this._destroyed;
      }
      /**
      * false if there is an active connection to the PeerServer.
      */
      get disconnected() {
        return this._disconnected;
      }
      constructor(id, options) {
        super(), this._serializers = {
          raw: (0, $c1c7a35edd5f55d2$export$6f88fe47d32c9c94),
          json: (0, $f3415bb65bf67923$export$48880ac635f47186),
          binary: (0, $9cfea3ad93e740b9$export$f0a5a64d5bb37108),
          "binary-utf8": (0, $9cfea3ad93e740b9$export$f0a5a64d5bb37108),
          default: (0, $9cfea3ad93e740b9$export$f0a5a64d5bb37108)
        }, this._id = null, this._lastServerId = null, // States.
        this._destroyed = false, this._disconnected = false, this._open = false, this._connections = /* @__PURE__ */ new Map(), this._lostMessages = /* @__PURE__ */ new Map();
        let userId;
        if (id && id.constructor == Object) options = id;
        else if (id) userId = id.toString();
        options = {
          debug: 0,
          host: (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_HOST,
          port: (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_PORT,
          path: "/",
          key: _$2ddecb16305b5a82$export$ecd1fc136c422448.DEFAULT_KEY,
          token: (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).randomToken(),
          config: (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).defaultConfig,
          referrerPolicy: "strict-origin-when-cross-origin",
          serializers: {},
          ...options
        };
        this._options = options;
        this._serializers = {
          ...this._serializers,
          ...this.options.serializers
        };
        if (this._options.host === "/") this._options.host = window.location.hostname;
        if (this._options.path) {
          if (this._options.path[0] !== "/") this._options.path = "/" + this._options.path;
          if (this._options.path[this._options.path.length - 1] !== "/") this._options.path += "/";
        }
        if (this._options.secure === void 0 && this._options.host !== (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_HOST) this._options.secure = (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).isSecure();
        else if (this._options.host == (0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).CLOUD_HOST) this._options.secure = true;
        if (this._options.logFunction) (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).setLogFunction(this._options.logFunction);
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).logLevel = this._options.debug || 0;
        this._api = new (0, $684fc411629b137b$export$2c4e825dc9120f87)(options);
        this._socket = this._createServerConnection();
        if (!(0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).supports.audioVideo && !(0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).supports.data) {
          this._delayedAbort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).BrowserIncompatible, "The current browser does not support WebRTC");
          return;
        }
        if (!!userId && !(0, $b83e6a166cc3008f$export$7debb50ef11d5e0b).validateId(userId)) {
          this._delayedAbort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).InvalidID, `ID "${userId}" is invalid`);
          return;
        }
        if (userId) this._initialize(userId);
        else this._api.retrieveId().then((id2) => this._initialize(id2)).catch((error) => this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).ServerError, error));
      }
      _createServerConnection() {
        const socket = new (0, $e5e868bf3ea73e5b$export$4798917dbf149b79)(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
        socket.on((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Message, (data) => {
          this._handleMessage(data);
        });
        socket.on((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Error, (error) => {
          this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).SocketError, error);
        });
        socket.on((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Disconnected, () => {
          if (this.disconnected) return;
          this.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).Network, "Lost connection to server.");
          this.disconnect();
        });
        socket.on((0, $1a7e7edd560505fc$export$3b5c4a4b6354f023).Close, () => {
          if (this.disconnected) return;
          this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).SocketClosed, "Underlying socket is already closed.");
        });
        return socket;
      }
      /** Initialize a connection with the server. */
      _initialize(id) {
        this._id = id;
        this.socket.start(id, this._options.token);
      }
      /** Handles messages from the server. */
      _handleMessage(message) {
        const type = message.type;
        const payload = message.payload;
        const peerId = message.src;
        switch (type) {
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Open:
            this._lastServerId = this.id;
            this._open = true;
            this.emit("open", this.id);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Error:
            this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).ServerError, payload.msg);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).IdTaken:
            this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).UnavailableID, `ID "${this.id}" is taken`);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).InvalidKey:
            this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).InvalidKey, `API KEY "${this._options.key}" is invalid`);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Leave:
            (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Received leave message from ${peerId}`);
            this._cleanupPeer(peerId);
            this._connections.delete(peerId);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Expire:
            this.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).PeerUnavailable, `Could not connect to peer ${peerId}`);
            break;
          case (0, $1a7e7edd560505fc$export$adb4a1754da6f10d).Offer: {
            const connectionId = payload.connectionId;
            let connection = this.getConnection(peerId, connectionId);
            if (connection) {
              connection.close();
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn(`Offer received for existing Connection ID:${connectionId}`);
            }
            if (payload.type === (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Media) {
              const mediaConnection = new (0, $f3a554d4328c6b5f$export$4a84e95a2324ac29)(peerId, this, {
                connectionId,
                _payload: payload,
                metadata: payload.metadata
              });
              connection = mediaConnection;
              this._addConnection(peerId, connection);
              this.emit("call", mediaConnection);
            } else if (payload.type === (0, $1a7e7edd560505fc$export$3157d57b4135e3bc).Data) {
              const dataConnection = new this._serializers[payload.serialization](peerId, this, {
                connectionId,
                _payload: payload,
                metadata: payload.metadata,
                label: payload.label,
                serialization: payload.serialization,
                reliable: payload.reliable
              });
              connection = dataConnection;
              this._addConnection(peerId, connection);
              this.emit("connection", dataConnection);
            } else {
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn(`Received malformed connection type:${payload.type}`);
              return;
            }
            const messages = this._getMessages(connectionId);
            for (const message2 of messages) connection.handleMessage(message2);
            break;
          }
          default: {
            if (!payload) {
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn(`You received a malformed message from ${peerId} of type ${type}`);
              return;
            }
            const connectionId = payload.connectionId;
            const connection = this.getConnection(peerId, connectionId);
            if (connection && connection.peerConnection)
              connection.handleMessage(message);
            else if (connectionId)
              this._storeMessage(connectionId, message);
            else (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn("You received an unrecognized message:", message);
            break;
          }
        }
      }
      /** Stores messages without a set up connection, to be claimed later. */
      _storeMessage(connectionId, message) {
        if (!this._lostMessages.has(connectionId)) this._lostMessages.set(connectionId, []);
        this._lostMessages.get(connectionId).push(message);
      }
      /**
      * Retrieve messages from lost message store
      * @internal
      */
      //TODO Change it to private
      _getMessages(connectionId) {
        const messages = this._lostMessages.get(connectionId);
        if (messages) {
          this._lostMessages.delete(connectionId);
          return messages;
        }
        return [];
      }
      /**
      * Connects to the remote peer specified by id and returns a data connection.
      * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
      * @param options for specifying details about Peer Connection
      */
      connect(peer, options = {}) {
        options = {
          serialization: "default",
          ...options
        };
        if (this.disconnected) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
          this.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
          return;
        }
        const dataConnection = new this._serializers[options.serialization](peer, this, options);
        this._addConnection(peer, dataConnection);
        return dataConnection;
      }
      /**
      * Calls the remote peer specified by id and returns a media connection.
      * @param peer The brokering ID of the remote peer (their peer.id).
      * @param stream The caller's media stream
      * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
      */
      call(peer, stream, options = {}) {
        if (this.disconnected) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
          this.emitError((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).Disconnected, "Cannot connect to new Peer after disconnecting from server.");
          return;
        }
        if (!stream) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
          return;
        }
        const mediaConnection = new (0, $f3a554d4328c6b5f$export$4a84e95a2324ac29)(peer, this, {
          ...options,
          _stream: stream
        });
        this._addConnection(peer, mediaConnection);
        return mediaConnection;
      }
      /** Add a data/media connection to this peer. */
      _addConnection(peerId, connection) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`);
        if (!this._connections.has(peerId)) this._connections.set(peerId, []);
        this._connections.get(peerId).push(connection);
      }
      //TODO should be private
      _removeConnection(connection) {
        const connections = this._connections.get(connection.peer);
        if (connections) {
          const index = connections.indexOf(connection);
          if (index !== -1) connections.splice(index, 1);
        }
        this._lostMessages.delete(connection.connectionId);
      }
      /** Retrieve a data/media connection for this peer. */
      getConnection(peerId, connectionId) {
        const connections = this._connections.get(peerId);
        if (!connections) return null;
        for (const connection of connections) {
          if (connection.connectionId === connectionId) return connection;
        }
        return null;
      }
      _delayedAbort(type, message) {
        setTimeout(() => {
          this._abort(type, message);
        }, 0);
      }
      /**
      * Emits an error message and destroys the Peer.
      * The Peer is not destroyed if it's in a disconnected state, in which case
      * it retains its disconnected state and its existing connections.
      */
      _abort(type, message) {
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("Aborting!");
        this.emitError(type, message);
        if (!this._lastServerId) this.destroy();
        else this.disconnect();
      }
      /**
      * Destroys the Peer: closes all active connections as well as the connection
      * to the server.
      *
      * :::caution
      * This cannot be undone; the respective peer object will no longer be able
      * to create or receive any connections, its ID will be forfeited on the server,
      * and all of its data and media connections will be closed.
      * :::
      */
      destroy() {
        if (this.destroyed) return;
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Destroy peer with ID:${this.id}`);
        this.disconnect();
        this._cleanup();
        this._destroyed = true;
        this.emit("close");
      }
      /** Disconnects every connection on this peer. */
      _cleanup() {
        for (const peerId of this._connections.keys()) {
          this._cleanupPeer(peerId);
          this._connections.delete(peerId);
        }
        this.socket.removeAllListeners();
      }
      /** Closes all connections to this peer. */
      _cleanupPeer(peerId) {
        const connections = this._connections.get(peerId);
        if (!connections) return;
        for (const connection of connections) connection.close();
      }
      /**
      * Disconnects the Peer's connection to the PeerServer. Does not close any
      *  active connections.
      * Warning: The peer can no longer create or accept connections after being
      *  disconnected. It also cannot reconnect to the server.
      */
      disconnect() {
        if (this.disconnected) return;
        const currentId = this.id;
        (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Disconnect peer with ID:${currentId}`);
        this._disconnected = true;
        this._open = false;
        this.socket.close();
        this._lastServerId = currentId;
        this._id = null;
        this.emit("disconnected", currentId);
      }
      /** Attempts to reconnect with the same ID.
      *
      * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
      * Destroyed peers cannot be reconnected.
      * If the connection fails (as an example, if the peer's old ID is now taken),
      * the peer's existing connections will not close, but any associated errors events will fire.
      */
      reconnect() {
        if (this.disconnected && !this.destroyed) {
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).log(`Attempting reconnection to server with ID ${this._lastServerId}`);
          this._disconnected = false;
          this._initialize(this._lastServerId);
        } else if (this.destroyed) throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
        else if (!this.disconnected && !this.open)
          (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error("In a hurry? We're still trying to make the initial connection!");
        else throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
      }
      /**
      * Get a list of available peer IDs. If you're running your own server, you'll
      * want to set allow_discovery: true in the PeerServer options. If you're using
      * the cloud server, email team@peerjs.com to get the functionality enabled for
      * your key.
      */
      listAllPeers(cb = (_) => {
      }) {
        this._api.listAllPeers().then((peers) => cb(peers)).catch((error) => this._abort((0, $1a7e7edd560505fc$export$9547aaa2e39030ff).ServerError, error));
      }
    };
    __3 = new WeakMap();
    __privateAdd(_$2ddecb16305b5a82$export$ecd1fc136c422448, __3, _$2ddecb16305b5a82$export$ecd1fc136c422448.DEFAULT_KEY = "peerjs");
    var $2ddecb16305b5a82$export$ecd1fc136c422448 = _$2ddecb16305b5a82$export$ecd1fc136c422448;
    var $544799118fa637e6$export$72aa44612e2200cd = class extends (0, $f188f8cb0f63b180$export$d365f7ad9d7df9c9) {
      constructor(peerId, provider, options) {
        super(peerId, provider, {
          ...options,
          reliable: true
        }), this._CHUNK_SIZE = 32768, this._splitStream = new TransformStream({
          transform: (chunk, controller) => {
            for (let split = 0; split < chunk.length; split += this._CHUNK_SIZE) controller.enqueue(chunk.subarray(split, split + this._CHUNK_SIZE));
          }
        }), this._rawSendStream = new WritableStream({
          write: async (chunk, controller) => {
            const openEvent = new Promise((resolve) => this.dataChannel.addEventListener("bufferedamountlow", resolve, {
              once: true
            }));
            await (this.dataChannel.bufferedAmount <= (0, $f188f8cb0f63b180$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT - chunk.byteLength || openEvent);
            try {
              this.dataChannel.send(chunk);
            } catch (e) {
              (0, $df9d8b89ee908b8b$export$2e2bcd8739ae039).error(`DC#:${this.connectionId} Error when sending:`, e);
              controller.error(e);
              this.close();
            }
          }
        }), this.writer = this._splitStream.writable.getWriter(), this._rawReadStream = new ReadableStream({
          start: (controller) => {
            this.once("open", () => {
              this.dataChannel.addEventListener("message", (e) => {
                controller.enqueue(e.data);
              });
            });
          }
        });
        this._splitStream.readable.pipeTo(this._rawSendStream);
      }
      _initializeDataChannel(dc) {
        super._initializeDataChannel(dc);
        this.dataChannel.binaryType = "arraybuffer";
        this.dataChannel.bufferedAmountLowThreshold = (0, $f188f8cb0f63b180$export$d365f7ad9d7df9c9).MAX_BUFFERED_AMOUNT / 2;
      }
    };
    var $7e477efb76e02214$export$80f5de1a66c4d624 = class extends (0, $544799118fa637e6$export$72aa44612e2200cd) {
      constructor(peerId, provider, options) {
        super(peerId, provider, options), this.serialization = "MsgPack", this._encoder = new (0, $2QID2$msgpackmsgpack.Encoder)();
        (async () => {
          for await (const msg of (0, $2QID2$msgpackmsgpack.decodeMultiStream)(this._rawReadStream)) {
            if (msg.__peerData?.type === "close") {
              this.close();
              return;
            }
            this.emit("data", msg);
          }
        })();
      }
      _send(data) {
        return this.writer.write(this._encoder.encode(data));
      }
    };
    var $8c8805059443e9b3$export$d72c7bf8eef50853 = class extends (0, $2ddecb16305b5a82$export$ecd1fc136c422448) {
      constructor(...args) {
        super(...args), this._serializers = {
          MsgPack: $7e477efb76e02214$export$80f5de1a66c4d624,
          default: (0, $7e477efb76e02214$export$80f5de1a66c4d624)
        };
      }
    };
    var $8c8bca0fa9aa4b8b$export$2e2bcd8739ae039 = (0, $2ddecb16305b5a82$export$ecd1fc136c422448);
    $parcel$exportWildcard(module.exports, $1a7e7edd560505fc$exports);
  }
});

// src/signaling/peerjs-signaling-provider.js
var require_peerjs_signaling_provider = __commonJS({
  "src/signaling/peerjs-signaling-provider.js"(exports, module) {
    var WebSocketSignalingProvider = require_websocket_signaling_provider();
    var parsePeerJsServerUrl = require_parse_peerjs_url();
    var PeerJSSignalingProvider = class {
      constructor({ id, url, PeerImpl, WebSocketImpl, priority = 0, connectTimeoutMs = 1e4 }) {
        if (!url) {
          throw new Error("PeerJS signaling provider requires a url");
        }
        this.id = id || url;
        this.url = url;
        this.priority = priority;
        this.isCustomPeerImpl = Boolean(PeerImpl);
        this.PeerImpl = PeerImpl || this.resolvePeerImplementation();
        this.WebSocketImpl = WebSocketImpl;
        this.connectTimeoutMs = connectTimeoutMs;
        this.peer = null;
        this.peerId = null;
        this.connections = /* @__PURE__ */ new Map();
        this.messageHandlers = /* @__PURE__ */ new Set();
        this.fallbackProvider = null;
      }
      resolvePeerImplementation() {
        try {
          const peerjs = require_bundler();
          return peerjs.Peer || peerjs;
        } catch (error) {
          return null;
        }
      }
      parsePeerJsServerUrl() {
        return parsePeerJsServerUrl(this.url);
      }
      shouldUseWebSocketFallback() {
        return !this.isCustomPeerImpl && typeof globalThis.RTCPeerConnection !== "function";
      }
      useWebSocketFallback() {
        if (!this.fallbackProvider) {
          this.fallbackProvider = new WebSocketSignalingProvider({
            id: `${this.id}-ws-fallback`,
            url: this.url,
            WebSocketImpl: this.WebSocketImpl,
            priority: this.priority
          });
        }
        return this.fallbackProvider;
      }
      async connect() {
        if (this.shouldUseWebSocketFallback()) {
          await this.useWebSocketFallback().connect();
          return;
        }
        if (!this.PeerImpl) {
          throw new Error("PeerJS implementation is not available");
        }
        const server = this.parsePeerJsServerUrl();
        const peerId = `dignityjs_${Math.random().toString(36).slice(2, 12)}`;
        await new Promise((resolve, reject) => {
          const peer = new this.PeerImpl(peerId, {
            host: server.host,
            port: server.port,
            path: server.path,
            secure: server.secure,
            key: server.key
          });
          const timeout = setTimeout(() => {
            reject(new Error(`Unable to connect to signaling url ${this.url}`));
          }, this.connectTimeoutMs);
          peer.on("open", () => {
            clearTimeout(timeout);
            this.peer = peer;
            this.peerId = peerId;
            resolve();
          });
          peer.on("connection", (connection) => {
            this.attachConnectionHandlers(connection);
          });
          peer.on("error", async (error) => {
            clearTimeout(timeout);
            if (error && error.type === "browser-incompatible") {
              try {
                await this.useWebSocketFallback().connect();
                resolve();
                return;
              } catch (fallbackError) {
                reject(new Error(`Unable to connect to signaling url ${this.url}`));
                return;
              }
            }
            reject(new Error(`Unable to connect to signaling url ${this.url}`));
          });
        });
      }
      attachConnectionHandlers(connection) {
        const remoteId = connection.peer;
        this.connections.set(remoteId, connection);
        connection.on("data", (payload) => {
          for (const handler of this.messageHandlers) {
            handler(payload);
          }
        });
        connection.on("close", () => {
          this.connections.delete(remoteId);
        });
      }
      async openConnection(remotePeerId) {
        if (!this.peer) {
          throw new Error("PeerJS is not connected");
        }
        const existing = this.connections.get(remotePeerId);
        if (existing && existing.open) {
          return existing;
        }
        return await new Promise((resolve, reject) => {
          const connection = this.peer.connect(remotePeerId, { reliable: true, serialization: "json" });
          const timeout = setTimeout(() => {
            reject(new Error(`Unable to connect peer ${remotePeerId} via ${this.url}`));
          }, this.connectTimeoutMs);
          connection.on("open", () => {
            clearTimeout(timeout);
            this.attachConnectionHandlers(connection);
            resolve(connection);
          });
          connection.on("error", () => {
            clearTimeout(timeout);
            reject(new Error(`Unable to connect peer ${remotePeerId} via ${this.url}`));
          });
        });
      }
      onMessage(handler) {
        if (this.fallbackProvider) {
          this.fallbackProvider.onMessage(handler);
          return;
        }
        this.messageHandlers.add(handler);
      }
      async send(message) {
        if (this.fallbackProvider) {
          await this.fallbackProvider.send(message);
          return;
        }
        if (!this.peer) {
          throw new Error(`Signaling socket is not open for ${this.url}`);
        }
        if (message && message.to) {
          const connection = await this.openConnection(message.to);
          connection.send(message);
          return;
        }
        for (const connection of this.connections.values()) {
          if (connection.open) {
            connection.send(message);
          }
        }
      }
      async disconnect() {
        if (this.fallbackProvider) {
          await this.fallbackProvider.disconnect();
          this.fallbackProvider = null;
          return;
        }
        for (const connection of this.connections.values()) {
          if (typeof connection.close === "function") {
            connection.close();
          }
        }
        this.connections.clear();
        if (this.peer && typeof this.peer.destroy === "function") {
          this.peer.destroy();
        }
        this.peer = null;
        this.peerId = null;
      }
    };
    module.exports = PeerJSSignalingProvider;
  }
});

// src/signaling/default-signaling-config.js
var require_default_signaling_config = __commonJS({
  "src/signaling/default-signaling-config.js"(exports, module) {
    var DEFAULT_CLOUDFLARE_SIGNALING_URLS = [
      "wss://peerjs.92k.de/peerjs?key=peerjs",
      "wss://0.peerjs.com/peerjs?key=peerjs"
    ];
    var DEFAULT_SIGNALING_FALLBACK_URLS = [
      "wss://relay.dignity.dev/signaling",
      "wss://backup-relay.dignity.dev/signaling"
    ];
    module.exports = {
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS
    };
  }
});

// src/signaling/create-default-signaling-pool.js
var require_create_default_signaling_pool = __commonJS({
  "src/signaling/create-default-signaling-pool.js"(exports, module) {
    var SignalingPool = require_signaling_pool();
    var WebSocketSignalingProvider = require_websocket_signaling_provider();
    var PeerJSSignalingProvider = require_peerjs_signaling_provider();
    var {
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS
    } = require_default_signaling_config();
    function createDefaultSignalingPool(options = {}) {
      const cloudflareUrls = options.cloudflareUrls || DEFAULT_CLOUDFLARE_SIGNALING_URLS;
      const fallbackUrls = options.fallbackUrls || DEFAULT_SIGNALING_FALLBACK_URLS;
      const WebSocketImpl = options.WebSocketImpl;
      const providers = [];
      cloudflareUrls.forEach((url, index) => {
        const usePeerJsProvider = /^wss:\/\/(peerjs\.92k\.de|0\.peerjs\.com)(\/|$)/.test(url);
        const ProviderClass = usePeerJsProvider ? PeerJSSignalingProvider : WebSocketSignalingProvider;
        providers.push(
          new ProviderClass({
            id: `cloudflare-${index + 1}`,
            url,
            WebSocketImpl,
            priority: index
          })
        );
      });
      fallbackUrls.forEach((url, index) => {
        providers.push(
          new WebSocketSignalingProvider({
            id: `fallback-${index + 1}`,
            url,
            WebSocketImpl,
            priority: cloudflareUrls.length + index
          })
        );
      });
      if (Array.isArray(options.customProviders)) {
        providers.push(...options.customProviders);
      }
      return new SignalingPool(providers);
    }
    module.exports = createDefaultSignalingPool;
  }
});

// src/network/in-memory-network.js
var require_in_memory_network = __commonJS({
  "src/network/in-memory-network.js"(exports, module) {
    var InMemoryNetworkHub = class {
      constructor() {
        this.adapters = /* @__PURE__ */ new Map();
      }
      register(adapter) {
        this.adapters.set(adapter.nodeId, adapter);
      }
      unregister(nodeId) {
        this.adapters.delete(nodeId);
      }
      async broadcast(senderId, message) {
        const deliveries = [];
        for (const [nodeId, adapter] of this.adapters.entries()) {
          if (nodeId !== senderId) {
            deliveries.push(adapter.receive(message));
          }
        }
        await Promise.all(deliveries);
      }
      async sendToPeers(senderId, message, peerIds = []) {
        const targets = new Set((peerIds || []).filter((peerId) => peerId && peerId !== senderId));
        const deliveries = [];
        for (const [nodeId, adapter] of this.adapters.entries()) {
          if (nodeId !== senderId && targets.has(nodeId)) {
            deliveries.push(adapter.receive(message));
          }
        }
        await Promise.all(deliveries);
      }
    };
    var InMemoryNetworkAdapter = class {
      constructor(hub) {
        if (!hub) {
          throw new Error("InMemoryNetworkAdapter requires an InMemoryNetworkHub");
        }
        this.hub = hub;
        this.nodeId = null;
        this.messageHandlers = /* @__PURE__ */ new Set();
        this.connectedPeers = /* @__PURE__ */ new Set();
      }
      async start(nodeId) {
        this.nodeId = nodeId;
        this.hub.register(this);
      }
      async stop() {
        if (this.nodeId) {
          this.hub.unregister(this.nodeId);
        }
        this.nodeId = null;
        this.connectedPeers.clear();
      }
      async connectToPeer(remotePeerId) {
        if (!remotePeerId || remotePeerId === this.nodeId) {
          return;
        }
        this.connectedPeers.add(remotePeerId);
      }
      async broadcast(message) {
        if (!this.nodeId) {
          throw new Error("Network adapter has not been started");
        }
        await this.hub.broadcast(this.nodeId, message);
      }
      async sendToPeers(message, peerIds = []) {
        if (!this.nodeId) {
          throw new Error("Network adapter has not been started");
        }
        await this.hub.sendToPeers(this.nodeId, message, peerIds);
      }
      listOpenPeerIds() {
        return [...this.connectedPeers];
      }
      getOpenConnectionCount() {
        return this.connectedPeers.size;
      }
      isConnectedTo(remotePeerId) {
        return this.connectedPeers.has(remotePeerId);
      }
      onMessage(handler) {
        this.messageHandlers.add(handler);
      }
      offMessage(handler) {
        this.messageHandlers.delete(handler);
      }
      async receive(message) {
        const deliveries = [];
        for (const handler of this.messageHandlers) {
          deliveries.push(handler(message));
        }
        await Promise.all(deliveries);
      }
    };
    module.exports = {
      InMemoryNetworkHub,
      InMemoryNetworkAdapter
    };
  }
});

// src/network/peerjs-network.js
var require_peerjs_network = __commonJS({
  "src/network/peerjs-network.js"(exports, module) {
    var { DEFAULT_CLOUDFLARE_SIGNALING_URLS } = require_default_signaling_config();
    var parsePeerJsServerUrl = require_parse_peerjs_url();
    function resolvePeerImplementation(PeerImpl) {
      if (PeerImpl) {
        return PeerImpl;
      }
      try {
        const peerjs = require_bundler();
        return peerjs.Peer || peerjs;
      } catch (error) {
        return null;
      }
    }
    var PeerJSNetworkAdapter = class {
      constructor({
        url,
        urls,
        PeerImpl,
        connectTimeoutMs = 12e3,
        iceServers = null,
        peerOptions = null
      } = {}) {
        this.urls = urls || (url ? [url] : [...DEFAULT_CLOUDFLARE_SIGNALING_URLS]);
        this.url = this.urls[0];
        this.PeerImpl = resolvePeerImplementation(PeerImpl);
        this.connectTimeoutMs = connectTimeoutMs;
        this.iceServers = iceServers;
        this.peerOptions = peerOptions;
        this.nodeId = null;
        this.peer = null;
        this.connections = /* @__PURE__ */ new Map();
        this.pendingConnections = /* @__PURE__ */ new Map();
        this.messageHandlers = /* @__PURE__ */ new Set();
      }
      async start(nodeId) {
        if (!nodeId) {
          throw new Error("PeerJSNetworkAdapter requires nodeId on start");
        }
        if (!this.PeerImpl) {
          throw new Error("PeerJS implementation is not available");
        }
        if (this.peer) {
          await this.stop();
        }
        let lastError;
        for (const candidateUrl of this.urls) {
          try {
            await this.startWithUrl(nodeId, candidateUrl);
            this.url = candidateUrl;
            return;
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError || new Error("Unable to connect PeerJS network adapter");
      }
      async startWithUrl(nodeId, url) {
        this.nodeId = nodeId;
        const server = parsePeerJsServerUrl(url);
        await new Promise((resolve, reject) => {
          const peerConfig = {
            host: server.host,
            port: server.port,
            path: server.path,
            secure: server.secure,
            key: server.key,
            ...this.peerOptions && typeof this.peerOptions === "object" ? this.peerOptions : {}
          };
          if (Array.isArray(this.iceServers) && this.iceServers.length > 0) {
            peerConfig.config = {
              ...peerConfig.config && typeof peerConfig.config === "object" ? peerConfig.config : {},
              iceServers: this.iceServers
            };
          }
          const peer = new this.PeerImpl(nodeId, peerConfig);
          const timeout = setTimeout(() => {
            peer.destroy?.();
            reject(new Error(`Unable to connect PeerJS network adapter to ${url}`));
          }, this.connectTimeoutMs);
          peer.on("open", () => {
            clearTimeout(timeout);
            this.peer = peer;
            resolve();
          });
          peer.on("connection", (connection) => {
            this.attachConnectionHandlers(connection);
          });
          peer.on("error", (error) => {
            clearTimeout(timeout);
            peer.destroy?.();
            reject(error || new Error(`Unable to connect PeerJS network adapter to ${url}`));
          });
        });
      }
      attachConnectionHandlers(connection) {
        const remoteId = connection.peer;
        if (!remoteId) {
          return;
        }
        this.connections.set(remoteId, connection);
        connection.on("data", (payload) => {
          const deliveries = [];
          for (const handler of this.messageHandlers) {
            deliveries.push(handler(payload));
          }
          return Promise.all(deliveries);
        });
        connection.on("close", () => {
          this.connections.delete(remoteId);
        });
      }
      async connectToPeer(remotePeerId) {
        if (!remotePeerId || remotePeerId === this.nodeId) {
          return null;
        }
        const existing = this.connections.get(remotePeerId);
        if (existing && existing.open) {
          return existing;
        }
        if (this.pendingConnections.has(remotePeerId)) {
          return this.pendingConnections.get(remotePeerId);
        }
        if (!this.peer) {
          throw new Error("PeerJS network adapter has not been started");
        }
        const pending = new Promise((resolve, reject) => {
          const connection = this.peer.connect(remotePeerId, {
            reliable: true,
            serialization: "json"
          });
          const timeout = setTimeout(() => {
            reject(new Error(`Unable to connect to peer ${remotePeerId}`));
          }, this.connectTimeoutMs);
          connection.on("open", () => {
            clearTimeout(timeout);
            this.attachConnectionHandlers(connection);
            resolve(connection);
          });
          connection.on("error", () => {
            clearTimeout(timeout);
            reject(new Error(`Unable to connect to peer ${remotePeerId}`));
          });
        }).finally(() => {
          this.pendingConnections.delete(remotePeerId);
        });
        this.pendingConnections.set(remotePeerId, pending);
        return pending;
      }
      onMessage(handler) {
        this.messageHandlers.add(handler);
      }
      offMessage(handler) {
        this.messageHandlers.delete(handler);
      }
      async broadcast(message) {
        if (!this.peer) {
          throw new Error("PeerJS network adapter has not been started");
        }
        const deliveries = [];
        for (const connection of this.connections.values()) {
          if (connection.open) {
            deliveries.push(connection.send(message));
          }
        }
        await Promise.all(deliveries);
      }
      async sendToPeers(message, peerIds = []) {
        if (!this.peer) {
          throw new Error("PeerJS network adapter has not been started");
        }
        const targets = new Set((peerIds || []).filter(Boolean));
        if (targets.size === 0) {
          return;
        }
        const deliveries = [];
        for (const [peerId, connection] of this.connections.entries()) {
          if (targets.has(peerId) && connection.open) {
            deliveries.push(connection.send(message));
          }
        }
        await Promise.all(deliveries);
      }
      async disconnectPeer(remotePeerId) {
        const connection = this.connections.get(remotePeerId);
        if (connection && typeof connection.close === "function") {
          connection.close();
        }
        this.connections.delete(remotePeerId);
      }
      getOpenConnectionCount() {
        return this.listOpenPeerIds().length;
      }
      listOpenPeerIds() {
        const ids = [];
        for (const [peerId, connection] of this.connections.entries()) {
          if (connection.open) {
            ids.push(peerId);
          }
        }
        return ids;
      }
      isConnectedTo(remotePeerId) {
        const connection = this.connections.get(remotePeerId);
        return Boolean(connection && connection.open);
      }
      async stop() {
        for (const connection of this.connections.values()) {
          if (typeof connection.close === "function") {
            connection.close();
          }
        }
        this.connections.clear();
        this.pendingConnections.clear();
        if (this.peer && typeof this.peer.destroy === "function") {
          this.peer.destroy();
        }
        this.peer = null;
        this.nodeId = null;
      }
    };
    function createPeerJSNetworkAdapter(options = {}) {
      return new PeerJSNetworkAdapter(options);
    }
    module.exports = {
      PeerJSNetworkAdapter,
      createPeerJSNetworkAdapter,
      parsePeerJsServerUrl
    };
  }
});

// src/persistence/indexeddb-persistence.js
var require_indexeddb_persistence = __commonJS({
  "src/persistence/indexeddb-persistence.js"(exports, module) {
    var IndexedDBPersistence = class {
      constructor({
        dbName = "dignity",
        storeName = "records",
        collections = null,
        indexedDB = typeof globalThis !== "undefined" ? globalThis.indexedDB : null
      } = {}) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.collections = collections;
        this.indexedDB = indexedDB;
        this.node = null;
        this.changeHandler = null;
      }
      recordKey(collection, id) {
        return `${collection}:${id}`;
      }
      shouldPersist(collection) {
        if (!this.collections) {
          return true;
        }
        return this.collections.includes(collection);
      }
      openDb() {
        if (!this.indexedDB) {
          return Promise.reject(new Error("IndexedDB is not available"));
        }
        return new Promise((resolve, reject) => {
          const request = this.indexedDB.open(this.dbName, 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
              db.createObjectStore(this.storeName, { keyPath: "key" });
            }
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error || new Error("Unable to open IndexedDB"));
        });
      }
      runTransaction(mode, handler) {
        return this.openDb().then((db) => new Promise((resolve, reject) => {
          const transaction = db.transaction(this.storeName, mode);
          const store = transaction.objectStore(this.storeName);
          Promise.resolve(handler(store)).then(resolve).catch(reject);
          transaction.oncomplete = () => db.close();
          transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
          transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
        }));
      }
      serializeRecord(collection, id) {
        const record = this.node.getCollection(collection).get(id);
        if (!record) {
          return null;
        }
        return {
          key: this.recordKey(collection, id),
          collection,
          id,
          ownerId: record.ownerId,
          collaboratorIds: Array.isArray(record.collaboratorIds) ? [...record.collaboratorIds] : [],
          data: { ...record.data },
          hash: record.hash || null,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: record.deletedAt,
          version: record.version
        };
      }
      async persistRecord(collection, id) {
        if (!this.node || !this.shouldPersist(collection)) {
          return;
        }
        const serialized = this.serializeRecord(collection, id);
        const key = this.recordKey(collection, id);
        if (!serialized) {
          await this.runTransaction("readwrite", (store) => new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          }));
          return;
        }
        await this.runTransaction("readwrite", (store) => new Promise((resolve, reject) => {
          const request = store.put(serialized);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }));
      }
      persistChange(event) {
        if (!event || !event.collection || !event.id) {
          return;
        }
        this.persistRecord(event.collection, event.id).catch((error) => {
          this.node.emit("warning", {
            type: "persistence-failed",
            collection: event.collection,
            id: event.id,
            error
          });
        });
      }
      async loadAllRecords() {
        return this.runTransaction("readonly", (store) => new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }));
      }
      async hydrate() {
        if (!this.node) {
          throw new Error("IndexedDBPersistence requires an attached node before hydrate");
        }
        const storedRecords = await this.loadAllRecords();
        for (const stored of storedRecords) {
          if (!this.shouldPersist(stored.collection)) {
            continue;
          }
          this.node.restoreRecord(stored.collection, {
            id: stored.id,
            ownerId: stored.ownerId,
            collaboratorIds: stored.collaboratorIds,
            data: stored.data,
            hash: stored.hash || null,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
            deletedAt: stored.deletedAt,
            version: stored.version
          });
        }
      }
      async attach(node) {
        if (!node) {
          throw new Error("IndexedDBPersistence.attach requires a DignityP2P node");
        }
        this.node = node;
        await this.hydrate();
        this.changeHandler = (event) => this.persistChange(event);
        node.on("change", this.changeHandler);
      }
      async detach() {
        if (this.node && this.changeHandler) {
          this.node.off("change", this.changeHandler);
        }
        this.changeHandler = null;
        this.node = null;
      }
      async clear() {
        await this.runTransaction("readwrite", (store) => new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }));
      }
    };
    module.exports = IndexedDBPersistence;
  }
});

// src/security/bip39-english.js
var require_bip39_english = __commonJS({
  "src/security/bip39-english.js"(exports, module) {
    module.exports = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology", "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body", "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss", "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy", "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call", "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry", "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century", "cereal", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "chase", "chat", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "close", "cloth", "cloud", "clown", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut", "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "congress", "connect", "consider", "control", "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct", "cost", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture", "cup", "cupboard", "curious", "current", "curtain", "curve", "cushion", "custom", "cute", "cycle", "dad", "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day", "deal", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer", "defense", "define", "defy", "degree", "delay", "deliver", "demand", "demise", "denial", "dentist", "deny", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "desk", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial", "diamond", "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display", "distance", "divert", "divide", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin", "domain", "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon", "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive", "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty", "dwarf", "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy", "echo", "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "era", "erase", "erode", "erosion", "error", "erupt", "escape", "essay", "essence", "estate", "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exit", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eye", "eyebrow", "fabric", "face", "faculty", "fade", "faint", "faith", "fall", "false", "fame", "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fat", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel", "female", "fence", "festival", "fetch", "fever", "few", "fiber", "fiction", "field", "figure", "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm", "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat", "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush", "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force", "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown", "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain", "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas", "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow", "glue", "goat", "goddess", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern", "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide", "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand", "happy", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero", "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold", "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse", "hospital", "host", "hotel", "hour", "hover", "hub", "huge", "human", "humble", "humor", "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice", "icon", "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island", "isolate", "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans", "jelly", "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jump", "jungle", "junior", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick", "kid", "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kitten", "kiwi", "knee", "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake", "lamp", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law", "lawn", "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "leave", "lecture", "left", "leg", "legal", "legend", "leisure", "lemon", "lend", "length", "lens", "leopard", "lesson", "letter", "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like", "limb", "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load", "loan", "lobster", "local", "lock", "logic", "lonely", "long", "loop", "lottery", "loud", "lounge", "love", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine", "mad", "magic", "magnet", "maid", "mail", "main", "major", "make", "mammal", "man", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine", "market", "marriage", "mask", "mass", "master", "match", "material", "math", "matrix", "matter", "maximum", "maze", "meadow", "mean", "measure", "meat", "mechanic", "medal", "media", "melody", "melt", "member", "memory", "mention", "menu", "mercy", "merge", "merit", "merry", "mesh", "message", "metal", "method", "middle", "midnight", "milk", "million", "mimic", "mind", "minimum", "minor", "minute", "miracle", "mirror", "misery", "miss", "mistake", "mix", "mixed", "mixture", "mobile", "model", "modify", "mom", "moment", "monitor", "monkey", "monster", "month", "moon", "moral", "more", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse", "move", "movie", "much", "muffin", "mule", "multiply", "muscle", "museum", "mushroom", "music", "must", "mutual", "myself", "mystery", "myth", "naive", "name", "napkin", "narrow", "nasty", "nation", "nature", "near", "neck", "need", "negative", "neglect", "neither", "nephew", "nerve", "nest", "net", "network", "neutral", "never", "news", "next", "nice", "night", "noble", "noise", "nominee", "noodle", "normal", "north", "nose", "notable", "note", "nothing", "notice", "novel", "now", "nuclear", "number", "nurse", "nut", "oak", "obey", "object", "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "odor", "off", "offer", "office", "often", "oil", "okay", "old", "olive", "olympic", "omit", "once", "one", "onion", "online", "only", "open", "opera", "opinion", "oppose", "option", "orange", "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor", "outer", "output", "outside", "oval", "oven", "over", "own", "owner", "oxygen", "oyster", "ozone", "pact", "paddle", "page", "pair", "palace", "palm", "panda", "panel", "panic", "panther", "paper", "parade", "parent", "park", "parrot", "party", "pass", "patch", "path", "patient", "patrol", "pattern", "pause", "pave", "payment", "peace", "peanut", "pear", "peasant", "pelican", "pen", "penalty", "pencil", "people", "pepper", "perfect", "permit", "person", "pet", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pig", "pigeon", "pill", "pilot", "pink", "pioneer", "pipe", "pistol", "pitch", "pizza", "place", "planet", "plastic", "plate", "play", "please", "pledge", "pluck", "plug", "plunge", "poem", "poet", "point", "polar", "pole", "police", "pond", "pony", "pool", "popular", "portion", "position", "possible", "post", "potato", "pottery", "poverty", "powder", "power", "practice", "praise", "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote", "proof", "property", "prosper", "protect", "proud", "provide", "public", "pudding", "pull", "pulp", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purpose", "purse", "push", "put", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quit", "quiz", "quote", "rabbit", "raccoon", "race", "rack", "radar", "radio", "rail", "rain", "raise", "rally", "ramp", "ranch", "random", "range", "rapid", "rare", "rate", "rather", "raven", "raw", "razor", "ready", "real", "reason", "rebel", "rebuild", "recall", "receive", "recipe", "record", "recycle", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject", "relax", "release", "relief", "rely", "remain", "remember", "remind", "remove", "render", "renew", "rent", "reopen", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist", "resource", "response", "result", "retire", "retreat", "return", "reunion", "reveal", "review", "reward", "rhythm", "rib", "ribbon", "rice", "rich", "ride", "ridge", "rifle", "right", "rigid", "ring", "riot", "ripple", "risk", "ritual", "rival", "river", "road", "roast", "robot", "robust", "rocket", "romance", "roof", "rookie", "room", "rose", "rotate", "rough", "round", "route", "royal", "rubber", "rude", "rug", "rule", "run", "runway", "rural", "sad", "saddle", "sadness", "safe", "sail", "salad", "salmon", "salon", "salt", "salute", "same", "sample", "sand", "satisfy", "satoshi", "sauce", "sausage", "save", "say", "scale", "scan", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "scrap", "screen", "script", "scrub", "sea", "search", "season", "seat", "second", "secret", "section", "security", "seed", "seek", "segment", "select", "sell", "seminar", "senior", "sense", "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share", "shed", "shell", "sheriff", "shield", "shift", "shine", "ship", "shiver", "shock", "shoe", "shoot", "shop", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "shy", "sibling", "sick", "side", "siege", "sight", "sign", "silent", "silk", "silly", "silver", "similar", "simple", "since", "sing", "siren", "sister", "situate", "six", "size", "skate", "sketch", "ski", "skill", "skin", "skirt", "skull", "slab", "slam", "sleep", "slender", "slice", "slide", "slight", "slim", "slogan", "slot", "slow", "slush", "small", "smart", "smile", "smoke", "smooth", "snack", "snake", "snap", "sniff", "snow", "soap", "soccer", "social", "sock", "soda", "soft", "solar", "soldier", "solid", "solution", "solve", "someone", "song", "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "space", "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider", "spike", "spin", "spirit", "split", "spoil", "sponsor", "spoon", "sport", "spot", "spray", "spread", "spring", "spy", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage", "stairs", "stamp", "stand", "start", "state", "stay", "steak", "steel", "stem", "step", "stereo", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject", "submit", "subway", "success", "such", "sudden", "suffer", "sugar", "suggest", "suit", "summer", "sun", "sunny", "sunset", "super", "supply", "supreme", "sure", "surface", "surge", "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swap", "swarm", "swear", "sweet", "swift", "swim", "swing", "switch", "sword", "symbol", "symptom", "syrup", "system", "table", "tackle", "tag", "tail", "talent", "talk", "tank", "tape", "target", "task", "taste", "tattoo", "taxi", "teach", "team", "tell", "ten", "tenant", "tennis", "tent", "term", "test", "text", "thank", "that", "theme", "then", "theory", "there", "they", "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tide", "tiger", "tilt", "timber", "time", "tiny", "tip", "tired", "tissue", "title", "toast", "tobacco", "today", "toddler", "toe", "together", "toilet", "token", "tomato", "tomorrow", "tone", "tongue", "tonight", "tool", "tooth", "top", "topic", "topple", "torch", "tornado", "tortoise", "toss", "total", "tourist", "toward", "tower", "town", "toy", "track", "trade", "traffic", "tragic", "train", "transfer", "trap", "trash", "travel", "tray", "treat", "tree", "trend", "trial", "tribe", "trick", "trigger", "trim", "trip", "trophy", "trouble", "truck", "true", "truly", "trumpet", "trust", "truth", "try", "tube", "tuition", "tumble", "tuna", "tunnel", "turkey", "turn", "turtle", "twelve", "twenty", "twice", "twin", "twist", "two", "type", "typical", "ugly", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "undo", "unfair", "unfold", "unhappy", "uniform", "unique", "unit", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update", "upgrade", "uphold", "upon", "upper", "upset", "urban", "urge", "usage", "use", "used", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve", "van", "vanish", "vapor", "various", "vast", "vault", "vehicle", "velvet", "vendor", "venture", "venue", "verb", "verify", "version", "very", "vessel", "veteran", "viable", "vibrant", "vicious", "victory", "video", "view", "village", "vintage", "violin", "virtual", "virus", "visa", "visit", "visual", "vital", "vivid", "vocal", "voice", "void", "volcano", "volume", "vote", "voyage", "wage", "wagon", "wait", "walk", "wall", "walnut", "want", "warfare", "warm", "warrior", "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon", "wear", "weasel", "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet", "whale", "what", "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width", "wife", "wild", "will", "win", "window", "wine", "wing", "wink", "winner", "winter", "wire", "wisdom", "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool", "word", "work", "world", "worry", "worth", "wrap", "wreck", "wrestle", "wrist", "write", "wrong", "yard", "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone", "zoo"];
  }
});

// src/security/identity-mnemonic.js
var require_identity_mnemonic = __commonJS({
  "src/security/identity-mnemonic.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var BIP39_ENGLISH = require_bip39_english();
    var { deriveBroadcastKey, DEFAULT_SECURITY_OPTIONS } = require_message_security_service();
    var EXPORT_PAYLOAD_LENGTH = 64;
    var MNEMONIC_WORD_COUNT = 48;
    var ENCRYPTED_KIND = "dignity-identity-mnemonic-v1";
    var ENCRYPTED_PREFIX = "dignity-mnemonic-enc-v1:";
    var WORD_INDEX = new Map(BIP39_ENGLISH.map((word, index) => [word, index]));
    function bytesToBinary(bytes) {
      return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join("");
    }
    function binaryToBytes(binary) {
      if (binary.length % 8 !== 0) {
        throw new Error("Invalid mnemonic binary length");
      }
      const bytes = new Uint8Array(binary.length / 8);
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = parseInt(binary.slice(index * 8, (index + 1) * 8), 2);
      }
      return bytes;
    }
    async function sha256(bytes) {
      const subtle = globalThis.crypto && globalThis.crypto.subtle;
      if (!subtle) {
        throw new Error("SHA-256 requires Web Crypto (crypto.subtle)");
      }
      return new Uint8Array(await subtle.digest("SHA-256", bytes));
    }
    function normalizeUnicode(value) {
      const text = String(value || "");
      return typeof text.normalize === "function" ? text.normalize("NFC") : text;
    }
    function normalizeMnemonicPhrase(phrase) {
      return normalizeUnicode(phrase).trim().toLowerCase().split(/\s+/).filter(Boolean);
    }
    function assertKeyPair(keyPair) {
      if (!keyPair || !keyPair.signing || !keyPair.encryption || !(keyPair.signing.secretKey instanceof Uint8Array) || !(keyPair.encryption.secretKey instanceof Uint8Array)) {
        throw new Error("exportIdentityMnemonic requires a keyPair with signing and encryption secret keys");
      }
      if (keyPair.signing.secretKey.length < 32 || keyPair.encryption.secretKey.length !== 32) {
        throw new Error("exportIdentityMnemonic requires 32-byte Ed25519 seed and Curve25519 secret");
      }
    }
    function exportPayloadFromKeyPair(keyPair) {
      assertKeyPair(keyPair);
      const payload = new Uint8Array(EXPORT_PAYLOAD_LENGTH);
      payload.set(keyPair.signing.secretKey.slice(0, 32), 0);
      payload.set(keyPair.encryption.secretKey, 32);
      return payload;
    }
    function keyPairFromExportPayload(payload) {
      if (!(payload instanceof Uint8Array) || payload.length !== EXPORT_PAYLOAD_LENGTH) {
        throw new Error("Invalid identity export payload");
      }
      return {
        signing: nacl.sign.keyPair.fromSeed(payload.slice(0, 32)),
        encryption: nacl.box.keyPair.fromSecretKey(payload.slice(32, 64))
      };
    }
    async function encodeMnemonicPhrase(payload) {
      if (!(payload instanceof Uint8Array) || payload.length !== EXPORT_PAYLOAD_LENGTH) {
        throw new Error("Invalid identity export payload");
      }
      const entropyBits = payload.length * 8;
      const digest = await sha256(payload);
      const checksumBits = bytesToBinary(digest).slice(0, entropyBits / 32);
      const bits = `${bytesToBinary(payload)}${checksumBits}`;
      const words = [];
      for (let index = 0; index < bits.length; index += 11) {
        const wordIndex = parseInt(bits.slice(index, index + 11), 2);
        const word = BIP39_ENGLISH[wordIndex];
        if (!word) {
          throw new Error("Failed to encode identity mnemonic");
        }
        words.push(word);
      }
      return words;
    }
    async function decodeMnemonicPhrase(wordsOrPhrase) {
      const normalized = Array.isArray(wordsOrPhrase) ? normalizeMnemonicPhrase(wordsOrPhrase.join(" ")) : normalizeMnemonicPhrase(wordsOrPhrase);
      if (normalized.length !== MNEMONIC_WORD_COUNT) {
        throw new Error(`Recovery phrase must contain exactly ${MNEMONIC_WORD_COUNT} words`);
      }
      let bits = "";
      for (const word of normalized) {
        const wordIndex = WORD_INDEX.get(word);
        if (wordIndex === void 0) {
          throw new Error(`Unknown recovery word: ${word}`);
        }
        bits += wordIndex.toString(2).padStart(11, "0");
      }
      const entropyBits = EXPORT_PAYLOAD_LENGTH * 8;
      const checksumBits = entropyBits / 32;
      const entropyBinary = bits.slice(0, entropyBits);
      const checksumBinary = bits.slice(entropyBits, entropyBits + checksumBits);
      const payload = binaryToBytes(entropyBinary);
      const digest = await sha256(payload);
      const expectedChecksum = bytesToBinary(digest).slice(0, checksumBits);
      if (checksumBinary !== expectedChecksum) {
        throw new Error("Invalid recovery phrase checksum");
      }
      return payload;
    }
    async function exportIdentityMnemonic(keyPair) {
      const words = await encodeMnemonicPhrase(exportPayloadFromKeyPair(keyPair));
      return words.join(" ");
    }
    async function importIdentityMnemonic(phrase) {
      const payload = await decodeMnemonicPhrase(phrase);
      return keyPairFromExportPayload(payload);
    }
    function resolveEncryptedPassphrase(options = {}) {
      const passphrase = options.passphrase;
      if (!passphrase || typeof passphrase !== "string") {
        throw new Error("Encrypted mnemonic helpers require passphrase");
      }
      return passphrase;
    }
    function resolveKdfIterations(options = {}) {
      if (typeof options.kdfIterations === "number") {
        if (!Number.isInteger(options.kdfIterations) || options.kdfIterations < 1) {
          throw new Error("kdfIterations must be a positive integer");
        }
        return options.kdfIterations;
      }
      return DEFAULT_SECURITY_OPTIONS.kdfIterations;
    }
    async function exportIdentityMnemonicEncrypted(keyPair, options = {}) {
      const passphrase = resolveEncryptedPassphrase(options);
      const kdfIterations = resolveKdfIterations(options);
      const payload = exportPayloadFromKeyPair(keyPair);
      const salt = nacl.randomBytes(16);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const key = await deriveBroadcastKey(passphrase, salt, kdfIterations);
      const ciphertext = nacl.secretbox(payload, nonce, key);
      if (!ciphertext) {
        throw new Error("Failed to encrypt identity mnemonic payload");
      }
      const envelope = {
        kind: ENCRYPTED_KIND,
        kdfIterations,
        salt: naclUtil.encodeBase64(salt),
        nonce: naclUtil.encodeBase64(nonce),
        ciphertext: naclUtil.encodeBase64(ciphertext)
      };
      return `${ENCRYPTED_PREFIX}${naclUtil.encodeBase64(naclUtil.decodeUTF8(JSON.stringify(envelope)))}`;
    }
    async function importIdentityMnemonicEncrypted(encrypted, options = {}) {
      const passphrase = resolveEncryptedPassphrase(options);
      if (!encrypted || typeof encrypted !== "string") {
        throw new Error("importIdentityMnemonicEncrypted requires an encrypted blob string");
      }
      let json;
      if (encrypted.startsWith(ENCRYPTED_PREFIX)) {
        json = naclUtil.encodeUTF8(naclUtil.decodeBase64(encrypted.slice(ENCRYPTED_PREFIX.length)));
      } else {
        json = encrypted;
      }
      let envelope;
      try {
        envelope = JSON.parse(json);
      } catch (_error) {
        throw new Error("Invalid encrypted identity mnemonic blob");
      }
      if (!envelope || envelope.kind !== ENCRYPTED_KIND) {
        throw new Error("Unsupported encrypted identity mnemonic kind");
      }
      const salt = naclUtil.decodeBase64(envelope.salt);
      const nonce = naclUtil.decodeBase64(envelope.nonce);
      const ciphertext = naclUtil.decodeBase64(envelope.ciphertext);
      const kdfIterations = typeof envelope.kdfIterations === "number" ? envelope.kdfIterations : DEFAULT_SECURITY_OPTIONS.kdfIterations;
      const key = await deriveBroadcastKey(passphrase, salt, kdfIterations);
      const payload = nacl.secretbox.open(ciphertext, nonce, key);
      if (!payload) {
        throw new Error("Failed to decrypt identity mnemonic (wrong passphrase or tampered blob)");
      }
      return keyPairFromExportPayload(payload);
    }
    module.exports = {
      EXPORT_PAYLOAD_LENGTH,
      MNEMONIC_WORD_COUNT,
      ENCRYPTED_KIND,
      ENCRYPTED_PREFIX,
      normalizeMnemonicPhrase,
      encodeMnemonicPhrase,
      decodeMnemonicPhrase,
      exportIdentityMnemonic,
      importIdentityMnemonic,
      exportIdentityMnemonicEncrypted,
      importIdentityMnemonicEncrypted
    };
  }
});

// src/cqrs/query-replica.js
var require_query_replica = __commonJS({
  "src/cqrs/query-replica.js"(exports, module) {
    var EventEmitter = require_event_emitter();
    var {
      createEmptyView,
      applyDomainEventToView,
      verifyEventChain,
      verifyDomainEvent,
      DOMAIN_EVENT_SCHEMA_VERSION
    } = require_domain_events();
    var DignityQueryReplica = class extends EventEmitter {
      constructor(dignityP2P, { groupId, collections = [], tierMode = "auto", publisherId = null } = {}) {
        super();
        if (!dignityP2P) {
          throw new Error("DignityQueryReplica requires dignityP2P");
        }
        if (!groupId) {
          throw new Error("DignityQueryReplica requires groupId");
        }
        this.dignity = dignityP2P;
        this.groupId = groupId;
        this.collections = [...collections];
        this.tierMode = tierMode;
        this.publisherId = publisherId;
        this.view = createEmptyView(this.collections);
        this.eventLog = [];
        this.started = false;
        this.boundDomainHandler = this.handleDomainEvent.bind(this);
        this.boundPeerGroupHandler = this.handlePeerGroupMessage.bind(this);
      }
      async start(options = {}) {
        if (this.started) {
          return this;
        }
        await this.dignity.joinPeerGroup(this.groupId, {
          tierMode: this.tierMode,
          role: "subscriber",
          commandCapable: false,
          domainEvents: true,
          publisherId: this.publisherId,
          liveCap: options.liveCap,
          bulkIntervalMs: options.bulkIntervalMs,
          bootstrapPeerIds: options.bootstrapPeerIds,
          metadata: { role: "subscriber", replica: true }
        });
        this.dignity.on("domainevent", this.boundDomainHandler);
        this.dignity.on("peergroupmessage", this.boundPeerGroupHandler);
        this.started = true;
        this.emit("started", { groupId: this.groupId });
        return this;
      }
      async stop() {
        if (!this.started) {
          return;
        }
        this.dignity.off("domainevent", this.boundDomainHandler);
        this.dignity.off("peergroupmessage", this.boundPeerGroupHandler);
        await this.dignity.leavePeerGroup(this.groupId);
        this.started = false;
        this.emit("stopped", { groupId: this.groupId });
      }
      handleDomainEvent(event) {
        if (!event || event.groupId !== this.groupId) {
          return;
        }
        if (this.publisherId && event.publisherId !== this.publisherId) {
          return;
        }
        this.ingestEvent(event);
      }
      handlePeerGroupMessage(message) {
        if (!message || message.groupId !== this.groupId) {
          return;
        }
        if (message.type === "domain:checkpoint") {
          this.emit("checkpoint", message.payload);
        }
      }
      ingestEvent(event, { skipChainCheck = false } = {}) {
        const verified = verifyDomainEvent(event, {
          supportedVersions: [DOMAIN_EVENT_SCHEMA_VERSION]
        });
        if (!verified.ok) {
          this.emit("warning", { type: "domain-event-rejected", reason: verified.reason, event });
          return false;
        }
        if (this.dignity && typeof this.dignity.checkVerificationOnIngest === "function" && !this.dignity.checkVerificationOnIngest(event.collectionName, {
          verificationHash: event.verificationHash,
          verificationVersion: event.verificationVersion
        }, event.publisherId)) {
          return false;
        }
        if (!skipChainCheck && this.eventLog.length > 0) {
          const lastHash = this.eventLog[this.eventLog.length - 1].eventHash;
          if (event.prevHash !== lastHash) {
            this.emit("chainbroken", {
              groupId: this.groupId,
              expectedPrev: lastHash,
              actualPrev: event.prevHash,
              eventId: event.eventId
            });
            return false;
          }
        } else if (!skipChainCheck && this.eventLog.length === 0 && event.prevHash) {
          this.emit("chainbroken", {
            groupId: this.groupId,
            expectedPrev: null,
            actualPrev: event.prevHash,
            eventId: event.eventId
          });
          return false;
        }
        const duplicate = this.eventLog.some((entry) => entry.eventId === event.eventId);
        if (duplicate) {
          return false;
        }
        const result = applyDomainEventToView(this.view, event, {
          collectionsFilter: this.collections.length > 0 ? this.collections : null
        });
        if (result.applied || result.reason === "collection-filtered") {
          this.eventLog.push({ ...event });
          this.emit("change", { event, result });
          return true;
        }
        this.emit("warning", { type: "domain-event-not-applied", reason: result.reason, event });
        return false;
      }
      read(collectionName, id) {
        const collection = this.view.get(collectionName);
        if (!collection) {
          return null;
        }
        const record = collection.get(id);
        if (!record || record.deletedAt) {
          return null;
        }
        return { ...record, data: { ...record.data } };
      }
      list(collectionName, options = {}) {
        const collection = this.view.get(collectionName);
        if (!collection) {
          return [];
        }
        const includeDeleted = options.includeDeleted || false;
        const records = [];
        for (const record of collection.values()) {
          if (record.deletedAt && !includeDeleted) {
            continue;
          }
          if (record.deletedAt && includeDeleted) {
            records.push({
              id: record.id,
              ownerId: record.ownerId,
              deletedAt: record.deletedAt,
              version: record.version
            });
            continue;
          }
          records.push({ ...record, data: { ...record.data } });
        }
        return records;
      }
      verifyChain() {
        const result = verifyEventChain(this.eventLog);
        if (!result.ok) {
          this.emit("chainbroken", { groupId: this.groupId, ...result });
        }
        return result;
      }
      getViewStats() {
        const stats = {
          groupId: this.groupId,
          eventCount: this.eventLog.length,
          collections: {}
        };
        for (const [name, collection] of this.view.entries()) {
          let active = 0;
          let deleted = 0;
          for (const record of collection.values()) {
            if (record.deletedAt) {
              deleted += 1;
            } else {
              active += 1;
            }
          }
          stats.collections[name] = { active, deleted };
        }
        return stats;
      }
    };
    module.exports = DignityQueryReplica;
  }
});

// src/apps/manifest.js
var require_manifest = __commonJS({
  "src/apps/manifest.js"(exports, module) {
    var MANIFEST_SCHEMA_VERSION = 1;
    var ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
    var LOGIC_HASH_PATTERN = /^sha512:[0-9a-f]{128}$/;
    function isNonEmptyString(value) {
      return typeof value === "string" && value.trim().length > 0;
    }
    function validateOptionalSemver(value, fieldName) {
      if (value === void 0 || value === null || value === "") {
        return { ok: true, value: null };
      }
      if (!isNonEmptyString(value)) {
        return { ok: false, reason: `${fieldName} must be a semver string` };
      }
      try {
        const { parseSemver } = require_verification_code();
        parseSemver(value.trim());
        return { ok: true, value: value.trim() };
      } catch (error) {
        return { ok: false, reason: `${fieldName}: ${error.message}` };
      }
    }
    function validateOptionalLogicHash(value) {
      if (value === void 0 || value === null || value === "") {
        return { ok: true, value: null };
      }
      if (!isNonEmptyString(value) || !LOGIC_HASH_PATTERN.test(value.trim())) {
        return { ok: false, reason: "logicHash must match sha512:<128 hex chars>" };
      }
      return { ok: true, value: value.trim() };
    }
    function validateStoredCommand(command, index) {
      const prefix = `storedCommands[${index}]`;
      if (!command || typeof command !== "object") {
        return { ok: false, reason: `${prefix} must be an object` };
      }
      if (!isNonEmptyString(command.id)) {
        return { ok: false, reason: `${prefix}.id is required` };
      }
      if (!isNonEmptyString(command.collection)) {
        return { ok: false, reason: `${prefix}.collection is required` };
      }
      if (!["create", "update", "delete"].includes(command.kind)) {
        return { ok: false, reason: `${prefix}.kind must be create, update, or delete` };
      }
      if (command.allowedFields !== void 0) {
        if (!Array.isArray(command.allowedFields) || command.allowedFields.some((f) => !isNonEmptyString(f))) {
          return { ok: false, reason: `${prefix}.allowedFields must be a string array` };
        }
      }
      if (command.logicRef != null && command.logicRef !== "" && !isNonEmptyString(command.logicRef)) {
        return { ok: false, reason: `${prefix}.logicRef must be a non-empty string` };
      }
      const logicVersionResult = validateOptionalSemver(command.logicVersion, `${prefix}.logicVersion`);
      if (!logicVersionResult.ok) {
        return logicVersionResult;
      }
      const logicHashResult = validateOptionalLogicHash(command.logicHash);
      if (!logicHashResult.ok) {
        return { ok: false, reason: `${prefix}.${logicHashResult.reason}` };
      }
      if (logicVersionResult.value && !logicHashResult.value) {
        return { ok: false, reason: `${prefix}.logicHash is required when logicVersion is set` };
      }
      if (logicHashResult.value && !logicVersionResult.value) {
        return { ok: false, reason: `${prefix}.logicVersion is required when logicHash is set` };
      }
      return { ok: true, logicVersion: logicVersionResult.value, logicHash: logicHashResult.value };
    }
    function validateDignityAppManifest(raw) {
      if (!raw || typeof raw !== "object") {
        return { ok: false, reason: "manifest must be an object" };
      }
      if (raw.schemaVersion !== void 0 && raw.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
        return { ok: false, reason: `unsupported schemaVersion: ${raw.schemaVersion}` };
      }
      if (!isNonEmptyString(raw.id) || !ID_PATTERN.test(raw.id)) {
        return { ok: false, reason: "id must match [a-z0-9][a-z0-9._-]{0,63}" };
      }
      if (!isNonEmptyString(raw.title)) {
        return { ok: false, reason: "title is required" };
      }
      if (!Array.isArray(raw.collections) || raw.collections.length === 0) {
        return { ok: false, reason: "collections must be a non-empty string array" };
      }
      const collections = [];
      for (const name of raw.collections) {
        if (!isNonEmptyString(name)) {
          return { ok: false, reason: "collections entries must be non-empty strings" };
        }
        if (collections.includes(name)) {
          return { ok: false, reason: `duplicate collection: ${name}` };
        }
        collections.push(name.trim());
      }
      const storedCommands = Array.isArray(raw.storedCommands) ? raw.storedCommands : [];
      const storedLogicRaw = raw.storedLogic && typeof raw.storedLogic === "object" ? raw.storedLogic : {};
      const storedLogic = {};
      for (const [logicId, logicEntry] of Object.entries(storedLogicRaw)) {
        if (!logicEntry || typeof logicEntry !== "object") {
          return { ok: false, reason: `storedLogic.${logicId} must be an object` };
        }
        const logicVersionResult = validateOptionalSemver(logicEntry.version, `storedLogic.${logicId}.version`);
        if (!logicVersionResult.ok) {
          return logicVersionResult;
        }
        const logicHashResult2 = validateOptionalLogicHash(logicEntry.hash);
        if (!logicHashResult2.ok) {
          return { ok: false, reason: `storedLogic.${logicId}.${logicHashResult2.reason}` };
        }
        if (!logicVersionResult.value || !logicHashResult2.value) {
          return { ok: false, reason: `storedLogic.${logicId} requires version and hash` };
        }
        storedLogic[logicId] = {
          version: logicVersionResult.value,
          hash: logicHashResult2.value,
          validate: isNonEmptyString(logicEntry.validate) ? logicEntry.validate.trim() : null
        };
      }
      const normalizedCommands = [];
      for (let index = 0; index < storedCommands.length; index += 1) {
        const command = storedCommands[index];
        const result = validateStoredCommand(command, index);
        if (!result.ok) {
          return result;
        }
        if (command.logicRef) {
          if (!storedLogic[command.logicRef]) {
            return { ok: false, reason: `storedCommands[${index}] references unknown logicRef: ${command.logicRef}` };
          }
        }
        const collection = command.collection;
        if (!collections.includes(collection)) {
          return {
            ok: false,
            reason: `storedCommands[${index}] references undeclared collection: ${collection}`
          };
        }
        normalizedCommands.push({
          id: command.id.trim(),
          collection: collection.trim(),
          kind: command.kind,
          allowedFields: Array.isArray(command.allowedFields) ? [...command.allowedFields] : null,
          requiresRole: isNonEmptyString(command.requiresRole) ? command.requiresRole.trim() : null,
          logicRef: isNonEmptyString(command.logicRef) ? command.logicRef.trim() : null,
          logicVersion: result.logicVersion || storedLogic[command.logicRef]?.version || null,
          logicHash: result.logicHash || storedLogic[command.logicRef]?.hash || null
        });
      }
      const allowedCspOrigins = Array.isArray(raw.allowedCspOrigins) ? raw.allowedCspOrigins : [];
      for (const origin of allowedCspOrigins) {
        if (!isNonEmptyString(origin) || !origin.startsWith("https://")) {
          return { ok: false, reason: "allowedCspOrigins entries must be https:// URLs" };
        }
        if (/localhost|127\.0\.0\.1/i.test(origin)) {
          return { ok: false, reason: "localhost origins are not allowed in allowedCspOrigins" };
        }
      }
      const dappVersionResult = validateOptionalSemver(raw.dappVersion, "dappVersion");
      if (!dappVersionResult.ok) {
        return dappVersionResult;
      }
      const logicHashResult = validateOptionalLogicHash(raw.logicHash);
      if (!logicHashResult.ok) {
        return logicHashResult;
      }
      if (dappVersionResult.value && !logicHashResult.value) {
        return { ok: false, reason: "logicHash is required when dappVersion is set" };
      }
      if (logicHashResult.value && !dappVersionResult.value) {
        return { ok: false, reason: "dappVersion is required when logicHash is set" };
      }
      const manifest = {
        schemaVersion: MANIFEST_SCHEMA_VERSION,
        id: raw.id.trim(),
        title: raw.title.trim(),
        description: isNonEmptyString(raw.description) ? raw.description.trim() : "",
        collections,
        peerGroupId: isNonEmptyString(raw.peerGroupId) ? raw.peerGroupId.trim() : null,
        publisherId: isNonEmptyString(raw.publisherId) ? raw.publisherId.trim() : null,
        dappVersion: dappVersionResult.value,
        logicHash: logicHashResult.value,
        storedLogic,
        storedCommands: normalizedCommands,
        allowedCspOrigins: allowedCspOrigins.map((o) => o.trim()),
        readOnly: storedCommands.length === 0,
        forwardConsoleLog: raw.forwardConsoleLog === true
      };
      return { ok: true, manifest };
    }
    function collectionAllowed(manifest, collectionName) {
      return manifest && Array.isArray(manifest.collections) && manifest.collections.includes(collectionName);
    }
    function getStoredCommand(manifest, commandId) {
      if (!manifest || !Array.isArray(manifest.storedCommands)) {
        return null;
      }
      return manifest.storedCommands.find((cmd) => cmd.id === commandId) || null;
    }
    module.exports = {
      MANIFEST_SCHEMA_VERSION,
      ID_PATTERN,
      validateDignityAppManifest,
      collectionAllowed,
      getStoredCommand
    };
  }
});

// src/apps/csp.js
var require_csp = __commonJS({
  "src/apps/csp.js"(exports, module) {
    function buildAppCsp(manifest) {
      const origins = Array.isArray(manifest?.allowedCspOrigins) ? manifest.allowedCspOrigins : [];
      const connectSrc = ["'none'", ...origins].join(" ");
      return [
        "default-src 'none'",
        "script-src 'unsafe-inline'",
        "style-src 'unsafe-inline'",
        "img-src data: blob:",
        `connect-src ${connectSrc}`,
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'"
      ].join("; ");
    }
    function escapeCspForHtmlAttribute(csp) {
      return String(csp).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    }
    function injectCspMeta(html, cspContent) {
      const escaped = escapeCspForHtmlAttribute(cspContent);
      const meta = `<meta http-equiv="Content-Security-Policy" content="${escaped}">`;
      if (/<head[^>]*>/i.test(html)) {
        return html.replace(/<head[^>]*>/i, (match) => `${match}
  ${meta}`);
      }
      if (/<html[^>]*>/i.test(html)) {
        return html.replace(/<html[^>]*>/i, (match) => `${match}
<head>
  ${meta}
</head>`);
      }
      return `<!DOCTYPE html><html><head>
  ${meta}
</head><body>${html}</body></html>`;
    }
    function injectCspViolationReporter(html) {
      const script = `<script>
document.addEventListener('securitypolicyviolation', function(e) {
  try {
    parent.postMessage({
      type: 'dignity-app-csp-violation',
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy
    }, '*');
  } catch (err) {}
});
<\/script>`;
      if (/<\/head>/i.test(html)) {
        return html.replace(/<\/head>/i, `  ${script}
</head>`);
      }
      return `${script}${html}`;
    }
    function prepareSandboxedAppHtml(appHtml, manifest) {
      const csp = buildAppCsp(manifest);
      let html = injectCspMeta(appHtml, csp);
      html = injectCspViolationReporter(html);
      return html;
    }
    module.exports = {
      buildAppCsp,
      escapeCspForHtmlAttribute,
      injectCspMeta,
      injectCspViolationReporter,
      prepareSandboxedAppHtml
    };
  }
});

// src/apps/stored-commands.js
var require_stored_commands = __commonJS({
  "src/apps/stored-commands.js"(exports, module) {
    var { getStoredCommand } = require_manifest();
    var DANGEROUS_PATCH_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
    function emitStoredCommandRejection(node, reason, commandId, args) {
      if (node && typeof node.emit === "function") {
        node.emit("warning", {
          type: "stored-command-rejected",
          reason,
          commandId,
          args
        });
      }
    }
    function verifyStoredCommandLogic(node, manifest, command) {
      const expectedHash = command.logicHash || command.logicRef && manifest.storedLogic?.[command.logicRef]?.hash || null;
      const expectedVersion = command.logicVersion || command.logicRef && manifest.storedLogic?.[command.logicRef]?.version || null;
      if (!expectedHash && !expectedVersion) {
        return null;
      }
      const publisherId = manifest.publisherId || node?.nodeId;
      const entry = node.getPublisherVerificationEntry(publisherId, command.collection) || node.getVerificationEntry(command.collection);
      if (!entry) {
        return "logic-hash-not-registered";
      }
      if (expectedHash && entry.hash !== expectedHash) {
        return "logic-hash-mismatch";
      }
      if (expectedVersion && entry.version && entry.version !== expectedVersion) {
        return "logic-version-mismatch";
      }
      return null;
    }
    function verifyOfficialDappManifest(node, manifest) {
      if (!manifest?.dappVersion || !manifest?.logicHash) {
        return null;
      }
      const publisherId = manifest.publisherId || node?.nodeId;
      if (!publisherId) {
        return "official-publisher-missing";
      }
      const primaryCollection = manifest.collections?.[0];
      if (!primaryCollection) {
        return "official-collection-missing";
      }
      const entry = node.getPublisherVerificationEntry(publisherId, primaryCollection) || node.getVerificationEntry(primaryCollection);
      if (!entry) {
        return "official-dapp-not-registered";
      }
      if (entry.hash !== manifest.logicHash) {
        return "official-dapp-hash-mismatch";
      }
      if (entry.version && entry.version !== manifest.dappVersion) {
        return "official-dapp-version-mismatch";
      }
      if (manifest.id && entry.dappId && entry.dappId !== manifest.id) {
        return "official-dapp-id-mismatch";
      }
      return null;
    }
    function isPublisherCommandCapable(node, manifest) {
      if (!node || !node.peerGroups || typeof node.peerGroups.get !== "function") {
        return false;
      }
      const targetGroupId = manifest.peerGroupId || null;
      if (targetGroupId) {
        const group = node.peerGroups.get(targetGroupId);
        return Boolean(group && group.role === "publisher" && group.commandCapable !== false);
      }
      for (const group of node.peerGroups.values()) {
        if (group.role === "publisher" && group.commandCapable !== false) {
          return true;
        }
      }
      return false;
    }
    function validateAllowedFields(command, patch) {
      if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
        return "invalid-args";
      }
      if (!Array.isArray(command.allowedFields)) {
        return null;
      }
      const allowed = new Set(command.allowedFields);
      for (const key of Reflect.ownKeys(patch)) {
        const name = String(key);
        if (DANGEROUS_PATCH_KEYS.has(name)) {
          return "field-not-allowed";
        }
        if (!allowed.has(name)) {
          return "field-not-allowed";
        }
      }
      return null;
    }
    async function executeStoredCommand(node, manifest, commandId, args = {}) {
      if (!manifest || manifest.readOnly) {
        emitStoredCommandRejection(node, "read-only-manifest", commandId, args);
        return { ok: false, reason: "read-only-manifest" };
      }
      const command = getStoredCommand(manifest, commandId);
      if (!command) {
        emitStoredCommandRejection(node, "unknown-command", commandId, args);
        return { ok: false, reason: "unknown-command" };
      }
      if (!isPublisherCommandCapable(node, manifest)) {
        emitStoredCommandRejection(node, "not-command-capable", commandId, args);
        return { ok: false, reason: "not-command-capable" };
      }
      const officialError = verifyOfficialDappManifest(node, manifest);
      if (officialError) {
        emitStoredCommandRejection(node, officialError, commandId, args);
        return { ok: false, reason: officialError };
      }
      const logicError = verifyStoredCommandLogic(node, manifest, command);
      if (logicError) {
        emitStoredCommandRejection(node, logicError, commandId, args);
        return { ok: false, reason: logicError };
      }
      const collection = command.collection;
      const writeOptions = {
        peerGroupId: args.peerGroupId || manifest.peerGroupId || void 0,
        broadcastScope: args.broadcastScope
      };
      if (command.kind === "create") {
        const data = args.data;
        if (!data || typeof data !== "object") {
          emitStoredCommandRejection(node, "invalid-args", commandId, args);
          return { ok: false, reason: "invalid-args" };
        }
        const fieldError = validateAllowedFields(command, data);
        if (fieldError) {
          emitStoredCommandRejection(node, fieldError, commandId, args);
          return { ok: false, reason: fieldError };
        }
        const record = await node.create(collection, data, {
          ...writeOptions,
          id: args.id
        });
        return { ok: true, result: record };
      }
      if (command.kind === "update") {
        const { id, patch } = args;
        if (!id || !patch || typeof patch !== "object") {
          emitStoredCommandRejection(node, "invalid-args", commandId, args);
          return { ok: false, reason: "invalid-args" };
        }
        const fieldError = validateAllowedFields(command, patch);
        if (fieldError) {
          emitStoredCommandRejection(node, fieldError, commandId, args);
          return { ok: false, reason: fieldError };
        }
        const record = await node.update(collection, id, patch, writeOptions);
        return { ok: true, result: record };
      }
      if (command.kind === "delete") {
        const { id } = args;
        if (!id) {
          emitStoredCommandRejection(node, "invalid-args", commandId, args);
          return { ok: false, reason: "invalid-args" };
        }
        await node.remove(collection, id, writeOptions);
        return { ok: true, result: { id, deleted: true } };
      }
      emitStoredCommandRejection(node, "unsupported-kind", commandId, args);
      return { ok: false, reason: "unsupported-kind" };
    }
    module.exports = {
      isPublisherCommandCapable,
      validateAllowedFields,
      verifyOfficialDappManifest,
      verifyStoredCommandLogic,
      executeStoredCommand,
      emitStoredCommandRejection
    };
  }
});

// src/apps/bridge.js
var require_bridge = __commonJS({
  "src/apps/bridge.js"(exports, module) {
    var { collectionAllowed } = require_manifest();
    var { executeStoredCommand } = require_stored_commands();
    var RPC_METHODS = /* @__PURE__ */ new Set(["ready", "query", "list", "runStoredCommand", "log", "error"]);
    function filterRecords(records, filter) {
      if (!filter || typeof filter !== "object") {
        return records;
      }
      return records.filter((record) => {
        for (const [key, value] of Object.entries(filter)) {
          if (key === "ownerId") {
            if (record.ownerId !== value) {
              return false;
            }
            continue;
          }
          if (record.data && Object.prototype.hasOwnProperty.call(record.data, key)) {
            if (record.data[key] !== value) {
              return false;
            }
            continue;
          }
          if (record[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    function createHostRpcHandler({
      manifest,
      replica = null,
      node = null,
      onLog = null,
      onError = null
    } = {}) {
      if (!manifest) {
        throw new Error("createHostRpcHandler requires manifest");
      }
      async function handle(message) {
        const rpcId = message?.rpcId;
        const method = message?.method;
        const params = message?.params || {};
        if (!rpcId || typeof rpcId !== "string") {
          return { rpcId: rpcId || null, ok: false, error: { code: "invalid-envelope", message: "rpcId required" } };
        }
        if (!RPC_METHODS.has(method)) {
          return { rpcId, ok: false, error: { code: "unknown-method", message: `Unknown RPC method: ${method}` } };
        }
        try {
          if (method === "ready") {
            return { rpcId, ok: true, result: { appId: manifest.id, readOnly: manifest.readOnly } };
          }
          if (method === "log") {
            if (typeof onLog === "function") {
              onLog({ level: params.level || "info", message: params.message, data: params.data });
            }
            return { rpcId, ok: true, result: { logged: true } };
          }
          if (method === "error") {
            if (typeof onError === "function") {
              onError({ message: params.message, stack: params.stack });
            }
            return { rpcId, ok: true, result: { received: true } };
          }
          if (method === "query" || method === "list") {
            if (!replica) {
              return { rpcId, ok: false, error: { code: "no-replica", message: "Query replica is not attached" } };
            }
            const collection = params.collection;
            if (!collectionAllowed(manifest, collection)) {
              return { rpcId, ok: false, error: { code: "collection-denied", message: `Collection not allowed: ${collection}` } };
            }
            let records = replica.list(collection);
            if (method === "query") {
              records = filterRecords(records, params.filter);
              if (typeof params.limit === "number" && params.limit >= 0) {
                records = records.slice(0, params.limit);
              }
            }
            return { rpcId, ok: true, result: { records } };
          }
          if (method === "runStoredCommand") {
            if (!node) {
              return { rpcId, ok: false, error: { code: "no-node", message: "Publisher node is not attached" } };
            }
            const outcome = await executeStoredCommand(node, manifest, params.commandId, params.args || {});
            if (!outcome.ok) {
              return { rpcId, ok: false, error: { code: outcome.reason, message: outcome.reason } };
            }
            return { rpcId, ok: true, result: outcome.result };
          }
          return { rpcId, ok: false, error: { code: "unhandled", message: "Unhandled method" } };
        } catch (error) {
          return {
            rpcId,
            ok: false,
            error: {
              code: error.code || "rpc-failed",
              message: error.message || "RPC failed"
            }
          };
        }
      }
      return { handle };
    }
    module.exports = {
      RPC_METHODS,
      filterRecords,
      createHostRpcHandler
    };
  }
});

// src/apps/client.js
var require_client = __commonJS({
  "src/apps/client.js"(exports, module) {
    var HANDSHAKE_TYPE = "dignity-app-handshake";
    function createRpcId() {
      return `rpc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    function createDignityAppClient(port) {
      if (!port || typeof port.postMessage !== "function") {
        throw new Error("createDignityAppClient requires a MessagePort");
      }
      const pending = /* @__PURE__ */ new Map();
      port.onmessage = (event) => {
        const response = event.data;
        if (!response || !response.rpcId) {
          return;
        }
        const entry = pending.get(response.rpcId);
        if (!entry) {
          return;
        }
        pending.delete(response.rpcId);
        if (response.ok) {
          entry.resolve(response.result);
        } else {
          const err = new Error(response.error?.message || "RPC failed");
          err.code = response.error?.code || "rpc-failed";
          entry.reject(err);
        }
      };
      function call(method, params = {}) {
        const rpcId = createRpcId();
        return new Promise((resolve, reject) => {
          pending.set(rpcId, { resolve, reject });
          port.postMessage({ rpcId, method, params });
        });
      }
      return {
        ready() {
          return call("ready");
        },
        query({ collection, filter, limit } = {}) {
          return call("query", { collection, filter, limit }).then((r) => r.records);
        },
        list(collection) {
          return call("list", { collection }).then((r) => r.records);
        },
        runStoredCommand(commandId, args = {}) {
          return call("runStoredCommand", { commandId, args });
        },
        log(message, data) {
          return call("log", { level: "info", message, data });
        },
        error(message, stack) {
          return call("error", { message, stack });
        }
      };
    }
    function connectDignityAppClient({ timeoutMs = 1e4 } = {}) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          window.removeEventListener("message", onMessage);
          reject(new Error("Dignity App handshake timed out"));
        }, timeoutMs);
        function onMessage(event) {
          const data = event.data;
          if (!data || data.type !== HANDSHAKE_TYPE) {
            return;
          }
          const port = event.ports && event.ports[0];
          if (!port) {
            clearTimeout(timer);
            window.removeEventListener("message", onMessage);
            reject(new Error("Dignity App handshake missing MessagePort"));
            return;
          }
          clearTimeout(timer);
          window.removeEventListener("message", onMessage);
          const client = createDignityAppClient(port);
          resolve(client);
        }
        window.addEventListener("message", onMessage);
      });
    }
    function buildClientBootstrapScript(manifest = {}) {
      const forwardConsoleLog = manifest.forwardConsoleLog === true;
      return `<script>
(function() {
  var HANDSHAKE_TYPE = '${HANDSHAKE_TYPE}';
  var FORWARD_LOG = ${forwardConsoleLog};
  var MAX_LEN = 2000;
  var SENSITIVE = /password|secret|token|privatekey|signingkey|encryptionkey|apppassword/i;
  var pending = [];
  var client = null;
  var captureInstalled = false;

  function sanitizeMsg(msg) {
    if (msg == null) return '';
    var s = String(msg);
    return s.length > MAX_LEN ? s.slice(0, MAX_LEN) + '\\u2026' : s;
  }

  function sanitizeVal(v, depth) {
    depth = depth || 0;
    if (depth > 4) return '[max-depth]';
    if (v == null) return v;
    if (typeof v === 'string') return sanitizeMsg(v);
    if (typeof v === 'number' || typeof v === 'boolean') return v;
    if (Array.isArray(v)) {
      return v.slice(0, 20).map(function(entry) { return sanitizeVal(entry, depth + 1); });
    }
    if (typeof v === 'object') {
      var out = {};
      for (var key in v) {
        if (Object.prototype.hasOwnProperty.call(v, key)) {
          out[key] = SENSITIVE.test(key) ? '[redacted]' : sanitizeVal(v[key], depth + 1);
        }
      }
      return out;
    }
    return sanitizeMsg(v);
  }

  function installCapture(c, forwardLog) {
    if (captureInstalled) return;
    captureInstalled = true;
    var origError = console.error;
    console.error = function() {
      var msg = Array.prototype.map.call(arguments, function(a) { return String(a); }).join(' ');
      c.error(sanitizeMsg(msg), null).catch(function() {});
      try { origError.apply(console, arguments); } catch (e) {}
    };
    if (forwardLog) {
      var origLog = console.log;
      console.log = function() {
        var msg = Array.prototype.map.call(arguments, function(a) { return String(a); }).join(' ');
        c.log(sanitizeMsg(msg), null).catch(function() {});
        try { origLog.apply(console, arguments); } catch (e) {}
      };
    }
    window.addEventListener('error', function(e) {
      c.error(
        sanitizeMsg(e.message || 'error'),
        e.error && e.error.stack ? sanitizeMsg(e.error.stack) : null
      ).catch(function() {});
    });
    window.addEventListener('unhandledrejection', function(e) {
      var reason = e.reason;
      var msg = reason && reason.message ? reason.message : String(reason);
      var stack = reason && reason.stack ? reason.stack : null;
      c.error(sanitizeMsg(msg), stack ? sanitizeMsg(stack) : null).catch(function() {});
    });
  }

  function createRpcId() {
    return 'rpc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function createClient(port) {
    var waiters = {};
    port.onmessage = function(event) {
      var response = event.data;
      if (!response || !response.rpcId) return;
      var entry = waiters[response.rpcId];
      if (!entry) return;
      delete waiters[response.rpcId];
      if (response.ok) entry.resolve(response.result);
      else {
        var err = new Error((response.error && response.error.message) || 'RPC failed');
        err.code = (response.error && response.error.code) || 'rpc-failed';
        entry.reject(err);
      }
    };
    port.start();
    function call(method, params) {
      var rpcId = createRpcId();
      return new Promise(function(resolve, reject) {
        waiters[rpcId] = { resolve: resolve, reject: reject };
        port.postMessage({ rpcId: rpcId, method: method, params: params || {} });
      });
    }
    return {
      ready: function() { return call('ready'); },
      query: function(opts) { return call('query', opts).then(function(r) { return r.records; }); },
      list: function(collection) { return call('list', { collection: collection }).then(function(r) { return r.records; }); },
      runStoredCommand: function(id, args) { return call('runStoredCommand', { commandId: id, args: args || {} }); },
      log: function(msg, data) { return call('log', { level: 'info', message: sanitizeMsg(msg), data: sanitizeVal(data) }); },
      error: function(msg, stack) { return call('error', { message: sanitizeMsg(msg), stack: stack ? sanitizeMsg(stack) : null }); }
    };
  }

  function flush() {
    if (!client) return;
    while (pending.length) {
      var job = pending.shift();
      var p;
      if (job.method === 'ready') p = client.ready();
      else if (job.method === 'query') p = client.query(job.args[0]);
      else if (job.method === 'list') p = client.list(job.args[0]);
      else if (job.method === 'runStoredCommand') p = client.runStoredCommand(job.args[0], job.args[1]);
      else if (job.method === 'log') p = client.log(job.args[0], job.args[1]);
      else if (job.method === 'error') p = client.error(job.args[0], job.args[1]);
      else { job.reject(new Error('unknown method')); continue; }
      p.then(job.resolve).catch(job.reject);
    }
  }

  window.dignity = {
    ready: function() { return enqueue('ready', []); },
    query: function(opts) { return enqueue('query', [opts]); },
    list: function(collection) { return enqueue('list', [collection]); },
    runStoredCommand: function(id, args) { return enqueue('runStoredCommand', [id, args]); },
    log: function(msg, data) { return enqueue('log', [msg, data]); },
    error: function(msg, stack) { return enqueue('error', [msg, stack]); }
  };

  function enqueue(method, args) {
    return new Promise(function(resolve, reject) {
      pending.push({ method: method, args: args, resolve: resolve, reject: reject });
      flush();
    });
  }

  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== HANDSHAKE_TYPE) return;
    var port = event.ports && event.ports[0];
    if (!port) return;
    client = createClient(port);
    client.ready().then(function() {
      installCapture(client, FORWARD_LOG);
      flush();
    }).catch(function(err) {
      pending.forEach(function(j) { j.reject(err); });
      pending.length = 0;
    });
  });
})();
<\/script>`;
    }
    module.exports = {
      HANDSHAKE_TYPE,
      createDignityAppClient,
      connectDignityAppClient,
      buildClientBootstrapScript
    };
  }
});

// src/apps/host.js
var require_host = __commonJS({
  "src/apps/host.js"(exports, module) {
    var EventEmitter = require_event_emitter();
    var { validateDignityAppManifest } = require_manifest();
    var { prepareSandboxedAppHtml } = require_csp();
    var { createHostRpcHandler } = require_bridge();
    var { buildClientBootstrapScript, HANDSHAKE_TYPE } = require_client();
    var DEFAULT_SANDBOX = "allow-scripts";
    var DignityAppHost = class extends EventEmitter {
      /**
       * @param {object} options
       * @param {object} options.manifest - raw or validated manifest
       * @param {import('../cqrs/query-replica')|null} [options.replica]
       * @param {import('../core/dignity-p2p')|null} [options.node]
       * @param {Document} [options.document] - DOM document (default global)
       */
      constructor({ manifest, replica = null, node = null, document: doc = null } = {}) {
        super();
        const validated = manifest?.schemaVersion ? { ok: true, manifest } : validateDignityAppManifest(manifest);
        if (!validated.ok) {
          throw new Error(`Invalid Dignity App manifest: ${validated.reason}`);
        }
        this.manifest = validated.manifest;
        this.replica = replica;
        this.node = node;
        this.document = doc || (typeof document !== "undefined" ? document : null);
        this.iframe = null;
        this.channel = null;
        this.hostPort = null;
        this.channelReady = false;
        this.rpcHandler = createHostRpcHandler({
          manifest: this.manifest,
          replica: this.replica,
          node: this.node,
          onLog: (payload) => this.emit("applog", payload),
          onError: (payload) => this.emit("apperror", payload)
        });
        this._onWindowMessage = this._onWindowMessage.bind(this);
        this._onIframeLoad = this._onIframeLoad.bind(this);
      }
      /**
       * Mount sandboxed app into a container element.
       * @param {HTMLElement} container
       * @param {string} appHtml - raw app HTML (CSP injected by host)
       */
      mount(container, appHtml) {
        if (!this.document) {
          throw new Error("DignityAppHost.mount requires a DOM document");
        }
        if (!container) {
          throw new Error("DignityAppHost.mount requires a container element");
        }
        this.unmount();
        this.iframe = this.document.createElement("iframe");
        this.iframe.setAttribute("sandbox", DEFAULT_SANDBOX);
        this.iframe.setAttribute("title", this.manifest.title);
        this.iframe.setAttribute("referrerpolicy", "no-referrer");
        const prepared = this._prepareHtml(appHtml);
        this.iframe.srcdoc = prepared;
        this.iframe.addEventListener("load", this._onIframeLoad);
        if (typeof window !== "undefined") {
          window.addEventListener("message", this._onWindowMessage);
        }
        container.appendChild(this.iframe);
        this._openChannel();
      }
      /**
       * Remove iframe and invalidate channel.
       */
      unmount() {
        this._invalidateChannel();
        if (typeof window !== "undefined") {
          window.removeEventListener("message", this._onWindowMessage);
        }
        if (this.iframe) {
          this.iframe.removeEventListener("load", this._onIframeLoad);
          if (this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
          }
          this.iframe = null;
        }
      }
      /**
       * Whether RPC channel is ready for requests.
       * @returns {boolean}
       */
      isChannelReady() {
        return this.channelReady;
      }
      /**
       * Send RPC directly on host port (for tests).
       * @param {string} method
       * @param {object} params
       * @returns {Promise<*>}
       */
      async rpc(method, params = {}) {
        if (!this.channelReady || !this.hostPort) {
          throw new Error("Dignity App channel is not ready");
        }
        const rpcId = `host-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const response = await this.rpcHandler.handle({ rpcId, method, params });
        if (!response.ok) {
          const err = new Error(response.error?.message || "RPC failed");
          err.code = response.error?.code;
          this.emit("apprpcerror", {
            method,
            code: err.code,
            message: err.message
          });
          throw err;
        }
        if (method === "query" || method === "list") {
          return response.result.records;
        }
        return response.result;
      }
      _prepareHtml(appHtml) {
        let html = prepareSandboxedAppHtml(appHtml, this.manifest);
        const bootstrap = buildClientBootstrapScript(this.manifest);
        if (/<\/head>/i.test(html)) {
          html = html.replace(/<\/head>/i, `  ${bootstrap}
</head>`);
        } else {
          html = `${bootstrap}${html}`;
        }
        return html;
      }
      _openChannel() {
        if (typeof MessageChannel === "undefined") {
          throw new Error("MessageChannel is not available");
        }
        this._invalidateChannel();
        this.channel = new MessageChannel();
        this.hostPort = this.channel.port1;
        this.channelReady = false;
        this.hostPort.onmessage = async (event) => {
          const response = await this.rpcHandler.handle(event.data);
          this.hostPort.postMessage(response);
          if (!response.ok && ["query", "list", "runStoredCommand"].includes(event.data?.method)) {
            this.emit("apprpcerror", {
              method: event.data.method,
              code: response.error?.code,
              message: response.error?.message
            });
          }
          if (event.data?.method === "ready" && response.ok) {
            this.channelReady = true;
            this.emit("ready", { appId: this.manifest.id });
          }
        };
        this.hostPort.start();
      }
      _invalidateChannel() {
        this.channelReady = false;
        if (this.hostPort) {
          try {
            this.hostPort.close();
          } catch (error) {
          }
          this.hostPort = null;
        }
        this.channel = null;
      }
      _onIframeLoad() {
        if (!this.iframe || !this.channel) {
          return;
        }
        const target = this.iframe.contentWindow;
        if (!target) {
          return;
        }
        target.postMessage({ type: HANDSHAKE_TYPE }, "*", [this.channel.port2]);
      }
      _onWindowMessage(event) {
        if (event.data?.type === "dignity-app-csp-violation") {
          this.emit("apperror", {
            type: "csp-violation",
            blockedURI: event.data.blockedURI,
            violatedDirective: event.data.violatedDirective,
            originalPolicy: event.data.originalPolicy
          });
        }
      }
    };
    module.exports = {
      DignityAppHost,
      DEFAULT_SANDBOX
    };
  }
});

// src/apps/capture-sanitize.js
var require_capture_sanitize = __commonJS({
  "src/apps/capture-sanitize.js"(exports, module) {
    var SENSITIVE_KEYS = /password|secret|token|privatekey|signingkey|encryptionkey|apppassword/i;
    var MAX_MESSAGE_LENGTH = 2e3;
    function sanitizeCaptureValue(value, depth = 0) {
      if (depth > 4) {
        return "[max-depth]";
      }
      if (value === null || value === void 0) {
        return value;
      }
      if (typeof value === "string") {
        return value.length > MAX_MESSAGE_LENGTH ? `${value.slice(0, MAX_MESSAGE_LENGTH)}\u2026` : value;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return value;
      }
      if (Array.isArray(value)) {
        return value.slice(0, 20).map((entry) => sanitizeCaptureValue(entry, depth + 1));
      }
      if (typeof value === "object") {
        const out = {};
        for (const [key, entry] of Object.entries(value)) {
          if (SENSITIVE_KEYS.test(key)) {
            out[key] = "[redacted]";
          } else {
            out[key] = sanitizeCaptureValue(entry, depth + 1);
          }
        }
        return out;
      }
      return String(value).slice(0, MAX_MESSAGE_LENGTH);
    }
    function sanitizeCaptureMessage(message) {
      if (message === null || message === void 0) {
        return "";
      }
      const text = String(message);
      return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH)}\u2026` : text;
    }
    module.exports = {
      SENSITIVE_KEYS,
      MAX_MESSAGE_LENGTH,
      sanitizeCaptureValue,
      sanitizeCaptureMessage
    };
  }
});

// src/apps/error-panel.js
var require_error_panel = __commonJS({
  "src/apps/error-panel.js"(exports, module) {
    var { sanitizeCaptureMessage } = require_capture_sanitize();
    var PANEL_STYLE_ID = "dignity-app-error-panel-styles";
    var DEFAULT_STYLES = `
.dignity-app-panel { font-family: system-ui, sans-serif; font-size: 13px; margin: 0 0 8px; border: 1px solid #ccc; border-radius: 6px; background: #fafafa; }
.dignity-app-panel__toggle { width: 100%; text-align: left; padding: 8px 12px; border: 0; background: transparent; cursor: pointer; font: inherit; }
.dignity-app-panel__toggle--error { color: #a40000; font-weight: 600; }
.dignity-app-panel__body { max-height: 200px; overflow: auto; padding: 0 12px 8px; }
.dignity-app-panel__entry { margin: 4px 0; padding: 6px 8px; border-radius: 4px; background: #fff; border: 1px solid #eee; white-space: pre-wrap; word-break: break-word; }
.dignity-app-panel__entry--error { border-color: #f5c2c7; background: #fff5f5; }
.dignity-app-panel__meta { color: #666; font-size: 11px; }
`;
    function ensurePanelStyles(doc) {
      if (!doc || doc.getElementById(PANEL_STYLE_ID)) {
        return;
      }
      const style = doc.createElement("style");
      style.id = PANEL_STYLE_ID;
      style.textContent = DEFAULT_STYLES;
      doc.head.appendChild(style);
    }
    function attachErrorPanel(host, container, options = {}) {
      if (!host || !container) {
        throw new Error("attachErrorPanel requires host and container");
      }
      const doc = options.document || (typeof document !== "undefined" ? document : null);
      if (!doc) {
        throw new Error("attachErrorPanel requires a DOM document");
      }
      const maxEntries = typeof options.maxEntries === "number" ? options.maxEntries : 50;
      ensurePanelStyles(doc);
      const errorPanel = doc.createElement("div");
      errorPanel.className = "dignity-app-panel dignity-app-panel--errors";
      errorPanel.hidden = true;
      const errorToggle = doc.createElement("button");
      errorToggle.type = "button";
      errorToggle.className = "dignity-app-panel__toggle dignity-app-panel__toggle--error";
      errorToggle.textContent = "App errors (0)";
      errorToggle.setAttribute("aria-expanded", "false");
      const errorBody = doc.createElement("div");
      errorBody.className = "dignity-app-panel__body";
      errorBody.hidden = true;
      errorPanel.appendChild(errorToggle);
      errorPanel.appendChild(errorBody);
      const logPanel = doc.createElement("div");
      logPanel.className = "dignity-app-panel dignity-app-panel--logs";
      const logToggle = doc.createElement("button");
      logToggle.type = "button";
      logToggle.className = "dignity-app-panel__toggle";
      logToggle.textContent = "App log (0)";
      logToggle.setAttribute("aria-expanded", "false");
      const logBody = doc.createElement("div");
      logBody.className = "dignity-app-panel__body";
      logBody.hidden = true;
      logPanel.appendChild(logToggle);
      logPanel.appendChild(logBody);
      container.insertBefore(errorPanel, container.firstChild);
      container.insertBefore(logPanel, container.firstChild);
      const errors = [];
      const logs = [];
      function formatEntry(payload, isError) {
        const entry = doc.createElement("div");
        entry.className = `dignity-app-panel__entry${isError ? " dignity-app-panel__entry--error" : ""}`;
        const meta = doc.createElement("div");
        meta.className = "dignity-app-panel__meta";
        meta.textContent = payload.type || (isError ? "error" : "log");
        const text = doc.createElement("div");
        const message = sanitizeCaptureMessage(payload.message || payload.reason || JSON.stringify(payload));
        text.textContent = message;
        entry.appendChild(meta);
        entry.appendChild(text);
        return entry;
      }
      function pushEntry(list, bodyEl, toggleEl, label, payload, isError) {
        list.push(payload);
        while (list.length > maxEntries) {
          list.shift();
        }
        bodyEl.appendChild(formatEntry(payload, isError));
        toggleEl.textContent = `${label} (${list.length})`;
      }
      function expandPanel(panel, toggle, body) {
        panel.hidden = false;
        body.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
      }
      errorToggle.addEventListener("click", () => {
        const open = errorBody.hidden;
        errorBody.hidden = !open;
        errorToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      logToggle.addEventListener("click", () => {
        const open = logBody.hidden;
        logBody.hidden = !open;
        logToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      const onApplog = (payload) => {
        pushEntry(logs, logBody, logToggle, "App log", payload, false);
      };
      const onApperror = (payload) => {
        pushEntry(errors, errorBody, errorToggle, "App errors", payload, true);
        expandPanel(errorPanel, errorToggle, errorBody);
      };
      const onApprpcerror = (payload) => {
        pushEntry(errors, errorBody, errorToggle, "App errors", {
          type: "rpc-error",
          message: payload.message || payload.code,
          code: payload.code
        }, true);
        expandPanel(errorPanel, errorToggle, errorBody);
      };
      host.on("applog", onApplog);
      host.on("apperror", onApperror);
      host.on("apprpcerror", onApprpcerror);
      return {
        destroy() {
          host.off("applog", onApplog);
          host.off("apperror", onApperror);
          host.off("apprpcerror", onApprpcerror);
          if (errorPanel.parentNode) {
            errorPanel.parentNode.removeChild(errorPanel);
          }
          if (logPanel.parentNode) {
            logPanel.parentNode.removeChild(logPanel);
          }
        }
      };
    }
    module.exports = {
      attachErrorPanel,
      ensurePanelStyles,
      DEFAULT_STYLES
    };
  }
});

// src/index.js
var require_index = __commonJS({
  "src/index.js"(exports, module) {
    var DignityP2P = require_dignity_p2p();
    var createDefaultSignalingPool = require_create_default_signaling_pool();
    var SignalingPool = require_signaling_pool();
    var WebSocketSignalingProvider = require_websocket_signaling_provider();
    var PeerJSSignalingProvider = require_peerjs_signaling_provider();
    var {
      InMemoryNetworkHub,
      InMemoryNetworkAdapter
    } = require_in_memory_network();
    var {
      PeerJSNetworkAdapter,
      createPeerJSNetworkAdapter
    } = require_peerjs_network();
    var IndexedDBPersistence = require_indexeddb_persistence();
    var {
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS
    } = require_default_signaling_config();
    var VDF = require_vdf();
    var SlothPermutation = require_sloth_vdf();
    var {
      MessageSecurityService,
      DEFAULT_SECURITY_OPTIONS,
      DEFAULT_APP_PASSWORD
    } = require_message_security_service();
    var { deriveKeyPairFromCredentials, keyPairToPublicBundle, deriveColdRecoverySigningKey } = require_derive_key_pair();
    var {
      exportIdentityMnemonic,
      importIdentityMnemonic,
      exportIdentityMnemonicEncrypted,
      importIdentityMnemonicEncrypted,
      normalizeMnemonicPhrase
    } = require_identity_mnemonic();
    var {
      createIdentityRotation,
      verifyIdentityRotation,
      revokeAndRotateIdentity,
      rotateIdentityPassword,
      enrollColdRecoveryPassword,
      verifyColdRecoveryEnrollment,
      shouldApplyIdentityRotation
    } = require_identity_rotation();
    var parsePeerJsServerUrl = require_parse_peerjs_url();
    var {
      PEER_GROUP_SCOPE_PREFIX,
      DEFAULT_PEER_GROUP_OPTIONS,
      peerGroupScope,
      parsePeerGroupScope,
      selectFanoutPeers
    } = require_peer_group();
    var {
      DOMAIN_EVENT_SCHEMA_VERSION,
      operationToDomainEvent,
      signDomainEvent,
      verifyDomainEvent,
      verifyEventChain,
      buildCheckpoint,
      createEmptyView,
      applyDomainEventToView
    } = require_domain_events();
    var {
      DEFAULT_LIVE_CAP,
      DEFAULT_BULK_INTERVAL_MS,
      assignPeerGroupTier,
      filterPeersByTier
    } = require_peer_group_tiers();
    var { electBulkRelays, DEFAULT_BULK_RELAY_COUNT } = require_bulk_relay();
    var DignityQueryReplica = require_query_replica();
    var {
      MANIFEST_SCHEMA_VERSION: DIGNITY_APP_MANIFEST_SCHEMA_VERSION,
      validateDignityAppManifest,
      collectionAllowed,
      getStoredCommand
    } = require_manifest();
    var {
      buildAppCsp,
      prepareSandboxedAppHtml,
      injectCspMeta
    } = require_csp();
    var {
      executeStoredCommand,
      isPublisherCommandCapable
    } = require_stored_commands();
    var {
      createHostRpcHandler,
      RPC_METHODS
    } = require_bridge();
    var {
      DignityAppHost,
      DEFAULT_SANDBOX
    } = require_host();
    var {
      createDignityAppClient,
      connectDignityAppClient,
      buildClientBootstrapScript,
      HANDSHAKE_TYPE
    } = require_client();
    var { attachErrorPanel } = require_error_panel();
    var {
      sanitizeCaptureMessage,
      sanitizeCaptureValue
    } = require_capture_sanitize();
    var {
      COMPATIBILITY_POLICIES,
      DEFAULT_COMPATIBILITY_POLICY,
      hashVerificationCode,
      normalizeVerificationCode,
      parseSemver,
      compareSemver,
      buildVerificationEntry,
      evaluateVerificationCompatibility,
      buildVerificationPresenceMetadata,
      buildPublisherVerificationKey,
      buildPublisherVerificationPresenceMetadata
    } = require_verification_code();
    var {
      hashReflectiveLogic,
      normalizeFunctionSource,
      collectReflectiveFingerprints
    } = require_reflective_logic();
    module.exports = {
      DignityP2P,
      createDefaultSignalingPool,
      SignalingPool,
      WebSocketSignalingProvider,
      PeerJSSignalingProvider,
      InMemoryNetworkHub,
      InMemoryNetworkAdapter,
      PeerJSNetworkAdapter,
      createPeerJSNetworkAdapter,
      IndexedDBPersistence,
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS,
      VDF,
      SlothPermutation,
      MessageSecurityService,
      DEFAULT_SECURITY_OPTIONS,
      DEFAULT_APP_PASSWORD,
      deriveKeyPairFromCredentials,
      deriveColdRecoverySigningKey,
      keyPairToPublicBundle,
      exportIdentityMnemonic,
      importIdentityMnemonic,
      exportIdentityMnemonicEncrypted,
      importIdentityMnemonicEncrypted,
      normalizeMnemonicPhrase,
      createIdentityRotation,
      verifyIdentityRotation,
      revokeAndRotateIdentity,
      rotateIdentityPassword,
      enrollColdRecoveryPassword,
      verifyColdRecoveryEnrollment,
      shouldApplyIdentityRotation,
      parsePeerJsServerUrl,
      PEER_GROUP_SCOPE_PREFIX,
      DEFAULT_PEER_GROUP_OPTIONS,
      peerGroupScope,
      parsePeerGroupScope,
      selectFanoutPeers,
      DOMAIN_EVENT_SCHEMA_VERSION,
      operationToDomainEvent,
      signDomainEvent,
      verifyDomainEvent,
      verifyEventChain,
      buildCheckpoint,
      createEmptyView,
      applyDomainEventToView,
      DEFAULT_LIVE_CAP,
      DEFAULT_BULK_INTERVAL_MS,
      assignPeerGroupTier,
      filterPeersByTier,
      electBulkRelays,
      DEFAULT_BULK_RELAY_COUNT,
      DignityQueryReplica,
      DIGNITY_APP_MANIFEST_SCHEMA_VERSION,
      validateDignityAppManifest,
      collectionAllowed,
      getStoredCommand,
      buildAppCsp,
      prepareSandboxedAppHtml,
      injectCspMeta,
      executeStoredCommand,
      isPublisherCommandCapable,
      createHostRpcHandler,
      RPC_METHODS,
      DignityAppHost,
      DEFAULT_SANDBOX,
      createDignityAppClient,
      connectDignityAppClient,
      buildClientBootstrapScript,
      HANDSHAKE_TYPE,
      attachErrorPanel,
      sanitizeCaptureMessage,
      sanitizeCaptureValue,
      COMPATIBILITY_POLICIES,
      DEFAULT_COMPATIBILITY_POLICY,
      hashVerificationCode,
      normalizeVerificationCode,
      parseSemver,
      compareSemver,
      buildVerificationEntry,
      buildPublisherVerificationKey,
      evaluateVerificationCompatibility,
      buildVerificationPresenceMetadata,
      buildPublisherVerificationPresenceMetadata,
      hashReflectiveLogic,
      normalizeFunctionSource,
      collectReflectiveFingerprints
    };
  }
});
export default require_index();
//# sourceMappingURL=dignity.esm.js.map
