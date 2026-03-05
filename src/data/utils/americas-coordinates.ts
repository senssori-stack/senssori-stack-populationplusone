// src/data/utils/americas-coordinates.ts
// Coordinates for major cities across North America, Central America, Caribbean, and South America
// Used for astrology house placements when birth city is outside the US

export interface InternationalCity {
    name: string;
    region: string; // Province, State, or Country
    country: string;
    lat: number;
    lng: number;
}

// ═══════════════════════════════════════════════════════════════════
// CANADA — All provinces & territories, major cities
// ═══════════════════════════════════════════════════════════════════
const CANADA: InternationalCity[] = [
    // Alberta
    { name: 'Calgary', region: 'AB', country: 'Canada', lat: 51.0447, lng: -114.0719 },
    { name: 'Edmonton', region: 'AB', country: 'Canada', lat: 53.5461, lng: -113.4938 },
    { name: 'Red Deer', region: 'AB', country: 'Canada', lat: 52.2681, lng: -113.8112 },
    { name: 'Lethbridge', region: 'AB', country: 'Canada', lat: 49.6935, lng: -112.8418 },
    { name: 'Medicine Hat', region: 'AB', country: 'Canada', lat: 50.0405, lng: -110.6764 },
    { name: 'Grande Prairie', region: 'AB', country: 'Canada', lat: 55.1707, lng: -118.7953 },
    { name: 'Airdrie', region: 'AB', country: 'Canada', lat: 51.2917, lng: -114.0144 },
    { name: 'Spruce Grove', region: 'AB', country: 'Canada', lat: 53.5451, lng: -113.9009 },
    { name: 'Fort McMurray', region: 'AB', country: 'Canada', lat: 56.7264, lng: -111.3803 },
    { name: 'Banff', region: 'AB', country: 'Canada', lat: 51.1784, lng: -115.5708 },
    // British Columbia
    { name: 'Vancouver', region: 'BC', country: 'Canada', lat: 49.2827, lng: -123.1207 },
    { name: 'Victoria', region: 'BC', country: 'Canada', lat: 48.4284, lng: -123.3656 },
    { name: 'Surrey', region: 'BC', country: 'Canada', lat: 49.1913, lng: -122.8490 },
    { name: 'Burnaby', region: 'BC', country: 'Canada', lat: 49.2488, lng: -122.9805 },
    { name: 'Kelowna', region: 'BC', country: 'Canada', lat: 49.8880, lng: -119.4960 },
    { name: 'Kamloops', region: 'BC', country: 'Canada', lat: 50.6745, lng: -120.3273 },
    { name: 'Nanaimo', region: 'BC', country: 'Canada', lat: 49.1659, lng: -123.9401 },
    { name: 'Prince George', region: 'BC', country: 'Canada', lat: 53.9171, lng: -122.7497 },
    { name: 'Abbotsford', region: 'BC', country: 'Canada', lat: 49.0504, lng: -122.3045 },
    { name: 'Richmond', region: 'BC', country: 'Canada', lat: 49.1666, lng: -123.1336 },
    { name: 'Coquitlam', region: 'BC', country: 'Canada', lat: 49.2838, lng: -122.7932 },
    { name: 'Whistler', region: 'BC', country: 'Canada', lat: 50.1163, lng: -122.9574 },
    // Manitoba
    { name: 'Winnipeg', region: 'MB', country: 'Canada', lat: 49.8951, lng: -97.1384 },
    { name: 'Brandon', region: 'MB', country: 'Canada', lat: 49.8440, lng: -99.9539 },
    { name: 'Steinbach', region: 'MB', country: 'Canada', lat: 49.5258, lng: -96.6839 },
    { name: 'Thompson', region: 'MB', country: 'Canada', lat: 55.7433, lng: -97.8553 },
    // New Brunswick
    { name: 'Moncton', region: 'NB', country: 'Canada', lat: 46.0878, lng: -64.7782 },
    { name: 'Saint John', region: 'NB', country: 'Canada', lat: 45.2733, lng: -66.0633 },
    { name: 'Fredericton', region: 'NB', country: 'Canada', lat: 45.9636, lng: -66.6431 },
    { name: 'Dieppe', region: 'NB', country: 'Canada', lat: 46.0796, lng: -64.6811 },
    // Newfoundland and Labrador
    { name: "St. John's", region: 'NL', country: 'Canada', lat: 47.5615, lng: -52.7126 },
    { name: 'Corner Brook', region: 'NL', country: 'Canada', lat: 48.9510, lng: -57.9526 },
    { name: 'Mount Pearl', region: 'NL', country: 'Canada', lat: 47.5189, lng: -52.8058 },
    // Nova Scotia
    { name: 'Halifax', region: 'NS', country: 'Canada', lat: 44.6488, lng: -63.5752 },
    { name: 'Dartmouth', region: 'NS', country: 'Canada', lat: 44.6713, lng: -63.5728 },
    { name: 'Sydney', region: 'NS', country: 'Canada', lat: 46.1368, lng: -60.1942 },
    { name: 'Truro', region: 'NS', country: 'Canada', lat: 45.3647, lng: -63.2800 },
    // Ontario
    { name: 'Toronto', region: 'ON', country: 'Canada', lat: 43.6532, lng: -79.3832 },
    { name: 'Ottawa', region: 'ON', country: 'Canada', lat: 45.4215, lng: -75.6972 },
    { name: 'Mississauga', region: 'ON', country: 'Canada', lat: 43.5890, lng: -79.6441 },
    { name: 'Brampton', region: 'ON', country: 'Canada', lat: 43.7315, lng: -79.7624 },
    { name: 'Hamilton', region: 'ON', country: 'Canada', lat: 43.2557, lng: -79.8711 },
    { name: 'London', region: 'ON', country: 'Canada', lat: 42.9849, lng: -81.2453 },
    { name: 'Markham', region: 'ON', country: 'Canada', lat: 43.8561, lng: -79.3370 },
    { name: 'Vaughan', region: 'ON', country: 'Canada', lat: 43.8361, lng: -79.4981 },
    { name: 'Kitchener', region: 'ON', country: 'Canada', lat: 43.4516, lng: -80.4925 },
    { name: 'Windsor', region: 'ON', country: 'Canada', lat: 42.3149, lng: -83.0364 },
    { name: 'Richmond Hill', region: 'ON', country: 'Canada', lat: 43.8828, lng: -79.4403 },
    { name: 'Oakville', region: 'ON', country: 'Canada', lat: 43.4675, lng: -79.6877 },
    { name: 'Burlington', region: 'ON', country: 'Canada', lat: 43.3255, lng: -79.7990 },
    { name: 'Oshawa', region: 'ON', country: 'Canada', lat: 43.8971, lng: -78.8658 },
    { name: 'St. Catharines', region: 'ON', country: 'Canada', lat: 43.1594, lng: -79.2469 },
    { name: 'Barrie', region: 'ON', country: 'Canada', lat: 44.3894, lng: -79.6903 },
    { name: 'Cambridge', region: 'ON', country: 'Canada', lat: 43.3616, lng: -80.3144 },
    { name: 'Guelph', region: 'ON', country: 'Canada', lat: 43.5448, lng: -80.2482 },
    { name: 'Kingston', region: 'ON', country: 'Canada', lat: 44.2312, lng: -76.4860 },
    { name: 'Thunder Bay', region: 'ON', country: 'Canada', lat: 48.3809, lng: -89.2477 },
    { name: 'Waterloo', region: 'ON', country: 'Canada', lat: 43.4643, lng: -80.5204 },
    { name: 'Sudbury', region: 'ON', country: 'Canada', lat: 46.4917, lng: -80.9930 },
    { name: 'Peterborough', region: 'ON', country: 'Canada', lat: 44.3091, lng: -78.3197 },
    { name: 'Niagara Falls', region: 'ON', country: 'Canada', lat: 43.0896, lng: -79.0849 },
    { name: 'Whitby', region: 'ON', country: 'Canada', lat: 43.8975, lng: -78.9429 },
    { name: 'Ajax', region: 'ON', country: 'Canada', lat: 43.8509, lng: -79.0204 },
    { name: 'Pickering', region: 'ON', country: 'Canada', lat: 43.8354, lng: -79.0868 },
    { name: 'Brantford', region: 'ON', country: 'Canada', lat: 43.1394, lng: -80.2644 },
    { name: 'Newmarket', region: 'ON', country: 'Canada', lat: 44.0592, lng: -79.4613 },
    { name: 'Sault Ste. Marie', region: 'ON', country: 'Canada', lat: 46.5219, lng: -84.3461 },
    { name: 'North Bay', region: 'ON', country: 'Canada', lat: 46.3091, lng: -79.4608 },
    { name: 'Sarnia', region: 'ON', country: 'Canada', lat: 42.9745, lng: -82.4066 },
    { name: 'Belleville', region: 'ON', country: 'Canada', lat: 44.1628, lng: -77.3832 },
    // Prince Edward Island
    { name: 'Charlottetown', region: 'PE', country: 'Canada', lat: 46.2382, lng: -63.1311 },
    // Quebec
    { name: 'Montreal', region: 'QC', country: 'Canada', lat: 45.5017, lng: -73.5673 },
    { name: 'Quebec City', region: 'QC', country: 'Canada', lat: 46.8139, lng: -71.2080 },
    { name: 'Laval', region: 'QC', country: 'Canada', lat: 45.6066, lng: -73.7124 },
    { name: 'Gatineau', region: 'QC', country: 'Canada', lat: 45.4765, lng: -75.7013 },
    { name: 'Longueuil', region: 'QC', country: 'Canada', lat: 45.5312, lng: -73.5185 },
    { name: 'Sherbrooke', region: 'QC', country: 'Canada', lat: 45.4042, lng: -71.8929 },
    { name: 'Saguenay', region: 'QC', country: 'Canada', lat: 48.4279, lng: -71.0548 },
    { name: 'Lévis', region: 'QC', country: 'Canada', lat: 46.8032, lng: -71.1779 },
    { name: 'Trois-Rivières', region: 'QC', country: 'Canada', lat: 46.3432, lng: -72.5418 },
    { name: 'Terrebonne', region: 'QC', country: 'Canada', lat: 45.6960, lng: -73.6473 },
    { name: 'Saint-Jean-sur-Richelieu', region: 'QC', country: 'Canada', lat: 45.3070, lng: -73.2628 },
    { name: 'Drummondville', region: 'QC', country: 'Canada', lat: 45.8838, lng: -72.4843 },
    { name: 'Granby', region: 'QC', country: 'Canada', lat: 45.4000, lng: -72.7333 },
    // Saskatchewan
    { name: 'Saskatoon', region: 'SK', country: 'Canada', lat: 52.1332, lng: -106.6700 },
    { name: 'Regina', region: 'SK', country: 'Canada', lat: 50.4452, lng: -104.6189 },
    { name: 'Prince Albert', region: 'SK', country: 'Canada', lat: 53.2033, lng: -105.7531 },
    { name: 'Moose Jaw', region: 'SK', country: 'Canada', lat: 50.3934, lng: -105.5519 },
    // Territories
    { name: 'Whitehorse', region: 'YT', country: 'Canada', lat: 60.7212, lng: -135.0568 },
    { name: 'Yellowknife', region: 'NT', country: 'Canada', lat: 62.4540, lng: -114.3718 },
    { name: 'Iqaluit', region: 'NU', country: 'Canada', lat: 63.7467, lng: -68.5170 },
];

// ═══════════════════════════════════════════════════════════════════
// MEXICO — All 32 states, major cities
// ═══════════════════════════════════════════════════════════════════
const MEXICO: InternationalCity[] = [
    // Aguascalientes
    { name: 'Aguascalientes', region: 'Aguascalientes', country: 'Mexico', lat: 21.8818, lng: -102.2916 },
    // Baja California
    { name: 'Tijuana', region: 'Baja California', country: 'Mexico', lat: 32.5149, lng: -117.0382 },
    { name: 'Mexicali', region: 'Baja California', country: 'Mexico', lat: 32.6245, lng: -115.4523 },
    { name: 'Ensenada', region: 'Baja California', country: 'Mexico', lat: 31.8667, lng: -116.5964 },
    { name: 'Rosarito', region: 'Baja California', country: 'Mexico', lat: 32.3629, lng: -117.0584 },
    // Baja California Sur
    { name: 'La Paz', region: 'Baja California Sur', country: 'Mexico', lat: 24.1426, lng: -110.3128 },
    { name: 'Los Cabos', region: 'Baja California Sur', country: 'Mexico', lat: 22.8905, lng: -109.9167 },
    { name: 'Cabo San Lucas', region: 'Baja California Sur', country: 'Mexico', lat: 22.8905, lng: -109.9167 },
    { name: 'San José del Cabo', region: 'Baja California Sur', country: 'Mexico', lat: 23.0621, lng: -109.6985 },
    // Campeche
    { name: 'Campeche', region: 'Campeche', country: 'Mexico', lat: 19.8301, lng: -90.5349 },
    // Chiapas
    { name: 'Tuxtla Gutiérrez', region: 'Chiapas', country: 'Mexico', lat: 16.7528, lng: -93.1152 },
    { name: 'San Cristóbal de las Casas', region: 'Chiapas', country: 'Mexico', lat: 16.7370, lng: -92.6376 },
    { name: 'Tapachula', region: 'Chiapas', country: 'Mexico', lat: 14.9039, lng: -92.2575 },
    // Chihuahua
    { name: 'Chihuahua', region: 'Chihuahua', country: 'Mexico', lat: 28.6353, lng: -106.0889 },
    { name: 'Ciudad Juárez', region: 'Chihuahua', country: 'Mexico', lat: 31.6904, lng: -106.4245 },
    { name: 'Delicias', region: 'Chihuahua', country: 'Mexico', lat: 28.1927, lng: -105.4710 },
    { name: 'Cuauhtémoc', region: 'Chihuahua', country: 'Mexico', lat: 28.4050, lng: -106.8667 },
    // Coahuila
    { name: 'Saltillo', region: 'Coahuila', country: 'Mexico', lat: 25.4217, lng: -100.9921 },
    { name: 'Torreón', region: 'Coahuila', country: 'Mexico', lat: 25.5428, lng: -103.4068 },
    { name: 'Monclova', region: 'Coahuila', country: 'Mexico', lat: 26.9073, lng: -101.4215 },
    { name: 'Piedras Negras', region: 'Coahuila', country: 'Mexico', lat: 28.7000, lng: -100.5236 },
    // Colima
    { name: 'Colima', region: 'Colima', country: 'Mexico', lat: 19.2433, lng: -103.7250 },
    { name: 'Manzanillo', region: 'Colima', country: 'Mexico', lat: 19.1106, lng: -104.3235 },
    // Durango
    { name: 'Durango', region: 'Durango', country: 'Mexico', lat: 24.0277, lng: -104.6532 },
    // Estado de México
    { name: 'Ecatepec', region: 'Estado de México', country: 'Mexico', lat: 19.6016, lng: -99.0500 },
    { name: 'Nezahualcóyotl', region: 'Estado de México', country: 'Mexico', lat: 19.4000, lng: -99.0167 },
    { name: 'Naucalpan', region: 'Estado de México', country: 'Mexico', lat: 19.4785, lng: -99.2396 },
    { name: 'Toluca', region: 'Estado de México', country: 'Mexico', lat: 19.2826, lng: -99.6557 },
    { name: 'Tlalnepantla', region: 'Estado de México', country: 'Mexico', lat: 19.5370, lng: -99.1977 },
    { name: 'Chimalhuacán', region: 'Estado de México', country: 'Mexico', lat: 19.4369, lng: -98.9543 },
    { name: 'Atizapán de Zaragoza', region: 'Estado de México', country: 'Mexico', lat: 19.5578, lng: -99.2573 },
    // Guanajuato
    { name: 'León', region: 'Guanajuato', country: 'Mexico', lat: 21.1250, lng: -101.6860 },
    { name: 'Guanajuato', region: 'Guanajuato', country: 'Mexico', lat: 21.0190, lng: -101.2574 },
    { name: 'Irapuato', region: 'Guanajuato', country: 'Mexico', lat: 20.6767, lng: -101.3556 },
    { name: 'Celaya', region: 'Guanajuato', country: 'Mexico', lat: 20.5239, lng: -100.8156 },
    { name: 'Salamanca', region: 'Guanajuato', country: 'Mexico', lat: 20.5728, lng: -101.1894 },
    { name: 'San Miguel de Allende', region: 'Guanajuato', country: 'Mexico', lat: 20.9144, lng: -100.7452 },
    // Guerrero
    { name: 'Acapulco', region: 'Guerrero', country: 'Mexico', lat: 16.8531, lng: -99.8237 },
    { name: 'Chilpancingo', region: 'Guerrero', country: 'Mexico', lat: 17.5506, lng: -99.5007 },
    { name: 'Zihuatanejo', region: 'Guerrero', country: 'Mexico', lat: 17.6413, lng: -101.5513 },
    // Hidalgo
    { name: 'Pachuca', region: 'Hidalgo', country: 'Mexico', lat: 20.1011, lng: -98.7591 },
    // Jalisco
    { name: 'Guadalajara', region: 'Jalisco', country: 'Mexico', lat: 20.6597, lng: -103.3496 },
    { name: 'Zapopan', region: 'Jalisco', country: 'Mexico', lat: 20.7215, lng: -103.3888 },
    { name: 'Tlaquepaque', region: 'Jalisco', country: 'Mexico', lat: 20.6408, lng: -103.3125 },
    { name: 'Tonalá', region: 'Jalisco', country: 'Mexico', lat: 20.6236, lng: -103.2347 },
    { name: 'Puerto Vallarta', region: 'Jalisco', country: 'Mexico', lat: 20.6534, lng: -105.2253 },
    // Mexico City (CDMX)
    { name: 'Mexico City', region: 'CDMX', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
    { name: 'Ciudad de México', region: 'CDMX', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
    // Michoacán
    { name: 'Morelia', region: 'Michoacán', country: 'Mexico', lat: 19.7060, lng: -101.1950 },
    { name: 'Uruapan', region: 'Michoacán', country: 'Mexico', lat: 19.4167, lng: -102.0667 },
    { name: 'Zamora', region: 'Michoacán', country: 'Mexico', lat: 19.9833, lng: -102.2833 },
    { name: 'Lázaro Cárdenas', region: 'Michoacán', country: 'Mexico', lat: 17.9583, lng: -102.2000 },
    // Morelos
    { name: 'Cuernavaca', region: 'Morelos', country: 'Mexico', lat: 18.9242, lng: -99.2216 },
    // Nayarit
    { name: 'Tepic', region: 'Nayarit', country: 'Mexico', lat: 21.5042, lng: -104.8950 },
    // Nuevo León
    { name: 'Monterrey', region: 'Nuevo León', country: 'Mexico', lat: 25.6866, lng: -100.3161 },
    { name: 'San Nicolás de los Garza', region: 'Nuevo León', country: 'Mexico', lat: 25.7500, lng: -100.2833 },
    { name: 'Guadalupe', region: 'Nuevo León', country: 'Mexico', lat: 25.6775, lng: -100.2597 },
    { name: 'Apodaca', region: 'Nuevo León', country: 'Mexico', lat: 25.7833, lng: -100.1833 },
    { name: 'Santa Catarina', region: 'Nuevo León', country: 'Mexico', lat: 25.6743, lng: -100.4596 },
    // Oaxaca
    { name: 'Oaxaca', region: 'Oaxaca', country: 'Mexico', lat: 17.0732, lng: -96.7266 },
    { name: 'Oaxaca de Juárez', region: 'Oaxaca', country: 'Mexico', lat: 17.0732, lng: -96.7266 },
    // Puebla
    { name: 'Puebla', region: 'Puebla', country: 'Mexico', lat: 19.0414, lng: -98.2063 },
    { name: 'Tehuacán', region: 'Puebla', country: 'Mexico', lat: 18.4615, lng: -97.3926 },
    // Querétaro
    { name: 'Querétaro', region: 'Querétaro', country: 'Mexico', lat: 20.5888, lng: -100.3899 },
    { name: 'San Juan del Río', region: 'Querétaro', country: 'Mexico', lat: 20.3883, lng: -100.0008 },
    // Quintana Roo
    { name: 'Cancún', region: 'Quintana Roo', country: 'Mexico', lat: 21.1619, lng: -86.8515 },
    { name: 'Playa del Carmen', region: 'Quintana Roo', country: 'Mexico', lat: 20.6296, lng: -87.0739 },
    { name: 'Chetumal', region: 'Quintana Roo', country: 'Mexico', lat: 18.5001, lng: -88.2960 },
    { name: 'Tulum', region: 'Quintana Roo', country: 'Mexico', lat: 20.2115, lng: -87.4652 },
    // San Luis Potosí
    { name: 'San Luis Potosí', region: 'San Luis Potosí', country: 'Mexico', lat: 22.1565, lng: -100.9855 },
    // Sinaloa
    { name: 'Culiacán', region: 'Sinaloa', country: 'Mexico', lat: 24.7994, lng: -107.3940 },
    { name: 'Mazatlán', region: 'Sinaloa', country: 'Mexico', lat: 23.2494, lng: -106.4111 },
    { name: 'Los Mochis', region: 'Sinaloa', country: 'Mexico', lat: 25.7903, lng: -108.9936 },
    // Sonora
    { name: 'Hermosillo', region: 'Sonora', country: 'Mexico', lat: 29.0729, lng: -110.9559 },
    { name: 'Ciudad Obregón', region: 'Sonora', country: 'Mexico', lat: 27.4867, lng: -109.9405 },
    { name: 'Nogales', region: 'Sonora', country: 'Mexico', lat: 31.3084, lng: -110.9456 },
    { name: 'San Luis Río Colorado', region: 'Sonora', country: 'Mexico', lat: 32.4553, lng: -114.7717 },
    // Tabasco
    { name: 'Villahermosa', region: 'Tabasco', country: 'Mexico', lat: 17.9869, lng: -92.9303 },
    // Tamaulipas
    { name: 'Reynosa', region: 'Tamaulipas', country: 'Mexico', lat: 26.0925, lng: -98.2771 },
    { name: 'Matamoros', region: 'Tamaulipas', country: 'Mexico', lat: 25.8697, lng: -97.5028 },
    { name: 'Tampico', region: 'Tamaulipas', country: 'Mexico', lat: 22.2331, lng: -97.8611 },
    { name: 'Ciudad Victoria', region: 'Tamaulipas', country: 'Mexico', lat: 23.7369, lng: -99.1411 },
    { name: 'Nuevo Laredo', region: 'Tamaulipas', country: 'Mexico', lat: 27.4759, lng: -99.5073 },
    // Tlaxcala
    { name: 'Tlaxcala', region: 'Tlaxcala', country: 'Mexico', lat: 19.3182, lng: -98.2375 },
    // Veracruz
    { name: 'Veracruz', region: 'Veracruz', country: 'Mexico', lat: 19.1738, lng: -96.1342 },
    { name: 'Xalapa', region: 'Veracruz', country: 'Mexico', lat: 19.5438, lng: -96.9274 },
    { name: 'Coatzacoalcos', region: 'Veracruz', country: 'Mexico', lat: 18.1500, lng: -94.4333 },
    { name: 'Poza Rica', region: 'Veracruz', country: 'Mexico', lat: 20.5333, lng: -97.4500 },
    { name: 'Córdoba', region: 'Veracruz', country: 'Mexico', lat: 18.8833, lng: -96.9333 },
    { name: 'Orizaba', region: 'Veracruz', country: 'Mexico', lat: 18.8504, lng: -97.0997 },
    // Yucatán
    { name: 'Mérida', region: 'Yucatán', country: 'Mexico', lat: 20.9674, lng: -89.5926 },
    { name: 'Valladolid', region: 'Yucatán', country: 'Mexico', lat: 20.6897, lng: -88.2000 },
    // Zacatecas
    { name: 'Zacatecas', region: 'Zacatecas', country: 'Mexico', lat: 22.7709, lng: -102.5833 },
    { name: 'Fresnillo', region: 'Zacatecas', country: 'Mexico', lat: 23.1747, lng: -102.8694 },
];

// ═══════════════════════════════════════════════════════════════════
// CENTRAL AMERICA
// ═══════════════════════════════════════════════════════════════════
const CENTRAL_AMERICA: InternationalCity[] = [
    // Belize
    { name: 'Belize City', region: 'Belize', country: 'Belize', lat: 17.4985, lng: -88.1866 },
    { name: 'Belmopan', region: 'Cayo', country: 'Belize', lat: 17.2510, lng: -88.7590 },
    { name: 'San Ignacio', region: 'Cayo', country: 'Belize', lat: 17.1592, lng: -89.0717 },
    { name: 'Orange Walk', region: 'Orange Walk', country: 'Belize', lat: 18.0833, lng: -88.5500 },
    // Guatemala
    { name: 'Guatemala City', region: 'Guatemala', country: 'Guatemala', lat: 14.6349, lng: -90.5069 },
    { name: 'Mixco', region: 'Guatemala', country: 'Guatemala', lat: 14.6333, lng: -90.6000 },
    { name: 'Villa Nueva', region: 'Guatemala', country: 'Guatemala', lat: 14.5257, lng: -90.5870 },
    { name: 'Quetzaltenango', region: 'Quetzaltenango', country: 'Guatemala', lat: 14.8333, lng: -91.5167 },
    { name: 'Escuintla', region: 'Escuintla', country: 'Guatemala', lat: 14.2990, lng: -90.7856 },
    { name: 'Antigua Guatemala', region: 'Sacatepéquez', country: 'Guatemala', lat: 14.5586, lng: -90.7295 },
    { name: 'Cobán', region: 'Alta Verapaz', country: 'Guatemala', lat: 15.4722, lng: -90.3708 },
    { name: 'Huehuetenango', region: 'Huehuetenango', country: 'Guatemala', lat: 15.3192, lng: -91.4717 },
    // Honduras
    { name: 'Tegucigalpa', region: 'Francisco Morazán', country: 'Honduras', lat: 14.0723, lng: -87.1921 },
    { name: 'San Pedro Sula', region: 'Cortés', country: 'Honduras', lat: 15.5000, lng: -88.0333 },
    { name: 'La Ceiba', region: 'Atlántida', country: 'Honduras', lat: 15.7631, lng: -86.7919 },
    { name: 'Choloma', region: 'Cortés', country: 'Honduras', lat: 15.6100, lng: -87.9553 },
    { name: 'Comayagua', region: 'Comayagua', country: 'Honduras', lat: 14.4519, lng: -87.6394 },
    // El Salvador
    { name: 'San Salvador', region: 'San Salvador', country: 'El Salvador', lat: 13.6929, lng: -89.2182 },
    { name: 'Santa Ana', region: 'Santa Ana', country: 'El Salvador', lat: 13.9942, lng: -89.5597 },
    { name: 'San Miguel', region: 'San Miguel', country: 'El Salvador', lat: 13.4833, lng: -88.1833 },
    { name: 'Soyapango', region: 'San Salvador', country: 'El Salvador', lat: 13.7167, lng: -89.1500 },
    { name: 'Santa Tecla', region: 'La Libertad', country: 'El Salvador', lat: 13.6769, lng: -89.2797 },
    // Nicaragua
    { name: 'Managua', region: 'Managua', country: 'Nicaragua', lat: 12.1150, lng: -86.2362 },
    { name: 'León', region: 'León', country: 'Nicaragua', lat: 12.4345, lng: -86.8809 },
    { name: 'Masaya', region: 'Masaya', country: 'Nicaragua', lat: 11.9750, lng: -86.0944 },
    { name: 'Matagalpa', region: 'Matagalpa', country: 'Nicaragua', lat: 12.9167, lng: -85.9167 },
    { name: 'Granada', region: 'Granada', country: 'Nicaragua', lat: 11.9344, lng: -85.9560 },
    // Costa Rica
    { name: 'San José', region: 'San José', country: 'Costa Rica', lat: 9.9281, lng: -84.0907 },
    { name: 'Alajuela', region: 'Alajuela', country: 'Costa Rica', lat: 10.0162, lng: -84.2115 },
    { name: 'Cartago', region: 'Cartago', country: 'Costa Rica', lat: 9.8645, lng: -83.9193 },
    { name: 'Heredia', region: 'Heredia', country: 'Costa Rica', lat: 10.0024, lng: -84.1165 },
    { name: 'Liberia', region: 'Guanacaste', country: 'Costa Rica', lat: 10.6347, lng: -85.4407 },
    { name: 'Limón', region: 'Limón', country: 'Costa Rica', lat: 9.9907, lng: -83.0360 },
    { name: 'Puntarenas', region: 'Puntarenas', country: 'Costa Rica', lat: 9.9762, lng: -84.8385 },
    // Panama
    { name: 'Panama City', region: 'Panamá', country: 'Panama', lat: 8.9824, lng: -79.5199 },
    { name: 'Colón', region: 'Colón', country: 'Panama', lat: 9.3547, lng: -79.9015 },
    { name: 'David', region: 'Chiriquí', country: 'Panama', lat: 8.4276, lng: -82.4310 },
    { name: 'Santiago', region: 'Veraguas', country: 'Panama', lat: 8.1000, lng: -80.9833 },
    { name: 'Chitré', region: 'Herrera', country: 'Panama', lat: 7.9583, lng: -80.4272 },
    { name: 'Bocas del Toro', region: 'Bocas del Toro', country: 'Panama', lat: 9.3404, lng: -82.2419 },
];

// ═══════════════════════════════════════════════════════════════════
// CARIBBEAN
// ═══════════════════════════════════════════════════════════════════
const CARIBBEAN: InternationalCity[] = [
    // Cuba
    { name: 'Havana', region: 'La Habana', country: 'Cuba', lat: 23.1136, lng: -82.3666 },
    { name: 'La Habana', region: 'La Habana', country: 'Cuba', lat: 23.1136, lng: -82.3666 },
    { name: 'Santiago de Cuba', region: 'Santiago de Cuba', country: 'Cuba', lat: 20.0247, lng: -75.8219 },
    { name: 'Camagüey', region: 'Camagüey', country: 'Cuba', lat: 21.3808, lng: -77.9167 },
    { name: 'Holguín', region: 'Holguín', country: 'Cuba', lat: 20.7200, lng: -76.2600 },
    { name: 'Santa Clara', region: 'Villa Clara', country: 'Cuba', lat: 22.4064, lng: -79.9554 },
    { name: 'Cienfuegos', region: 'Cienfuegos', country: 'Cuba', lat: 22.1456, lng: -80.4353 },
    { name: 'Matanzas', region: 'Matanzas', country: 'Cuba', lat: 23.0416, lng: -81.5775 },
    { name: 'Varadero', region: 'Matanzas', country: 'Cuba', lat: 23.1533, lng: -81.2447 },
    // Jamaica
    { name: 'Kingston', region: 'Kingston', country: 'Jamaica', lat: 18.0179, lng: -76.8099 },
    { name: 'Montego Bay', region: 'St. James', country: 'Jamaica', lat: 18.4762, lng: -77.8939 },
    { name: 'Spanish Town', region: 'St. Catherine', country: 'Jamaica', lat: 17.9912, lng: -76.9553 },
    { name: 'Portmore', region: 'St. Catherine', country: 'Jamaica', lat: 17.9583, lng: -76.8744 },
    { name: 'Mandeville', region: 'Manchester', country: 'Jamaica', lat: 18.0417, lng: -77.5000 },
    { name: 'Ocho Rios', region: 'St. Ann', country: 'Jamaica', lat: 18.4075, lng: -77.1003 },
    // Haiti
    { name: 'Port-au-Prince', region: 'Ouest', country: 'Haiti', lat: 18.5944, lng: -72.3074 },
    { name: 'Cap-Haïtien', region: 'Nord', country: 'Haiti', lat: 19.7578, lng: -72.2044 },
    { name: 'Gonaïves', region: 'Artibonite', country: 'Haiti', lat: 19.4500, lng: -72.6833 },
    { name: 'Les Cayes', region: 'Sud', country: 'Haiti', lat: 18.1940, lng: -73.7510 },
    // Dominican Republic
    { name: 'Santo Domingo', region: 'Distrito Nacional', country: 'Dominican Republic', lat: 18.4861, lng: -69.9312 },
    { name: 'Santiago de los Caballeros', region: 'Santiago', country: 'Dominican Republic', lat: 19.4500, lng: -70.7000 },
    { name: 'San Pedro de Macorís', region: 'San Pedro', country: 'Dominican Republic', lat: 18.4500, lng: -69.3000 },
    { name: 'La Romana', region: 'La Romana', country: 'Dominican Republic', lat: 18.4273, lng: -68.9728 },
    { name: 'Punta Cana', region: 'La Altagracia', country: 'Dominican Republic', lat: 18.5601, lng: -68.3725 },
    { name: 'San Cristóbal', region: 'San Cristóbal', country: 'Dominican Republic', lat: 18.4167, lng: -70.1000 },
    { name: 'Puerto Plata', region: 'Puerto Plata', country: 'Dominican Republic', lat: 19.7904, lng: -70.6877 },
    // Puerto Rico (US Territory)
    { name: 'San Juan', region: 'PR', country: 'Puerto Rico', lat: 18.4655, lng: -66.1057 },
    { name: 'Bayamón', region: 'PR', country: 'Puerto Rico', lat: 18.3985, lng: -66.1553 },
    { name: 'Carolina', region: 'PR', country: 'Puerto Rico', lat: 18.3811, lng: -65.9572 },
    { name: 'Ponce', region: 'PR', country: 'Puerto Rico', lat: 18.0111, lng: -66.6141 },
    { name: 'Caguas', region: 'PR', country: 'Puerto Rico', lat: 18.2341, lng: -66.0485 },
    { name: 'Mayagüez', region: 'PR', country: 'Puerto Rico', lat: 18.2013, lng: -67.1397 },
    { name: 'Aguadilla', region: 'PR', country: 'Puerto Rico', lat: 18.4274, lng: -67.1541 },
    { name: 'Arecibo', region: 'PR', country: 'Puerto Rico', lat: 18.4726, lng: -66.7157 },
    // Trinidad and Tobago
    { name: 'Port of Spain', region: 'Port of Spain', country: 'Trinidad and Tobago', lat: 10.6596, lng: -61.5086 },
    { name: 'San Fernando', region: 'San Fernando', country: 'Trinidad and Tobago', lat: 10.2833, lng: -61.4667 },
    { name: 'Chaguanas', region: 'Chaguanas', country: 'Trinidad and Tobago', lat: 10.5167, lng: -61.4117 },
    // Barbados
    { name: 'Bridgetown', region: 'St. Michael', country: 'Barbados', lat: 13.0969, lng: -59.6145 },
    // Bahamas
    { name: 'Nassau', region: 'New Providence', country: 'Bahamas', lat: 25.0343, lng: -77.3963 },
    { name: 'Freeport', region: 'Grand Bahama', country: 'Bahamas', lat: 26.5285, lng: -78.6966 },
    // Curaçao
    { name: 'Willemstad', region: 'Curaçao', country: 'Curaçao', lat: 12.1696, lng: -68.9900 },
    // Aruba
    { name: 'Oranjestad', region: 'Aruba', country: 'Aruba', lat: 12.5186, lng: -70.0358 },
    // Martinique
    { name: 'Fort-de-France', region: 'Martinique', country: 'Martinique', lat: 14.6160, lng: -61.0588 },
    // Guadeloupe
    { name: 'Pointe-à-Pitre', region: 'Guadeloupe', country: 'Guadeloupe', lat: 16.2411, lng: -61.5331 },
    // US Virgin Islands
    { name: 'Charlotte Amalie', region: 'VI', country: 'US Virgin Islands', lat: 18.3358, lng: -64.9307 },
    // Bermuda
    { name: 'Hamilton', region: 'Bermuda', country: 'Bermuda', lat: 32.2948, lng: -64.7839 },
    // Cayman Islands
    { name: 'George Town', region: 'Grand Cayman', country: 'Cayman Islands', lat: 19.2951, lng: -81.3814 },
    // St. Lucia
    { name: 'Castries', region: 'Castries', country: 'Saint Lucia', lat: 14.0101, lng: -60.9870 },
    // Antigua and Barbuda
    { name: "St. John's", region: 'Saint John', country: 'Antigua and Barbuda', lat: 17.1175, lng: -61.8456 },
    // St. Kitts and Nevis
    { name: 'Basseterre', region: 'Saint George Basseterre', country: 'Saint Kitts and Nevis', lat: 17.2948, lng: -62.7261 },
    // Grenada
    { name: "St. George's", region: "St. George", country: 'Grenada', lat: 12.0564, lng: -61.7485 },
    // Dominica
    { name: 'Roseau', region: 'St. George', country: 'Dominica', lat: 15.3010, lng: -61.3883 },
    // St. Vincent
    { name: 'Kingstown', region: 'Saint George', country: 'Saint Vincent and the Grenadines', lat: 13.1587, lng: -61.2248 },
];

// ═══════════════════════════════════════════════════════════════════
// SOUTH AMERICA
// ═══════════════════════════════════════════════════════════════════
const SOUTH_AMERICA: InternationalCity[] = [
    // Argentina
    { name: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
    { name: 'Córdoba', region: 'Córdoba', country: 'Argentina', lat: -31.4201, lng: -64.1888 },
    { name: 'Rosario', region: 'Santa Fe', country: 'Argentina', lat: -32.9468, lng: -60.6393 },
    { name: 'Mendoza', region: 'Mendoza', country: 'Argentina', lat: -32.8895, lng: -68.8458 },
    { name: 'San Miguel de Tucumán', region: 'Tucumán', country: 'Argentina', lat: -26.8083, lng: -65.2176 },
    { name: 'La Plata', region: 'Buenos Aires', country: 'Argentina', lat: -34.9215, lng: -57.9545 },
    { name: 'Mar del Plata', region: 'Buenos Aires', country: 'Argentina', lat: -38.0023, lng: -57.5575 },
    { name: 'Salta', region: 'Salta', country: 'Argentina', lat: -24.7821, lng: -65.4232 },
    { name: 'Santa Fe', region: 'Santa Fe', country: 'Argentina', lat: -31.6107, lng: -60.6973 },
    { name: 'San Juan', region: 'San Juan', country: 'Argentina', lat: -31.5375, lng: -68.5364 },
    { name: 'Resistencia', region: 'Chaco', country: 'Argentina', lat: -27.4513, lng: -58.9868 },
    { name: 'Neuquén', region: 'Neuquén', country: 'Argentina', lat: -38.9516, lng: -68.0591 },
    { name: 'Corrientes', region: 'Corrientes', country: 'Argentina', lat: -27.4693, lng: -58.8306 },
    { name: 'Posadas', region: 'Misiones', country: 'Argentina', lat: -27.3621, lng: -55.8969 },
    { name: 'Bahía Blanca', region: 'Buenos Aires', country: 'Argentina', lat: -38.7196, lng: -62.2724 },
    { name: 'San Carlos de Bariloche', region: 'Río Negro', country: 'Argentina', lat: -41.1335, lng: -71.3103 },
    { name: 'Ushuaia', region: 'Tierra del Fuego', country: 'Argentina', lat: -54.8019, lng: -68.3030 },
    // Bolivia
    { name: 'La Paz', region: 'La Paz', country: 'Bolivia', lat: -16.4897, lng: -68.1193 },
    { name: 'Santa Cruz de la Sierra', region: 'Santa Cruz', country: 'Bolivia', lat: -17.7833, lng: -63.1821 },
    { name: 'Cochabamba', region: 'Cochabamba', country: 'Bolivia', lat: -17.3895, lng: -66.1568 },
    { name: 'Sucre', region: 'Chuquisaca', country: 'Bolivia', lat: -19.0196, lng: -65.2619 },
    { name: 'Oruro', region: 'Oruro', country: 'Bolivia', lat: -17.9647, lng: -67.1064 },
    { name: 'Tarija', region: 'Tarija', country: 'Bolivia', lat: -21.5355, lng: -64.7296 },
    { name: 'Potosí', region: 'Potosí', country: 'Bolivia', lat: -19.5836, lng: -65.7531 },
    { name: 'El Alto', region: 'La Paz', country: 'Bolivia', lat: -16.5100, lng: -68.1592 },
    // Brazil
    { name: 'São Paulo', region: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
    { name: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729 },
    { name: 'Brasília', region: 'Distrito Federal', country: 'Brazil', lat: -15.7975, lng: -47.8919 },
    { name: 'Salvador', region: 'Bahia', country: 'Brazil', lat: -12.9714, lng: -38.5124 },
    { name: 'Fortaleza', region: 'Ceará', country: 'Brazil', lat: -3.7172, lng: -38.5433 },
    { name: 'Belo Horizonte', region: 'Minas Gerais', country: 'Brazil', lat: -19.9167, lng: -43.9345 },
    { name: 'Manaus', region: 'Amazonas', country: 'Brazil', lat: -3.1190, lng: -60.0217 },
    { name: 'Curitiba', region: 'Paraná', country: 'Brazil', lat: -25.4284, lng: -49.2733 },
    { name: 'Recife', region: 'Pernambuco', country: 'Brazil', lat: -8.0476, lng: -34.8770 },
    { name: 'Porto Alegre', region: 'Rio Grande do Sul', country: 'Brazil', lat: -30.0346, lng: -51.2177 },
    { name: 'Belém', region: 'Pará', country: 'Brazil', lat: -1.4558, lng: -48.5024 },
    { name: 'Goiânia', region: 'Goiás', country: 'Brazil', lat: -16.6799, lng: -49.2550 },
    { name: 'Guarulhos', region: 'São Paulo', country: 'Brazil', lat: -23.4538, lng: -46.5333 },
    { name: 'Campinas', region: 'São Paulo', country: 'Brazil', lat: -22.9099, lng: -47.0626 },
    { name: 'São Luís', region: 'Maranhão', country: 'Brazil', lat: -2.5297, lng: -44.2825 },
    { name: 'Maceió', region: 'Alagoas', country: 'Brazil', lat: -9.6658, lng: -35.7353 },
    { name: 'Natal', region: 'Rio Grande do Norte', country: 'Brazil', lat: -5.7793, lng: -35.2009 },
    { name: 'Teresina', region: 'Piauí', country: 'Brazil', lat: -5.0892, lng: -42.8019 },
    { name: 'Campo Grande', region: 'Mato Grosso do Sul', country: 'Brazil', lat: -20.4697, lng: -54.6201 },
    { name: 'João Pessoa', region: 'Paraíba', country: 'Brazil', lat: -7.1195, lng: -34.8450 },
    { name: 'Florianópolis', region: 'Santa Catarina', country: 'Brazil', lat: -27.5954, lng: -48.5480 },
    { name: 'Cuiabá', region: 'Mato Grosso', country: 'Brazil', lat: -15.5989, lng: -56.0949 },
    { name: 'Santo André', region: 'São Paulo', country: 'Brazil', lat: -23.6737, lng: -46.5432 },
    { name: 'Osasco', region: 'São Paulo', country: 'Brazil', lat: -23.5325, lng: -46.7917 },
    { name: 'Santos', region: 'São Paulo', country: 'Brazil', lat: -23.9608, lng: -46.3336 },
    { name: 'Ribeirão Preto', region: 'São Paulo', country: 'Brazil', lat: -21.1768, lng: -47.8208 },
    { name: 'Uberlândia', region: 'Minas Gerais', country: 'Brazil', lat: -18.9186, lng: -48.2772 },
    { name: 'Vitória', region: 'Espírito Santo', country: 'Brazil', lat: -20.3155, lng: -40.3128 },
    { name: 'Aracaju', region: 'Sergipe', country: 'Brazil', lat: -10.9111, lng: -37.0717 },
    { name: 'Joinville', region: 'Santa Catarina', country: 'Brazil', lat: -26.3045, lng: -48.8487 },
    { name: 'Londrina', region: 'Paraná', country: 'Brazil', lat: -23.3045, lng: -51.1696 },
    { name: 'Niterói', region: 'Rio de Janeiro', country: 'Brazil', lat: -22.8833, lng: -43.1036 },
    { name: 'Porto Velho', region: 'Rondônia', country: 'Brazil', lat: -8.7608, lng: -63.9025 },
    { name: 'Macapá', region: 'Amapá', country: 'Brazil', lat: 0.0356, lng: -51.0706 },
    { name: 'Rio Branco', region: 'Acre', country: 'Brazil', lat: -9.9747, lng: -67.8100 },
    { name: 'Boa Vista', region: 'Roraima', country: 'Brazil', lat: 2.8195, lng: -60.6714 },
    { name: 'Palmas', region: 'Tocantins', country: 'Brazil', lat: -10.1689, lng: -48.3317 },
    // Chile
    { name: 'Santiago', region: 'Región Metropolitana', country: 'Chile', lat: -33.4489, lng: -70.6693 },
    { name: 'Valparaíso', region: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127 },
    { name: 'Concepción', region: 'Biobío', country: 'Chile', lat: -36.8270, lng: -73.0498 },
    { name: 'Antofagasta', region: 'Antofagasta', country: 'Chile', lat: -23.6509, lng: -70.3975 },
    { name: 'Viña del Mar', region: 'Valparaíso', country: 'Chile', lat: -33.0153, lng: -71.5500 },
    { name: 'Temuco', region: 'Araucanía', country: 'Chile', lat: -38.7359, lng: -72.5904 },
    { name: 'Rancagua', region: "O'Higgins", country: 'Chile', lat: -34.1701, lng: -70.7444 },
    { name: 'Talca', region: 'Maule', country: 'Chile', lat: -35.4264, lng: -71.6554 },
    { name: 'Arica', region: 'Arica y Parinacota', country: 'Chile', lat: -18.4783, lng: -70.3126 },
    { name: 'Iquique', region: 'Tarapacá', country: 'Chile', lat: -20.2133, lng: -70.1503 },
    { name: 'Puerto Montt', region: 'Los Lagos', country: 'Chile', lat: -41.4693, lng: -72.9424 },
    { name: 'Valdivia', region: 'Los Ríos', country: 'Chile', lat: -39.8142, lng: -73.2459 },
    { name: 'Osorno', region: 'Los Lagos', country: 'Chile', lat: -40.5694, lng: -73.1353 },
    { name: 'La Serena', region: 'Coquimbo', country: 'Chile', lat: -29.9027, lng: -71.2519 },
    { name: 'Copiapó', region: 'Atacama', country: 'Chile', lat: -27.3668, lng: -70.3323 },
    { name: 'Punta Arenas', region: 'Magallanes', country: 'Chile', lat: -53.1548, lng: -70.9113 },
    // Colombia
    { name: 'Bogotá', region: 'Cundinamarca', country: 'Colombia', lat: 4.7110, lng: -74.0721 },
    { name: 'Medellín', region: 'Antioquia', country: 'Colombia', lat: 6.2442, lng: -75.5812 },
    { name: 'Cali', region: 'Valle del Cauca', country: 'Colombia', lat: 3.4516, lng: -76.5320 },
    { name: 'Barranquilla', region: 'Atlántico', country: 'Colombia', lat: 10.9685, lng: -74.7813 },
    { name: 'Cartagena', region: 'Bolívar', country: 'Colombia', lat: 10.3910, lng: -75.5144 },
    { name: 'Bucaramanga', region: 'Santander', country: 'Colombia', lat: 7.1254, lng: -73.1198 },
    { name: 'Pereira', region: 'Risaralda', country: 'Colombia', lat: 4.8133, lng: -75.6961 },
    { name: 'Santa Marta', region: 'Magdalena', country: 'Colombia', lat: 11.2408, lng: -74.1990 },
    { name: 'Ibagué', region: 'Tolima', country: 'Colombia', lat: 4.4389, lng: -75.2322 },
    { name: 'Manizales', region: 'Caldas', country: 'Colombia', lat: 5.0670, lng: -75.5174 },
    { name: 'Villavicencio', region: 'Meta', country: 'Colombia', lat: 4.1420, lng: -73.6266 },
    { name: 'Pasto', region: 'Nariño', country: 'Colombia', lat: 1.2136, lng: -77.2811 },
    { name: 'Cúcuta', region: 'Norte de Santander', country: 'Colombia', lat: 7.8891, lng: -72.4967 },
    { name: 'Armenia', region: 'Quindío', country: 'Colombia', lat: 4.5339, lng: -75.6811 },
    { name: 'Neiva', region: 'Huila', country: 'Colombia', lat: 2.9273, lng: -75.2819 },
    { name: 'Popayán', region: 'Cauca', country: 'Colombia', lat: 2.4419, lng: -76.6064 },
    { name: 'Montería', region: 'Córdoba', country: 'Colombia', lat: 8.7479, lng: -75.8814 },
    { name: 'Tunja', region: 'Boyacá', country: 'Colombia', lat: 5.5353, lng: -73.3678 },
    { name: 'Valledupar', region: 'Cesar', country: 'Colombia', lat: 10.4769, lng: -73.2506 },
    // Ecuador
    { name: 'Quito', region: 'Pichincha', country: 'Ecuador', lat: -0.1807, lng: -78.4678 },
    { name: 'Guayaquil', region: 'Guayas', country: 'Ecuador', lat: -2.1710, lng: -79.9224 },
    { name: 'Cuenca', region: 'Azuay', country: 'Ecuador', lat: -2.8970, lng: -79.0042 },
    { name: 'Santo Domingo', region: 'Santo Domingo', country: 'Ecuador', lat: -0.2532, lng: -79.1719 },
    { name: 'Machala', region: 'El Oro', country: 'Ecuador', lat: -3.2581, lng: -79.9554 },
    { name: 'Ambato', region: 'Tungurahua', country: 'Ecuador', lat: -1.2491, lng: -78.6168 },
    { name: 'Manta', region: 'Manabí', country: 'Ecuador', lat: -0.9498, lng: -80.7089 },
    { name: 'Portoviejo', region: 'Manabí', country: 'Ecuador', lat: -1.0296, lng: -80.4549 },
    { name: 'Loja', region: 'Loja', country: 'Ecuador', lat: -3.9931, lng: -79.2042 },
    { name: 'Riobamba', region: 'Chimborazo', country: 'Ecuador', lat: -1.6710, lng: -78.6483 },
    // Guyana
    { name: 'Georgetown', region: 'Demerara-Mahaica', country: 'Guyana', lat: 6.8013, lng: -58.1551 },
    // Suriname
    { name: 'Paramaribo', region: 'Paramaribo', country: 'Suriname', lat: 5.8520, lng: -55.2038 },
    // French Guiana
    { name: 'Cayenne', region: 'French Guiana', country: 'French Guiana', lat: 4.9224, lng: -52.3135 },
    // Paraguay
    { name: 'Asunción', region: 'Asunción', country: 'Paraguay', lat: -25.2637, lng: -57.5759 },
    { name: 'Ciudad del Este', region: 'Alto Paraná', country: 'Paraguay', lat: -25.5097, lng: -54.6111 },
    { name: 'San Lorenzo', region: 'Central', country: 'Paraguay', lat: -25.3397, lng: -57.5094 },
    { name: 'Luque', region: 'Central', country: 'Paraguay', lat: -25.2667, lng: -57.4833 },
    { name: 'Capiatá', region: 'Central', country: 'Paraguay', lat: -25.3556, lng: -57.4444 },
    { name: 'Encarnación', region: 'Itapúa', country: 'Paraguay', lat: -27.3371, lng: -55.8668 },
    // Peru
    { name: 'Lima', region: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428 },
    { name: 'Arequipa', region: 'Arequipa', country: 'Peru', lat: -16.4090, lng: -71.5375 },
    { name: 'Trujillo', region: 'La Libertad', country: 'Peru', lat: -8.1091, lng: -79.0215 },
    { name: 'Chiclayo', region: 'Lambayeque', country: 'Peru', lat: -6.7714, lng: -79.8409 },
    { name: 'Cusco', region: 'Cusco', country: 'Peru', lat: -13.5319, lng: -71.9675 },
    { name: 'Piura', region: 'Piura', country: 'Peru', lat: -5.1945, lng: -80.6328 },
    { name: 'Iquitos', region: 'Loreto', country: 'Peru', lat: -3.7491, lng: -73.2538 },
    { name: 'Huancayo', region: 'Junín', country: 'Peru', lat: -12.0651, lng: -75.2049 },
    { name: 'Tacna', region: 'Tacna', country: 'Peru', lat: -18.0146, lng: -70.2536 },
    { name: 'Pucallpa', region: 'Ucayali', country: 'Peru', lat: -8.3791, lng: -74.5539 },
    { name: 'Cajamarca', region: 'Cajamarca', country: 'Peru', lat: -7.1638, lng: -78.5003 },
    { name: 'Ayacucho', region: 'Ayacucho', country: 'Peru', lat: -13.1588, lng: -74.2236 },
    // Uruguay
    { name: 'Montevideo', region: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645 },
    { name: 'Salto', region: 'Salto', country: 'Uruguay', lat: -31.3833, lng: -57.9667 },
    { name: 'Paysandú', region: 'Paysandú', country: 'Uruguay', lat: -32.3214, lng: -58.0758 },
    { name: 'Las Piedras', region: 'Canelones', country: 'Uruguay', lat: -34.7167, lng: -56.2167 },
    { name: 'Rivera', region: 'Rivera', country: 'Uruguay', lat: -30.9050, lng: -55.5506 },
    { name: 'Maldonado', region: 'Maldonado', country: 'Uruguay', lat: -34.9000, lng: -54.9500 },
    { name: 'Punta del Este', region: 'Maldonado', country: 'Uruguay', lat: -34.9667, lng: -54.9500 },
    { name: 'Colonia del Sacramento', region: 'Colonia', country: 'Uruguay', lat: -34.4626, lng: -57.8400 },
    // Venezuela
    { name: 'Caracas', region: 'Distrito Capital', country: 'Venezuela', lat: 10.4806, lng: -66.9036 },
    { name: 'Maracaibo', region: 'Zulia', country: 'Venezuela', lat: 10.6427, lng: -71.6125 },
    { name: 'Valencia', region: 'Carabobo', country: 'Venezuela', lat: 10.1579, lng: -67.9972 },
    { name: 'Barquisimeto', region: 'Lara', country: 'Venezuela', lat: 10.0678, lng: -69.3474 },
    { name: 'Maracay', region: 'Aragua', country: 'Venezuela', lat: 10.2469, lng: -67.5958 },
    { name: 'Ciudad Guayana', region: 'Bolívar', country: 'Venezuela', lat: 8.3596, lng: -62.6476 },
    { name: 'Barcelona', region: 'Anzoátegui', country: 'Venezuela', lat: 10.1333, lng: -64.6833 },
    { name: 'Maturín', region: 'Monagas', country: 'Venezuela', lat: 9.7500, lng: -63.1833 },
    { name: 'San Cristóbal', region: 'Táchira', country: 'Venezuela', lat: 7.7667, lng: -72.2250 },
    { name: 'Cumaná', region: 'Sucre', country: 'Venezuela', lat: 10.4500, lng: -64.1667 },
    { name: 'Mérida', region: 'Mérida', country: 'Venezuela', lat: 8.5897, lng: -71.1561 },
    { name: 'Barinas', region: 'Barinas', country: 'Venezuela', lat: 8.6333, lng: -70.2000 },
    { name: 'Ciudad Bolívar', region: 'Bolívar', country: 'Venezuela', lat: 8.1286, lng: -63.5361 },
    { name: 'Puerto La Cruz', region: 'Anzoátegui', country: 'Venezuela', lat: 10.2167, lng: -64.6333 },
];

// ═══════════════════════════════════════════════════════════════════
// COMBINED EXPORT — Build lookup map
// ═══════════════════════════════════════════════════════════════════

const ALL_AMERICAS_CITIES: InternationalCity[] = [
    ...CANADA,
    ...MEXICO,
    ...CENTRAL_AMERICA,
    ...CARIBBEAN,
    ...SOUTH_AMERICA,
];

/**
 * Pre-built lookup map for fast matching.
 * Keys are normalized: "CITYNAME, COUNTRY" and "CITYNAME, REGION"
 */
const AMERICAS_LOOKUP: Record<string, InternationalCity> = {};

for (const city of ALL_AMERICAS_CITIES) {
    const nameUp = city.name.toUpperCase();
    const regionUp = city.region.toUpperCase();
    const countryUp = city.country.toUpperCase();

    // "CITY, COUNTRY"
    AMERICAS_LOOKUP[`${nameUp}, ${countryUp}`] = city;
    // "CITY, REGION"
    AMERICAS_LOOKUP[`${nameUp}, ${regionUp}`] = city;
    // "CITY, REGION, COUNTRY"
    AMERICAS_LOOKUP[`${nameUp}, ${regionUp}, ${countryUp}`] = city;
    // Just city name (first match wins) — only if not already set
    if (!AMERICAS_LOOKUP[nameUp]) {
        AMERICAS_LOOKUP[nameUp] = city;
    }
}

export { ALL_AMERICAS_CITIES, AMERICAS_LOOKUP };

/**
 * Look up an international city by various input formats:
 * - "Toronto, Canada"
 * - "Toronto, ON"
 * - "Mexico City"
 * - "São Paulo, Brazil"
 * - "Buenos Aires, Argentina"
 */
export function getAmericasCoordinates(input: string): InternationalCity | null {
    if (!input) return null;

    const normalized = input.toUpperCase().trim();

    // Direct lookup
    if (AMERICAS_LOOKUP[normalized]) {
        return AMERICAS_LOOKUP[normalized];
    }

    // Try removing accents for easier matching
    const noAccents = normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    if (AMERICAS_LOOKUP[noAccents]) {
        return AMERICAS_LOOKUP[noAccents];
    }

    // Try each part combo
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        const city = parts[0];
        const rest = parts[1];
        // Try "CITY, REST"
        const key = `${city}, ${rest}`;
        if (AMERICAS_LOOKUP[key]) return AMERICAS_LOOKUP[key];
    }

    // Fuzzy: search all entries for partial match
    for (const [key, coords] of Object.entries(AMERICAS_LOOKUP)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return coords;
        }
    }

    // Try partial city name match
    if (parts.length > 0) {
        const cityName = parts[0];
        for (const city of ALL_AMERICAS_CITIES) {
            const nameUp = city.name.toUpperCase();
            const nameNoAccents = nameUp.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (nameUp === cityName || nameNoAccents === cityName) {
                return city;
            }
        }
    }

    return null;
}

export const AMERICAS_CITY_COUNT = ALL_AMERICAS_CITIES.length;
