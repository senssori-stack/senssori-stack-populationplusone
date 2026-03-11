export type HeritageOption = {
    id: string;
    label: string;
    symbol: string;
    symbols: [string, string, string];
    flag: string;
};

export const HERITAGE_OPTIONS: HeritageOption[] = [
    { id: 'african', label: 'African', symbol: '🌍', symbols: ['🌍', '🥁', '🦒'], flag: '🌍' },
    { id: 'african_american', label: 'African American', symbol: '✊🏿', symbols: ['✊🏿', '🎷', '✨'], flag: '🇺🇸' },
    { id: 'albanian', label: 'Albanian', symbol: '🦅', symbols: ['🦅', '🏔️', '🔴'], flag: '🇦🇱' },
    { id: 'argentinian', label: 'Argentinian', symbol: '🧉', symbols: ['🧉', '⚽', '🥩'], flag: '🇦🇷' },
    { id: 'armenian', label: 'Armenian', symbol: '🏔️', symbols: ['🏔️', '🍑', '✝️'], flag: '🇦🇲' },
    { id: 'australian', label: 'Australian', symbol: '🦘', symbols: ['🦘', '🐨', '🏄'], flag: '🇦🇺' },
    { id: 'austrian', label: 'Austrian', symbol: '⛰️', symbols: ['⛰️', '🎵', '🎻'], flag: '🇦🇹' },
    { id: 'bolivian', label: 'Bolivian', symbol: '🦙', symbols: ['🦙', '🏔️', '🌈'], flag: '🇧🇴' },
    { id: 'bosnian', label: 'Bosnian', symbol: '🌉', symbols: ['🌉', '☕', '💙'], flag: '🇧🇦' },
    { id: 'brazilian', label: 'Brazilian', symbol: '🇧🇷', symbols: ['🇧🇷', '⚽', '🎶'], flag: '🇧🇷' },
    { id: 'british', label: 'British', symbol: '🇬🇧', symbols: ['🇬🇧', '☕', '👑'], flag: '🇬🇧' },
    { id: 'cambodian', label: 'Cambodian', symbol: '🏛️', symbols: ['🏛️', '🌺', '🐘'], flag: '🇰🇭' },
    { id: 'canadian', label: 'Canadian', symbol: '🍁', symbols: ['🍁', '🏒', '🫎'], flag: '🇨🇦' },
    { id: 'caribbean', label: 'Caribbean', symbol: '🌴', symbols: ['🌴', '🥥', '🎶'], flag: '🌴' },
    { id: 'chilean', label: 'Chilean', symbol: '🏔️', symbols: ['🏔️', '🍇', '🦅'], flag: '🇨🇱' },
    { id: 'chinese', label: 'Chinese', symbol: '🐉', symbols: ['🐉', '🏮', '🧧'], flag: '🇨🇳' },
    { id: 'colombian', label: 'Colombian', symbol: '☕', symbols: ['☕', '🌺', '💛'], flag: '🇨🇴' },
    { id: 'croatian', label: 'Croatian', symbol: '🏁', symbols: ['🏁', '🌊', '🔴'], flag: '🇭🇷' },
    { id: 'cuban', label: 'Cuban', symbol: '🎺', symbols: ['🎺', '🌴', '🚗'], flag: '🇨🇺' },
    { id: 'czech', label: 'Czech', symbol: '🏰', symbols: ['🏰', '🍺', '🦁'], flag: '🇨🇿' },
    { id: 'danish', label: 'Danish', symbol: '🧜‍♀️', symbols: ['🧜‍♀️', '❄️', '🏰'], flag: '🇩🇰' },
    { id: 'dominican', label: 'Dominican', symbol: '🌺', symbols: ['🌺', '⚾', '🌴'], flag: '🇩🇴' },
    { id: 'dutch', label: 'Dutch', symbol: '🌷', symbols: ['🌷', '🧀', '🚲'], flag: '🇳🇱' },
    { id: 'ecuadorian', label: 'Ecuadorian', symbol: '🌋', symbols: ['🌋', '🍌', '🐢'], flag: '🇪🇨' },
    { id: 'egyptian', label: 'Egyptian', symbol: '🏛️', symbols: ['🏛️', '🐪', '☀️'], flag: '🇪🇬' },
    { id: 'english', label: 'English', symbol: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', symbols: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿', '☕', '🦁'], flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'ethiopian', label: 'Ethiopian', symbol: '☕', symbols: ['☕', '🦁', '🌿'], flag: '🇪🇹' },
    { id: 'filipino', label: 'Filipino', symbol: '🌺', symbols: ['🌺', '🌴', '⭐'], flag: '🇵🇭' },
    { id: 'finnish', label: 'Finnish', symbol: '🧖', symbols: ['🧖', '🎅', '❄️'], flag: '🇫🇮' },
    { id: 'french', label: 'French', symbol: '🥐', symbols: ['🥐', '🗼', '🧀'], flag: '🇫🇷' },
    { id: 'german', label: 'German', symbol: '🦅', symbols: ['🦅', '🍺', '🏰'], flag: '🇩🇪' },
    { id: 'ghanaian', label: 'Ghanaian', symbol: '⭐', symbols: ['⭐', '🥁', '🌍'], flag: '🇬🇭' },
    { id: 'greek', label: 'Greek', symbol: '🏛️', symbols: ['🏛️', '🫒', '🔱'], flag: '🇬🇷' },
    { id: 'guatemalan', label: 'Guatemalan', symbol: '🌋', symbols: ['🌋', '🦜', '🌽'], flag: '🇬🇹' },
    { id: 'haitian', label: 'Haitian', symbol: '🌴', symbols: ['🌴', '🥁', '💙'], flag: '🇭🇹' },
    { id: 'hawaiian', label: 'Hawaiian', symbol: '🌺', symbols: ['🌺', '🏄', '🌊'], flag: '🌺' },
    { id: 'honduran', label: 'Honduran', symbol: '🦜', symbols: ['🦜', '🌴', '⚽'], flag: '🇭🇳' },
    { id: 'hungarian', label: 'Hungarian', symbol: '🌶️', symbols: ['🌶️', '🎵', '🏰'], flag: '🇭🇺' },
    { id: 'icelandic', label: 'Icelandic', symbol: '🧊', symbols: ['🧊', '🌋', '🐴'], flag: '🇮🇸' },
    { id: 'indian', label: 'Indian', symbol: '🪷', symbols: ['🪷', '🐘', '🌶️'], flag: '🇮🇳' },
    { id: 'indonesian', label: 'Indonesian', symbol: '🌿', symbols: ['🌿', '🏝️', '🐉'], flag: '🇮🇩' },
    { id: 'iranian', label: 'Iranian', symbol: '🌹', symbols: ['🌹', '🕌', '🏔️'], flag: '🇮🇷' },
    { id: 'iraqi', label: 'Iraqi', symbol: '🏺', symbols: ['🏺', '🌴', '⭐'], flag: '🇮🇶' },
    { id: 'irish', label: 'Irish', symbol: '☘️', symbols: ['☘️', '🌈', '🍺'], flag: '🇮🇪' },
    { id: 'israeli', label: 'Israeli', symbol: '✡️', symbols: ['✡️', '🫒', '🕎'], flag: '🇮🇱' },
    { id: 'italian', label: 'Italian', symbol: '🍕', symbols: ['🍕', '🤌', '🏛️'], flag: '🇮🇹' },
    { id: 'jamaican', label: 'Jamaican', symbol: '🎶', symbols: ['🎶', '🌴', '🏝️'], flag: '🇯🇲' },
    { id: 'japanese', label: 'Japanese', symbol: '🏯', symbols: ['🏯', '🌸', '🎎'], flag: '🇯🇵' },
    { id: 'jewish', label: 'Jewish', symbol: '🕎', symbols: ['🕎', '✡️', '📜'], flag: '✡️' },
    { id: 'jordanian', label: 'Jordanian', symbol: '🏜️', symbols: ['🏜️', '🏛️', '☕'], flag: '🇯🇴' },
    { id: 'kenyan', label: 'Kenyan', symbol: '🦁', symbols: ['🦁', '🏃', '🌍'], flag: '🇰🇪' },
    { id: 'korean', label: 'Korean', symbol: '🥋', symbols: ['🥋', '🌸', '🥢'], flag: '🇰🇷' },
    { id: 'kurdish', label: 'Kurdish', symbol: '☀️', symbols: ['☀️', '🏔️', '🌾'], flag: '☀️' },
    { id: 'laotian', label: 'Laotian', symbol: '🐘', symbols: ['🐘', '🌺', '🌾'], flag: '🇱🇦' },
    { id: 'lebanese', label: 'Lebanese', symbol: '🌲', symbols: ['🌲', '🫒', '🏛️'], flag: '🇱🇧' },
    { id: 'liberian', label: 'Liberian', symbol: '⭐', symbols: ['⭐', '🌍', '🦁'], flag: '🇱🇷' },
    { id: 'lithuanian', label: 'Lithuanian', symbol: '🌾', symbols: ['🌾', '🏰', '🌲'], flag: '🇱🇹' },
    { id: 'mexican', label: 'Mexican', symbol: '🌮', symbols: ['🌮', '🌵', '🦅'], flag: '🇲🇽' },
    { id: 'moroccan', label: 'Moroccan', symbol: '⭐', symbols: ['⭐', '🏜️', '🫖'], flag: '🇲🇦' },
    { id: 'native_american', label: 'Native American', symbol: '🪶', symbols: ['🪶', '🦅', '🐺'], flag: '🪶' },
    { id: 'nepali', label: 'Nepali', symbol: '🏔️', symbols: ['🏔️', '🪷', '🕉️'], flag: '🇳🇵' },
    { id: 'nicaraguan', label: 'Nicaraguan', symbol: '🌋', symbols: ['🌋', '🌴', '🦜'], flag: '🇳🇮' },
    { id: 'nigerian', label: 'Nigerian', symbol: '🦅', symbols: ['🦅', '🥁', '⭐'], flag: '🇳🇬' },
    { id: 'norwegian', label: 'Norwegian', symbol: '⛷️', symbols: ['⛷️', '🌊', '🦌'], flag: '🇳🇴' },
    { id: 'pacific_islander', label: 'Pacific Islander', symbol: '🏝️', symbols: ['🏝️', '🌊', '🐚'], flag: '🏝️' },
    { id: 'pakistani', label: 'Pakistani', symbol: '🌙', symbols: ['🌙', '🏔️', '⭐'], flag: '🇵🇰' },
    { id: 'palestinian', label: 'Palestinian', symbol: '🫒', symbols: ['🫒', '🌿', '⭐'], flag: '🇵🇸' },
    { id: 'panamanian', label: 'Panamanian', symbol: '🌊', symbols: ['🌊', '🦜', '🌴'], flag: '🇵🇦' },
    { id: 'paraguayan', label: 'Paraguayan', symbol: '🎵', symbols: ['🎵', '🧉', '🌳'], flag: '🇵🇾' },
    { id: 'peruvian', label: 'Peruvian', symbol: '🦙', symbols: ['🦙', '🏔️', '🌽'], flag: '🇵🇪' },
    { id: 'polish', label: 'Polish', symbol: '🦅', symbols: ['🦅', '🏰', '🌾'], flag: '🇵🇱' },
    { id: 'portuguese', label: 'Portuguese', symbol: '⛵', symbols: ['⛵', '🐓', '🌊'], flag: '🇵🇹' },
    { id: 'puerto_rican', label: 'Puerto Rican', symbol: '🐸', symbols: ['🐸', '🌴', '🎶'], flag: '🇵🇷' },
    { id: 'romanian', label: 'Romanian', symbol: '🏰', symbols: ['🏰', '🐺', '🌹'], flag: '🇷🇴' },
    { id: 'russian', label: 'Russian', symbol: '🪆', symbols: ['🪆', '❄️', '🐻'], flag: '🇷🇺' },
    { id: 'salvadoran', label: 'Salvadoran', symbol: '🌋', symbols: ['🌋', '🐦', '💙'], flag: '🇸🇻' },
    { id: 'samoan', label: 'Samoan', symbol: '🌊', symbols: ['🌊', '🌴', '🐚'], flag: '🇼🇸' },
    { id: 'saudi', label: 'Saudi', symbol: '🌴', symbols: ['🌴', '🏜️', '🕌'], flag: '🇸🇦' },
    { id: 'scottish', label: 'Scottish', symbol: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', symbols: ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🦄', '🏔️'], flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { id: 'serbian', label: 'Serbian', symbol: '🦅', symbols: ['🦅', '🏰', '🌾'], flag: '🇷🇸' },
    { id: 'somali', label: 'Somali', symbol: '⭐', symbols: ['⭐', '🐪', '🌍'], flag: '🇸🇴' },
    { id: 'south_african', label: 'South African', symbol: '🌍', symbols: ['🌍', '🦁', '💎'], flag: '🇿🇦' },
    { id: 'spanish', label: 'Spanish', symbol: '💃', symbols: ['💃', '🐂', '🎸'], flag: '🇪🇸' },
    { id: 'surinamese', label: 'Surinamese', symbol: '⭐', symbols: ['⭐', '🌴', '🦜'], flag: '🇸🇷' },
    { id: 'swedish', label: 'Swedish', symbol: '🫎', symbols: ['🫎', '❄️', '🌲'], flag: '🇸🇪' },
    { id: 'swiss', label: 'Swiss', symbol: '🏔️', symbols: ['🏔️', '🧀', '⌚'], flag: '🇨🇭' },
    { id: 'syrian', label: 'Syrian', symbol: '🕌', symbols: ['🕌', '🌹', '⭐'], flag: '🇸🇾' },
    { id: 'taiwanese', label: 'Taiwanese', symbol: '🏮', symbols: ['🏮', '🧧', '🌸'], flag: '🇹🇼' },
    { id: 'thai', label: 'Thai', symbol: '🐘', symbols: ['🐘', '🌺', '🏛️'], flag: '🇹🇭' },
    { id: 'trinidadian', label: 'Trinidadian', symbol: '🎭', symbols: ['🎭', '🎶', '🌴'], flag: '🇹🇹' },
    { id: 'turkish', label: 'Turkish', symbol: '🌙', symbols: ['🌙', '🧿', '🫖'], flag: '🇹🇷' },
    { id: 'ukrainian', label: 'Ukrainian', symbol: '🌻', symbols: ['🌻', '🌾', '💙'], flag: '🇺🇦' },
    { id: 'uruguayan', label: 'Uruguayan', symbol: '🧉', symbols: ['🧉', '⚽', '🌊'], flag: '🇺🇾' },
    { id: 'venezuelan', label: 'Venezuelan', symbol: '🌺', symbols: ['🌺', '🦜', '🏔️'], flag: '🇻🇪' },
    { id: 'vietnamese', label: 'Vietnamese', symbol: '🐲', symbols: ['🐲', '🌺', '🍜'], flag: '🇻🇳' },
    { id: 'welsh', label: 'Welsh', symbol: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', symbols: ['🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🐉', '🏔️'], flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { id: 'west_indian', label: 'West Indian', symbol: '🌴', symbols: ['🌴', '🎶', '🌊'], flag: '🌴' },
    { id: 'yemeni', label: 'Yemeni', symbol: '🏜️', symbols: ['🏜️', '☕', '🕌'], flag: '🇾🇪' },
];

/** Heritage emoji choices map: heritageId → chosen emoji */
export type HeritageEmojiMap = Record<string, string>;

/** Allow multiple heritage selections — returns display string like "☘️ Irish & 🍕 Italian" */
export function formatHeritageDisplay(selectedIds: string[], emojiMap?: HeritageEmojiMap): string {
    return selectedIds
        .map(id => {
            const option = HERITAGE_OPTIONS.find(h => h.id === id);
            if (!option) return '';
            const emoji = emojiMap?.[id] || option.symbol;
            return `${emoji} ${option.label}`;
        })
        .filter(Boolean)
        .join(' & ');
}

/** Returns just the label text like "Irish & Italian" for data passing */
export function formatHeritageLabel(selectedIds: string[]): string {
    return selectedIds
        .map(id => HERITAGE_OPTIONS.find(h => h.id === id)?.label ?? '')
        .filter(Boolean)
        .join(' & ');
}

/** Returns just the symbols like "☘️🍕" for compact display */
export function formatHeritageSymbols(selectedIds: string[]): string {
    return selectedIds
        .map(id => HERITAGE_OPTIONS.find(h => h.id === id)?.symbol ?? '')
        .filter(Boolean)
        .join(' ');
}

/** Returns display string with flags like "🇮🇪 Irish & 🇮🇹 Italian" for time capsule */
export function formatHeritageWithFlags(selectedIds: string[], emojiMap?: HeritageEmojiMap): string {
    return selectedIds
        .map(id => {
            const option = HERITAGE_OPTIONS.find(h => h.id === id);
            if (!option) return '';
            const emoji = emojiMap?.[id] || option.symbol;
            return `${option.flag} ${emoji} ${option.label}`;
        })
        .filter(Boolean)
        .join(' & ');
}