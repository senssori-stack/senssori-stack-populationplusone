// src/data/utils/governors.ts
// Fetch current and historical governor data

const GOVERNORS_CSV_URL = 'https://raw.githubusercontent.com/marymac17/us-governors/main/us-governors/data/us-governors.csv';

export interface GovernorData {
    state_code: string;
    state_name: string;
    name: string;
    first_name: string;
    last_name: string;
    party: string;
    entered_office: string;
    term_end: string;
}

// Parse CSV data
function parseCSV(csvText: string): GovernorData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const governors: GovernorData[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const gov: any = {};
        headers.forEach((header, index) => {
            gov[header] = values[index] || '';
        });
        governors.push(gov as GovernorData);
    }

    return governors;
}

// Get governor for a specific state and date
export async function getGovernorForStateAndDate(
    stateCode: string,
    dateISO: string
): Promise<string | null> {
    try {
        const response = await fetch(GOVERNORS_CSV_URL);
        const csvText = await response.text();
        const governors = parseCSV(csvText);

        const targetDate = new Date(dateISO);
        const upperStateCode = stateCode.toUpperCase().trim();

        // Filter governors for this state
        const stateGovernors = governors.filter(g =>
            g.state_code && g.state_code.toUpperCase() === upperStateCode
        );

        // Find governor whose term includes the target date
        for (const gov of stateGovernors) {
            const enteredOffice = new Date(gov.entered_office);
            const termEnd = new Date(gov.term_end);

            if (targetDate >= enteredOffice && targetDate <= termEnd) {
                return gov.name || `${gov.first_name} ${gov.last_name}`.trim();
            }
        }

        // If no exact match, return the most recent governor for this state
        if (stateGovernors.length > 0) {
            stateGovernors.sort((a, b) =>
                new Date(b.entered_office).getTime() - new Date(a.entered_office).getTime()
            );
            const latest = stateGovernors[0];
            return latest.name || `${latest.first_name} ${latest.last_name}`.trim();
        }

        return null;
    } catch (error) {
        console.warn('Failed to fetch governor data:', error);
        return null;
    }
}

// Get current governor for a state
export async function getCurrentGovernor(stateCode: string): Promise<string | null> {
    const today = new Date().toISOString().split('T')[0];
    return getGovernorForStateAndDate(stateCode, today);
}
