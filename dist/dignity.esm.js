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

// src/utils/event-emitter.js
var require_event_emitter = __commonJS({
  "src/utils/event-emitter.js"(exports, module) {
    var EventEmitter = class {
      constructor() {
        this.handlers = /* @__PURE__ */ new Map();
      }
      on(eventName, handler) {
        if (!this.handlers.has(eventName)) {
          this.handlers.set(eventName, /* @__PURE__ */ new Set());
        }
        this.handlers.get(eventName).add(handler);
      }
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
          if (powExponent % BigInt(2) === BigInt(1)) {
            result = result * powBase % modulus;
          }
          powExponent = powExponent / BigInt(2);
          powBase = powBase * powBase % modulus;
        }
        return result;
      }
      quadRes(x) {
        return this.fastPow(x, (_SlothPermutation.p - BigInt(1)) / BigInt(2), _SlothPermutation.p) === BigInt(1);
      }
      modSqrtOp(x) {
        let y;
        let value = x;
        if (this.quadRes(value)) {
          y = this.fastPow(value, (_SlothPermutation.p + BigInt(1)) / BigInt(4), _SlothPermutation.p);
        } else {
          value = (-value + _SlothPermutation.p) % _SlothPermutation.p;
          y = this.fastPow(value, (_SlothPermutation.p + BigInt(1)) / BigInt(4), _SlothPermutation.p);
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

// src/security/message-security-service.js
var require_message_security_service = __commonJS({
  "src/security/message-security-service.js"(exports, module) {
    var nacl = require_nacl_fast();
    var naclUtil = require_nacl_util();
    var VDF = require_vdf();
    var DEFAULT_SECURITY_OPTIONS = {
      enabled: true,
      signingEnabled: true,
      encryptionEnabled: true,
      powEnabled: true,
      powTargetMs: 1e3,
      appPassword: "change-this-app-password",
      broadcastPasswords: {},
      resolveBroadcastPassword: null,
      powSteps: 22,
      trustedPeerKeys: {}
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
        for (const [peerId, peerKey] of Object.entries(this.options.trustedPeerKeys || {})) {
          this.peerPublicKeys.set(peerId, normalizePeerPublicKey(peerKey));
        }
        this.calibratedPowSteps = this.options.powSteps;
      }
      getPublicKey() {
        return { ...this.publicKeyBundle };
      }
      registerPeerPublicKey(peerId, publicKey) {
        this.peerPublicKeys.set(peerId, normalizePeerPublicKey(publicKey));
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
        const payload = this.decryptPayload(envelope);
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
        const key = hash32(concatBytes(utf8ToBytes(password), salt));
        const encrypted = nacl.secretbox(plainText, nonce, key);
        return {
          payload: naclUtil.encodeBase64(encrypted),
          security: {
            enabled: true,
            mode: "broadcast",
            scope,
            nonce: naclUtil.encodeBase64(nonce),
            salt: naclUtil.encodeBase64(salt)
          }
        };
      }
      decryptPayload(envelope) {
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
          const key = hash32(concatBytes(utf8ToBytes(password), salt));
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
      DEFAULT_SECURITY_OPTIONS
    };
  }
});

// src/core/dignity-p2p.js
var require_dignity_p2p = __commonJS({
  "src/core/dignity-p2p.js"(exports, module) {
    var EventEmitter = require_event_emitter();
    var { MessageSecurityService } = require_message_security_service();
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
        this.state = /* @__PURE__ */ new Map();
        this.appliedOperations = /* @__PURE__ */ new Set();
        this.boundMessageHandler = this.handleIncomingMessage.bind(this);
      }
      async start() {
        this.networkAdapter.onMessage(this.boundMessageHandler);
        await this.networkAdapter.start(this.nodeId);
      }
      async stop() {
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
        return {
          id: record.id,
          ownerId: record.ownerId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
          data: { ...record.data }
        };
      }
      async create(collectionName, data, options = {}) {
        const collection = this.getCollection(collectionName);
        const id = options.id || this.idGenerator();
        if (collection.has(id) && !collection.get(id).deletedAt) {
          throw new Error(`Object ${id} already exists in ${collectionName}`);
        }
        const timestamp = this.now();
        const operation = {
          opId: this.idGenerator(),
          kind: "create",
          collectionName,
          id,
          actorId: this.nodeId,
          ownerId: this.nodeId,
          timestamp,
          payload: { ...data }
        };
        this.applyOperation(operation);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
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
        if (existing.ownerId !== this.nodeId) {
          throw new Error(`Only owner ${existing.ownerId} can update object ${id}`);
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
        this.applyOperation(operation);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
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
        this.applyOperation(operation);
        await this.broadcastMessage("operation", operation, {
          broadcastScope: options.broadcastScope || this.resolveBroadcastScope({
            messageType: "operation",
            operation,
            collectionName
          })
        });
      }
      registerPeerPublicKey(peerId, publicKey) {
        this.securityService.registerPeerPublicKey(peerId, publicKey);
      }
      getPublicKey() {
        return this.securityService.getPublicKey();
      }
      async broadcastMessage(messageType, payload, securityContext = {}) {
        const envelope = await this.securityService.secureOutgoingMessage({
          messageType,
          payload,
          targetId: null,
          securityContext
        });
        await this.networkAdapter.broadcast(envelope);
      }
      async sendDirectMessage(targetId, messageType, payload) {
        const envelope = await this.securityService.secureOutgoingMessage({
          messageType,
          payload,
          targetId
        });
        await this.networkAdapter.broadcast(envelope);
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
        const metadata = options.metadata || {};
        const existing = this.discoveryRooms.get(normalizedScope);
        if (existing && existing.timer) {
          clearInterval(existing.timer);
        }
        const timer = setInterval(() => {
          this.announcePresence(normalizedScope).catch((error) => {
            this.emit("warning", { type: "presence-heartbeat-failed", scope: normalizedScope, error });
          });
        }, heartbeatIntervalMs);
        this.discoveryRooms.set(normalizedScope, {
          metadata,
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
        if (decrypted.messageType === "operation") {
          this.applyOperation(decrypted.payload);
          return;
        }
        if (decrypted.messageType === "presence:announce") {
          const payload = decrypted.payload || {};
          const scope = payload.scope || "main";
          const peerId = payload.peerId || decrypted.senderId;
          if (!peerId) {
            return;
          }
          const presenceMap = this.getPresenceMap(scope);
          const isNewPeerInScope = !presenceMap.has(peerId);
          this.upsertPresence(
            scope,
            peerId,
            payload.metadata || {},
            payload.ttlMs || this.defaultPresenceTtlMs,
            payload.announcedAt || this.now()
          );
          if (isNewPeerInScope && peerId !== this.nodeId && this.discoveryRooms.has(scope)) {
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
          const map = this.presenceByScope.get(scope);
          if (map && peerId && map.has(peerId)) {
            map.delete(peerId);
            this.emit("peerleft", { scope, peerId, reason: "leave" });
          }
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
      applyOperation(operation) {
        if (!operation || !operation.opId || this.appliedOperations.has(operation.opId)) {
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
            data: { ...operation.payload },
            createdAt: operation.timestamp,
            updatedAt: operation.timestamp,
            deletedAt: null,
            version: 1
          });
          this.appliedOperations.add(operation.opId);
          this.emit("change", { kind: "create", collection: operation.collectionName, id: operation.id });
          return true;
        }
        if (!current || current.deletedAt) {
          return false;
        }
        if (operation.actorId !== current.ownerId) {
          return false;
        }
        if (typeof operation.baseVersion === "number" && operation.baseVersion !== current.version) {
          return false;
        }
        if (operation.kind === "update") {
          current.data = {
            ...current.data,
            ...operation.payload
          };
          current.updatedAt = operation.timestamp;
          current.version += 1;
          this.appliedOperations.add(operation.opId);
          this.emit("change", { kind: "update", collection: operation.collectionName, id: operation.id });
          return true;
        }
        if (operation.kind === "delete") {
          current.deletedAt = operation.timestamp;
          current.updatedAt = operation.timestamp;
          current.version += 1;
          this.appliedOperations.add(operation.opId);
          this.emit("change", { kind: "delete", collection: operation.collectionName, id: operation.id });
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
        const connectionId = `dignityjs_${Math.random().toString(36).slice(2, 12)}`;
        const token = Math.random().toString(36).slice(2, 12);
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
        const parsed = new URL(this.url);
        const secure = parsed.protocol === "wss:";
        const host = parsed.hostname;
        const port = parsed.port ? Number(parsed.port) : secure ? 443 : 80;
        const path = parsed.pathname || "/";
        const key = parsed.searchParams.get("key") || "peerjs";
        return { secure, host, port, path, key };
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
    };
    var InMemoryNetworkAdapter = class {
      constructor(hub) {
        if (!hub) {
          throw new Error("InMemoryNetworkAdapter requires an InMemoryNetworkHub");
        }
        this.hub = hub;
        this.nodeId = null;
        this.messageHandlers = /* @__PURE__ */ new Set();
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
      }
      async broadcast(message) {
        if (!this.nodeId) {
          throw new Error("Network adapter has not been started");
        }
        await this.hub.broadcast(this.nodeId, message);
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
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS
    } = require_default_signaling_config();
    var VDF = require_vdf();
    var SlothPermutation = require_sloth_vdf();
    var {
      MessageSecurityService,
      DEFAULT_SECURITY_OPTIONS
    } = require_message_security_service();
    module.exports = {
      DignityP2P,
      createDefaultSignalingPool,
      SignalingPool,
      WebSocketSignalingProvider,
      PeerJSSignalingProvider,
      InMemoryNetworkHub,
      InMemoryNetworkAdapter,
      DEFAULT_CLOUDFLARE_SIGNALING_URLS,
      DEFAULT_SIGNALING_FALLBACK_URLS,
      VDF,
      SlothPermutation,
      MessageSecurityService,
      DEFAULT_SECURITY_OPTIONS
    };
  }
});
export default require_index();
//# sourceMappingURL=dignity.esm.js.map
