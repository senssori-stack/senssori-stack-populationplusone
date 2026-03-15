export function birthstoneFromISO(dobISO: string): string {
    const month = parseInt(dobISO.split('-')[1], 10);
    const stones = [
        '', 'Garnet', 'Amethyst', 'Aquamarine', 'Diamond', 'Emerald', 'Pearl/Alexandrite',
        'Ruby', 'Peridot/Spinel', 'Sapphire', 'Opal/Tourmaline', 'Topaz/Citrine', 'Turquoise/Tanzanite'
    ];
    return stones[month] || '';
}
