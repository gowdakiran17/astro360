"""
KP Service - Main Orchestrator
Coordinates all KP modules to provide complete KP analysis.
"""

from typing import Dict, List
from datetime import datetime
from astro_app.backend.astrology.chart import calculate_chart
from .kp_core import (
    calculate_kp_planet_details,
    calculate_house_cusps_kp
)
from .kp_significators import calculate_significators, get_planet_house
from .kp_dasha import (
    generate_mahadasha_periods,
    generate_antardasha_periods,
    get_current_dasha_period
)
from .kp_scoring import (
    calculate_all_period_scores,
    get_antardasha_quality
)
from .kp_predictions import (
    analyze_planet_potential,
    generate_detailed_prediction,
    analyze_category_report,
    analyze_event_promise
)
from .nakshatra_nadi_engine import NakshatraNadiEngine


class KPService:
    """Main KP Astrology service orchestrator."""
    
    @staticmethod
    def _calculate_raw_kp_data(birth_details: Dict) -> Dict:
        """Internal method to get raw KP data for subsequent analysis."""
        base_chart = calculate_chart(
            birth_details["date"],
            birth_details["time"],
            birth_details["timezone"],
            birth_details["latitude"],
            birth_details["longitude"]
        )
        
        ascendant_longitude = base_chart["ascendant"]["longitude"]
        
        kp_planets = []
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        for planet in base_chart["planets"]:
            kp_details = calculate_kp_planet_details(
                planet["name"],
                planet["longitude"]
            )
            # Add house and sign lord for Nadi analysis
            kp_details["house"] = get_planet_house(planet["longitude"], ascendant_longitude)
            
            # Calculate sign lord
            sign_num = int(planet["longitude"] / 30)
            sign_name = signs[sign_num]
            from .nakshatra_nadi_engine import SIGN_LORDS
            kp_details["sign_lord"] = SIGN_LORDS.get(sign_name, "")
            kp_details["sign"] = sign_name
            kp_details["is_retro"] = planet.get("speed", 0) < 0
            
            kp_planets.append(kp_details)
        
        house_cusps = calculate_house_cusps_kp(
            ascendant_longitude,
            base_chart.get("cusps_placidus")
        )
        
        raw_significators = calculate_significators(
            kp_planets,
            house_cusps,
            ascendant_longitude
        )
        
        return {
            "planets": kp_planets,
            "house_cusps": house_cusps,
            "significators": raw_significators,
            "ascendant": {
                "longitude": ascendant_longitude,
                "zodiac_sign": base_chart["ascendant"]["zodiac_sign"]
            }
        }

    @staticmethod
    def calculate_complete_kp_chart(birth_details: Dict) -> Dict:
        """Public method for CP chart including formatted data for frontend."""
        data = KPService._calculate_raw_kp_data(birth_details)
        raw_significators = data["significators"]
        
        # Transform for frontend (KPSignificatorsTable expects {planets, houses})
        formatted_significators = {
            "planets": {},
            "houses": {}
        }
        
        for h_num, sigs in raw_significators.items():
            formatted_significators["houses"][str(h_num)] = sigs["all"]
            for p_name in sigs["all"]:
                if p_name not in formatted_significators["planets"]:
                    formatted_significators["planets"][p_name] = []
                formatted_significators["planets"][p_name].append(h_num)
        
        return {
            "planets": data["planets"],
            "house_cusps": data["house_cusps"],
            "significators": formatted_significators,
            "ascendant": {
                "longitude": data["ascendant"]["longitude"],
                "sign": data["ascendant"]["zodiac_sign"]
            }
        }
    
    @staticmethod
    def calculate_dasha_timeline(birth_details: Dict, years_ahead: int = 5) -> Dict:
        """
        Calculate Dasha timeline for specified years.
        
        Args:
            birth_details: Birth details dict
            years_ahead: Number of years to calculate
            
        Returns:
            Dasha timeline with Mahadasha and Antardasha
        """
        # Get Moon longitude from base chart
        base_chart = calculate_chart(
            birth_details["date"],
            birth_details["time"],
            birth_details["timezone"],
            birth_details["latitude"],
            birth_details["longitude"]
        )
        
        moon_longitude = None
        for planet in base_chart["planets"]:
            if planet["name"] == "Moon":
                moon_longitude = planet["longitude"]
                break
        
        if moon_longitude is None:
            return {"error": "Could not find Moon position"}
        
        # Parse birth date
        birth_date = datetime.strptime(
            f"{birth_details['date']} {birth_details['time']}",
            "%d/%m/%Y %H:%M"
        )
        
        # Generate Mahadasha periods
        mahadashas = generate_mahadasha_periods(birth_date, moon_longitude, years_ahead)
        
        # Generate Antardasha for each Mahadasha
        timeline = []
        for md in mahadashas:
            md_start = datetime.strptime(md["start_date"], "%d/%m/%Y")
            
            antardashas = generate_antardasha_periods(
                md["lord"],
                md_start,
                md["duration_years"]
            )
            
            timeline.append({
                "mahadasha": md,
                "antardashas": antardashas
            })
        
        # Get current period
        current = get_current_dasha_period(birth_date, moon_longitude)
        
        return {
            "timeline": timeline,
            "current_period": current,
            "birth_date": birth_details["date"],
            "years_ahead": years_ahead
        }
    
    @staticmethod
    def calculate_precision_scores(birth_details: Dict) -> Dict:
        """
        Calculate precision scores for all planets.
        
        Args:
            birth_details: Birth details dict
            
        Returns:
            Precision scores for all periods
        """
        # Get KP chart (raw data for internal calculation)
        kp_data = KPService._calculate_raw_kp_data(birth_details)
        significators = kp_data["significators"]
        
        # Calculate scores
        scores = calculate_all_period_scores(significators)
        
        return {
            "scores": scores,
            "planets": kp_data["planets"]
        }
    
    @staticmethod
    def analyze_detailed_predictions(birth_details: Dict) -> Dict:
        """
        Generate detailed predictions for current period.
        
        Args:
            birth_details: Birth details dict
            
        Returns:
            Detailed prediction analysis
        """
        # Get KP chart (raw data for internal calculation)
        kp_data = KPService._calculate_raw_kp_data(birth_details)
        
        # Get Dasha timeline
        dasha_data = KPService.calculate_dasha_timeline(birth_details, years_ahead=5)
        
        if "error" in dasha_data:
            return {
                "error": dasha_data["error"],
                "prediction": "Unable to calculate Dasha period. Please verify birth details.",
                "house_activations": []
            }
            
        current_period = dasha_data.get("current_period")
        if not current_period or "error" in current_period:
            return {
                "error": "Could not determine current period",
                "prediction": "Current Dasha period could not be calculated.",
                "house_activations": []
            }
        
        # Generate prediction
        prediction = generate_detailed_prediction(
            current_period,
            kp_data["house_cusps"],
            kp_data["planets"],
            kp_data["significators"]
        )
        
        return prediction
    
    @staticmethod
    def analyze_event_potential(birth_details: Dict) -> Dict:
        """
        Analyze potential for various life events (Promise analysis).
        
        Args:
            birth_details: Birth details dict
            
        Returns:
            Flat dictionary of event potentials for the frontend
        """
        # Get KP chart (raw data for internal calculation)
        kp_data = KPService._calculate_raw_kp_data(birth_details)
        
        # Frontend event IDs
        event_ids = [
            "job_promotion", "marriage", "foreign_travel", 
            "property_purchase", "financial_windfall", 
            "higher_education", "public_fame"
        ]
        
        potentials = {}
        for eid in event_ids:
            # Map to backend IDs
            be_id = eid
            if eid == "financial_windfall": be_id = "wealth_gains"
            elif eid == "higher_education": be_id = "education_success"
            elif eid == "public_fame": be_id = "name_fame"
            
            res = analyze_event_promise(
                be_id,
                kp_data["house_cusps"],
                kp_data["planets"],
                kp_data["significators"]
            )
            potentials[eid] = res["potential"]
            
        return {
            "potentials": potentials,
            "house_cusps": kp_data["house_cusps"]
        }
    
    
    @staticmethod
    def generate_category_report(birth_details: Dict, category: str) -> Dict:
        """
        Generate category-wise detailed report.
        
        Args:
            birth_details: Birth details dict
            category: Category name (career, love, finance, property, health, fame)
            
        Returns:
            Category report
        """
        # Get KP chart (raw data for internal calculation)
        kp_data = KPService._calculate_raw_kp_data(birth_details)
        
        # Get Dasha timeline
        dasha_data = KPService.calculate_dasha_timeline(birth_details, years_ahead=5)
        
        # Extract Antardasha periods
        all_antardashas = []
        for item in dasha_data["timeline"]:
            all_antardashas.extend(item["antardashas"])
        
        # Generate report
        report = analyze_category_report(
            category,
            kp_data["house_cusps"],
            kp_data["planets"],
            kp_data["significators"],
            all_antardashas
        )
        
        return report
    
    @staticmethod
    def generate_complete_report(birth_details: Dict) -> Dict:
        """
        Generate complete KP report with all features.
        
        Args:
            birth_details: Birth details dict
            
        Returns:
            Complete KP report
        """
        # Get all components
        kp_chart = KPService.calculate_complete_kp_chart(birth_details)
        dasha_timeline = KPService.calculate_dasha_timeline(birth_details, years_ahead=5)
        precision_scores = KPService.calculate_precision_scores(birth_details)
        detailed_predictions = KPService.analyze_detailed_predictions(birth_details)
        event_potential = KPService.analyze_event_potential(birth_details)
        
        # Generate category reports
        categories = ["career", "love", "finance", "property", "health", "fame"]
        category_reports = {}
        for category in categories:
            category_reports[category] = KPService.generate_category_report(
                birth_details,
                category
            )
        
        return {
            "birth_chart": kp_chart,
            "dasha_timeline": dasha_timeline,
            "precision_scores": precision_scores,
            "detailed_predictions": detailed_predictions,
            "event_potential": event_potential,
            "category_reports": category_reports
        }

    @staticmethod
    def get_nakshatra_nadi_analysis(birth_details: Dict) -> Dict:
        """
        Perform a comprehensive Nakshatra Nadi analysis.
        """
        raw_data = KPService._calculate_raw_kp_data(birth_details)
        planets = raw_data["planets"]
        significators = raw_data["significators"]
        
        # Calculate ascendant sign for house lordships
        ascendant_longitude = raw_data["ascendant"]["longitude"]
        sign_num = int(ascendant_longitude / 30)
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        ascendant_sign = signs[sign_num]
        
        # Calculate house lordships based on ascendant
        house_lordships = NakshatraNadiEngine.calculate_house_lordships(ascendant_sign)
        
        # Extended significators for Rahu/Ketu
        enhanced_planets = NakshatraNadiEngine.get_extended_planets(planets, house_lordships)
        
        # Helper to get planet significators by name
        planet_data_map = {p["planet"]: p for p in enhanced_planets}
        
        # Enhance each planet with complete 4-layer significator data
        complete_planets = []
        for planet in enhanced_planets:
            planet_name = planet["planet"]
            
            # PL Layer (Planet own significators)
            pl_sig = planet["nadi_significators"]
            
            # NL Layer (Nakshatra Lord)
            star_lord = planet["star_lord"]
            nl_data = planet_data_map.get(star_lord)
            nl_sig = nl_data["nadi_significators"] if nl_data else {"pos": None, "lords": []}
            
            # SL Layer (Sub Lord)
            sub_lord = planet["sub_lord"]
            sl_data = planet_data_map.get(sub_lord)
            sl_sig = sl_data["nadi_significators"] if sl_data else {"pos": None, "lords": []}
            
            # SSL Layer (Sub-Sub Lord)
            sub_sub_lord = planet.get("sub_sub_lord")
            ssl_data = planet_data_map.get(sub_sub_lord)
            ssl_sig = ssl_data["nadi_significators"] if ssl_data else {"pos": None, "lords": []}
            
            complete_planets.append({
                **planet,
                "layers": {
                    "pl": {"name": planet_name, "sig": pl_sig},
                    "nl": {"name": star_lord, "sig": nl_sig},
                    "sl": {"name": sub_lord, "sig": sl_sig},
                    "ssl": {"name": sub_sub_lord, "sig": ssl_sig}
                }
            })
        
        # Update enhanced_planets to use complete_planets for further analysis
        enhanced_planets = complete_planets
        
        # Event analysis for all categories
        categories = ["education", "career", "government_job", "business", "finance", "marriage", "child_birth", "property", "health", "travel"]
        event_analysis = {}
        
        # We analyze events based on the primary planet for each (Karakas)
        # For simplicity, we can analyze for all planets and aggregate or pick the most relevant
        for cat in categories:
            cat_results = []
            for p in enhanced_planets:
                res = NakshatraNadiEngine.analyze_event(cat, p["planet"], enhanced_planets, significators)
                cat_results.append(res)
            event_analysis[cat] = cat_results
            
        # Left vs Right balance for key areas
        # We pick the current Antardasha lord's signified houses for balance check
        dasha_data = KPService.calculate_dasha_timeline(birth_details, years_ahead=1)
        curr_lord = dasha_data["current_period"].get("antardasha", {}).get("lord", "")
        
        balance_check = {}
        if curr_lord:
            curr_houses = [h for h, sigs in significators.items() if curr_lord in sigs.get("all", [])]
            balance_check = {
                "lord": curr_lord,
                "finance": NakshatraNadiEngine.split_left_right_houses(curr_houses, "finance"),
                "career": NakshatraNadiEngine.split_left_right_houses(curr_houses, "career"),
                "marriage": NakshatraNadiEngine.split_left_right_houses(curr_houses, "marriage")
            }
            
        bukthi_analysis = {}
        current_period = dasha_data.get("current_period", {})
        current_bukthi_info = {}
        if curr_lord:
            current_bukthi_info = {
                "lord": curr_lord,
                "start_date": current_period.get("antardasha", {}).get("start_date", ""),
                "end_date": current_period.get("antardasha", {}).get("end_date", ""),
                "hierarchy": {
                    "mahadasha": current_period.get("mahadasha", {}),
                    "antardasha": current_period.get("antardasha", {}),
                    "antara": current_period.get("antara", {})
                }
            }
            
            # Analyze Bukthi lord for each event category
            for cat in categories:
                bukthi_planet = next((p for p in enhanced_planets if p["planet"] == curr_lord), None)
                if bukthi_planet:
                    analysis = NakshatraNadiEngine.analyze_event(cat, curr_lord, enhanced_planets, significators)
                    
                    # Get status for each layer
                    pl_status = "NEUTRAL"
                    pl_houses = set([h for h, sigs in significators.items() if curr_lord in sigs.get("all", [])])
                    if pl_houses:
                        from .nakshatra_nadi_engine import NADI_COMBINATIONS
                        good_houses = set(NADI_COMBINATIONS.get(cat, {}).get("good", []))
                        bad_houses = set(NADI_COMBINATIONS.get(cat, {}).get("bad", []))
                        g_count = len(pl_houses & good_houses)
                        b_count = len(pl_houses & bad_houses)
                        if g_count > b_count: pl_status = "GOOD"
                        elif b_count > g_count: pl_status = "BAD"
                    
                    nl_status = analysis["houses"]["star_lord"]["status"]
                    sl_status = analysis["houses"]["sub_lord"]["status"]
                    
                    # Calculate percentage
                    percentage = NakshatraNadiEngine.calculate_event_percentage(pl_status, nl_status, sl_status)
                    analysis["percentage"] = percentage
                    analysis["pl_status"] = pl_status
                    
                    # Add career/education suggestions
                    if cat in ["education", "career"]:
                        good_houses_list = analysis["houses"]["planet"]
                        analysis["suggestions"] = NakshatraNadiEngine.get_career_suggestions(cat, good_houses_list)
                    
                    # Add personality traits
                    analysis["characteristics"] = NakshatraNadiEngine.get_personality_traits(significators, curr_lord)
                    
                    # Add Left/Right split
                    all_houses = analysis["houses"]["planet"]
                    analysis["left_right"] = NakshatraNadiEngine.split_left_right_houses(all_houses, cat)
                    
                    bukthi_analysis[cat] = analysis

        return {
            "planets": enhanced_planets,
            "event_analysis": event_analysis,
            "bukthi_analysis": bukthi_analysis,
            "current_bukthi": current_bukthi_info,
            "balance_check": balance_check,
            "house_cusps": raw_data["house_cusps"],
            "ascendant": raw_data["ascendant"],
            "house_lordships": house_lordships,
            "ascendant_sign": ascendant_sign
        }
