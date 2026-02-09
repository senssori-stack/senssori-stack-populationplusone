import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Hospital, findHospitalByCode } from '../data/hospitals';

interface HospitalContextType {
    hospital: Hospital | null;
    isPartnerSession: boolean;
    loginWithCode: (code: string) => { success: boolean; hospital?: Hospital; error?: string };
    logout: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

interface HospitalProviderProps {
    children: ReactNode;
}

export const HospitalProvider: React.FC<HospitalProviderProps> = ({ children }) => {
    const [hospital, setHospital] = useState<Hospital | null>(null);

    const loginWithCode = (code: string): { success: boolean; hospital?: Hospital; error?: string } => {
        const found = findHospitalByCode(code);

        if (found) {
            setHospital(found);
            return { success: true, hospital: found };
        } else {
            return {
                success: false,
                error: 'Invalid access code. Please check with your hospital staff.'
            };
        }
    };

    const logout = () => {
        setHospital(null);
    };

    const value: HospitalContextType = {
        hospital,
        isPartnerSession: hospital !== null,
        loginWithCode,
        logout,
    };

    return (
        <HospitalContext.Provider value={value}>
            {children}
        </HospitalContext.Provider>
    );
};

export const useHospital = (): HospitalContextType => {
    const context = useContext(HospitalContext);
    if (context === undefined) {
        throw new Error('useHospital must be used within a HospitalProvider');
    }
    return context;
};

export default HospitalContext;
