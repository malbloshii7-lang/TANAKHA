import numpy as np, cv2, ncnn
from PIL import Image
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=cv2.cvtColor(np.array(Image.open(f'{ROOT}/ref/infographic.png').convert('RGB')),cv2.COLOR_RGB2BGR)
x0,y0,x1,y1=38,20,158,144
crop=src[y0:y1,x0:x1].copy()
net=ncnn.Net(); net.opt.use_vulkan_compute=False; net.opt.num_threads=4
net.load_param(f'{ROOT}/tools/realesrgan/models/realesrgan-x4plus.param'); net.load_model(f'{ROOT}/tools/realesrgan/models/realesrgan-x4plus.bin')
pad=8; p=cv2.copyMakeBorder(crop,pad,pad,pad,pad,cv2.BORDER_REPLICATE); rgb=cv2.cvtColor(p,cv2.COLOR_BGR2RGB); h,w=rgb.shape[:2]
m=ncnn.Mat.from_pixels(np.ascontiguousarray(rgb),ncnn.Mat.PixelType.PIXEL_RGB,w,h); m.substract_mean_normalize([],[1/255.0]*3)
ex=net.create_extractor(); ex.input('data',m); _,o=ex.extract('output')
up=np.clip(np.array(o).transpose(1,2,0)*255,0,255).astype(np.float32)[pad*4:-pad*4,pad*4:-pad*4]  # RGB float
H,W=up.shape[:2]
# background: smooth estimate from border pixels (light gradient)
border=np.concatenate([up[:6].reshape(-1,3),up[-6:].reshape(-1,3),up[:,:6].reshape(-1,3),up[:,-6:].reshape(-1,3)])
bg=np.median(border,axis=0)
print('bg',bg)
d=np.sqrt(((up-bg)**2).sum(-1))
alpha=np.clip((d-14)/(95-14),0,1)
alpha=cv2.GaussianBlur(alpha,(0,0),0.6)
a3=np.maximum(alpha[...,None],1e-3)
col=np.clip((up-(1-a3)*bg)/a3,0,255)
rgba=np.dstack([col,alpha*255]).astype(np.uint8)
Image.fromarray(rgba,'RGBA').save(f'{ROOT}/assets/wmo_emblem.png')
# monochrome watermark version (alpha only, tinted later in CSS)
mono=np.dstack([np.full((H,W),255),np.full((H,W),255),np.full((H,W),255),(alpha*255)]).astype(np.uint8)
Image.fromarray(mono,'RGBA').save(f'{ROOT}/assets/wmo_emblem_mask.png')
# preview on dark + light
prev=Image.new('RGB',(W*2+30,H+20),(244,248,253)); prev.paste(Image.fromarray(rgba,'RGBA'),(10,10),Image.fromarray(rgba,'RGBA'))
dark=Image.new('RGB',(W,H),(20,40,80)); dark.paste(Image.fromarray(rgba,'RGBA'),(0,0),Image.fromarray(rgba,'RGBA')); prev.paste(dark,(W+20,10))
prev.save(f'{ROOT}/ref/emblem_preview.png'); print(W,H)
