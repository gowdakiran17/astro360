from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
text = """Vedic Astrology Basics
The 12 Houses represent different aspects of life.
The 9 Planets (Navagraha) influence these houses.
Saturn (Shani) represents discipline, delay, and karma.
Jupiter (Guru) represents wisdom, expansion, and luck.
Mars (Mangal) represents energy, action, and conflict.

KP Astrology Rules
Rule 1: A planet gives results of its Star Lord.
Rule 2: Sub Lord decides the quality of the result.
Rule 3: Cuspal Sub Lord determines the promise of an event.
"""
pdf.multi_cell(0, 10, text)
pdf.output("sample_astrology.pdf")
print("PDF Generated successfully")
