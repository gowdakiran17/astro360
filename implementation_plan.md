# Implementation Plan: Astro360 Feature Expansion

Based on the `GAP_ANALYSIS.md`, this plan outlines the phased approach to bringing the codebase to feature parity with `features.md`.

## Phase 1: Core Enhancements (Days 1-3)
*Goal: Strengthen existing modules and fill minor gaps in basic astrology.*

### Backend
1.  **Panchang & Muhurta**:
    *   Expand `panchang.py` to include **Panchaka Rahita** logic.
    *   Enhance `muhurata.py` to implement a true **Muhurta Finder** (search within date range).
2.  **Planetary Analysis**:
    *   Implement `avasthas.py` (Planetary States: Baal, Kumar, etc.).
    *   Implement **Bhava Bala** logic in `strength.py`.
    *   Add **Special Points** (Bhrigu Bindu, Fortuna) to `calculations.py`.
3.  **Refactor Transits**:
    *   Add **Nakshatra Ingress** detection to `transits.py`.

### Frontend
1.  **UI Updates**:
    *   Update `PanchangDisplay.tsx` to show Panchaka & Avasthas.
    *   Add "Special Points" section to Chart view.

## Phase 2: The Jaimini Module (Days 4-6)
*Goal: Implement the missing Jaimini Astrology system.*

### Backend
1.  **New Module**: Create `astro_app/backend/astrology/jaimini/`.
2.  **Karakas**: Implement `karakas.py` (Atmakaraka, Amatyakaraka, etc.).
3.  **Argala**: Implement `argala.py` (Planetary Intervention).
4.  **Chara Dasha**: Implement `chara_dasha.py` (Sign-based dasha system).
5.  **Arudha**: Implement `arudha.py` (Arudha Lagna & Padas).
6.  **Router**: expose endpoints in `jaimini_router.py`.

### Frontend
1.  **Jaimini Dashboard**: Create a dedicated `JaiminiDashboard.tsx` with tabs for Karakas, Dasha, and Arudha.

## Phase 3: Varshphal (Solar Return) & Advanced Tools (Days 7-10)
*Goal: Implement annual horoscopy and advanced research tools.*

### Backend
1.  **Varshphal Engine**: Create `astro_app/backend/astrology/varshphal/`.
    *   Implement `solar_return.py` (Calculate return time & chart).
    *   Implement `muntha.py` & `mudda_dasha.py`.
    *   Implement `panchadhikari.py` (Lords of the year).
2.  **Panchapakshi**: Create `panchapakshi.py` for Biorhythm calculations.
3.  **Advanced Transits**:
    *   Implement `transit_search.py` (Find when Jupiter enters Aries, etc.).
    *   Implement `transit_hitlist.py` (Sensitive points triggering).

### Frontend
1.  **Varshphal View**: Create `SolarReturnPage.tsx`.
2.  **Panchapakshi Tool**: Create a "Biorhythm/Activity Planner" UI.

## Phase 4: Niche & Specialist Features (Days 11+)
*Goal: Add the highly specific and "Pro" features.*

1.  **Advanced Ashtakavarga**: Add "Transit Scores" and "Interpetation".
2.  **Divisional Deities**: Map deities for D60, D45, etc.
3.  **Moon Tools**: Chandra Kriya/Vela/Avsastha implementation.
4.  **Offline Support**: Implement `PWA` features or `localStorage` caching mechanisms.
