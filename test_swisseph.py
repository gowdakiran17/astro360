import swisseph as swe

def test_rise_trans():
    jd = swe.julday(2023, 1, 1, 12.0)
    geopos = (77.59, 12.97, 0)
    flags = swe.FLG_SWIEPH
    rsmi = swe.CALC_RISE | swe.BIT_DISC_CENTER
    
    print(f"Testing with jd={jd}, geopos={geopos}, flags={flags}, rsmi={rsmi}")
    
    # Attempt 1: Similar to advanced_period.py (3: rsmi, 4: geopos)
    try:
        print("Attempt 1: (jd, body, rsmi, geopos, 0, 0, flags)")
        res = swe.rise_trans(jd, swe.SUN, rsmi, geopos, 0, 0, flags)
        print("Success 1:", res)
        return
    except TypeError as e:
        print("Failed 1:", e)
    except Exception as e:
        print("Failed 1 (Generic):", e)

    # Attempt 2: With flags as 3rd arg (3: flags, 4: rsmi, 5: geopos)
    try:
        print("Attempt 2: (jd, body, flags, rsmi, geopos, 0, 0)")
        res = swe.rise_trans(jd, swe.SUN, flags, rsmi, geopos, 0, 0)
        print("Success 2:", res)
        return
    except TypeError as e:
        print("Failed 2:", e)

    # Attempt 3: With starname as None?
    try:
        print("Attempt 3: (jd, body, None, flags, rsmi, geopos, 0, 0)")
        res = swe.rise_trans(jd, swe.SUN, None, flags, rsmi, geopos, 0, 0)
        print("Success 3:", res)
        return
    except TypeError as e:
        print("Failed 3:", e)

    # Attempt 4: No flags in middle? (jd, body, rsmi, geopos, 0, 0) - flags last?
    # This was Attempt 1.

    # Attempt 5: Maybe geopos is unpacked?
    try:
        print("Attempt 5: (jd, body, rsmi, lon, lat, alt, 0, 0, flags)")
        res = swe.rise_trans(jd, swe.SUN, rsmi, geopos[0], geopos[1], geopos[2], 0, 0, flags)
        print("Success 5:", res)
        return
    except TypeError as e:
        print("Failed 5:", e)

if __name__ == "__main__":
    test_rise_trans()
