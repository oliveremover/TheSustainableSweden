"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Standalone SCB sync script.
 *
 * Usage:
 *   node ./scripts/sync-scb.js            # sync all active sources
 *   node ./scripts/sync-scb.js 123        # sync single sourceId=123
 *
 * Requires Node 18+ (global fetch) or run with node --experimental-fetch on older Node.
 * Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment
 * (or in .env.local for local runs).
 *
 * This performs the same fetch/upsert logic as [src/app/api/milestones/route.ts](src/app/api/milestones/route.ts)
 * but runs as a CLI script (useful for local runs or CI).
 */
var path_1 = require("path");
var dotenv_1 = require("dotenv");
var supabase_js_1 = require("@supabase/supabase-js");
var url_1 = require("url");
var url_2 = require("url");
// dynamically import the TS helper via file URL so ts-node-esm can load it at runtime
var pxModule = await Promise.resolve("".concat((0, url_2.pathToFileURL)(path_1.default.resolve(__dirname, "../src/utils/scb/px.ts")).href)).then(function (s) { return require(s); });
var parsePxToSeries = pxModule.parsePxToSeries;
// ESM-safe __dirname replacement
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env.local") });
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = (_a = process.env.SUPABASE_SERVICE_ROLE_KEY) !== null && _a !== void 0 ? _a : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env.local).");
    process.exit(1);
}
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
function parsePxPayloadCount(text) {
    return __awaiter(this, void 0, void 0, function () {
        var m, dataBlock, tokens;
        return __generator(this, function (_a) {
            m = /DATA\s*=\s*([\s\S]*?);/i.exec(text);
            if (!m)
                return [2 /*return*/, { count: null, pxText: text }];
            dataBlock = m[1].replace(/[\r\n]+/g, " ").trim();
            tokens = dataBlock
                .split(/\s+/)
                .filter(function (t) { return /^-?\d+(?:[.,]\d+)?$/.test(t); });
            return [2 /*return*/, { count: tokens.length, pxText: text }];
        });
    });
}
function fetchWithCondition(url, etag, lastModified) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, res, ct, json, text, _a, count, pxText;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    headers = { Accept: "application/json" };
                    if (etag)
                        headers["If-None-Match"] = etag;
                    if (lastModified)
                        headers["If-Modified-Since"] = lastModified;
                    return [4 /*yield*/, fetch(url, { headers: headers })];
                case 1:
                    res = _g.sent();
                    if (res.status === 304)
                        return [2 /*return*/, { status: 304 }];
                    ct = ((_b = res.headers.get("content-type")) !== null && _b !== void 0 ? _b : "").toLowerCase();
                    if (!(ct.includes("application/json") || ct.includes("text/json"))) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return null; })];
                case 2:
                    json = _g.sent();
                    return [2 /*return*/, {
                            status: res.status,
                            json: json,
                            pxText: null,
                            payloadCount: Array.isArray(json) ? json.length : null,
                            etag: (_c = res.headers.get("etag")) !== null && _c !== void 0 ? _c : undefined,
                            lastModified: (_d = res.headers.get("last-modified")) !== null && _d !== void 0 ? _d : undefined,
                        }];
                case 3: return [4 /*yield*/, res.text().catch(function () { return ""; })];
                case 4:
                    text = _g.sent();
                    return [4 /*yield*/, parsePxPayloadCount(text)];
                case 5:
                    _a = _g.sent(), count = _a.count, pxText = _a.pxText;
                    return [2 /*return*/, {
                            status: res.status,
                            json: null,
                            pxText: pxText,
                            payloadCount: count,
                            etag: (_e = res.headers.get("etag")) !== null && _e !== void 0 ? _e : undefined,
                            lastModified: (_f = res.headers.get("last-modified")) !== null && _f !== void 0 ? _f : undefined,
                        }];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var arg, sourceId, sourcesQuery, _a, sources, sErr, results, _i, sources_1, src, cacheRow, res, transformed, rawToStore, parsed, upErr, err_1;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    arg = process.argv[2];
                    sourceId = arg ? Number(arg) : null;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 13, , 14]);
                    sourcesQuery = sourceId
                        ? supabase.from("scb_sources").select("*").eq("id", sourceId).limit(1)
                        : supabase.from("scb_sources").select("*").eq("active", true);
                    return [4 /*yield*/, sourcesQuery];
                case 2:
                    _a = _e.sent(), sources = _a.data, sErr = _a.error;
                    if (sErr)
                        throw sErr;
                    if (!sources || sources.length === 0) {
                        console.log("No sources found.");
                        return [2 /*return*/];
                    }
                    results = [];
                    _i = 0, sources_1 = sources;
                    _e.label = 3;
                case 3:
                    if (!(_i < sources_1.length)) return [3 /*break*/, 12];
                    src = sources_1[_i];
                    console.log("Syncing source.id=".concat(src.id, " url=").concat(src.url));
                    return [4 /*yield*/, supabase.from("scb_cache").select("*").eq("source_id", src.id).maybeSingle()];
                case 4:
                    cacheRow = (_e.sent()).data;
                    return [4 /*yield*/, fetchWithCondition(src.url, (_b = cacheRow === null || cacheRow === void 0 ? void 0 : cacheRow.etag) !== null && _b !== void 0 ? _b : undefined, (_c = cacheRow === null || cacheRow === void 0 ? void 0 : cacheRow.last_modified) !== null && _c !== void 0 ? _c : undefined)];
                case 5:
                    res = _e.sent();
                    if (!(res.status === 304)) return [3 /*break*/, 7];
                    return [4 /*yield*/, supabase
                            .from("scb_cache")
                            .upsert({ source_id: src.id, last_fetched: new Date().toISOString(), status: "not-modified" }, { onConflict: "source_id" })];
                case 6:
                    _e.sent();
                    results.push({ sourceId: src.id, status: "not-modified" });
                    console.log("  not-modified");
                    return [3 /*break*/, 11];
                case 7:
                    if (!(res.status >= 200 && res.status < 300)) return [3 /*break*/, 9];
                    transformed = { fetchedAt: new Date().toISOString(), payloadSummary: null, pxText: null };
                    rawToStore = null;
                    if (res.json != null) {
                        transformed.payloadSummary = Array.isArray(res.json) ? res.json.length : null;
                        rawToStore = res.json;
                    }
                    else if (res.pxText != null) {
                        transformed.payloadSummary = (_d = res.payloadCount) !== null && _d !== void 0 ? _d : null;
                        transformed.pxText = res.pxText;
                        // parse numeric series for charts
                        try {
                            parsed = parsePxToSeries(res.pxText);
                            transformed.series = parsed.values;
                            transformed.categories = parsed.categories;
                        }
                        catch (e) {
                            transformed.series = [];
                            transformed.categories = [];
                        }
                        rawToStore = null; // keep raw JSON column null for PX responses
                    }
                    return [4 /*yield*/, supabase.from("scb_cache").upsert({
                            source_id: src.id,
                            last_fetched: new Date().toISOString(),
                            etag: res.etag,
                            last_modified: res.lastModified,
                            raw: rawToStore,
                            transformed: transformed,
                            status: "ok",
                            updated_at: new Date().toISOString(),
                        }, { onConflict: "source_id" })];
                case 8:
                    upErr = (_e.sent()).error;
                    if (upErr) {
                        results.push({ sourceId: src.id, status: "error:upsert:".concat(upErr.message) });
                        console.error("  upsert error:", upErr.message);
                    }
                    else {
                        results.push({ sourceId: src.id, status: "updated", payloadSummary: transformed.payloadSummary });
                        console.log("  updated (rowsize summary: ".concat(transformed.payloadSummary, ")"));
                    }
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, supabase.from("scb_cache").upsert({ source_id: src.id, status: "error:".concat(res.status), updated_at: new Date().toISOString() }, { onConflict: "source_id" })];
                case 10:
                    _e.sent();
                    results.push({ sourceId: src.id, status: "error:".concat(res.status) });
                    console.warn("  fetch error status=".concat(res.status));
                    _e.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 3];
                case 12:
                    console.log("Sync results:", results);
                    return [3 /*break*/, 14];
                case 13:
                    err_1 = _e.sent();
                    console.error("Sync failed:", err_1);
                    process.exitCode = 2;
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
main();
