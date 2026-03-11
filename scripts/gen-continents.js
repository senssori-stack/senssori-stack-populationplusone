// Generate realistic continent SVG paths from GeoJSON world data
// Projects to equirectangular 800x440 map

const https = require('https');

const MAP_WIDTH = 800;
const MAP_HEIGHT = 440;

function geoToXY(lng, lat) {
    const x = ((lng + 180) / 360) * MAP_WIDTH;
    const y = ((90 - lat) / 180) * MAP_HEIGHT;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// Douglas-Peucker simplification
function simplify(points, tolerance) {
    if (points.length <= 2) return points;
    let maxDist = 0, maxIdx = 0;
    const [sx, sy] = points[0];
    const [ex, ey] = points[points.length - 1];
    for (let i = 1; i < points.length - 1; i++) {
        const [px, py] = points[i];
        const dx = ex - sx, dy = ey - sy;
        const len2 = dx * dx + dy * dy;
        let dist;
        if (len2 === 0) {
            dist = Math.sqrt((px - sx) ** 2 + (py - sy) ** 2);
        } else {
            const t = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / len2));
            const projX = sx + t * dx, projY = sy + t * dy;
            dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
        }
        if (dist > maxDist) { maxDist = dist; maxIdx = i; }
    }
    if (maxDist > tolerance) {
        const left = simplify(points.slice(0, maxIdx + 1), tolerance);
        const right = simplify(points.slice(maxIdx), tolerance);
        return left.slice(0, -1).concat(right);
    }
    return [points[0], points[points.length - 1]];
}

function coordsToPath(coords, tol) {
    const projected = coords.map(([lng, lat]) => geoToXY(lng, lat));
    const simplified = simplify(projected, tol);
    if (simplified.length < 3) return null;
    let d = `M${simplified[0][0]},${simplified[0][1]}`;
    for (let i = 1; i < simplified.length; i++) {
        d += `L${simplified[i][0]},${simplified[i][1]}`;
    }
    d += 'Z';
    return d;
}

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Node' } }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetch(res.headers.location).then(resolve, reject);
            }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

// Skip Antarctica and tiny islands
const SKIP = new Set(['ATA']);

// Minimum area threshold (in projected pixels squared) to skip tiny polygons 
const MIN_AREA = 15;

function polyArea(pts) {
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
    }
    return Math.abs(area / 2);
}

async function main() {
    console.error('Fetching GeoJSON...');
    const raw = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const geo = JSON.parse(raw);

    const tolerance = 2.0; // simplification tolerance in pixels
    const paths = [];

    for (const feature of geo.features) {
        const id = feature.id;
        if (SKIP.has(id)) continue;

        const geom = feature.geometry;
        let polys = [];
        if (geom.type === 'Polygon') {
            polys = [geom.coordinates[0]]; // outer ring only
        } else if (geom.type === 'MultiPolygon') {
            polys = geom.coordinates.map(p => p[0]); // outer ring of each
        }

        for (const ring of polys) {
            const projected = ring.map(([lng, lat]) => geoToXY(lng, lat));
            if (polyArea(projected) < MIN_AREA) continue;
            const path = coordsToPath(ring, tolerance);
            if (path) paths.push(path);
        }
    }

    // Output as a JS array
    console.log('const CONTINENTS = [');
    for (const p of paths) {
        console.log(`    '${p}',`);
    }
    console.log('];');
    console.error(`Generated ${paths.length} paths`);
}

main().catch(e => console.error(e));
