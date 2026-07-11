from pathlib import Path
import re
import sys

source = Path(sys.argv[1])
destination = Path(sys.argv[2])
destination.mkdir(parents=True, exist_ok=True)

data = source.read_bytes()
count = 0
position = 0
while True:
    header_start = data.find(b'Content-type: image/jpeg', position)
    if header_start < 0:
        break
    header_end = data.find(b'\r\n\r\n', header_start)
    header = data[header_start:header_end]
    length = int(re.search(br'Content-length: (\d+)', header, re.IGNORECASE).group(1))
    payload_start = header_end + 4
    (destination / f'{count:02}.jpg').write_bytes(data[payload_start:payload_start + length])
    position = payload_start + length
    count += 1

print(f'Extracted {count} storyboard sheets from {source.name}')
