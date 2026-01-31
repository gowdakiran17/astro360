# Gap Analysis: Astro360

This document compares the desired features listed in `features.md` with the current codebase state.

## 1. Dashas & Timelines
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Multiple Levels of Mahadasha | ✅ Implemented | `dasha.py` supports down to Prana (Level 5). |
| Mudda Dasha | ❌ Missing | No logic found. Required for Varshphal. |
| Patyayini Dasha | ❌ Missing | No logic found. |
| Chara Dasha | ❌ Missing | No Jaimini logic found. |
| Dasha Samdhi | ❌ Missing | Logic to identify junction points is missing. |
| Vimshottari Remedies | ❌ Missing | No remedy mapping logic found. |
| Cosmic Timeline | ⚠️ Partial | `panchang.py` has `get_timeline_segments` but lacks comprehensive integration. |

## 2. Panchang & Calendar
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Advanced Panchang | ✅ Implemented | `panchang.py` covers 5 attributes. |
| Muhurta Finder | ⚠️ Partial | `get_planner_moments` covers Golden/Silence moments but needs full search. |
| Hora Explorer | ⚠️ Partial | Basic Hora logic likely exists in `muhurata.py` but no dedicated explorer. |
| Panchaka Rahita | ❌ Missing | No specific function found. |
| Moon Level Tools | ❌ Missing | Moorti Nirnaya, Chandra Kriya, Vela, Avsastha are missing. |
| Tithi Pravesh | ❌ Missing | No Annual Tithi return logic. |
| Watch Alerts | ❌ Missing | Backend logic missing (notifications). |

## 3. Transits (Gochara)
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Current Transit | ✅ Implemented | `transits.py` calculates positions. |
| Transit Finder | ❌ Missing | No search capability for future planetary positions. |
| Nakshatra Transits | ❌ Missing | No logic to track ingress into Nakshatra boundaries. |
| Transit Hitlist | ❌ Missing | No sensitivity analysis logic. |
| Sign Ingress | ❌ Missing | No logic to track sign changes. |
| Transit Aspects | ✅ Implemented | Basic Western aspects in `transits.py`, missing Vedic/Tajik aspects. |

## 4. Planetary Analysis
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Shadbala | ✅ Implemented | `shadbala.py` exists (needs verification of completeness). |
| Bhava Bala | ❌ Missing | No dedicated logic found. |
| Avasthas | ❌ Missing | No planetary state calculations. |
| Special Points | ❌ Missing | Bhrigu Bindu, Fortuna, Mrtyu Bhaga, Varnada missing. |
| Jaimini Features | ❌ Missing | Karakas, Argala, Arudha Padas entirely missing. |

## 5. Divisional Charts
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Basic Vargas | ✅ Implemented | `divisional.py` covers standard D-charts. |
| Advanced Vargas | ❌ Missing | Privitriya Drekkana, Somnath/Jagannath Drekkana missing. |
| Solar Return (Varshphal) | ❌ Missing | Entire Varshphal module missing. |
| Deities | ❌ Missing | Logic to map Varga deities missing. |

## 6. Tools & Utilities
| Feature | Status | Notes |
| :--- | :--- | :--- |
| Ashtakavarga | ⚠️ Partial | `ashtakvarga.py` calculates points but misses interpretation & transit scores. |
| Panchapakshi | ❌ Missing | No Biorhythm logic found. |
| Compatibility | ✅ Implemented | `matching.py` exists. |
| Offline Charts | ❌ Missing | Frontend logic for offline storage unclear/missing. |
| Events/Lifecycle | ❌ Missing | Database schema and API for user events missing. |

## Summary
The "Core" is solid (Chart, Dasha, Basic Panchang). The "Pro" features (Jaimini, Varshphal, Advanced Transits, Research Tools) are largely missing.
