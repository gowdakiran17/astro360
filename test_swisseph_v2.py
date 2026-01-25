import swisseph as swe

def test_rise_trans_correct():
    jd = swe.julday(2023, 1, 1, 12.0)
    geopos = (77.59, 12.97, 0)
    flags = swe.FLG_SWIEPH
    rsmi_rise = swe.CALC_RISE | swe.BIT_DISC_CENTER
    
    print(f"Testing correct signature with jd={jd}")
    
    # Signature: jd, body, lon, lat, alt, press, temp, rsmi, flag
    try:
        res = swe.rise_trans(
            jd, 
            swe.SUN, 
            geopos[0], 
            geopos[1], 
            geopos[2], 
            0, # press
            0, # temp
            rsmi_rise, 
            flags
        )
        print("Success:", res)
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    test_rise_trans_correct()
