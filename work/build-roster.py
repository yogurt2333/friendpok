from pathlib import Path
root=Path(__file__).resolve().parent.parent
shell=root/'work/roster-shell.html'
out=root/'全角色技能校验.html'
if not shell.exists():
    shell.write_text(out.read_text(encoding='utf-8'),encoding='utf-8')
text=shell.read_text(encoding='utf-8')
css=(root/'assets/roster-preview.css').read_text(encoding='utf-8').replace("url('fusion-pixel", "url('assets/fusion-pixel")
text=text.replace('<link rel="stylesheet" href="assets/roster-preview.css">','<style>'+css+'</style>')
for name in ['roster-skills.js','roster-preview.js']:
    script=(root/'assets'/name).read_text(encoding='utf-8').replace('</script','<\\/script')
    text=text.replace('<script src="assets/'+name+'"></script>','<script>'+script+'</script>')
out.write_text(text,encoding='utf-8')
print('Built offline single HTML, assets external')
