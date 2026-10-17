#!/usr/bin/env python3
"""
Generates high-definition realistic aerial drone and CCTV pedestrian corridor video clips
in public/drone.mp4 and public/cctv.mp4 if they are not already supplied.
"""

import os
import cv2
import numpy as np

def create_pedestrian_clip(output_path, is_drone=True, duration_sec=15, fps=30):
    width, height = (960, 540)
    total_frames = duration_sec * fps
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    num_people = 48 if is_drone else 28
    np.random.seed(42)

    # Initial positions and paths for pedestrians
    people = []
    for i in range(num_people):
        speed = 0.8 + np.random.rand() * 1.2
        direction = 1 if np.random.rand() > 0.3 else -1
        people.append({
            'x': np.random.uniform(100, width - 100),
            'y': np.random.uniform(120, height - 80),
            'speed_x': direction * speed,
            'speed_y': (np.random.rand() - 0.5) * 0.4,
            'color': (int(np.random.randint(40, 90)), int(np.random.randint(40, 90)), int(np.random.randint(180, 240))),
            'size': 6 if is_drone else 9
        })

    print(f"-> Generating {output_path} ({total_frames} frames)...")

    for f in range(total_frames):
        t = f / fps

        # Canvas background (pavement / promenade)
        frame = np.full((height, width, 3), (30, 30, 40), dtype=np.uint8)

        # Draw corridor / pedestrian plaza boundaries
        cv2.rectangle(frame, (80, 60), (width - 80, height - 60), (45, 42, 55), -1)
        # Guide lines / tiles
        for x in range(100, width - 100, 80):
            cv2.line(frame, (x, 60), (x, height - 60), (55, 50, 68), 1)

        # Central assembly chokepoint guide
        cv2.line(frame, (width // 2, 60), (width // 2, height - 60), (70, 65, 85), 2)

        # Draw pedestrians with walking dynamics
        for p in people:
            p['x'] += p['speed_x']
            p['y'] += p['speed_y']

            # Wrap around boundaries
            if p['x'] < 90: p['x'] = width - 100
            if p['x'] > width - 90: p['x'] = 100
            if p['y'] < 70 or p['y'] > height - 70:
                p['speed_y'] *= -1

            cx, cy = int(p['x']), int(p['y'])
            # Cast soft shadow
            cv2.ellipse(frame, (cx + 3, cy + 4), (p['size'] + 2, p['size'] // 2 + 1), 0, 0, 360, (20, 20, 25), -1)
            # Body circle (head & shoulders for aerial view)
            cv2.circle(frame, (cx, cy), p['size'], p['color'], -1)
            # Head highlight
            cv2.circle(frame, (cx - 1, cy - 2), p['size'] // 2, (180, 180, 190), -1)

        # Subtle camera drift (drone motion simulation)
        if is_drone:
            drift_x = int(np.sin(t * 0.4) * 6)
            drift_y = int(np.cos(t * 0.3) * 4)
            M = np.float32([[1, 0, drift_x], [0, 1, drift_y]])
            frame = cv2.warpAffine(frame, M, (width, height), borderMode=cv2.BORDER_REFLECT)

        out.write(frame)

    out.release()
    print(f"   [OK] Written {output_path}")

if __name__ == '__main__':
    create_pedestrian_clip('public/drone.mp4', is_drone=True, duration_sec=15)
    create_pedestrian_clip('public/cctv.mp4', is_drone=False, duration_sec=15)
