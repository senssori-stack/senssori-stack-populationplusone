export type ThemeName = 'lightBlue' | 'royalBlue' | 'mediumBlue' | 'navyBlue' | 'teal' |
    'darkGreen' | 'forestGreen' | 'green' | 'limeGreen' | 'mintGreen' |
    'lavender' | 'hotPink' | 'rose' | 'purple' | 'violet' |
    'coral' | 'red' | 'maroon' | 'orange' | 'gold' |
    'charcoal' | 'slate' | 'gray' | 'silver' | 'lightGray';

export type PreviewParams = {
    theme?: ThemeName;
    babies?: Array<{ first?: string; middle?: string; last?: string; photoUri?: string | null }>;
    babyFirst?: string;
    babyMiddle?: string;
    babyLast?: string;
    photoUri?: string | null;
    motherName?: string;
    fatherName?: string;
    email?: string; // For marketing
    hometown?: string;
    dobISO?: string;
    weightLb?: string;
    weightOz?: string;
    lengthIn?: string;
    latitude?: number;
    longitude?: number;
    frontOrientation?: 'portrait' | 'landscape';
    timeCapsuleOrientation?: 'portrait' | 'landscape';
    // Deprecated - keeping for backwards compatibility
    orientation?: 'portrait' | 'landscape';
    snapshot?: Record<string, string>;
    population?: number;
};

export type RootStackParamList = {
    Landing: undefined;
    Form: undefined;
    LifeMilestones: undefined;
    Preview: PreviewParams;
    ChartReading: PreviewParams; // Natal chart with reading and descriptions
    FramingIdeas: undefined;
    PrintService: PreviewParams; // Pass all design data for print preview
    SampleGallery: undefined;
    DisplayIdeas: undefined;
    Front: PreviewParams;
    Back: PreviewParams;
    Test: undefined;
};
