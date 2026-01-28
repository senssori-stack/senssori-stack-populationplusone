"use strict";
/**
 * Extract city coordinates from uscities.csv and create a clean dataset for Google Sheets
 * Output: city-coordinates.csv with format: city,state,state_id,lat,lng
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
function parseCSVLine(line) {
    var result = [];
    var current = '';
    var insideQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        var nextChar = line[i + 1];
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            }
            else {
                insideQuotes = !insideQuotes;
            }
        }
        else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        }
        else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
function extractCityCoordinates() {
    var _a, _b, _c, _d, _e, _f;
    var csvPath = path_1.default.join(__dirname, 'uscities', 'uscities.csv');
    if (!fs_1.default.existsSync(csvPath)) {
        console.error("\u274C File not found: ".concat(csvPath));
        process.exit(1);
    }
    var fileContent = fs_1.default.readFileSync(csvPath, 'utf-8');
    var lines = fileContent.split('\n');
    // Parse header
    var headerLine = lines[0];
    var headers = parseCSVLine(headerLine);
    var headerMap = {};
    headers.forEach(function (header, index) {
        headerMap[header.replace(/"/g, '')] = index;
    });
    console.log("\uD83D\uDCD6 Headers found: ".concat(Object.keys(headerMap).join(', ')));
    // Extract city data
    var cities = [];
    for (var i = 1; i < lines.length; i++) {
        if (i % 5000 === 0) {
            console.log("\u23F3 Processing line ".concat(i, "/").concat(lines.length, "..."));
        }
        var line = lines[i].trim();
        if (!line)
            continue;
        var fields = parseCSVLine(line);
        // Extract fields
        var city = ((_a = fields[headerMap['city']]) === null || _a === void 0 ? void 0 : _a.replace(/"/g, '').trim()) || '';
        var state_name = ((_b = fields[headerMap['state_name']]) === null || _b === void 0 ? void 0 : _b.replace(/"/g, '').trim()) || '';
        var state_id = ((_c = fields[headerMap['state_id']]) === null || _c === void 0 ? void 0 : _c.replace(/"/g, '').trim()) || '';
        var lat = ((_d = fields[headerMap['lat']]) === null || _d === void 0 ? void 0 : _d.replace(/"/g, '').trim()) || '';
        var lng = ((_e = fields[headerMap['lng']]) === null || _e === void 0 ? void 0 : _e.replace(/"/g, '').trim()) || '';
        var incorporated = ((_f = fields[headerMap['incorporated']]) === null || _f === void 0 ? void 0 : _f.replace(/"/g, '').trim()) || 'FALSE';
        // Only include incorporated cities
        if (incorporated === 'TRUE' && city && state_name && lat && lng) {
            cities.push({
                city: city,
                state: state_name,
                state_id: state_id,
                lat: lat,
                lng: lng,
            });
        }
    }
    console.log("\n\u2705 Extracted ".concat(cities.length, " incorporated cities"));
    // Sort by state and city name for easier lookup
    cities.sort(function (a, b) {
        if (a.state !== b.state) {
            return a.state.localeCompare(b.state);
        }
        return a.city.localeCompare(b.city);
    });
    // Create CSV output
    var csvHeader = 'city,state,state_id,lat,lng';
    var csvLines = cities.map(function (c) { return "\"".concat(c.city.replace(/"/g, '""'), "\",\"").concat(c.state, "\",\"").concat(c.state_id, "\",").concat(c.lat, ",").concat(c.lng); });
    var csvContent = __spreadArray([csvHeader], csvLines, true).join('\n');
    // Write to file
    var outputPath = path_1.default.join(__dirname, 'city-coordinates.csv');
    fs_1.default.writeFileSync(outputPath, csvContent, 'utf-8');
    console.log("\n\uD83D\uDCBE Saved ".concat(cities.length, " cities to: ").concat(outputPath));
    console.log("\n\uD83D\uDCCB Sample rows (first 5):");
    cities.slice(0, 5).forEach(function (c) {
        console.log("   ".concat(c.city, ", ").concat(c.state, " - Lat: ").concat(c.lat, ", Lng: ").concat(c.lng));
    });
    console.log("\n\uD83D\uDCCB Sample rows (last 5):");
    cities.slice(-5).forEach(function (c) {
        console.log("   ".concat(c.city, ", ").concat(c.state, " - Lat: ").concat(c.lat, ", Lng: ").concat(c.lng));
    });
}
extractCityCoordinates();
