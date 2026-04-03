
import re

def check_html_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple tag balancer
    stack = []
    # Find all divs, containers, and cards (common custom elements)
    tags = re.findall(r'<(div|c-container|c-card|c-card-header|c-card-body|c-card-footer|c-row|c-col|c-sidebar|c-header|c-nav-item|c-sidebar-nav|c-sidebar-brand)(?:\s+[^>]*)?>|</(div|c-container|c-card|c-card-header|c-card-body|c-card-footer|c-row|c-col|c-sidebar|c-header|c-nav-item|c-sidebar-nav|c-sidebar-brand)>', content)
    
    line_numbers = content.splitlines()
    
    current_line = 1
    for i, line in enumerate(line_numbers):
        # find all tags in this line
        line_tags = re.findall(r'<(div|c-container|c-card|c-card-header|c-card-body|c-card-footer|c-row|c-col|c-sidebar|c-header|c-nav-item|c-sidebar-nav|c-sidebar-brand)(?:\s+[^>]*)?>|</(div|c-container|c-card|c-card-header|c-card-body|c-card-footer|c-row|c-col|c-sidebar|c-header|c-nav-item|c-sidebar-nav|c-sidebar-brand)>', line)
        for open_tag, close_tag in line_tags:
            if open_tag:
                stack.append((open_tag, i + 1))
            elif close_tag:
                if not stack:
                    print(f"Unexpected closing tag </{close_tag}> at line {i + 1}")
                else:
                    last_open, last_line = stack.pop()
                    if last_open != close_tag:
                        print(f"Mismatched closing tag </{close_tag}> at line {i + 1} (expected </{last_open}> from line {last_line})")
    
    while stack:
        last_open, last_line = stack.pop()
        print(f"Unclosed tag <{last_open}> from line {last_line}")

if __name__ == "__main__":
    check_html_balance(r"d:\Others\CleanNinja\CleanNinja\cleanninja.client\src\app\pages\admin\admin.html")
