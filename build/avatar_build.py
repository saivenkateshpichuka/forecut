"""Build the 3D Drape Studio avatars from the MakeHuman base mesh, targets and skin weights (all CC0 1.0).

Source data, either of:
  - MakeHuman (https://github.com/makehumancommunity/makehuman): makehuman/data with 3dobjs, targets, rigs
  - MPFB 2 (the MakeHuman add-on for Blender, CC0 assets; also shipped inside Anny, Apache 2.0, github.com/naver/anny):
    src/anny/data/mpfb2 with 3dobjs, targets/*.target.gz, rigs/standard
Run:  python3 avatar_build.py /path/to/data
Writes tools/avatar/avatars.bin and tools/avatar/avatars.json:
  - the body-only mesh (triangles) and per-vertex part weights (torso / arm / leg / head),
  - skin weights for the game-engine skeleton (4 bones per vertex) and the bone list, for poses,
  - base shapes for every body type (women, men, kids, toddlers; athletic, mature and maternity forms),
  - sparse measurement targets (upper arm, wrist, thigh, knee, calf, ankle, neck, shoulder, arm and leg lengths ...),
  - joint stencils: each joint as a fixed blend of nearby skin vertices, so joints follow every shape change.
The browser picks the base shape for the body type and size, solves the measurement targets, then fits heights and girths.
"""
import gzip, json, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'avatar')

# body type -> (gender 0 female / 1 male, [(age, muscle, weight, extra targets)] base shapes, {size: base index})
W4 = {'XXS': 0, 'XS': 0, 'S': 1, 'M': 1, 'L': 2, 'XL': 2, 'XXL': 3, '3XL': 3, '4XL': 3}
M4 = {'XS': 0, 'S': 0, 'M': 1, 'L': 1, 'XL': 2, 'XXL': 2, '3XL': 3, '4XL': 3, '5XL': 3}
PREG = {'stomach/stomach-pregnant-incr': 1.0}
CATS = {
    'women': (0, [(25, .5, .30, {}), (25, .5, .46, {}), (25, .5, .62, {}), (25, .5, .80, {})], W4),
    'women~athletic': (0, [(25, .8, .30, {}), (25, .8, .42, {}), (25, .8, .56, {}), (25, .8, .72, {})], W4),
    'women~mature': (0, [(62, .45, .40, {}), (62, .45, .52, {}), (62, .45, .66, {}), (62, .45, .82, {})], W4),
    'women~maternity': (0, [(28, .5, .40, PREG), (28, .5, .50, PREG), (28, .5, .64, PREG), (28, .5, .80, PREG)], W4),
    'men': (1, [(25, .55, .34, {}), (25, .55, .5, {}), (25, .55, .66, {}), (25, .55, .85, {})], M4),
    'men~athletic': (1, [(25, .85, .32, {}), (25, .85, .46, {}), (25, .85, .6, {}), (25, .85, .78, {})], M4),
    'men~mature': (1, [(62, .45, .40, {}), (62, .45, .55, {}), (62, .45, .70, {}), (62, .45, .86, {})], M4),
    'girl': (0, [(5, .5, .5, {}), (9, .5, .5, {}), (13, .5, .5, {})], {'4Y': 0, '6Y': 0, '8Y': 1, '10Y': 1, '12Y': 2, '14Y': 2}),
    'boy': (1, [(5, .5, .5, {}), (9, .5, .5, {}), (13, .5, .5, {})], {'4Y': 0, '6Y': 0, '8Y': 1, '10Y': 1, '12Y': 2, '14Y': 2}),
    'tgirl': (0, [(1.5, .5, .55, {}), (3.5, .5, .5, {})], {'12M': 0, '18M': 0, '2Y': 0, '3Y': 1, '4Y': 1}),
    'tboy': (1, [(1.5, .5, .55, {}), (3.5, .5, .5, {})], {'12M': 0, '18M': 0, '2Y': 0, '3Y': 1, '4Y': 1}),
}
LEGACY = {'kids': {'2Y': ('tboy', '2Y'), '4Y': ('boy', '4Y'), '6Y': ('boy', '6Y'), '8Y': ('boy', '8Y'), '10Y': ('boy', '10Y'), '12Y': ('boy', '12Y'), '14Y': ('boy', '14Y')}}
JOINTS = ['l-shoulder', 'l-elbow', 'l-hand', 'r-shoulder', 'r-elbow', 'r-hand', 'l-upper-leg', 'l-knee', 'l-ankle', 'r-upper-leg', 'r-knee', 'r-ankle', 'neck', 'pelvis', 'head', 'l-eye', 'r-eye']
# measurement targets the browser solves for (symmetric: both sides at once)
LOCAL = {
    'upperarm_circ': 'arms/measure-upperarm-circ', 'upperarm_len': 'arms/measure-upperarm-length', 'lowerarm_len': 'arms/measure-lowerarm-length',
    'wrist': 'hands/measure-wrist-circ', 'ankle': 'feet/measure-ankle-circ', 'calf': 'legs/measure-calf-circ', 'knee': 'legs/measure-knee-circ',
    'thigh': 'legs/measure-thigh-circ', 'upperleg_len': 'legs/measure-upperleg-height', 'lowerleg_len': 'legs/measure-lowerleg-height',
    'neck': 'neck/measure-neck-circ', 'neck_len': 'neck/measure-neck-height', 'shoulder': 'torso/measure-shoulder-dist',
    'frontchest': 'torso/measure-frontchest-dist', 'underbust': 'torso/measure-underbust-circ', 'bump': 'stomach/stomach-pregnant',
}


def read_target(D, name):
    for ext in ('.target', '.target.gz'):
        p = os.path.join(D, 'targets', name + ext)
        if os.path.exists(p):
            f = gzip.open(p, 'rt') if ext.endswith('.gz') else open(p)
            out = []
            for l in f:
                if l[0] == '#' or not l.strip():
                    continue
                a = l.split()
                out.append((int(a[0]), float(a[1]), float(a[2]), float(a[3])))
            return out
    return None


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


def weights_file(D):
    for p in ['rigs/standard/weights.game_engine.json', 'rigs/game_engine.mhw']:
        if os.path.exists(os.path.join(D, p)):
            return json.load(open(os.path.join(D, p)))['weights']
    return None


def main(D):
    V, G = load(D)
    cache = {}

    def tgt(name):
        if name not in cache:
            d = np.zeros_like(V)
            t = read_target(D, name)
            if t:
                for i, x, y, z in t:
                    d[i] = [x, y, z]
            cache[name] = d
        return cache[name]

    def w3(v):
        return {'min': max(0, 1 - 2 * v), 'average': 1 - abs(1 - 2 * v), 'max': max(0, 2 * v - 1)}

    def ages(age):  # MakeHuman: baby 1, child 11, young 25, old 90 years
        if age <= 11:
            t = (age - 1) / 10
            return {'baby': 1 - t, 'child': t}
        if age <= 25:
            t = (age - 11) / 14
            return {'child': 1 - t, 'young': t}
        t = min(1, (age - 25) / 65)
        return {'young': 1 - t, 'old': t}

    def shape(gender, age, muscle, weight, extra):
        gw = {'female': 1 - gender, 'male': gender}
        out = V.copy()
        for g, gv in gw.items():
            for a, av in ages(age).items():
                if not gv or not av:
                    continue
                for r in ['caucasian', 'african', 'asian']:
                    out += gv * av / 3 * tgt(f'macrodetails/{r}-{g}-{a}')
                for m_, mv in w3(muscle).items():
                    for w_, wv in w3(weight).items():
                        k = gv * av * mv * wv
                        if k:
                            out += k * tgt(f'macrodetails/universal-{g}-{a}-{m_}muscle-{w_}weight')
        for name, k in extra.items():
            out += k * tgt(name)
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

    # part weights and skin weights from the game-engine skeleton
    W = weights_file(D)
    bones = sorted(W.keys())
    part = np.zeros((len(V), 4))  # torso, arm, leg, head
    skin = [[] for _ in range(len(V))]
    for bone, lst in W.items():
        b = bone.lower()
        k = 1 if any(s in b for s in ['upperarm', 'lowerarm', 'hand', 'thumb', 'index', 'middle', 'ring', 'pinky']) else \
            2 if any(s in b for s in ['thigh', 'calf', 'foot', 'ball']) else \
            3 if any(s in b for s in ['head']) else 0
        bi = bones.index(bone)
        for vi, w in lst:
            part[vi, k] += w
            skin[vi].append((w, bi))
    part = part / np.maximum(part.sum(1, keepdims=True), 1e-6)
    part[part.sum(1) == 0] = [1, 0, 0, 0]
    partU8 = np.round(part[used] * 255).astype(np.uint8)
    sb = np.zeros((n, 4), np.uint8)
    sw = np.zeros((n, 4), np.uint8)
    for j, vi in enumerate(used):
        s = sorted(skin[vi], reverse=True)[:4]
        tot = sum(w for w, _ in s) or 1
        ws = [int(round(w / tot * 255)) for w, _ in s]
        if ws:
            ws[0] += 255 - sum(ws)
        for k2, ((w, bi), wq) in enumerate(zip(s, ws)):
            sb[j, k2] = bi
            sw[j, k2] = wq

    # joints: centres of the MakeHuman joint cubes; the rig names its bone ends by those cubes
    rig = {}
    rp = os.path.join(D, 'rigs/standard/rig.game_engine.json')
    if os.path.exists(rp):
        rig = json.load(open(rp))
    jnames = sorted(set(JOINTS) | {b[k]['cube_name'][6:] for b in rig.values() for k in ('head', 'tail') if b.get(k, {}).get('cube_name', '').startswith('joint-')})
    jnames = [j for j in jnames if G.get('joint-' + j)]

    def joints_of(P):
        return {j: P[np.unique(np.array(G['joint-' + j]))].mean(0) for j in jnames}

    # base shapes
    shapes, meta = [], {'n': int(n), 'tris': len(tri) // 3, 'scale': 0.01, 'shapes': {}, 'joints': JOINTS,
                        'source': 'MakeHuman base mesh, targets and skin weights, CC0 1.0 (makehumancommunity; MPFB 2 assets as shipped in naver/anny)'}
    samples = []
    for cat, (gen, bases, sizes) in CATS.items():
        first = len(shapes)
        joints = []
        for (age, mus, wt, extra) in bases:
            P = shape(gen, age, mus, wt, extra)
            P[:, 1] -= P[used, 1].min()
            js = joints_of(P)
            joints.append({j: np.round(js[j], 2).tolist() for j in JOINTS if j in js})
            samples.append((P, js))
            shapes.append(np.round(P[used] / 0.01).astype(np.int16))
            print(cat, age, wt, 'height', round(P[used, 1].max(), 1))
        for sz, bi in sizes.items():
            meta['shapes'][cat + '|' + sz] = {'i': first + bi, 'joints': joints[bi]}
    for cat, mp in LEGACY.items():
        for sz, (c2, s2) in mp.items():
            meta['shapes'][cat + '|' + sz] = meta['shapes'][c2 + '|' + s2]

    # joint stencils: each joint as an affine blend of nearby skin vertices all round it, least squares over every base shape
    stencils = {}
    P0 = samples[1][0]
    UP = P0[used]
    for j in jnames:
        c = samples[1][1][j]
        d2 = ((UP - c) ** 2).sum(1)
        near = []
        for sx in (-1, 1):  # two nearest skin vertices in each of the eight directions round the joint
            for sy in (-1, 1):
                for sz in (-1, 1):
                    ok = np.where((np.sign(UP[:, 0] - c[0] + 1e-9) == sx) & (np.sign(UP[:, 1] - c[1] + 1e-9) == sy) & (np.sign(UP[:, 2] - c[2] + 1e-9) == sz))[0]
                    near += ok[np.argsort(d2[ok])[:3]].tolist()
        near = np.array(sorted(set(near)))
        K = len(near)
        A = np.concatenate([np.stack([s[0][used][near][:, k] for s in samples]) for k in range(3)])  # (3S, K)
        b = np.concatenate([np.array([s[1][j][k] for s in samples]) for k in range(3)])
        lam = 1e-2
        A2 = np.vstack([A, lam * np.eye(K), 10 * np.ones((1, K))])
        b2 = np.concatenate([b, lam * np.ones(K) / K, [10]])
        w = np.linalg.lstsq(A2, b2, rcond=None)[0]
        err = np.abs(A @ w - b).max()
        stencils[j] = {'v': near.tolist(), 'w': np.round(w, 5).tolist()}
        if err > .6:
            print('stencil', j, 'max error', round(err, 2), 'cm')
    meta['stencils'] = stencils

    # bones: names, parents and the joint cubes at each end
    meta['bones'] = [{'n': b, 'p': rig.get(b, {}).get('parent'), 'h': rig.get(b, {}).get('head', {}).get('cube_name', '')[6:], 't': rig.get(b, {}).get('tail', {}).get('cube_name', '')[6:]} for b in bones]

    # sparse measurement targets (0.01 cm units)
    locs, lbytes = {}, []
    off = 0
    for key, name in LOCAL.items():
        for sgn in ('incr', 'decr'):
            t = read_target(D, name + '-' + sgn)
            if not t:
                continue
            idx, dd = [], []
            for i, x, y, z in t:
                if remap[i] >= 0:
                    idx.append(remap[i])
                    dd.append([x * 1000, y * 1000, z * 1000])  # dm -> 0.01 cm
            idx = np.array(idx, np.uint16)
            dd = np.clip(np.round(np.array(dd)), -32767, 32767).astype(np.int16)
            locs[key + ':' + sgn] = {'o': off, 'c': int(len(idx))}
            lbytes.append(idx.tobytes())
            lbytes.append(b'\0\0' if len(idx) % 2 else b'')
            lbytes.append(dd.tobytes())
            off += len(idx) * 2 + (2 if len(idx) % 2 else 0) + dd.nbytes
    meta['local'] = locs

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'avatars.bin'), 'wb') as f:
        f.write(np.array(tri, np.uint16).tobytes())
        f.write(partU8.tobytes())
        f.write(sb.tobytes())
        f.write(sw.tobytes())
        for s in shapes:
            f.write(s.tobytes())
        for bb in lbytes:
            f.write(bb)
    T = len(tri) * 2
    shape0 = T + n * 4 + n * 8
    meta['layout'] = {'tri': [0, T], 'part': [T, n * 4], 'skin': [T + n * 4, n * 8], 'shape0': shape0, 'shapeBytes': n * 6, 'local0': shape0 + len(shapes) * n * 6}
    json.dump(meta, open(os.path.join(OUT, 'avatars.json'), 'w'), separators=(',', ':'))
    print('wrote', os.path.getsize(os.path.join(OUT, 'avatars.bin')) // 1024, 'KB,', len(shapes), 'shapes,', len(locs), 'targets,', len(jnames), 'joints')


if __name__ == '__main__':
    main(sys.argv[1])
