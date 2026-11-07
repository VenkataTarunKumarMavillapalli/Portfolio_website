"""Create a self-contained offline preview; no packages or network required."""
from pathlib import Path
import re,base64,sys
root=Path(__file__).resolve().parents[1]
output=Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'Venkata-Always-Becoming.html'
html=(root/'index.html').read_text()
css=(root/'assets/styles.css').read_text()
html=html.replace('<link rel="stylesheet" href="assets/styles.css">','<style>\n'+css+'\n</style>')
html=re.sub(r'\s*<script src="assets/[^"\n]+" defer></script>','',html)
favicon=base64.b64encode((root/'assets/favicon.svg').read_bytes()).decode()
html=html.replace('href="assets/favicon.svg"','href="data:image/svg+xml;base64,'+favicon+'"')
scripts='\n'.join('<script>\n'+(root/'assets'/name).read_text().replace('</script','<\\/script')+'\n</script>' for name in ['content.js','land.js','motion.js','app.js'])
html=html.replace('</body>',scripts+'\n</body>')
# This local preview remains self-contained even with JavaScript disabled.
html=html.replace('For the full biography, open <a href="profile.html">the professional overview</a>.','Open the source package’s profile.html for a text-only professional overview.')
output.write_text(html)
print(f'Created {output} ({output.stat().st_size:,} bytes)')
