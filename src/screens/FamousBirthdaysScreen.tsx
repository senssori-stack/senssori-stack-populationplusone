import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FamousBirthdays'>;

interface FamousPerson {
    year: number;
    name: string;
    description: string;
}

// Comprehensive database of famous AMERICAN people by month-day
// Musicians, actors/actresses, business icons, sports legends, household names
const americanCelebrities: Record<string, FamousPerson[]> = {
    // JANUARY
    '1-1': [
        { year: 1735, name: 'Paul Revere', description: 'American patriot and silversmith' },
        { year: 1895, name: 'J. Edgar Hoover', description: 'First FBI Director' },
        { year: 1919, name: 'J.D. Salinger', description: 'Author of The Catcher in the Rye' },
    ],
    '1-2': [
        { year: 1920, name: 'Isaac Asimov', description: 'Legendary science fiction author' },
        { year: 1969, name: 'Christy Turlington', description: 'Supermodel and entrepreneur' },
    ],
    '1-3': [
        { year: 1892, name: 'J.R.R. Tolkien', description: 'Author of Lord of the Rings' },
        { year: 1956, name: 'Mel Gibson', description: 'Actor and director (Braveheart)' },
    ],
    '1-4': [
        { year: 1643, name: 'Isaac Newton', description: 'Physicist, mathematician, genius' },
        { year: 1965, name: 'Julia Ormond', description: 'Actress (Legends of the Fall)' },
    ],
    '1-5': [
        { year: 1928, name: 'Walter Mondale', description: '42nd U.S. Vice President' },
        { year: 1946, name: 'Diane Keaton', description: 'Academy Award-winning actress (Annie Hall)' },
        { year: 1969, name: 'Marilyn Manson', description: 'Rock musician' },
    ],
    '1-6': [
        { year: 1832, name: 'Gustave Doré', description: 'Renowned artist and illustrator' },
        { year: 1913, name: 'Loretta Young', description: 'Oscar-winning actress' },
    ],
    '1-7': [
        { year: 1800, name: 'Millard Fillmore', description: '13th U.S. President' },
        { year: 1948, name: 'Kenny Loggins', description: 'Singer-songwriter (Footloose)' },
        { year: 1964, name: 'Nicolas Cage', description: 'Academy Award-winning actor' },
    ],
    '1-8': [
        { year: 1935, name: 'Elvis Presley', description: 'The King of Rock and Roll' },
        { year: 1942, name: 'Stephen Hawking', description: 'Theoretical physicist' },
        { year: 1947, name: 'David Bowie', description: 'Legendary rock musician' },
    ],
    '1-9': [
        { year: 1913, name: 'Richard Nixon', description: '37th U.S. President' },
        { year: 1941, name: 'Joan Baez', description: 'Folk singer and civil rights activist' },
        { year: 1982, name: 'Catherine, Duchess of Cambridge', description: 'British royal' },
    ],
    '1-10': [
        { year: 1945, name: 'Rod Stewart', description: 'Rock and pop singer' },
        { year: 1949, name: 'George Foreman', description: 'Heavyweight boxing champion & entrepreneur' },
        { year: 1953, name: 'Pat Benatar', description: 'Rock singer (Hit Me with Your Best Shot)' },
    ],
    '1-11': [
        { year: 1755, name: 'Alexander Hamilton', description: 'Founding Father, first Treasury Secretary' },
        { year: 1971, name: 'Mary J. Blige', description: 'Queen of Hip-Hop Soul' },
    ],
    '1-12': [
        { year: 1876, name: 'Jack London', description: 'Author of Call of the Wild' },
        { year: 1951, name: 'Rush Limbaugh', description: 'Radio host and commentator' },
        { year: 1964, name: 'Jeff Bezos', description: 'Amazon founder, billionaire' },
    ],
    '1-13': [
        { year: 1832, name: 'Horatio Alger Jr.', description: 'Author of rags-to-riches stories' },
        { year: 1961, name: 'Julia Louis-Dreyfus', description: 'Actress (Seinfeld, Veep)' },
        { year: 1977, name: 'Orlando Bloom', description: 'Actor (Lord of the Rings, Pirates)' },
    ],
    '1-14': [
        { year: 1741, name: 'Benedict Arnold', description: 'Revolutionary War general' },
        { year: 1948, name: 'Carl Weathers', description: 'Actor (Rocky, Predator)' },
        { year: 1969, name: 'Jason Bateman', description: 'Actor (Arrested Development, Ozark)' },
    ],
    '1-15': [
        { year: 1929, name: 'Martin Luther King Jr.', description: 'Civil rights leader, Nobel laureate' },
        { year: 1951, name: 'Charo', description: 'Entertainer and guitarist' },
        { year: 1981, name: 'Pitbull', description: 'Rapper and entrepreneur (Mr. Worldwide)' },
    ],
    '1-16': [
        { year: 1853, name: 'André Michelin', description: 'Michelin tire co-founder' },
        { year: 1948, name: 'John Carpenter', description: 'Director (Halloween, The Thing)' },
        { year: 1979, name: 'Aaliyah', description: 'R&B singer and actress' },
    ],
    '1-17': [
        { year: 1706, name: 'Benjamin Franklin', description: 'Founding Father, inventor, diplomat' },
        { year: 1942, name: 'Muhammad Ali', description: 'The Greatest — heavyweight boxing champion' },
        { year: 1962, name: 'Jim Carrey', description: 'Comedy actor (Ace Ventura, The Mask)' },
    ],
    '1-18': [
        { year: 1882, name: 'A.A. Milne', description: 'Author of Winnie-the-Pooh' },
        { year: 1892, name: 'Oliver Hardy', description: 'Comedian (Laurel & Hardy)' },
        { year: 1955, name: 'Kevin Costner', description: 'Actor and director (Dances with Wolves)' },
    ],
    '1-19': [
        { year: 1807, name: 'Robert E. Lee', description: 'Confederate general' },
        { year: 1809, name: 'Edgar Allan Poe', description: 'Author and poet (The Raven)' },
        { year: 1946, name: 'Dolly Parton', description: 'Country music legend & philanthropist' },
    ],
    '1-20': [
        { year: 1896, name: 'George Burns', description: 'Comedian and actor' },
        { year: 1926, name: 'Patricia Neal', description: 'Oscar-winning actress' },
        { year: 1930, name: 'Buzz Aldrin', description: 'Apollo 11 astronaut, walked on the Moon' },
    ],
    '1-21': [
        { year: 1824, name: 'Stonewall Jackson', description: 'Confederate general' },
        { year: 1905, name: 'Christian Dior', description: 'Fashion designer' },
        { year: 1956, name: 'Geena Davis', description: 'Oscar-winning actress (Thelma & Louise)' },
    ],
    '1-22': [
        { year: 1788, name: 'Lord Byron', description: 'Romantic poet' },
        { year: 1934, name: 'Bill Bixby', description: 'Actor (The Incredible Hulk)' },
        { year: 1940, name: 'John Hurt', description: 'Actor (Alien, Harry Potter)' },
        { year: 1959, name: 'Linda Blair', description: 'Actress (The Exorcist)' },
    ],
    '1-23': [
        { year: 1737, name: 'John Hancock', description: 'First signer of Declaration of Independence' },
        { year: 1957, name: 'Princess Caroline of Monaco', description: 'Monegasque royalty' },
        { year: 1974, name: 'Tiffani Thiessen', description: 'Actress (Saved by the Bell)' },
    ],
    '1-24': [
        { year: 1848, name: 'Gen. John J. Pershing', description: 'WWI general, leader of American forces' },
        { year: 1941, name: 'Neil Diamond', description: 'Singer-songwriter (Sweet Caroline)' },
        { year: 1968, name: 'Mary Lou Retton', description: 'Olympic gold medalist gymnast' },
    ],
    '1-25': [
        { year: 1759, name: 'Robert Burns', description: 'Scottish national poet' },
        { year: 1981, name: 'Alicia Keys', description: 'Grammy-winning singer-songwriter' },
        { year: 1982, name: 'Noemi', description: 'Italian singer' },
    ],
    '1-26': [
        { year: 1880, name: 'Douglas MacArthur', description: 'Five-star general, WWII & Korea' },
        { year: 1925, name: 'Paul Newman', description: 'Oscar-winning actor and philanthropist' },
        { year: 1958, name: 'Ellen DeGeneres', description: 'Talk show host and comedian' },
    ],
    '1-27': [
        { year: 1756, name: 'Wolfgang Amadeus Mozart', description: 'Classical composer prodigy' },
        { year: 1948, name: 'Mikhail Baryshnikov', description: 'Ballet dancer and actor' },
        { year: 1964, name: 'Bridget Fonda', description: 'Actress (Singles, Jackie Brown)' },
    ],
    '1-28': [
        { year: 1873, name: 'Colette', description: 'French author (Gigi)' },
        { year: 1936, name: 'Alan Alda', description: 'Actor (M*A*S*H)' },
        { year: 1981, name: 'Elijah Wood', description: 'Actor (Lord of the Rings)' },
    ],
    '1-29': [
        { year: 1843, name: 'William McKinley', description: '25th U.S. President' },
        { year: 1954, name: 'Oprah Winfrey', description: 'Media mogul and talk show queen' },
        { year: 1968, name: 'Edward Burns', description: 'Actor and filmmaker' },
    ],
    '1-30': [
        { year: 1882, name: 'Franklin D. Roosevelt', description: '32nd U.S. President' },
        { year: 1930, name: 'Gene Hackman', description: 'Oscar-winning actor' },
        { year: 1974, name: 'Christian Bale', description: 'Oscar-winning actor (Batman, The Fighter)' },
    ],
    '1-31': [
        { year: 1797, name: 'Franz Schubert', description: 'Classical composer' },
        { year: 1919, name: 'Jackie Robinson', description: 'Broke baseball\'s color barrier' },
        { year: 1981, name: 'Justin Timberlake', description: 'Pop singer and actor' },
    ],
    // FEBRUARY
    '2-1': [
        { year: 1901, name: 'Clark Gable', description: 'King of Hollywood (Gone with the Wind)' },
        { year: 1937, name: 'Don Everly', description: 'Singer (The Everly Brothers)' },
        { year: 1968, name: 'Lisa Marie Presley', description: 'Singer, daughter of Elvis' },
    ],
    '2-2': [
        { year: 1882, name: 'James Joyce', description: 'Novelist (Ulysses)' },
        { year: 1905, name: 'Ayn Rand', description: 'Author and philosopher' },
        { year: 1977, name: 'Shakira', description: 'Singer and performer' },
    ],
    '2-3': [
        { year: 1894, name: 'Norman Rockwell', description: 'Iconic American illustrator' },
        { year: 1938, name: 'Frankie Valli', description: 'Singer (Jersey Boys, The Four Seasons)' },
        { year: 1957, name: 'Nathan Lane', description: 'Broadway and film actor' },
    ],
    '2-4': [
        { year: 1902, name: 'Charles Lindbergh', description: 'Aviation pioneer, first solo Atlantic flight' },
        { year: 1913, name: 'Rosa Parks', description: 'Mother of the Civil Rights Movement' },
        { year: 1948, name: 'Alice Cooper', description: 'Shock rock pioneer' },
    ],
    '2-5': [
        { year: 1914, name: 'William S. Burroughs', description: 'Beat generation author' },
        { year: 1934, name: 'Hank Aaron', description: 'Baseball legend, home run king' },
        { year: 1985, name: 'Cristiano Ronaldo', description: 'Soccer superstar' },
    ],
    '2-6': [
        { year: 1895, name: 'Babe Ruth', description: 'Baseball\'s greatest legend' },
        { year: 1911, name: 'Ronald Reagan', description: '40th U.S. President' },
        { year: 1945, name: 'Bob Marley', description: 'Reggae legend (Jamaica)' },
    ],
    '2-7': [
        { year: 1812, name: 'Charles Dickens', description: 'Novelist (A Tale of Two Cities)' },
        { year: 1867, name: 'Laura Ingalls Wilder', description: 'Author (Little House on the Prairie)' },
        { year: 1962, name: 'Garth Brooks', description: 'Best-selling country music artist ever' },
    ],
    '2-8': [
        { year: 1820, name: 'William Tecumseh Sherman', description: 'Union Civil War general' },
        { year: 1925, name: 'Jack Lemmon', description: 'Oscar-winning actor' },
        { year: 1931, name: 'James Dean', description: 'Iconic actor (Rebel Without a Cause)' },
    ],
    '2-9': [
        { year: 1773, name: 'William Henry Harrison', description: '9th U.S. President' },
        { year: 1914, name: 'Bill Veeck', description: 'Legendary baseball owner' },
        { year: 1943, name: 'Joe Pesci', description: 'Oscar-winning actor (Goodfellas)' },
    ],
    '2-10': [
        { year: 1893, name: 'Jimmy Durante', description: 'Comedian and entertainer' },
        { year: 1927, name: 'Leontyne Price', description: 'Legendary opera soprano' },
        { year: 1950, name: 'Mark Spitz', description: 'Olympic swimming gold medalist (7 golds)' },
    ],
    '2-11': [
        { year: 1847, name: 'Thomas Edison', description: 'Inventor of the light bulb, phonograph' },
        { year: 1936, name: 'Burt Reynolds', description: 'Actor (Smokey and the Bandit)' },
        { year: 1969, name: 'Jennifer Aniston', description: 'Actress (Friends)' },
    ],
    '2-12': [
        { year: 1809, name: 'Abraham Lincoln', description: '16th U.S. President, saved the Union' },
        { year: 1934, name: 'Bill Russell', description: 'NBA legend, 11 championships' },
        { year: 1980, name: 'Christina Ricci', description: 'Actress (Addams Family, Wednesday)' },
    ],
    '2-13': [
        { year: 1885, name: 'Bess Truman', description: 'First Lady' },
        { year: 1933, name: 'Chuck Yeager', description: 'Test pilot, first to break sound barrier' },
        { year: 1974, name: 'Robbie Williams', description: 'Pop singer' },
    ],
    '2-14': [
        { year: 1894, name: 'Jack Benny', description: 'Comedian and entertainer' },
        { year: 1913, name: 'Jimmy Hoffa', description: 'Teamsters union leader' },
        { year: 1989, name: 'Tiffany Trump', description: 'Media personality, presidential daughter' },
    ],
    '2-15': [
        { year: 1820, name: 'Susan B. Anthony', description: 'Women\'s suffrage pioneer' },
        { year: 1951, name: 'Jane Seymour', description: 'Actress (Dr. Quinn, Bond Girl)' },
        { year: 1964, name: 'Chris Farley', description: 'SNL comedian' },
    ],
    '2-16': [
        { year: 1959, name: 'John McEnroe', description: 'Tennis legend' },
        { year: 1961, name: 'Ice-T', description: 'Rapper and actor (Law & Order: SVU)' },
        { year: 1987, name: 'The Weeknd', description: 'Grammy-winning R&B singer' },
    ],
    '2-17': [
        { year: 1963, name: 'Michael Jordan', description: 'The GOAT — basketball legend' },
        { year: 1972, name: 'Billie Joe Armstrong', description: 'Green Day lead singer' },
        { year: 1981, name: 'Paris Hilton', description: 'Media personality and businesswoman' },
    ],
    '2-18': [
        { year: 1931, name: 'Toni Morrison', description: 'Nobel Prize-winning author (Beloved)' },
        { year: 1933, name: 'Yoko Ono', description: 'Artist and peace activist' },
        { year: 1954, name: 'John Travolta', description: 'Actor (Grease, Pulp Fiction)' },
    ],
    '2-19': [
        { year: 1940, name: 'Smokey Robinson', description: 'Motown singer-songwriter' },
        { year: 1953, name: 'Cristina Fernández', description: 'President of Argentina' },
        { year: 1986, name: 'Marta', description: 'Brazilian soccer legend' },
    ],
    '2-20': [
        { year: 1924, name: 'Sidney Poitier', description: 'First Black Best Actor Oscar winner' },
        { year: 1927, name: 'Roy Cohn', description: 'Attorney and political figure' },
        { year: 1967, name: 'Kurt Cobain', description: 'Nirvana frontman, grunge icon' },
        { year: 1988, name: 'Rihanna', description: 'Singer, fashion mogul, billionaire' },
    ],
    '2-21': [
        { year: 1924, name: 'Robert Mugabe', description: 'President of Zimbabwe' },
        { year: 1946, name: 'Alan Rickman', description: 'Actor (Die Hard, Harry Potter)' },
        { year: 1979, name: 'Jordan Peele', description: 'Director (Get Out, Us)' },
    ],
    '2-22': [
        { year: 1732, name: 'George Washington', description: 'First U.S. President, Father of the Nation' },
        { year: 1932, name: 'Ted Kennedy', description: 'Longtime U.S. Senator' },
        { year: 1975, name: 'Drew Barrymore', description: 'Actress and talk show host' },
    ],
    '2-23': [
        { year: 1685, name: 'George Frideric Handel', description: 'Baroque composer (Messiah)' },
        { year: 1868, name: 'W.E.B. Du Bois', description: 'Civil rights leader and sociologist' },
        { year: 1983, name: 'Emily Blunt', description: 'Actress (A Quiet Place, Mary Poppins)' },
    ],
    '2-24': [
        { year: 1786, name: 'Wilhelm Grimm', description: 'Fairy tale author (Brothers Grimm)' },
        { year: 1955, name: 'Steve Jobs', description: 'Apple co-founder, tech visionary' },
        { year: 1966, name: 'Billy Zane', description: 'Actor (Titanic)' },
    ],
    '2-25': [
        { year: 1841, name: 'Pierre-Auguste Renoir', description: 'Impressionist painter' },
        { year: 1917, name: 'Anthony Burgess', description: 'Author (A Clockwork Orange)' },
        { year: 1943, name: 'George Harrison', description: 'Beatles guitarist' },
    ],
    '2-26': [
        { year: 1802, name: 'Victor Hugo', description: 'Author (Les Misérables)' },
        { year: 1846, name: 'Buffalo Bill Cody', description: 'Wild West showman' },
        { year: 1928, name: 'Fats Domino', description: 'Rock and roll pioneer' },
    ],
    '2-27': [
        { year: 1807, name: 'Henry Wadsworth Longfellow', description: 'American poet' },
        { year: 1902, name: 'John Steinbeck', description: 'Nobel Prize author (Grapes of Wrath)' },
        { year: 1980, name: 'Chelsea Clinton', description: 'Author and global health advocate' },
    ],
    '2-28': [
        { year: 1906, name: 'Bugsy Siegel', description: 'Gangster who built Las Vegas' },
        { year: 1930, name: 'Leon Cooper', description: 'Nobel Prize physicist' },
        { year: 1940, name: 'Mario Andretti', description: 'Formula 1 racing legend' },
    ],
    '2-29': [
        { year: 1468, name: 'Pope Paul III', description: 'Renaissance pope' },
        { year: 1792, name: 'Gioachino Rossini', description: 'Opera composer (Barber of Seville)' },
        { year: 1980, name: 'Ja Rule', description: 'Rapper' },
    ],
    // MARCH
    '3-1': [
        { year: 1810, name: 'Frédéric Chopin', description: 'Piano composer' },
        { year: 1914, name: 'Ralph Ellison', description: 'Author (Invisible Man)' },
        { year: 1994, name: 'Justin Bieber', description: 'Pop megastar' },
    ],
    '3-2': [
        { year: 1793, name: 'Sam Houston', description: 'Texas Republic president' },
        { year: 1904, name: 'Dr. Seuss (Theodor Geisel)', description: 'Beloved children\'s author' },
        { year: 1962, name: 'Jon Bon Jovi', description: 'Rock singer (Bon Jovi)' },
    ],
    '3-3': [
        { year: 1831, name: 'George Pullman', description: 'Railroad sleeping car inventor' },
        { year: 1847, name: 'Alexander Graham Bell', description: 'Inventor of the telephone' },
        { year: 1962, name: 'Jackie Joyner-Kersee', description: 'Olympic track & field legend' },
    ],
    '3-4': [
        { year: 1888, name: 'Knute Rockne', description: 'Legendary Notre Dame football coach' },
        { year: 1913, name: 'John Garfield', description: 'Hollywood leading man' },
        { year: 1977, name: 'Chastity Bono', description: 'LGBTQ+ activist and author' },
    ],
    '3-5': [
        { year: 1908, name: 'Rex Harrison', description: 'Oscar-winning actor' },
        { year: 1958, name: 'Andy Gibb', description: 'Pop singer (Bee Gees family)' },
        { year: 1970, name: 'John Frusciante', description: 'Red Hot Chili Peppers guitarist' },
    ],
    '3-6': [
        { year: 1475, name: 'Michelangelo', description: 'Renaissance artist (Sistine Chapel)' },
        { year: 1926, name: 'Alan Greenspan', description: 'Federal Reserve Chairman' },
        { year: 1972, name: 'Shaquille O\'Neal', description: 'NBA legend and entertainer' },
    ],
    '3-7': [
        { year: 1849, name: 'Luther Burbank', description: 'Agricultural pioneer' },
        { year: 1960, name: 'Ivan Lendl', description: 'Tennis champion' },
        { year: 1964, name: 'Bret Easton Ellis', description: 'Author (American Psycho)' },
    ],
    '3-8': [
        { year: 1841, name: 'Oliver Wendell Holmes Jr.', description: 'Supreme Court Justice' },
        { year: 1943, name: 'Lynn Redgrave', description: 'Oscar-nominated actress' },
        { year: 1985, name: 'Akon', description: 'R&B singer and entrepreneur' },
    ],
    '3-9': [
        { year: 1934, name: 'Yuri Gagarin', description: 'First human in space' },
        { year: 1943, name: 'Bobby Fischer', description: 'Chess world champion' },
        { year: 1986, name: 'Brittany Snow', description: 'Actress (Pitch Perfect)' },
    ],
    '3-10': [
        { year: 1845, name: 'Alexander III of Russia', description: 'Russian emperor' },
        { year: 1940, name: 'Chuck Norris', description: 'Actor and martial artist' },
        { year: 1983, name: 'Carrie Underwood', description: 'Country music superstar' },
    ],
    '3-11': [
        { year: 1903, name: 'Lawrence Welk', description: 'Bandleader and TV host' },
        { year: 1931, name: 'Rupert Murdoch', description: 'Media mogul (Fox, News Corp)' },
        { year: 1985, name: 'Jodie Comer', description: 'Actress (Killing Eve)' },
    ],
    '3-12': [
        { year: 1838, name: 'William Henry Perkin', description: 'Inventor of synthetic dye' },
        { year: 1922, name: 'Jack Kerouac', description: 'Beat generation author (On the Road)' },
        { year: 1946, name: 'Liza Minnelli', description: 'Oscar-winning actress (Cabaret)' },
    ],
    '3-13': [
        { year: 1855, name: 'Percival Lowell', description: 'Astronomer who theorized Pluto' },
        { year: 1939, name: 'Neil Sedaka', description: 'Singer-songwriter' },
        { year: 1956, name: 'Dana Delany', description: 'Emmy-winning actress' },
    ],
    '3-14': [
        { year: 1879, name: 'Albert Einstein', description: 'Physicist, theory of relativity, genius' },
        { year: 1920, name: 'Hank Ketcham', description: 'Dennis the Menace cartoonist' },
        { year: 1933, name: 'Quincy Jones', description: 'Music producer legend (Thriller)' },
        { year: 1988, name: 'Stephen Curry', description: 'NBA sharpshooter, Warriors legend' },
    ],
    '3-15': [
        { year: 1767, name: 'Andrew Jackson', description: '7th U.S. President' },
        { year: 1933, name: 'Ruth Bader Ginsburg', description: 'Supreme Court Justice, icon' },
        { year: 1975, name: 'will.i.am', description: 'Black Eyed Peas rapper and producer' },
    ],
    '3-16': [
        { year: 1751, name: 'James Madison', description: '4th U.S. President, Father of the Constitution' },
        { year: 1926, name: 'Jerry Lewis', description: 'Comedian and actor' },
        { year: 1949, name: 'Erik Estrada', description: 'Actor (CHiPs)' },
    ],
    '3-17': [
        { year: 1919, name: 'Nat King Cole', description: 'Legendary singer and pianist' },
        { year: 1938, name: 'Rudolf Nureyev', description: 'Ballet legend' },
        { year: 1964, name: 'Rob Lowe', description: 'Actor (The West Wing, Parks & Rec)' },
    ],
    '3-18': [
        { year: 1837, name: 'Grover Cleveland', description: '22nd and 24th U.S. President' },
        { year: 1932, name: 'John Updike', description: 'Pulitzer Prize-winning author' },
        { year: 1970, name: 'Queen Latifah', description: 'Rapper, actress, producer' },
    ],
    '3-19': [
        { year: 1848, name: 'Wyatt Earp', description: 'Legendary Old West lawman' },
        { year: 1936, name: 'Ursula Andress', description: 'Actress (first Bond Girl)' },
        { year: 1955, name: 'Bruce Willis', description: 'Actor (Die Hard)' },
    ],
    '3-20': [
        { year: 1828, name: 'Henrik Ibsen', description: 'Father of modern drama' },
        { year: 1948, name: 'Bobby Orr', description: 'Hockey legend' },
        { year: 1958, name: 'Holly Hunter', description: 'Oscar-winning actress' },
        { year: 1985, name: 'Christy Altomare', description: 'Broadway actress (Anastasia)' },
    ],
    '3-21': [
        { year: 1685, name: 'Johann Sebastian Bach', description: 'Classical music master' },
        { year: 1962, name: 'Matthew Broderick', description: 'Actor (Ferris Bueller\'s Day Off)' },
        { year: 1980, name: 'Ronaldinho', description: 'Brazilian soccer legend' },
    ],
    '3-22': [
        { year: 1908, name: 'Louis L\'Amour', description: 'Western novelist' },
        { year: 1930, name: 'Stephen Sondheim', description: 'Broadway composer (West Side Story)' },
        { year: 1976, name: 'Reese Witherspoon', description: 'Oscar-winning actress (Walk the Line)' },
    ],
    '3-23': [
        { year: 1858, name: 'Fannie Farmer', description: 'Pioneer of modern cooking' },
        { year: 1910, name: 'Akira Kurosawa', description: 'Legendary Japanese filmmaker' },
        { year: 1978, name: 'Perez Hilton', description: 'Celebrity blogger' },
    ],
    '3-24': [
        { year: 1855, name: 'Andrew Mellon', description: 'Financier and Treasury Secretary' },
        { year: 1874, name: 'Harry Houdini', description: 'Greatest magician and escape artist' },
        { year: 1976, name: 'Peyton Manning', description: 'NFL quarterback legend' },
    ],
    '3-25': [
        { year: 1867, name: 'Arturo Toscanini', description: 'Legendary orchestra conductor' },
        { year: 1934, name: 'Gloria Steinem', description: 'Feminist icon and journalist' },
        { year: 1947, name: 'Elton John', description: 'Legendary singer-songwriter' },
        { year: 1965, name: 'Sarah Jessica Parker', description: 'Actress (Sex and the City)' },
    ],
    '3-26': [
        { year: 1874, name: 'Robert Frost', description: 'Beloved American poet' },
        { year: 1931, name: 'Leonard Nimoy', description: 'Actor (Spock in Star Trek)' },
        { year: 1985, name: 'Keira Knightley', description: 'Actress (Pirates, Pride & Prejudice)' },
    ],
    '3-27': [
        { year: 1845, name: 'Wilhelm Röntgen', description: 'Discoverer of X-rays' },
        { year: 1963, name: 'Quentin Tarantino', description: 'Director (Pulp Fiction, Django)' },
        { year: 1970, name: 'Mariah Carey', description: 'Pop and R&B diva, 5-octave range' },
    ],
    '3-28': [
        { year: 1921, name: 'Dirk Bogarde', description: 'Actor (Death in Venice)' },
        { year: 1936, name: 'Mario Vargas Llosa', description: 'Nobel Prize-winning author' },
        { year: 1981, name: 'Julia Stiles', description: 'Actress (10 Things I Hate About You)' },
        { year: 1986, name: 'Lady Gaga', description: 'Pop superstar and actress' },
    ],
    '3-29': [
        { year: 1790, name: 'John Tyler', description: '10th U.S. President' },
        { year: 1918, name: 'Sam Walton', description: 'Walmart founder, retail king' },
        { year: 1976, name: 'Jennifer Capriati', description: 'Tennis champion' },
    ],
    '3-30': [
        { year: 1820, name: 'Anna Sewell', description: 'Author (Black Beauty)' },
        { year: 1853, name: 'Vincent van Gogh', description: 'Post-Impressionist painter' },
        { year: 1968, name: 'Celine Dion', description: 'Powerhouse vocalist' },
    ],
    '3-31': [
        { year: 1596, name: 'René Descartes', description: 'Philosopher (I think, therefore I am)' },
        { year: 1935, name: 'Herb Alpert', description: 'Trumpeter and A&M Records founder' },
        { year: 1943, name: 'Christopher Walken', description: 'Academy Award-winning actor' },
        { year: 1948, name: 'Al Gore', description: '45th U.S. Vice President' },
    ],
    // APRIL
    '4-1': [
        { year: 1815, name: 'Otto von Bismarck', description: 'German unifier' },
        { year: 1920, name: 'Toshiro Mifune', description: 'Japanese film actor' },
        { year: 1932, name: 'Debbie Reynolds', description: 'Actress (Singin\' in the Rain)' },
    ],
    '4-2': [
        { year: 1725, name: 'Giacomo Casanova', description: 'Adventurer and author' },
        { year: 1805, name: 'Hans Christian Andersen', description: 'Fairy tale author (The Little Mermaid)' },
        { year: 1914, name: 'Alec Guinness', description: 'Oscar-winning actor (Star Wars)' },
    ],
    '4-3': [
        { year: 1783, name: 'Washington Irving', description: 'Author (Sleepy Hollow, Rip Van Winkle)' },
        { year: 1924, name: 'Marlon Brando', description: 'Actor (The Godfather)' },
        { year: 1961, name: 'Eddie Murphy', description: 'Comedy legend (Beverly Hills Cop, Coming to America)' },
        { year: 1982, name: 'Cobie Smulders', description: 'Actress (How I Met Your Mother)' },
    ],
    '4-4': [
        { year: 1928, name: 'Maya Angelou', description: 'Poet and civil rights activist' },
        { year: 1965, name: 'Robert Downey Jr.', description: 'Actor (Iron Man, Sherlock Holmes)' },
        { year: 1979, name: 'Heath Ledger', description: 'Oscar-winning actor (The Dark Knight)' },
    ],
    '4-5': [
        { year: 1856, name: 'Booker T. Washington', description: 'Educator and civil rights leader' },
        { year: 1908, name: 'Bette Davis', description: 'Legendary actress (10 Oscar noms)' },
        { year: 1937, name: 'Colin Powell', description: 'First Black Secretary of State' },
    ],
    '4-6': [
        { year: 1866, name: 'Butch Cassidy', description: 'Famous outlaw' },
        { year: 1928, name: 'James Watson', description: 'Co-discoverer of DNA structure' },
        { year: 1969, name: 'Paul Rudd', description: 'Actor (Ant-Man, Clueless)' },
    ],
    '4-7': [
        { year: 1770, name: 'William Wordsworth', description: 'Romantic poet' },
        { year: 1915, name: 'Billie Holiday', description: 'Jazz vocalist legend (Lady Day)' },
        { year: 1939, name: 'Francis Ford Coppola', description: 'Director (The Godfather)' },
        { year: 1964, name: 'Russell Crowe', description: 'Oscar-winning actor (Gladiator)' },
    ],
    '4-8': [
        { year: 1963, name: 'Julian Lennon', description: 'Musician, son of John Lennon' },
        { year: 1966, name: 'Robin Wright', description: 'Actress (Forrest Gump, House of Cards)' },
    ],
    '4-9': [
        { year: 1926, name: 'Hugh Hefner', description: 'Playboy magazine founder' },
        { year: 1932, name: 'Carl Perkins', description: 'Rockabilly pioneer (Blue Suede Shoes)' },
        { year: 1966, name: 'Cynthia Nixon', description: 'Actress (Sex and the City)' },
        { year: 1990, name: 'Kristen Stewart', description: 'Actress (Twilight)' },
    ],
    '4-10': [
        { year: 1847, name: 'Joseph Pulitzer', description: 'Publisher, created Pulitzer Prize' },
        { year: 1921, name: 'Chuck Connors', description: 'Actor and baseball player' },
        { year: 1932, name: 'Omar Sharif', description: 'Actor (Lawrence of Arabia)' },
    ],
    '4-11': [
        { year: 1893, name: 'Dean Acheson', description: 'Secretary of State, Cold War architect' },
        { year: 1928, name: 'Ethel Kennedy', description: 'Human rights advocate' },
    ],
    '4-12': [
        { year: 1777, name: 'Henry Clay', description: 'The Great Compromiser, U.S. Senator' },
        { year: 1947, name: 'David Letterman', description: 'Legendary late night TV host' },
        { year: 1971, name: 'Shannen Doherty', description: 'Actress (Beverly Hills, 90210)' },
    ],
    '4-13': [
        { year: 1743, name: 'Thomas Jefferson', description: 'Third U.S. President, Declaration author' },
        { year: 1850, name: 'J.P. Morgan', description: 'Banking titan, financier' },
        { year: 1963, name: 'Garry Kasparov', description: 'Chess grandmaster' },
    ],
    '4-14': [
        { year: 1866, name: 'Anne Sullivan', description: 'Helen Keller\'s teacher' },
        { year: 1941, name: 'Pete Rose', description: 'Baseball\'s all-time hits leader' },
        { year: 1977, name: 'Sarah Michelle Gellar', description: 'Actress (Buffy the Vampire Slayer)' },
    ],
    '4-15': [
        { year: 1452, name: 'Leonardo da Vinci', description: 'Renaissance genius (Mona Lisa)' },
        { year: 1933, name: 'Roy Clark', description: 'Country musician (Hee Haw)' },
        { year: 1959, name: 'Emma Thompson', description: 'Oscar-winning actress' },
    ],
    '4-16': [
        { year: 1867, name: 'Wilbur Wright', description: 'Aviation pioneer (Wright Brothers)' },
        { year: 1889, name: 'Charlie Chaplin', description: 'Silent film legend' },
        { year: 1947, name: 'Kareem Abdul-Jabbar', description: 'NBA all-time scorer' },
    ],
    '4-17': [
        { year: 1897, name: 'Thornton Wilder', description: 'Pulitzer playwright (Our Town)' },
        { year: 1918, name: 'William Holden', description: 'Oscar-winning actor' },
        { year: 1974, name: 'Victoria Beckham', description: 'Spice Girl, fashion designer' },
    ],
    '4-18': [
        { year: 1857, name: 'Clarence Darrow', description: 'Legendary defense attorney' },
        { year: 1946, name: 'Hayley Mills', description: 'Disney child actress (Parent Trap)' },
        { year: 1979, name: 'Kourtney Kardashian', description: 'Media personality' },
    ],
    '4-19': [
        { year: 1903, name: 'Eliot Ness', description: 'FBI agent (The Untouchables)' },
        { year: 1946, name: 'Tim Curry', description: 'Actor (Rocky Horror, IT)' },
        { year: 1978, name: 'James Franco', description: 'Actor and filmmaker' },
        { year: 1987, name: 'Maria Sharapova', description: 'Tennis champion' },
    ],
    '4-20': [
        { year: 1889, name: 'Adolf Hitler', description: 'German dictator, WWII' },
        { year: 1949, name: 'Jessica Lange', description: 'Oscar-winning actress' },
        { year: 1972, name: 'Carmen Electra', description: 'Actress and model' },
    ],
    '4-21': [
        { year: 1816, name: 'Charlotte Brontë', description: 'Author (Jane Eyre)' },
        { year: 1926, name: 'Queen Elizabeth II', description: 'Longest-reigning British monarch' },
        { year: 1958, name: 'Andie MacDowell', description: 'Actress (Groundhog Day, Four Weddings)' },
    ],
    '4-22': [
        { year: 1724, name: 'Immanuel Kant', description: 'Philosopher' },
        { year: 1904, name: 'J. Robert Oppenheimer', description: 'Father of the atomic bomb' },
        { year: 1937, name: 'Jack Nicholson', description: 'Three-time Oscar winner' },
    ],
    '4-23': [
        { year: 1564, name: 'William Shakespeare', description: 'The Bard — greatest writer in English' },
        { year: 1791, name: 'James Buchanan', description: '15th U.S. President' },
        { year: 1928, name: 'Shirley Temple', description: 'Child actress and diplomat' },
        { year: 1942, name: 'Sandra Dee', description: 'Actress (Gidget)' },
    ],
    '4-24': [
        { year: 1934, name: 'Shirley MacLaine', description: 'Oscar-winning actress' },
        { year: 1942, name: 'Barbra Streisand', description: 'Singer, actress, director (EGOT winner)' },
        { year: 1973, name: 'Sachin Tendulkar', description: 'Cricket legend' },
    ],
    '4-25': [
        { year: 1918, name: 'Ella Fitzgerald', description: 'Queen of Jazz' },
        { year: 1940, name: 'Al Pacino', description: 'Actor (The Godfather, Scarface)' },
        { year: 1969, name: 'Renée Zellweger', description: 'Oscar-winning actress' },
    ],
    '4-26': [
        { year: 1785, name: 'John James Audubon', description: 'Naturalist and bird artist' },
        { year: 1933, name: 'Carol Burnett', description: 'Comedy legend and TV icon' },
        { year: 1980, name: 'Channing Tatum', description: 'Actor (Magic Mike, 21 Jump Street)' },
    ],
    '4-27': [
        { year: 1791, name: 'Samuel Morse', description: 'Inventor of the telegraph' },
        { year: 1822, name: 'Ulysses S. Grant', description: '18th U.S. President, Civil War general' },
        { year: 1932, name: 'Casey Kasem', description: 'Radio host (American Top 40)' },
    ],
    '4-28': [
        { year: 1758, name: 'James Monroe', description: '5th U.S. President (Monroe Doctrine)' },
        { year: 1926, name: 'Harper Lee', description: 'Author (To Kill a Mockingbird)' },
        { year: 1937, name: 'Saddam Hussein', description: 'Iraqi president' },
        { year: 1974, name: 'Penélope Cruz', description: 'Oscar-winning actress' },
    ],
    '4-29': [
        { year: 1863, name: 'William Randolph Hearst', description: 'Newspaper magnate' },
        { year: 1899, name: 'Duke Ellington', description: 'Jazz composer and bandleader' },
        { year: 1954, name: 'Jerry Seinfeld', description: 'Comedian (Seinfeld)' },
        { year: 1970, name: 'Andre Agassi', description: 'Tennis champion' },
        { year: 1980, name: 'Kim Kardashian', description: 'Media mogul and businesswoman' },
    ],
    '4-30': [
        { year: 1777, name: 'Carl Friedrich Gauss', description: 'Mathematician genius' },
        { year: 1933, name: 'Willie Nelson', description: 'Country music legend' },
        { year: 1982, name: 'Kirsten Dunst', description: 'Actress (Spider-Man, Marie Antoinette)' },
    ],
    // MAY
    '5-1': [
        { year: 1769, name: 'Duke of Wellington', description: 'British general, defeated Napoleon' },
        { year: 1916, name: 'Glenn Ford', description: 'Actor (Gilda, Superman)' },
        { year: 1975, name: 'Wes Welker', description: 'NFL wide receiver' },
    ],
    '5-2': [
        { year: 1903, name: 'Dr. Benjamin Spock', description: 'Baby and childcare expert' },
        { year: 1972, name: 'Dwayne "The Rock" Johnson', description: 'Actor, wrestler, superstar' },
        { year: 1975, name: 'David Beckham', description: 'Soccer icon and businessman' },
    ],
    '5-3': [
        { year: 1469, name: 'Niccolò Machiavelli', description: 'Political philosopher (The Prince)' },
        { year: 1898, name: 'Golda Meir', description: 'Prime Minister of Israel' },
        { year: 1933, name: 'James Brown', description: 'Godfather of Soul' },
    ],
    '5-4': [
        { year: 1929, name: 'Audrey Hepburn', description: 'Iconic actress (Breakfast at Tiffany\'s)' },
        { year: 1959, name: 'Randy Travis', description: 'Country music singer' },
    ],
    '5-5': [
        { year: 1818, name: 'Karl Marx', description: 'Philosopher and economist' },
        { year: 1988, name: 'Adele', description: 'Grammy-winning singer (Hello, Rolling in the Deep)' },
    ],
    '5-6': [
        { year: 1856, name: 'Sigmund Freud', description: 'Father of psychoanalysis' },
        { year: 1895, name: 'Rudolph Valentino', description: 'Silent film heartthrob' },
        { year: 1961, name: 'George Clooney', description: 'Actor and filmmaker' },
    ],
    '5-7': [
        { year: 1833, name: 'Johannes Brahms', description: 'Classical composer' },
        { year: 1840, name: 'Pyotr Tchaikovsky', description: 'Composer (Nutcracker, Swan Lake)' },
        { year: 1901, name: 'Gary Cooper', description: 'Oscar-winning actor (High Noon)' },
    ],
    '5-8': [
        { year: 1884, name: 'Harry S. Truman', description: '33rd U.S. President' },
        { year: 1926, name: 'Don Rickles', description: 'Comedian and actor' },
        { year: 1975, name: 'Enrique Iglesias', description: 'Latin pop singer' },
    ],
    '5-9': [
        { year: 1800, name: 'John Brown', description: 'Abolitionist' },
        { year: 1936, name: 'Albert Finney', description: 'Actor (Annie, Erin Brockovich)' },
        { year: 1949, name: 'Billy Joel', description: 'Piano Man, pop-rock legend' },
    ],
    '5-10': [
        { year: 1899, name: 'Fred Astaire', description: 'Legendary dancer and actor' },
        { year: 1960, name: 'Bono', description: 'U2 lead singer' },
    ],
    '5-11': [
        { year: 1888, name: 'Irving Berlin', description: 'Songwriter (God Bless America, White Christmas)' },
        { year: 1904, name: 'Salvador Dalí', description: 'Surrealist painter' },
    ],
    '5-12': [
        { year: 1820, name: 'Florence Nightingale', description: 'Founder of modern nursing' },
        { year: 1907, name: 'Katharine Hepburn', description: 'Four-time Oscar-winning actress' },
        { year: 1937, name: 'George Carlin', description: 'Legendary stand-up comedian' },
    ],
    '5-13': [
        { year: 1842, name: 'Arthur Sullivan', description: 'Composer (Gilbert & Sullivan)' },
        { year: 1950, name: 'Stevie Wonder', description: 'Musical genius, 25 Grammys' },
        { year: 1986, name: 'Robert Pattinson', description: 'Actor (Twilight, The Batman)' },
    ],
    '5-14': [
        { year: 1944, name: 'George Lucas', description: 'Star Wars creator, filmmaker' },
        { year: 1969, name: 'Cate Blanchett', description: 'Oscar-winning actress' },
        { year: 1984, name: 'Mark Zuckerberg', description: 'Facebook/Meta founder, billionaire' },
    ],
    '5-15': [
        { year: 1859, name: 'L. Frank Baum', description: 'Author (The Wizard of Oz)' },
        { year: 1987, name: 'Andy Murray', description: 'Tennis champion' },
    ],
    '5-16': [
        { year: 1905, name: 'Henry Fonda', description: 'Oscar-winning actor' },
        { year: 1919, name: 'Liberace', description: 'Flamboyant pianist and entertainer' },
        { year: 1953, name: 'Pierce Brosnan', description: 'Actor (James Bond)' },
        { year: 1966, name: 'Janet Jackson', description: 'Pop and R&B icon' },
        { year: 1973, name: 'Tori Spelling', description: 'Actress (Beverly Hills, 90210)' },
    ],
    '5-17': [
        { year: 1866, name: 'Erik Satie', description: 'French composer' },
        { year: 1956, name: 'Sugar Ray Leonard', description: 'Boxing champion' },
    ],
    '5-18': [
        { year: 1897, name: 'Frank Capra', description: 'Director (It\'s a Wonderful Life)' },
        { year: 1912, name: 'Perry Como', description: 'Singer and TV personality' },
        { year: 1969, name: 'Martika', description: 'Singer (Toy Soldiers)' },
        { year: 1970, name: 'Tina Fey', description: 'Comedian, writer (30 Rock, Mean Girls)' },
    ],
    '5-19': [
        { year: 1925, name: 'Malcolm X', description: 'Civil rights activist' },
        { year: 1952, name: 'Grace Jones', description: 'Singer, model, actress' },
    ],
    '5-20': [
        { year: 1908, name: 'Jimmy Stewart', description: 'Oscar-winning actor (It\'s a Wonderful Life)' },
        { year: 1946, name: 'Cher', description: 'Singer, actress, icon (EGOT contender)' },
    ],
    '5-21': [
        { year: 1844, name: 'Henri Rousseau', description: 'Post-Impressionist painter' },
        { year: 1904, name: 'Fats Waller', description: 'Jazz pianist and entertainer' },
        { year: 1952, name: 'Mr. T', description: 'Actor (The A-Team, Rocky III)' },
    ],
    '5-22': [
        { year: 1813, name: 'Richard Wagner', description: 'Opera composer' },
        { year: 1859, name: 'Arthur Conan Doyle', description: 'Creator of Sherlock Holmes' },
        { year: 1987, name: 'Novak Djokovic', description: 'Tennis GOAT contender' },
    ],
    '5-23': [
        { year: 1810, name: 'Margaret Fuller', description: 'Women\'s rights pioneer and journalist' },
        { year: 1958, name: 'Drew Carey', description: 'Comedian and game show host' },
    ],
    '5-24': [
        { year: 1819, name: 'Queen Victoria', description: 'British monarch (Victorian era)' },
        { year: 1941, name: 'Bob Dylan', description: 'Nobel Prize singer-songwriter' },
    ],
    '5-25': [
        { year: 1803, name: 'Ralph Waldo Emerson', description: 'Transcendentalist writer and poet' },
        { year: 1926, name: 'Miles Davis', description: 'Jazz trumpet legend' },
        { year: 1969, name: 'Anne Heche', description: 'Actress (Six Days Seven Nights)' },
        { year: 1986, name: 'Laurie Hernandez', description: 'Olympic gold medalist gymnast' },
    ],
    '5-26': [
        { year: 1886, name: 'Al Jolson', description: 'Entertainer, first talkie film star' },
        { year: 1907, name: 'John Wayne', description: 'American film icon (True Grit)' },
        { year: 1964, name: 'Lenny Kravitz', description: 'Rock musician' },
    ],
    '5-27': [
        { year: 1911, name: 'Vincent Price', description: 'Horror film legend' },
        { year: 1912, name: 'Sam Snead', description: 'PGA golf legend' },
        { year: 1922, name: 'Christopher Lee', description: 'Actor (Dracula, Lord of the Rings)' },
    ],
    '5-28': [
        { year: 1888, name: 'Jim Thorpe', description: 'Greatest athlete of the 20th century' },
        { year: 1908, name: 'Ian Fleming', description: 'Author and creator of James Bond' },
        { year: 1968, name: 'Kylie Minogue', description: 'Pop princess' },
    ],
    '5-29': [
        { year: 1903, name: 'Bob Hope', description: 'Comedy legend and entertainer' },
        { year: 1917, name: 'John F. Kennedy', description: '35th U.S. President' },
    ],
    '5-30': [
        { year: 1908, name: 'Mel Blanc', description: 'Voice of Bugs Bunny, Daffy Duck' },
        { year: 1909, name: 'Benny Goodman', description: 'King of Swing' },
        { year: 1964, name: 'Wynonna Judd', description: 'Country music star' },
    ],
    '5-31': [
        { year: 1819, name: 'Walt Whitman', description: 'American poet (Leaves of Grass)' },
        { year: 1930, name: 'Clint Eastwood', description: 'Actor and director (Unforgiven)' },
        { year: 1965, name: 'Brooke Shields', description: 'Actress and model' },
    ],
    // JUNE
    '6-1': [
        { year: 1926, name: 'Marilyn Monroe', description: 'Iconic actress and cultural legend' },
        { year: 1937, name: 'Morgan Freeman', description: 'Oscar-winning actor' },
        { year: 1974, name: 'Alanis Morissette', description: 'Singer-songwriter (Jagged Little Pill)' },
    ],
    '6-2': [
        { year: 1740, name: 'Marquis de Sade', description: 'French writer' },
        { year: 1906, name: 'Josephine Baker', description: 'Entertainer and civil rights activist' },
        { year: 1941, name: 'Charlie Watts', description: 'Rolling Stones drummer' },
    ],
    '6-3': [
        { year: 1808, name: 'Jefferson Davis', description: 'Confederate president' },
        { year: 1926, name: 'Allen Ginsberg', description: 'Beat poet (Howl)' },
        { year: 1986, name: 'Rafael Nadal', description: 'Tennis legend (22 Grand Slams)' },
    ],
    '6-4': [
        { year: 1975, name: 'Angelina Jolie', description: 'Oscar-winning actress and humanitarian' },
        { year: 1985, name: 'Evan Spiegel', description: 'Snap Inc./Snapchat CEO' },
    ],
    '6-5': [
        { year: 1718, name: 'Thomas Chippendale', description: 'Master furniture maker' },
        { year: 1883, name: 'John Maynard Keynes', description: 'Economist' },
        { year: 1971, name: 'Mark Wahlberg', description: 'Actor (The Fighter, Ted)' },
    ],
    '6-6': [
        { year: 1599, name: 'Diego Velázquez', description: 'Spanish painter' },
        { year: 1956, name: 'Björn Borg', description: 'Tennis champion' },
    ],
    '6-7': [
        { year: 1848, name: 'Paul Gauguin', description: 'Post-Impressionist painter' },
        { year: 1917, name: 'Dean Martin', description: 'Singer, actor, entertainer (Rat Pack)' },
        { year: 1940, name: 'Tom Jones', description: 'Singer (It\'s Not Unusual)' },
        { year: 1958, name: 'Prince', description: 'Musical genius (Purple Rain)' },
    ],
    '6-8': [
        { year: 1867, name: 'Frank Lloyd Wright', description: 'Legendary American architect' },
        { year: 1955, name: 'Tim Berners-Lee', description: 'Inventor of the World Wide Web' },
        { year: 1977, name: 'Kanye West', description: 'Rapper, producer, fashion designer' },
    ],
    '6-9': [
        { year: 1961, name: 'Michael J. Fox', description: 'Actor (Back to the Future)' },
        { year: 1963, name: 'Johnny Depp', description: 'Actor (Pirates of the Caribbean)' },
        { year: 1981, name: 'Natalie Portman', description: 'Oscar-winning actress (Black Swan)' },
    ],
    '6-10': [
        { year: 1880, name: 'Jeannette Rankin', description: 'First woman in U.S. Congress' },
        { year: 1922, name: 'Judy Garland', description: 'Actress and singer (Wizard of Oz)' },
        { year: 1965, name: 'Elizabeth Hurley', description: 'Actress and model' },
    ],
    '6-11': [
        { year: 1880, name: 'Jeannette Rankin', description: 'First woman in U.S. Congress' },
        { year: 1933, name: 'Gene Wilder', description: 'Actor (Willy Wonka, Young Frankenstein)' },
        { year: 1959, name: 'Hugh Laurie', description: 'Actor (House M.D.)' },
        { year: 1969, name: 'Peter Dinklage', description: 'Actor (Game of Thrones)' },
    ],
    '6-12': [
        { year: 1924, name: 'George H.W. Bush', description: '41st U.S. President' },
        { year: 1929, name: 'Anne Frank', description: 'Holocaust diarist' },
    ],
    '6-13': [
        { year: 1892, name: 'Basil Rathbone', description: 'Actor (Sherlock Holmes)' },
        { year: 1986, name: 'Mary-Kate and Ashley Olsen', description: 'Actresses and fashion designers' },
        { year: 1981, name: 'Chris Evans', description: 'Actor (Captain America)' },
    ],
    '6-14': [
        { year: 1811, name: 'Harriet Beecher Stowe', description: 'Author (Uncle Tom\'s Cabin)' },
        { year: 1946, name: 'Donald Trump', description: '45th and 47th U.S. President' },
        { year: 1969, name: 'Steffi Graf', description: 'Tennis legend (Golden Slam)' },
    ],
    '6-15': [
        { year: 1843, name: 'Edvard Grieg', description: 'Norwegian composer' },
        { year: 1964, name: 'Courteney Cox', description: 'Actress (Friends)' },
        { year: 1969, name: 'Ice Cube', description: 'Rapper and actor (Friday, NWA)' },
        { year: 1987, name: 'Tim Lincecum', description: 'MLB Cy Young pitcher' },
    ],
    '6-16': [
        { year: 1890, name: 'Stan Laurel', description: 'Comedian (Laurel & Hardy)' },
        { year: 1971, name: 'Tupac Shakur', description: 'Legendary rapper and cultural icon' },
    ],
    '6-17': [
        { year: 1882, name: 'Igor Stravinsky', description: 'Composer (Rite of Spring)' },
        { year: 1945, name: 'Ken Livingstone', description: 'British politician' },
        { year: 1980, name: 'Venus Williams', description: 'Tennis champion, 7 Grand Slams' },
    ],
    '6-18': [
        { year: 1942, name: 'Paul McCartney', description: 'Beatle, singer-songwriter legend' },
        { year: 1952, name: 'Isabella Rossellini', description: 'Actress and model' },
    ],
    '6-19': [
        { year: 1623, name: 'Blaise Pascal', description: 'Mathematician and philosopher' },
        { year: 1903, name: 'Lou Gehrig', description: 'Baseball\'s Iron Horse' },
        { year: 1978, name: 'Dirk Nowitzki', description: 'NBA legend (Dallas Mavericks)' },
    ],
    '6-20': [
        { year: 1905, name: 'Lillian Hellman', description: 'Playwright' },
        { year: 1942, name: 'Brian Wilson', description: 'Beach Boys genius' },
        { year: 1967, name: 'Nicole Kidman', description: 'Oscar-winning actress' },
    ],
    '6-21': [
        { year: 1905, name: 'Jean-Paul Sartre', description: 'Philosopher and author' },
        { year: 1953, name: 'Benazir Bhutto', description: 'First female PM of Pakistan' },
        { year: 1982, name: 'Prince William', description: 'Prince of Wales' },
    ],
    '6-22': [
        { year: 1903, name: 'John Dillinger', description: 'Famous bank robber' },
        { year: 1949, name: 'Meryl Streep', description: 'Most Oscar-nominated actress ever' },
        { year: 1964, name: 'Dan Brown', description: 'Author (The Da Vinci Code)' },
    ],
    '6-23': [
        { year: 1894, name: 'Duke of Windsor', description: 'King who abdicated for love' },
        { year: 1912, name: 'Alan Turing', description: 'Computer science father, codebreaker' },
        { year: 1972, name: 'Selma Blair', description: 'Actress (Cruel Intentions)' },
    ],
    '6-24': [
        { year: 1842, name: 'Ambrose Bierce', description: 'Author and journalist' },
        { year: 1895, name: 'Jack Dempsey', description: 'Heavyweight boxing champion' },
        { year: 1987, name: 'Lionel Messi', description: 'Soccer GOAT' },
    ],
    '6-25': [
        { year: 1903, name: 'George Orwell', description: 'Author (1984, Animal Farm)' },
        { year: 1963, name: 'George Michael', description: 'Pop singer (Faith, Wham!)' },
    ],
    '6-26': [
        { year: 1819, name: 'Abner Doubleday', description: 'Credited with inventing baseball' },
        { year: 1892, name: 'Pearl S. Buck', description: 'Nobel Prize author (The Good Earth)' },
        { year: 1993, name: 'Ariana Grande', description: 'Pop singer' },
    ],
    '6-27': [
        { year: 1846, name: 'Charles Stewart Parnell', description: 'Irish political leader' },
        { year: 1880, name: 'Helen Keller', description: 'Author, activist, first deaf-blind graduate' },
        { year: 1975, name: 'Tobey Maguire', description: 'Actor (Spider-Man)' },
    ],
    '6-28': [
        { year: 1491, name: 'Henry VIII', description: 'King of England (six wives)' },
        { year: 1926, name: 'Mel Brooks', description: 'Comedy filmmaker (Blazing Saddles)' },
        { year: 1966, name: 'John Cusack', description: 'Actor (Say Anything, High Fidelity)' },
        { year: 1971, name: 'Elon Musk', description: 'Tesla and SpaceX CEO, tech billionaire' },
    ],
    '6-29': [
        { year: 1900, name: 'Antoine de Saint-Exupéry', description: 'Author (The Little Prince)' },
        { year: 1919, name: 'Slim Pickens', description: 'Actor (Dr. Strangelove)' },
    ],
    '6-30': [
        { year: 1917, name: 'Lena Horne', description: 'Singer and actress' },
        { year: 1966, name: 'Mike Tyson', description: 'Youngest heavyweight champion ever' },
        { year: 1985, name: 'Michael Phelps', description: 'Most decorated Olympian (23 golds)' },
    ],
    // JULY
    '7-1': [
        { year: 1899, name: 'Charles Laughton', description: 'Oscar-winning actor' },
        { year: 1952, name: 'Dan Aykroyd', description: 'Comedian (Blues Brothers, Ghostbusters)' },
        { year: 1961, name: 'Princess Diana', description: 'Princess of Wales, the People\'s Princess' },
        { year: 1967, name: 'Pamela Anderson', description: 'Actress (Baywatch)' },
    ],
    '7-2': [
        { year: 1877, name: 'Hermann Hesse', description: 'Nobel Prize author (Steppenwolf)' },
        { year: 1908, name: 'Thurgood Marshall', description: 'First Black Supreme Court Justice' },
        { year: 1986, name: 'Lindsay Lohan', description: 'Actress (Mean Girls, Parent Trap)' },
    ],
    '7-3': [
        { year: 1883, name: 'Franz Kafka', description: 'Author (The Metamorphosis)' },
        { year: 1962, name: 'Tom Cruise', description: 'Actor (Top Gun, Mission Impossible)' },
    ],
    '7-4': [
        { year: 1804, name: 'Nathaniel Hawthorne', description: 'Novelist (The Scarlet Letter)' },
        { year: 1872, name: 'Calvin Coolidge', description: '30th U.S. President' },
        { year: 1927, name: 'Neil Simon', description: 'Broadway playwright' },
    ],
    '7-5': [
        { year: 1810, name: 'P.T. Barnum', description: 'Circus showman "The Greatest Showman"' },
        { year: 1951, name: 'Huey Lewis', description: 'Singer (Huey Lewis and the News)' },
    ],
    '7-6': [
        { year: 1907, name: 'Frida Kahlo', description: 'Mexican artist, cultural icon' },
        { year: 1946, name: 'Sylvester Stallone', description: 'Actor (Rocky, Rambo)' },
        { year: 1979, name: 'Kevin Hart', description: 'Comedian and actor' },
    ],
    '7-7': [
        { year: 1860, name: 'Gustav Mahler', description: 'Composer and conductor' },
        { year: 1907, name: 'Robert Heinlein', description: 'Science fiction author' },
        { year: 1940, name: 'Ringo Starr', description: 'Beatles drummer' },
    ],
    '7-8': [
        { year: 1839, name: 'John D. Rockefeller', description: 'America\'s first billionaire, Standard Oil' },
        { year: 1958, name: 'Kevin Bacon', description: 'Actor (Footloose)' },
        { year: 1986, name: 'Sophia Bush', description: 'Actress (One Tree Hill)' },
    ],
    '7-9': [
        { year: 1956, name: 'Tom Hanks', description: 'Two-time Oscar winner, America\'s dad' },
        { year: 1964, name: 'Courtney Love', description: 'Musician (Hole) and actress' },
    ],
    '7-10': [
        { year: 1875, name: 'Mary McLeod Bethune', description: 'Educator and civil rights leader' },
        { year: 1943, name: 'Arthur Ashe', description: 'Tennis champion and activist' },
        { year: 1972, name: 'Sofia Vergara', description: 'Actress (Modern Family)' },
        { year: 1980, name: 'Jessica Simpson', description: 'Singer and fashion mogul' },
    ],
    '7-11': [
        { year: 1767, name: 'John Quincy Adams', description: '6th U.S. President' },
        { year: 1899, name: 'E.B. White', description: 'Author (Charlotte\'s Web)' },
    ],
    '7-12': [
        { year: 1817, name: 'Henry David Thoreau', description: 'Author (Walden) and philosopher' },
        { year: 1895, name: 'Oscar Hammerstein II', description: 'Broadway lyricist' },
        { year: 1937, name: 'Bill Cosby', description: 'Comedian and actor' },
        { year: 1993, name: 'Malala Yousafzai', description: 'Nobel laureate, education activist' },
    ],
    '7-13': [
        { year: 1942, name: 'Harrison Ford', description: 'Actor (Indiana Jones, Star Wars)' },
        { year: 1944, name: 'Erno Rubik', description: 'Inventor of the Rubik\'s Cube' },
        { year: 1985, name: 'Guillermo Ochoa', description: 'Soccer goalkeeper' },
    ],
    '7-14': [
        { year: 1913, name: 'Gerald Ford', description: '38th U.S. President' },
        { year: 1918, name: 'Ingmar Bergman', description: 'Legendary film director' },
        { year: 1988, name: 'Conor McGregor', description: 'UFC champion' },
    ],
    '7-15': [
        { year: 1606, name: 'Rembrandt', description: 'Dutch master painter' },
        { year: 1946, name: 'Linda Ronstadt', description: 'Singer (Blue Bayou)' },
        { year: 1961, name: 'Forest Whitaker', description: 'Oscar-winning actor' },
    ],
    '7-16': [
        { year: 1872, name: 'Roald Amundsen', description: 'First to reach the South Pole' },
        { year: 1911, name: 'Ginger Rogers', description: 'Actress and dancer' },
        { year: 1971, name: 'Will Ferrell', description: 'Comedy actor (Elf, Anchorman)' },
    ],
    '7-17': [
        { year: 1899, name: 'James Cagney', description: 'Hollywood tough-guy actor' },
        { year: 1934, name: 'Donald Sutherland', description: 'Actor (M*A*S*H, Hunger Games)' },
        { year: 1954, name: 'Angela Merkel', description: 'German Chancellor' },
    ],
    '7-18': [
        { year: 1811, name: 'William Makepeace Thackeray', description: 'Author (Vanity Fair)' },
        { year: 1918, name: 'Nelson Mandela', description: 'South African president, Nobel laureate' },
        { year: 1967, name: 'Vin Diesel', description: 'Actor (Fast & Furious)' },
    ],
    '7-19': [
        { year: 1834, name: 'Edgar Degas', description: 'Impressionist painter' },
        { year: 1922, name: 'George McGovern', description: 'U.S. Senator and peace advocate' },
    ],
    '7-20': [
        { year: 1938, name: 'Diana Rigg', description: 'Actress (Game of Thrones, Avengers)' },
        { year: 1947, name: 'Carlos Santana', description: 'Guitar legend' },
        { year: 1976, name: 'Benedict Cumberbatch', description: 'Actor (Doctor Strange, Sherlock)' },
    ],
    '7-21': [
        { year: 1899, name: 'Ernest Hemingway', description: 'Nobel/Pulitzer author (Old Man and the Sea)' },
        { year: 1924, name: 'Don Knotts', description: 'Actor (The Andy Griffith Show)' },
        { year: 1948, name: 'Cat Stevens/Yusuf Islam', description: 'Singer-songwriter' },
        { year: 1951, name: 'Robin Williams', description: 'Beloved comedian and actor' },
    ],
    '7-22': [
        { year: 1882, name: 'Edward Hopper', description: 'Iconic American realist painter' },
        { year: 1934, name: 'Louise Fletcher', description: 'Oscar-winning actress (Cuckoo\'s Nest)' },
        { year: 1992, name: 'Selena Gomez', description: 'Singer and actress' },
    ],
    '7-23': [
        { year: 1886, name: 'Raymond Chandler', description: 'Noir detective novelist' },
        { year: 1961, name: 'Woody Harrelson', description: 'Actor (Cheers, True Detective)' },
        { year: 1989, name: 'Daniel Radcliffe', description: 'Actor (Harry Potter)' },
    ],
    '7-24': [
        { year: 1783, name: 'Simón Bolívar', description: 'South American liberator' },
        { year: 1897, name: 'Amelia Earhart', description: 'Aviation pioneer' },
        { year: 1969, name: 'Jennifer Lopez', description: 'Singer, actress, entertainer (J.Lo)' },
    ],
    '7-25': [
        { year: 1844, name: 'Thomas Eakins', description: 'Realist painter' },
        { year: 1967, name: 'Matt LeBlanc', description: 'Actor (Friends)' },
    ],
    '7-26': [
        { year: 1856, name: 'George Bernard Shaw', description: 'Nobel Prize playwright' },
        { year: 1928, name: 'Stanley Kubrick', description: 'Director (2001, The Shining)' },
        { year: 1943, name: 'Mick Jagger', description: 'Rolling Stones frontman' },
        { year: 1964, name: 'Sandra Bullock', description: 'Oscar-winning actress' },
    ],
    '7-27': [
        { year: 1922, name: 'Norman Lear', description: 'TV producer (All in the Family)' },
        { year: 1940, name: 'Bugs Bunny (debut)', description: 'Cartoon icon (Warner Bros.)' },
        { year: 1948, name: 'Betty Thomas', description: 'Emmy-winning actress and director' },
    ],
    '7-28': [
        { year: 1866, name: 'Beatrix Potter', description: 'Author (Peter Rabbit)' },
        { year: 1929, name: 'Jacqueline Kennedy Onassis', description: 'First Lady, style icon' },
    ],
    '7-29': [
        { year: 1869, name: 'Booth Tarkington', description: 'Pulitzer Prize novelist' },
        { year: 1883, name: 'Benito Mussolini', description: 'Italian dictator' },
        { year: 1981, name: 'Fernando Alonso', description: 'Formula 1 racing champion' },
    ],
    '7-30': [
        { year: 1818, name: 'Emily Brontë', description: 'Author (Wuthering Heights)' },
        { year: 1863, name: 'Henry Ford', description: 'Ford Motor Company founder' },
        { year: 1947, name: 'Arnold Schwarzenegger', description: 'Actor, bodybuilder, CA governor' },
        { year: 1963, name: 'Lisa Kudrow', description: 'Actress (Friends)' },
    ],
    '7-31': [
        { year: 1912, name: 'Milton Friedman', description: 'Nobel Prize economist' },
        { year: 1919, name: 'Primo Levi', description: 'Holocaust survivor and author' },
        { year: 1965, name: 'J.K. Rowling', description: 'Author (Harry Potter)' },
    ],
    // AUGUST
    '8-1': [
        { year: 1779, name: 'Francis Scott Key', description: 'Wrote the Star-Spangled Banner' },
        { year: 1819, name: 'Herman Melville', description: 'Author (Moby-Dick)' },
        { year: 1936, name: 'Yves Saint Laurent', description: 'Fashion designer' },
        { year: 1942, name: 'Jerry Garcia', description: 'Grateful Dead frontman' },
    ],
    '8-2': [
        { year: 1924, name: 'James Baldwin', description: 'Author and civil rights activist' },
        { year: 1932, name: 'Peter O\'Toole', description: 'Actor (Lawrence of Arabia)' },
    ],
    '8-3': [
        { year: 1900, name: 'Ernie Pyle', description: 'WWII war correspondent' },
        { year: 1926, name: 'Tony Bennett', description: 'Legendary singer (I Left My Heart in San Francisco)' },
        { year: 1977, name: 'Tom Brady', description: 'NFL GOAT, 7 Super Bowl wins' },
    ],
    '8-4': [
        { year: 1901, name: 'Louis Armstrong', description: 'Jazz trumpet legend (What a Wonderful World)' },
        { year: 1961, name: 'Barack Obama', description: '44th U.S. President, first Black president' },
    ],
    '8-5': [
        { year: 1850, name: 'Guy de Maupassant', description: 'French short story master' },
        { year: 1930, name: 'Neil Armstrong', description: 'First man on the Moon' },
        { year: 1962, name: 'Patrick Ewing', description: 'NBA Hall of Famer' },
    ],
    '8-6': [
        { year: 1809, name: 'Alfred, Lord Tennyson', description: 'Poet laureate' },
        { year: 1911, name: 'Lucille Ball', description: 'Comedy pioneer (I Love Lucy)' },
        { year: 1928, name: 'Andy Warhol', description: 'Pop art icon' },
    ],
    '8-7': [
        { year: 1876, name: 'Mata Hari', description: 'Exotic dancer and alleged spy' },
        { year: 1942, name: 'Garrison Keillor', description: 'Author and radio host (Prairie Home)' },
        { year: 1975, name: 'Charlize Theron', description: 'Oscar-winning actress' },
    ],
    '8-8': [
        { year: 1937, name: 'Dustin Hoffman', description: 'Oscar-winning actor (Rain Man)' },
        { year: 1981, name: 'Roger Federer', description: 'Tennis legend (20 Grand Slams)' },
    ],
    '8-9': [
        { year: 1963, name: 'Whitney Houston', description: 'The Voice — pop/R&B diva' },
        { year: 1968, name: 'Gillian Anderson', description: 'Actress (The X-Files)' },
    ],
    '8-10': [
        { year: 1874, name: 'Herbert Hoover', description: '31st U.S. President' },
        { year: 1960, name: 'Antonio Banderas', description: 'Actor (Mask of Zorro)' },
    ],
    '8-11': [
        { year: 1921, name: 'Alex Haley', description: 'Author (Roots)' },
        { year: 1950, name: 'Steve Wozniak', description: 'Apple co-founder' },
        { year: 1953, name: 'Hulk Hogan', description: 'Wrestling legend' },
    ],
    '8-12': [
        { year: 1881, name: 'Cecil B. DeMille', description: 'Legendary film director' },
        { year: 1971, name: 'Pete Sampras', description: 'Tennis champion (14 Grand Slams)' },
    ],
    '8-13': [
        { year: 1860, name: 'Annie Oakley', description: 'Sharpshooter and Wild West star' },
        { year: 1899, name: 'Alfred Hitchcock', description: 'Master of Suspense director' },
    ],
    '8-14': [
        { year: 1945, name: 'Steve Martin', description: 'Comedian, actor, writer' },
        { year: 1959, name: 'Magic Johnson', description: 'NBA legend (Lakers)' },
        { year: 1966, name: 'Halle Berry', description: 'Oscar-winning actress' },
    ],
    '8-15': [
        { year: 1769, name: 'Napoleon Bonaparte', description: 'French emperor and military genius' },
        { year: 1950, name: 'Princess Anne', description: 'British royal' },
        { year: 1972, name: 'Ben Affleck', description: 'Oscar-winning actor and director' },
    ],
    '8-16': [
        { year: 1954, name: 'James Cameron', description: 'Director (Titanic, Avatar)' },
        { year: 1958, name: 'Madonna', description: 'Queen of Pop' },
    ],
    '8-17': [
        { year: 1786, name: 'Davy Crockett', description: 'American frontiersman and folk hero' },
        { year: 1943, name: 'Robert De Niro', description: 'Oscar-winning actor (Raging Bull, Goodfellas)' },
        { year: 1960, name: 'Sean Penn', description: 'Oscar-winning actor and activist' },
    ],
    '8-18': [
        { year: 1920, name: 'Shelley Winters', description: 'Oscar-winning actress' },
        { year: 1936, name: 'Robert Redford', description: 'Actor, director, Sundance founder' },
        { year: 1969, name: 'Christian Slater', description: 'Actor (Mr. Robot)' },
        { year: 1993, name: 'Maia Mitchell', description: 'Actress (The Fosters)' },
    ],
    '8-19': [
        { year: 1871, name: 'Orville Wright', description: 'Aviation pioneer (Wright Brothers)' },
        { year: 1883, name: 'Coco Chanel', description: 'Fashion icon and designer' },
        { year: 1946, name: 'Bill Clinton', description: '42nd U.S. President' },
    ],
    '8-20': [
        { year: 1942, name: 'Isaac Hayes', description: 'Soul musician (Shaft theme)' },
        { year: 1956, name: 'Joan Allen', description: 'Oscar-nominated actress' },
        { year: 1974, name: 'Amy Adams', description: 'Six-time Oscar-nominated actress' },
    ],
    '8-21': [
        { year: 1904, name: 'Count Basie', description: 'Jazz bandleader' },
        { year: 1936, name: 'Wilt Chamberlain', description: 'NBA legend (100-point game)' },
        { year: 1967, name: 'Carrie-Anne Moss', description: 'Actress (The Matrix)' },
        { year: 1986, name: 'Usain Bolt', description: 'Fastest man alive, Olympic legend' },
    ],
    '8-22': [
        { year: 1862, name: 'Claude Debussy', description: 'Impressionist composer' },
        { year: 1920, name: 'Ray Bradbury', description: 'Sci-fi author (Fahrenheit 451)' },
        { year: 1934, name: 'Norman Schwarzkopf', description: 'Gulf War general' },
    ],
    '8-23': [
        { year: 1912, name: 'Gene Kelly', description: 'Actor and dancer (Singin\' in the Rain)' },
        { year: 1970, name: 'River Phoenix', description: 'Actor (Stand by Me)' },
        { year: 1978, name: 'Kobe Bryant', description: 'NBA legend, 5 championships' },
    ],
    '8-24': [
        { year: 1899, name: 'Jorge Luis Borges', description: 'Argentine author' },
        { year: 1951, name: 'Orson Scott Card', description: 'Author (Ender\'s Game)' },
        { year: 1965, name: 'Marlee Matlin', description: 'Oscar-winning deaf actress' },
        { year: 1981, name: 'Chad Michael Murray', description: 'Actor (One Tree Hill)' },
    ],
    '8-25': [
        { year: 1918, name: 'Leonard Bernstein', description: 'Composer (West Side Story)' },
        { year: 1930, name: 'Sean Connery', description: 'Actor (first James Bond)' },
        { year: 1970, name: 'Claudia Schiffer', description: 'Supermodel' },
    ],
    '8-26': [
        { year: 1740, name: 'Joseph-Michel Montgolfier', description: 'Hot air balloon inventor' },
        { year: 1906, name: 'Albert Sabin', description: 'Polio vaccine developer' },
        { year: 1980, name: 'Macaulay Culkin', description: 'Actor (Home Alone)' },
        { year: 1986, name: 'Dylan O\'Brien', description: 'Actor (Maze Runner)' },
    ],
    '8-27': [
        { year: 1770, name: 'Georg Wilhelm Friedrich Hegel', description: 'Philosopher' },
        { year: 1871, name: 'Theodore Dreiser', description: 'Novelist (Sister Carrie)' },
        { year: 1910, name: 'Mother Teresa', description: 'Nobel Peace Prize humanitarian, saint' },
    ],
    '8-28': [
        { year: 1749, name: 'Johann Wolfgang von Goethe', description: 'German literary genius' },
        { year: 1961, name: 'Jennifer Coolidge', description: 'Actress (White Lotus, Legally Blonde)' },
        { year: 1969, name: 'Jack Black', description: 'Actor and comedian (School of Rock)' },
    ],
    '8-29': [
        { year: 1915, name: 'Ingrid Bergman', description: 'Oscar-winning actress (Casablanca)' },
        { year: 1920, name: 'Charlie Parker', description: 'Jazz saxophone legend' },
        { year: 1958, name: 'Michael Jackson', description: 'The King of Pop' },
    ],
    '8-30': [
        { year: 1797, name: 'Mary Shelley', description: 'Author (Frankenstein)' },
        { year: 1908, name: 'Fred MacMurray', description: 'Actor (My Three Sons)' },
        { year: 1930, name: 'Warren Buffett', description: 'Oracle of Omaha, billionaire investor' },
        { year: 1972, name: 'Cameron Diaz', description: 'Actress (There\'s Something About Mary)' },
    ],
    '8-31': [
        { year: 1870, name: 'Maria Montessori', description: 'Education pioneer (Montessori method)' },
        { year: 1949, name: 'Richard Gere', description: 'Actor (Pretty Woman)' },
    ],
    // SEPTEMBER
    '9-1': [
        { year: 1875, name: 'Edgar Rice Burroughs', description: 'Author (Tarzan)' },
        { year: 1933, name: 'Conway Twitty', description: 'Country music legend' },
        { year: 1957, name: 'Gloria Estefan', description: 'Latin pop queen (Conga)' },
        { year: 1975, name: 'Scott Speedman', description: 'Actor (Felicity)' },
    ],
    '9-2': [
        { year: 1838, name: 'Liliuokalani', description: 'Last queen of Hawaii' },
        { year: 1948, name: 'Terry Bradshaw', description: 'NFL Hall of Fame quarterback' },
        { year: 1964, name: 'Keanu Reeves', description: 'Actor (The Matrix, John Wick)' },
        { year: 1966, name: 'Salma Hayek', description: 'Actress and producer' },
    ],
    '9-3': [
        { year: 1913, name: 'Alan Ladd', description: 'Actor (Shane)' },
        { year: 1965, name: 'Charlie Sheen', description: 'Actor (Two and a Half Men)' },
    ],
    '9-4': [
        { year: 1768, name: 'François-René de Chateaubriand', description: 'French writer' },
        { year: 1981, name: 'Beyoncé', description: 'Queen Bey — singer, actress, icon' },
    ],
    '9-5': [
        { year: 1847, name: 'Jesse James', description: 'Outlaw of the Wild West' },
        { year: 1940, name: 'Raquel Welch', description: 'Actress and sex symbol' },
        { year: 1951, name: 'Michael Keaton', description: 'Actor (Batman, Birdman)' },
    ],
    '9-6': [
        { year: 1757, name: 'Marquis de Lafayette', description: 'French hero of American Revolution' },
        { year: 1860, name: 'Jane Addams', description: 'Social worker, Nobel Peace Prize' },
        { year: 1972, name: 'Idris Elba', description: 'Actor (Luther, Mandela)' },
    ],
    '9-7': [
        { year: 1533, name: 'Elizabeth I', description: 'Queen of England' },
        { year: 1860, name: 'Grandma Moses', description: 'Folk artist' },
        { year: 1936, name: 'Buddy Holly', description: 'Rock and roll pioneer' },
    ],
    '9-8': [
        { year: 1925, name: 'Peter Sellers', description: 'Actor (Pink Panther, Dr. Strangelove)' },
        { year: 1932, name: 'Patsy Cline', description: 'Country music legend (Crazy)' },
        { year: 1979, name: 'Pink', description: 'Pop-rock singer' },
    ],
    '9-9': [
        { year: 1828, name: 'Leo Tolstoy', description: 'Author (War and Peace, Anna Karenina)' },
        { year: 1941, name: 'Otis Redding', description: 'Soul singer (Sittin\' On the Dock of the Bay)' },
        { year: 1960, name: 'Hugh Grant', description: 'Actor (Notting Hill)' },
        { year: 1980, name: 'Michelle Williams', description: 'Oscar-nominated actress' },
    ],
    '9-10': [
        { year: 1892, name: 'Arthur Compton', description: 'Nobel Prize physicist' },
        { year: 1934, name: 'Roger Maris', description: 'Baseball\'s single-season HR king' },
        { year: 1953, name: 'Amy Irving', description: 'Actress' },
    ],
    '9-11': [
        { year: 1862, name: 'O. Henry', description: 'Short story master (Gift of the Magi)' },
        { year: 1913, name: 'Bear Bryant', description: 'Legendary Alabama football coach' },
        { year: 1917, name: 'Jessica Mitford', description: 'Author and journalist' },
    ],
    '9-12': [
        { year: 1888, name: 'Maurice Chevalier', description: 'French entertainer' },
        { year: 1913, name: 'Jesse Owens', description: 'Olympic track legend (1936 Berlin)' },
        { year: 1944, name: 'Barry White', description: 'Soul singer (Can\'t Get Enough)' },
    ],
    '9-13': [
        { year: 1857, name: 'Milton Hershey', description: 'Chocolate empire founder' },
        { year: 1916, name: 'Roald Dahl', description: 'Author (Charlie and the Chocolate Factory)' },
        { year: 1969, name: 'Tyler Perry', description: 'Actor, director, media mogul' },
    ],
    '9-14': [
        { year: 1849, name: 'Ivan Pavlov', description: 'Physiologist (Pavlov\'s dogs)' },
        { year: 1983, name: 'Amy Winehouse', description: 'Grammy-winning singer (Rehab)' },
    ],
    '9-15': [
        { year: 1789, name: 'James Fenimore Cooper', description: 'Author (Last of the Mohicans)' },
        { year: 1890, name: 'Agatha Christie', description: 'Mystery queen (Murder on the Orient Express)' },
        { year: 1984, name: 'Prince Harry', description: 'Duke of Sussex' },
    ],
    '9-16': [
        { year: 1924, name: 'Lauren Bacall', description: 'Hollywood icon (The Big Sleep)' },
        { year: 1925, name: 'B.B. King', description: 'Blues guitar legend (King of the Blues)' },
        { year: 1956, name: 'David Copperfield', description: 'Illusionist and magician' },
    ],
    '9-17': [
        { year: 1730, name: 'Baron von Steuben', description: 'Drilled the Continental Army' },
        { year: 1923, name: 'Hank Williams', description: 'Country music legend' },
    ],
    '9-18': [
        { year: 1709, name: 'Samuel Johnson', description: 'Lexicographer (first English dictionary)' },
        { year: 1905, name: 'Greta Garbo', description: 'Swedish-American film star' },
        { year: 1971, name: 'Lance Armstrong', description: 'Cycling champion' },
        { year: 1971, name: 'Jada Pinkett Smith', description: 'Actress and producer' },
    ],
    '9-19': [
        { year: 1911, name: 'William Golding', description: 'Author (Lord of the Flies)' },
        { year: 1928, name: 'Adam West', description: 'Actor (TV\'s Batman)' },
        { year: 1949, name: 'Twiggy', description: 'Supermodel and cultural icon' },
    ],
    '9-20': [
        { year: 1878, name: 'Upton Sinclair', description: 'Author (The Jungle)' },
        { year: 1934, name: 'Sophia Loren', description: 'Italian film legend' },
    ],
    '9-21': [
        { year: 1866, name: 'H.G. Wells', description: 'Sci-fi author (War of the Worlds)' },
        { year: 1931, name: 'Larry Hagman', description: 'Actor (Dallas)' },
        { year: 1947, name: 'Stephen King', description: 'Master of horror (IT, The Shining)' },
        { year: 1950, name: 'Bill Murray', description: 'Comedy legend (Ghostbusters, Groundhog Day)' },
    ],
    '9-22': [
        { year: 1791, name: 'Michael Faraday', description: 'Pioneering physicist' },
        { year: 1958, name: 'Andrea Bocelli', description: 'Opera tenor' },
        { year: 1976, name: 'Ronaldo (R9)', description: 'Brazilian soccer legend' },
    ],
    '9-23': [
        { year: 1838, name: 'Victoria Woodhull', description: 'First woman to run for president' },
        { year: 1920, name: 'Mickey Rooney', description: 'Actor (longest career in Hollywood)' },
        { year: 1930, name: 'Ray Charles', description: 'Genius of soul, R&B, and blues' },
        { year: 1949, name: 'Bruce Springsteen', description: 'The Boss — rock icon' },
    ],
    '9-24': [
        { year: 1896, name: 'F. Scott Fitzgerald', description: 'Author (The Great Gatsby)' },
        { year: 1936, name: 'Jim Henson', description: 'Muppets creator' },
    ],
    '9-25': [
        { year: 1897, name: 'William Faulkner', description: 'Nobel Prize author' },
        { year: 1944, name: 'Michael Douglas', description: 'Oscar-winning actor' },
        { year: 1968, name: 'Will Smith', description: 'Actor and rapper (Fresh Prince)' },
        { year: 1969, name: 'Catherine Zeta-Jones', description: 'Oscar-winning actress' },
    ],
    '9-26': [
        { year: 1888, name: 'T.S. Eliot', description: 'Nobel Prize poet (The Waste Land)' },
        { year: 1898, name: 'George Gershwin', description: 'Composer (Rhapsody in Blue)' },
        { year: 1981, name: 'Serena Williams', description: 'Tennis GOAT, 23 Grand Slams' },
    ],
    '9-27': [
        { year: 1722, name: 'Samuel Adams', description: 'Founding Father, patriot brewer' },
        { year: 1943, name: 'Meat Loaf', description: 'Rock singer (Bat Out of Hell)' },
        { year: 1972, name: 'Gwyneth Paltrow', description: 'Oscar-winning actress, Goop founder' },
        { year: 1984, name: 'Avril Lavigne', description: 'Pop-punk singer' },
    ],
    '9-28': [
        { year: 1836, name: 'Thomas Crapper', description: 'Plumbing pioneer' },
        { year: 1934, name: 'Brigitte Bardot', description: 'French actress and activist' },
        { year: 1987, name: 'Hilary Duff', description: 'Actress and singer (Lizzie McGuire)' },
    ],
    '9-29': [
        { year: 1547, name: 'Miguel de Cervantes', description: 'Author (Don Quixote)' },
        { year: 1907, name: 'Gene Autry', description: 'Singing cowboy' },
        { year: 1942, name: 'Madeline Kahn', description: 'Actress (Blazing Saddles)' },
        { year: 1988, name: 'Kevin Durant', description: 'NBA scoring champion' },
    ],
    '9-30': [
        { year: 1924, name: 'Truman Capote', description: 'Author (In Cold Blood, Breakfast at Tiffany\'s)' },
        { year: 1928, name: 'Elie Wiesel', description: 'Nobel laureate Holocaust survivor' },
    ],
    // OCTOBER
    '10-1': [
        { year: 1924, name: 'Jimmy Carter', description: '39th U.S. President, Nobel Peace Prize' },
        { year: 1935, name: 'Julie Andrews', description: 'Actress (Mary Poppins, Sound of Music)' },
    ],
    '10-2': [
        { year: 1869, name: 'Mahatma Gandhi', description: 'Indian independence leader' },
        { year: 1890, name: 'Groucho Marx', description: 'Comedy legend (Marx Brothers)' },
        { year: 1951, name: 'Sting', description: 'Singer (The Police, solo career)' },
    ],
    '10-3': [
        { year: 1900, name: 'Thomas Wolfe', description: 'Novelist (Look Homeward, Angel)' },
        { year: 1938, name: 'Eddie Cochran', description: 'Rockabilly pioneer' },
        { year: 1969, name: 'Gwen Stefani', description: 'Singer (No Doubt) and fashion designer' },
    ],
    '10-4': [
        { year: 1822, name: 'Rutherford B. Hayes', description: '19th U.S. President' },
        { year: 1924, name: 'Charlton Heston', description: 'Actor (Ben-Hur, Ten Commandments)' },
        { year: 1946, name: 'Susan Sarandon', description: 'Oscar-winning actress' },
    ],
    '10-5': [
        { year: 1829, name: 'Chester A. Arthur', description: '21st U.S. President' },
        { year: 1951, name: 'Bob Geldof', description: 'Musician and Live Aid organizer' },
        { year: 1975, name: 'Kate Winslet', description: 'Oscar-winning actress (Titanic)' },
    ],
    '10-6': [
        { year: 1846, name: 'George Westinghouse', description: 'Inventor and industrialist' },
        { year: 1942, name: 'Britt Ekland', description: 'Swedish actress' },
    ],
    '10-7': [
        { year: 1931, name: 'Desmond Tutu', description: 'Nobel Peace Prize, anti-apartheid leader' },
        { year: 1951, name: 'John Mellencamp', description: 'Rock singer (Jack & Diane)' },
        { year: 1967, name: 'Toni Braxton', description: 'R&B singer (Un-Break My Heart)' },
    ],
    '10-8': [
        { year: 1941, name: 'Jesse Jackson', description: 'Civil rights leader and politician' },
        { year: 1970, name: 'Matt Damon', description: 'Oscar-winning actor (Good Will Hunting)' },
        { year: 1985, name: 'Bruno Mars', description: 'Pop and R&B superstar' },
    ],
    '10-9': [
        { year: 1835, name: 'Camille Saint-Saëns', description: 'Composer (Carnival of the Animals)' },
        { year: 1940, name: 'John Lennon', description: 'Beatle, peace activist, music legend' },
    ],
    '10-10': [
        { year: 1930, name: 'Harold Pinter', description: 'Nobel Prize playwright' },
        { year: 1946, name: 'Ben Vereen', description: 'Actor and dancer' },
        { year: 1969, name: 'Brett Favre', description: 'NFL Hall of Fame quarterback' },
    ],
    '10-11': [
        { year: 1844, name: 'Henry J. Heinz', description: 'Heinz ketchup founder' },
        { year: 1884, name: 'Eleanor Roosevelt', description: 'First Lady and humanitarian icon' },
        { year: 1962, name: 'Joan Cusack', description: 'Actress (Addams Family Values)' },
    ],
    '10-12': [
        { year: 1935, name: 'Luciano Pavarotti', description: 'Opera\'s greatest tenor' },
        { year: 1968, name: 'Hugh Jackman', description: 'Actor (Wolverine, The Greatest Showman)' },
    ],
    '10-13': [
        { year: 1925, name: 'Margaret Thatcher', description: 'British Prime Minister, Iron Lady' },
        { year: 1941, name: 'Paul Simon', description: 'Singer-songwriter (Simon & Garfunkel)' },
        { year: 1969, name: 'Nancy Kerrigan', description: 'Olympic figure skating medalist' },
    ],
    '10-14': [
        { year: 1890, name: 'Dwight D. Eisenhower', description: '34th U.S. President, WWII general' },
        { year: 1927, name: 'Roger Moore', description: 'Actor (James Bond)' },
        { year: 1980, name: 'Usher', description: 'R&B singer (Yeah!, Confessions)' },
    ],
    '10-15': [
        { year: 1844, name: 'Friedrich Nietzsche', description: 'Philosopher' },
        { year: 1924, name: 'Lee Iacocca', description: 'Auto industry legend (Ford, Chrysler)' },
        { year: 1959, name: 'Sarah Ferguson', description: 'Duchess of York' },
    ],
    '10-16': [
        { year: 1854, name: 'Oscar Wilde', description: 'Playwright and wit' },
        { year: 1925, name: 'Angela Lansbury', description: 'Actress (Murder, She Wrote)' },
        { year: 1958, name: 'Tim Robbins', description: 'Oscar-winning actor (Shawshank)' },
    ],
    '10-17': [
        { year: 1915, name: 'Arthur Miller', description: 'Playwright (Death of a Salesman)' },
        { year: 1938, name: 'Evel Knievel', description: 'Daredevil stuntman' },
        { year: 1972, name: 'Eminem', description: 'Rap god (8 Mile, Lose Yourself)' },
    ],
    '10-18': [
        { year: 1926, name: 'Chuck Berry', description: 'Father of Rock and Roll' },
        { year: 1956, name: 'Martina Navratilova', description: 'Tennis legend (18 singles Grand Slams)' },
        { year: 1960, name: 'Jean-Claude Van Damme', description: 'Action movie star' },
        { year: 1987, name: 'Zac Efron', description: 'Actor (High School Musical, The Greatest Showman)' },
    ],
    '10-19': [
        { year: 1945, name: 'John Lithgow', description: 'Actor (3rd Rock from the Sun)' },
        { year: 1962, name: 'Evander Holyfield', description: 'Heavyweight boxing champion' },
    ],
    '10-20': [
        { year: 1882, name: 'Bela Lugosi', description: 'Actor (original Dracula)' },
        { year: 1931, name: 'Mickey Mantle', description: 'Baseball legend (Yankees)' },
        { year: 1971, name: 'Snoop Dogg', description: 'Rapper and cultural icon' },
    ],
    '10-21': [
        { year: 1833, name: 'Alfred Nobel', description: 'Inventor of dynamite, Nobel Prize creator' },
        { year: 1956, name: 'Carrie Fisher', description: 'Actress (Princess Leia, Star Wars)' },
        { year: 1980, name: 'Kim Kardashian', description: 'Media mogul and businesswoman' },
    ],
    '10-22': [
        { year: 1811, name: 'Franz Liszt', description: 'Piano virtuoso and composer' },
        { year: 1917, name: 'Joan Fontaine', description: 'Oscar-winning actress' },
        { year: 1942, name: 'Annette Funicello', description: 'Disney Mouseketeer and actress' },
        { year: 1943, name: 'Catherine Deneuve', description: 'French film actress' },
    ],
    '10-23': [
        { year: 1940, name: 'Pelé', description: 'Soccer legend — the King' },
        { year: 1959, name: 'Sam Raimi', description: 'Director (Spider-Man, Evil Dead)' },
        { year: 1976, name: 'Ryan Reynolds', description: 'Actor (Deadpool)' },
    ],
    '10-24': [
        { year: 1632, name: 'Antonie van Leeuwenhoek', description: 'Father of microbiology' },
        { year: 1985, name: 'Wayne Rooney', description: 'Soccer legend (Manchester United)' },
        { year: 1986, name: 'Drake', description: 'Rapper and producer' },
    ],
    '10-25': [
        { year: 1881, name: 'Pablo Picasso', description: 'Modern art revolutionary' },
        { year: 1984, name: 'Katy Perry', description: 'Pop singer (Roar, Firework)' },
    ],
    '10-26': [
        { year: 1800, name: 'Helmuth von Moltke', description: 'Military strategist' },
        { year: 1916, name: 'François Mitterrand', description: 'French President' },
        { year: 1947, name: 'Hillary Clinton', description: 'Secretary of State, Senator' },
    ],
    '10-27': [
        { year: 1858, name: 'Theodore Roosevelt', description: '26th U.S. President, Rough Rider' },
        { year: 1914, name: 'Dylan Thomas', description: 'Welsh poet (Do Not Go Gentle)' },
        { year: 1971, name: 'David Guetta', description: 'DJ and producer' },
    ],
    '10-28': [
        { year: 1914, name: 'Jonas Salk', description: 'Polio vaccine inventor' },
        { year: 1955, name: 'Bill Gates', description: 'Microsoft co-founder, philanthropist' },
        { year: 1967, name: 'Julia Roberts', description: 'Oscar-winning actress (Erin Brockovich)' },
        { year: 1974, name: 'Joaquin Phoenix', description: 'Oscar-winning actor (Joker)' },
    ],
    '10-29': [
        { year: 1740, name: 'James Boswell', description: 'Biographer of Samuel Johnson' },
        { year: 1947, name: 'Richard Dreyfuss', description: 'Oscar-winning actor (Jaws)' },
        { year: 1971, name: 'Winona Ryder', description: 'Actress (Stranger Things, Beetlejuice)' },
    ],
    '10-30': [
        { year: 1735, name: 'John Adams', description: '2nd U.S. President' },
        { year: 1937, name: 'Claude Lelouch', description: 'French filmmaker' },
        { year: 1981, name: 'Ivanka Trump', description: 'Businesswoman and former advisor' },
    ],
    '10-31': [
        { year: 1795, name: 'John Keats', description: 'Romantic poet' },
        { year: 1950, name: 'John Candy', description: 'Beloved comedian' },
        { year: 1963, name: 'Rob Schneider', description: 'Comedian and actor' },
    ],
    // NOVEMBER
    '11-1': [
        { year: 1871, name: 'Stephen Crane', description: 'Author (Red Badge of Courage)' },
        { year: 1972, name: 'Toni Collette', description: 'Oscar-nominated actress' },
    ],
    '11-2': [
        { year: 1734, name: 'Daniel Boone', description: 'Frontier explorer' },
        { year: 1755, name: 'Marie Antoinette', description: 'Queen of France' },
        { year: 1913, name: 'Burt Lancaster', description: 'Oscar-winning actor' },
        { year: 1966, name: 'David Schwimmer', description: 'Actor (Ross on Friends)' },
    ],
    '11-3': [
        { year: 1921, name: 'Charles Bronson', description: 'Action star (Death Wish)' },
        { year: 1954, name: 'Adam Ant', description: 'New wave musician' },
        { year: 1978, name: 'Gemma Ward', description: 'Supermodel' },
    ],
    '11-4': [
        { year: 1879, name: 'Will Rogers', description: 'Humorist and actor' },
        { year: 1916, name: 'Walter Cronkite', description: 'Most trusted man in America (CBS News)' },
        { year: 1969, name: 'Matthew McConaughey', description: 'Oscar-winning actor (Dallas Buyers Club)' },
        { year: 1969, name: 'P. Diddy (Sean Combs)', description: 'Rapper, producer, entrepreneur' },
    ],
    '11-5': [
        { year: 1855, name: 'Eugene Debs', description: 'Labor leader and presidential candidate' },
        { year: 1941, name: 'Art Garfunkel', description: 'Singer (Simon & Garfunkel)' },
        { year: 1959, name: 'Bryan Adams', description: 'Rock singer (Summer of \'69)' },
        { year: 1963, name: 'Tatum O\'Neal', description: 'Youngest Oscar winner ever' },
    ],
    '11-6': [
        { year: 1814, name: 'Adolphe Sax', description: 'Inventor of the saxophone' },
        { year: 1854, name: 'John Philip Sousa', description: 'March King (Stars and Stripes Forever)' },
        { year: 1946, name: 'Sally Field', description: 'Oscar-winning actress' },
        { year: 1970, name: 'Ethan Hawke', description: 'Actor (Training Day, Boyhood)' },
    ],
    '11-7': [
        { year: 1867, name: 'Marie Curie', description: 'Physicist, two-time Nobel Prize winner' },
        { year: 1918, name: 'Billy Graham', description: 'Evangelist, spiritual advisor to presidents' },
        { year: 1943, name: 'Joni Mitchell', description: 'Singer-songwriter (Big Yellow Taxi)' },
    ],
    '11-8': [
        { year: 1847, name: 'Bram Stoker', description: 'Author (Dracula)' },
        { year: 1900, name: 'Margaret Mitchell', description: 'Author (Gone with the Wind)' },
        { year: 1949, name: 'Bonnie Raitt', description: 'Blues-rock singer and guitarist' },
    ],
    '11-9': [
        { year: 1818, name: 'Ivan Turgenev', description: 'Russian novelist' },
        { year: 1934, name: 'Carl Sagan', description: 'Astronomer (Cosmos)' },
        { year: 1984, name: 'Delta Goodrem', description: 'Australian singer and actress' },
    ],
    '11-10': [
        { year: 1483, name: 'Martin Luther', description: 'Protestant Reformation leader' },
        { year: 1879, name: 'Vachel Lindsay', description: 'American poet' },
        { year: 1975, name: 'Brittany Murphy', description: 'Actress (Clueless, 8 Mile)' },
    ],
    '11-11': [
        { year: 1821, name: 'Fyodor Dostoevsky', description: 'Russian novelist (Crime and Punishment)' },
        { year: 1922, name: 'Kurt Vonnegut', description: 'Author (Slaughterhouse-Five)' },
        { year: 1962, name: 'Demi Moore', description: 'Actress (Ghost, G.I. Jane)' },
        { year: 1974, name: 'Leonardo DiCaprio', description: 'Oscar-winning actor (Titanic, Revenant)' },
    ],
    '11-12': [
        { year: 1815, name: 'Elizabeth Cady Stanton', description: 'Women\'s suffrage leader' },
        { year: 1929, name: 'Grace Kelly', description: 'Oscar-winning actress turned Princess of Monaco' },
        { year: 1980, name: 'Ryan Gosling', description: 'Actor (The Notebook, La La Land)' },
        { year: 1982, name: 'Anne Hathaway', description: 'Oscar-winning actress' },
    ],
    '11-13': [
        { year: 1850, name: 'Robert Louis Stevenson', description: 'Author (Treasure Island)' },
        { year: 1955, name: 'Whoopi Goldberg', description: 'EGOT winner, actress, comedian' },
        { year: 1969, name: 'Gerard Butler', description: 'Actor (300)' },
    ],
    '11-14': [
        { year: 1840, name: 'Claude Monet', description: 'Impressionist painter' },
        { year: 1889, name: 'Jawaharlal Nehru', description: 'First PM of India' },
        { year: 1948, name: 'Charles, Prince of Wales', description: 'King Charles III' },
        { year: 1954, name: 'Condoleezza Rice', description: 'Secretary of State' },
    ],
    '11-15': [
        { year: 1887, name: 'Georgia O\'Keeffe', description: 'American modern art icon' },
        { year: 1891, name: 'Erwin Rommel', description: 'WWII general (Desert Fox)' },
    ],
    '11-16': [
        { year: 1873, name: 'W.C. Handy', description: 'Father of the Blues' },
        { year: 1964, name: 'Dwight Gooden', description: 'Baseball pitcher (Doc)' },
    ],
    '11-17': [
        { year: 1755, name: 'Louis XVIII', description: 'King of France' },
        { year: 1925, name: 'Rock Hudson', description: 'Leading man actor' },
        { year: 1942, name: 'Martin Scorsese', description: 'Legendary director (Goodfellas, Taxi Driver)' },
        { year: 1960, name: 'RuPaul', description: 'Drag queen and TV host' },
    ],
    '11-18': [
        { year: 1836, name: 'W.S. Gilbert', description: 'Playwright (Gilbert & Sullivan)' },
        { year: 1939, name: 'Margaret Atwood', description: 'Author (The Handmaid\'s Tale)' },
        { year: 1968, name: 'Owen Wilson', description: 'Actor (Wedding Crashers)' },
    ],
    '11-19': [
        { year: 1831, name: 'James A. Garfield', description: '20th U.S. President' },
        { year: 1961, name: 'Meg Ryan', description: 'Actress (When Harry Met Sally)' },
        { year: 1962, name: 'Jodie Foster', description: 'Oscar-winning actress and director' },
    ],
    '11-20': [
        { year: 1858, name: 'Selma Lagerlöf', description: 'First female Nobel Prize in Literature' },
        { year: 1925, name: 'Robert F. Kennedy', description: 'U.S. Attorney General, Senator' },
        { year: 1985, name: 'Dan Byrd', description: 'Country singer' },
    ],
    '11-21': [
        { year: 1694, name: 'Voltaire', description: 'Enlightenment philosopher' },
        { year: 1898, name: 'René Magritte', description: 'Surrealist painter' },
        { year: 1965, name: 'Björk', description: 'Icelandic singer and artist' },
    ],
    '11-22': [
        { year: 1819, name: 'George Eliot', description: 'Novelist (Middlemarch)' },
        { year: 1961, name: 'Mariel Hemingway', description: 'Actress' },
        { year: 1984, name: 'Scarlett Johansson', description: 'Actress (Black Widow, Lost in Translation)' },
    ],
    '11-23': [
        { year: 1804, name: 'Franklin Pierce', description: '14th U.S. President' },
        { year: 1887, name: 'Boris Karloff', description: 'Actor (Frankenstein)' },
        { year: 1992, name: 'Miley Cyrus', description: 'Pop singer and actress (Hannah Montana)' },
    ],
    '11-24': [
        { year: 1784, name: 'Zachary Taylor', description: '12th U.S. President' },
        { year: 1826, name: 'Carlo Collodi', description: 'Author (Pinocchio)' },
        { year: 1978, name: 'Katherine Heigl', description: 'Actress (Grey\'s Anatomy)' },
    ],
    '11-25': [
        { year: 1835, name: 'Andrew Carnegie', description: 'Steel magnate and philanthropist' },
        { year: 1914, name: 'Joe DiMaggio', description: 'Baseball legend (56-game hit streak)' },
        { year: 1960, name: 'John F. Kennedy Jr.', description: 'Attorney, publisher, American icon' },
        { year: 1986, name: 'Katie Cassidy', description: 'Actress (Arrow)' },
    ],
    '11-26': [
        { year: 1922, name: 'Charles Schulz', description: 'Peanuts cartoonist (Charlie Brown, Snoopy)' },
        { year: 1939, name: 'Tina Turner', description: 'Queen of Rock and Roll' },
        { year: 1973, name: 'Peter Facinelli', description: 'Actor (Twilight, Nurse Jackie)' },
    ],
    '11-27': [
        { year: 1942, name: 'Jimi Hendrix', description: 'Greatest guitarist of all time' },
        { year: 1940, name: 'Bruce Lee', description: 'Martial arts legend and actor' },
        { year: 1957, name: 'Caroline Kennedy', description: 'Author and diplomat' },
    ],
    '11-28': [
        { year: 1757, name: 'William Blake', description: 'Poet and artist' },
        { year: 1929, name: 'Berry Gordy Jr.', description: 'Motown Records founder' },
        { year: 1950, name: 'Ed Harris', description: 'Oscar-nominated actor' },
        { year: 1962, name: 'Jon Stewart', description: 'Comedian and political satirist' },
    ],
    '11-29': [
        { year: 1832, name: 'Louisa May Alcott', description: 'Author (Little Women)' },
        { year: 1898, name: 'C.S. Lewis', description: 'Author (Narnia)' },
        { year: 1976, name: 'Anna Faris', description: 'Actress (Scary Movie)' },
    ],
    '11-30': [
        { year: 1667, name: 'Jonathan Swift', description: 'Author (Gulliver\'s Travels)' },
        { year: 1835, name: 'Mark Twain', description: 'America\'s greatest humorist (Tom Sawyer)' },
        { year: 1965, name: 'Ben Stiller', description: 'Actor and director (Zoolander)' },
    ],
    // DECEMBER
    '12-1': [
        { year: 1935, name: 'Woody Allen', description: 'Director (Annie Hall, Manhattan)' },
        { year: 1940, name: 'Richard Pryor', description: 'Legendary comedian' },
        { year: 1945, name: 'Bette Midler', description: 'Singer and actress (The Divine Miss M)' },
    ],
    '12-2': [
        { year: 1859, name: 'Georges Seurat', description: 'Pointillist painter' },
        { year: 1981, name: 'Britney Spears', description: 'Pop princess' },
    ],
    '12-3': [
        { year: 1838, name: 'Cleveland Abbe', description: 'Father of the weather forecast' },
        { year: 1960, name: 'Daryl Hannah', description: 'Actress (Splash, Kill Bill)' },
        { year: 1968, name: 'Brendan Fraser', description: 'Oscar-winning actor (The Whale)' },
    ],
    '12-4': [
        { year: 1892, name: 'Francisco Franco', description: 'Spanish dictator' },
        { year: 1949, name: 'Jeff Bridges', description: 'Oscar-winning actor (The Big Lebowski)' },
        { year: 1969, name: 'Jay-Z', description: 'Rapper, mogul, billionaire' },
    ],
    '12-5': [
        { year: 1782, name: 'Martin Van Buren', description: '8th U.S. President' },
        { year: 1901, name: 'Walt Disney', description: 'Animation pioneer, theme park creator' },
        { year: 1932, name: 'Little Richard', description: 'Rock and roll pioneer' },
    ],
    '12-6': [
        { year: 1421, name: 'Henry VI', description: 'King of England' },
        { year: 1920, name: 'Dave Brubeck', description: 'Jazz pianist (Take Five)' },
    ],
    '12-7': [
        { year: 1761, name: 'Madame Tussaud', description: 'Wax museum founder' },
        { year: 1928, name: 'Noam Chomsky', description: 'Linguist and political commentator' },
        { year: 1956, name: 'Larry Bird', description: 'NBA legend (Celtics)' },
    ],
    '12-8': [
        { year: 1765, name: 'Eli Whitney', description: 'Inventor of the cotton gin' },
        { year: 1925, name: 'Sammy Davis Jr.', description: 'Entertainer (Rat Pack)' },
        { year: 1943, name: 'Jim Morrison', description: 'The Doors frontman' },
        { year: 1966, name: 'Sinéad O\'Connor', description: 'Singer (Nothing Compares 2 U)' },
        { year: 1982, name: 'Nicki Minaj', description: 'Rapper and singer' },
    ],
    '12-9': [
        { year: 1608, name: 'John Milton', description: 'Poet (Paradise Lost)' },
        { year: 1916, name: 'Kirk Douglas', description: 'Hollywood legend (Spartacus)' },
        { year: 1953, name: 'John Malkovich', description: 'Actor (Being John Malkovich)' },
    ],
    '12-10': [
        { year: 1830, name: 'Emily Dickinson', description: 'Acclaimed American poet' },
        { year: 1957, name: 'Michael Clarke Duncan', description: 'Actor (The Green Mile)' },
    ],
    '12-11': [
        { year: 1810, name: 'Alfred de Musset', description: 'French poet and playwright' },
        { year: 1943, name: 'John Kerry', description: 'Secretary of State, Senator' },
        { year: 1954, name: 'Jermaine Jackson', description: 'Singer (The Jackson 5)' },
    ],
    '12-12': [
        { year: 1805, name: 'Henry Wells', description: 'Wells Fargo co-founder' },
        { year: 1915, name: 'Frank Sinatra', description: 'Ol\' Blue Eyes — singer and actor' },
        { year: 1963, name: 'Helen Hunt', description: 'Oscar-winning actress' },
    ],
    '12-13': [
        { year: 1818, name: 'Mary Todd Lincoln', description: 'First Lady' },
        { year: 1925, name: 'Dick Van Dyke', description: 'Beloved actor and entertainer' },
        { year: 1989, name: 'Taylor Swift', description: 'Pop megastar (Eras Tour, 14 Grammys)' },
    ],
    '12-14': [
        { year: 1503, name: 'Nostradamus', description: 'French prophet and astrologer' },
        { year: 1946, name: 'Patty Duke', description: 'Oscar-winning actress' },
        { year: 1963, name: 'Ville Valo', description: 'Finnish musician (HIM)' },
    ],
    '12-15': [
        { year: 1832, name: 'Gustave Eiffel', description: 'Engineer (Eiffel Tower)' },
        { year: 1892, name: 'J. Paul Getty', description: 'Oil tycoon, once world\'s richest man' },
        { year: 1949, name: 'Don Johnson', description: 'Actor (Miami Vice)' },
    ],
    '12-16': [
        { year: 1770, name: 'Ludwig van Beethoven', description: 'Classical music titan' },
        { year: 1775, name: 'Jane Austen', description: 'Author (Pride and Prejudice)' },
        { year: 1985, name: 'Milla Jovovich', description: 'Actress (Resident Evil)' },
    ],
    '12-17': [
        { year: 1770, name: 'Ludwig van Beethoven', description: 'Composer (9th Symphony)' },
        { year: 1903, name: 'Erskine Caldwell', description: 'Author (Tobacco Road)' },
        { year: 1975, name: 'Milla Jovovich', description: 'Actress and model' },
    ],
    '12-18': [
        { year: 1707, name: 'Charles Wesley', description: 'Hymn writer (Hark! The Herald Angels Sing)' },
        { year: 1886, name: 'Ty Cobb', description: 'Baseball legend (.366 lifetime average)' },
        { year: 1946, name: 'Steven Spielberg', description: 'Greatest director alive (Jaws, E.T., Schindler\'s List)' },
        { year: 1963, name: 'Brad Pitt', description: 'Oscar-winning actor and producer' },
    ],
    '12-19': [
        { year: 1852, name: 'Albert A. Michelson', description: 'Nobel Prize physicist (speed of light)' },
        { year: 1980, name: 'Jake Gyllenhaal', description: 'Actor (Nightcrawler, Brokeback Mountain)' },
    ],
    '12-20': [
        { year: 1868, name: 'Harvey Firestone', description: 'Firestone Tire founder' },
        { year: 1946, name: 'Uri Geller', description: 'Illusionist' },
        { year: 1978, name: 'Jonah Hill', description: 'Actor (Superbad, Wolf of Wall Street)' },
    ],
    '12-21': [
        { year: 1804, name: 'Benjamin Disraeli', description: 'British Prime Minister' },
        { year: 1937, name: 'Jane Fonda', description: 'Oscar-winning actress and activist' },
        { year: 1948, name: 'Samuel L. Jackson', description: 'Legendary actor (Pulp Fiction)' },
        { year: 1966, name: 'Kiefer Sutherland', description: 'Actor (24, Stand By Me)' },
    ],
    '12-22': [
        { year: 1858, name: 'Giacomo Puccini', description: 'Opera composer (La Bohème)' },
        { year: 1912, name: 'Lady Bird Johnson', description: 'First Lady' },
    ],
    '12-23': [
        { year: 1805, name: 'Joseph Smith', description: 'Founder of Mormonism' },
        { year: 1918, name: 'Helmut Schmidt', description: 'German chancellor' },
        { year: 1964, name: 'Eddie Vedder', description: 'Pearl Jam vocalist' },
    ],
    '12-24': [
        { year: 1809, name: 'Kit Carson', description: 'Frontiersman and explorer' },
        { year: 1905, name: 'Howard Hughes', description: 'Aviator, filmmaker, billionaire' },
        { year: 1971, name: 'Ricky Martin', description: 'Latin pop superstar' },
        { year: 1980, name: 'Ryan Seacrest', description: 'TV host (American Idol)' },
    ],
    '12-25': [
        { year: 1642, name: 'Isaac Newton', description: 'Physicist and mathematician' },
        { year: 1821, name: 'Clara Barton', description: 'Founder of the American Red Cross' },
        { year: 1899, name: 'Humphrey Bogart', description: 'Actor (Casablanca)' },
        { year: 1954, name: 'Annie Lennox', description: 'Singer (Eurythmics)' },
    ],
    '12-26': [
        { year: 1893, name: 'Mao Zedong', description: 'Chinese leader' },
        { year: 1914, name: 'Richard Widmark', description: 'Actor (noir films)' },
    ],
    '12-27': [
        { year: 1822, name: 'Louis Pasteur', description: 'Microbiologist (pasteurization)' },
        { year: 1901, name: 'Marlene Dietrich', description: 'Actress and singer' },
    ],
    '12-28': [
        { year: 1856, name: 'Woodrow Wilson', description: '28th U.S. President' },
        { year: 1954, name: 'Denzel Washington', description: 'Oscar-winning actor (Training Day)' },
        { year: 1969, name: 'Linus Torvalds', description: 'Creator of Linux' },
        { year: 1981, name: 'Sienna Miller', description: 'Actress (Factory Girl)' },
    ],
    '12-29': [
        { year: 1800, name: 'Charles Goodyear', description: 'Vulcanized rubber inventor' },
        { year: 1808, name: 'Andrew Johnson', description: '17th U.S. President' },
        { year: 1938, name: 'Jon Voight', description: 'Oscar-winning actor' },
        { year: 1972, name: 'Jude Law', description: 'Actor (The Talented Mr. Ripley)' },
    ],
    '12-30': [
        { year: 1865, name: 'Rudyard Kipling', description: 'Nobel Prize author (The Jungle Book)' },
        { year: 1935, name: 'Sandy Koufax', description: 'Baseball pitching legend' },
        { year: 1975, name: 'Tiger Woods', description: 'Golf GOAT (15 majors)' },
        { year: 1984, name: 'LeBron James', description: 'NBA legend, all-time scorer' },
    ],
    '12-31': [
        { year: 1869, name: 'Henri Matisse', description: 'Modern art master' },
        { year: 1943, name: 'John Denver', description: 'Singer-songwriter (Rocky Mountain High)' },
        { year: 1959, name: 'Val Kilmer', description: 'Actor (Top Gun, Tombstone)' },
    ],
};

// Look up celebrities for this specific date from our curated database
function getCelebritiesForDate(month: number, day: number): FamousPerson[] {
    const key = `${month}-${day}`;
    const people = americanCelebrities[key];
    if (people && people.length > 0) {
        return [...people].sort((a, b) => a.year - b.year);
    }
    // If no exact match (shouldn't happen), return a few from nearby dates
    const nearby: FamousPerson[] = [];
    for (let offset = -1; offset <= 1; offset++) {
        const d = day + offset;
        const nk = `${month}-${d}`;
        if (americanCelebrities[nk]) {
            nearby.push(...americanCelebrities[nk]);
        }
    }
    return nearby.sort((a, b) => a.year - b.year).slice(0, 5);
}

export default function FamousBirthdaysScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const [celebrities, setCelebrities] = useState<FamousPerson[]>([]);
    const [loading, setLoading] = useState(true);

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        setLoading(true);

        try {
            // Use Wikimedia API - same endpoint, just focus on births
            const paddedMonth = month.toString().padStart(2, '0');
            const paddedDay = day.toString().padStart(2, '0');
            const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${paddedMonth}/${paddedDay}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BirthdayFunApp/1.0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const fetchedPeople: FamousPerson[] = [];

                if (data.births && data.births.length > 0) {
                    // Get up to 15 famous birthdays
                    data.births.slice(0, 15).forEach((b: any) => {
                        if (b.year && b.text) {
                            fetchedPeople.push({
                                year: b.year,
                                name: b.text.split(',')[0].split('(')[0].trim(),
                                description: b.text
                            });
                        }
                    });
                }

                if (fetchedPeople.length > 0) {
                    fetchedPeople.sort((a, b) => a.year - b.year);
                    setCelebrities(fetchedPeople);
                    setLoading(false);
                    return;
                }
            }

            // Fallback to curated American celebrities database
            setCelebrities(getCelebritiesForDate(month, day));
        } catch (err) {
            // Use curated database on error
            setCelebrities(getCelebritiesForDate(month, day));
        }

        setLoading(false);
    };

    const getAgeEmoji = (year: number): string => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        if (age < 0) return '👶';
        if (age < 30) return '🧑';
        if (age < 50) return '👨';
        if (age < 80) return '👴';
        if (age < 150) return '🕊️';
        return '📜';
    };

    return (
        <LinearGradient colors={['#ad1457', '#c2185b', '#d81b60']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#ad1457" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🌟</Text>
                    <Text style={styles.title}>Famous Birthday Twins</Text>
                    <Text style={styles.subtitle}>Born on {formattedDate}</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Finding your celebrity twins...</Text>
                    </View>
                ) : (
                    <>
                        {/* Intro */}
                        <View style={styles.introCard}>
                            <Text style={styles.introText}>
                                🎉 You share your birthday with these amazing people!
                            </Text>
                        </View>

                        {/* Celebrity Cards */}
                        {celebrities.map((person, index) => (
                            <View key={index} style={styles.personCard}>
                                <View style={styles.personHeader}>
                                    <Text style={styles.personEmoji}>{getAgeEmoji(person.year)}</Text>
                                    <View style={styles.personInfo}>
                                        <Text style={styles.personName}>{person.name}</Text>
                                        <Text style={styles.personYear}>Born {person.year}</Text>
                                    </View>
                                    <View style={styles.yearBadge}>
                                        <Text style={styles.yearBadgeText}>{person.year}</Text>
                                    </View>
                                </View>
                                <Text style={styles.personDescription}>{person.description}</Text>
                            </View>
                        ))}

                        {/* Fun Fact */}
                        <View style={styles.funFactCard}>
                            <Text style={styles.funFactTitle}>✨ Fun Fact</Text>
                            <Text style={styles.funFactText}>
                                People who share a birthday often have similar personality traits
                                according to astrology! You might share more than just a date with
                                these famous folks.
                            </Text>
                        </View>

                        {/* Data Source */}
                        <Text style={styles.dataSource}>
                            Data sourced from Wikipedia
                        </Text>
                    </>
                )}

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back to Fun Facts</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginTop: 16,
    },
    introCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    introText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    personCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    personHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    personEmoji: {
        fontSize: 36,
        marginRight: 12,
    },
    personInfo: {
        flex: 1,
    },
    personName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ad1457',
    },
    personYear: {
        fontSize: 14,
        color: '#888',
    },
    yearBadge: {
        backgroundColor: '#fce4ec',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    yearBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ad1457',
    },
    personDescription: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    funFactCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    funFactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    funFactText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
        textAlign: 'center',
    },
    dataSource: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
