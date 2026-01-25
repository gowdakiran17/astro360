from typing import Dict, List, Optional
import math
from datetime import datetime

class NumerologyService:
    @staticmethod
    def reduce_number(n: int, allow_master: bool = True) -> int:
        """Reduce number to single digit, optionally preserving master numbers 11, 22, 33."""
        if allow_master and n in [11, 22, 33]:
            return n
        while n > 9:
            if allow_master and n in [11, 22, 33]:
                return n
            n = sum(int(d) for d in str(n))
        return n

    @staticmethod
    def get_pythagorean_value(char: str) -> int:
        mapping = {
            'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
            'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
            's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
        }
        return mapping.get(char.lower(), 0)

    @staticmethod
    def get_chaldean_value(char: str) -> int:
        mapping = {
            'a': 1, 'i': 1, 'j': 1, 'q': 1, 'y': 1,
            'b': 2, 'k': 2, 'r': 2,
            'c': 3, 'g': 3, 'l': 3, 's': 3,
            'd': 4, 'm': 4, 't': 4,
            'e': 5, 'h': 5, 'n': 5, 'x': 5,
            'u': 6, 'v': 6, 'w': 6,
            'o': 7, 'z': 7,
            'f': 8, 'p': 8
        }
        return mapping.get(char.lower(), 0)

    @staticmethod
    def get_hebrew_value(char: str) -> int:
        # Hebrew/Kabbalah Gematria simplified for Latin alphabet
        mapping = {
            'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 8, 'g': 3, 'h': 5, 'i': 1,
            'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 7, 'p': 8, 'q': 1, 'r': 2,
            's': 3, 't': 4, 'u': 6, 'v': 6, 'w': 6, 'x': 5, 'y': 1, 'z': 7
        }
        return mapping.get(char.lower(), 0)

    @staticmethod
    def get_numerary_value(char: str) -> int:
        # Alternative Numerary mapping
        mapping = {
            'a': 1, 'b': 2, 'c': 2, 'd': 4, 'e': 5, 'f': 8, 'g': 3, 'h': 8, 'i': 1,
            'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 7, 'p': 8, 'q': 1, 'r': 2,
            's': 3, 't': 4, 'u': 6, 'v': 6, 'w': 6, 'x': 6, 'y': 1, 'z': 7
        }
        return mapping.get(char.lower(), 0)

    @staticmethod
    def get_tarot_key(n: int) -> Dict:
        keys = {
            1: {"title": "The Magician", "signification": "Willpower, Desire, Creation, Manifestation"},
            2: {"title": "The High Priestess", "signification": "Intuition, Unconscious, Divine Feminine"},
            3: {"title": "The Empress", "signification": "Abundance, Nature, Fertility, Beauty"},
            4: {"title": "The Emperor", "signification": "Authority, Structure, Control, Fatherhood"},
            5: {"title": "The Hierophant", "signification": "Tradition, Conformity, Religion, Spiritual Wisdom"},
            6: {"title": "The Lovers", "signification": "Love, Harmony, Partnerships, Choices"},
            7: {"title": "The Chariot", "signification": "Control, Willpower, Victory, Determination"},
            8: {"title": "Strength", "signification": "Courage, Persuasion, Influence, Compassion"},
            9: {"title": "The Hermit", "signification": "Soul Searching, Introspection, Inner Guidance"},
            10: {"title": "Wheel of Fortune", "signification": "Luck, Karma, Life Cycles, Destiny"},
            11: {"title": "Justice", "signification": "Fairness, Truth, Cause and Effect, Law"},
            12: {"title": "The Hanged Man", "signification": "Surrender, Letting Go, New Perspective"},
            13: {"title": "Death", "signification": "Endings, Change, Transformation, Transition"},
            14: {"title": "Temperance", "signification": "Balance, Moderation, Patience, Purpose"},
            15: {"title": "The Devil", "signification": "Shadow Self, Attachment, Addiction, Restriction"},
            16: {"title": "The Tower", "signification": "Sudden Upheaval, Chaos, Revelation, Awakening"},
            17: {"title": "The Star", "signification": "Hope, Faith, Purpose, Renewal, Spirituality"},
            18: {"title": "The Moon", "signification": "Illusion, Fear, Anxiety, Subconscious, Intuition"},
            19: {"title": "The Sun", "signification": "Positivity, Fun, Warmth, Success, Vitality"},
            20: {"title": "Judgement", "signification": "Reflection, Reckoning, Inner Voice, Rebirth"},
            21: {"title": "The World", "signification": "Completion, Integration, Accomplishment, Travel"},
            22: {"title": "The Fool", "signification": "Beginnings, Innocence, Spontaneity, Free Spirit"}
        }
        return keys.get(n % 22 or 22, {"title": "Unknown", "signification": ""})

    @staticmethod
    def get_compound_number(n: int) -> int:
        """Returns the raw sum before reduction to single digit."""
        return n

    @staticmethod
    def get_lucky_elements(psychic_num: int) -> Dict:
        lucky_map = {
            1: {"gem": "Ruby", "colors": ["Yellow", "Gold"], "days": ["Sunday", "Monday"], "deity": "Sun"},
            2: {"gem": "Pearl", "colors": ["White", "Green"], "days": ["Monday", "Friday"], "deity": "Moon"},
            3: {"gem": "Yellow Sapphire", "colors": ["Yellow", "Pink"], "days": ["Thursday", "Tuesday"], "deity": "Jupiter"},
            4: {"gem": "Hessonite", "colors": ["Blue", "Grey"], "days": ["Saturday", "Monday"], "deity": "Rahu"},
            5: {"gem": "Emerald", "colors": ["Green", "White"], "days": ["Wednesday", "Friday"], "deity": "Mercury"},
            6: {"gem": "Diamond", "colors": ["White", "Light Blue"], "days": ["Friday", "Thursday"], "deity": "Venus"},
            7: {"gem": "Cat's Eye", "colors": ["Light Green", "White"], "days": ["Thursday", "Monday"], "deity": "Ketu"},
            8: {"gem": "Blue Sapphire", "colors": ["Black", "Dark Blue"], "days": ["Saturday", "Friday"], "deity": "Saturn"},
            9: {"gem": "Red Coral", "colors": ["Red", "Pink"], "days": ["Tuesday", "Friday"], "deity": "Mars"}
        }
        return lucky_map.get(psychic_num, {})

    def check_compatibility(self, number: str, target_number: int) -> Dict:
        """
        Checks compatibility between a string of digits (phone, house, etc.) 
        and a target root number (usually psychic or destiny).
        """
        clean_num = "".join(d for d in number if d.isdigit())
        if not clean_num:
            return {"score": 0, "status": "Invalid Input"}
            
        total_sum = sum(int(d) for d in clean_num)
        reduced = self.reduce_number(total_sum, allow_master=False)
        
        # Friendly numbers for each root
        friendly = {
            1: [1, 2, 3, 5, 9],
            2: [1, 2, 3, 5],
            3: [1, 2, 3, 5, 7, 9],
            4: [1, 5, 6, 7],
            5: [1, 2, 3, 5, 6],
            6: [3, 4, 5, 6, 9],
            7: [3, 4, 5, 6],
            8: [5, 6, 7],
            9: [1, 3, 6, 9]
        }
        
        is_friendly = reduced in friendly.get(target_number, [])
        score = 90 if is_friendly else (70 if reduced == target_number else 40)
        
        return {
            "reduced_number": reduced,
            "score": score,
            "is_compatible": is_friendly,
            "status": "Excellent" if score >= 80 else ("Good" if score >= 60 else "Average")
        }

    def get_favorable_years(self, day: int, month: int, year: int) -> List[Dict]:
        favorable = []
        current_year = datetime.now().year
        for y in range(current_year, current_year + 10):
            py = self.reduce_number(day + month + sum(int(d) for d in str(y)))
            events: List[str] = []
            if py == 1:
                events.append("New Beginnings, Career Launch")
            if py == 2:
                events.append("Partnerships, Marriage, Property")
            if py == 3:
                events.append("Social Success, Creativity")
            if py == 4:
                events.append("Stability, Buying House, Hard Work")
            if py == 5:
                events.append("Change, Travel, New Job")
            if py == 6:
                events.append("Family, Responsibility, Marriage")
            if py == 8:
                events.append("Financial Gain, Business Expansion")
            if events:
                favorable.append(
                    {"year": y, "personal_year": py, "events": events}
                )
        return favorable

    def calculate_pinnacles(self, day: int, month: int, year: int, destiny: int) -> List[Dict]:
        try:
            m_red = self.reduce_number(month)
            d_red = self.reduce_number(day)
            y_red = self.reduce_number(year)

            p1 = self.reduce_number(m_red + d_red)
            p2 = self.reduce_number(d_red + y_red)
            p3 = self.reduce_number(p1 + p2)
            p4 = self.reduce_number(m_red + y_red)

            age1 = 36 - destiny
            return [
                {"pinnacle": 1, "value": p1, "start_age": 0, "end_age": age1},
                {"pinnacle": 2, "value": p2, "start_age": age1 + 1, "end_age": age1 + 9},
                {"pinnacle": 3, "value": p3, "start_age": age1 + 10, "end_age": age1 + 18},
                {"pinnacle": 4, "value": p4, "start_age": age1 + 19, "end_age": 99},
            ]
        except Exception:
            return []

    def get_combination_insight(self, psychic: int, destiny: int) -> str:
        """Returns a brief insight for the Psychic and Destiny number combination."""
        # This is a simplified version of the 81 combinations
        combos = {
            (1, 1): "Double Sun: Extreme leadership, independent, but may be egoistic.",
            (1, 2): "Sun & Moon: Creative leader, balanced ego with intuition.",
            (1, 3): "Sun & Jupiter: Highly successful, disciplined, and spiritual leader.",
            (2, 2): "Double Moon: Deeply emotional, intuitive, but may lack stability.",
            (3, 3): "Double Jupiter: Great teacher, wise, and highly respected.",
            (4, 4): "Double Rahu: Extremely hard working, revolutionary, but faces struggles.",
            (5, 5): "Double Mercury: Very intelligent, fast-moving, great in business.",
            (6, 6): "Double Venus: Artistic, luxury-loving, and very attractive.",
            (7, 7): "Double Ketu: Deeply spiritual, researcher, but isolated.",
            (8, 8): "Double Saturn: Heavy karma, great financial success through hard work.",
            (9, 9): "Double Mars: High energy, humanitarian, but prone to anger."
        }
        
        # Fallback for other combinations
        if (psychic, destiny) in combos:
            return combos[(psychic, destiny)]
        
        general = {
            1: "Leadership & Drive", 2: "Intuition & Diplomacy", 3: "Wisdom & Creativity",
            4: "Structure & Innovation", 5: "Adaptability & Communication", 6: "Harmony & Luxury",
            7: "Analysis & Spirituality", 8: "Authority & Material Success", 9: "Humanitarianism & Power"
        }
        
        return f"Combining the {general.get(psychic)} of Psychic {psychic} with the {general.get(destiny)} of Destiny {destiny} creates a unique path of growth."

    def calculate_advanced_numerology(self, name: str, dob: str) -> Dict:
        """
        dob format: DD/MM/YYYY or YYYY-MM-DD
        """
        try:
            if '/' in dob:
                day, month, year = map(int, dob.split('/'))
            elif '-' in dob:
                year, month, day = map(int, dob.split('-'))
            else:
                return {"error": "Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD"}
        except ValueError:
            return {"error": "Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD"}

        # Normalize dob string to DD/MM/YYYY for consistent internal logic if needed
        dob_normalized = f"{day:02d}/{month:02d}/{year:04d}"
        
        # 1. Pythagorean Core Numbers
        clean_name = "".join(c for c in name if c.isalpha())
        pythag_destiny_raw = sum(self.get_pythagorean_value(c) for c in clean_name)
        
        vowels = "aeiou"
        pythag_soul_urge_raw = sum(self.get_pythagorean_value(c) for c in name.lower() if c in vowels)
        pythag_personality_raw = sum(self.get_pythagorean_value(c) for c in name.lower() if c.isalpha() and c not in vowels)
        
        # 2. Chaldean Numbers (Often used for name correction)
        chaldean_name_raw = sum(self.get_chaldean_value(c) for c in clean_name)
        
        # 2.1 Hebrew and Numerary Systems
        hebrew_name_raw = sum(self.get_hebrew_value(c) for c in clean_name)
        numerary_name_raw = sum(self.get_numerary_value(c) for c in clean_name)
        
        # 3. Grids
        digits = [int(d) for d in dob_normalized if d.isdigit()]
        lo_shu_grid = {i: digits.count(i) for i in range(1, 10)}
        vedic_grid = self.get_vedic_grid(dob_normalized)
        annual_grid = self.get_annual_loshu_grid(dob_normalized, datetime.now().year)
        
        # 4. Core Calculations
        psychic_number = self.reduce_number(day, allow_master=False)
        destiny_number = self.reduce_number(sum(int(d) for d in dob_normalized if d.isdigit()), allow_master=False)
        life_path = self.reduce_number(day + month + sum(int(d) for d in str(year)))
        maturity_number = self.calculate_maturity_number(life_path, destiny_number)
        balance_number = self.calculate_balance_number(name)
        subconscious_self = self.calculate_subconscious_self(name)

        # 5. Advanced Profile Features (from image)
        cornerstone = name[0].upper() if name else ""
        capstone = name.strip()[-1].upper() if name.strip() else ""
        
        first_vowel = ""
        for char in name.lower():
            if char in vowels:
                first_vowel = char.upper()
                break

        lucky = self.get_lucky_elements(psychic_number)
        
        # 6. Personal Year, Month, Day
        now = datetime.now()
        current_year = now.year
        current_month = now.month
        current_day = now.day
        
        personal_year = self.reduce_number(day + month + sum(int(d) for d in str(current_year)))
        personal_month = self.reduce_number(personal_year + current_month)
        personal_day = self.reduce_number(personal_month + current_day)

        # 7. Western Numerology Advanced
        challenges = self.calculate_challenges(day, month, year)
        karmic_lessons = self.calculate_karmic_lessons(name)
        hidden_passion = self.calculate_hidden_passion(name)

        return {
            "core": {
                "psychic_number": psychic_number,
                "destiny_number": destiny_number,
                "combination_insight": self.get_combination_insight(psychic_number, destiny_number),
                "life_path": life_path,
                "maturity_number": maturity_number,
                "balance_number": balance_number,
                "subconscious_self": subconscious_self,
                "personal_year": personal_year,
                "personal_month": personal_month,
                "personal_day": personal_day,
                "cornerstone": cornerstone,
                "capstone": capstone,
                "first_vowel": first_vowel,
                "tarot_key": self.get_tarot_key(life_path)
            },
            "pythagorean": {
                "destiny": self.reduce_number(pythag_destiny_raw),
                "destiny_compound": pythag_destiny_raw,
                "soul_urge": self.reduce_number(pythag_soul_urge_raw),
                "soul_urge_compound": pythag_soul_urge_raw,
                "personality": self.reduce_number(pythag_personality_raw),
                "personality_compound": pythag_personality_raw,
                "challenges": challenges,
                "karmic_lessons": karmic_lessons,
                "hidden_passion": hidden_passion
            },
            "chaldean": {
                "name_number": self.reduce_number(chaldean_name_raw, allow_master=False),
                "total_value": chaldean_name_raw
            },
            "hebrew": {
                "name_number": self.reduce_number(hebrew_name_raw, allow_master=False),
                "total_value": hebrew_name_raw
            },
            "numerary": {
                "name_number": self.reduce_number(numerary_name_raw, allow_master=False),
                "total_value": numerary_name_raw
            },
            "lucky_elements": lucky,
            "favorable_years": self.get_favorable_years(day, month, year),
            "pinnacles": self.calculate_pinnacles(day, month, year, destiny_number),
            "grids": {
                "lo_shu": lo_shu_grid,
                "vedic": vedic_grid,
                "annual_lo_shu": annual_grid
            },
            "dob_analysis": {
                "day": day,
                "month": month,
                "year": year
            },
            "predictions": {
                "daily": self.get_daily_prediction(personal_day),
                "monthly": self.get_monthly_prediction(personal_month),
                "yearly": self.get_yearly_prediction(personal_year),
                "nature": self.get_nature_prediction(psychic_number),
                "career": self.get_career_prediction(destiny_number),
                "health": self.get_health_prediction(psychic_number)
            }
        }

    def get_daily_prediction(self, n: int) -> str:
        preds = {
            1: "New beginnings, high energy, start new projects.",
            2: "Cooperation, patience, focus on relationships.",
            3: "Creativity, social interaction, self-expression.",
            4: "Hard work, organization, building foundations.",
            5: "Change, freedom, travel, adaptability.",
            6: "Responsibility, family, home, service.",
            7: "Introspection, study, spiritual growth.",
            8: "Success, power, financial focus, material gains.",
            9: "Completion, humanitarian work, letting go."
        }
        return preds.get(n, "")

    def get_monthly_prediction(self, n: int) -> str:
        preds = {
            1: "A month for action and independent decisions.",
            2: "A month for waiting and collaboration.",
            3: "A month for joy and creative pursuits.",
            4: "A month for discipline and steady progress.",
            5: "A month for excitement and exploring new options.",
            6: "A month for domestic harmony and caring for others.",
            7: "A month for quiet reflection and research.",
            8: "A month for career advancement and efficiency.",
            9: "A month for finishing old business and forgiving."
        }
        return preds.get(n, "")

    def get_yearly_prediction(self, n: int) -> str:
        preds = {
            1: "Major life changes and personal identity shifts.",
            2: "Partnerships, slower pace, and emotional sensitivity.",
            3: "Social expansion, happiness, and artistic growth.",
            4: "Practicality, structure, and hard-earned security.",
            5: "Transition, risk-taking, and breaking old patterns.",
            6: "Family focus, marriage, and community service.",
            7: "Solitude, spiritual awakening, and inner wisdom.",
            8: "Financial power, business scaling, and achievement.",
            9: "End of a cycle, cleaning house, and universal love."
        }
        return preds.get(n, "")

    def get_nature_prediction(self, n: int) -> str:
        nature = {
            1: "Natural leader, ambitious, and independent. You possess strong willpower.",
            2: "Diplomatic, sensitive, and cooperative. You are a great mediator.",
            3: "Creative, expressive, and optimistic. You have a joy for life.",
            4: "Practical, disciplined, and hard-working. You value stability.",
            5: "Versatile, adventurous, and freedom-loving. You adapt easily.",
            6: "Nurturing, responsible, and domestic. You value family and harmony.",
            7: "Analytical, introspective, and spiritual. You seek truth and wisdom.",
            8: "Authoritative, business-minded, and balanced. You seek material success.",
            9: "Compassionate, idealistic, and humanitarian. You are a natural healer."
        }
        return nature.get(n, "")

    def get_career_prediction(self, n: int) -> str:
        career = {
            1: "Management, entrepreneurship, politics, or any leadership role.",
            2: "Diplomacy, counseling, teaching, or art and music.",
            3: "Writing, acting, public speaking, or design.",
            4: "Engineering, accounting, law, or construction.",
            5: "Sales, travel, journalism, or entertainment.",
            6: "Healthcare, teaching, counseling, or hospitality.",
            7: "Research, science, philosophy, or occult studies.",
            8: "Finance, real estate, law, or large-scale business.",
            9: "Social work, healing, arts, or international relations."
        }
        return career.get(n, "")

    def get_health_prediction(self, n: int) -> str:
        health = {
            1: "Pay attention to heart and eyes. Avoid over-exertion.",
            2: "Focus on digestive health and emotional well-being.",
            3: "Watch out for throat and nervous system issues.",
            4: "Be careful with bones and skin. Regular exercise is key.",
            5: "Manage stress levels. Focus on mental health.",
            6: "Focus on throat, lungs, and heart health.",
            7: "Prone to mental fatigue. Meditation is highly beneficial.",
            8: "Watch out for liver and joint-related issues.",
            9: "Be careful with heat-related ailments and blood pressure."
        }
        return health.get(n, "")

    def get_vedic_grid(self, dob: str) -> Dict:
        """
        Vedic Grid Layout (Traditional Indian):
        3 1 9
        6 7 5
        2 8 4
        """
        digits = [int(d) for d in dob if d.isdigit()]
        return {
            3: digits.count(3), 1: digits.count(1), 9: digits.count(9),
            6: digits.count(6), 7: digits.count(7), 5: digits.count(5),
            2: digits.count(2), 8: digits.count(8), 4: digits.count(4)
        }

    def get_annual_loshu_grid(self, dob: str, year: int) -> Dict:
        """
        Calculate Lo Shu Grid for a specific year.
        Uses Personal Year logic combined with Birth Grid.
        """
        day, month, _ = map(int, dob.split('/') if '/' in dob else (dob.split('-')[2], dob.split('-')[1], dob.split('-')[0]))
        py = self.reduce_number(day + month + sum(int(d) for d in str(year)))
        
        # Combine birth digits with personal year digit
        digits = [int(d) for d in dob if d.isdigit()] + [py]
        return {i: digits.count(i) for i in range(1, 10)}

    def calculate_challenges(self, day: int, month: int, year: int) -> List[int]:
        # Reduce to single digits first
        d = self.reduce_number(day, False)
        m = self.reduce_number(month, False)
        y = self.reduce_number(sum(int(digit) for digit in str(year)), False)
        
        c1 = abs(d - m)
        c2 = abs(d - y)
        c3 = abs(c1 - c2)
        c4 = abs(m - y)
        return [c1, c2, c3, c4]

    def calculate_karmic_lessons(self, name: str) -> List[int]:
        clean_name = "".join(c for c in name if c.isalpha())
        values = [self.get_pythagorean_value(c) for c in clean_name]
        return [i for i in range(1, 10) if i not in values]

    def calculate_hidden_passion(self, name: str) -> List[int]:
        clean_name = "".join(c for c in name if c.isalpha())
        values = [self.get_pythagorean_value(c) for c in clean_name]
        if not values: return []
        counts = {i: values.count(i) for i in range(1, 10)}
        max_count = max(counts.values())
        return [i for i, count in counts.items() if count == max_count and max_count > 0]

    def calculate_maturity_number(self, life_path: int, destiny: int) -> int:
        return self.reduce_number(life_path + destiny)

    def calculate_balance_number(self, name: str) -> int:
        initials = [part[0] for part in name.split() if part]
        total = sum(self.get_pythagorean_value(i) for i in initials)
        return self.reduce_number(total)

    def calculate_subconscious_self(self, name: str) -> int:
        clean_name = "".join(c for c in name if c.isalpha())
        values = set(self.get_pythagorean_value(c) for c in clean_name)
        absent_count = 9 - len(values)
        return absent_count

    def get_planes_of_expression(self, name: str) -> Dict[str, Dict]:
        clean_name = "".join(c for c in name if c.isalpha())
        # Letters by Plane:
        # Physical: 4 (D,M,V), 5 (E,N,W)
        # Mental: 1 (A,J,S), 8 (H,Q,Z)
        # Emotional: 2 (B,K,T), 3 (C,L,U), 6 (F,O,X)
        # Intuitive: 7 (G,P,Y), 9 (I,R)
        physical = "dmvenw"
        mental = "ajshqz"
        emotional = "bktclufox"
        intuitive = "gpyir"

        res = {"physical": 0, "mental": 0, "emotional": 0, "intuitive": 0}
        for c in clean_name.lower():
            if c in physical: res["physical"] += 1
            elif c in mental: res["mental"] += 1
            elif c in emotional: res["emotional"] += 1
            elif c in intuitive: res["intuitive"] += 1

        total_chars = len(clean_name) or 1
        return {
            k: {"count": v, "percentage": round(v / total_chars * 100)}
            for k, v in res.items()
        }

    def calculate_transits(self, name: str, birth_year: int) -> List[Dict]:
        parts = name.split()
        if not parts: return []

        first = parts[0].lower()
        middle = parts[1].lower() if len(parts) > 2 else ""
        last = parts[-1].lower() if len(parts) > 1 else ""

        def get_stream(text):
            stream = []
            for c in text:
                if c.isalpha():
                    val = self.get_pythagorean_value(c)
                    stream.append({"letter": c.upper(), "duration": val})
            return stream

        streams = {
            "physical": get_stream(first),
            "mental": get_stream(middle or first),
            "spiritual": get_stream(last or first)
        }

        timeline = []
        indices = {"physical": 0, "mental": 0, "spiritual": 0}
        current_durations = {"physical": 0, "mental": 0, "spiritual": 0}

        for age in range(101):
            year_data = {"age": age, "year": birth_year + age}
            for key in ["physical", "mental", "spiritual"]:
                stream = streams[key]
                if not stream:
                    continue

                if current_durations[key] <= 0:
                    idx = indices[key] % len(stream)
                    current_durations[key] = stream[idx]["duration"]
                    # Handle letters with value 0 (though isalpha usually gives 1-9)
                    if current_durations[key] <= 0: current_durations[key] = 1

                year_data[f"{key}_letter"] = stream[indices[key] % len(stream)]["letter"]
                year_data[f"{key}_value"] = self.get_pythagorean_value(year_data[f"{key}_letter"])

                current_durations[key] -= 1
                if current_durations[key] == 0:
                    indices[key] += 1

            # Essence for the year: Sum of Physical + Mental + Spiritual values reduced
            essence_sum = (year_data.get("physical_value", 0) +
                          year_data.get("mental_value", 0) +
                          year_data.get("spiritual_value", 0))
            year_data["essence"] = self.reduce_number(essence_sum)
            timeline.append(year_data)

        return timeline

    def get_maturity_interpretation(self, n: int) -> str:
        interpretations = {
            1: "As you mature, you will find an increasing need for independence and leadership. Your later years will be marked by a strong sense of self and the courage to start new ventures. You become more self-reliant and assertive, often finding your greatest success through individual effort.",
            2: "Your maturity brings a deepening of diplomatic skills and a greater appreciation for harmony. You will find yourself playing the role of the peacemaker, finding fulfillment in partnerships and cooperative ventures. Your sensitivity becomes a strength, allowing for profound emotional connections.",
            3: "The second half of life will be a time of great creative expansion and social joy. You will find your voice and express yourself more freely, perhaps through art, writing, or performance. Your optimism becomes contagious, and you find happiness in inspiring others through your creative spirit.",
            4: "Maturity brings a focus on building lasting foundations and establishing order. You will find satisfaction in hard work, organization, and the creation of something tangible. Your later years are characterized by stability, reliability, and a deep sense of accomplishment through discipline.",
            5: "Your later years will be filled with change, travel, and a quest for freedom. You will find yourself breaking old patterns and seeking new experiences. Your adaptability becomes your greatest asset, allowing you to embrace the variety and excitement that life offers as you mature.",
            6: "As you reach maturity, your focus shifts toward family, community, and service. You find deep fulfillment in nurturing others and creating a harmonious environment. You may take on roles of responsibility in your community, finding joy in being a pillar of support.",
            7: "Maturity brings a search for inner truth and spiritual wisdom. You will find yourself drawn to introspection, study, and the mysteries of life. Your later years are a time of profound intellectual and spiritual growth, as you seek a deeper understanding of the world and yourself.",
            8: "The second half of life is a time of material success, authority, and financial mastery. You will find yourself in positions of power, managing resources and achieving significant goals. Your ability to balance the material and spiritual realms becomes highly refined.",
            9: "Maturity leads you toward humanitarianism and universal love. You will find yourself more concerned with the well-being of others and the world at large. Your later years are a time of completion and letting go, as you dedicate yourself to serving the greater good.",
            11: "Maturity activates your master vibration of intuition and enlightenment. You become a beacon of inspiration for others, bridging the gap between the material and spiritual worlds. Your later years are characterized by profound psychic insights and a mission of spiritual teaching.",
            22: "Maturity brings the power of the Master Builder. You find yourself capable of manifesting grand visions on a global scale. Your later years are dedicated to creating lasting structures or systems that benefit humanity, combining practical discipline with spiritual vision."
        }
        return interpretations.get(n, "Your maturity brings a synthesis of your Life Path and Destiny energies.")

    def get_balance_interpretation(self, n: int) -> str:
        interpretations = {
            1: "When faced with challenges, your first instinct is to take charge and find a solutions independently. You possess great inner strength, but must be careful not to become overly aggressive or isolated when under pressure.",
            2: "In times of crisis, you rely on diplomacy and cooperation. You seek to harmonize conflicting forces and find a peaceful resolution. You must ensure you don't lose yourself or your needs in an effort to keep the peace.",
            3: "You handle stress by tapping into your creativity and maintained an optimistic outlook. You may use humor or social interaction to diffuse tension. Be wary of becoming scattered or ignoring the practicalities of the situation.",
            4: "Challenges are met with logic, structure, and hard work. You find stability by organizing your environment and sticking to a plan. Avoid becoming too rigid or stubborn when things don't go according to your system.",
            5: "You respond to pressure with adaptability and a need for change. You may look for unconventional solutions or seek to escape the situation. Focus on grounded decision-making rather than impulsive reactions during stressful times.",
            6: "In difficult times, you turn toward family and loved ones for support and find strength in being of service. You are a natural nurturer, but must be careful not to take on the burdens of others to your own detriment.",
            7: "When life becomes challenging, you withdraw into introspection and seek understanding. You find balance through quiet study and analysis. Ensure you don't become too detached or socially isolated when you need support the most.",
            8: "You meet obstacles with authority and a focus on practical results. You possess the executive power to manage complex situations. Be careful not to become overly controlling or focused solely on material outcomes during a crisis.",
            9: "Your response to stress is guided by compassion and a broad perspective. You seek solutions that benefit the collective. You must watch for emotional overwhelm and ensure you are grounding your idealistic visions in reality."
        }
        return interpretations.get(n, "Your balance number helps you maintain equilibrium during life's more demanding periods.")

    def get_subconscious_interpretation(self, n: int) -> str:
        # This is based on the count of unique digits (1-9) present in the name.
        interpretations = {
            1: "Having only one core vibration suggests a highly specialized and focused instinct, but one that may struggle with unfamiliar situations.",
            2: "A subconscious self of 2 indicates that while you are sensitive, you may hesitate when faced with sudden changes, needing time to adjust.",
            3: "A subconscious self of 3 shows a spontaneous and creative reaction to life, though you may lack consistency in your instinctive responses.",
            4: "With four vibrations present, you have a solid and practical foundation. You respond to change with caution and a desire for order.",
            5: "Five vibrations suggest a balanced and versatile instinct. You handle change with relative ease and can adapt to most circumstances.",
            6: "A subconscious self of 6 indicates a strong protective instinct and a tendency to respond to life with a focus on harmony and domestic stability.",
            7: "Seven vibrations show a highly refined and intuitive response to life. You process changes deeply before taking action.",
            8: "With eight vibrations, you have an almost complete set of internal tools. Your instincts are powerful, executive, and highly effective.",
            9: "A subconscious self of 9 is rare and indicates an exceptionally balanced and wise instinctive nature, capable of handling almost any life situation with grace."
        }
        return interpretations.get(n, "This number reveals your instinctive response pattern to life's changing circumstances.")

    def get_plane_interpretation(self, planes: Dict) -> str:
        dominant = max(planes.items(), key=lambda x: x[1]['count'])[0]
        desc = {
            "physical": "Your character is grounded in the material world. You process life through action, structure, and physical endurance. Practicality is your guiding light.",
            "mental": " You are primarily driven by intellect and logic. You process experiences through analysis, reason, and strategic thinking.",
            "emotional": "Your orientation is guided by feelings and connections. You experience the world through your heart and are highly sensitive to the vibrations of others.",
            "intuitive": "You operate through gut feelings and spiritual insights. You perceive beyond the visible, guided by a deep inner knowing and psychic sensitivity."
        }
        return desc.get(dominant, "Your energies represent a unique blend of physical, mental, emotional, and intuitive experiences.")

    def calculate_bridge_numbers(self, life_path: int, expression: int, soul_urge: int, personality: int) -> Dict[str, Dict]:
        lp_expr_bridge = abs(life_path - expression)
        so_pe_bridge = abs(soul_urge - personality)

        def get_bridge_desc(n: int, type_name: str) -> str:
            if n == 0: return f"Your {type_name} vibrations are already in perfect alignment. You have a natural flow between these aspects of your life."
            descs = {
                1: "Focus on developing self-reliance and originality. Stop comparing yourself to others.",
                2: "Focus on diplomacy and cooperation. Learn to work with others without losing your identity.",
                3: "Focus on creative self-expression. Find a way to share your inner joy with the world.",
                4: "Focus on practical results and discipline. Bring order and logic to your projects.",
                5: "Focus on adaptability and variety. Embrace change as a means of growth.",
                6: "Focus on responsibility and service. Find joy in nurturing and supporting your circle.",
                7: "Focus on inner wisdom and introspection. Seek the spiritual truth behind material events.",
                8: "Focus on material mastery and efficiency. Balance your power with ethical responsibility.",
                9: "Focus on humanitarianism and letting go. Dedicate your efforts to the greater good."
            }
            return descs.get(n, "Focus on integrating these complementary vibrations.")

        return {
            "life_path_expression": {
                "number": lp_expr_bridge,
                "description": get_bridge_desc(lp_expr_bridge, "Life Path and Expression")
            },
            "soul_urge_personality": {
                "number": so_pe_bridge,
                "description": get_bridge_desc(so_pe_bridge, "Soul Urge and Personality")
            }
        }

    def calculate_rational_thought(self, first_name: str, day: int) -> int:
        first_val = sum(self.get_pythagorean_value(c) for c in first_name if c.isalpha())
        return self.reduce_number(first_val + day)

    def get_initials_analysis(self, name: str) -> Dict:
        parts = name.split()
        if not parts: return {}
        first = parts[0]
        vowels = "aeiou"
        first_vowel = next((c.upper() for c in first.lower() if c in vowels), first[0].upper())
        
        return {
            "cornerstone": {"letter": first[0].upper(), "meaning": "How you start projects and approach new opportunities."},
            "capstone": {"letter": first[-1].upper(), "meaning": "How you finish things and your style of closure."},
            "first_vowel": {"letter": first_vowel, "meaning": "Your first emotional reaction to any stimulus."}
        }

    def get_ancestral_influence(self, last_name: str) -> Dict:
        val = sum(self.get_pythagorean_value(c) for c in last_name if c.isalpha())
        number = self.reduce_number(val)
        return {
            "surname": last_name.upper(),
            "number": number,
            "theme": "The hidden legacy and family patterns you carry in your DNA.",
            "description": f"The number {number} in your ancestral line suggests a history of " + 
                           (self.get_nature_prediction(number) if number else "family resilience.")
        }

    def calculate_diamond_chart(self, age: int, psychic: int, destiny: int) -> Dict:
        # Diamond logic often uses (Age + Psychic + Destiny) for triangulation
        cause = self.reduce_number(age + psychic)
        challenge = self.reduce_number(abs(psychic - destiny))
        outcome = self.reduce_number(cause + challenge)
        return {
            "current_age": age,
            "cause": {"number": cause, "desc": "The primary underlying factor of your current life stage."},
            "challenge": {"number": challenge, "desc": "The specific hurdle you must overcome to grow right now."},
            "outcome": {"number": outcome, "desc": "The expected fruit of your efforts at this age."}
        }

    def get_vocation_profile(self, name: str, lp: int) -> Dict:
        # Logic to see which "Talents" are strongest based on name frequency
        clean_name = "".join(c for c in name if c.isalpha()).lower()
        counts = {i: 0 for i in range(1, 10)}
        for c in clean_name:
            v = self.get_pythagorean_value(c)
            if v in counts: counts[v] += 1
            
        total = sum(counts.values()) or 1
        return {
            "business": round((counts[8] + counts[4] + counts[1]) / total * 300),
            "science": round((counts[7] + counts[4] + counts[5]) / total * 300),
            "arts": round((counts[3] + counts[6] + counts[9]) / total * 300),
            "leadership": round((counts[1] + counts[8] + counts[9]) / total * 300),
            "writing": round((counts[3] + counts[5] + counts[1]) / total * 300)
        }

    def suggest_name_corrections(self, name: str, target_number: int) -> List[Dict]:
        suggestions = []
        variations = []
        
        # 1. Simple additions
        for char in "aeiouy":
            variations.append(name + char)
            variations.append(name + " " + char.upper())
            
        # 2. Insertions (after first letter)
        if len(name) > 1:
            for char in "aeiou":
                variations.append(name[:1] + char + name[1:])
        
        # 3. Doubling letters
        for i in range(len(name)):
            if name[i].isalpha():
                variations.append(name[:i] + name[i] + name[i:])

        # Friendly numbers mapping
        friendly_map = {
            1: [1, 2, 3, 5, 9],
            2: [1, 2, 3, 5],
            3: [1, 2, 3, 5, 7, 9],
            4: [1, 5, 6, 7],
            5: [1, 2, 3, 5, 6],
            6: [3, 4, 5, 6, 9],
            7: [3, 4, 5, 6],
            8: [5, 6, 7],
            9: [1, 3, 6, 9]
        }
        friendly_nums = friendly_map.get(target_number, [target_number])

        seen = set()
        
        for var in variations:
            if var in seen: continue
            seen.add(var)
            
            clean_var = "".join(c for c in var if c.isalpha())
            raw_val = sum(self.get_chaldean_value(c) for c in clean_var)
            red_val = self.reduce_number(raw_val, allow_master=False)
            
            if red_val == target_number:
                suggestions.append({"name": var, "value": raw_val, "match_type": "Perfect Match"})
            elif red_val in friendly_nums:
                suggestions.append({"name": var, "value": raw_val, "match_type": "Friendly Match"})
                
        # Sort by match type (Perfect first) then value
        return sorted(suggestions, key=lambda x: (0 if x['match_type'] == 'Perfect Match' else 1, x['value']))[:10]

    def generate_blueprint(self, name: str, dob: str) -> Dict:
        base = self.calculate_advanced_numerology(name, dob)
        if "error" in base:
            return base

        core = base["core"]
        pythag = base["pythagorean"]
        chaldean = base["chaldean"]
        dob_info = base["dob_analysis"]
        predictions = base["predictions"]
        favorable_years = base["favorable_years"]
        pinnacles = base["pinnacles"]

        day = dob_info["day"]
        month = dob_info["month"]
        year = dob_info["year"]
        psychic = core["psychic_number"]
        destiny = core["destiny_number"]
        life_path = core["life_path"]
        challenges = pythag["challenges"]
        karmic_lessons = pythag["karmic_lessons"]
        hidden_passion = pythag["hidden_passion"]

        current_year = datetime.now().year

        forecast_years: List[Dict] = []
        for y in range(current_year, current_year + 6):
            py = self.reduce_number(day + month + sum(int(d) for d in str(y)))
            months_data: List[Dict] = []
            for m_idx in range(1, 13):
                pm = self.reduce_number(py + m_idx)
                importance = "normal"
                if pm in [psychic, destiny, life_path]:
                    importance = "high"
                elif pm in challenges:
                    importance = "challenge"
                months_data.append(
                    {
                        "month": m_idx,
                        "personal_month": pm,
                        "importance": importance
                    }
                )
            forecast_years.append(
                {
                    "year": y,
                    "personal_year": py,
                    "months": months_data
                }
            )

        upcoming_lucky_years = [
            y for y in favorable_years if current_year <= y["year"] < current_year + 6
        ]

        quarterly_cycles: List[Dict] = []
        for y in forecast_years:
            for q in range(1, 5):
                start_month = (q - 1) * 3 + 1
                end_month = start_month + 2
                quarter_months = [m for m in y["months"] if start_month <= m["month"] <= end_month]
                high_count = len([m for m in quarter_months if m["importance"] == "high"])
                challenge_count = len([m for m in quarter_months if m["importance"] == "challenge"])
                tone = "balanced"
                if high_count > challenge_count and high_count > 0:
                    tone = "expansion"
                elif challenge_count > high_count and challenge_count > 0:
                    tone = "caution"
                quarterly_cycles.append(
                    {
                        "year": y["year"],
                        "quarter": q,
                        "start_month": start_month,
                        "end_month": end_month,
                        "high_activity_months": high_count,
                        "challenge_months": challenge_count,
                        "tone": tone
                    }
                )

        talent_map = {
            1: {
                "label": "Leadership And Initiative",
                "theme": "Ability to take charge and inspire others."
            },
            2: {
                "label": "Diplomacy And Emotional Intelligence",
                "theme": "Sensitivity to people and talent for mediation."
            },
            3: {
                "label": "Creative Self Expression",
                "theme": "Artistic communication through words, visuals, or performance."
            },
            4: {
                "label": "Systems And Execution",
                "theme": "Building stable structures and processes."
            },
            5: {
                "label": "Adaptability And Influence",
                "theme": "Persuasive communication and comfort with change."
            },
            6: {
                "label": "Nurturing And Service",
                "theme": "Caring leadership in community and family."
            },
            7: {
                "label": "Analysis And Research",
                "theme": "Deep thinking, investigation, and spiritual study."
            },
            8: {
                "label": "Executive Power And Wealth Creation",
                "theme": "Managing resources and leading organisations."
            },
            9: {
                "label": "Humanitarian Vision",
                "theme": "Serving collective causes with passion."
            }
        }

        talent_numbers: List[int] = []
        for n in hidden_passion + [psychic, destiny, life_path]:
            if n not in talent_numbers and 1 <= n <= 9:
                talent_numbers.append(n)
        talent_numbers = talent_numbers[:7]

        talents: List[Dict] = []
        for n in talent_numbers:
            base_talent = talent_map.get(n)
            if not base_talent:
                continue
            roadmap = []
            if n in [1, 8]:
                roadmap.append("Take visible ownership of one strategic project in the next 90 days.")
                roadmap.append("Practice decisive communication in weekly meetings.")
            if n in [2, 6]:
                roadmap.append("Design one collaboration based initiative that serves family or team.")
                roadmap.append("Schedule regular check ins to strengthen key relationships.")
            if n in [3, 5]:
                roadmap.append("Publish or present creative work every month for the next six months.")
                roadmap.append("Join a community where your communication skills are used regularly.")
            if n in [4]:
                roadmap.append("Standardise one chaotic area of life using simple systems.")
                roadmap.append("Commit to a weekly review ritual for long term goals.")
            if n in [7, 9]:
                roadmap.append("Dedicate weekly time to study, contemplation, or service aligned with your values.")
                roadmap.append("Create a written philosophy that guides major decisions.")
            if not roadmap:
                roadmap.append("Identify one small habit that expresses this talent and track it daily for 30 days.")
            talents.append(
                {
                    "number": n,
                    "name": base_talent["label"],
                    "theme": base_talent["theme"],
                    "development_roadmap": roadmap
                }
            )

        life_path_examples = {
            1: ["Mahatma Gandhi", "Steve Jobs"],
            2: ["Mother Teresa", "Amrita Pritam"],
            3: ["Rabindranath Tagore", "Walt Disney"],
            4: ["Dr. B. R. Ambedkar", "Elon Musk"],
            5: ["Swami Vivekananda", "Oprah Winfrey"],
            6: ["Sri Aurobindo", "Princess Diana"],
            7: ["Nikola Tesla", "Jiddu Krishnamurti"],
            8: ["Dhirubhai Ambani", "Warren Buffett"],
            9: ["Nelson Mandela", "Dalai Lama"]
        }

        life_path_section = {
            "life_path_number": life_path,
            "core_theme": self.get_nature_prediction(life_path),
            "purpose_alignment": {
                "inner_drivers": self.get_nature_prediction(psychic),
                "outer_expression": self.get_career_prediction(destiny),
                "integration_note": core["combination_insight"]
            },
            "pinnacle_phases": pinnacles,
            "inspirational_figures": life_path_examples.get(life_path, []),
            "reflection_prompts": [
                "Where in your current life do you already express this life path theme naturally.",
                "Which environments activate your highest qualities and which drain them.",
                "What one bold decision would bring your daily life closer to this purpose."
            ]
        }

        friendly_map = {
            1: [1, 2, 3, 5, 9],
            2: [1, 2, 3, 5],
            3: [1, 2, 3, 5, 7, 9],
            4: [1, 5, 6, 7],
            5: [1, 2, 3, 5, 6],
            6: [3, 4, 5, 6, 9],
            7: [3, 4, 5, 6],
            8: [5, 6, 7],
            9: [1, 3, 6, 9]
        }

        def compatibility_row(root: int) -> List[Dict]:
            row: List[Dict] = []
            friendly = friendly_map.get(root, [])
            for partner in range(1, 10):
                relation = "supportive" if partner in friendly else "neutral"
                if partner in challenges:
                    relation = "karmic"
                score = 80 if relation == "supportive" else 60 if relation == "neutral" else 45
                row.append(
                    {
                        "partner_number": partner,
                        "relation": relation,
                        "score": score
                    }
                )
            return row

        relationship_section = {
            "psychic_root": psychic,
            "destiny_root": destiny,
            "communication_style": self.get_nature_prediction(psychic),
            "compatibility_matrix": {
                "psychic_based": compatibility_row(psychic),
                "destiny_based": compatibility_row(destiny)
            },
            "conflict_resolution": [
                "Pause before reacting when numbers associated with your challenges are activated in relationships.",
                "Return to shared long term goals before discussing sensitive topics.",
                "Schedule important conversations in months marked as high importance rather than challenge months."
            ]
        }

        ideal_careers = [c.strip() for c in self.get_career_prediction(destiny).split(",") if c.strip()]
        financial_cycles: List[Dict] = []
        for y in forecast_years:
            label = "stable"
            if y["personal_year"] in [1, 8]:
                label = "expansion"
            elif y["personal_year"] in [4, 7]:
                label = "consolidation"
            financial_cycles.append(
                {
                    "year": y["year"],
                    "personal_year": y["personal_year"],
                    "cycle_type": label
                }
            )

        entrepreneurial_score = 0
        for n in [psychic, destiny, life_path] + hidden_passion:
            if n in [1, 5, 8]:
                entrepreneurial_score += 2
            elif n in [3, 4]:
                entrepreneurial_score += 1
        entrepreneurial_level = "high" if entrepreneurial_score >= 6 else "moderate" if entrepreneurial_score >= 3 else "supportive"

        affirmations: List[str] = []
        base_affirmations = {
            1: "I lead with clarity, courage, and responsibility.",
            2: "I attract harmony and supportive partnerships.",
            3: "My creativity flows easily and reaches the right people.",
            4: "I build stable foundations step by step.",
            5: "I adapt to change while staying true to myself.",
            6: "I create safe, loving spaces for myself and others.",
            7: "I trust the wisdom that arises in stillness.",
            8: "I manage power and resources with integrity.",
            9: "I serve the greater good with compassion."
        }
        for n in [psychic, destiny, life_path] + hidden_passion:
            text = base_affirmations.get(n)
            if text and text not in affirmations:
                affirmations.append(text)
        # Fill with remaining affirmations ensuring uniqueness, up to available count
        for n, text in base_affirmations.items():
            if text not in affirmations:
                affirmations.append(text)

        # New Advanced Sections
        maturity_number = self.calculate_maturity_number(life_path, destiny)
        balance_number = self.calculate_balance_number(name)
        subconscious_self = self.calculate_subconscious_self(name)
        planes_of_expression = self.get_planes_of_expression(name)
        transits_timeline = self.calculate_transits(name, year)

        # Ultimate Profile Features
        parts = name.split()
        first_name = parts[0] if parts else ""
        last_name = parts[-1] if len(parts) > 1 else ""
        
        rational_thought = self.calculate_rational_thought(first_name, day)
        initials_data = self.get_initials_analysis(name)
        ancestral_data = self.get_ancestral_influence(last_name or first_name)
        current_age = datetime.now().year - year
        diamond_data = self.calculate_diamond_chart(current_age, psychic, destiny)
        vocation_data = self.get_vocation_profile(name, life_path)

        meta = {
            "full_name": name,
            "dob": dob,
            "generated_at": datetime.now().isoformat(),
            "psychic_number": psychic,
            "destiny_number": destiny,
            "life_path": life_path,
            "maturity_number": maturity_number,
            "balance_number": balance_number,
            "subconscious_self": subconscious_self,
            "rational_thought": rational_thought,
            "estimated_pages": 145
        }

        sections: List[Dict] = []

        # section: Personality Profile (Ultimate)
        sections.append({
            "id": "personality_profile",
            "title": "Part I: Detailed Personality Profile",
            "estimated_pages": 42,
            "content": {
                "core_indicators": {
                    "birthday": {"number": day, "desc": "Your specific talents and niche abilities based on birth date."},
                    "rational_thought": {"number": rational_thought, "desc": "Your unique style of logic and mental processing."},
                    "maturity": {"number": maturity_number, "desc": self.get_maturity_interpretation(maturity_number)},
                    "balance": {"number": balance_number, "desc": self.get_balance_interpretation(balance_number)},
                    "subconscious_self": {"number": subconscious_self, "desc": self.get_subconscious_interpretation(subconscious_self)}
                },
                "initials": initials_data,
                "planes": planes_of_expression,
                "planes_summary": self.get_plane_interpretation(planes_of_expression),
                "bridges": self.calculate_bridge_numbers(life_path, destiny, base["pythagorean"]["soul_urge"], base["pythagorean"]["personality"])
            }
        })

        # section: Ancestral & Spirit
        sections.append({
            "id": "ancestral_spirit",
            "title": "Part II: Ancestral Heritage & Spirit Diamond",
            "estimated_pages": 28,
            "ancestral": ancestral_data,
            "diamond": diamond_data
        })

        # section: Vocation & Talents
        sections.append({
            "id": "vocation_intelligence",
            "title": "Part III: Vocation & Professional Intelligence",
            "estimated_pages": 15,
            "profile": vocation_data,
            "talents_list": talents
        })

        # section: Transit Streams
        sections.append({
            "id": "transit_streams",
            "title": "Vibrational Transit Streams",
            "estimated_pages": 25,
            "timeline": transits_timeline,
            "current_essence": next((t for t in transits_timeline if t["year"] == datetime.now().year), transits_timeline[0])
        })

        sections.append(
            {
                "id": "lucky_years",
                "title": "Detailed Lucky Years Analysis",
                "estimated_pages": 18,
                "lucky_years": upcoming_lucky_years,
                "quarterly_cycles": quarterly_cycles,
                "forecast_years": forecast_years
            }
        )

        sections.append(
            {
                "id": "talent_discovery",
                "title": "Talent Discovery And Strength Blueprint",
                "estimated_pages": 16,
                "talents": talents
            }
        )

        sections.append(
            {
                "id": "predictive_analytics",
                "title": "Five Year Predictive Analytics",
                "estimated_pages": 22,
                "forecast_years": forecast_years,
                "key_decision_points": [
                    m
                    for y in forecast_years
                    for m in y["months"]
                    if m["importance"] == "high"
                ]
            }
        )

        sections.append(
            {
                "id": "life_path_deep_dive",
                "title": "Life Path Deep Dive",
                "estimated_pages": 20,
                "content": life_path_section
            }
        )

        sections.append(
            {
                "id": "relationships",
                "title": "Relationship Compatibility And Communication",
                "estimated_pages": 14,
                "content": relationship_section
            }
        )

        sections.append(
            {
                "id": "career_finance",
                "title": "Career And Financial Blueprint",
                "estimated_pages": 16,
                "ideal_careers": ideal_careers,
                "financial_cycles": financial_cycles,
                "entrepreneurial_potential": entrepreneurial_level
            }
        )

        sections.append(
            {
                "id": "growth_tools",
                "title": "Personal Growth Tools And Practices",
                "estimated_pages": 12,
                "affirmations": affirmations,
                "daily_mantras": [
                    {
                        "number": psychic,
                        "text": "Today I act in alignment with my highest vibration."
                    },
                    {
                        "number": destiny,
                        "text": "Every decision today strengthens my long term destiny."
                    }
                ],
                "meditation_focus": {
                    "primary_number": psychic,
                    "theme": talent_map.get(psychic, {}).get("theme", "")
                }
            }
        )

        sections.append(
            {
                "id": "karmic_history",
                "title": "Karmic And Generational Patterns",
                "estimated_pages": 10,
                "karmic_lessons": karmic_lessons,
                "hidden_passion": hidden_passion,
                "interpretation": "These numbers suggest themes carried from past experiences that seek balance in this life."
            }
        )

        return {
            "meta": meta,
            "core": base["core"], # Use original core from calculate_advanced_numerology
            "pythagorean": pythag,
            "chaldean": chaldean,
            "sections": sections
        }
