// Hospital Partner Database
// Each hospital gets a unique access code for their staff/patients

export interface Hospital {
    id: string;
    name: string;
    code: string; // Access code for staff to enter
    logo?: string; // URL or local asset path
    city: string;
    state: string;
    primaryColor?: string; // Optional brand color
    tagline?: string; // Optional custom tagline
    isActive: boolean;
}

// Sample hospital data - in production this would come from a backend
export const HOSPITAL_DATABASE: Hospital[] = [
    {
        id: 'demo-hospital',
        name: 'Demo Hospital',
        code: 'DEMO2026',
        city: 'Anytown',
        state: 'USA',
        tagline: 'Where Families Begin',
        isActive: true,
    },
    {
        id: 'mercy-general',
        name: 'Mercy General Hospital',
        code: 'MERCY2026',
        city: 'Springfield',
        state: 'IL',
        primaryColor: '#1a5f7a',
        tagline: 'Compassionate Care for Every Family',
        isActive: true,
    },
    {
        id: 'st-marys',
        name: "St. Mary's Medical Center",
        code: 'STMARY2026',
        city: 'Chicago',
        state: 'IL',
        primaryColor: '#8b1538',
        tagline: 'A Tradition of Excellence',
        isActive: true,
    },
    {
        id: 'sunrise-birth',
        name: 'Sunrise Birth Center',
        code: 'SUNRISE26',
        city: 'Phoenix',
        state: 'AZ',
        primaryColor: '#f39c12',
        tagline: 'Natural Beginnings',
        isActive: true,
    },
    {
        id: 'community-med',
        name: 'Community Medical Center',
        code: 'COMMUNITY',
        city: 'Denver',
        state: 'CO',
        primaryColor: '#27ae60',
        tagline: 'Your Community, Your Care',
        isActive: true,
    },
];

// Lookup hospital by access code (case-insensitive)
export const findHospitalByCode = (code: string): Hospital | undefined => {
    const normalizedCode = code.trim().toUpperCase();
    return HOSPITAL_DATABASE.find(
        h => h.code.toUpperCase() === normalizedCode && h.isActive
    );
};

// Get all active hospitals (for admin purposes)
export const getActiveHospitals = (): Hospital[] => {
    return HOSPITAL_DATABASE.filter(h => h.isActive);
};
