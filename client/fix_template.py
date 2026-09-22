import os, glob
files = glob.glob('src/**/*.jsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if '₹{' in content:
        content = content.replace('₹{', '${')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

