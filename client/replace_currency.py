import os, glob, re

files = glob.glob('src/**/*.jsx', recursive=True)

# Regex to match '$' that is NOT followed by '{'
pattern = re.compile(r'\$(?!\{)')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace literal $ with ₹
    new_content = pattern.sub('₹', content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")

