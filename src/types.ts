export type ThemeName = 'green' | 'pink' | 'blue';

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
  frontOrientation?: 'portrait' | 'landscape';
  timeCapsuleOrientation?: 'portrait' | 'landscape';
  // Deprecated - keeping for backwards compatibility
  orientation?: 'portrait' | 'landscape';
  snapshot?: Record<string, string>;
  population?: number;
};

export type RootStackParamList = {
  Form: undefined;
  Preview: PreviewParams;
  FramingIdeas: undefined;
  PrintService: PreviewParams; // Pass all design data for print preview
  Landing: undefined;
  SampleGallery: undefined;
  DisplayIdeas: undefined;
  Front: PreviewParams;
  Back: PreviewParams;
  Test: undefined;
};