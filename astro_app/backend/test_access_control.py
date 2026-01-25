from astro_app.backend.monetization.access_control import check_access, UserTier, Feature
import sys

def test_access_control():
    print("Testing Access Control...")
    
    # 1. Free Tier accessing Basic Chart (Allowed)
    try:
        check_access(Feature.BASIC_CHART, UserTier.FREE)
        print("Success: Free tier accessed Basic Chart.")
    except PermissionError as e:
        print(f"Failed: {e}")

    # 2. Free Tier accessing Divisional Charts (Denied)
    try:
        check_access(Feature.DIVISIONAL_CHARTS, UserTier.FREE)
        print("Failed: Free tier accessed Divisional Charts (Should be denied).")
    except PermissionError as e:
        print(f"Success: Denied access correctly. {e}")

    # 3. Premium Tier accessing Divisional Charts (Allowed)
    try:
        check_access(Feature.DIVISIONAL_CHARTS, UserTier.PREMIUM)
        print("Success: Premium tier accessed Divisional Charts.")
    except PermissionError as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_access_control()
