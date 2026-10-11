import cv2,numpy as np,json,random,math
random.seed(3);np.random.seed(3)
src=cv2.imread('/mnt/user-data/uploads/20181.jpg'); crop=src[60:1500,0:1080]
def vig(w,h):
    yy,xx=np.mgrid[0:h,0:w]; d=np.sqrt(((xx-.57*w)/(.64*w))**2+((yy-.47*h)/(.57*h))**2)
    return np.clip((1.05-d)/.45,0,1)**1.2
big=cv2.resize(crop,(810,1080),interpolation=cv2.INTER_AREA); mb=vig(810,1080)[...,None]
paper=np.array([240,250,255],float); cv2.imwrite('proj/assets/images/her.jpg',(big*mb+paper*(1-mb)).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
s=cv2.resize(crop,(540,720),interpolation=cv2.INTER_AREA); g=cv2.createCLAHE(2.0,(8,8)).apply(cv2.cvtColor(s,cv2.COLOR_BGR2GRAY)); m=vig(540,720)
# tone overlay (soft graphite)
soft=cv2.GaussianBlur(g,(0,0),3).astype(float); a=np.clip((255-soft)/255*1.1*m,0,1)*.6
png=np.dstack([np.full((720,540),n,np.uint8) for n in (40,35,45)]+[(a*255).astype(np.uint8)]); cv2.imwrite('proj/assets/sketch/tone.png',png)
# outline strokes
ed=cv2.Canny(cv2.GaussianBlur(g,(0,0),2.0),40,105); ed[m<.3]=0
cs,_=cv2.findContours(ed,cv2.RETR_LIST,cv2.CHAIN_APPROX_NONE); E=[]
for c in cs:
    if len(c)<36: continue
    p=cv2.approxPolyDP(np.ascontiguousarray(c[::2]),1.3,False)[:,0,:]
    if len(p)>=2: E.append(p.flatten().tolist())
order=[];cur=np.array([0,0]);rem=E[:]
while rem:
    j=min(range(len(rem)),key=lambda i:(rem[i][0]-cur[0])**2+(rem[i][1]-cur[1])**2); e=rem.pop(j); order.append(e); cur=np.array(e[-2:])
def hatch(mask,ang,sp):
    h,w=mask.shape; D=int(math.hypot(w,h)); a=math.radians(ang); dv=np.array([math.cos(a),math.sin(a)]); nv=np.array([-dv[1],dv[0]]); c=np.array([w/2,h/2]); t=np.arange(-D//2,D//2); out=[]
    for o in np.arange(-D//2,D//2,sp):
        P=c+(o+random.uniform(-1,1))*nv+t[:,None]*dv; xs=P[:,0].round().astype(int); ys=P[:,1].round().astype(int)
        ok=(xs>=0)&(xs<w)&(ys>=0)&(ys<h); v=np.zeros(len(t),bool); v[ok]=mask[ys[ok],xs[ok]]
        d=np.diff(np.concatenate([[0],v.astype(int),[0]])); st=np.where(d==1)[0]; en=np.where(d==-1)[0]
        for s0,e0 in zip(st,en):
            pos=s0
            while pos<e0:
                q=min(e0,pos+random.randint(18,40))
                if q-pos>=6:
                    p0,p1=P[pos],P[q-1]; out.append([int(p0[0]+random.uniform(-.7,.7)),int(p0[1]+random.uniform(-.7,.7)),int(p1[0]+random.uniform(-.7,.7)),int(p1[1]+random.uniform(-.7,.7))])
                pos=q+random.randint(-4,2)
    out.sort(key=lambda s:(s[1]//45,s[0])); return out
t=cv2.GaussianBlur(g,(0,0),2.5)
L=[dict(s=order,d=6.5,w=2.0,a=.8)]
for th,ang,sp,dur,al in [(150,50,6,2.6,.24),(112,-40,6,2.6,.28),(78,10,5,2.2,.32),(48,85,5,1.6,.36)]:
    L.append(dict(s=hatch((t<th)&(m>.28),ang,sp),d=dur,w=1.4,a=al))
open('proj/js/strokes.js','w').write('window.SKETCH='+json.dumps(dict(layers=L),separators=(',',':'))+';')
print([len(l['s']) for l in L])
# quick simulation of the final drawing
can=np.full((720,540),250.,float)
for l in L:
    lay=np.full((720,540),255,np.uint8)
    for st in l['s']: cv2.polylines(lay,[np.array(st,np.int32).reshape(-1,2)],False,40,1,cv2.LINE_AA)
    can*= (1-l['a']*(1-lay/255.))
can*=(1-(a*.9))
cv2.imwrite('sim.png',can.astype(np.uint8))
