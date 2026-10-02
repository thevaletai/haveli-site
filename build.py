"""Build self-contained copies of each page (CSS, JS and images inlined) for sharing/previewing."""
import base64, re, os
def uri(path):
    return 'data:image/webp;base64,' + base64.b64encode(open(path,'rb').read()).decode()
css = open('assets/site.css').read()
css = re.sub(r'url\(([\w-]+\.webp)\)', lambda m: f'url({uri("assets/"+m.group(1))})', css)
names = {'index.html': 'haveli-home.html', 'menu.html': 'haveli-menu.html', 'guide.html': 'haveli-spice-101.html'}
for src, out in names.items():
    s = open(src).read()
    s = s.replace('<link rel="stylesheet" href="assets/site.css">', f'<style>\n{css}</style>')
    # standalone copies can't fetch data/menu.json from disk, so embed the menu data
    s = s.replace('<script src="assets/site.js"></script>', '<script>window.MENU_DATA=' + open('data/menu.json').read().strip() + ';</script>\n<script src="assets/site.js"></script>')
    s = re.sub(r'<script src="(assets/[\w-]+\.js)"></script>', lambda m: f'<script>\n{open(m.group(1)).read()}</script>', s)
    s = re.sub(r'assets/[\w-]+\.webp', lambda m: uri(m.group(0)), s)
    for a, b in names.items():
        s = s.replace(f'href="{a}', f'href="{b}')
    assert 'assets/' not in s, re.findall(r'assets/[^"\s)]+', s)[:3]
    open(out, 'w').write(s)
    print(out, os.path.getsize(out)//1024, 'KB')
