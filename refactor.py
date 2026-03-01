import os
import re

PAGE_DIR = r"d:\BE Fintelligence\bridgeaasy app\src\pages"

def refactor_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if this page has the dashboard layout boilerplate
    if 'DashboardSidebar' not in content and 'DashboardHeader' not in content:
        return

    # Remove imports
    content = re.sub(r"import DashboardHeader from '@?/components/DashboardHeader';\n?", "", content)
    content = re.sub(r"import DashboardSidebar from '@?/components/DashboardSidebar';\n?", "", content)
    
    # Remove sidebarOpen state and toggle function
    content = re.sub(r"const \[sidebarOpen,\s*setSidebarOpen\]\s*=\s*useState\(true\);\n?", "", content)
    content = re.sub(r"const handleSidebarToggle\s*=\s*\(\)\s*=>\s*\{\s*setSidebarOpen\(!sidebarOpen\);\s*\};\n?", "", content)
    
    # Remove wrapper JSX
    # Pattern to match the opening wrapper
    wrapper_pattern = r'<div\s+className="min-h-screen[^"]*flex">\s*<DashboardSidebar[^/>]*/>\s*<div[^>]*>\s*<DashboardHeader[^/>]*/>\s*<main[^>]*>'
    
    match = re.search(wrapper_pattern, content)
    if match:
        start_idx = match.start()
        end_idx = match.end()
        
        # We replace the outer wrapper with just <> or keep what's inside
        content = content[:start_idx] + "<>\n" + content[end_idx:]
        
        # Now we need to remove the matching closing tags: </main> </div> </div>
        # Typically the end of the return statement
        close_pattern = r'</main>\s*</div>\s*</div>'
        # Reverse search or just replace the last occurrence
        rs = content.rsplit('</main>', 1)
        if len(rs) == 2:
            end_part = rs[1]
            end_part = re.sub(r'</div>\s*</div>', '</>', end_part, count=1)
            content = rs[0] + end_part
            
    # Fix profile usage since AuthContext uses user
    content = content.replace("const { profile,", "const { user,")
    content = content.replace("profile?.full_name", "user?.displayName")
    content = content.replace("profile?.email", "user?.email")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Refactored: {filepath}")

for filename in os.listdir(PAGE_DIR):
    if filename.endswith('.tsx'):
        refactor_page(os.path.join(PAGE_DIR, filename))
