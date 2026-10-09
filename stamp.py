"""Stamp asset links with a fresh version (?v=...) so browsers never mix old and new scripts.
Run before every commit: python3 stamp.py"""
import re, time
v = time.strftime("%Y%m%d%H%M")
for p in ["index.html", "menu.html", "guide.html", "order.html", "admin.html"]:
    s = open(p).read()
    s = re.sub(r'((?:src|href)="assets/[\w-]+\.(?:js|css))(?:\?v=\w+)?"', rf'\1?v={v}"', s)
    open(p, "w").write(s)
print("stamped", v)
