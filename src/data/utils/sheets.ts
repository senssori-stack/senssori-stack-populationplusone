// src/data/utils/sheets.ts
// Default published CSV URLs. These can be overridden by creating
// `src/config/sheets-overrides.json` with keys `SNAPSHOT_CSV_URL` and/or `POPULATIONS_CSV_URL`.

let OVERRIDES: { SNAPSHOT_CSV_URL?: string; POPULATIONS_CSV_URL?: string } = {};
try {
    // require the JSON file if present (kept optional so this works in CI/dev without the file)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OVERRIDES = require('../../config/sheets-overrides.json');
} catch (err) {
    // no overrides file — that's fine
}

export const SNAPSHOT_CSV_URL =
    OVERRIDES.SNAPSHOT_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/1v8H62aoj1OYzPE802JYsudmqI7JCa8zwFD2LMPRcs04/export?format=csv';

export const POPULATIONS_CSV_URL =
    OVERRIDES.POPULATIONS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRq_reAOPvE4ViNdG9ke2iu4oFRqKmFt3CAet1vJCMVzz3-KcpZHsAYJvipPU1AV7A10hzhHjQ5bo97/pub?gid=784058427&single=true&output=csv';

export const HISTORICAL_POPULATIONS_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRtWWqA_QoLH3ifffZjlUTdKSBZfpqQ_ATbMj9S9InIVP0aAwMMgLp22GuIXbm0E2IM03vb3qifSrgc/pub?output=csv';

export const COORDINATES_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsLHshlIpBistIu13Zej7Ks3dimQW7nyMj5bxrcfer-9I6_RXbq1ieluMYLykcMiPUrhx_6EXJYv7P/pub?output=csv';
