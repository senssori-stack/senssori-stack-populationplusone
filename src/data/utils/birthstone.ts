export function birthstoneFromISO(dobISO: string): string {
    const month = new Date(dobISO + 'T00:00:00').getMonth() + 1;
    const stones = [
        '', 'Garnet', 'Amethyst', 'Aquamarine', 'Diamond', 'Emerald', 'Pearl/Alexandrite',
        'Ruby', 'Peridot/Spinel', 'Sapphire', 'Opal/Tourmaline', 'Topaz/Citrine', 'Turquoise/Tanzanite'
    ];
    return stones[month] || '';
}
