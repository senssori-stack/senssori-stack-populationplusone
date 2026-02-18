export function getZodiacFromISO(dobISO: string): string {
    const d = new Date(dobISO + 'T00:00:00');
    const md = (d.getMonth() + 1) * 100 + d.getDate();

    if (md >= 321 && md <= 419) return 'Aries';
    if (md >= 420 && md <= 520) return 'Taurus';
    if (md >= 521 && md <= 620) return 'Gemini';
    if (md >= 621 && md <= 722) return 'Cancer';
    if (md >= 723 && md <= 822) return 'Leo';
    if (md >= 823 && md <= 922) return 'Virgo';
    if (md >= 923 && md <= 1022) return 'Libra';
    if (md >= 1023 && md <= 1121) return 'Scorpio';
    if (md >= 1122 && md <= 1221) return 'Sagittarius';
    if (md >= 1222 || md <= 119) return 'Capricorn';
    if (md >= 120 && md <= 218) return 'Aquarius';
    return 'Pisces';
}
