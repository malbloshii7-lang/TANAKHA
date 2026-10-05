import re, urllib.request, os, sys
OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'assets','fonts')
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
FAMS={
 'Merriweather':'Merriweather:opsz,wdth,wght@18..144,87..112,300..900',
 'Noto Sans':'Noto+Sans:wght@100..900',
}
css_all=[]
for fam,q in FAMS.items():
    url=f'https://fonts.googleapis.com/css2?family={q}&display=block'
    css=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA})).read().decode()
    # keep only latin + latin-ext subsets
    blocks=re.findall(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*{[^}]*})',css)
    keep=[(s,b) for s,b in blocks if s in ('latin','latin-ext')]
    for s,b in keep:
        u=re.search(r'url\((https://[^)]+)\)',b).group(1)
        fn=re.sub(r'[^A-Za-z0-9]+','-',fam).strip('-')+'-'+s+'-'+str(abs(hash(u))%10**8)+'.woff2'
        path=os.path.join(OUT,fn)
        if not os.path.exists(path):
            open(path,'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA})).read())
        css_all.append(b.replace(u,'fonts/'+fn))
    print(fam,len(keep),'faces')
open(os.path.join(os.path.dirname(OUT),'fonts.css'),'w').write('\n'.join(css_all))
