# VedAstro Logic Analysis

## 1. Architectural Overview
VedAstro represents a paradigm shift in astrological computation, moving away from monolithic calculation engines towards a modular, event-driven architecture. The core philosophy is encapsulated in the formula:

**`Event Prediction = (Data + Logic) * Time`**

This separation of concerns allows for:
- **Data**: Static definitions of astrological events (stored in XML).
- **Logic**: Pure functions that verify if an astrological condition is met (C# Static Methods).
- **Time**: A dynamic iterator that slices time to check for event occurrences.

## 2. Library/Logic Structure
Based on the analysis of the VedAstro repository and its Python wrapper, the `Library/Logic` folder is the brain of the application.

### Key Components

#### A. The `Calculate` Class (`Calculate.cs`)
This is the central hub for all astronomical and astrological mathematics. It likely wraps the Swiss Ephemeris (`SwissEphNet`) for high-precision planetary positions.
- **Role**: Pure calculation engine.
- **Key Methods**:
  - `AllPlanetData(PlanetName, Time)`: Returns longitude, speed, declination, etc.
  - `AllHouseData(HouseName, Time)`: Returns cusp longitudes and house details.
  - `AllZodiacSignData`: Returns sign-specific attributes.
- **Design Pattern**: Static methods for stateless, thread-safe calculations.

#### B. Event Data System (XML + Enums)
VedAstro decouples the *definition* of an event from its *detection*.
1.  **XML Storage**: Hardcoded event data (e.g., "Sun in Aries", descriptions, tags) is stored in XML files.
2.  **Enum Linking**: `EventNames` (Enum) acts as a bridge, linking the XML data to the specific calculator method.
3.  **Calculator Methods**: Small, focused functions that return a boolean (`IsOccurring`).

#### C. Event Generation Workflow
1.  **Input**: User provides birth details (Time + Location).
2.  **Time Slicing**: The system generates a range of time slices (start to end).
3.  **Iteration**: For each time slice, the system iterates through the list of active `EventData`.
4.  **Logic Check**: The corresponding `CalculatorMethod` is invoked.
    - If `True`: An `Event` instance is created, merging the XML data with the specific time slice.
    - If `False`: Skipped.
5.  **Output**: A list of `Event` objects (Prediction).

## 3. Integration & Implementation Strategy
To replicate or integrate this logic into our Python backend (`astro_app/backend/astrology`), we should follow a similar modular pattern.

### Current Implementation Status
We have established the foundation in `period_analysis/core.py` and `validators.py`.

#### `AstroCalculate` (Python Equivalent of `Calculate.cs`)
Located in `period_analysis/core.py`, this class should serve as the static entry point for all calculations.
```python
class AstroCalculate:
    @staticmethod
    def calculate_chart_snapshot(date, time, ...):
        # Calls underlying engine (e.g., SwissEph or VedAstro wrapper)
        pass
```

#### Planned Modules
1.  **`calculators/`**:
    -   `planetary_positions.py`: Longitude, latitude, speed.
    -   `house_systems.py`: Placidus, Koch, etc.
    -   `yogas.py`: Logic for specific combinations (Gajakesari, etc.).
2.  **`events/`**:
    -   `definitions.json`: Python equivalent of the XML storage.
    -   `generator.py`: The time-slicing logic engine.

## 4. Key Algorithms to Port
1.  **Planetary Strength (Shadbala)**: Complex multi-factor scoring.
2.  **Dasha Systems**: Vimshottari calculation requires precise Moon longitude and year length logic.
3.  **Transit Hits**: Efficiently checking planetary ingress/egress without re-calculating every second.

## 5. References
- **Source**: [VedAstro GitHub](https://github.com/VedAstro/VedAstro/tree/master/Library/Logic)
- **Core Library**: Swiss Ephemeris
- **Wrapper**: `VedAstro.Python`
