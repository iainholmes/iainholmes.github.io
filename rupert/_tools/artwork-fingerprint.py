"""Read-only JPEG identity, dimensions, metadata and perceptual similarity evidence."""
import hashlib, json, sys
from PIL import Image
from io import BytesIO
data = sys.stdin.buffer.read()
im = Image.open(BytesIO(data))
if im.format != 'JPEG': raise ValueError('Use the canonical JPEG pipeline')
if im.getexif() or any(k in im.info for k in ('exif', 'xmp', 'icc_profile')): raise ValueError('JPEG metadata is not stripped')
rgb = im.convert('RGB')
small = rgb.resize((32,40),Image.Resampling.LANCZOS)
gray = rgb.resize((17,16),Image.Resampling.LANCZOS).convert('L')
bits = ''.join('1' if gray.getpixel((x,y)) > gray.getpixel((x+1,y)) else '0' for y in range(16) for x in range(16))
print(json.dumps({'width':im.width,'height':im.height,'pixels':hashlib.sha256(small.tobytes()).hexdigest(),'dhash':f'{int(bits,2):064x}'}))
