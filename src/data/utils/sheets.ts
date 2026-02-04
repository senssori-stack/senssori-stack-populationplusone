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
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGh6_l3Y2mPFyqsKWkmD06H49s3HVqF9a8mOuebCfoohRo9wz8TWBAjTNH8BmIarU6DCHZpXPUwU8t/pub?output=csv';

export const POPULATIONS_CSV_URL =
    OVERRIDES.POPULATIONS_CSV_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRq_reAOPvE4ViNdG9ke2iu4oFRqKmFt3CAet1vJCMVzz3-KcpZHsAYJvipPU1AV7A10hzhHjQ5bo97/pub?gid=784058427&single=true&output=csv';
