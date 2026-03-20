import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Circle, Defs, G, Line, Path, Stop, Svg, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PragueClock'>;

const SCREEN_W = Dimensions.get('window').width;

// ── Astronomical constants ──
const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const ZODIAC_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ROMAN_12 = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
// Old Czech (Schwabacher) Arabic numerals 1–12 repeated twice on the outer rotating ring
const OLD_CZECH_24 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Calendar dial saints/feast days (one per month segment for authenticity)
const CALENDAR_MONTHS = [
    { name: 'Leden', eng: 'January', abbr: 'JAN', saint: 'St. Basil', icon: '❄️' },
    { name: 'Únor', eng: 'February', abbr: 'FEB', saint: 'Purification', icon: '🕯️' },
    { name: 'Březen', eng: 'March', abbr: 'MAR', saint: 'St. Gregory', icon: '🌱' },
    { name: 'Duben', eng: 'April', abbr: 'APR', saint: 'Easter', icon: '🐣' },
    { name: 'Květen', eng: 'May', abbr: 'MAY', saint: 'St. Philip', icon: '🌸' },
    { name: 'Červen', eng: 'June', abbr: 'JUN', saint: 'St. John', icon: '☀️' },
    { name: 'Červenec', eng: 'July', abbr: 'JUL', saint: 'St. James', icon: '🌻' },
    { name: 'Srpen', eng: 'August', abbr: 'AUG', saint: 'St. Lawrence', icon: '🌾' },
    { name: 'Září', eng: 'September', abbr: 'SEP', saint: 'Nativity BVM', icon: '🍂' },
    { name: 'Říjen', eng: 'October', abbr: 'OCT', saint: 'St. Luke', icon: '🍁' },
    { name: 'Listopad', eng: 'November', abbr: 'NOV', saint: 'All Saints', icon: '🕊️' },
    { name: 'Prosinec', eng: 'December', abbr: 'DEC', saint: 'St. Nicholas', icon: '🎄' },
];

// The four flanking figures of the Orloj
const FLANKING_FIGURES = [
    { name: 'Vanity', emoji: '🪞', side: 'left', desc: 'Represents human vanity — a figure admiring itself in a mirror.' },
    { name: 'Greed', emoji: '💰', side: 'left', desc: 'A miser clutching a purse — the sin of avarice.' },
    { name: 'Death', emoji: '💀', side: 'right', desc: 'A skeleton pulling a bell rope — reminding all that time runs out.' },
    { name: 'Lust', emoji: '🎸', side: 'right', desc: 'Originally a Turk with a mandolin — pleasure and temptation.' },
];

// 12 Apostles that parade past the windows
const APOSTLES = ['Peter', 'Matthew', 'John', 'Andrew', 'Philip', 'James', 'Paul', 'Thomas', 'Simon', 'Judas T.', 'Bartholomew', 'Barnabas'];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dRad(deg: number) { return (deg * Math.PI) / 180; }

// ── 366 Saints of the Calendar (matching the Prague Orloj calendar dial) ──
// Each day of the year has a patron saint or feast day as inscribed on the real Orloj.
// Format: SAINTS[month][day] where month is 0-indexed, day is 1-indexed.
const SAINTS: Record<number, Record<number, { name: string; title: string; lived?: string }>> = {
    0: { // January
        1: { name: 'Mary, Mother of God', title: 'Solemnity of Mary', lived: '1st century' },
        2: { name: 'St. Basil the Great', title: 'Bishop & Doctor of the Church', lived: '329–379' },
        3: { name: 'St. Geneviève', title: 'Patron of Paris', lived: '422–512' },
        4: { name: 'St. Elizabeth Ann Seton', title: 'First American-born saint', lived: '1774–1821' },
        5: { name: 'St. John Neumann', title: 'Bishop of Philadelphia', lived: '1811–1860' },
        6: { name: 'Epiphany of the Lord', title: 'The Three Kings', lived: '1st century' },
        7: { name: 'St. Raymond of Peñafort', title: 'Patron of canon lawyers', lived: '1175–1275' },
        8: { name: 'St. Severinus', title: 'Apostle of Noricum', lived: '410–482' },
        9: { name: 'St. Adrian of Canterbury', title: 'Abbot', lived: '~635–710' },
        10: { name: 'St. Gregory of Nyssa', title: 'Bishop & theologian', lived: '335–395' },
        11: { name: 'St. Theodosius the Cenobiarch', title: 'Founder of monasteries', lived: '423–529' },
        12: { name: 'St. Marguerite Bourgeoys', title: 'Foundress, Congregation of Notre Dame', lived: '1620–1700' },
        13: { name: 'St. Hilary of Poitiers', title: 'Bishop & Doctor of the Church', lived: '310–367' },
        14: { name: 'St. Felix of Nola', title: 'Priest & confessor', lived: '~203–255' },
        15: { name: 'St. Paul the First Hermit', title: 'Desert Father', lived: '227–342' },
        16: { name: 'St. Marcellus I', title: 'Pope & Martyr', lived: '~255–309' },
        17: { name: 'St. Anthony the Great', title: 'Father of All Monks', lived: '251–356' },
        18: { name: 'St. Prisca', title: 'Virgin & Martyr of Rome', lived: '1st century' },
        19: { name: 'St. Canute IV', title: 'King & Martyr of Denmark', lived: '1042–1086' },
        20: { name: 'St. Fabian', title: 'Pope & Martyr', lived: '~200–250' },
        21: { name: 'St. Agnes of Rome', title: 'Virgin & Martyr', lived: '~291–304' },
        22: { name: 'St. Vincent of Zaragoza', title: 'Deacon & Martyr', lived: '~275–304' },
        23: { name: 'St. Marianne Cope', title: 'Servant of lepers in Molokai', lived: '1838–1918' },
        24: { name: 'St. Francis de Sales', title: 'Bishop & Doctor of the Church', lived: '1567–1622' },
        25: { name: 'Conversion of St. Paul', title: 'Apostle to the Gentiles', lived: '5–67 AD' },
        26: { name: 'Sts. Timothy & Titus', title: 'Bishops, companions of St. Paul', lived: '1st century' },
        27: { name: 'St. Angela Merici', title: 'Foundress of the Ursulines', lived: '1474–1540' },
        28: { name: 'St. Thomas Aquinas', title: 'Doctor of the Church', lived: '1225–1274' },
        29: { name: 'St. Gildas the Wise', title: 'Historian & Monk', lived: '~500–570' },
        30: { name: 'St. Martina', title: 'Virgin & Martyr of Rome', lived: '~226–228' },
        31: { name: 'St. John Bosco', title: 'Patron of youth', lived: '1815–1888' },
    },
    1: { // February
        1: { name: 'St. Brigid of Kildare', title: 'Patron of Ireland', lived: '451–525' },
        2: { name: 'Presentation of the Lord', title: 'Candlemas', lived: '1st century' },
        3: { name: 'St. Blaise', title: 'Bishop & Martyr, patron of throats', lived: '~283–316' },
        4: { name: 'St. Joan of Valois', title: 'Queen of France', lived: '1464–1505' },
        5: { name: 'St. Agatha', title: 'Virgin & Martyr of Sicily', lived: '~231–251' },
        6: { name: 'St. Paul Miki', title: 'Martyr of Japan', lived: '1562–1597' },
        7: { name: 'St. Colette of Corbie', title: 'Reformer of the Poor Clares', lived: '1381–1447' },
        8: { name: 'St. Jerome Emiliani', title: 'Patron of orphans', lived: '1486–1537' },
        9: { name: 'St. Apollonia', title: 'Virgin & Martyr, patron of dentists', lived: '~200–249' },
        10: { name: 'St. Scholastica', title: 'Sister of St. Benedict', lived: '480–543' },
        11: { name: 'Our Lady of Lourdes', title: 'Apparition to St. Bernadette', lived: '1858' },
        12: { name: 'St. Julian the Hospitaller', title: 'Patron of travelers', lived: 'Medieval' },
        13: { name: 'Sts. Fusca & Maura', title: 'Virgins & Martyrs', lived: '~250–303' },
        14: { name: 'Sts. Cyril & Methodius', title: 'Apostles to the Slavs', lived: '827–885' },
        15: { name: 'St. Claude de la Colombière', title: 'Jesuit priest & confessor', lived: '1641–1682' },
        16: { name: 'St. Juliana of Nicomedia', title: 'Virgin & Martyr', lived: '~285–304' },
        17: { name: 'Seven Founders of the Servites', title: 'Order of Servants of Mary', lived: '13th century' },
        18: { name: 'St. Simeon', title: 'Bishop of Jerusalem', lived: '~12–107 AD' },
        19: { name: 'St. Conrad of Piacenza', title: 'Hermit & penitent', lived: '1290–1351' },
        20: { name: 'St. Eucherius of Orléans', title: 'Bishop', lived: '~687–738' },
        21: { name: 'St. Peter Damian', title: 'Bishop & Doctor of the Church', lived: '1007–1072' },
        22: { name: 'Chair of St. Peter', title: 'Apostle & first Pope', lived: '1st century' },
        23: { name: 'St. Polycarp of Smyrna', title: 'Bishop & Martyr', lived: '69–155' },
        24: { name: 'St. Matthias', title: 'Apostle, replaced Judas', lived: '1st century' },
        25: { name: 'St. Walburga', title: 'Abbess of Heidenheim', lived: '710–779' },
        26: { name: 'St. Alexander of Alexandria', title: 'Patriarch', lived: '~250–326' },
        27: { name: 'St. Gabriel of Our Lady of Sorrows', title: 'Passionist student', lived: '1838–1862' },
        28: { name: 'St. Romanus of Condat', title: 'Monk & abbot', lived: '~400–463' },
        29: { name: 'St. Oswald of Worcester', title: 'Archbishop', lived: '~925–992' },
    },
    2: { // March
        1: { name: 'St. David', title: 'Patron of Wales', lived: '~500–589' },
        2: { name: 'St. Chad of Mercia', title: 'Bishop of Lichfield', lived: '~634–672' },
        3: { name: 'St. Katharine Drexel', title: 'Foundress, Sisters of the Blessed Sacrament', lived: '1858–1955' },
        4: { name: 'St. Casimir', title: 'Prince of Poland', lived: '1458–1484' },
        5: { name: 'St. John Joseph of the Cross', title: 'Franciscan friar', lived: '1654–1734' },
        6: { name: 'St. Colette of Corbie', title: 'Reformer of the Poor Clares', lived: '1381–1447' },
        7: { name: 'Sts. Perpetua & Felicity', title: 'Martyrs of Carthage', lived: '~181–203' },
        8: { name: 'St. John of God', title: 'Patron of hospitals', lived: '1495–1550' },
        9: { name: 'St. Frances of Rome', title: 'Patron of motorists', lived: '1384–1440' },
        10: { name: 'St. Dominic Savio', title: 'Student of St. John Bosco', lived: '1842–1857' },
        11: { name: 'St. Eulogius of Córdoba', title: 'Priest & Martyr', lived: '~819–859' },
        12: { name: 'St. Maximilian', title: 'Martyr of Tebessa', lived: '~274–295' },
        13: { name: 'St. Roderic', title: 'Priest & Martyr of Córdoba', lived: '~857' },
        14: { name: 'St. Matilda', title: 'Queen of Germany', lived: '~895–968' },
        15: { name: 'St. Louise de Marillac', title: 'Co-foundress, Daughters of Charity', lived: '1591–1660' },
        16: { name: 'St. Heribert of Cologne', title: 'Archbishop', lived: '970–1021' },
        17: { name: 'St. Patrick', title: 'Patron of Ireland', lived: '385–461' },
        18: { name: 'St. Cyril of Jerusalem', title: 'Bishop & Doctor of the Church', lived: '313–386' },
        19: { name: 'St. Joseph', title: 'Spouse of Mary, Patron of Workers', lived: '1st century' },
        20: { name: 'St. Cuthbert', title: 'Bishop of Lindisfarne', lived: '~634–687' },
        21: { name: 'St. Nicholas of Flüe', title: 'Patron of Switzerland', lived: '1417–1487' },
        22: { name: 'St. Lea of Rome', title: 'Widow & Foundress', lived: '~300–384' },
        23: { name: 'St. Turibius of Mogroveio', title: 'Archbishop of Lima', lived: '1538–1606' },
        24: { name: 'St. Catherine of Vadstena', title: 'Brigittine nun', lived: '~1331–1381' },
        25: { name: 'Annunciation of the Lord', title: 'The Angel Gabriel visits Mary', lived: '1st century' },
        26: { name: 'St. Ludger', title: 'Bishop of Münster', lived: '~742–809' },
        27: { name: 'St. Rupert of Salzburg', title: 'Bishop & missionary', lived: '~660–710' },
        28: { name: 'St. Tutilo', title: 'Benedictine monk & artist', lived: '~850–913' },
        29: { name: 'St. Gladys', title: 'Welsh hermitess', lived: '5th century' },
        30: { name: 'St. John Climacus', title: 'Abbot of Mt. Sinai', lived: '~579–649' },
        31: { name: 'St. Benjamin', title: 'Deacon & Martyr of Persia', lived: '~329–424' },
    },
    3: { // April
        1: { name: 'St. Hugh of Grenoble', title: 'Bishop', lived: '1053–1132' },
        2: { name: 'St. Francis of Paola', title: 'Founder of the Minim Friars', lived: '1416–1507' },
        3: { name: 'St. Richard of Chichester', title: 'Bishop', lived: '1197–1253' },
        4: { name: 'St. Isidore of Seville', title: 'Doctor of the Church, patron of internet', lived: '560–636' },
        5: { name: 'St. Vincent Ferrer', title: 'Dominican preacher', lived: '1350–1419' },
        6: { name: 'St. Celestine I', title: 'Pope', lived: '~370–432' },
        7: { name: 'St. John Baptist de la Salle', title: 'Patron of teachers', lived: '1651–1719' },
        8: { name: 'St. Julie Billiart', title: 'Foundress, Sisters of Notre Dame', lived: '1751–1816' },
        9: { name: 'St. Waldetrudis', title: 'Abbess of Mons', lived: '~612–688' },
        10: { name: 'St. Fulbert of Chartres', title: 'Bishop & theologian', lived: '~960–1028' },
        11: { name: 'St. Stanislaus of Kraków', title: 'Bishop & Martyr', lived: '1030–1079' },
        12: { name: 'St. Zeno of Verona', title: 'Bishop', lived: '~300–371' },
        13: { name: 'St. Martin I', title: 'Pope & Martyr', lived: '~598–655' },
        14: { name: 'St. Lidwina of Schiedam', title: 'Mystic & patron of the chronically ill', lived: '1380–1433' },
        15: { name: 'St. Damien of Molokai', title: 'Apostle to the lepers', lived: '1840–1889' },
        16: { name: 'St. Bernadette Soubirous', title: 'Visionary of Lourdes', lived: '1844–1879' },
        17: { name: 'St. Kateri Tekakwitha', title: 'Lily of the Mohawks', lived: '1656–1680' },
        18: { name: 'St. Apollonius the Apologist', title: 'Senator & Martyr', lived: '~159–185' },
        19: { name: 'St. Leo IX', title: 'Pope & reformer', lived: '1002–1054' },
        20: { name: 'St. Agnes of Montepulciano', title: 'Dominican nun', lived: '1268–1317' },
        21: { name: 'St. Anselm of Canterbury', title: 'Doctor of the Church', lived: '1033–1109' },
        22: { name: 'St. Leonidas of Alexandria', title: 'Martyr, father of Origen', lived: '~150–202' },
        23: { name: 'St. George', title: 'Patron of England & soldiers', lived: '~275–303' },
        24: { name: 'St. Fidelis of Sigmaringen', title: 'Capuchin friar & Martyr', lived: '1578–1622' },
        25: { name: 'St. Mark', title: 'Evangelist', lived: '1st century' },
        26: { name: 'St. Cletus', title: 'Pope & Martyr', lived: '~30–92 AD' },
        27: { name: 'St. Zita', title: 'Patron of housekeepers', lived: '1212–1272' },
        28: { name: 'St. Peter Chanel', title: 'First Martyr of Oceania', lived: '1803–1841' },
        29: { name: 'St. Catherine of Siena', title: 'Doctor of the Church', lived: '1347–1380' },
        30: { name: 'St. Pius V', title: 'Pope & reformer', lived: '1504–1572' },
    },
    4: { // May
        1: { name: 'St. Joseph the Worker', title: 'Patron of workers', lived: '1st century' },
        2: { name: 'St. Athanasius', title: 'Doctor of the Church', lived: '296–373' },
        3: { name: 'Sts. Philip & James', title: 'Apostles', lived: '1st century' },
        4: { name: 'St. Florian', title: 'Patron of firefighters', lived: '~250–304' },
        5: { name: 'St. Hilary of Arles', title: 'Bishop', lived: '401–449' },
        6: { name: 'St. Dominic Savio', title: 'Patron of choirboys', lived: '1842–1857' },
        7: { name: 'St. Rose Venerini', title: 'Foundress', lived: '1656–1728' },
        8: { name: 'St. Boniface IV', title: 'Pope', lived: '~550–615' },
        9: { name: 'St. Pachomius', title: 'Founder of cenobitic monasticism', lived: '~292–348' },
        10: { name: 'St. Damien of Molokai', title: 'Apostle to the lepers', lived: '1840–1889' },
        11: { name: 'Sts. Cyril & Methodius', title: 'Patrons of Europe', lived: '9th century' },
        12: { name: 'Sts. Nereus & Achilleus', title: 'Roman soldiers & Martyrs', lived: '~100 AD' },
        13: { name: 'Our Lady of Fátima', title: 'Apparition in Portugal', lived: '1917' },
        14: { name: 'St. Matthias', title: 'Apostle', lived: '1st century' },
        15: { name: 'St. Isidore the Farmer', title: 'Patron of farmers', lived: '1070–1130' },
        16: { name: 'St. Simon Stock', title: 'Carmelite prior general', lived: '~1165–1265' },
        17: { name: 'St. Paschal Baylon', title: 'Patron of Eucharistic congresses', lived: '1540–1592' },
        18: { name: 'St. John I', title: 'Pope & Martyr', lived: '~470–526' },
        19: { name: 'St. Celestine V', title: 'Pope who abdicated', lived: '1215–1296' },
        20: { name: 'St. Bernardine of Siena', title: 'Franciscan preacher', lived: '1380–1444' },
        21: { name: 'St. Cristóbal Magallanes', title: 'Priest & Martyr of Mexico', lived: '1869–1927' },
        22: { name: 'St. Rita of Cascia', title: 'Patron of impossible causes', lived: '1381–1457' },
        23: { name: 'St. John Baptist de Rossi', title: 'Priest of Rome', lived: '1698–1764' },
        24: { name: 'Mary, Help of Christians', title: 'Auxiliatrix', lived: 'Tradition' },
        25: { name: 'St. Bede the Venerable', title: 'Doctor of the Church, historian', lived: '672–735' },
        26: { name: 'St. Philip Neri', title: 'Apostle of Rome', lived: '1515–1595' },
        27: { name: 'St. Augustine of Canterbury', title: 'Apostle of England', lived: '~534–604' },
        28: { name: 'St. Bernard of Montjoux', title: 'Patron of mountaineers', lived: '~923–1008' },
        29: { name: 'St. Ursula Ledóchowska', title: 'Foundress', lived: '1865–1939' },
        30: { name: 'St. Joan of Arc', title: 'Patron of France & soldiers', lived: '1412–1431' },
        31: { name: 'Visitation of the Blessed Virgin Mary', title: 'Mary visits Elizabeth', lived: '1st century' },
    },
    5: { // June
        1: { name: 'St. Justin Martyr', title: 'Philosopher & Martyr', lived: '100–165' },
        2: { name: 'Sts. Marcellinus & Peter', title: 'Martyrs of Rome', lived: '~300–304' },
        3: { name: 'St. Charles Lwanga', title: 'Martyr of Uganda', lived: '1860–1886' },
        4: { name: 'St. Francis Caracciolo', title: 'Founder, Clerks Regular Minor', lived: '1563–1608' },
        5: { name: 'St. Boniface', title: 'Apostle of Germany', lived: '675–754' },
        6: { name: 'St. Norbert', title: 'Founder of the Premonstratensians', lived: '1080–1134' },
        7: { name: 'Bl. Anne of St. Bartholomew', title: 'Carmelite nun', lived: '1549–1626' },
        8: { name: 'St. Médard', title: 'Bishop of Noyon', lived: '~456–545' },
        9: { name: 'St. Ephrem', title: 'Doctor of the Church', lived: '306–373' },
        10: { name: 'St. Landericus of Paris', title: 'Bishop', lived: '~600–656' },
        11: { name: 'St. Barnabas', title: 'Apostle', lived: '1st century' },
        12: { name: 'St. Eskil', title: 'Bishop & Martyr of Sweden', lived: '~1000–1080' },
        13: { name: 'St. Anthony of Padua', title: 'Patron of lost things', lived: '1195–1231' },
        14: { name: 'St. Methodius of Constantinople', title: 'Patriarch', lived: '~788–847' },
        15: { name: 'St. Vitus', title: 'Patron of dancers & actors', lived: '~290–303' },
        16: { name: 'St. Lutgardis', title: 'Cistercian mystic', lived: '1182–1246' },
        17: { name: 'St. Hervé', title: 'Patron of the blind', lived: '521–575' },
        18: { name: 'St. Gregory Barbarigo', title: 'Cardinal-Bishop of Padua', lived: '1625–1697' },
        19: { name: 'St. Romuald', title: 'Founder of the Camaldolese', lived: '~951–1027' },
        20: { name: 'St. Silverius', title: 'Pope & Martyr', lived: '~480–537' },
        21: { name: 'St. Aloysius Gonzaga', title: 'Patron of youth', lived: '1568–1591' },
        22: { name: 'St. Paulinus of Nola', title: 'Bishop & poet', lived: '354–431' },
        23: { name: 'St. Etheldreda', title: 'Queen & Abbess of Ely', lived: '~636–679' },
        24: { name: 'Nativity of St. John the Baptist', title: 'Precursor of Christ', lived: '~5 BC–~31 AD' },
        25: { name: 'St. William of Vercelli', title: 'Hermit & founder', lived: '1085–1142' },
        26: { name: 'St. Josemaría Escrivá', title: 'Founder of Opus Dei', lived: '1902–1975' },
        27: { name: 'St. Cyril of Alexandria', title: 'Doctor of the Church', lived: '376–444' },
        28: { name: 'St. Irenaeus', title: 'Bishop & Doctor of the Church', lived: '130–202' },
        29: { name: 'Sts. Peter & Paul', title: 'Apostles & pillars of the Church', lived: '1st century' },
        30: { name: 'First Martyrs of the Church of Rome', title: 'Martyred under Nero, 64 AD', lived: '1st century' },
    },
    6: { // July
        1: { name: 'St. Junípero Serra', title: 'Apostle of California', lived: '1713–1784' },
        2: { name: 'St. Bernardino Realino', title: 'Jesuit priest', lived: '1530–1616' },
        3: { name: 'St. Thomas', title: 'Apostle (Doubting Thomas)', lived: '1st century' },
        4: { name: 'St. Elizabeth of Portugal', title: 'Queen & peacemaker', lived: '1271–1336' },
        5: { name: 'St. Anthony Mary Zaccaria', title: 'Founder, Barnabites', lived: '1502–1539' },
        6: { name: 'St. Maria Goretti', title: 'Virgin & Martyr, patron of purity', lived: '1890–1902' },
        7: { name: 'St. Willibald', title: 'Bishop of Eichstätt', lived: '~700–787' },
        8: { name: 'St. Kilian', title: 'Bishop & Martyr of Franconia', lived: '~640–689' },
        9: { name: 'St. Augustine Zhao Rong', title: 'Priest & Martyr of China', lived: '1746–1815' },
        10: { name: 'St. Veronica Giuliani', title: 'Capuchin mystic', lived: '1660–1727' },
        11: { name: 'St. Benedict of Nursia', title: 'Father of Western Monasticism', lived: '480–547' },
        12: { name: 'St. John Gualbert', title: 'Founder of the Vallombrosans', lived: '~985–1073' },
        13: { name: 'St. Henry II', title: 'Holy Roman Emperor', lived: '973–1024' },
        14: { name: 'St. Kateri Tekakwitha', title: 'Lily of the Mohawks', lived: '1656–1680' },
        15: { name: 'St. Bonaventure', title: 'Doctor of the Church', lived: '1221–1274' },
        16: { name: 'Our Lady of Mount Carmel', title: 'Patroness of the Carmelites' },
        17: { name: 'St. Alexius', title: 'The Man of God', lived: '5th century' },
        18: { name: 'St. Camillus de Lellis', title: 'Patron of nurses', lived: '1550–1614' },
        19: { name: 'St. Arsenius the Great', title: 'Desert Father', lived: '350–449' },
        20: { name: 'St. Apollinaris', title: 'Bishop & Martyr of Ravenna', lived: '1st century' },
        21: { name: 'St. Lawrence of Brindisi', title: 'Doctor of the Church', lived: '1559–1619' },
        22: { name: 'St. Mary Magdalene', title: 'Apostle to the Apostles', lived: '1st century' },
        23: { name: 'St. Bridget of Sweden', title: 'Patron of Europe', lived: '1303–1373' },
        24: { name: 'St. Sharbel Makhlūf', title: 'Maronite monk of Lebanon', lived: '1828–1898' },
        25: { name: 'St. James the Greater', title: 'Apostle, patron of Spain', lived: '~5–44 AD' },
        26: { name: 'Sts. Joachim & Anne', title: 'Parents of the Blessed Virgin Mary', lived: '1st century BC' },
        27: { name: 'St. Pantaleon', title: 'Physician & Martyr', lived: '~275–305' },
        28: { name: 'St. Alphonsa', title: 'First woman saint of India', lived: '1910–1946' },
        29: { name: 'St. Martha', title: 'Patron of cooks & housewives', lived: '1st century' },
        30: { name: 'St. Peter Chrysologus', title: 'Doctor of the Church', lived: '380–450' },
        31: { name: 'St. Ignatius of Loyola', title: 'Founder of the Jesuits', lived: '1491–1556' },
    },
    7: { // August
        1: { name: 'St. Alphonsus Liguori', title: 'Doctor of the Church', lived: '1696–1787' },
        2: { name: 'St. Eusebius of Vercelli', title: 'Bishop', lived: '~283–371' },
        3: { name: 'St. Lydia Purpuraria', title: 'First European convert', lived: '1st century' },
        4: { name: 'St. John Vianney', title: 'Patron of parish priests', lived: '1786–1859' },
        5: { name: 'Dedication of Basilica of St. Mary Major', title: 'Our Lady of the Snows' },
        6: { name: 'Transfiguration of the Lord', title: 'Christ revealed in glory' },
        7: { name: 'St. Cajetan', title: 'Founder of the Theatines', lived: '1480–1547' },
        8: { name: 'St. Dominic de Guzmán', title: 'Founder of the Dominicans', lived: '1170–1221' },
        9: { name: 'St. Teresa Benedicta of the Cross', title: 'Edith Stein, philosopher & Martyr', lived: '1891–1942' },
        10: { name: 'St. Lawrence', title: 'Deacon & Martyr of Rome', lived: '~225–258' },
        11: { name: 'St. Clare of Assisi', title: 'Foundress of the Poor Clares', lived: '1194–1253' },
        12: { name: 'St. Jane Frances de Chantal', title: 'Co-foundress of the Visitation Order', lived: '1572–1641' },
        13: { name: 'Sts. Pontian & Hippolytus', title: 'Pope & Priest, Martyrs', lived: '3rd century' },
        14: { name: 'St. Maximilian Kolbe', title: 'Martyr of Auschwitz', lived: '1894–1941' },
        15: { name: 'Assumption of the Blessed Virgin Mary', title: 'Mary taken body & soul into heaven' },
        16: { name: 'St. Stephen of Hungary', title: 'First King of Hungary', lived: '975–1038' },
        17: { name: 'St. Hyacinth of Poland', title: 'Dominican friar', lived: '1185–1257' },
        18: { name: 'St. Helena', title: 'Empress & finder of the True Cross', lived: '~246–330' },
        19: { name: 'St. John Eudes', title: 'Founder of the Eudists', lived: '1601–1680' },
        20: { name: 'St. Bernard of Clairvaux', title: 'Doctor of the Church', lived: '1090–1153' },
        21: { name: 'St. Pius X', title: 'Pope', lived: '1835–1914' },
        22: { name: 'Queen of Heaven', title: 'Coronation of the Blessed Virgin' },
        23: { name: 'St. Rose of Lima', title: 'First saint of the Americas', lived: '1586–1617' },
        24: { name: 'St. Bartholomew', title: 'Apostle', lived: '1st century' },
        25: { name: 'St. Louis IX', title: 'King of France', lived: '1214–1270' },
        26: { name: 'St. Elizabeth Bichier des Âges', title: 'Foundress', lived: '1773–1838' },
        27: { name: 'St. Monica', title: 'Mother of St. Augustine', lived: '~331–387' },
        28: { name: 'St. Augustine of Hippo', title: 'Doctor of the Church', lived: '354–430' },
        29: { name: 'Beheading of St. John the Baptist', title: 'Martyrdom of the Precursor', lived: '~5 BC–31 AD' },
        30: { name: 'St. Jeanne Jugan', title: 'Foundress, Little Sisters of the Poor', lived: '1792–1879' },
        31: { name: 'St. Raymond Nonnatus', title: 'Patron of midwives', lived: '1204–1240' },
    },
    8: { // September
        1: { name: 'St. Giles', title: 'Abbot & patron of the disabled', lived: '~650–710' },
        2: { name: 'St. Ingrid of Skänninge', title: 'First Dominican nun of Sweden', lived: '~1220–1282' },
        3: { name: 'St. Gregory the Great', title: 'Pope & Doctor of the Church', lived: '540–604' },
        4: { name: 'St. Rosalia', title: 'Patron of Palermo', lived: '~1130–1166' },
        5: { name: 'St. Teresa of Calcutta', title: 'Mother Teresa', lived: '1910–1997' },
        6: { name: 'St. Zachariah & St. Elizabeth', title: 'Parents of John the Baptist', lived: '1st century BC' },
        7: { name: 'St. Regina', title: 'Virgin & Martyr', lived: '~220–251' },
        8: { name: 'Nativity of the Blessed Virgin Mary', title: 'Birthday of Mary' },
        9: { name: 'St. Peter Claver', title: 'Apostle to the slaves', lived: '1580–1654' },
        10: { name: 'St. Nicholas of Tolentino', title: 'Augustinian friar', lived: '1245–1305' },
        11: { name: 'St. Deiniol', title: 'Bishop of Bangor', lived: '6th century' },
        12: { name: 'Most Holy Name of Mary', title: 'Victory at the Battle of Vienna, 1683' },
        13: { name: 'St. John Chrysostom', title: 'Doctor of the Church', lived: '349–407' },
        14: { name: 'Exaltation of the Holy Cross', title: 'Discovery of the True Cross' },
        15: { name: 'Our Lady of Sorrows', title: 'Seven sorrows of Mary' },
        16: { name: 'Sts. Cornelius & Cyprian', title: 'Pope & Bishop, Martyrs', lived: '3rd century' },
        17: { name: 'St. Robert Bellarmine', title: 'Doctor of the Church', lived: '1542–1621' },
        18: { name: 'St. Joseph of Cupertino', title: 'Patron of aviators', lived: '1603–1663' },
        19: { name: 'St. Januarius', title: 'Bishop & Martyr of Naples', lived: '~272–305' },
        20: { name: 'St. Andrew Kim Tae-gŏn', title: 'First Korean priest & Martyr', lived: '1821–1846' },
        21: { name: 'St. Matthew', title: 'Apostle & Evangelist', lived: '1st century' },
        22: { name: 'St. Maurice', title: 'Commander of the Theban Legion', lived: '~250–287' },
        23: { name: 'St. Padre Pio', title: 'Capuchin friar, stigmatist', lived: '1887–1968' },
        24: { name: 'Our Lady of Ransom', title: 'Mercy for captives' },
        25: { name: 'St. Sergius of Radonezh', title: 'Patron of Russia', lived: '1314–1392' },
        26: { name: 'Sts. Cosmas & Damian', title: 'Patron saints of physicians', lived: '~260–303' },
        27: { name: 'St. Vincent de Paul', title: 'Patron of charity', lived: '1581–1660' },
        28: { name: 'St. Wenceslaus', title: 'Patron of Czech Republic', lived: '~907–935' },
        29: { name: 'Sts. Michael, Gabriel & Raphael', title: 'The three Archangels' },
        30: { name: 'St. Jerome', title: 'Doctor of the Church, translator of Bible', lived: '347–420' },
    },
    9: { // October
        1: { name: 'St. Thérèse of Lisieux', title: 'The Little Flower', lived: '1873–1897' },
        2: { name: 'Guardian Angels', title: 'Feast of the Guardian Angels' },
        3: { name: 'St. Thomas de Cantilupe', title: 'Bishop of Hereford', lived: '1218–1282' },
        4: { name: 'St. Francis of Assisi', title: 'Patron of animals & ecology', lived: '1181–1226' },
        5: { name: 'St. Faustina Kowalska', title: 'Apostle of Divine Mercy', lived: '1905–1938' },
        6: { name: 'St. Bruno', title: 'Founder of the Carthusians', lived: '1030–1101' },
        7: { name: 'Our Lady of the Rosary', title: 'Victory at Lepanto, 1571' },
        8: { name: 'St. Pelagia the Penitent', title: 'Actress turned hermitess', lived: '~300' },
        9: { name: 'St. Denis', title: 'Bishop & Martyr, patron of Paris', lived: '~250–270' },
        10: { name: 'St. Francis Borgia', title: 'General of the Jesuits', lived: '1510–1572' },
        11: { name: 'St. John XXIII', title: 'Pope ("Good Pope John")', lived: '1881–1963' },
        12: { name: 'Our Lady of Aparecida', title: 'Patroness of Brazil' },
        13: { name: 'St. Edward the Confessor', title: 'King of England', lived: '1003–1066' },
        14: { name: 'St. Callistus I', title: 'Pope & Martyr', lived: '~170–222' },
        15: { name: 'St. Teresa of Ávila', title: 'Doctor of the Church', lived: '1515–1582' },
        16: { name: 'St. Hedwig', title: 'Duchess of Silesia', lived: '1174–1243' },
        17: { name: 'St. Ignatius of Antioch', title: 'Bishop & Martyr', lived: '~50–108' },
        18: { name: 'St. Luke', title: 'Evangelist, patron of artists & doctors', lived: '1st century' },
        19: { name: 'Sts. Jean de Brébeuf & Isaac Jogues', title: 'North American Martyrs', lived: '17th century' },
        20: { name: 'St. Paul of the Cross', title: 'Founder of the Passionists', lived: '1694–1775' },
        21: { name: 'St. Hilarion', title: 'Hermit & monastic founder', lived: '291–371' },
        22: { name: 'St. John Paul II', title: 'Pope', lived: '1920–2005' },
        23: { name: 'St. John of Capistrano', title: 'Patron of jurists', lived: '1386–1456' },
        24: { name: 'St. Anthony Mary Claret', title: 'Archbishop & founder', lived: '1807–1870' },
        25: { name: 'Sts. Crispin & Crispinian', title: 'Patrons of shoemakers', lived: '~285' },
        26: { name: 'St. Evaristus', title: 'Pope & Martyr', lived: '~81–107' },
        27: { name: 'St. Frumentius', title: 'Apostle of Ethiopia', lived: '~300–383' },
        28: { name: 'Sts. Simon & Jude', title: 'Apostles', lived: '1st century' },
        29: { name: 'St. Narcissus of Jerusalem', title: 'Bishop', lived: '99–216' },
        30: { name: 'St. Alphonsus Rodríguez', title: 'Jesuit lay brother', lived: '1532–1617' },
        31: { name: 'St. Wolfgang of Regensburg', title: 'Bishop', lived: '924–994' },
    },
    10: { // November
        1: { name: 'All Saints', title: 'Feast of All Saints' },
        2: { name: 'All Souls', title: 'Commemoration of all the faithful departed' },
        3: { name: 'St. Martin de Porres', title: 'Patron of social justice', lived: '1579–1639' },
        4: { name: 'St. Charles Borromeo', title: 'Archbishop of Milan', lived: '1538–1584' },
        5: { name: 'St. Elizabeth', title: 'Mother of John the Baptist', lived: '1st century BC' },
        6: { name: 'St. Leonard of Noblac', title: 'Patron of prisoners', lived: '~496–559' },
        7: { name: 'St. Willibrord', title: 'Apostle to the Frisians', lived: '658–739' },
        8: { name: 'St. Elizabeth of the Trinity', title: 'Carmelite mystic', lived: '1880–1906' },
        9: { name: 'Dedication of the Lateran Basilica', title: 'Mother Church of Rome' },
        10: { name: 'St. Leo the Great', title: 'Pope & Doctor of the Church', lived: '~400–461' },
        11: { name: 'St. Martin of Tours', title: 'Bishop, patron of soldiers', lived: '316–397' },
        12: { name: 'St. Josaphat', title: 'Bishop & Martyr', lived: '1580–1623' },
        13: { name: 'St. Frances Xavier Cabrini', title: 'Patron of immigrants', lived: '1850–1917' },
        14: { name: 'St. Nicholas Tavelic', title: 'Franciscan Martyr', lived: '~1340–1391' },
        15: { name: 'St. Albert the Great', title: 'Doctor of the Church', lived: '~1206–1280' },
        16: { name: 'St. Margaret of Scotland', title: 'Queen & patroness', lived: '1045–1093' },
        17: { name: 'St. Elizabeth of Hungary', title: 'Patron of bakers & the homeless', lived: '1207–1231' },
        18: { name: 'Dedication of Basilicas of Peter & Paul', title: 'Rome' },
        19: { name: 'St. Mechtilde of Hackeborn', title: 'Benedictine mystic', lived: '1241–1298' },
        20: { name: 'St. Edmund the Martyr', title: 'King of East Anglia', lived: '841–869' },
        21: { name: 'Presentation of the Blessed Virgin Mary', title: 'Mary presented at the Temple' },
        22: { name: 'St. Cecilia', title: 'Patron of musicians', lived: '~200–230' },
        23: { name: 'St. Clement I', title: 'Pope & Martyr', lived: '~35–99 AD' },
        24: { name: 'St. Andrew Dūng-Lạc', title: 'Vietnamese Martyrs', lived: '1795–1839' },
        25: { name: 'St. Catherine of Alexandria', title: 'Virgin & Martyr', lived: '~287–305' },
        26: { name: 'St. Leonard of Port Maurice', title: 'Patron of parish missions', lived: '1676–1751' },
        27: { name: 'St. Virgil of Salzburg', title: 'Bishop', lived: '~700–784' },
        28: { name: 'St. Catherine Labouré', title: 'Visionary of the Miraculous Medal', lived: '1806–1876' },
        29: { name: 'St. Saturninus of Toulouse', title: 'Bishop & Martyr', lived: '~200–257' },
        30: { name: 'St. Andrew', title: 'Apostle, patron of Scotland & Greece', lived: '~5–60 AD' },
    },
    11: { // December
        1: { name: 'St. Edmund Campion', title: 'Jesuit Martyr of England', lived: '1540–1581' },
        2: { name: 'St. Bibiana', title: 'Virgin & Martyr of Rome', lived: '~347–363' },
        3: { name: 'St. Francis Xavier', title: 'Patron of missionaries', lived: '1506–1552' },
        4: { name: 'St. John Damascene', title: 'Doctor of the Church', lived: '675–749' },
        5: { name: 'St. Sabas', title: 'Abbot of the Judean Desert', lived: '439–532' },
        6: { name: 'St. Nicholas', title: 'Patron of children & sailors', lived: '270–343' },
        7: { name: 'St. Ambrose', title: 'Doctor of the Church', lived: '339–397' },
        8: { name: 'Immaculate Conception', title: 'Mary conceived without original sin' },
        9: { name: 'St. Juan Diego', title: 'Visionary of Our Lady of Guadalupe', lived: '1474–1548' },
        10: { name: 'Our Lady of Loreto', title: 'Holy House of Nazareth' },
        11: { name: 'St. Damasus I', title: 'Pope', lived: '~305–384' },
        12: { name: 'Our Lady of Guadalupe', title: 'Patroness of the Americas' },
        13: { name: 'St. Lucy', title: 'Virgin & Martyr, patron of the blind', lived: '283–304' },
        14: { name: 'St. John of the Cross', title: 'Doctor of the Church', lived: '1542–1591' },
        15: { name: 'St. Virginia Centurione Bracelli', title: 'Foundress', lived: '1587–1651' },
        16: { name: 'St. Adelaide', title: 'Holy Roman Empress', lived: '931–999' },
        17: { name: 'St. Lazarus', title: 'Friend of Jesus, raised from the dead', lived: '1st century' },
        18: { name: 'St. Flannan', title: 'Bishop of Killaloe', lived: '7th century' },
        19: { name: 'Bl. Pope Urban V', title: 'Pope in Avignon', lived: '1310–1370' },
        20: { name: 'St. Dominic of Silos', title: 'Abbot', lived: '1000–1073' },
        21: { name: 'St. Peter Canisius', title: 'Doctor of the Church', lived: '1521–1597' },
        22: { name: 'St. Francisca Cabrini', title: 'Patron of immigrants', lived: '1850–1917' },
        23: { name: 'St. John of Kety', title: 'Theologian of Kraków', lived: '1390–1473' },
        24: { name: 'Christmas Eve', title: 'Vigil of the Nativity of the Lord' },
        25: { name: 'Christmas Day', title: 'Nativity of Our Lord Jesus Christ' },
        26: { name: 'St. Stephen', title: 'First Martyr (Protomartyr)', lived: '~5–34 AD' },
        27: { name: 'St. John the Evangelist', title: 'Apostle, "Beloved Disciple"', lived: '~6–100 AD' },
        28: { name: 'Holy Innocents', title: 'Children slain by King Herod' },
        29: { name: 'St. Thomas Becket', title: 'Archbishop of Canterbury & Martyr', lived: '1118–1170' },
        30: { name: 'St. Egwin', title: 'Bishop of Worcester', lived: '~650–717' },
        31: { name: 'St. Sylvester I', title: 'Pope', lived: '~285–335' },
    },
};

function getSaintForDate(date: Date): { name: string; title: string; lived?: string } {
    const month = date.getMonth();
    const day = date.getDate();
    return SAINTS[month]?.[day] ?? { name: 'Unknown', title: 'No saint recorded for this day' };
}

function getMoonAge(date: Date): number {
    const known = new Date(2000, 0, 6, 18, 14);
    const diff = (date.getTime() - known.getTime()) / 86400000;
    return ((diff % 29.530588853) + 29.530588853) % 29.530588853;
}

function getMoonPhase(moonAge: number) {
    const frac = moonAge / 29.530588853;
    if (frac < 0.0625 || frac >= 0.9375) return { name: 'New Moon', icon: '🌑' };
    if (frac < 0.1875) return { name: 'Waxing Crescent', icon: '🌒' };
    if (frac < 0.3125) return { name: 'First Quarter', icon: '🌓' };
    if (frac < 0.4375) return { name: 'Waxing Gibbous', icon: '🌔' };
    if (frac < 0.5625) return { name: 'Full Moon', icon: '🌕' };
    if (frac < 0.6875) return { name: 'Waning Gibbous', icon: '🌖' };
    if (frac < 0.8125) return { name: 'Last Quarter', icon: '🌗' };
    return { name: 'Waning Crescent', icon: '🌘' };
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    return (date.getTime() - start.getTime()) / 86400000;
}

// Prague latitude for stereographic projection
const PRAGUE_LAT = 50.0875; // °N

export default function PragueClockScreen({ route }: Props) {
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate + 'T12:00:00'), [route.params.birthDate]);
    const [currentDate, setCurrentDate] = useState(() => new Date(route.params.birthDate + 'T12:00:00'));

    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const [isSpinning, setIsSpinning] = useState(false);

    // Step-based slider mechanics (matching Solar System Time Machine)
    // Each step controls: snap increment, slider sensitivity range, and label
    const steps = [
        { label: '1 hr', days: 1 / 24, sliderDays: 7 },         // fine: 1hr snaps, ±7 days visible range
        { label: '6 hr', days: 0.25, sliderDays: 30 },           // 6hr snaps, ±30 days
        { label: '1 day', days: 1, sliderDays: 60 },             // 1-day snaps, ±60 days
        { label: '7 days', days: 7, sliderDays: 365 },           // weekly snaps, ±1 year
        { label: '1 month', days: 30.4375, sliderDays: 1826 },   // monthly snaps, ±5 years
        { label: '1 year', days: 365.25, sliderDays: 7305 },     // yearly snaps, ±20 years
    ];
    const [selectedStepIdx, setSelectedStepIdx] = useState(2); // default: 1 day
    const selectedStepRef = useRef(steps[2].days);
    const sliderDaysRef = useRef(steps[2].sliderDays);
    const HUNDRED_YEARS_MS = 100 * 365.25 * 86400000;

    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);

    const topSliderWRef = useRef(300);
    const [topSliderW, setTopSliderW] = useState(300);

    const applyOffset = useCallback((newOffset: number) => {
        // Snap-to-grid: round to nearest step increment
        const stepDays = selectedStepRef.current;
        const snapped = Math.round(newOffset / stepDays) * stepDays;
        // Clamp to ±100 years
        const minOff = -HUNDRED_YEARS_MS / 86400000;
        const maxOff = HUNDRED_YEARS_MS / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, snapped));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setCurrentDate(new Date(originalBirthDate.getTime() + clamped * 86400000));
    }, [originalBirthDate]);

    // PanResponder for spinning the astronomical dial
    const lastAngleRef = useRef(0);
    const clockPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
            onPanResponderGrant: () => { setIsSpinning(true); lastAngleRef.current = 0; },
            onPanResponderMove: (_, gesture) => {
                const angleDelta = gesture.dx * 0.3;
                const dayDelta = angleDelta - lastAngleRef.current;
                lastAngleRef.current = angleDelta;
                applyOffset(dayOffsetRef.current + dayDelta);
            },
            onPanResponderRelease: () => setIsSpinning(false),
        })
    ).current;

    // Slider PanResponder — uses step-based sensitivity
    const sliderStartRef = useRef(0);
    const timeSliderPan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { sliderStartRef.current = dayOffsetRef.current; },
            onPanResponderMove: (_, gesture) => {
                const totalRange = sliderDaysRef.current;
                const rawOffset = sliderStartRef.current + (gesture.dx / sliderWRef.current) * totalRange;
                applyOffset(rawOffset);
            },
            onPanResponderRelease: () => { },
        })
    ).current;

    // Top slider PanResponder (below 4-panel grid)
    const topSliderStartRef = useRef(0);
    const topSliderPan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { topSliderStartRef.current = dayOffsetRef.current; },
            onPanResponderMove: (_, gesture) => {
                const totalRange = sliderDaysRef.current;
                const rawOffset = topSliderStartRef.current + (gesture.dx / topSliderWRef.current) * totalRange;
                applyOffset(rawOffset);
            },
            onPanResponderRelease: () => { },
        })
    ).current;

    const jumpToToday = useCallback(() => {
        const today = new Date();
        const offsetDays = (today.getTime() - originalBirthDate.getTime()) / 86400000;
        applyOffset(offsetDays);
    }, [originalBirthDate, applyOffset]);

    const formatOffset = (offset: number) => {
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? '+' : '−';
        if (absOffset < 1) {
            const hrs = Math.round(absOffset * 24);
            return `${sign}${hrs} hr${hrs !== 1 ? 's' : ''} from birth`;
        }
        const totalDays = Math.round(absOffset);
        if (totalDays < 365) return `${sign}${totalDays} day${totalDays !== 1 ? 's' : ''} from birth`;
        const years = Math.floor(totalDays / 365.25);
        const remDays = Math.round(totalDays - years * 365.25);
        if (remDays === 0) return `${sign}${years} yr${years !== 1 ? 's' : ''} from birth`;
        return `${sign}${years}y ${remDays}d from birth`;
    };

    // ── Computed astronomical values ──
    const dayOfYear = useMemo(() => getDayOfYear(currentDate), [currentDate]);
    const moonAge = useMemo(() => getMoonAge(currentDate), [currentDate]);
    const moonPhase = useMemo(() => getMoonPhase(moonAge), [moonAge]);
    const birthSaint = useMemo(() => getSaintForDate(originalBirthDate), [originalBirthDate]);
    const currentSaint = useMemo(() => getSaintForDate(currentDate), [currentDate]);

    // Flatten all 365 saints into a linear array for the calendar dial ring
    const allSaints = useMemo(() => {
        const result: { name: string; doy: number }[] = [];
        let doy = 0;
        for (let m = 0; m < 12; m++) {
            for (let d = 1; d <= DAYS_IN_MONTH[m]; d++) {
                const s = SAINTS[m]?.[d];
                result.push({ name: s?.name ?? '', doy });
                doy++;
            }
        }
        return result;
    }, []);

    const hour24 = currentDate.getHours() + currentDate.getMinutes() / 60;
    const hourAngle = (hour24 / 24) * 360;

    // Sun ecliptic longitude
    const sunEclipticLong = ((dayOfYear / 365.25) * 360 + 280) % 360;
    const sunZodiacIndex = Math.floor(((sunEclipticLong + 360) % 360) / 30);

    // Moon ecliptic longitude
    const moonEclipticLong = (sunEclipticLong + (moonAge / 29.530588853) * 360) % 360;

    // Zodiac ring rotation — uses sidereal time (the ecliptic ring completes one
    // rotation per sidereal day ≈ 23h 56m 4s). The sidereal day is shorter than
    // the solar day by the ratio 1.00273791, causing the zodiac to gain ~1°/day
    // on the Sun hand — exactly as on the real Orloj.
    const SIDEREAL_FACTOR = 1.00273791; // solar-to-sidereal conversion
    const siderealAngle = ((dayOfYear / 365.25) * 360 + (hour24 * SIDEREAL_FACTOR / 24) * 360) % 360;
    // The zodiac signs go counterclockwise on the ecliptic ring (matching the real Orloj).
    // The +120 offset aligns Aries with the vernal equinox direction for CCW layout.
    const zodiacRotation = (siderealAngle + 120) % 360;

    // Sunset approximation for Prague (50°N) — used to rotate the outer ring
    // so that Old Czech hour I always aligns with sunset. The real Orloj's
    // outer (Italian hour) ring physically rotates each day for this purpose.
    // Sunset ranges from ~16:00 (Dec solstice) to ~21:15 (Jun solstice).
    const sunsetHour = useMemo(() => {
        const phase = ((dayOfYear - 172) / 365.25) * 2 * Math.PI;
        return 18.6 - 2.6 * Math.cos(phase);
    }, [dayOfYear]);
    // Outer ring rotation: numeral 24 aligns with the Sun's position at sunset.
    // The outer ring has numerals placed at i*15 - 90 degrees. Numeral "24" is at
    // index 23 → angle 255°. The Sun at sunset is at (sunsetHour/24)*360 + 90.
    // Solving: rotation = sunAngle_at_sunset - 255 = (sunsetHour/24)*360 - 165.
    const outerRingRotation = ((sunsetHour / 24) * 360 - 165 + 360) % 360;

    // ── Stereographic projection circles (Tropic of Cancer, Equator, Capricorn) ──
    // On the real Orloj, these are eccentric circles based on stereographic projection from Prague's latitude
    const clockSize = Math.min(SCREEN_W - 32, 400);
    const ck = clockSize / 2;
    // projScale sized so the ecliptic ring (zodiac) fits inside the fixed Roman ring,
    // just as on the real Orloj where the zodiac disc sits within the numeral rings.
    const projScale = ck * 0.44;

    // Stereographic projection: r = tan((90° - dec) / 2) * scale
    const tropicCancerR = Math.tan(dRad((90 - 23.44) / 2)) * projScale;
    const equatorR = Math.tan(dRad(45)) * projScale; // dec=0 → 45°
    const tropicCapricornR = Math.tan(dRad((90 + 23.44) / 2)) * projScale;

    // Prague horizon circle (eccentric — shifted south because Prague is at ~50°N)
    // On the real Orloj the horizon is a large off-center circle; we approximate it.
    const horizonR = Math.tan(dRad((90 - 0) / 2)) * projScale / Math.cos(dRad(PRAGUE_LAT));
    const horizonOffset = Math.tan(dRad(PRAGUE_LAT / 2)) * projScale * 0.55;

    // Ecliptic (zodiac ring) offset — on the real Orloj the ecliptic disc is eccentric.
    // Cancer (inner circle) touches the ring’s topmost point; Capricorn (outer) the bottommost.
    // Center = midpoint = ck + (Cap−Can)/2, shifted BELOW dial center (toward north/midnight).
    const eclipticOffset = (tropicCapricornR - tropicCancerR) / 2;
    // Ecliptic ring radii: outer = midpoint between tropics + half the gap
    const eclipticR = (tropicCancerR + tropicCapricornR) / 2;
    const eclipticInnerR = eclipticR * 0.82;
    const eclipticOuterR = eclipticR * 1.12;

    // Calendar dial: current month and day-of-year angle
    const calendarAngle = ((dayOfYear / 365.25) * 360) % 360;
    const currentMonth = currentDate.getMonth();

    // 4-panel grid sizing
    const panelSize = Math.floor((SCREEN_W - 48) / 2);
    const pk = panelSize / 2;

    // Side-by-side dual dials sizing
    const dualSize = Math.floor((SCREEN_W - 56) / 2);
    const dk = dualSize / 2;

    const scrollRef = useRef<ScrollView>(null);

    return (
        <LinearGradient colors={['#1a0f0a', '#0d0805', '#1a0f0a']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0f0a" />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>🕰️</Text>
                    <Text style={styles.headerTitle}>Prague Astronomical Clock</Text>
                    <Text style={styles.headerSubtitle}>Staroměstský Orloj • Installed 1410 AD</Text>
                    <Text style={styles.headerDate}>
                        {originalBirthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* ── DESCRIPTION ── */}
                <View style={styles.card}>
                    <Text style={styles.cardBody}>
                        The Prague Orloj is the oldest working astronomical clock in the world, mounted on the southern wall of the Old Town Hall since 1410. It consists of three main components:{"\n\n"}• The <Text style={{ color: '#DAA520', fontWeight: '800' }}>Astronomical Dial</Text> — showing the positions of the Sun and Moon against the zodiac, with Earth at the center{"\n\n"}• The <Text style={{ color: '#DAA520', fontWeight: '800' }}>Calendar Dial</Text> — displaying months, saints' feast days, and the agricultural cycle{"\n\n"}• The <Text style={{ color: '#DAA520', fontWeight: '800' }}>Animated Figures</Text> — twelve Apostles parading through windows on the hour, flanked by four allegorical statues
                    </Text>
                </View>

                {/* ═══════════════════════════════════════════ */}
                {/* ═══ 4-PANEL ORLOJ OVERVIEW GRID ═══ */}
                {/* ═══════════════════════════════════════════ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🕰️ The Four Faces of the Orloj</Text>
                    <Text style={styles.cardSubtitle}>Astronomical Dial • Calendar Dial • Ecliptic Zodiac • Lunar Phase</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>

                        {/* ── PANEL 1: Astronomical Dial (mini) ── */}
                        <View style={styles.gridPanel}>
                            <View style={styles.gridPanelClock}>
                                <Svg width={panelSize - 12} height={panelSize - 12}>
                                    <Defs>
                                        <SvgLinearGradient id="pGold" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#C9A84C" />
                                            <Stop offset="0.5" stopColor="#FFE8A0" />
                                            <Stop offset="1" stopColor="#8B6914" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    {/* Background */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.98} fill="#0a0805" />
                                    {/* Outer golden ring */}
                                    <G rotation={outerRingRotation} origin={`${pk - 6}, ${pk - 6}`}>
                                        <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.94} fill="none" stroke="url(#pGold)" strokeWidth={panelSize * 0.08} />
                                        {OLD_CZECH_24.map((num, i) => {
                                            const a = i * 15 - 90;
                                            const r = dRad(a);
                                            const nr = (pk - 6) * 0.87;
                                            const nx = pk - 6 + nr * Math.cos(r);
                                            const ny = pk - 6 + nr * Math.sin(r);
                                            return (
                                                <SvgText key={`pr-${i}`} x={nx} y={ny + 2} fontSize={panelSize * 0.035} fontWeight="900" fill="#1a0a00" textAnchor="middle" rotation={a + 90} origin={`${nx}, ${ny}`}>{num}</SvgText>
                                            );
                                        })}
                                    </G>
                                    {/* Day/night background */}
                                    {(() => {
                                        const bgR = (pk - 6) * 0.76;
                                        const hCy = pk - 6 + horizonOffset * ((pk - 6) / ck);
                                        const hR = bgR * 0.85;
                                        return (
                                            <G>
                                                <Circle cx={pk - 6} cy={pk - 6} r={bgR} fill="#050510" />
                                                <Circle cx={pk - 6} cy={pk - 6 + horizonOffset * ((pk - 6) / ck) + bgR * 0.12} r={bgR * 0.92} fill="#3a1a0a" />
                                                <Circle cx={pk - 6} cy={hCy} r={hR} fill="#1a4a8a" />
                                            </G>
                                        );
                                    })()}
                                    {/* Zodiac ring — eccentric */}
                                    {(() => {
                                        const pScale = (pk - 6) / ck;
                                        const pEclOff = eclipticOffset * pScale;
                                        const pEclR = eclipticR * pScale;
                                        const pEclIn = eclipticInnerR * pScale;
                                        const pEclOut = eclipticOuterR * pScale;
                                        return (
                                            <G rotation={zodiacRotation} origin={`${pk - 6}, ${pk - 6}`}>
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={pEclR} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth={panelSize * 0.12} />
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={pEclOut} fill="none" stroke="#B8860B" strokeWidth={1} />
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={pEclIn} fill="none" stroke="#B8860B" strokeWidth={1} />
                                                {ZODIAC_SYMBOLS.map((sym, i) => {
                                                    const a = -(i * 30) - 90 - 15;
                                                    const r = dRad(a);
                                                    const sx = pk - 6 + pEclR * Math.cos(r);
                                                    const sy = pk - 6 + pEclOff + pEclR * Math.sin(r);
                                                    return <SvgText key={`pz-${i}`} x={sx} y={sy + 2} fontSize={panelSize * 0.04} fill="#FFD700" fontWeight="900" textAnchor="middle" rotation={a + 90} origin={`${sx}, ${sy}`}>{sym}</SvgText>;
                                                })}
                                            </G>
                                        );
                                    })()}
                                    {/* Earth */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.1} fill="#1a3a5a" />
                                    <SvgText x={pk - 6} y={pk - 6 + 3} fontSize={panelSize * 0.05} textAnchor="middle">🌍</SvgText>
                                    {/* Sun hand */}
                                    {(() => {
                                        const sa = dRad(hourAngle + 90);
                                        const sr = (pk - 6) * 0.62;
                                        const sx = pk - 6 + sr * Math.cos(sa);
                                        const sy = pk - 6 + sr * Math.sin(sa);
                                        return (
                                            <G>
                                                <Line x1={pk - 6} y1={pk - 6} x2={sx} y2={sy} stroke="#DAA520" strokeWidth={1.5} />
                                                <Circle cx={sx} cy={sy} r={panelSize * 0.025} fill="#FFD700" />
                                            </G>
                                        );
                                    })()}
                                    {/* Moon hand */}
                                    {(() => {
                                        const ma24 = ((hour24 + (moonAge / 29.530588853) * 24) % 24) / 24 * 360;
                                        const ma = dRad(ma24 + 90);
                                        const mr = (pk - 6) * 0.55;
                                        const mx = pk - 6 + mr * Math.cos(ma);
                                        const my = pk - 6 + mr * Math.sin(ma);
                                        return (
                                            <G>
                                                <Line x1={pk - 6} y1={pk - 6} x2={mx} y2={my} stroke="#888" strokeWidth={1} />
                                                <Circle cx={mx} cy={my} r={panelSize * 0.018} fill="#E8E8C8" />
                                            </G>
                                        );
                                    })()}
                                    {/* Hub */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.035} fill="#DAA520" />
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.97} fill="none" stroke="#4a3010" strokeWidth={2} />
                                </Svg>
                            </View>
                            <Text style={styles.gridPanelTitle}>Astronomical Dial</Text>
                            <Text style={styles.gridPanelSub}>Sun & Moon • Day/Night</Text>
                        </View>

                        {/* ── PANEL 2: Calendar Dial (mini) ── */}
                        <View style={styles.gridPanel}>
                            <View style={styles.gridPanelClock}>
                                <Svg width={panelSize - 12} height={panelSize - 12}>
                                    {/* Background */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.98} fill="#0a0805" />
                                    {/* Outer golden band */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.94} fill="none" stroke="url(#pGold)" strokeWidth={panelSize * 0.05} />
                                    {/* Month ring */}
                                    <G rotation={-calendarAngle} origin={`${pk - 6}, ${pk - 6}`}>
                                        <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.82} fill="none" stroke="#6B4F1D" strokeWidth={0.8} />
                                        <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.68} fill="none" stroke="#6B4F1D" strokeWidth={0.8} />
                                        <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.75} fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth={panelSize * 0.12} />
                                        {CALENDAR_MONTHS.map((m, i) => {
                                            const sa = i * 30 - 90;
                                            const ma = sa + 15;
                                            const r = dRad(ma);
                                            const nr = (pk - 6) * 0.75;
                                            const nx = pk - 6 + nr * Math.cos(r);
                                            const ny = pk - 6 + nr * Math.sin(r);
                                            const dr = dRad(sa);
                                            const d1 = (pk - 6) * 0.68;
                                            const d2 = (pk - 6) * 0.82;
                                            const isCur = i === currentMonth;
                                            return (
                                                <G key={`pcm-${i}`}>
                                                    <Line x1={pk - 6 + d1 * Math.cos(dr)} y1={pk - 6 + d1 * Math.sin(dr)} x2={pk - 6 + d2 * Math.cos(dr)} y2={pk - 6 + d2 * Math.sin(dr)} stroke="#6B4F1D" strokeWidth={0.6} />
                                                    <SvgText x={nx} y={ny - 2} fontSize={panelSize * 0.028} fill={isCur ? '#FFD700' : 'rgba(218,165,32,0.7)'} fontWeight="900" textAnchor="middle" rotation={ma + 90} origin={`${nx}, ${ny}`}>{m.icon}</SvgText>
                                                    <SvgText x={nx} y={ny + 6} fontSize={panelSize * 0.022} fill={isCur ? '#FFD700' : 'rgba(218,165,32,0.5)'} fontWeight="800" textAnchor="middle" rotation={ma + 90} origin={`${nx}, ${ny}`}>{m.abbr}</SvgText>
                                                </G>
                                            );
                                        })}
                                    </G>
                                    {/* Seasonal medallion */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.55} fill="#0a0805" stroke="#6B4F1D" strokeWidth={1} />
                                    {[
                                        { icon: '🌸', angle: 0, color: '#2E7D32' },
                                        { icon: '☀️', angle: 90, color: '#F9A825' },
                                        { icon: '🍂', angle: 180, color: '#BF360C' },
                                        { icon: '❄️', angle: 270, color: '#1565C0' },
                                    ].map((s) => {
                                        const sr = dRad(s.angle - calendarAngle - 45);
                                        const x = pk - 6 + (pk - 6) * 0.35 * Math.cos(sr);
                                        const y = pk - 6 + (pk - 6) * 0.35 * Math.sin(sr);
                                        return (
                                            <G key={`ps-${s.angle}`}>
                                                <Circle cx={x} cy={y} r={(pk - 6) * 0.1} fill={s.color} opacity={0.2} />
                                                <SvgText x={x} y={y + 3} fontSize={panelSize * 0.04} textAnchor="middle">{s.icon}</SvgText>
                                            </G>
                                        );
                                    })}
                                    {/* Praha center */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.12} fill="#1a0a05" stroke="#DAA520" strokeWidth={1.5} />
                                    <SvgText x={pk - 6} y={pk - 6 + 3} fontSize={panelSize * 0.04} textAnchor="middle">🏰</SvgText>
                                    {/* Pointer */}
                                    <Path d={`M ${pk - 6} ${(pk - 6) * 0.08} L ${pk - 9} ${(pk - 6) * 0.18} L ${pk - 3} ${(pk - 6) * 0.18} Z`} fill="#DAA520" />
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.97} fill="none" stroke="#4a3010" strokeWidth={2} />
                                </Svg>
                            </View>
                            <Text style={styles.gridPanelTitle}>Calendar Dial</Text>
                            <Text style={styles.gridPanelSub}>{CALENDAR_MONTHS[currentMonth].icon} {CALENDAR_MONTHS[currentMonth].abbr} • {currentSaint.name}</Text>
                        </View>

                        {/* ── PANEL 3: Zodiac Ring (zoomed) ── */}
                        <View style={styles.gridPanel}>
                            <View style={styles.gridPanelClock}>
                                <Svg width={panelSize - 12} height={panelSize - 12}>
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.98} fill="#050510" />
                                    {/* Ecliptic ring — eccentric zoomed view */}
                                    {(() => {
                                        const pScale = (pk - 6) / ck;
                                        const pEclOff = eclipticOffset * pScale;
                                        const zR = (pk - 6) * 0.72;
                                        const zIn = (pk - 6) * 0.61;
                                        const zOut = (pk - 6) * 0.83;
                                        return (
                                            <G rotation={zodiacRotation} origin={`${pk - 6}, ${pk - 6}`}>
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={zR} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth={panelSize * 0.22} />
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={zOut} fill="none" stroke="#B8860B" strokeWidth={1.5} />
                                                <Circle cx={pk - 6} cy={pk - 6 + pEclOff} r={zIn} fill="none" stroke="#B8860B" strokeWidth={1.5} />
                                                {ZODIAC_SYMBOLS.map((sym, i) => {
                                                    const sa = -(i * 30) - 90;
                                                    const ma = sa - 15;
                                                    const r = dRad(ma);
                                                    const sx = pk - 6 + zR * Math.cos(r);
                                                    const sy = pk - 6 + pEclOff + zR * Math.sin(r);
                                                    const dr = dRad(sa);
                                                    const isActive = i === sunZodiacIndex;
                                                    return (
                                                        <G key={`pzz-${i}`}>
                                                            <Line x1={pk - 6 + zIn * Math.cos(dr)} y1={pk - 6 + pEclOff + zIn * Math.sin(dr)} x2={pk - 6 + zOut * Math.cos(dr)} y2={pk - 6 + pEclOff + zOut * Math.sin(dr)} stroke="#8B6914" strokeWidth={0.8} />
                                                            <SvgText x={sx} y={sy + 3} fontSize={panelSize * 0.065} fill={isActive ? '#FFD700' : 'rgba(255,215,0,0.5)'} fontWeight="900" textAnchor="middle" rotation={ma + 90} origin={`${sx}, ${sy}`}>{sym}</SvgText>
                                                        </G>
                                                    );
                                                })}
                                            </G>
                                        );
                                    })()}
                                    {/* Sun position indicator at center */}
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.25} fill="rgba(255,213,79,0.06)" />
                                    <SvgText x={pk - 6} y={pk - 6 - 4} fontSize={panelSize * 0.09} textAnchor="middle">☀️</SvgText>
                                    <SvgText x={pk - 6} y={pk - 6 + 12} fontSize={panelSize * 0.04} fill="#FFD700" fontWeight="800" textAnchor="middle">{ZODIAC_NAMES[sunZodiacIndex]}</SvgText>
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.97} fill="none" stroke="#4a3010" strokeWidth={2} />
                                </Svg>
                            </View>
                            <Text style={styles.gridPanelTitle}>Ecliptic Zodiac</Text>
                            <Text style={styles.gridPanelSub}>{ZODIAC_SYMBOLS[sunZodiacIndex]} Sun in {ZODIAC_NAMES[sunZodiacIndex]}</Text>
                        </View>

                        {/* ── PANEL 4: Moon Phase ── */}
                        <View style={styles.gridPanel}>
                            <View style={styles.gridPanelClock}>
                                <Svg width={panelSize - 12} height={panelSize - 12}>
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.98} fill="#050510" />
                                    {/* Starfield */}
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        const sx = ((i * 73 + 17) % (panelSize - 24)) + 6;
                                        const sy = ((i * 47 + 31) % (panelSize - 24)) + 6;
                                        const dist = Math.sqrt((sx - pk + 6) ** 2 + (sy - pk + 6) ** 2);
                                        if (dist > (pk - 6) * 0.95 || dist < (pk - 6) * 0.15) return null;
                                        return <Circle key={`star-${i}`} cx={sx} cy={sy} r={0.8} fill={`rgba(255,255,255,${0.2 + (i % 5) * 0.1})`} />;
                                    })}
                                    {/* Moon disc — large */}
                                    {(() => {
                                        const mR = (pk - 6) * 0.4;
                                        const cx = pk - 6;
                                        const cy = pk - 6 - 6;
                                        const phaseFrac = moonAge / 29.530588853;
                                        return (
                                            <G>
                                                {/* Moon shadow */}
                                                <Circle cx={cx} cy={cy} r={mR + 4} fill="rgba(255,255,255,0.03)" />
                                                {/* Dark half */}
                                                <Circle cx={cx} cy={cy} r={mR} fill="#1a1a1a" stroke="#444" strokeWidth={1} />
                                                {/* Illuminated phase */}
                                                {phaseFrac > 0.48 && phaseFrac < 0.52 ? (
                                                    <Circle cx={cx} cy={cy} r={mR} fill="#E8E8C8" />
                                                ) : phaseFrac > 0.02 && phaseFrac < 0.98 ? (() => {
                                                    const cosP = Math.cos(phaseFrac * 2 * Math.PI);
                                                    const termRx = mR * Math.abs(cosP);
                                                    const litRight = phaseFrac < 0.5;
                                                    const sO = litRight ? 1 : 0;
                                                    const sT = cosP > 0 ? (litRight ? 0 : 1) : (litRight ? 1 : 0);
                                                    return <Path d={`M ${cx} ${cy - mR} A ${mR} ${mR} 0 0 ${sO} ${cx} ${cy + mR} A ${termRx} ${mR} 0 0 ${sT} ${cx} ${cy - mR} Z`} fill="#E8E8C8" />;
                                                })() : null}
                                                {/* Moon face hint */}
                                                <Circle cx={cx - mR * 0.2} cy={cy - mR * 0.15} r={mR * 0.06} fill="rgba(0,0,0,0.15)" />
                                                <Circle cx={cx + mR * 0.2} cy={cy - mR * 0.15} r={mR * 0.06} fill="rgba(0,0,0,0.15)" />
                                            </G>
                                        );
                                    })()}
                                    {/* Phase name */}
                                    <SvgText x={pk - 6} y={(pk - 6) + (pk - 6) * 0.6} fontSize={panelSize * 0.045} fill="#E8E8C8" fontWeight="800" textAnchor="middle">{moonPhase.name}</SvgText>
                                    <SvgText x={pk - 6} y={(pk - 6) + (pk - 6) * 0.78} fontSize={panelSize * 0.03} fill="rgba(255,255,255,0.4)" fontWeight="600" textAnchor="middle">Day {Math.round(moonAge)} of 29.5</SvgText>
                                    <Circle cx={pk - 6} cy={pk - 6} r={(pk - 6) * 0.97} fill="none" stroke="#4a3010" strokeWidth={2} />
                                </Svg>
                            </View>
                            <Text style={styles.gridPanelTitle}>Lunar Phase</Text>
                            <Text style={styles.gridPanelSub}>{moonPhase.icon} {moonPhase.name}</Text>
                        </View>

                    </View>

                    {/* ── TIME SLIDER (below 4-panel grid) ── */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={[styles.sliderDateText, { fontSize: 12 }]}>
                            {currentDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </Text>
                        {dayOffset !== 0 && (
                            <Text style={[styles.sliderOffsetText, { fontSize: 10 }]}>{formatOffset(dayOffset)}</Text>
                        )}
                        {/* Step selector */}
                        <View style={[styles.stepRow, { marginBottom: 6 }]}>
                            {steps.map((s, idx) => (
                                <TouchableOpacity
                                    key={s.label}
                                    onPress={() => {
                                        setSelectedStepIdx(idx);
                                        selectedStepRef.current = s.days;
                                        sliderDaysRef.current = s.sliderDays;
                                    }}
                                    style={[styles.stepBtn, idx === selectedStepIdx && { backgroundColor: 'rgba(218,165,32,0.35)', borderColor: '#DAA520' }]}
                                >
                                    <Text style={[styles.stepBtnText, idx === selectedStepIdx && { color: '#FFD700' }]}>{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View
                            style={styles.sliderTrackOuter}
                            onLayout={(e) => { const w = e.nativeEvent.layout.width; topSliderWRef.current = w; setTopSliderW(w); }}
                            {...topSliderPan.panHandlers}
                        >
                            <View style={styles.sliderTrack} />
                            {(() => {
                                const fullMin = -HUNDRED_YEARS_MS / 86400000;
                                const fullMax = HUNDRED_YEARS_MS / 86400000;
                                const fullRange = fullMax - fullMin;
                                const frac = fullRange > 0 ? (dayOffset - fullMin) / fullRange : 0.5;
                                const centerFrac = fullRange > 0 ? (0 - fullMin) / fullRange : 0.5;
                                return (
                                    <>
                                        <View style={[styles.sliderCenterMark, { left: centerFrac * topSliderW - 1 }]} />
                                        <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(topSliderW - 24, frac * topSliderW - 12)) }]} />
                                    </>
                                );
                            })()}
                        </View>
                        <View style={styles.sliderLabelsRow}>
                            <TouchableOpacity onPress={() => applyOffset(0)}>
                                <Text style={styles.sliderResetLabel}>⟲ Birth</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={jumpToToday}>
                                <Text style={[styles.sliderResetLabel, { color: '#40E0D0' }]}>📅 Today</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ── YOUR BIRTHDAY SAINT ── */}
                <View style={[styles.card, { borderColor: 'rgba(218,165,32,0.5)', borderWidth: 2 }]}>
                    <Text style={styles.cardTitle}>⛪ Your Birthday Saint</Text>
                    <Text style={styles.cardSubtitle}>
                        On the Prague Orloj's calendar dial, every day of the year is inscribed with a patron saint or feast day. Before modern birthdays, your "name day" was your most important personal celebration.
                    </Text>

                    <View style={{ backgroundColor: 'rgba(218,165,32,0.08)', borderRadius: 12, padding: 16, marginTop: 4, borderWidth: 1, borderColor: 'rgba(218,165,32,0.25)' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 4 }}>
                            {originalBirthDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </Text>
                        <Text style={{ fontSize: 22, fontWeight: '900', color: '#DAA520', textAlign: 'center', marginBottom: 4 }}>
                            {birthSaint.name}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontStyle: 'italic' }}>
                            {birthSaint.title}
                        </Text>
                        {birthSaint.lived && (
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4 }}>
                                {birthSaint.lived}
                            </Text>
                        )}
                    </View>

                    {dayOffset !== 0 && (
                        <View style={{ backgroundColor: 'rgba(64,224,208,0.06)', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(64,224,208,0.2)' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(64,224,208,0.6)', textAlign: 'center', marginBottom: 3 }}>
                                {currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — Current Date Saint
                            </Text>
                            <Text style={{ fontSize: 17, fontWeight: '900', color: '#40E0D0', textAlign: 'center', marginBottom: 2 }}>
                                {currentSaint.name}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontStyle: 'italic' }}>
                                {currentSaint.title}
                            </Text>
                            {currentSaint.lived && (
                                <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 3 }}>
                                    {currentSaint.lived}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* ── ANIMATED FIGURES — APOSTLES & FLANKING STATUES ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏛️ The Animated Figures</Text>

                    {/* Apostles window */}
                    <View style={styles.apostlesRow}>
                        {/* Left flanking figures */}
                        <View style={styles.flankingColumn}>
                            {FLANKING_FIGURES.filter(f => f.side === 'left').map(f => (
                                <View key={f.name} style={styles.flankingFigure}>
                                    <Text style={styles.flankingEmoji}>{f.emoji}</Text>
                                    <Text style={styles.flankingName}>{f.name}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Apostles window */}
                        <View style={styles.apostlesWindow}>
                            <View style={styles.apostlesArch}>
                                <Text style={styles.apostlesArchText}>✝️ The Twelve Apostles ✝️</Text>
                            </View>
                            <View style={styles.apostlesGrid}>
                                {APOSTLES.slice(0, 6).map((name, i) => {
                                    const isActive = Math.floor(hour24) % 12 === i;
                                    return (
                                        <View key={name} style={[styles.apostleSlot, isActive && styles.apostleActive]}>
                                            <Text style={styles.apostleIcon}>🧔</Text>
                                            <Text style={[styles.apostleName, isActive && { color: '#FFD54F' }]}>{name}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <View style={styles.apostlesGrid}>
                                {APOSTLES.slice(6, 12).map((name, i) => {
                                    const isActive = Math.floor(hour24) % 12 === i + 6;
                                    return (
                                        <View key={name} style={[styles.apostleSlot, isActive && styles.apostleActive]}>
                                            <Text style={styles.apostleIcon}>🧔</Text>
                                            <Text style={[styles.apostleName, isActive && { color: '#FFD54F' }]}>{name}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text style={styles.apostlesNote}>
                                At the top of each hour, the skeleton (Death) pulls a bell rope, and the Apostles parade past two small windows above the clock face. Currently showing: <Text style={{ color: '#FFD54F', fontWeight: '800' }}>{APOSTLES[Math.floor(hour24) % 12]}</Text>
                            </Text>
                        </View>

                        {/* Right flanking figures */}
                        <View style={styles.flankingColumn}>
                            {FLANKING_FIGURES.filter(f => f.side === 'right').map(f => (
                                <View key={f.name} style={styles.flankingFigure}>
                                    <Text style={styles.flankingEmoji}>{f.emoji}</Text>
                                    <Text style={styles.flankingName}>{f.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <Text style={styles.flankingDesc}>
                        The four flanking figures represent the things most despised in medieval Prague: <Text style={{ fontWeight: '800' }}>Vanity</Text> (a figure with a mirror), <Text style={{ fontWeight: '800' }}>Greed</Text> (a miser with a purse), <Text style={{ fontWeight: '800' }}>Death</Text> (a skeleton ringing a bell), and <Text style={{ fontWeight: '800' }}>Lust/Pleasure</Text> (originally a Turkish invader with a mandolin). Only Death moves — pulling the rope every hour to remind all that time runs out.
                    </Text>
                </View>

                {/* ═══════════════════════════════════════════ */}
                {/* ═══ DUAL FACE — ASTRONOMICAL + CALENDAR SIDE BY SIDE ═══ */}
                {/* ═══════════════════════════════════════════ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔭 The Two Dials — Side by Side</Text>
                    <Text style={styles.cardSubtitle}>Astronomical (left) • Calendar (right) • Drag left dial to time-travel</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>

                        {/* ── LEFT: ASTRONOMICAL DIAL ── */}
                        <View style={[styles.clockContainer, { flex: 1 }]} {...clockPanResponder.panHandlers}>
                            {(isSpinning || dayOffset !== 0) && (
                                <View style={[styles.spinOverlay, { padding: 3 }]}>
                                    <Text style={[styles.spinOverlayDate, { fontSize: 9 }]}>
                                        {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text style={[styles.spinOverlayDelta, { fontSize: 8 }]}>
                                        {dayOffset === 0 ? 'Birth Date' : `${dayOffset > 0 ? '+' : ''}${Math.round(dayOffset)} day${Math.abs(Math.round(dayOffset)) !== 1 ? 's' : ''}`}
                                    </Text>
                                </View>
                            )}

                            <Svg width={dualSize} height={dualSize} viewBox={`0 0 ${clockSize} ${clockSize}`}>
                                <Defs>
                                    <SvgLinearGradient id="orlojGold" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#C9A84C" />
                                        <Stop offset="0.25" stopColor="#E8D07A" />
                                        <Stop offset="0.5" stopColor="#FFE8A0" />
                                        <Stop offset="0.75" stopColor="#C9A84C" />
                                        <Stop offset="1" stopColor="#8B6914" />
                                    </SvgLinearGradient>
                                    <SvgLinearGradient id="orlojSky" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#1a4a8a" />
                                        <Stop offset="1" stopColor="#0a1a3a" />
                                    </SvgLinearGradient>
                                </Defs>

                                {/* ── OUTER FRAME — ornate border ── */}
                                <Circle cx={ck} cy={ck} r={ck * 0.99} fill="#1a1008" />
                                <Circle cx={ck} cy={ck} r={ck * 0.98} fill="none" stroke="#4a3010" strokeWidth={2} />
                                <Circle cx={ck} cy={ck} r={ck * 0.96} fill="none" stroke="#6a4820" strokeWidth={1} />

                                {/* ── OUTER GILDED RING — 24 Old Czech/Italian Hour Numerals ── */}
                                {/* This ring ROTATES so that numeral I always points to sunset */}
                                <G rotation={outerRingRotation} origin={`${ck}, ${ck}`}>
                                    {/* The golden ring background */}
                                    <Circle cx={ck} cy={ck} r={ck * 0.94} fill="none" stroke="url(#orlojGold)" strokeWidth={clockSize * 0.1} />
                                    <Circle cx={ck} cy={ck} r={ck * 0.94 + clockSize * 0.05} fill="none" stroke="#6B4F1D" strokeWidth={1.5} />
                                    <Circle cx={ck} cy={ck} r={ck * 0.94 - clockSize * 0.05} fill="none" stroke="#6B4F1D" strokeWidth={1.5} />

                                    {/* 24 Old Czech (Schwabacher) Arabic numerals + tick marks */}
                                    {OLD_CZECH_24.map((num, i) => {
                                        const angle = (i * 15) - 90;
                                        const rad = dRad(angle);
                                        const romanR = ck * 0.87;
                                        const innerR = ck * 0.89 - clockSize * 0.05;
                                        const outerR = ck * 0.94 + clockSize * 0.048;
                                        const nx = ck + romanR * Math.cos(rad);
                                        const ny = ck + romanR * Math.sin(rad);
                                        return (
                                            <G key={`rn-${i}`}>
                                                <Line x1={ck + innerR * Math.cos(rad)} y1={ck + innerR * Math.sin(rad)} x2={ck + outerR * Math.cos(rad)} y2={ck + outerR * Math.sin(rad)} stroke="#4a3010" strokeWidth={1.2} />
                                                <SvgText
                                                    x={nx} y={ny + 4}
                                                    fontSize={clockSize * 0.033}
                                                    fontWeight="900"
                                                    fill="#1a0a00"
                                                    textAnchor="middle"
                                                    rotation={angle + 90}
                                                    origin={`${nx}, ${ny}`}
                                                >{num}</SvgText>
                                            </G>
                                        );
                                    })}
                                    {/* Sub-tick marks (every 7.5° = half-hours) */}
                                    {Array.from({ length: 48 }).map((_, i) => {
                                        if (i % 2 === 0) return null;
                                        const angle = (i * 7.5) - 90;
                                        const rad = dRad(angle);
                                        const innerR = ck * 0.89 - clockSize * 0.03;
                                        const outerR = ck * 0.94 + clockSize * 0.03;
                                        return <Line key={`st-${i}`} x1={ck + innerR * Math.cos(rad)} y1={ck + innerR * Math.sin(rad)} x2={ck + outerR * Math.cos(rad)} y2={ck + outerR * Math.sin(rad)} stroke="#3a2808" strokeWidth={0.5} />;
                                    })}
                                </G>

                                {/* ── FIXED ROMAN NUMERAL RING — 12-hour CET / Central European Time ── */}
                                {/* This is the STATIONARY inner ring with large gold Roman I–XII on black */}
                                {/* It does NOT rotate — noon (XII) is always at top, midnight (XII) at bottom */}
                                {(() => {
                                    const fixedRingR = ck * 0.82; // between outer rotating ring and inner plate
                                    const fixedRingW = clockSize * 0.08; // ring width
                                    return (
                                        <G>
                                            {/* Black background band for the fixed ring */}
                                            <Circle cx={ck} cy={ck} r={fixedRingR} fill="none" stroke="#0a0a0a" strokeWidth={fixedRingW} />
                                            {/* Gold border lines */}
                                            <Circle cx={ck} cy={ck} r={fixedRingR + fixedRingW / 2} fill="none" stroke="#8B6914" strokeWidth={1.2} />
                                            <Circle cx={ck} cy={ck} r={fixedRingR - fixedRingW / 2} fill="none" stroke="#8B6914" strokeWidth={1.2} />

                                            {/* 12 Roman numerals — spaced every 30° */}
                                            {/* On the real Orloj: XII at top (noon/south), VI on left (sunrise/east), XII at bottom (midnight), VI on right (sunset/west) */}
                                            {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((num, i) => {
                                                const angle = (i * 30) - 90; // 0°=top (starts at -90 = 12 o'clock)
                                                const rad = dRad(angle);
                                                const nx = ck + fixedRingR * Math.cos(rad);
                                                const ny = ck + fixedRingR * Math.sin(rad);
                                                // Tick marks at each hour
                                                const t1 = fixedRingR - fixedRingW / 2;
                                                const t2 = fixedRingR + fixedRingW / 2;
                                                return (
                                                    <G key={`fr-${i}`}>
                                                        <Line x1={ck + t1 * Math.cos(rad)} y1={ck + t1 * Math.sin(rad)} x2={ck + t2 * Math.cos(rad)} y2={ck + t2 * Math.sin(rad)} stroke="#6B4F1D" strokeWidth={1} />
                                                        <SvgText
                                                            x={nx} y={ny + 4}
                                                            fontSize={clockSize * 0.045}
                                                            fontWeight="900"
                                                            fill="#DAA520"
                                                            textAnchor="middle"
                                                            rotation={angle + 90}
                                                            origin={`${nx}, ${ny}`}
                                                        >{num}</SvgText>
                                                    </G>
                                                );
                                            })}
                                            {/* Half-hour ticks between the numerals */}
                                            {Array.from({ length: 12 }).map((_, i) => {
                                                const angle = (i * 30) + 15 - 90;
                                                const rad = dRad(angle);
                                                const t1 = fixedRingR - fixedRingW / 2;
                                                const t2 = fixedRingR - fixedRingW * 0.2;
                                                return <Line key={`frt-${i}`} x1={ck + t1 * Math.cos(rad)} y1={ck + t1 * Math.sin(rad)} x2={ck + t2 * Math.cos(rad)} y2={ck + t2 * Math.sin(rad)} stroke="#6B4F1D" strokeWidth={0.6} />;
                                            })}
                                        </G>
                                    );
                                })()}

                                {/* ── DAY / NIGHT / TWILIGHT BACKGROUND ── */}
                                {/* The stationary plate (fixed to the wall) showing the sky as viewed from Prague */}
                                {(() => {
                                    const bgR = ck * 0.76;
                                    // Horizon is an eccentric circle shifted south (down) because Prague is at 50°N
                                    const hCy = ck + horizonOffset; // horizon circle center shifted down
                                    const hR = bgR * 0.85; // horizon circle radius
                                    // Twilight band sits just below the horizon
                                    const twCy = ck + horizonOffset + bgR * 0.12;
                                    const twR = bgR * 0.92;
                                    return (
                                        <G>
                                            {/* Full background — night (dark) */}
                                            <Circle cx={ck} cy={ck} r={bgR} fill="#050510" />

                                            {/* Twilight / dusk zone (brown-red band between day and night) */}
                                            <Circle cx={ck} cy={twCy} r={twR} fill="#3a1a0a" />

                                            {/* Day zone — blue sky (eccentric horizon circle) */}
                                            <Circle cx={ck} cy={hCy} r={hR} fill="#1a4a8a" />

                                            {/* Lighter blue gradient toward zenith */}
                                            <Circle cx={ck} cy={hCy - hR * 0.3} r={hR * 0.5} fill="#2a6ab0" opacity={0.35} />

                                            {/* Clip the day & twilight circles to the background circle */}
                                            {/* (The areas outside bgR are hidden by the outer ring on top) */}

                                            {/* Horizon line itself — golden arc */}
                                            <Circle cx={ck} cy={hCy} r={hR} fill="none" stroke="rgba(218,165,32,0.35)" strokeWidth={1.2} />

                                            {/* ── ORTUS / OCCASUS / AURORA / CREPVSCVLVM labels ── */}
                                            {/* ORTUS (sunrise) on the left */}
                                            <SvgText x={ck - bgR * 0.62} y={ck + horizonOffset - 8} fontSize={clockSize * 0.02} fill="rgba(255,200,100,0.7)" fontWeight="800" textAnchor="middle">ORTUS</SvgText>
                                            {/* AURORA (dawn) below ORTUS */}
                                            <SvgText x={ck - bgR * 0.62} y={ck + horizonOffset + 8} fontSize={clockSize * 0.016} fill="rgba(255,180,80,0.5)" fontWeight="700" textAnchor="middle">AVRORA</SvgText>

                                            {/* OCCASUS (sunset) on the right */}
                                            <SvgText x={ck + bgR * 0.62} y={ck + horizonOffset - 8} fontSize={clockSize * 0.02} fill="rgba(255,200,100,0.7)" fontWeight="800" textAnchor="middle">OCCASVS</SvgText>
                                            {/* CREPUSCULUM (twilight) below OCCASUS */}
                                            <SvgText x={ck + bgR * 0.62} y={ck + horizonOffset + 8} fontSize={clockSize * 0.016} fill="rgba(255,180,80,0.5)" fontWeight="700" textAnchor="middle">CREPVSCVLVM</SvgText>

                                            {/* Stereographic projection circles — labeled like the real Orloj */}
                                            {/* Tropic of Cancer (CIRCVLVS CANCRI) — innermost */}
                                            <Circle cx={ck} cy={ck} r={Math.min(tropicCancerR, bgR * 0.55)} fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth={0.8} />
                                            {/* Celestial Equator (CIRCVLVS AEQVINOCTII) */}
                                            <Circle cx={ck} cy={ck} r={Math.min(equatorR, bgR * 0.72)} fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth={0.8} />
                                            {/* Tropic of Capricorn (CIRCVLVS CAPRICORNI) — outermost */}
                                            <Circle cx={ck} cy={ck} r={Math.min(tropicCapricornR, bgR * 0.92)} fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth={0.8} />

                                            {/* Circle labels (matching the inscriptions on the real Orloj) */}
                                            <SvgText x={ck} y={ck + Math.min(tropicCapricornR, bgR * 0.92) + clockSize * 0.02} fontSize={clockSize * 0.015} fill="rgba(255,215,0,0.35)" fontWeight="700" textAnchor="middle">CIRCVLVS  CAPRICORNI</SvgText>
                                            <SvgText x={ck} y={ck + Math.min(equatorR, bgR * 0.72) + clockSize * 0.018} fontSize={clockSize * 0.014} fill="rgba(255,215,0,0.3)" fontWeight="700" textAnchor="middle">CIRCVLVS  AEQVINOCTII</SvgText>
                                            <SvgText x={ck} y={ck - Math.min(tropicCancerR, bgR * 0.55) - clockSize * 0.008} fontSize={clockSize * 0.014} fill="rgba(255,215,0,0.3)" fontWeight="700" textAnchor="middle">CIRCVLVS  CANCRI</SvgText>
                                        </G>
                                    );
                                })()}

                                {/* ── UNEQUAL / BABYLONIAN HOUR LINES ── */}
                                {/* On the real Orloj these golden lines radiate from center through the DAY (blue) zone only */}
                                {/* They divide daylight into 12 unequal hours — longer in summer, shorter in winter */}
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const angle = i * 30 - 90;
                                    const rad = dRad(angle);
                                    const r1 = ck * 0.25;
                                    const r2 = ck * 0.76;
                                    // Only show lines in the upper (day) half — hide those below horizon
                                    const endY = ck + r2 * Math.sin(rad);
                                    if (endY > ck + horizonOffset * 0.6) return null;
                                    return <Line key={`bh-${i}`} x1={ck + r1 * Math.cos(rad)} y1={ck + r1 * Math.sin(rad)} x2={ck + r2 * Math.cos(rad)} y2={ck + r2 * Math.sin(rad)} stroke="rgba(255,215,0,0.18)" strokeWidth={0.6} />;
                                })}
                                {/* Arabic numerals for unequal hours — only in the day (blue) zone */}
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const angle = i * 30 - 90 + 15;
                                    const rad = dRad(angle);
                                    const r = ck * 0.63;
                                    const ny = ck + r * Math.sin(rad);
                                    if (ny > ck + horizonOffset * 0.4) return null;
                                    return <SvgText key={`bn-${i}`} x={ck + r * Math.cos(rad)} y={ny + 3} fontSize={clockSize * 0.028} fill="rgba(0,0,0,0.5)" fontWeight="800" textAnchor="middle">{i + 1}</SvgText>;
                                })}

                                {/* ── ZODIAC RING (Ecliptic) — rotates once per sidereal day ── */}
                                {/* On the real Orloj this is an eccentric painted disc that physically turns. */}
                                {/* Signs go COUNTERCLOCKWISE (matching astronomical convention). */}
                                <G rotation={zodiacRotation} origin={`${ck}, ${ck}`}>
                                    {/* Zodiac band — eccentric black ring with golden borders */}
                                    <Circle cx={ck} cy={ck + eclipticOffset} r={eclipticR} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth={clockSize * 0.14} />
                                    <Circle cx={ck} cy={ck + eclipticOffset} r={eclipticOuterR} fill="none" stroke="#B8860B" strokeWidth={1.8} />
                                    <Circle cx={ck} cy={ck + eclipticOffset} r={eclipticInnerR} fill="none" stroke="#B8860B" strokeWidth={1.8} />

                                    {/* 12 zodiac segments with symbols — counterclockwise */}
                                    {ZODIAC_SYMBOLS.map((sym, i) => {
                                        const startAngle = -(i * 30) - 90;
                                        const midAngle = startAngle - 15;
                                        const rad = dRad(midAngle);
                                        const symR = eclipticR;
                                        const sx = ck + symR * Math.cos(rad);
                                        const sy = (ck + eclipticOffset) + symR * Math.sin(rad);
                                        // Divider lines between signs
                                        const divRad = dRad(startAngle);
                                        const dx1 = ck + eclipticInnerR * Math.cos(divRad);
                                        const dy1 = (ck + eclipticOffset) + eclipticInnerR * Math.sin(divRad);
                                        const dx2 = ck + eclipticOuterR * Math.cos(divRad);
                                        const dy2 = (ck + eclipticOffset) + eclipticOuterR * Math.sin(divRad);
                                        return (
                                            <G key={`zs-${i}`}>
                                                <Line x1={dx1} y1={dy1} x2={dx2} y2={dy2} stroke="#8B6914" strokeWidth={1} />
                                                <SvgText
                                                    x={sx} y={sy + 4}
                                                    fontSize={clockSize * 0.042}
                                                    fill="#FFD700"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    rotation={midAngle + 90}
                                                    origin={`${sx}, ${sy}`}
                                                >{sym}</SvgText>
                                            </G>
                                        );
                                    })}
                                </G>

                                {/* ── EARTH — fixed at center (TERRA) ── */}
                                <Circle cx={ck} cy={ck} r={ck * 0.13} fill="#0a1a2a" stroke="#4a6a8a" strokeWidth={1.5} />
                                <Circle cx={ck} cy={ck} r={ck * 0.08} fill="#1a3a5a" />
                                <SvgText x={ck} y={ck + 4} fontSize={clockSize * 0.05} textAnchor="middle">🌍</SvgText>
                                <SvgText x={ck} y={ck + ck * 0.13 + clockSize * 0.025} fontSize={clockSize * 0.018} fill="rgba(255,255,255,0.35)" fontWeight="800" textAnchor="middle">TERRA</SvgText>

                                {/* ── SUN HAND — golden arm with sun disc ── */}
                                {(() => {
                                    const sunAngle = dRad(hourAngle + 90);
                                    const sunR = ck * 0.62;
                                    const sx = ck + sunR * Math.cos(sunAngle);
                                    const sy = ck + sunR * Math.sin(sunAngle);
                                    // Counter-arm extends opposite direction
                                    const cax = ck - (ck * 0.2) * Math.cos(sunAngle);
                                    const cay = ck - (ck * 0.2) * Math.sin(sunAngle);
                                    return (
                                        <G>
                                            {/* Counter-arm (short) */}
                                            <Line x1={ck} y1={ck} x2={cax} y2={cay} stroke="#8B6914" strokeWidth={2} />
                                            {/* Main arm */}
                                            <Line x1={ck} y1={ck} x2={sx} y2={sy} stroke="#DAA520" strokeWidth={2.5} />
                                            {/* Ornamental widening near sun */}
                                            <Line x1={ck + sunR * 0.7 * Math.cos(sunAngle)} y1={ck + sunR * 0.7 * Math.sin(sunAngle)} x2={sx} y2={sy} stroke="#DAA520" strokeWidth={4} />
                                            {/* Sun glow */}
                                            <Circle cx={sx} cy={sy} r={clockSize * 0.045} fill="rgba(255,213,79,0.15)" />
                                            {/* Sun disc */}
                                            <Circle cx={sx} cy={sy} r={clockSize * 0.032} fill="#FFD700" />
                                            <Circle cx={sx} cy={sy} r={clockSize * 0.022} fill="#FFA000" />
                                            {/* Sun rays (8 rays) */}
                                            {Array.from({ length: 8 }).map((_, ri) => {
                                                const ra = dRad(ri * 45);
                                                const r1 = clockSize * 0.034;
                                                const r2 = clockSize * 0.052;
                                                return <Line key={`sr-${ri}`} x1={sx + r1 * Math.cos(ra)} y1={sy + r1 * Math.sin(ra)} x2={sx + r2 * Math.cos(ra)} y2={sy + r2 * Math.sin(ra)} stroke="#FFD700" strokeWidth={1.2} />;
                                            })}
                                        </G>
                                    );
                                })()}

                                {/* ── MOON HAND — silver arm with phase-showing disc ── */}
                                {(() => {
                                    const moonAngle24 = ((hour24 + (moonAge / 29.530588853) * 24) % 24) / 24 * 360;
                                    const mAngle = dRad(moonAngle24 + 90);
                                    const moonR = ck * 0.55;
                                    const mx = ck + moonR * Math.cos(mAngle);
                                    const my = ck + moonR * Math.sin(mAngle);
                                    const discR = clockSize * 0.025;
                                    const phaseFrac = moonAge / 29.530588853;
                                    return (
                                        <G>
                                            {/* Moon arm */}
                                            <Line x1={ck} y1={ck} x2={mx} y2={my} stroke="#7a7a7a" strokeWidth={1.5} />
                                            {/* Moon disc background (dark half) */}
                                            <Circle cx={mx} cy={my} r={discR} fill="#1a1a1a" stroke="#888" strokeWidth={0.8} />
                                            {/* Illuminated phase */}
                                            {phaseFrac > 0.02 && phaseFrac < 0.98 && (() => {
                                                if (phaseFrac > 0.48 && phaseFrac < 0.52) return <Circle cx={mx} cy={my} r={discR} fill="#E8E8C8" />;
                                                const cosP = Math.cos(phaseFrac * 2 * Math.PI);
                                                const termRx = discR * Math.abs(cosP);
                                                const litRight = phaseFrac < 0.5;
                                                const sO = litRight ? 1 : 0;
                                                const sT = cosP > 0 ? (litRight ? 0 : 1) : (litRight ? 1 : 0);
                                                return <Path d={`M ${mx} ${my - discR} A ${discR} ${discR} 0 0 ${sO} ${mx} ${my + discR} A ${termRx} ${discR} 0 0 ${sT} ${mx} ${my - discR} Z`} fill="#E8E8C8" />;
                                            })()}
                                        </G>
                                    );
                                })()}

                                {/* ── CENTRAL HUB — ornamental center pivot ── */}
                                <Circle cx={ck} cy={ck} r={ck * 0.04} fill="#DAA520" stroke="#8B6914" strokeWidth={1} />
                                <Circle cx={ck} cy={ck} r={ck * 0.02} fill="#FFE8A0" />

                                {/* ── DECORATIVE OUTER BORDER ── */}
                                <Circle cx={ck} cy={ck} r={ck * 0.97} fill="none" stroke="#4a3010" strokeWidth={2.5} />
                            </Svg>

                            {/* Date / info overlay */}
                            <View style={styles.dateOverlay}>
                                <Text style={[styles.dateOverlayText, { fontSize: 9 }]}>
                                    {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                                <Text style={[styles.dateOverlaySub, { fontSize: 7 }]}>
                                    {moonPhase.icon} {ZODIAC_NAMES[sunZodiacIndex]}
                                </Text>
                            </View>
                        </View>

                        {/* ── RIGHT: CALENDAR DIAL ── */}
                        <View style={[styles.clockContainer, { flex: 1 }]}>
                            <Svg width={dualSize} height={dualSize} viewBox={`0 0 ${clockSize} ${clockSize}`}>
                                <Defs>
                                    <SvgLinearGradient id="orlojGold2" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#C9A84C" />
                                        <Stop offset="0.25" stopColor="#E8D07A" />
                                        <Stop offset="0.5" stopColor="#FFE8A0" />
                                        <Stop offset="0.75" stopColor="#C9A84C" />
                                        <Stop offset="1" stopColor="#8B6914" />
                                    </SvgLinearGradient>
                                </Defs>
                                {/* Ornate outer frame */}
                                <Circle cx={ck} cy={ck} r={ck * 0.99} fill="#0a0805" />
                                <Circle cx={ck} cy={ck} r={ck * 0.97} fill="none" stroke="#4a3010" strokeWidth={2} />

                                {/* Outer golden ring for day numbers */}
                                <Circle cx={ck} cy={ck} r={ck * 0.94} fill="none" stroke="url(#orlojGold2)" strokeWidth={clockSize * 0.06} />
                                <Circle cx={ck} cy={ck} r={ck * 0.94 + clockSize * 0.03} fill="none" stroke="#6B4F1D" strokeWidth={1} />
                                <Circle cx={ck} cy={ck} r={ck * 0.94 - clockSize * 0.03} fill="none" stroke="#6B4F1D" strokeWidth={1} />

                                {/* 365-day tick marks (simplified to 12 major + minor) */}
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const angle = (i * 30) - 90;
                                    const rad = dRad(angle);
                                    const r1 = ck * 0.91 - clockSize * 0.03;
                                    const r2 = ck * 0.94 + clockSize * 0.03;
                                    return <Line key={`cd-${i}`} x1={ck + r1 * Math.cos(rad)} y1={ck + r1 * Math.sin(rad)} x2={ck + r2 * Math.cos(rad)} y2={ck + r2 * Math.sin(rad)} stroke="#4a3010" strokeWidth={1.5} />;
                                })}

                                {/* Month ring — 12 segments with Czech month names */}
                                <G rotation={-calendarAngle} origin={`${ck}, ${ck}`}>
                                    <Circle cx={ck} cy={ck} r={ck * 0.82} fill="none" stroke="#6B4F1D" strokeWidth={1} />
                                    <Circle cx={ck} cy={ck} r={ck * 0.68} fill="none" stroke="#6B4F1D" strokeWidth={1} />
                                    {/* Month segments background */}
                                    <Circle cx={ck} cy={ck} r={ck * 0.75} fill="none" stroke="rgba(139,105,20,0.15)" strokeWidth={clockSize * 0.14} />

                                    {CALENDAR_MONTHS.map((m, i) => {
                                        const startAngle = i * 30 - 90;
                                        const midAngle = startAngle + 15;
                                        const rad = dRad(midAngle);
                                        const nameR = ck * 0.75;
                                        const nx = ck + nameR * Math.cos(rad);
                                        const ny = ck + nameR * Math.sin(rad);
                                        // Divider
                                        const divRad = dRad(startAngle);
                                        const d1 = ck * 0.68;
                                        const d2 = ck * 0.82;
                                        const isCurrentMonth = i === currentMonth;
                                        return (
                                            <G key={`cm-${i}`}>
                                                <Line x1={ck + d1 * Math.cos(divRad)} y1={ck + d1 * Math.sin(divRad)} x2={ck + d2 * Math.cos(divRad)} y2={ck + d2 * Math.sin(divRad)} stroke="#6B4F1D" strokeWidth={0.8} />
                                                <SvgText
                                                    x={nx} y={ny - 4}
                                                    fontSize={clockSize * 0.024}
                                                    fill={isCurrentMonth ? '#FFD700' : 'rgba(218,165,32,0.7)'}
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    rotation={midAngle + 90}
                                                    origin={`${nx}, ${ny}`}
                                                >{m.icon}</SvgText>
                                                <SvgText
                                                    x={nx} y={ny + 6}
                                                    fontSize={clockSize * 0.014}
                                                    fill={isCurrentMonth ? '#FFD700' : 'rgba(218,165,32,0.6)'}
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    rotation={midAngle + 90}
                                                    origin={`${nx}, ${ny}`}
                                                >{m.abbr}</SvgText>
                                                <SvgText
                                                    x={nx} y={ny + 16}
                                                    fontSize={clockSize * 0.012}
                                                    fill={isCurrentMonth ? '#FFD700' : 'rgba(218,165,32,0.35)'}
                                                    fontWeight="600"
                                                    textAnchor="middle"
                                                    rotation={midAngle + 90}
                                                    origin={`${nx}, ${ny}`}
                                                >{m.name}</SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* ── 365 Saints Ring (outermost rotating ring) ── */}
                                    <Circle cx={ck} cy={ck} r={ck * 0.91} fill="none" stroke="rgba(139,105,20,0.25)" strokeWidth={0.5} />
                                    <Circle cx={ck} cy={ck} r={ck * 0.83} fill="none" stroke="rgba(139,105,20,0.25)" strokeWidth={0.5} />
                                    {allSaints.map((s, i) => {
                                        const angle = (i / 365) * 360 - 90;
                                        const rad = dRad(angle);
                                        const isToday = i === (dayOfYear - 1);
                                        // Tick mark
                                        const tickIn = ck * 0.83;
                                        const tickOut = ck * 0.91;
                                        const tx1 = ck + tickIn * Math.cos(rad);
                                        const ty1 = ck + tickIn * Math.sin(rad);
                                        const tx2 = ck + tickOut * Math.cos(rad);
                                        const ty2 = ck + tickOut * Math.sin(rad);
                                        // Saint name position
                                        const nameR = ck * 0.84;
                                        const nx = ck + nameR * Math.cos(rad);
                                        const ny = ck + nameR * Math.sin(rad);
                                        const shortName = s.name.length > 12 ? s.name.substring(0, 11) + '.' : s.name;
                                        return (
                                            <G key={`sd-${i}`}>
                                                <Line
                                                    x1={tx1} y1={ty1} x2={tx2} y2={ty2}
                                                    stroke={isToday ? '#FFD700' : 'rgba(139,105,20,0.2)'}
                                                    strokeWidth={isToday ? 1.5 : 0.25}
                                                />
                                                {shortName ? (
                                                    <SvgText
                                                        x={nx} y={ny}
                                                        fontSize={isToday ? clockSize * 0.012 : clockSize * 0.007}
                                                        fill={isToday ? '#FFD700' : 'rgba(218,165,32,0.35)'}
                                                        fontWeight={isToday ? '900' : '400'}
                                                        textAnchor="start"
                                                        rotation={angle + 90}
                                                        origin={`${nx}, ${ny}`}
                                                    >{shortName}</SvgText>
                                                ) : null}
                                            </G>
                                        );
                                    })}
                                </G>

                                {/* ── Inner medallion — seasonal paintings (represented as colored zones) ── */}
                                {/* The real Orloj has Mánes paintings showing rural life for each month */}
                                <Circle cx={ck} cy={ck} r={ck * 0.55} fill="#0a0805" stroke="#6B4F1D" strokeWidth={1.5} />

                                {/* Four seasonal quadrants */}
                                {[
                                    { label: 'Spring', color: '#2E7D32', angle: 0, icon: '🌸' },
                                    { label: 'Summer', color: '#F9A825', angle: 90, icon: '☀️' },
                                    { label: 'Autumn', color: '#BF360C', angle: 180, icon: '🍂' },
                                    { label: 'Winter', color: '#1565C0', angle: 270, icon: '❄️' },
                                ].map((season) => {
                                    const sRad = dRad(season.angle - calendarAngle - 45);
                                    const x = ck + ck * 0.35 * Math.cos(sRad);
                                    const y = ck + ck * 0.35 * Math.sin(sRad);
                                    return (
                                        <G key={season.label}>
                                            <Circle cx={x} cy={y} r={ck * 0.12} fill={season.color} opacity={0.2} />
                                            <SvgText x={x} y={y - 4} fontSize={clockSize * 0.04} textAnchor="middle">{season.icon}</SvgText>
                                            <SvgText x={x} y={y + 12} fontSize={clockSize * 0.018} fill="rgba(255,255,255,0.4)" fontWeight="700" textAnchor="middle">{season.label}</SvgText>
                                        </G>
                                    );
                                })}

                                {/* Central medallion — Prague coat of arms */}
                                <Circle cx={ck} cy={ck} r={ck * 0.14} fill="#1a0a05" stroke="#DAA520" strokeWidth={2} />
                                <SvgText x={ck} y={ck - 4} fontSize={clockSize * 0.05} textAnchor="middle">🏰</SvgText>
                                <SvgText x={ck} y={ck + 12} fontSize={clockSize * 0.018} fill="#DAA520" fontWeight="900" textAnchor="middle">PRAHA</SvgText>

                                {/* Fixed pointer at top (like the real Orloj's golden hand pointing to today's date) */}
                                <Path d={`M ${ck} ${ck * 0.08} L ${ck - 6} ${ck * 0.18} L ${ck + 6} ${ck * 0.18} Z`} fill="#DAA520" />
                                <Line x1={ck} y1={ck * 0.18} x2={ck} y2={ck * 0.35} stroke="#DAA520" strokeWidth={2} />

                                {/* Outer decorative border */}
                                <Circle cx={ck} cy={ck} r={ck * 0.97} fill="none" stroke="#4a3010" strokeWidth={2.5} />
                            </Svg>

                            {/* Calendar date readout */}
                            <View style={[styles.dateOverlay, { right: 4, left: undefined as any }]}>
                                <Text style={[styles.dateOverlayText, { fontSize: 9 }]}>
                                    {CALENDAR_MONTHS[currentMonth].icon} {CALENDAR_MONTHS[currentMonth].abbr}
                                </Text>
                                <Text style={[styles.dateOverlaySub, { fontSize: 7 }]}>
                                    {currentSaint.name}
                                </Text>
                            </View>
                        </View>

                    </View>{/* close row */}
                </View>{/* close card */}

                {/* ═══ TIME TRAVEL CONTROLS ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>⏳ Time Travel</Text>
                    <Text style={styles.sliderDateText}>
                        {currentDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    {dayOffset !== 0 && (
                        <Text style={styles.sliderOffsetText}>{formatOffset(dayOffset)}</Text>
                    )}
                    {/* Step selector — choose time increment */}
                    <Text style={[styles.sliderEndLabel, { textAlign: 'center', marginBottom: 4, marginTop: 4 }]}>Step Size</Text>
                    <View style={[styles.stepRow, { marginBottom: 8 }]}>
                        {steps.map((s, idx) => (
                            <TouchableOpacity
                                key={s.label}
                                onPress={() => {
                                    setSelectedStepIdx(idx);
                                    selectedStepRef.current = s.days;
                                    sliderDaysRef.current = s.sliderDays;
                                }}
                                style={[styles.stepBtn, idx === selectedStepIdx && { backgroundColor: 'rgba(218,165,32,0.35)', borderColor: '#DAA520' }]}
                            >
                                <Text style={[styles.stepBtnText, idx === selectedStepIdx && { color: '#FFD700' }]}>{s.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View
                        style={styles.sliderTrackOuter}
                        onLayout={(e) => { const w = e.nativeEvent.layout.width; sliderWRef.current = w; setSliderW(w); }}
                        {...timeSliderPan.panHandlers}
                    >
                        <View style={styles.sliderTrack} />
                        {(() => {
                            const fullMin = -HUNDRED_YEARS_MS / 86400000;
                            const fullMax = HUNDRED_YEARS_MS / 86400000;
                            const fullRange = fullMax - fullMin;
                            const frac = fullRange > 0 ? (dayOffset - fullMin) / fullRange : 0.5;
                            const centerFrac = fullRange > 0 ? (0 - fullMin) / fullRange : 0.5;
                            return (
                                <>
                                    <View style={[styles.sliderCenterMark, { left: centerFrac * sliderW - 1 }]} />
                                    <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(sliderW - 24, frac * sliderW - 12)) }]} />
                                </>
                            );
                        })()}
                    </View>
                    <View style={styles.sliderLabelsRow}>
                        <TouchableOpacity onPress={() => applyOffset(0)}>
                            <Text style={styles.sliderResetLabel}>⟲ Birth</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={jumpToToday}>
                            <Text style={[styles.sliderResetLabel, { color: '#40E0D0' }]}>📅 Today</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Step forward/backward buttons */}
                    <View style={styles.stepRow}>
                        {[{ label: '1 day', d: 1 }, { label: '1 wk', d: 7 }, { label: '1 mo', d: 30 }, { label: '3 mo', d: 91 }].map(s => (
                            <TouchableOpacity key={'m' + s.label} onPress={() => applyOffset(dayOffset - s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>◀ {s.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.stepRow}>
                        {[{ label: '1 day', d: 1 }, { label: '1 wk', d: 7 }, { label: '1 mo', d: 30 }, { label: '3 mo', d: 91 }].map(s => (
                            <TouchableOpacity key={'p' + s.label} onPress={() => applyOffset(dayOffset + s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>{s.label} ▶</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Quick hour steps for the astronomical dial */}
                    <Text style={[styles.sliderEndLabel, { textAlign: 'center', marginTop: 8 }]}>Hour Steps (for Sun & Moon hands)</Text>
                    <View style={styles.stepRow}>
                        {[{ label: '6hr', d: 0.25 }, { label: '3hr', d: 0.125 }, { label: '1hr', d: 1 / 24 }].map(s => (
                            <TouchableOpacity key={'hm' + s.label} onPress={() => applyOffset(dayOffset - s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>◀ {s.label}</Text>
                            </TouchableOpacity>
                        ))}
                        {[{ label: '1hr', d: 1 / 24 }, { label: '3hr', d: 0.125 }, { label: '6hr', d: 0.25 }].map(s => (
                            <TouchableOpacity key={'hp' + s.label} onPress={() => applyOffset(dayOffset + s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>{s.label} ▶</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ═══ READING THE ORLOJ — GUIDE ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔍 How to Read the Orloj</Text>

                    {[
                        { title: 'The Golden Outer Ring — Old Czech Time', desc: 'The outermost ring displays Schwabacher Arabic numerals 1–12 repeated twice (24 total) on a golden background. These mark "Old Czech" or "Italian" hours — a system where hour 1 begins at sunset each day. Watch the ring ROTATE as you change dates — it shifts so that 12 always aligns with the current sunset time. The ring swings about 60° over the year: clockwise in summer when sunset is late (~9 PM), and counter-clockwise in winter (~4 PM). This system was used in Bohemia until 1627.' },
                        { title: 'The Fixed Roman Ring — Central European Time', desc: 'The inner black ring with large gold Roman numerals I–XII shows standard 12-hour time (originally local apparent time, now Central European Time). This ring is FIXED — it never moves. XII is at the top (noon/south in the geocentric view) and at the bottom (midnight/north). VI on the left marks 6 AM (sunrise side / ORTUS) and VI on the right marks 6 PM (sunset side / OCCASVS). The Sun hand sweeps across this ring twice per day.' },
                        { title: 'The Stationary Background — Day and Night', desc: 'The blue zone is daytime and the dark zone is nighttime. The boundary between them is an eccentric circle (not centered) — shifted south to match Prague\'s latitude of 50°N. On the left (east): ORTUS marks sunrise and AURORA marks dawn. On the right (west): OCCASUS marks sunset and CREPVSCVLVM marks twilight. The brown-red zone between day and night represents the twilight period. This entire plate is FIXED — only the zodiac ring and hands move over it.' },
                        { title: 'The Stereographic Projection Circles', desc: 'Three concentric circles represent the Tropic of Cancer (innermost), the Celestial Equator, and the Tropic of Capricorn (outermost). These are calculated by stereographic projection — the same mathematical technique used by the original clockmakers in 1410. The Sun disc rides along the ecliptic between the tropics, reaching the inner circle at summer solstice and the outer at winter solstice.' },
                        { title: 'The Zodiac Ring — The Ecliptic', desc: 'The inner ring of 12 zodiac symbols represents the ecliptic — the path the Sun appears to trace through the constellations over one year. The signs are arranged COUNTERCLOCKWISE (Aries → Taurus → Gemini going counterclockwise), matching the astronomical convention. This ring rotates once per SIDEREAL day (23 hours 56 minutes — slightly faster than the Sun) because the stars shift ~1° per day relative to the Sun. The ring is eccentric (off-center) — its center is shifted toward the north/midnight side, because the ecliptic passes through both the small Cancer circle at the top and the large Capricorn circle at the bottom via stereographic projection.' },
                        { title: 'The Babylonian Hours — Unequal Time', desc: 'The 12 curved numbered lines between the zodiac ring and the day/night background mark "unequal" or "planetary" hours. Unlike modern equal hours, these divide the actual daylight period into 12 equal parts. In summer, when days are long, each Babylonian hour is longer; in winter, shorter. This ancient timekeeping system was used by Babylonians, Romans, and medieval Europeans.' },
                        { title: 'The Sun Hand ☀️', desc: 'The golden hand ending with a radiant sun disc rotates once every 24 hours (one revolution = one day). It simultaneously indicates: the Old Czech hour on the outer ring, the zodiac sign the Sun occupies on the ecliptic ring, and whether it is day (blue zone) or night (dark zone). The Sun hand is the master timekeeper of the Orloj.' },
                        { title: 'The Moon Hand 🌙', desc: 'The silver hand ending in a small sphere shows the Moon\'s position. The sphere is half silver and half black — as it rotates, it displays the current lunar phase (new moon shows the dark half, full moon shows the bright half). The Moon completes its circuit around the dial roughly every 29.5 days (one synodic month), moving through all zodiac signs.' },
                        { title: 'TERRA — Earth at the Center 🌍', desc: 'Earth sits fixed and immovable at the very center of the dial. The Sun, Moon, zodiac, and all celestial markers revolve around it. This is the Ptolemaic geocentric model — the dominant scientific view from 150 AD until Copernicus in 1543, and the cosmological framework used by the Orloj\'s creators.' },
                    ].map(item => (
                        <View key={item.title} style={styles.guideItem}>
                            <Text style={styles.guideName}>{item.title}</Text>
                            <Text style={styles.guideDesc}>{item.desc}</Text>
                        </View>
                    ))}
                </View>

                {/* ═══ CALENDAR DIAL GUIDE ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📅 The Calendar Dial — Guide</Text>

                    {[
                        { title: 'The Mánes Paintings', desc: 'The inner medallions of the calendar dial were painted by Czech artist Josef Mánes in 1865–1866. Each of the 12 segments depicts a scene of Bohemian rural life representing that month — from winter woodcutting (January) to autumn grape harvesting (October). The originals are now preserved in the Prague City Museum, with copies on the clock.' },
                        { title: 'Czech Month Names', desc: 'The dial shows the traditional Czech names for each month: Leden (January, "ice month"), Únor (February, "submersion"), Březen (March, "birch"), through Prosinec (December, "pig-slaughter month"). These names reflect the agricultural and natural cycles that ruled medieval life.' },
                        { title: 'Saints\' Feast Days', desc: 'The outermost ring of the real calendar dial lists 365 saint names — one for each day of the year. Before birthdays were widely celebrated, your "name day" (the feast of the saint whose name you bore) was your most important personal celebration. The golden pointer indicates today\'s saint.' },
                        { title: 'The Four Seasons', desc: 'The inner section shows four seasonal medallions representing the agricultural year: Spring (planting), Summer (harvesting), Autumn (wine-making), Winter (rest). The calendar rotates so the current season faces upward, with the pointer marking the exact day.' },
                        { title: 'The Prague Coat of Arms', desc: 'At the very center sits the coat of arms of the Old Town of Prague (PRAHA) — the same city that has maintained this clock for over 600 years. The central position symbolizes Prague\'s pride as a center of learning, science, and craftsmanship.' },
                    ].map(item => (
                        <View key={item.title} style={styles.guideItem}>
                            <Text style={styles.guideName}>{item.title}</Text>
                            <Text style={styles.guideDesc}>{item.desc}</Text>
                        </View>
                    ))}
                </View>

                {/* ═══ HISTORY ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📜 History of the Orloj</Text>
                    <Text style={styles.historyText}>
                        The Prague Astronomical Clock was first installed in <Text style={styles.highlight}>1410</Text>, making it the third-oldest astronomical clock in the world and the oldest still operating. It was designed by mathematician and astronomer <Text style={styles.highlight}>Jan Šindel</Text> and built by clockmaker <Text style={styles.highlight}>Mikuláš of Kadaň</Text>.{"\n\n"}The clock was extensively repaired and enhanced by clockmaster <Text style={styles.highlight}>Jan Táborský</Text> in the 1550s–1570s. The calendar dial with <Text style={styles.highlight}>Josef Mánes'</Text> paintings was added in 1866. The Apostles mechanism was added during the 1865–1866 renovation.{"\n\n"}During the Prague Uprising in May 1945, Nazi forces set the Old Town Hall on fire, severely damaging the clock. It was painstakingly restored and restarted in <Text style={styles.highlight}>1948</Text>. The most recent major restoration was completed in <Text style={styles.highlight}>2018</Text>.{"\n\n"}According to legend, the Prague councilors blinded master clockmaker <Text style={styles.highlight}>Hanuš</Text> to prevent him from building a similar clock elsewhere. In revenge, Hanuš reached into the mechanism and stopped the clock — and no one could fix it for decades. Though the legend is historically inaccurate (Hanuš lived a century later), it speaks to the awe the Orloj has inspired for 600 years.{"\n\n"}The clock can still be seen today on the southern wall of the Old Town Hall, in Prague's <Text style={styles.highlight}>Old Town Square (Staroměstské náměstí)</Text>. Every hour, thousands of tourists gather to watch the Apostles' procession and hear the skeleton ring its bell.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 40 },

    header: { alignItems: 'center', marginTop: 10, marginBottom: 16 },
    headerEmoji: { fontSize: 55, marginBottom: 6 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#DAA520', textAlign: 'center' },
    headerSubtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic' },
    headerDate: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 4 },

    card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(218,165,32,0.2)' },
    cardTitle: { fontSize: 20, fontWeight: '900', color: '#DAA520', marginBottom: 6 },
    cardSubtitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontStyle: 'italic' },
    cardBody: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', lineHeight: 22 },

    clockContainer: {
        backgroundColor: '#050308',
        borderRadius: 16,
        padding: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(139,105,20,0.4)',
        position: 'relative' as const,
    },
    spinOverlay: { position: 'absolute' as const, top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, zIndex: 10, borderWidth: 1, borderColor: '#DAA520' },
    spinOverlayDate: { fontSize: 14, fontWeight: '700', color: '#DAA520', textAlign: 'center' },
    spinOverlayDelta: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    dateOverlay: { position: 'absolute' as const, bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    dateOverlayText: { fontSize: 13, fontWeight: '700', color: '#DAA520' },
    dateOverlaySub: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginTop: 1 },

    // Apostles & flanking figures
    apostlesRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 12 },
    flankingColumn: { width: 50, justifyContent: 'space-around', alignItems: 'center' },
    flankingFigure: { alignItems: 'center', paddingVertical: 8 },
    flankingEmoji: { fontSize: 24 },
    flankingName: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 2, textAlign: 'center' },
    flankingDesc: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', lineHeight: 20, marginTop: 8 },
    apostlesWindow: { flex: 1, backgroundColor: 'rgba(139,105,20,0.1)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(139,105,20,0.3)' },
    apostlesArch: { alignItems: 'center', marginBottom: 8 },
    apostlesArchText: { fontSize: 12, fontWeight: '800', color: '#DAA520' },
    apostlesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginBottom: 4 },
    apostleSlot: { alignItems: 'center', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.3)', minWidth: 42 },
    apostleActive: { backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: 'rgba(218,165,32,0.5)' },
    apostleIcon: { fontSize: 14 },
    apostleName: { fontSize: 7, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
    apostlesNote: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 16 },

    // Time controls
    sliderDateText: { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 2 },
    sliderOffsetText: { fontSize: 12, fontWeight: '600', color: '#DAA520', textAlign: 'center', marginBottom: 6 },
    sliderTrackOuter: { height: 44, justifyContent: 'center', marginHorizontal: 4, marginVertical: 8 },
    sliderTrack: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
    sliderCenterMark: { position: 'absolute', width: 2, height: 20, backgroundColor: 'rgba(218,165,32,0.5)', borderRadius: 1, top: 12 },
    sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#DAA520', borderWidth: 2, borderColor: '#fff', top: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    sliderEndLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    sliderResetLabel: { fontSize: 13, fontWeight: '700', color: '#DAA520' },
    stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, gap: 4 },
    stepBtn: { flex: 1, paddingVertical: 5, paddingHorizontal: 2, borderRadius: 6, backgroundColor: 'rgba(139,105,20,0.15)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,105,20,0.2)' },
    stepBtnText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.65)' },

    // Guide items
    guideItem: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(139,105,20,0.15)' },
    guideName: { fontSize: 14, fontWeight: '800', color: '#DAA520', marginBottom: 4 },
    guideDesc: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)', lineHeight: 20 },

    // History
    historyText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
    highlight: { color: '#DAA520', fontWeight: '800' },

    // 4-panel grid
    gridPanel: { width: '48%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,105,20,0.3)' } as any,
    gridPanelClock: { borderRadius: 10, overflow: 'hidden' as const, marginBottom: 4 },
    gridPanelTitle: { fontSize: 12, fontWeight: '900' as const, color: '#DAA520', marginTop: 2, textAlign: 'center' as const },
    gridPanelSub: { fontSize: 9, fontWeight: '600' as const, color: 'rgba(255,255,255,0.5)', textAlign: 'center' as const, marginTop: 1 },
});
