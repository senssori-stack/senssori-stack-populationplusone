# TIME CAPSULE — ACCURACY TEST DATA

**Test Date: March 7, 2026**

This document shows the exact values the app's Time Capsule should display for three sample birth dates.
Values are pulled directly from the app's hardcoded historical data sources.

---

## TIME CAPSULE FIELDS (Portrait Back)

The portrait Time Capsule Back displays: Zodiac, Birthstone, Life Path Number, then 14 snapshot rows.

## TIME CAPSULE FIELDS (Landscape)

The landscape version adds: Minimum Wage, #1 Movie, and shows a THEN vs NOW column layout (16 snapshot rows).

---

## BIRTH DATE 1: November 15, 1971

### Header Info
- **Baby's Zodiac:** Scorpio
- **Baby's Birthstone:** Topaz / Citrine
- **Life Path Number:** 8

### Snapshot Data (THEN = 1971)

| Field                        | THEN (1971)                                     | NOW (Mar 2026)                    |
|------------------------------|--------------------------------------------------|-----------------------------------|
| Gas (Gallon) — National Avg  | $0.36                                            | $2.91                             |
| Minimum Wage *(landscape)*   | $1.60/hr                                         | $7.25/hr                          |
| Loaf of Bread                | $0.25                                            | $2.39                             |
| Dozen Eggs                   | $0.52                                            | $4.90                             |
| Milk (Gallon)                | $1.32                                            | $3.00                             |
| Gold (oz)                    | $41                                              | *(live API)*                      |
| Silver (oz)                  | $1.54                                            | *(live API)*                      |
| Dow Jones                    | N/A                                              | 44,873.28                         |
| #1 Song                      | Joy to the World by Three Dog Night              | Thats So True by Gracie Abrams    |
| #1 Movie *(landscape)*       | Fiddler on the Roof                              | Scream 7                          |
| Superbowl Champs             | Baltimore Colts (V)                              | Philadelphia Eagles               |
| World Series Champs          | Pittsburgh Pirates                               | Los Angeles Dodgers               |
| US Population                | 207,660,677                                      | 343,065,849                       |
| World Population             | 3,797,847,000                                    | 8,200,000,000                     |
| President                    | Richard Nixon                                    | Donald Trump                      |
| Vice President               | Spiro Agnew                                      | JD Vance                          |

---

## BIRTH DATE 2: September 12, 1955

### Header Info
- **Baby's Zodiac:** Virgo
- **Baby's Birthstone:** Sapphire
- **Life Path Number:** 5

### Snapshot Data (THEN = 1955)

| Field                        | THEN (1955)                                      | NOW (Mar 2026)                    |
|------------------------------|--------------------------------------------------|-----------------------------------|
| Gas (Gallon) — National Avg  | $0.23                                            | $2.91                             |
| Minimum Wage *(landscape)*   | $0.75/hr                                         | $7.25/hr                          |
| Loaf of Bread                | $0.18                                            | $2.39                             |
| Dozen Eggs                   | $0.70                                            | $4.90                             |
| Milk (Gallon)                | $0.52                                            | $3.00                             |
| Gold (oz)                    | $35                                              | *(live API)*                      |
| Silver (oz)                  | $0.85                                            | *(live API)*                      |
| Dow Jones                    | N/A                                              | 44,873.28                         |
| #1 Song                      | Rock Around the Clock by Bill Haley              | Thats So True by Gracie Abrams    |
| #1 Movie *(landscape)*       | Lady and the Tramp                               | Scream 7                          |
| Superbowl Champs             | N/A (first Super Bowl was 1967)                  | Philadelphia Eagles               |
| World Series Champs          | Brooklyn Dodgers                                 | Los Angeles Dodgers               |
| US Population                | 165,931,202                                      | 343,065,849                       |
| World Population             | 3,550,000,000                                    | 8,200,000,000                     |
| President                    | Dwight D. Eisenhower                             | Donald Trump                      |
| Vice President               | Richard Nixon                                    | JD Vance                          |

---

## BIRTH DATE 3: July 7, 1987

### Header Info
- **Baby's Zodiac:** Cancer
- **Baby's Birthstone:** Ruby
- **Life Path Number:** 3

### Snapshot Data (THEN = 1987)

| Field                        | THEN (1987)                                      | NOW (Mar 2026)                    |
|------------------------------|--------------------------------------------------|-----------------------------------|
| Gas (Gallon) — National Avg  | $0.90                                            | $2.91                             |
| Minimum Wage *(landscape)*   | $3.35/hr                                         | $7.25/hr                          |
| Loaf of Bread                | $0.54                                            | $2.39                             |
| Dozen Eggs                   | $0.54                                            | $4.90                             |
| Milk (Gallon)                | $2.28                                            | $3.00                             |
| Gold (oz)                    | $448                                             | *(live API)*                      |
| Silver (oz)                  | $7.01                                            | *(live API)*                      |
| Dow Jones                    | N/A                                              | 44,873.28                         |
| #1 Song                      | Walk Like an Egyptian by The Bangles             | Thats So True by Gracie Abrams    |
| #1 Movie *(landscape)*       | Three Men and a Baby                             | Scream 7                          |
| Superbowl Champs             | New York Giants (XXI)                            | Philadelphia Eagles               |
| World Series Champs          | Minnesota Twins                                  | Los Angeles Dodgers               |
| US Population                | 242,288,918                                      | 343,065,849                       |
| World Population             | 4,500,000,000                                    | 8,200,000,000                     |
| President                    | Ronald Reagan                                    | Donald Trump                      |
| Vice President               | George H.W. Bush                                 | JD Vance                          |

---

## DATA SOURCES (as shown in Time Capsule footer)

bls.gov, eia.gov, metalpriceapi.com, alphavantage.co, census.gov, last.fm, boxofficemojo.com, espn.com, usa.gov

## NOTES

- **Pre-2020 dates** use yearly averages (not month-specific) from hardcoded data in `historical-snapshot.ts` and `comprehensive-historical-data.ts`
- **Gold/Silver NOW** values come from live GoldPrice.org API at runtime
- **Dow Jones NOW** comes from live Alpha Vantage API; historical Dow not available pre-2020
- **#1 Song THEN** is the year's Billboard Hot 100 #1 (yearly, not date-specific for pre-2020)
- **Minimum Wage** uses `getFederalMinimumWage()` which looks up the federal rate in effect for that year
- **Portrait version** omits Minimum Wage and #1 Movie rows
- **Landscape version** includes all 16 rows plus THEN/NOW columns side by side
