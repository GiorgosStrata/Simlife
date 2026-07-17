#!/usr/bin/env python3
"""
Synthesize Simlife's sound effects as small 16-bit mono WAV files.

Pure standard-library (wave/struct/math) — no numpy/ffmpeg needed. Run:

    python3 scripts/gen_sfx.py

Writes every effect into assets/sfx/. Tones use soft attacks and short
fades so nothing clicks, and everything is tuned to be pleasant and
game-y (BitLife style) rather than harsh. Add a new sound by writing a
build_<name>() that returns a sample list and listing it in SOUNDS.
"""

import math
import os
import struct
import wave

SR = 44100

# Equal-temperament note frequencies (Hz).
N = {
    'C3': 130.81, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
    'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
    'A5': 880.00, 'B5': 987.77,
    'C6': 1046.5, 'D6': 1174.7, 'E6': 1318.5, 'G6': 1568.0,
}


def _wave(shape, phase):
    if shape == 'sine':
        return math.sin(phase)
    if shape == 'tri':
        return (2 / math.pi) * math.asin(math.sin(phase))
    if shape == 'saw':
        x = (phase / (2 * math.pi)) % 1.0
        return 2 * x - 1
    if shape == 'square':
        return 1.0 if math.sin(phase) >= 0 else -1.0
    return math.sin(phase)


def tone(freq, dur, shape='sine', vol=1.0, a=0.008, d=0.06, s=0.6, r=0.06,
         glide_to=None, vibrato=0.0, vib_rate=6.0, harmonics=None):
    """One enveloped oscillator. harmonics: list of (mult, amp)."""
    n = int(dur * SR)
    out = [0.0] * n
    at, dc, rl = int(a * SR), int(d * SR), int(r * SR)
    sus = max(0, n - at - dc - rl)
    harmonics = harmonics or []
    phase = 0.0
    hphase = [0.0] * len(harmonics)
    for i in range(n):
        t = i / n
        f = freq if glide_to is None else freq + (glide_to - freq) * t
        vib = 1.0 + vibrato * math.sin(2 * math.pi * vib_rate * i / SR)
        phase += 2 * math.pi * f * vib / SR
        val = _wave(shape, phase)
        for k, (mult, amp) in enumerate(harmonics):
            hphase[k] += 2 * math.pi * f * mult * vib / SR
            val += amp * _wave(shape, hphase[k])
        # ADSR
        if i < at:
            env = i / at if at else 1.0
        elif i < at + dc:
            env = 1.0 - (1.0 - s) * ((i - at) / dc if dc else 1.0)
        elif i < at + dc + sus:
            env = s
        else:
            j = i - at - dc - sus
            env = s * (1.0 - (j / rl if rl else 1.0))
        out[i] = val * env * vol
    return out


def noise(dur, vol=1.0, a=0.002, d=0.08, lowpass=0.4):
    n = int(dur * SR)
    out = [0.0] * n
    seed = 12345
    prev = 0.0
    at, dc = int(a * SR), int(d * SR)
    for i in range(n):
        seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
        white = (seed / 0x3FFFFFFF) - 1.0
        prev = prev + lowpass * (white - prev)  # one-pole lowpass
        if i < at:
            env = i / at if at else 1.0
        else:
            j = i - at
            env = max(0.0, 1.0 - j / dc) if dc else 0.0
        out[i] = prev * env * vol
    return out


def mix(*segments):
    """Combine (offset_sec, samples) pairs into one buffer."""
    total = max((int(off * SR) + len(buf) for off, buf in segments), default=0)
    out = [0.0] * total
    for off, buf in segments:
        start = int(off * SR)
        for i, v in enumerate(buf):
            out[start + i] += v
    return out


def seq(notes, gap=0.0):
    """Play (offset, samples) built from a list of (start, buffer)."""
    return mix(*notes)


def bell(freq, dur, vol=0.8, r=None):
    """A soft bell: sine + gentle harmonics, long-ish release."""
    r = r if r is not None else dur * 0.7
    return tone(freq, dur, 'sine', vol=vol, a=0.004, d=dur * 0.25, s=0.35,
                r=r, harmonics=[(2.0, 0.28), (3.0, 0.12)])


# ---------------------------------------------------------------- sounds

def build_click():
    return tone(N['A5'], 0.05, 'sine', vol=0.5, a=0.003, d=0.03, s=0.0, r=0.02,
                harmonics=[(2.0, 0.2)])


def build_pop():
    # A little upward "bloop".
    return tone(400, 0.13, 'sine', vol=0.55, a=0.005, d=0.05, s=0.5, r=0.06,
                glide_to=900, harmonics=[(2.0, 0.15)])


def build_whoosh():
    # Soft airy swipe: a gently swelling, heavily-muffled puff of air plus a
    # quiet downward tone. Slow attack + heavy lowpass so it reads as a
    # "swish", never a percussive crack (which sounded like a gunshot).
    return mix(
        (0.00, noise(0.30, vol=0.42, a=0.09, d=0.22, lowpass=0.08)),
        (0.00, tone(520, 0.26, 'sine', vol=0.14, a=0.05, d=0.14, s=0.4, r=0.12,
                    glide_to=300)),
    )


def build_success():
    # Bright major arpeggio C-E-G, then G held.
    return mix(
        (0.00, bell(N['C5'], 0.18, 0.5)),
        (0.09, bell(N['E5'], 0.18, 0.5)),
        (0.18, bell(N['G5'], 0.40, 0.6)),
    )


def build_cash():
    # Coin "ching": two bright bells + a shimmer.
    return mix(
        (0.00, noise(0.02, vol=0.25, a=0.001, d=0.02, lowpass=0.8)),
        (0.00, bell(N['C6'], 0.22, 0.4)),
        (0.06, bell(N['E6'], 0.30, 0.5)),
    )


def build_levelup():
    # Rising fanfare C-E-G-C.
    return mix(
        (0.00, bell(N['C5'], 0.14, 0.45)),
        (0.08, bell(N['E5'], 0.14, 0.45)),
        (0.16, bell(N['G5'], 0.14, 0.5)),
        (0.24, bell(N['C6'], 0.40, 0.6)),
    )


def build_graduate():
    # Triumphant fanfare with a final chord + sparkle.
    chord = mix(
        (0.0, bell(N['C5'], 0.5, 0.4)),
        (0.0, bell(N['E5'], 0.5, 0.4)),
        (0.0, bell(N['G5'], 0.5, 0.45)),
    )
    return mix(
        (0.00, bell(N['G4'], 0.16, 0.45)),
        (0.10, bell(N['C5'], 0.16, 0.45)),
        (0.20, bell(N['E5'], 0.16, 0.5)),
        (0.30, bell(N['G5'], 0.20, 0.5)),
        (0.42, chord),
        (0.46, bell(N['C6'], 0.5, 0.35)),
    )


def build_match():
    # Warm two-note heart chime with a little vibrato.
    return mix(
        (0.00, tone(N['E5'], 0.35, 'sine', vol=0.45, a=0.01, d=0.1, s=0.5,
                    r=0.2, vibrato=0.01, harmonics=[(2.0, 0.2)])),
        (0.10, tone(N['B5'], 0.45, 'sine', vol=0.4, a=0.01, d=0.1, s=0.5,
                    r=0.3, vibrato=0.01, harmonics=[(2.0, 0.2)])),
    )


def build_wedding():
    # Church bells tolling twice, long decay.
    return mix(
        (0.00, bell(N['C4'], 0.7, 0.5, r=0.6)),
        (0.02, bell(N['G4'], 0.7, 0.35, r=0.6)),
        (0.45, bell(N['C4'], 0.8, 0.5, r=0.7)),
        (0.47, bell(N['G4'], 0.8, 0.35, r=0.7)),
    )


def build_baby():
    # Cute glockenspiel twinkle.
    return mix(
        (0.00, bell(N['C6'], 0.16, 0.4)),
        (0.09, bell(N['E6'], 0.16, 0.4)),
        (0.18, bell(N['G6'], 0.30, 0.45)),
    )


def build_fail():
    # Gentle descending, soft (not a buzzer).
    return mix(
        (0.00, tone(N['E5'], 0.16, 'sine', vol=0.45, a=0.006, d=0.08, s=0.4, r=0.08)),
        (0.12, tone(N['C5'], 0.16, 'sine', vol=0.45, a=0.006, d=0.08, s=0.4, r=0.08)),
        (0.24, tone(N['A4'], 0.28, 'sine', vol=0.45, a=0.006, d=0.1, s=0.3, r=0.16)),
    )


def build_hurt():
    # "Oof": downward glide + a soft thump.
    return mix(
        (0.00, noise(0.09, vol=0.4, a=0.001, d=0.08, lowpass=0.15)),
        (0.00, tone(300, 0.22, 'sine', vol=0.5, a=0.004, d=0.12, s=0.3, r=0.08,
                    glide_to=150)),
    )


def build_punch():
    # Short low thud with a noise transient.
    return mix(
        (0.00, noise(0.05, vol=0.5, a=0.0005, d=0.05, lowpass=0.2)),
        (0.00, tone(120, 0.14, 'sine', vol=0.7, a=0.002, d=0.1, s=0.0, r=0.03,
                    glide_to=70)),
    )


def build_crime():
    # Sneaky staccato low pulses.
    def pluck(f):
        return tone(f, 0.14, 'tri', vol=0.4, a=0.004, d=0.06, s=0.2, r=0.06,
                    harmonics=[(2.0, 0.1)])
    return mix(
        (0.00, pluck(N['A3'])),
        (0.14, pluck(N['F3'])),
        (0.28, pluck(N['E3'])),
    )


def build_police():
    # Two-tone siren wail.
    def wail(f1, f2, off):
        return (off, tone(f1, 0.16, 'tri', vol=0.4, a=0.01, d=0.02, s=0.9,
                          r=0.02, glide_to=f2, harmonics=[(2.0, 0.15)]))
    return mix(
        wail(N['A4'], N['E5'], 0.00),
        wail(N['E5'], N['A4'], 0.16),
        wail(N['A4'], N['E5'], 0.32),
        wail(N['E5'], N['A4'], 0.48),
    )


def build_heartbreak():
    # Sad sighing descent.
    return mix(
        (0.00, tone(N['A4'], 0.24, 'sine', vol=0.45, a=0.01, d=0.12, s=0.5, r=0.1)),
        (0.18, tone(N['F4'], 0.5, 'sine', vol=0.45, a=0.01, d=0.15, s=0.4, r=0.28,
                    glide_to=N['E4'])),
    )


def build_gym():
    # Two energetic thumps + a rising motivational blip.
    def kick():
        return tone(150, 0.12, 'sine', vol=0.7, a=0.002, d=0.1, s=0.0, r=0.02,
                    glide_to=60)
    return mix(
        (0.00, kick()),
        (0.15, kick()),
        (0.30, tone(N['C5'], 0.2, 'tri', vol=0.4, a=0.01, d=0.08, s=0.5, r=0.08,
                    glide_to=N['G5'])),
    )


def build_honk():
    # Classic two-tone car horn, long then short.
    def horn(dur):
        return mix(
            (0.0, tone(370, dur, 'saw', vol=0.28, a=0.01, d=0.02, s=0.95, r=0.03)),
            (0.0, tone(466, dur, 'saw', vol=0.28, a=0.01, d=0.02, s=0.95, r=0.03)),
        )
    return mix(
        (0.00, horn(0.28)),
        (0.36, horn(0.16)),
    )


def build_death():
    # Somber low bell toll.
    return mix(
        (0.00, bell(N['C3'], 1.1, 0.55, r=0.9)),
        (0.03, bell(N['G3'], 1.1, 0.3, r=0.9)),
    )


SOUNDS = {
    'click': build_click,
    'pop': build_pop,
    'whoosh': build_whoosh,
    'success': build_success,
    'cash': build_cash,
    'levelup': build_levelup,
    'graduate': build_graduate,
    'match': build_match,
    'wedding': build_wedding,
    'baby': build_baby,
    'fail': build_fail,
    'hurt': build_hurt,
    'punch': build_punch,
    'crime': build_crime,
    'police': build_police,
    'heartbreak': build_heartbreak,
    'gym': build_gym,
    'honk': build_honk,
    'death': build_death,
}


def normalize(buf, peak=0.85):
    m = max((abs(v) for v in buf), default=1.0) or 1.0
    g = peak / m
    return [v * g for v in buf]


def write_wav(path, buf):
    buf = normalize(buf)
    # 4ms fade in/out to guarantee no clicks at the edges.
    fade = int(0.004 * SR)
    n = len(buf)
    for i in range(min(fade, n)):
        buf[i] *= i / fade
        buf[n - 1 - i] *= i / fade
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for v in buf:
            s = int(max(-1.0, min(1.0, v)) * 32767)
            frames += struct.pack('<h', s)
        w.writeframes(bytes(frames))


def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sfx')
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    for name, build in SOUNDS.items():
        path = os.path.join(out_dir, f'{name}.wav')
        write_wav(path, build())
        print(f'wrote {name}.wav')


if __name__ == '__main__':
    main()
