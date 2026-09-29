#!/usr/bin/env python3
"""Read what a master's MP4 container says about itself, without ffprobe.

Walks the ISO BMFF boxes and returns, per track: the handler (vide/soun), codec, timescale and duration, the number
of samples (frames), the frame rate from the sample durations, the sync samples (keyframes), and for video the
width, height and the 'colr' box (primaries, transfer, matrix, full-range flag).

    python3 qc/mp4info.py file.mp4        prints JSON
"""
import json
import struct
import sys

CONTAINERS = {b'moov', b'trak', b'mdia', b'minf', b'stbl', b'edts', b'udta', b'dinf'}


def boxes(buf, start, end):
    i = start
    while i + 8 <= end:
        size, kind = struct.unpack('>I4s', buf[i:i + 8])
        head = 8
        if size == 1:
            size = struct.unpack('>Q', buf[i + 8:i + 16])[0]
            head = 16
        elif size == 0:
            size = end - i
        if size < head:
            break
        yield kind, i + head, i + size
        i += size


def find(buf, start, end, path):
    for kind, a, b in boxes(buf, start, end):
        if kind == path[0]:
            if len(path) == 1:
                return a, b
            return find(buf, a, b, path[1:])
    return None


def track_info(buf, a, b):
    t = {}
    mdhd = find(buf, a, b, [b'mdia', b'mdhd'])
    if mdhd:
        p = mdhd[0]
        version = buf[p]
        if version == 1:
            t['timescale'], t['duration_units'] = struct.unpack('>IQ', buf[p + 20:p + 32])
        else:
            t['timescale'], t['duration_units'] = struct.unpack('>II', buf[p + 12:p + 20])
        t['duration'] = t['duration_units'] / t['timescale']
    hdlr = find(buf, a, b, [b'mdia', b'hdlr'])
    if hdlr:
        t['handler'] = buf[hdlr[0] + 8:hdlr[0] + 12].decode('latin-1')
    stbl = [b'mdia', b'minf', b'stbl']
    stsd = find(buf, a, b, stbl + [b'stsd'])
    if stsd:
        p = stsd[0] + 8  # version/flags + entry count
        size, codec = struct.unpack('>I4s', buf[p:p + 8])
        t['codec'] = codec.decode('latin-1')
        if t.get('handler') == 'vide':
            t['width'], t['height'] = struct.unpack('>HH', buf[p + 32:p + 36])
            # sample entry children start after the 78-byte visual sample entry header
            for kind, ca, cb in boxes(buf, p + 86, p + size):
                if kind == b'colr' and buf[ca:ca + 4] == b'nclx':
                    prim, trc, mat = struct.unpack('>HHH', buf[ca + 4:ca + 10])
                    t['colr'] = {'primaries': prim, 'transfer': trc, 'matrix': mat, 'full_range': bool(buf[ca + 10] >> 7)}
                if kind == b'avcC':
                    t['avc_profile'] = buf[ca + 1]
                    t['avc_level'] = buf[ca + 3]
        if t.get('handler') == 'soun':
            t['channels'], t['sample_size'] = struct.unpack('>HH', buf[p + 24:p + 28])
            t['sample_rate'] = struct.unpack('>I', buf[p + 32:p + 36])[0] >> 16
    stsz = find(buf, a, b, stbl + [b'stsz'])
    if stsz:
        t['samples'] = struct.unpack('>I', buf[stsz[0] + 8:stsz[0] + 12])[0]
    stts = find(buf, a, b, stbl + [b'stts'])
    if stts:
        n = struct.unpack('>I', buf[stts[0] + 4:stts[0] + 8])[0]
        runs = [struct.unpack('>II', buf[stts[0] + 8 + 8 * k:stts[0] + 16 + 8 * k]) for k in range(n)]
        t['sample_deltas'] = sorted({d for _, d in runs})
        if t.get('handler') == 'vide' and len(t['sample_deltas']) == 1 and t.get('timescale'):
            t['fps'] = t['timescale'] / t['sample_deltas'][0]
    stss = find(buf, a, b, stbl + [b'stss'])
    if stss:
        n = struct.unpack('>I', buf[stss[0] + 4:stss[0] + 8])[0]
        t['sync_samples'] = [struct.unpack('>I', buf[stss[0] + 8 + 4 * k:stss[0] + 12 + 4 * k])[0] for k in range(n)]
    elif t.get('handler') == 'vide':
        t['sync_samples'] = 'all'
    return t


def mp4info(path):
    with open(path, 'rb') as f:
        # moov is small; read the whole file only when it sits at the end (no faststart)
        data = f.read()
    moov = find(data, 0, len(data), [b'moov'])
    if not moov:
        raise ValueError(f'{path}: no moov box')
    out = {'faststart': data.find(b'moov') < data.find(b'mdat'), 'tracks': []}
    for kind, a, b in boxes(data, *moov):
        if kind == b'trak':
            out['tracks'].append(track_info(data, a, b))
    return out


if __name__ == '__main__':
    print(json.dumps(mp4info(sys.argv[1]), indent=1, default=str)[:20000])
