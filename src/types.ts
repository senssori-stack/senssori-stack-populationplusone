export type ThemeName = 'lightBlue' | 'royalBlue' | 'mediumBlue' | 'navyBlue' | 'teal' |
    'darkGreen' | 'forestGreen' | 'green' | 'limeGreen' | 'mintGreen' |
    'lavender' | 'hotPink' | 'rose' | 'purple' | 'violet' |
    'coral' | 'red' | 'maroon' | 'orange' | 'gold' |
    'charcoal' | 'slate' | 'gray' | 'silver' | 'lightGray' |
    'pink' | 'blue';

export type PreviewParams = {
    theme?: ThemeName;
    babies?: Array<{ first?: string; middle?: string; last?: string; photoUri?: string | null }>;
    babyFirst?: string;
    babyMiddle?: string;
    babyLast?: string;
    photoUri?: string | null;
    photoUris?: (string | null)[]; // Support multiple photos (up to 3)
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
    mode?: 'baby' | 'milestone'; // 'baby' for birth announcement, 'milestone' for birthdays
    personName?: string; // For milestone mode - the person's full name
    message?: string; // Prewritten message for milestone mode
    babyCount?: number; // 1 = single, 2 = twins, 3 = triplets
};

export type MemorialParams = {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    photoUri?: string | null;
    dateOfBirth?: string;
    dateOfDeath?: string;
    age?: string;
    hometown?: string; // City, State
    // Service info (front)
    serviceType?: 'funeral' | 'celebration' | 'memorial' | 'private';
    serviceDate?: string;
    serviceTime?: string;
    serviceLocation?: string;
    serviceAddress?: string;
    donationInfo?: string;
    shortMessage?: string;
    theme?: 'classic' | 'elegant' | 'nature' | 'faith' | 'military';
    // Back side - Arrangements
    viewingDate?: string;
    viewingTime?: string;
    viewingLocation?: string;
    viewingAddress?: string;
    burialLocation?: string;
    burialAddress?: string;
    receptionInfo?: string;
    pallbearers?: string;
    honoraryPallbearers?: string;
    flowerBearers?: string;
    clergyName?: string;
    musicSelections?: string;
    specialThanks?: string;
};

export type RootStackParamList = {
    Landing: undefined;
    Form: undefined;
    HospitalLogin: undefined;
    ObituaryForm: undefined;
    MemorialPreview: MemorialParams;
    MemorialBack: MemorialParams;
    LifeMilestones: undefined;
    BirthdayForm: undefined;
    GraduationForm: undefined;
    AnniversaryForm: undefined;
    JustForFun: undefined;
    Generations: { birthDate: string };
    LifePathNumber: { birthDate: string };
    LuckyNumbers: { birthDate: string };
    RomanNumerals: { birthDate: string };
    Birthstone: { birthDate: string };
    ZodiacSign: { birthDate: string };
    OnThisDay: { birthDate: string };
    FamousBirthdays: { birthDate: string };
    ThenAndNow: { birthDate: string };
    SurnameSearch: { surname?: string };
    FullAstrology: { birthDate: string; birthTime?: string; birthLocation?: string };
    Horoscope: { birthDate: string; birthTime?: string; birthLocation?: string };
    TipOfTheDay: { birthDate: string };
    Preview: PreviewParams;
    ChartReading: PreviewParams; // Natal chart with reading and descriptions
    FramingIdeas: undefined;
    PrintService: PreviewParams; // Pass all design data for print preview
    SampleGallery: undefined;
    DisplayIdeas: undefined;
    Front: PreviewParams;
    Back: PreviewParams;
    YardSignPreview: PreviewParams; // Yard sign add-on
    PostcardPreview: PreviewParams; // Postcard add-on
    BaseballCardPreview: PreviewParams; // Baseball card add-on
    Checkout: undefined; // Checkout flow
    OrderConfirmation: { orderId: string; email: string; itemCount: number; total: number }; // Order confirmation
    Test: undefined;
    AboutUs: undefined;
    Sources: undefined;
    CustomerLogin: undefined;
    FuneralHomePortal: undefined;
    GiftSuggestions: { occasion?: string } | undefined;
    RabbitHole: undefined;
    MilestoneTracker: undefined;
    GrowthTracker: undefined;
    LearningCenter: undefined;
};
