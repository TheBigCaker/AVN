# Copyright (c) 2026 David Baker (Delta Vector) and the Sol Mech R&D team.
# Licensed under the Business Source License 1.1 (BSL 1.1). See LICENSE.md in the project root for license information.

import sys
import os
from pathlib import Path

# Add the CCP compiler directory to Python path
sys.path.insert(0, "/data/data/com.termux/files/home/CCP-C-Cython-Python")

try:
    from ccp.webdsl import compile_web_artifacts
except ImportError as e:
    print(f"Failed to import CCP WebDSL: {e}")
    sys.exit(1)

def compile_ccp_to_html(ccp_path: Path, output_dir: Path):
    if not ccp_path.exists():
        print(f"Source file not found: {ccp_path}")
        return

    print(f"Compiling {ccp_path.name}...")
    source_content = ccp_path.read_text(encoding="utf-8")
    
    # Extract only lines within the @web ... @end block
    web_lines = []
    in_web_block = False
    for line_no, line in enumerate(source_content.splitlines(), start=1):
        stripped = line.strip()
        if stripped == "@web":
            in_web_block = True
            continue
        elif stripped == "@end" and in_web_block:
            in_web_block = False
            break
        
        if in_web_block:
            web_lines.append((line_no, line))

    if not web_lines:
        print(f"Error: No @web block found in {ccp_path.name}")
        return

    try:
        # Compile WebDSL nodes and styles into artifacts
        artifacts = compile_web_artifacts(web_lines)
        if not artifacts:
            print("No artifacts generated.")
            return

        # Combine all component outputs
        output_dir.mkdir(parents=True, exist_ok=True)
        
        for art in artifacts:
            # Generate the unified HTML document
            html_content = art.html
            css_content = art.css
            
            # Inject CSS style tag before the closing body or at the end
            style_tag = f"\n<style>\n{css_content}\n</style>\n"
            
            # Inject beautiful fonts dynamically
            font_links = '<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">\n'
            
            unified_page = f"<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>AVN Commons</title>\n{font_links}{style_tag}</head>\n<body>\n{html_content}\n</body>\n</html>"
            
            # Write to HTML target file
            dest_name = ccp_path.stem + ".html"
            dest_path = output_dir / dest_name
            dest_path.write_text(unified_page, encoding="utf-8")
            print(f"  🟢 Emitted static HTML page: {dest_path}")
            
    except Exception as e:
        import traceback
        print(f"Compilation error in {ccp_path.name}: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    src_dir = Path("/data/data/com.termux/files/home/AVN_Commons/src/pages")
    dest_dir = Path("/data/data/com.termux/files/home/AVN_Commons/public")
    
    # Compile AVN Commons
    compile_ccp_to_html(src_dir / "AVN_Commons.ccp", dest_dir)
    # Compile OODA/Billing Dashboard
    compile_ccp_to_html(src_dir / "OodaDashboard.ccp", dest_dir)
    
    # Copy AVN_Commons.html to index.html
    import shutil
    shutil.copy(dest_dir / "AVN_Commons.html", dest_dir / "index.html")
    print("  🟢 Copied AVN_Commons.html to index.html")

