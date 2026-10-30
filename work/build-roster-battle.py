from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
s=(root/'work/roster-battle-shell.html').read_text(encoding='utf-8')
def css(m):
    t=(root/m[1]).read_text(encoding='utf-8-sig')
    t=re.sub(r"url\('([^']+)'\)",lambda v:"url('assets/"+v[1]+"')",t)
    return '<style>'+t+'</style>'
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css,s)
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(root/m[1]).read_text(encoding='utf-8-sig').replace('</script','<\\/script')+'</script>',s)
(root/'全角色对战.html').write_text(s,encoding='utf-8')
print('Built full roster battle HTML')
