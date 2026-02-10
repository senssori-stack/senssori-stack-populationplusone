import React, { createContext, ReactNode, useContext, useState } from 'react';

export type BabyInfo = {
    first: string;
    middle?: string;
    last?: string;
    photoUri?: string | null;
};

export type FormData = {
    // Theme
    theme: string;
    mode: 'baby' | 'birthday' | 'milestone';

    // Baby info
    babyFirst: string;
    babyMiddle: string;
    babyLast: string;
    babies: BabyInfo[];
    babyCount: number;

    // Parents
    motherName: string;
    fatherName: string;
    email: string;

    // Location & Date/Time
    hometown: string;
    dobDate: Date;
    birthTime: Date;

    // Physical stats
    weightLb: string;
    weightOz: string;
    lengthIn: string;

    // Photos
    photoUri: string | null;
    photoUris: (string | null)[];

    // Snapshot data
    snapshot: Record<string, string>;
    population: number | null;

    // Milestone specific
    personName: string;
    message: string;
};

type FormContextType = {
    formData: FormData;
    updateFormData: (updates: Partial<FormData>) => void;
    clearFormData: () => void;
    hasFormData: boolean;
};

const defaultFormData: FormData = {
    theme: 'green',
    mode: 'baby',
    babyFirst: '',
    babyMiddle: '',
    babyLast: '',
    babies: [{ first: '', middle: '', last: '', photoUri: null }],
    babyCount: 1,
    motherName: '',
    fatherName: '',
    email: '',
    hometown: '',
    dobDate: new Date(),
    birthTime: new Date(),
    weightLb: '',
    weightOz: '',
    lengthIn: '',
    photoUri: null,
    photoUris: [],
    snapshot: {},
    population: null,
    personName: '',
    message: '',
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<FormData>(defaultFormData);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const clearFormData = () => {
        setFormData(defaultFormData);
    };

    // Check if any meaningful data has been entered
    const hasFormData =
        formData.babyFirst.trim().length > 0 ||
        formData.hometown.trim().length > 0 ||
        formData.personName.trim().length > 0 ||
        formData.babies.some(b => (b.first || '').trim().length > 0);

    return (
        <FormContext.Provider value={{ formData, updateFormData, clearFormData, hasFormData }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    const context = useContext(FormContext);
    if (context === undefined) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
}

export default FormContext;
