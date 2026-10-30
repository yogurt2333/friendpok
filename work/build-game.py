"""Build the double-click HTML. Keep images/fonts external; inline local code."""
from pathlib import Path
import re,posixpath
root=Path(__file__).resolve().parent.parent
output=root/'outputs'
html=(root/'work/battle-shell.html').read_text(encoding='utf-8-sig')
def stylesheet(match):
    relative=match.group(1)
    source=(output/relative).read_text(encoding='utf-8-sig')
    def url(m):
        value=m.group(2)
        if value.startswith(('data:','http:','https:','#','/')): return m.group(0)
        return "url('"+posixpath.normpath(posixpath.join(posixpath.dirname(relative),value))+"')"
    source=re.sub(r'url\(([\'"]?)([^\)\'"\s]+)\1\)',url,source)
    return '<style data-source="'+relative+'">\n'+source+'\n</style>'
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',stylesheet,html)
def script(match):
    source=(output/match.group(1)).read_text(encoding='utf-8-sig')
    assert '</script' not in source.lower()
    return '<script data-source="'+match.group(1)+'">\n'+source+'\n</script>'
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
(output/'battle-prototype.html').write_text(html,encoding='utf-8')
print('Built standalone HTML:',len(html.encode('utf-8')),'bytes')
