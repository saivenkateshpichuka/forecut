"""Build the 3D Drape Studio avatars from the MakeHuman base mesh and macro targets (both CC0 1.0).

Source: https://github.com/makehumancommunity/makehuman (makehuman/data/3dobjs, targets/macrodetails, rigs).
Fetch it once, then run:  python3 avatar_build.py /path/to/makehuman/makehuman/data
Writes tools/avatar/avatars.bin and tools/avatar/avatars.json:
  - the body-only mesh (triangles), and one shape per size chart entry (women, men, kids),
  - per-vertex part weights (torso / arm / leg / head) from the MakeHuman skin weights,
  - joint centres (shoulder, elbow, wrist, hip, knee, ankle, neck, pelvis) for every shape.
The browser fits a shape exactly to the chosen measurements (heights and girths) at run time.
"""
import json, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'avatar')

# size -> MakeHuman macro settings (gender 0 = female, 1 = male; weight/muscle 0..1; age in years)
# body type -> (gender 0 female / 1 male, [(age, muscle, weight)] base shapes, {size: base shape index})
# A few base shapes per body type; every chart size maps to its nearest base, then the browser fits it exactly.
CATS = {
    'women': (0, [(25, .5, .30), (25, .5, .46), (25, .5, .62), (25, .5, .80)], {'XXS': 0, 'XS': 0, 'S': 1, 'M': 1, 'L': 2, 'XL': 2, 'XXL': 3, '3XL': 3, '4XL': 3}),
    'men': (1, [(25, .55, .34), (25, .55, .5), (25, .55, .66), (25, .55, .85)], {'XS': 0, 'S': 0, 'M': 1, 'L': 1, 'XL': 2, 'XXL': 2, '3XL': 3, '4XL': 3, '5XL': 3}),
    'girl': (0, [(5, .5, .5), (9, .5, .5), (13, .5, .5)], {'4Y': 0, '6Y': 0, '8Y': 1, '10Y': 1, '12Y': 2, '14Y': 2}),
    'boy': (1, [(5, .5, .5), (9, .5, .5), (13, .5, .5)], {'4Y': 0, '6Y': 0, '8Y': 1, '10Y': 1, '12Y': 2, '14Y': 2}),
    'tgirl': (0, [(1.5, .5, .55), (3.5, .5, .5)], {'12M': 0, '18M': 0, '2Y': 0, '3Y': 1, '4Y': 1}),
    'tboy': (1, [(1.5, .5, .55), (3.5, .5, .5)], {'12M': 0, '18M': 0, '2Y': 0, '3Y': 1, '4Y': 1}),
}
# older saved designs use 'kids': map those sizes onto the boy and toddler-boy bases
LEGACY = {'kids': {'2Y': ('tboy', '2Y'), '4Y': ('boy', '4Y'), '6Y': ('boy', '6Y'), '8Y': ('boy', '8Y'), '10Y': ('boy', '10Y'), '12Y': ('boy', '12Y'), '14Y': ('boy', '14Y')}}
JOINTS = ['l-shoulder', 'l-elbow', 'l-hand', 'r-shoulder', 'r-elbow', 'r-hand', 'l-upper-leg', 'l-knee', 'l-ankle', 'r-upper-leg', 'r-knee', 'r-ankle', 'neck', 'pelvis', 'head']


def load(D):
    V, G, grp = [], {}, None
    for line in open(os.path.join(D, '3dobjs/base.obj')):
        if line.startswith('v '):
            V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('g '):
            grp = line.split()[1]
        elif line.startswith('f '):
            G.setdefault(grp, []).append([int(t.split('/')[0]) - 1 for t in line.split()[1:]])
    return np.array(V), G


def main(D):
    V, G = load(D)
    cache = {}

    def tgt(name):
        if name in cache:
            return cache[name]
        d = np.zeros_like(V)
        p = os.path.join(D, 'targets', name)
        if os.path.exists(p):
            for l in open(p):
                if l[0] == '#' or not l.strip():
                    continue
                a = l.split()
                d[int(a[0])] = [float(a[1]), float(a[2]), float(a[3])]
        cache[name] = d
        return d

    def w3(v):
        return {'min': max(0, 1 - 2 * v), 'average': 1 - abs(1 - 2 * v), 'max': max(0, 2 * v - 1)}

    def shape(gender, age, muscle, weight):
        gw = {'female': 1 - gender, 'male': gender}
        if age <= 11:
            t = (age - 1) / 10
            aw = {'baby': 1 - t, 'child': t, 'young': 0}
        elif age <= 25:
            t = (age - 11) / 14
            aw = {'baby': 0, 'child': 1 - t, 'young': t}
        else:
            aw = {'baby': 0, 'child': 0, 'young': 1}
        out = V.copy()
        for g, gv in gw.items():
            for a, av in aw.items():
                if not gv or not av:
                    continue
                for r in ['caucasian', 'african', 'asian']:
                    out += gv * av / 3 * tgt(f'macrodetails/{r}-{g}-{a}.target')
                for m_, mv in w3(muscle).items():
                    for w_, wv in w3(weight).items():
                        k = gv * av * mv * wv
                        if k:
                            out += k * tgt(f'macrodetails/universal-{g}-{a}-{m_}muscle-{w_}weight.target')
        return out * 10  # decimetres -> cm

    body = G['body']
    used = np.unique(np.array([i for q in body for i in q]))
    remap = -np.ones(len(V), int)
    remap[used] = np.arange(len(used))
    tri = []
    for q in body:
        q = [remap[i] for i in q]
        tri += [q[0], q[1], q[2]] + ([q[0], q[2], q[3]] if len(q) == 4 else [])
    n = len(used)

    # part weights from the MakeHuman skin weights
    W = json.load(open(os.path.join(D, 'rigs/default_weights.mhw')))['weights']
    part = np.zeros((len(V), 4))  # torso, arm, leg, head
    for bone, lst in W.items():
        b = bone.lower()
        k = 1 if any(s in b for s in ['upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal', 'hand']) else \
            2 if any(s in b for s in ['upperleg', 'lowerleg', 'foot', 'toe']) else \
            3 if any(s in b for s in ['head', 'jaw', 'eye', 'oculi', 'oris', 'orbicularis', 'levator', 'risorius', 'tongue', 'temporalis', 'mandible', 'special', 'nose']) else 0
        for vi, w in lst:
            part[vi, k] += w
    part = part / np.maximum(part.sum(1, keepdims=True), 1e-6)
    part[part.sum(1) == 0] = [1, 0, 0, 0]
    partU8 = np.round(part[used] * 255).astype(np.uint8)

    shapes, meta = [], {'n': int(n), 'tris': len(tri) // 3, 'scale': 0.01, 'shapes': {}, 'joints': JOINTS,
                        'source': 'MakeHuman base mesh and macro targets, CC0 1.0 (makehumancommunity/makehuman)'}
    for cat, (gen, bases, sizes) in CATS.items():
        first = len(shapes)
        joints = []
        for (age, mus, wt) in bases:
            P = shape(gen, age, mus, wt)
            P[:, 1] -= P[used, 1].min()
            js = {}
            for j in JOINTS:
                grp = G.get('joint-' + j)
                if grp:
                    js[j] = np.round(P[np.unique(np.array(grp))].mean(0), 2).tolist()
            joints.append(js)
            shapes.append(np.round(P[used] / 0.01).astype(np.int16))
            print(cat, age, wt, 'height', round(P[used, 1].max(), 1))
        for sz, bi in sizes.items():
            meta['shapes'][cat + '|' + sz] = {'i': first + bi, 'joints': joints[bi]}
    for cat, mp in LEGACY.items():
        for sz, (c2, s2) in mp.items():
            meta['shapes'][cat + '|' + sz] = meta['shapes'][c2 + '|' + s2]
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'avatars.bin'), 'wb') as f:
        f.write(np.array(tri, np.uint16).tobytes())
        f.write(partU8.tobytes())
        for s in shapes:
            f.write(s.tobytes())
    meta['layout'] = {'tri': [0, len(tri) * 2], 'part': [len(tri) * 2, n * 4], 'shape0': len(tri) * 2 + n * 4, 'shapeBytes': n * 6}
    json.dump(meta, open(os.path.join(OUT, 'avatars.json'), 'w'), separators=(',', ':'))
    print('wrote', os.path.getsize(os.path.join(OUT, 'avatars.bin')) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1])
