import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Circle, Ellipse, G, Line, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SolarSystemTimeCapsule'>;

export default function SolarSystemTimeCapsuleScreen({ route }: Props) {
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate + 'T00:00:00'), [route.params.birthDate]);
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate + 'T00:00:00'));

    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [dateMode, setDateMode] = useState<'birth' | 'today'>('birth');
    const baseDateRef = useRef(new Date(route.params.birthDate + 'T00:00:00'));

    const steps = [
        { label: '24hr', days: 1, sliderDays: 60 },
        { label: '7 days', days: 7, sliderDays: 365 },
        { label: '1 month', days: 30.4375, sliderDays: 1826 },
        { label: '2.5 yrs', days: 913.125, sliderDays: 7305 },
    ];
    const [selectedStepIdx, setSelectedStepIdx] = useState(0);
    const selectedStepRef = useRef(steps[0].days);
    const sliderDaysRef = useRef(steps[0].sliderDays);
    const HUNDRED_YEARS_MS = 100 * 365.25 * 86400000;

    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);

    const applyOffset = useCallback((newOffset: number) => {
        const stepDays = selectedStepRef.current;
        const snapped = Math.round(newOffset / stepDays) * stepDays;
        const baseMs = baseDateRef.current.getTime();
        const minOff = -HUNDRED_YEARS_MS / 86400000;
        const maxOff = HUNDRED_YEARS_MS / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, snapped));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        const newDate = new Date(baseMs + clamped * 86400000);
        setBirthDate(newDate);
    }, []);

    const switchDateMode = useCallback((mode: 'birth' | 'today') => {
        setDateMode(mode);
        dayOffsetRef.current = 0;
        setDayOffset(0);
        const base = mode === 'today' ? new Date() : new Date(originalBirthDate.getTime());
        baseDateRef.current = base;
        setBirthDate(base);
    }, [originalBirthDate]);

    const selectStep = useCallback((idx: number) => {
        setSelectedStepIdx(idx);
        selectedStepRef.current = steps[idx].days;
        sliderDaysRef.current = steps[idx].sliderDays;
        const stepDays = steps[idx].days;
        const snapped = Math.round(dayOffsetRef.current / stepDays) * stepDays;
        const baseMs = baseDateRef.current.getTime();
        const minOff = -HUNDRED_YEARS_MS / 86400000;
        const maxOff = HUNDRED_YEARS_MS / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, snapped));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setBirthDate(new Date(baseMs + clamped * 86400000));
    }, []);

    // Pan responder for spinning the wheel
    const lastAngleRef = useRef(0);
    const solarPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
            onPanResponderGrant: () => {
                setIsSpinning(true);
                lastAngleRef.current = 0;
            },
            onPanResponderMove: (_, gesture) => {
                const stepDays = selectedStepRef.current;
                const stepsFromGesture = Math.round(gesture.dx / 10);
                const prevSteps = lastAngleRef.current;
                lastAngleRef.current = stepsFromGesture;
                const stepDelta = stepsFromGesture - prevSteps;
                if (stepDelta !== 0) {
                    applyOffset(dayOffsetRef.current + stepDelta * stepDays);
                }
            },
            onPanResponderRelease: () => {
                setIsSpinning(false);
            },
        })
    ).current;

    // Time slider pan responder
    const sliderStartOffsetRef = useRef(0);
    const timeSliderPan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                sliderStartOffsetRef.current = dayOffsetRef.current;
            },
            onPanResponderMove: (_, gesture) => {
                const totalRange = sliderDaysRef.current;
                const rawOffset = sliderStartOffsetRef.current + (gesture.dx / sliderWRef.current) * totalRange;
                applyOffset(rawOffset);
            },
            onPanResponderRelease: () => { },
        })
    ).current;

    const formatOffset = (offset: number) => {
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? '+' : '\u2212';
        const modeLabel = dateMode === 'today' ? 'from today' : 'from birth';
        if (absOffset < 1) {
            const hrs = Math.round(absOffset * 24);
            return `${sign}${hrs} hr${hrs !== 1 ? 's' : ''} ${modeLabel}`;
        }
        const totalDays = Math.round(absOffset);
        if (totalDays < 30) return `${sign}${totalDays} day${totalDays !== 1 ? 's' : ''} ${modeLabel}`;
        if (totalDays < 365) {
            const months = Math.floor(totalDays / 30.4375);
            const remDays = Math.round(totalDays - months * 30.4375);
            if (remDays === 0) return `${sign}${months} mo${months !== 1 ? 's' : ''} ${modeLabel}`;
            return `${sign}${months}mo ${remDays}d ${modeLabel}`;
        }
        const years = Math.floor(totalDays / 365.25);
        const remDays = Math.round(totalDays - years * 365.25);
        if (remDays === 0) return `${sign}${years} yr${years !== 1 ? 's' : ''} ${modeLabel}`;
        return `${sign}${years}y ${remDays}d ${modeLabel}`;
    };

    // Voyager probe distance calculations
    const voyager1LaunchMs = Date.UTC(1977, 8, 5);
    const voyager2LaunchMs = Date.UTC(1977, 7, 20);
    const kmPerSecToAUPerDay = (kmPerSec: number) => (kmPerSec * 86400) / 149597870.7;
    const v1DaysOut = (birthDate.getTime() - voyager1LaunchMs) / 86400000;
    const v2DaysOut = (birthDate.getTime() - voyager2LaunchMs) / 86400000;
    const v1AU = v1DaysOut > 0 ? 1 + v1DaysOut * kmPerSecToAUPerDay(17.0) : 0;
    const v2AU = v2DaysOut > 0 ? 1 + v2DaysOut * kmPerSecToAUPerDay(15.4) : 0;

    // Slider position calculations — thumb moves across full clamped range
    const baseMs = baseDateRef.current.getTime();
    const fullMinOff = -HUNDRED_YEARS_MS / 86400000;
    const fullMaxOff = HUNDRED_YEARS_MS / 86400000;
    const fullRange = fullMaxOff - fullMinOff;
    const sliderFrac = fullRange > 0 ? (dayOffset - fullMinOff) / fullRange : 0.5;
    const sliderCenterFrac = fullRange > 0 ? (0 - fullMinOff) / fullRange : 0.5;
    const sliderLeftDate = new Date(baseDateRef.current.getTime() - HUNDRED_YEARS_MS);
    const sliderRightDate = new Date(baseDateRef.current.getTime() + HUNDRED_YEARS_MS);
    const fmtSliderDate = (d: Date) => String(d.getFullYear());

    // ═══ SIGNIFICANT ASTRONOMICAL & SPACE EVENTS ═══
    const astronomicalEvents = useMemo(() => [
        // Past events (chronological)
        { date: Date.UTC(1930, 1, 18), emoji: '🔵', title: 'Pluto Discovered', desc: 'Clyde Tombaugh discovers Pluto at Lowell Observatory' },
        { date: Date.UTC(1957, 9, 4), emoji: '🛰️', title: 'Sputnik 1 Launched', desc: 'First artificial satellite — the Space Age begins' },
        { date: Date.UTC(1957, 7, 27), emoji: '🕳️', title: 'Pascal-B Manhole Cover', desc: 'Nuclear test launches a 900 kg steel cap at ~125,000 mph (6× escape velocity) — possibly the fastest human-made object ever. Whether it escaped Earth or vaporized is still debated.' },
        { date: Date.UTC(1961, 3, 12), emoji: '🚀', title: 'First Human in Space', desc: 'Yuri Gagarin orbits Earth aboard Vostok 1' },
        { date: Date.UTC(1962, 11, 14), emoji: '🪐', title: 'Mariner 2 Flyby of Venus', desc: 'First successful planetary flyby — confirmed Venus surface is ~460°C' },
        { date: Date.UTC(1965, 6, 14), emoji: '📷', title: 'Mariner 4 Flyby of Mars', desc: 'First close-up photos of another planet — revealed craters on Mars' },
        { date: Date.UTC(1966, 1, 3), emoji: '🌙', title: 'Luna 9 Lands on Moon', desc: 'First soft landing on the Moon — proved surface could support a lander' },
        { date: Date.UTC(1969, 6, 20), emoji: '👨‍🚀', title: 'Moon Landing — Apollo 11', desc: 'Neil Armstrong & Buzz Aldrin walk on the Moon' },
        { date: Date.UTC(1970, 3, 13), emoji: '🆘', title: 'Apollo 13 Crisis', desc: '"Houston, we\'ve had a problem" — crew returns safely' },
        { date: Date.UTC(1971, 3, 19), emoji: '🔴', title: 'Salyut 1 — First Space Station', desc: 'First crewed space station launched by Soviet Union' },
        { date: Date.UTC(1971, 10, 13), emoji: '🔴', title: 'Mariner 9 Orbits Mars', desc: 'First spacecraft to orbit another planet' },
        { date: Date.UTC(1973, 11, 3), emoji: '🪐', title: 'Pioneer 10 Flyby of Jupiter', desc: 'First spacecraft to fly past Jupiter — crossed asteroid belt' },
        { date: Date.UTC(1974, 2, 29), emoji: '☿', title: 'Mariner 10 Flyby of Mercury', desc: 'First spacecraft to visit Mercury' },
        { date: Date.UTC(1976, 6, 20), emoji: '🔴', title: 'Viking 1 Lands on Mars', desc: 'First successful Mars landing — searched for life' },
        { date: Date.UTC(1977, 7, 20), emoji: '🛰️', title: 'Voyager 2 Launched', desc: 'Grand Tour spacecraft — visited all 4 outer planets' },
        { date: Date.UTC(1977, 8, 5), emoji: '🛰️', title: 'Voyager 1 Launched', desc: 'Now the farthest human-made object from Earth' },
        { date: Date.UTC(1977, 7, 15), emoji: '📡', title: 'Wow! Signal', desc: 'Strong narrowband radio signal from Sagittarius — 72 seconds, never repeated. Origin still debated.' },
        { date: Date.UTC(1979, 2, 5), emoji: '🪐', title: 'Voyager 1 Flyby of Jupiter', desc: 'Discovered Jupiter\'s ring system and volcanic Io' },
        { date: Date.UTC(1980, 10, 12), emoji: '💍', title: 'Voyager 1 Flyby of Saturn', desc: 'Revealed incredible detail in Saturn\'s rings' },
        { date: Date.UTC(1981, 3, 12), emoji: '🚀', title: 'First Space Shuttle (Columbia)', desc: 'STS-1 — first reusable spacecraft mission' },
        { date: Date.UTC(1986, 0, 24), emoji: '🪐', title: 'Voyager 2 Flyby of Uranus', desc: 'Only spacecraft to visit Uranus — found 10 new moons' },
        { date: Date.UTC(1986, 0, 28), emoji: '💔', title: 'Challenger Disaster', desc: 'Space Shuttle Challenger breaks apart 73 seconds after launch' },
        { date: Date.UTC(1986, 2, 6), emoji: '☄️', title: 'Giotto Flyby of Halley\'s Comet', desc: 'First close-up images of a comet nucleus' },
        { date: Date.UTC(1989, 7, 25), emoji: '🪐', title: 'Voyager 2 Flyby of Neptune', desc: 'Only spacecraft to visit Neptune — found the Great Dark Spot' },
        { date: Date.UTC(1990, 3, 24), emoji: '🔭', title: 'Hubble Space Telescope Launched', desc: 'Revolutionized astronomy with deep-space imaging' },
        { date: Date.UTC(1990, 1, 14), emoji: '🌍', title: 'Pale Blue Dot Photo', desc: 'Voyager 1 takes iconic photo of Earth from 6 billion km away' },
        { date: Date.UTC(1994, 6, 16), emoji: '💥', title: 'Comet Shoemaker-Levy 9 Hits Jupiter', desc: '21 fragments impact Jupiter — first observed planetary collision' },
        { date: Date.UTC(1995, 9, 6), emoji: '🌟', title: 'First Exoplanet (51 Pegasi b)', desc: 'First planet confirmed orbiting a Sun-like star' },
        { date: Date.UTC(1997, 6, 4), emoji: '🔴', title: 'Mars Pathfinder & Sojourner', desc: 'First Mars rover — Sojourner explores for 83 sols' },
        { date: Date.UTC(1997, 9, 15), emoji: '🪐', title: 'Cassini Launched to Saturn', desc: 'Begin of epic 20-year Saturn mission' },
        { date: Date.UTC(2000, 4, 5), emoji: '🪐', title: 'Grand Alignment of 2000', desc: 'Mercury, Venus, Mars, Jupiter & Saturn aligned — rare visual event' },
        { date: Date.UTC(2003, 1, 1), emoji: '💔', title: 'Columbia Disaster', desc: 'Space Shuttle Columbia disintegrates during re-entry' },
        { date: Date.UTC(2004, 0, 4), emoji: '🔴', title: 'Spirit Rover Lands on Mars', desc: 'NASA\'s Mars Exploration Rover begins 6+ year mission' },
        { date: Date.UTC(2004, 6, 1), emoji: '💍', title: 'Cassini Arrives at Saturn', desc: 'Enters orbit and begins 13-year study of Saturn system' },
        { date: Date.UTC(2005, 0, 14), emoji: '🪐', title: 'Huygens Lands on Titan', desc: 'First landing in the outer solar system — reveals methane lakes' },
        { date: Date.UTC(2006, 0, 19), emoji: '🚀', title: 'New Horizons Launched', desc: 'Fastest spacecraft ever launched — headed for Pluto' },
        { date: Date.UTC(2006, 7, 24), emoji: '🔵', title: 'Pluto Reclassified', desc: 'IAU reclassifies Pluto as a dwarf planet' },
        { date: Date.UTC(2009, 2, 6), emoji: '🔭', title: 'Kepler Space Telescope Launched', desc: 'Discovered 2,700+ exoplanets during its mission' },
        { date: Date.UTC(2011, 10, 26), emoji: '🔴', title: 'Curiosity Rover Launched', desc: 'Car-size Mars rover — found evidence of ancient water' },
        { date: Date.UTC(2012, 7, 25), emoji: '🛰️', title: 'Voyager 1 Enters Interstellar Space', desc: 'First human-made object to leave the heliosphere' },
        { date: Date.UTC(2014, 10, 12), emoji: '☄️', title: 'Philae Lands on Comet 67P', desc: 'First landing on a comet — Rosetta mission' },
        { date: Date.UTC(2015, 6, 14), emoji: '🔵', title: 'New Horizons Flyby of Pluto', desc: 'First close-up images of Pluto — revealed heart-shaped plain' },
        { date: Date.UTC(2017, 1, 22), emoji: '🌟', title: 'TRAPPIST-1 System Announced', desc: '7 Earth-sized planets found around one star — 3 in habitable zone' },
        { date: Date.UTC(2017, 7, 17), emoji: '🔊', title: 'First Neutron Star Merger Detected', desc: 'Gravitational waves + light from colliding neutron stars (GW170817)' },
        { date: Date.UTC(2017, 9, 19), emoji: '☄️', title: '1I/\'Oumuamua Discovered', desc: 'First confirmed interstellar object passing through the solar system' },
        { date: Date.UTC(2018, 10, 5), emoji: '🛰️', title: 'Voyager 2 Enters Interstellar Space', desc: 'Second human-made object to leave the heliosphere' },
        { date: Date.UTC(2019, 3, 10), emoji: '🕳️', title: 'First Black Hole Image', desc: 'Event Horizon Telescope images M87* supermassive black hole' },
        { date: Date.UTC(2019, 0, 1), emoji: '🔵', title: 'New Horizons Flyby of Arrokoth', desc: 'Most distant object ever visited — 4 billion miles from Sun' },
        { date: Date.UTC(2020, 6, 30), emoji: '🔴', title: 'Perseverance Launched to Mars', desc: 'Carrying Ingenuity helicopter — powered flight on Mars' },
        { date: Date.UTC(2020, 11, 21), emoji: '🪐', title: 'Great Conjunction of 2020', desc: 'Jupiter & Saturn closest in 400 years — 0.1° apart, "Christmas Star"' },
        { date: Date.UTC(2021, 11, 25), emoji: '🔭', title: 'James Webb Space Telescope Launched', desc: 'Most powerful space telescope — seeing first galaxies after Big Bang' },
        { date: Date.UTC(2022, 8, 26), emoji: '💥', title: 'DART Impacts Dimorphos', desc: 'First planetary defense test — successfully changed an asteroid\'s orbit' },
        { date: Date.UTC(2023, 3, 13), emoji: '🪐', title: 'JUICE Launched to Jupiter', desc: 'ESA mission to explore Jupiter\'s icy moons Europa, Ganymede & Callisto' },
        { date: Date.UTC(2024, 9, 14), emoji: '☄️', title: 'Comet Tsuchinshan-ATLAS (C/2023 A3)', desc: 'Spectacular naked-eye comet visible worldwide — brightest in decades' },
        { date: Date.UTC(2025, 8, 21), emoji: '🪐', title: 'Neptune at Opposition', desc: 'Neptune closest to Earth — best viewing of the ice giant' },
        // Comet milestones
        { date: Date.UTC(1986, 1, 9), emoji: '☄️', title: "Halley's Comet Perihelion (1986)", desc: 'Most recent close approach of the most famous comet — visible to naked eye worldwide' },
        { date: Date.UTC(1997, 3, 1), emoji: '☄️', title: 'Comet Hale-Bopp Perihelion', desc: 'Great Comet of 1997 — visible for 18 months, one of the brightest comets ever observed' },
        { date: Date.UTC(1973, 11, 28), emoji: '☄️', title: 'Comet Kohoutek Perihelion', desc: 'Hyped as "comet of the century" but underperformed — still scientifically important' },
        { date: Date.UTC(1996, 2, 25), emoji: '☄️', title: 'Comet Hyakutake Close Approach', desc: 'Passed within 0.1 AU of Earth — one of the closest cometary approaches in 200 years' },
        { date: Date.UTC(2007, 0, 12), emoji: '☄️', title: 'Comet McNaught (Great Comet)', desc: 'Brightest comet in 40 years — visible in daylight from Southern Hemisphere' },
        { date: Date.UTC(2013, 10, 28), emoji: '☄️', title: 'Comet ISON Disintegrates', desc: 'The "comet of the century" broke apart during its close pass by the Sun' },
        { date: Date.UTC(2020, 6, 23), emoji: '☄️', title: 'Comet NEOWISE Perihelion', desc: 'Spectacular naked-eye comet — best Northern Hemisphere comet in 23 years' },
        { date: Date.UTC(2023, 9, 22), emoji: '☄️', title: 'Comet Encke Perihelion (2023)', desc: 'Shortest known orbital period of any comet — returns every 3.3 years' },
        // Interstellar object milestones
        { date: Date.UTC(2017, 8, 9), emoji: '💫', title: "1I/'Oumuamua Perihelion", desc: 'First interstellar object reaches closest point to Sun — just 0.25 AU. Elongated shape sparked debate: asteroid, comet, or alien probe?' },
        { date: Date.UTC(2019, 11, 8), emoji: '💫', title: '2I/Borisov Perihelion', desc: 'Second confirmed interstellar visitor reaches perihelion at 2.0 AU — clearly a comet with a coma and tail' },
        { date: Date.UTC(2025, 9, 29), emoji: '💫', title: '3I/ATLAS Perihelion', desc: 'Third interstellar object — perihelion at 1.36 AU, strongly hyperbolic (e ≈ 5.18), retrograde orbit' },
        { date: Date.UTC(2025, 11, 15), emoji: '💫', title: '3I/ATLAS Closest to Earth', desc: '3I/ATLAS passes nearest to Earth — outbound past Jupiter by spring 2026' },
        // Additional notable events
        { date: Date.UTC(1947, 6, 8), emoji: '🛸', title: 'Roswell Incident', desc: 'Alleged UFO crash in New Mexico — became the most famous UFO event in history' },
        { date: Date.UTC(1967, 10, 28), emoji: '📡', title: 'First Pulsar Discovered', desc: 'Jocelyn Bell Burnell detects first pulsar — initially nicknamed "LGM-1" (Little Green Men)' },
        { date: Date.UTC(1972, 11, 7), emoji: '📷', title: 'Blue Marble Photo (Apollo 17)', desc: 'Most reproduced photo in history — full disc of Earth from space' },
        { date: Date.UTC(1998, 10, 20), emoji: '🚀', title: 'ISS Construction Begins', desc: 'First module of International Space Station launched — continuous habitation since 2000' },
        { date: Date.UTC(2015, 8, 14), emoji: '🌊', title: 'First Gravitational Waves Detected', desc: 'LIGO detects ripples in spacetime from two merging black holes — confirmed Einstein\'s prediction' },
        { date: Date.UTC(2023, 0, 12), emoji: '🚀', title: 'Artemis I Returns from Moon', desc: 'Orion capsule returns after lunar flyby — first step back to Moon since Apollo' },
        // Future comet/interstellar predictions
        { date: Date.UTC(2026, 9, 22), emoji: '☄️', title: 'Comet Encke Returns (2026)', desc: 'Encke\'s next perihelion — every 3.3 years like clockwork' },
        { date: Date.UTC(2030, 3, 15), emoji: '☄️', title: 'Comet Encke Returns (2030)', desc: 'Another Encke perihelion — one of the most predictable comets' },
        { date: Date.UTC(2092, 0, 1), emoji: '☄️', title: 'Comet Swift-Tuttle Returns', desc: 'Parent comet of Perseid meteor shower returns — 130-year orbit, extremely close pass possible' },
        // Future events
        { date: Date.UTC(2029, 3, 13), emoji: '☄️', title: 'Asteroid Apophis Close Approach', desc: '99942 Apophis passes within 31,000 km of Earth — closer than satellites' },
        { date: Date.UTC(2030, 0, 1), emoji: '🔴', title: 'First Humans on Mars (Target)', desc: 'NASA/SpaceX targeting ~2030s for crewed Mars landing' },
        { date: Date.UTC(2031, 6, 1), emoji: '🪐', title: 'JUICE Arrives at Jupiter', desc: 'ESA spacecraft enters Jupiter orbit — detailed study of icy moons begins' },
        { date: Date.UTC(2032, 0, 1), emoji: '🔭', title: 'Nancy Grace Roman Telescope', desc: 'NASA\'s next great observatory — wide-field infrared, dark energy survey' },
        { date: Date.UTC(2034, 2, 20), emoji: '🪐', title: 'Great Conjunction of 2040', desc: 'Jupiter & Saturn conjunction — next major alignment' },
        { date: Date.UTC(2035, 8, 2), emoji: '☀️', title: 'Total Solar Eclipse (Japan/US)', desc: 'Total solar eclipse visible across Japan and western North America' },
        { date: Date.UTC(2039, 5, 1), emoji: '🌍', title: 'Rare 5-Planet Conjunction', desc: 'Mercury, Venus, Mars, Jupiter & Saturn cluster together visually' },
        { date: Date.UTC(2040, 4, 1), emoji: '🪐', title: 'Great Conjunction of 2040', desc: 'Jupiter & Saturn meet again — ~20-year cycle continues' },
        { date: Date.UTC(2061, 6, 28), emoji: '☄️', title: "Halley's Comet Returns", desc: 'Next perihelion of the most famous comet — visible to naked eye' },
        { date: Date.UTC(2065, 10, 22), emoji: '♀', title: 'Transit of Venus', desc: 'Venus passes across the face of the Sun — extremely rare, next after this: 2117' },
        { date: Date.UTC(2079, 7, 11), emoji: '🪐', title: 'Triple Conjunction (Jupiter-Saturn-Uranus)', desc: 'Exceptionally rare three-planet conjunction' },
        { date: Date.UTC(2080, 3, 1), emoji: '🛰️', title: 'Voyager 1 at ~300 AU', desc: 'Voyager 1 will be ~300 AU from the Sun, batteries long dead but still drifting' },
        { date: Date.UTC(2100, 0, 1), emoji: '🌟', title: 'Year 2100', desc: 'Start of the 22nd century' },
        { date: Date.UTC(2113, 11, 3), emoji: '♀', title: 'Transit of Venus (2117 Cycle)', desc: 'Venus transit visible from Earth — these come in pairs separated by ~8 years' },
    ], []);

    // Find events near the current displayed date (within ±3 years)
    const nearbyEvents = useMemo(() => {
        const currentMs = birthDate.getTime();
        const windowMs = 3 * 365.25 * 86400000; // ±3 year window
        return astronomicalEvents
            .filter(e => Math.abs(e.date - currentMs) <= windowMs)
            .sort((a, b) => Math.abs(a.date - currentMs) - Math.abs(b.date - currentMs));
    }, [birthDate, astronomicalEvents]);

    // Find the closest upcoming and closest past event
    const closestEvent = useMemo(() => {
        const currentMs = birthDate.getTime();
        let closest = astronomicalEvents[0];
        let closestDist = Math.abs(closest.date - currentMs);
        for (const e of astronomicalEvents) {
            const dist = Math.abs(e.date - currentMs);
            if (dist < closestDist) {
                closest = e;
                closestDist = dist;
            }
        }
        return { event: closest, daysAway: Math.round(closestDist / 86400000) };
    }, [birthDate, astronomicalEvents]);

    // Find next and previous events from current date for jump buttons
    const nextEvent = useMemo(() => {
        const currentMs = birthDate.getTime();
        const future = astronomicalEvents.filter(e => e.date > currentMs).sort((a, b) => a.date - b.date);
        return future.length > 0 ? future[0] : null;
    }, [birthDate, astronomicalEvents]);

    const prevEvent = useMemo(() => {
        const currentMs = birthDate.getTime();
        const past = astronomicalEvents.filter(e => e.date < currentMs).sort((a, b) => b.date - a.date);
        return past.length > 0 ? past[0] : null;
    }, [birthDate, astronomicalEvents]);

    const jumpToEvent = useCallback((eventDate: number) => {
        const baseMs = baseDateRef.current.getTime();
        const newOffset = (eventDate - baseMs) / 86400000;
        // Direct set without step-snapping so we land exactly on the event date
        const minOff = -HUNDRED_YEARS_MS / 86400000;
        const maxOff = HUNDRED_YEARS_MS / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, newOffset));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setBirthDate(new Date(baseMs + clamped * 86400000));
    }, []);

    return (
        <LinearGradient colors={['#0d0d2b', '#1a1a4e', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0d2b" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>

                <View style={styles.header}>
                    <Text style={styles.emoji}>☀️</Text>
                    <Text style={styles.title}>Solar System{'\n'}Time Machine</Text>
                    <Text style={styles.subtitle}>
                        {originalBirthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                <View style={styles.solarSystemContainer}>
                    <Text style={styles.sectionTitle}>☀️ Our Solar System — Real Orbits</Text>
                    <Text style={styles.sectionExplainer}>
                        This is a heliocentric (Sun-centered) view of our Solar System on the date shown. Unlike a natal chart (which is geocentric — Earth at center), this shows where every planet, dwarf planet, comet, and space probe ACTUALLY is.{"\n\n"}What you'll see:{"\n"}• 8 planets with color-coded orbit rings{"\n"}• 3 dwarf planets: Pluto, Ceres, and Eris{"\n"}• 3 famous comets: Halley's, Encke, and Hale-Bopp{"\n"}• 3 interstellar visitors: 'Oumuamua, Borisov, and ATLAS{"\n"}• The Asteroid Belt and Kuiper Belt{"\n"}• Voyager 1 & 2 — humanity's farthest travelers
                    </Text>

                    {/* Spin hint */}
                    <View style={styles.spinHint}>
                        <Text style={styles.spinHintText}>👆 Spin the wheel or use the slider below to travel through time!</Text>
                        <Text style={styles.spinHintDetail}>
                            Watch Mercury zip around while Neptune barely moves — that's real orbital mechanics!
                        </Text>
                    </View>

                    {(() => {
                        const ssSize = 502;
                        const ssCx = ssSize / 2;
                        const ssCy = ssSize / 2;

                        const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
                        const daysSinceJ2000 = (birthDate.getTime() - j2000.getTime()) / 86400000;

                        const solarPlanets = [
                            { name: 'Mercury', sym: '☿', L0: 252.25, rate: 4.09233, au: 0.387, e: 0.2056, wBar: 77.46, color: '#8C7E6D', dotR: 4 },
                            { name: 'Venus', sym: '♀', L0: 181.98, rate: 1.60213, au: 0.723, e: 0.0068, wBar: 131.53, color: '#E8CDA0', dotR: 6 },
                            { name: 'Earth', sym: '🌍', L0: 100.47, rate: 0.98560, au: 1.000, e: 0.0167, wBar: 102.94, color: '#4B8BBE', dotR: 7 },
                            { name: 'Mars', sym: '♂', L0: 355.45, rate: 0.52403, au: 1.524, e: 0.0934, wBar: 336.04, color: '#C1440E', dotR: 5 },
                            { name: 'Jupiter', sym: '♃', L0: 34.40, rate: 0.08309, au: 5.203, e: 0.0484, wBar: 14.33, color: '#C88B3A', dotR: 12 },
                            { name: 'Saturn', sym: '♄', L0: 50.08, rate: 0.03346, au: 9.537, e: 0.0542, wBar: 93.06, color: '#D4B36A', dotR: 10 },
                            { name: 'Uranus', sym: '♅', L0: 314.06, rate: 0.01173, au: 19.19, e: 0.0472, wBar: 173.01, color: '#73C2D0', dotR: 8 },
                            { name: 'Neptune', sym: '♆', L0: 304.35, rate: 0.00598, au: 30.07, e: 0.0086, wBar: 48.12, color: '#3B5DAA', dotR: 8 },
                        ];

                        // Equation of center: converts mean anomaly → true anomaly (3rd-order)
                        const eqCenter = (M: number, e: number) => {
                            const Mr = M * Math.PI / 180;
                            const c1 = (2 * e - e * e * e / 4) * Math.sin(Mr);
                            const c2 = (5 / 4) * e * e * Math.sin(2 * Mr);
                            const c3 = (13 / 12) * e * e * e * Math.sin(3 * Mr);
                            return (c1 + c2 + c3) * 180 / Math.PI;
                        };

                        const dwarfPlanets = [
                            { name: 'Pluto', sym: '♇', L0: 238.96, rate: 0.00397, au: 39.48, e: 0.2488, wBar: 224.07, color: '#CE93D8' },
                            { name: 'Ceres', sym: '⚳', L0: 153.94, rate: 0.21408, au: 2.77, e: 0.0758, wBar: 73.60, color: '#8D6E63' },
                            { name: 'Eris', sym: '⯰', L0: 36.02, rate: 0.00176, au: 67.67, e: 0.4407, wBar: 151.64, color: '#EEEEEE' },
                        ];

                        const comets = [
                            {
                                name: "Halley's", sym: '☄',
                                periDate: new Date(Date.UTC(1986, 1, 9)).getTime(),
                                periodDays: 27510,
                                a: 17.83, e: 0.967, periLong: 111.33,
                                color: '#E0F7FA',
                            },
                            {
                                name: 'Encke', sym: '☄',
                                periDate: new Date(Date.UTC(2023, 9, 22)).getTime(),
                                periodDays: 1204,
                                a: 2.22, e: 0.848, periLong: 186.5,
                                color: '#FFF9C4',
                            },
                            {
                                name: 'Hale-Bopp', sym: '☄',
                                periDate: new Date(Date.UTC(1997, 3, 1)).getTime(),
                                periodDays: 925000,
                                a: 186.0, e: 0.995, periLong: 130.6,
                                color: '#B2EBF2',
                            },
                        ];

                        const v1Waypoints = [
                            { date: Date.UTC(1977, 8, 5), lng: 340, au: 1.0 },
                            { date: Date.UTC(1978, 5, 1), lng: 10, au: 2.5 },
                            { date: Date.UTC(1979, 2, 5), lng: 38, au: 5.2 },
                            { date: Date.UTC(1980, 10, 12), lng: 100, au: 9.5 },
                            { date: Date.UTC(1983, 0, 1), lng: 180, au: 18 },
                            { date: Date.UTC(1990, 0, 1), lng: 235, au: 40 },
                            { date: Date.UTC(2000, 0, 1), lng: 252, au: 72 },
                            { date: Date.UTC(2012, 7, 25), lng: 258, au: 121 },
                            { date: Date.UTC(2030, 0, 1), lng: 262, au: 165 },
                        ];
                        const v2Waypoints = [
                            { date: Date.UTC(1977, 7, 20), lng: 335, au: 1.0 },
                            { date: Date.UTC(1978, 11, 1), lng: 5, au: 3.5 },
                            { date: Date.UTC(1979, 6, 9), lng: 40, au: 5.2 },
                            { date: Date.UTC(1981, 7, 26), lng: 115, au: 9.5 },
                            { date: Date.UTC(1986, 0, 24), lng: 195, au: 19.2 },
                            { date: Date.UTC(1989, 7, 25), lng: 250, au: 30.1 },
                            { date: Date.UTC(2000, 0, 1), lng: 280, au: 58 },
                            { date: Date.UTC(2018, 10, 5), lng: 293, au: 119 },
                            { date: Date.UTC(2030, 0, 1), lng: 298, au: 155 },
                        ];

                        const interpolateVoyager = (waypoints: typeof v1Waypoints, dateMs: number) => {
                            if (dateMs <= waypoints[0].date) return null;
                            if (dateMs >= waypoints[waypoints.length - 1].date) {
                                const last = waypoints[waypoints.length - 1];
                                const prev = waypoints[waypoints.length - 2];
                                const dt = (last.date - prev.date) / 86400000;
                                const auPerDay = (last.au - prev.au) / dt;
                                const lngPerDay = (last.lng - prev.lng) / dt;
                                const daysExtra = (dateMs - last.date) / 86400000;
                                return {
                                    lng: last.lng + lngPerDay * daysExtra,
                                    au: last.au + auPerDay * daysExtra,
                                };
                            }
                            for (let i = 0; i < waypoints.length - 1; i++) {
                                if (dateMs >= waypoints[i].date && dateMs < waypoints[i + 1].date) {
                                    const t = (dateMs - waypoints[i].date) / (waypoints[i + 1].date - waypoints[i].date);
                                    return {
                                        lng: waypoints[i].lng + t * (waypoints[i + 1].lng - waypoints[i].lng),
                                        au: waypoints[i].au + t * (waypoints[i + 1].au - waypoints[i].au),
                                    };
                                }
                            }
                            return null;
                        };

                        const v1Pos_data = interpolateVoyager(v1Waypoints, birthDate.getTime());
                        const v2Pos_data = interpolateVoyager(v2Waypoints, birthDate.getTime());

                        // Interstellar objects — hyperbolic trajectories
                        const interstellarObjs = [
                            { name: "1I/'Oumuamua", sym: '1I', periDate: Date.UTC(2017, 8, 9), q: 0.255, e: 1.1995, periLong: 115, color: '#FF8A80' },
                            { name: '2I/Borisov', sym: '2I', periDate: Date.UTC(2019, 11, 8), q: 2.007, e: 3.3572, periLong: 218, color: '#B9F6CA' },
                            { name: '3I/ATLAS', sym: '3I', periDate: Date.UTC(2025, 9, 29), q: 1.36, e: 5.18, periLong: 200, color: '#FFAB40' },
                        ];
                        const computeInterstellar = (obj: typeof interstellarObjs[0]) => {
                            const dtDays = (birthDate.getTime() - obj.periDate) / 86400000;
                            const a = -obj.q / (obj.e - 1);
                            const mu = 0.01720209895 * 0.01720209895; // GM in AU³/day²
                            const n = Math.sqrt(mu / Math.abs(a * a * a));
                            const M = n * dtDays;
                            // Solve hyperbolic Kepler's equation: M = e*sinh(H) - H
                            let H = M;
                            for (let k = 0; k < 30; k++) {
                                const dH = (obj.e * Math.sinh(H) - H - M) / (obj.e * Math.cosh(H) - 1);
                                H -= dH;
                                if (Math.abs(dH) < 1e-10) break;
                            }
                            const tanHalfNu = Math.sqrt((obj.e + 1) / (obj.e - 1)) * Math.tanh(H / 2);
                            const nu = 2 * Math.atan(tanHalfNu);
                            const r = obj.q * (1 + obj.e) / (1 + obj.e * Math.cos(nu));
                            const lng = obj.periLong + (nu * 180 / Math.PI);
                            return { r: Math.abs(r), lng, visible: Math.abs(r) < 75 };
                        };
                        const interstellarPositions = interstellarObjs.map(o => ({ ...o, pos: computeInterstellar(o) }));

                        const maxAU = 80;
                        const maxRadius = ssSize * 0.46;
                        const minRadius = ssSize * 0.07;
                        const scaleR = (au: number) => minRadius + (maxRadius - minRadius) * Math.sqrt(au / maxAU);

                        const ssDegToRad = (deg: number) => (deg * Math.PI) / 180;
                        const ssPosOnCircle = (lng: number, radius: number) => {
                            const rad = ssDegToRad(lng - 90);
                            return { x: ssCx + radius * Math.cos(rad), y: ssCy + radius * Math.sin(rad) };
                        };

                        return (
                            <View style={styles.solarSystemWheel} {...solarPanResponder.panHandlers}>
                                {(isSpinning || dayOffset !== 0) && (
                                    <View style={styles.solarSpinOverlay}>
                                        <Text style={styles.spinOverlayDate}>
                                            {birthDate.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </Text>
                                        <Text style={styles.spinOverlayDelta}>
                                            {dayOffset === 0 ? 'Original Date' : formatOffset(dayOffset)}
                                        </Text>
                                    </View>
                                )}
                                <Svg width={ssSize} height={ssSize}>
                                    <Circle cx={ssCx} cy={ssCy} r={ssSize * 0.48} fill="#05051a" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                                    {/* Asteroid belt */}
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(2.1)} fill="none" stroke="rgba(139,119,101,0.2)" strokeWidth={1} />
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(2.7)} fill="none" stroke="rgba(139,119,101,0.15)" strokeWidth={scaleR(3.3) - scaleR(2.1)} />
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(3.3)} fill="none" stroke="rgba(139,119,101,0.2)" strokeWidth={1} />

                                    {/* Kuiper Belt */}
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(40)} fill="none" stroke="rgba(100,100,140,0.12)" strokeWidth={scaleR(50) - scaleR(30)} />

                                    {/* Orbit rings */}
                                    {solarPlanets.map((p) => (
                                        <Circle
                                            key={`orbit-${p.name}`}
                                            cx={ssCx} cy={ssCy}
                                            r={scaleR(p.au)}
                                            fill="none"
                                            stroke={p.name === 'Earth' ? 'rgba(79,195,247,0.3)' : 'rgba(255,255,255,0.12)'}
                                            strokeWidth={p.name === 'Earth' ? 1.5 : 0.8}
                                            strokeDasharray={p.name === 'Earth' ? undefined : '2,4'}
                                        />
                                    ))}

                                    {/* Dwarf planet orbits */}
                                    {dwarfPlanets.map((dp) => (
                                        <Circle
                                            key={`orbit-${dp.name}`}
                                            cx={ssCx} cy={ssCy}
                                            r={scaleR(dp.au)}
                                            fill="none"
                                            stroke={`${dp.color}33`}
                                            strokeWidth={0.6}
                                            strokeDasharray="1,5"
                                        />
                                    ))}

                                    {/* Sun */}
                                    <Circle cx={ssCx} cy={ssCy} r={17.5} fill="#FFA000" />
                                    <Circle cx={ssCx} cy={ssCy} r={14} fill="#FFD54F" />
                                    <Circle cx={ssCx} cy={ssCy} r={9} fill="#FFECB3" />
                                    <Circle cx={ssCx} cy={ssCy} r={25} fill="none" stroke="rgba(255,213,79,0.25)" strokeWidth={5} />

                                    {/* Planets */}
                                    {solarPlanets.map((p) => {
                                        const meanLong = ((p.L0 + p.rate * daysSinceJ2000) % 360 + 360) % 360;
                                        const M = ((meanLong - p.wBar) % 360 + 360) % 360;
                                        const trueLong = (meanLong + eqCenter(M, p.e) + 360) % 360;
                                        const orbitR = scaleR(p.au);
                                        const pos = ssPosOnCircle(trueLong, orbitR);
                                        const dotR = p.dotR;
                                        return (
                                            <G key={`planet-${p.name}`}>
                                                {/* Planet body */}
                                                <Circle cx={pos.x} cy={pos.y} r={dotR} fill={p.color} />
                                                {/* Shading highlight for 3D look */}
                                                <Circle cx={pos.x - dotR * 0.25} cy={pos.y - dotR * 0.25} r={dotR * 0.5} fill="rgba(255,255,255,0.2)" />
                                                {/* Saturn rings */}
                                                {p.name === 'Saturn' && (
                                                    <G>
                                                        <Ellipse cx={pos.x} cy={pos.y} rx={dotR * 2.0} ry={dotR * 0.55} fill="none" stroke="#D4B36A" strokeWidth={1.2} opacity={0.7} />
                                                        <Ellipse cx={pos.x} cy={pos.y} rx={dotR * 2.4} ry={dotR * 0.65} fill="none" stroke="#C8A850" strokeWidth={0.8} opacity={0.5} />
                                                        <Ellipse cx={pos.x} cy={pos.y} rx={dotR * 1.6} ry={dotR * 0.45} fill="none" stroke="#BFA35A" strokeWidth={1.5} opacity={0.6} />
                                                    </G>
                                                )}
                                                {/* Jupiter banding hints */}
                                                {p.name === 'Jupiter' && (
                                                    <G>
                                                        <Line x1={pos.x - dotR * 0.7} y1={pos.y - dotR * 0.3} x2={pos.x + dotR * 0.7} y2={pos.y - dotR * 0.3} stroke="#A67B30" strokeWidth={1} opacity={0.4} />
                                                        <Line x1={pos.x - dotR * 0.8} y1={pos.y + dotR * 0.15} x2={pos.x + dotR * 0.8} y2={pos.y + dotR * 0.15} stroke="#B5843A" strokeWidth={1.2} opacity={0.35} />
                                                        <Line x1={pos.x - dotR * 0.6} y1={pos.y + dotR * 0.55} x2={pos.x + dotR * 0.6} y2={pos.y + dotR * 0.55} stroke="#A67B30" strokeWidth={0.8} opacity={0.3} />
                                                    </G>
                                                )}
                                                <SvgText
                                                    x={pos.x}
                                                    y={pos.y + (dotR + 14)}
                                                    fill={p.color}
                                                    fontSize={13}
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    alignmentBaseline="middle"
                                                >
                                                    {p.sym}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Dwarf planets */}
                                    {dwarfPlanets.map((dp) => {
                                        const dpMeanLong = ((dp.L0 + dp.rate * daysSinceJ2000) % 360 + 360) % 360;
                                        const dpM = ((dpMeanLong - dp.wBar) % 360 + 360) % 360;
                                        const dpLong = (dpMeanLong + eqCenter(dpM, dp.e) + 360) % 360;
                                        const dpR = scaleR(dp.au);
                                        const dpPos = ssPosOnCircle(dpLong, dpR);
                                        return (
                                            <G key={`dwarf-${dp.name}`}>
                                                <Circle cx={dpPos.x} cy={dpPos.y} r={4.5} fill={dp.color} opacity={0.85} />
                                                <SvgText x={dpPos.x} y={dpPos.y + 13}
                                                    fill={dp.color} fontSize={9} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle" opacity={0.9}>
                                                    {dp.name}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Comets */}
                                    {comets.map((c) => {
                                        const daysSincePeri = (birthDate.getTime() - c.periDate) / 86400000;
                                        const meanAnomaly = ((daysSincePeri / c.periodDays) * 360 % 360 + 360) % 360;
                                        const M = meanAnomaly * Math.PI / 180;
                                        let E = M + c.e * Math.sin(M);
                                        for (let k = 0; k < 30; k++) {
                                            const dE = (E - c.e * Math.sin(E) - M) / (1 - c.e * Math.cos(E));
                                            E -= dE;
                                            if (Math.abs(dE) < 1e-12) break;
                                        }
                                        const nu = 2 * Math.atan2(
                                            Math.sqrt(1 + c.e) * Math.sin(E / 2),
                                            Math.sqrt(1 - c.e) * Math.cos(E / 2)
                                        );
                                        const rAU = c.a * (1 - c.e * Math.cos(E));
                                        const displayAU = Math.min(rAU, 75);
                                        const cometR = scaleR(displayAU);
                                        const cometLong = (c.periLong + nu * 180 / Math.PI + 360) % 360;
                                        const cPos = ssPosOnCircle(cometLong, cometR);

                                        if (displayAU > 0.1) {
                                            return (
                                                <G key={`comet-${c.name}`}>
                                                    <Line x1={cPos.x} y1={cPos.y} x2={ssCx} y2={ssCy}
                                                        stroke={c.color} strokeWidth={0.5} opacity={0.3} />
                                                    <Circle cx={cPos.x} cy={cPos.y} r={3} fill={c.color} opacity={0.9} />
                                                    <SvgText x={cPos.x} y={cPos.y - 8}
                                                        fill={c.color} fontSize={6} fontWeight="bold"
                                                        textAnchor="middle" alignmentBaseline="middle" opacity={0.85}>
                                                        {c.name}
                                                    </SvgText>
                                                </G>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Voyager 1 */}
                                    {v1Pos_data && (() => {
                                        const v1R = scaleR(Math.min(v1Pos_data.au, 75));
                                        const v1Pos = ssPosOnCircle(v1Pos_data.lng, v1R);
                                        return (
                                            <G key="voyager1">
                                                <Circle cx={v1Pos.x} cy={v1Pos.y} r={2.5} fill="#FF5252" />
                                                <SvgText x={v1Pos.x} y={v1Pos.y - 7}
                                                    fill="#FF5252" fontSize={6} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle">
                                                    V1
                                                </SvgText>
                                            </G>
                                        );
                                    })()}

                                    {/* Voyager 2 */}
                                    {v2Pos_data && (() => {
                                        const v2R = scaleR(Math.min(v2Pos_data.au, 75));
                                        const v2Pos = ssPosOnCircle(v2Pos_data.lng, v2R);
                                        return (
                                            <G key="voyager2">
                                                <Circle cx={v2Pos.x} cy={v2Pos.y} r={2.5} fill="#69F0AE" />
                                                <SvgText x={v2Pos.x} y={v2Pos.y - 7}
                                                    fill="#69F0AE" fontSize={6} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle">
                                                    V2
                                                </SvgText>
                                            </G>
                                        );
                                    })()}

                                    {/* Interstellar visitors */}
                                    {interstellarPositions.filter(o => o.pos.visible).map(o => {
                                        const iR = scaleR(Math.min(o.pos.r, 75));
                                        const iPos = ssPosOnCircle(o.pos.lng, iR);
                                        return (
                                            <G key={`iso-${o.sym}`}>
                                                {/* Trail toward Sun */}
                                                <Line x1={iPos.x} y1={iPos.y} x2={ssCx} y2={ssCy}
                                                    stroke={o.color} strokeWidth={0.6} opacity={0.25} strokeDasharray="3,3" />
                                                <Circle cx={iPos.x} cy={iPos.y} r={4} fill={o.color} stroke="#fff" strokeWidth={0.5} />
                                                <SvgText x={iPos.x} y={iPos.y - 9}
                                                    fill={o.color} fontSize={7} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle">
                                                    {o.sym}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Earth highlight ring */}
                                    {(() => {
                                        const earthLong = ((100.47 + 0.98560 * daysSinceJ2000) % 360 + 360) % 360;
                                        const earthR = scaleR(1.0);
                                        const earthPos = ssPosOnCircle(earthLong, earthR);
                                        return (
                                            <Circle cx={earthPos.x} cy={earthPos.y} r={11} fill="none" stroke="#4FC3F7" strokeWidth={1.5} />
                                        );
                                    })()}
                                </Svg>

                                {/* Date label */}
                                <View style={styles.solarDateLabel}>
                                    <Text style={styles.solarDateText}>
                                        {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })()}

                    {/* ═══ DATE MODE TOGGLE ═══ */}
                    <View style={styles.dateModeRow}>
                        <TouchableOpacity
                            onPress={() => switchDateMode('birth')}
                            style={[styles.dateModeBtn, dateMode === 'birth' && styles.dateModeBtnActive]}
                        >
                            <Text style={[styles.dateModeBtnText, dateMode === 'birth' && styles.dateModeBtnTextActive]}>🎂 Birth Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => switchDateMode('today')}
                            style={[styles.dateModeBtn, dateMode === 'today' && styles.dateModeBtnActive]}
                        >
                            <Text style={[styles.dateModeBtnText, dateMode === 'today' && styles.dateModeBtnTextActive]}>📅 Today's Date</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ═══ TIME TRAVEL CONTROLS ═══ */}
                    <View style={styles.sliderSection}>
                        <Text style={styles.sliderTitle}>⏳ Time Travel</Text>
                        <Text style={styles.sliderDateText}>
                            {birthDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </Text>
                        {dayOffset !== 0 && (
                            <Text style={styles.sliderOffsetText}>{formatOffset(dayOffset)}</Text>
                        )}
                        {/* Increment selector */}
                        <View style={styles.stepSelectorRow}>
                            {steps.map((s, idx) => (
                                <TouchableOpacity
                                    key={s.label}
                                    style={[styles.stepSelectorBtn, idx === selectedStepIdx && styles.stepSelectorBtnActive]}
                                    onPress={() => selectStep(idx)}
                                >
                                    <Text style={[styles.stepSelectorText, idx === selectedStepIdx && styles.stepSelectorTextActive]}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View
                            style={styles.sliderTrackOuter}
                            onLayout={(e) => { const w = e.nativeEvent.layout.width; sliderWRef.current = w; setSliderW(w); }}
                            {...timeSliderPan.panHandlers}
                        >
                            <View style={styles.sliderTrack} />
                            <View style={[styles.sliderCenterMark, { left: sliderCenterFrac * sliderW - 1 }]} />
                            <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(sliderW - 24, sliderFrac * sliderW - 12)) }]} />
                        </View>
                        <View style={styles.sliderLabelsRow}>
                            <Text style={styles.sliderEndLabel}>{fmtSliderDate(sliderLeftDate)}</Text>
                            <Text style={styles.sliderEndLabel}>{fmtSliderDate(sliderRightDate)}</Text>
                        </View>

                        {/* Forward / Back / Reset */}
                        <View style={styles.stepRow}>
                            <TouchableOpacity style={styles.stepBtn} onPress={() => applyOffset(dayOffsetRef.current - steps[selectedStepIdx].days)}>
                                <Text style={styles.stepBtnText}>◀ {steps[selectedStepIdx].label}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.stepBtn, { backgroundColor: 'rgba(255,213,79,0.15)' }]} onPress={() => applyOffset(0)}>
                                <Text style={[styles.stepBtnText, { color: '#FFD54F' }]}>⟲ Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stepBtn} onPress={() => applyOffset(dayOffsetRef.current + steps[selectedStepIdx].days)}>
                                <Text style={styles.stepBtnText}>{steps[selectedStepIdx].label} ▶</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ═══ ASTRONOMICAL EVENTS TIMELINE ═══ */}
                    <View style={styles.eventsSection}>
                        <Text style={styles.eventsSectionTitle}>🌠 Notable Events Near This Date</Text>

                        {/* Jump to event buttons */}
                        <View style={styles.eventJumpRow}>
                            <TouchableOpacity
                                style={[styles.eventJumpBtn, !prevEvent && { opacity: 0.3 }]}
                                onPress={() => prevEvent && jumpToEvent(prevEvent.date)}
                                disabled={!prevEvent}
                            >
                                <Text style={styles.eventJumpBtnText}>◀ Prev Event</Text>
                                {prevEvent && (
                                    <Text style={styles.eventJumpBtnSub}>{new Date(prevEvent.date).getFullYear()}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.eventJumpBtn, !nextEvent && { opacity: 0.3 }]}
                                onPress={() => nextEvent && jumpToEvent(nextEvent.date)}
                                disabled={!nextEvent}
                            >
                                <Text style={styles.eventJumpBtnText}>Next Event ▶</Text>
                                {nextEvent && (
                                    <Text style={styles.eventJumpBtnSub}>{new Date(nextEvent.date).getFullYear()}</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {closestEvent && (
                            <TouchableOpacity
                                style={styles.closestEventBanner}
                                onPress={() => jumpToEvent(closestEvent.event.date)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.closestEventEmoji}>{closestEvent.event.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.closestEventTitle}>
                                        {closestEvent.daysAway === 0 ? '📍 TODAY: ' : `Nearest Event (${closestEvent.daysAway < 365 ? `${closestEvent.daysAway} days` : `${(closestEvent.daysAway / 365.25).toFixed(1)} years`} away): `}
                                        {closestEvent.event.title}
                                    </Text>
                                    <Text style={styles.closestEventDate}>
                                        {new Date(closestEvent.event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text style={styles.closestEventDesc}>{closestEvent.event.desc}</Text>
                                    <Text style={styles.closestEventTap}>Tap to jump to this date</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {nearbyEvents.length > 0 ? (
                            nearbyEvents.map((e, idx) => {
                                const eventDate = new Date(e.date);
                                const daysFromCurrent = Math.round((e.date - birthDate.getTime()) / 86400000);
                                const isFuture = daysFromCurrent > 0;
                                const absDays = Math.abs(daysFromCurrent);
                                const timeLabel = absDays === 0 ? 'This date!' : absDays < 30 ? `${absDays} day${absDays !== 1 ? 's' : ''} ${isFuture ? 'later' : 'earlier'}` : absDays < 365 ? `${Math.round(absDays / 30.4375)} mo ${isFuture ? 'later' : 'earlier'}` : `${(absDays / 365.25).toFixed(1)} yr${absDays > 365.25 * 2 ? 's' : ''} ${isFuture ? 'later' : 'earlier'}`;
                                return (
                                    <View key={`evt-${idx}`} style={[styles.eventCard, absDays === 0 && styles.eventCardHighlight]}>
                                        <Text style={styles.eventCardEmoji}>{e.emoji}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.eventCardTitle}>{e.title}</Text>
                                            <Text style={styles.eventCardDate}>
                                                {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — {timeLabel}
                                            </Text>
                                            <Text style={styles.eventCardDesc}>{e.desc}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.noEventsText}>
                                Spin the wheel to discover events! Notable astronomical moments are highlighted as you travel through time.
                            </Text>
                        )}
                    </View>

                    {/* Solar System Key — Planets */}
                    <Text style={styles.solarKeySectionHeader}>🪐 Planets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '☿', name: 'Mercury', orbit: '88 days', color: '#B0B0B0' },
                            { sym: '♀', name: 'Venus', orbit: '225 days', color: '#FFD700' },
                            { sym: '🌍', name: 'Earth', orbit: '365 days', color: '#4FC3F7' },
                            { sym: '♂', name: 'Mars', orbit: '687 days', color: '#FF6B35' },
                            { sym: '♃', name: 'Jupiter', orbit: '11.9 yrs', color: '#FFB74D' },
                            { sym: '♄', name: 'Saturn', orbit: '29.5 yrs', color: '#BCAAA4' },
                            { sym: '♅', name: 'Uranus', orbit: '84 yrs', color: '#80DEEA' },
                            { sym: '♆', name: 'Neptune', orbit: '165 yrs', color: '#5C6BC0' },
                        ].map(p => (
                            <View key={p.name} style={styles.solarKeyItem}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <Text style={styles.solarKeyName}>{p.sym} {p.name}</Text>
                                <Text style={styles.solarKeyOrbit}>{p.orbit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Dwarf Planets */}
                    <Text style={styles.solarKeySectionHeader}>🔵 Dwarf Planets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '♇', name: 'Pluto', orbit: '248 yrs', color: '#CE93D8' },
                            { sym: '⚳', name: 'Ceres', orbit: '4.6 yrs', color: '#8D6E63' },
                            { sym: '⯰', name: 'Eris', orbit: '559 yrs', color: '#EEEEEE' },
                        ].map(p => (
                            <View key={p.name} style={styles.solarKeyItem}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <Text style={styles.solarKeyName}>{p.sym} {p.name}</Text>
                                <Text style={styles.solarKeyOrbit}>{p.orbit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Comets */}
                    <Text style={styles.solarKeySectionHeader}>☄️ Famous Comets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '☄', name: "Halley's", orbit: '75.3 yrs', color: '#E0F7FA', desc: 'Most famous comet — last perihelion 1986, next 2061' },
                            { sym: '☄', name: 'Encke', orbit: '3.3 yrs', color: '#FFF9C4', desc: 'Shortest known orbital period of any comet' },
                            { sym: '☄', name: 'Hale-Bopp', orbit: '2,533 yrs', color: '#B2EBF2', desc: 'Great Comet of 1997 — visible to naked eye for 18 months' },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.sym} {p.name}  <Text style={styles.solarKeyOrbit}>{p.orbit}</Text></Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Belts & Zones */}
                    <Text style={styles.solarKeySectionHeader}>🪨 Belts & Zones</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { name: 'Asteroid Belt', desc: 'Rocky debris between Mars & Jupiter (2.1–3.3 AU)', color: '#8B7765' },
                            { name: 'Kuiper Belt', desc: 'Icy bodies beyond Neptune (30–50 AU), home to Pluto', color: '#6464A0' },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.name}</Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Interstellar Visitors */}
                    <Text style={styles.solarKeySectionHeader}>🌌 Interstellar Visitors</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '1I', name: "'Oumuamua", desc: 'First confirmed interstellar object — discovered Oct 2017. Passed perihelion at just 0.25 AU from the Sun. Hyperbolic trajectory, never coming back.', color: '#FF8A80' },
                            { sym: '2I', name: 'Borisov', desc: 'Second interstellar visitor — discovered Aug 2019. A comet passing through at 2.0 AU perihelion, with a highly hyperbolic orbit (e ≈ 3.36).', color: '#B9F6CA' },
                            { sym: '3I', name: 'ATLAS', desc: 'Third interstellar object — approached Mars Oct 2025, perihelion Oct 29 2025 at 1.36 AU. Retrograde & strongly hyperbolic (e ≈ 5.18). Passed Earth Dec 2025, outbound past Jupiter spring 2026.', color: '#FFAB40' },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.sym} {p.name}</Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Voyager Probes */}
                    <Text style={styles.solarKeySectionHeader}>🛰️ Voyager Probes</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: 'V1', name: 'Voyager 1', desc: 'Launched Sep 5, 1977 — farthest human-made object in interstellar space', color: '#FF5252', au: `~${v1AU > 0 ? v1AU.toFixed(1) : '—'} AU` },
                            { sym: 'V2', name: 'Voyager 2', desc: 'Launched Aug 20, 1977 — only probe to visit Uranus & Neptune', color: '#69F0AE', au: `~${v2AU > 0 ? v2AU.toFixed(1) : '—'} AU` },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.sym} {p.name}  <Text style={styles.solarKeyOrbit}>{p.au}</Text></Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.solarNote}>
                        <Text style={styles.solarNoteText}>
                            ℹ️  Planet positions use J2000.0 mean orbital elements (NASA reference). Comet positions use Keplerian elements with Kepler's equation solved iteratively. Interstellar objects use hyperbolic Kepler's equation for their unbound trajectories. Voyager distances are calculated from launch date at their known cruise velocities (~17 km/s and ~15.4 km/s). Distances use √ scaling so everything from Mercury to the Kuiper Belt fits on screen.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { padding: 20, paddingBottom: 40 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    emoji: { fontSize: 55, fontWeight: 'bold', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    solarSystemContainer: { marginBottom: 24 },
    sectionTitle: { fontSize: 23, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
    sectionExplainer: { fontSize: 14, fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 12, lineHeight: 21, paddingHorizontal: 8 },
    spinHint: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10, alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' },
    spinHintText: { fontSize: 15, color: '#ffd54f', textAlign: 'center', fontWeight: '700' },
    spinHintDetail: { fontSize: 13, fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', textAlign: 'left', lineHeight: 21, marginTop: 4 },
    solarSystemWheel: { backgroundColor: '#05051a', borderRadius: 16, padding: 8, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', position: 'relative' as const },
    solarSpinOverlay: { position: 'absolute' as const, top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, zIndex: 10, borderWidth: 1, borderColor: '#ffd700' },
    spinOverlayDate: { fontSize: 14, fontWeight: '700', color: '#ffd700', textAlign: 'center' },
    spinOverlayDelta: { fontSize: 11, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    solarDateLabel: { position: 'absolute' as const, bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    solarDateText: { fontSize: 13, fontWeight: '600' as const, color: '#FFD54F' },
    sliderSection: { marginBottom: 14, paddingHorizontal: 8, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    sliderTitle: { fontSize: 16, fontWeight: '800' as const, color: '#FFD54F', textAlign: 'center' as const, marginBottom: 4 },
    sliderDateText: { fontSize: 14, fontWeight: '700' as const, color: '#fff', textAlign: 'center' as const, marginBottom: 2 },
    sliderOffsetText: { fontSize: 12, fontWeight: '600' as const, color: '#FFD54F', textAlign: 'center' as const, marginBottom: 6 },
    sliderTrackOuter: { height: 44, justifyContent: 'center' as const, marginHorizontal: 4, marginVertical: 8 },
    sliderTrack: { position: 'absolute' as const, left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
    sliderCenterMark: { position: 'absolute' as const, width: 2, height: 20, backgroundColor: 'rgba(255,213,79,0.5)', borderRadius: 1, top: 12 },
    sliderThumb: { position: 'absolute' as const, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFD54F', borderWidth: 2, borderColor: '#fff', top: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    sliderLabelsRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingHorizontal: 4 },
    sliderEndLabel: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.5)' },
    sliderResetLabel: { fontSize: 13, fontWeight: '700' as const, color: '#FFD54F' },
    stepRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginTop: 6, gap: 4 },
    stepBtn: { flex: 1, paddingVertical: 4, paddingHorizontal: 1, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' as const },
    stepBtnText: { fontSize: 10, fontWeight: '800' as const, color: 'rgba(255,255,255,0.7)' },
    stepSelectorRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center' as const, gap: 6, marginBottom: 10 },
    stepSelectorBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    stepSelectorBtnActive: { backgroundColor: 'rgba(255,213,79,0.2)', borderColor: '#FFD54F' },
    stepSelectorText: { fontSize: 12, fontWeight: '700' as const, color: 'rgba(255,255,255,0.5)' },
    stepSelectorTextActive: { color: '#FFD54F' },
    solarKeyGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6, marginTop: 4 },
    solarKeySectionHeader: { fontSize: 15, fontWeight: '700' as const, color: '#ffd54f', marginTop: 14, marginBottom: 4, letterSpacing: 0.5 },
    solarKeyItem: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, width: '48%' as any },
    solarKeyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    solarKeyName: { fontSize: 13, fontWeight: '700' as const, color: '#fff', flex: 1 },
    solarKeyOrbit: { fontSize: 11, fontWeight: 'bold' as const, color: 'rgba(255,255,255,0.6)' },
    solarNote: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    solarNoteText: { fontSize: 12, fontWeight: 'bold' as const, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
    dateModeRow: { flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 10, marginBottom: 12 },
    dateModeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' as const, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    dateModeBtnActive: { backgroundColor: 'rgba(255,213,79,0.2)', borderColor: '#FFD54F' },
    dateModeBtnText: { fontSize: 14, fontWeight: '700' as const, color: 'rgba(255,255,255,0.5)' },
    dateModeBtnTextActive: { color: '#FFD54F' },
    // Events timeline styles
    eventsSection: { marginTop: 20, marginBottom: 10 },
    eventsSectionTitle: { fontSize: 18, fontWeight: '800' as const, color: '#FFD54F', textAlign: 'center' as const, marginBottom: 14 },
    closestEventBanner: { flexDirection: 'row' as const, backgroundColor: 'rgba(255,213,79,0.12)', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,213,79,0.3)', alignItems: 'flex-start' as const },
    closestEventEmoji: { fontSize: 28, marginRight: 10, marginTop: 2 },
    closestEventTitle: { fontSize: 14, fontWeight: '800' as const, color: '#FFD54F', lineHeight: 20 },
    closestEventDate: { fontSize: 12, fontWeight: '700' as const, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    closestEventDesc: { fontSize: 12, fontWeight: '600' as const, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 17 },
    eventCard: { flexDirection: 'row' as const, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'flex-start' as const },
    eventCardHighlight: { backgroundColor: 'rgba(79,195,247,0.15)', borderColor: 'rgba(79,195,247,0.4)' },
    eventCardEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
    eventCardTitle: { fontSize: 13, fontWeight: '800' as const, color: '#fff' },
    eventCardDate: { fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    eventCardDesc: { fontSize: 11, fontWeight: '600' as const, color: 'rgba(255,255,255,0.65)', marginTop: 3, lineHeight: 16 },
    noEventsText: { fontSize: 13, fontWeight: '600' as const, color: 'rgba(255,255,255,0.5)', textAlign: 'center' as const, padding: 16, lineHeight: 20 },
    eventJumpRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, gap: 10, marginBottom: 14 },
    eventJumpBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' as const, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    eventJumpBtnText: { fontSize: 13, fontWeight: '800' as const, color: '#fff' },
    eventJumpBtnSub: { fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    closestEventTap: { fontSize: 11, fontWeight: '700' as const, color: 'rgba(255,213,79,0.6)', marginTop: 4, fontStyle: 'italic' as const },

});
