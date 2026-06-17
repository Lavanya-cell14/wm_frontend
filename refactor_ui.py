import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    components_used = set()
    
    # Buttons
    if re.search(r'<button\b', content) or re.search(r'</button>', content):
        content = re.sub(r'<button\b', r'<Button', content)
        content = re.sub(r'</button>', r'</Button>', content)
        components_used.add('Button')
        
    # Inputs
    if re.search(r'<input\b', content):
        content = re.sub(r'<input\b', r'<Input', content)
        components_used.add('Input')
        
    # Tables
    if re.search(r'<table\b', content) or re.search(r'</table>', content):
        content = re.sub(r'<table\b', r'<Table', content)
        content = re.sub(r'</table>', r'</Table>', content)
        components_used.add('Table')
        
    if re.search(r'<thead\b', content) or re.search(r'</thead>', content):
        content = re.sub(r'<thead\b', r'<TableHeader', content)
        content = re.sub(r'</thead>', r'</TableHeader>', content)
        components_used.add('TableHeader')
        
    if re.search(r'<tbody\b', content) or re.search(r'</tbody>', content):
        content = re.sub(r'<tbody\b', r'<TableBody', content)
        content = re.sub(r'</tbody>', r'</TableBody>', content)
        components_used.add('TableBody')
        
    if re.search(r'<tr\b', content) or re.search(r'</tr>', content):
        content = re.sub(r'<tr\b', r'<TableRow', content)
        content = re.sub(r'</tr>', r'</TableRow>', content)
        components_used.add('TableRow')
        
    if re.search(r'<th\b', content) or re.search(r'</th>', content):
        content = re.sub(r'<th\b', r'<TableHead', content)
        content = re.sub(r'</th>', r'</TableHead>', content)
        components_used.add('TableHead')
        
    if re.search(r'<td\b', content) or re.search(r'</td>', content):
        content = re.sub(r'<td\b', r'<TableCell', content)
        content = re.sub(r'</td>', r'</TableCell>', content)
        components_used.add('TableCell')

    if content != original_content:
        # Handle imports
        import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]shared-ui['\"];?", content)
        if import_match:
            existing_imports = set([i.strip() for i in import_match.group(1).split(',')])
            for comp in components_used:
                existing_imports.add(comp)
            new_import_str = "import { " + ", ".join(sorted(list(existing_imports))) + " } from 'shared-ui';"
            content = content.replace(import_match.group(0), new_import_str)
        else:
            # Add import after React import or at top
            new_import_str = "import { " + ", ".join(sorted(list(components_used))) + " } from 'shared-ui';\n"
            
            react_import_match = re.search(r"import\s+.*?from\s+['\"]react['\"];?\n", content)
            if react_import_match:
                end_pos = react_import_match.end()
                content = content[:end_pos] + new_import_str + content[end_pos:]
            else:
                content = new_import_str + content
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    root_dirs = [r'c:\TYN\wm_frontend\src\pages', r'c:\TYN\wm_frontend\src\components']
    for root_dir in root_dirs:
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                if filename.endswith('.jsx') or filename.endswith('.js'):
                    filepath = os.path.join(dirpath, filename)
                    process_file(filepath)

if __name__ == '__main__':
    main()
