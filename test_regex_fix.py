
import re

def fix_html_content(html):
    if not html: return html
    
    # 1. Replace webapi with api subdomain
    fixed = html.replace("webapi.vedastro.org", "api.vedastro.org")
    
    # 2. Fix missing slashes after timezone segments
    # Previous attempt: fixed = fixed.replace(/([%+]\d{2}:\d{2})([A-Z])/g, '$1/$2');
    # New Robust attempt using lookbehind to ensure 'ChartType' has a slash before it
    
    # Python regex doesn't support variable length lookbehind easily in all versions, 
    # but we can just match anything that isn't a slash before ChartType
    
    # Simulating the JS logic: fixed = fixed.replace(/(?<!\/)(ChartType)/g, '/$1');
    # In Python:
    fixed = re.sub(r'(?<!\/)(ChartType)', r'/\1', fixed)
    
    # Also handle the double slash issue
    # fixed = fixed.replace(/src="([^"]+)"/g, ...);
    
    # Let's mock the JS double slash fix
    def clean_url(match):
        src = match.group(1)
        # Clean double slashes after protocol
        # JS: src.replace(/([^:])\/\//g, '$1/')
        clean_src = re.sub(r'([^:])\/\/', r'\1/', src)
        return f'src="{clean_src}"'
    
    fixed = re.sub(r'src="([^"]+)"', clean_url, fixed)
    
    return fixed

def test():
    test_cases = [
        # Case 1: Standard Broken URL (Missing slash after timezone)
        'src="https://webapi.vedastro.org/api/.../Time/10:00/01/01/2000/+05:30ChartType/Rasi"',
        
        # Case 2: URL with double slashes
        'src="https://webapi.vedastro.org/api//Calculate//SouthIndianChart"',
        
        # Case 3: Correct URL (Should not add extra slash)
        'src="https://webapi.vedastro.org/api/.../Time/.../+05:30/ChartType/Rasi"',
        
        # Case 4: URL with encoding
        'src="https://webapi.vedastro.org/api/.../Time/.../%2B05:30ChartType/Rasi"',
    ]
    
    print("Testing Regex Fixes:\n")
    for i, case in enumerate(test_cases):
        fixed = fix_html_content(case)
        print(f"Case {i+1}:")
        print(f"Original: {case}")
        print(f"Fixed:    {fixed}")
        print("-" * 20)

if __name__ == "__main__":
    test()
