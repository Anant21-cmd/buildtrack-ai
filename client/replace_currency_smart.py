import os, glob, re

files = glob.glob('src/**/*.jsx', recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace all $ with ₹
    new_content = content.replace('$', '₹')
    
    # Restore template literals inside backticks
    def replacer(match):
        return match.group(0).replace('₹{', '${')
    
    new_content = re.sub(r'`[^`]*`', replacer, new_content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")

