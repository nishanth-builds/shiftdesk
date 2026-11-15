import { useEffect, useRef } from "react";

// Background: a 3D "ops network" scene drawn on a canvas.
//  - a perspective grid floor scrolling toward you
//  - floating nodes linked in 3D, with data packets travelling along the links
//  - the camera tilts with the mouse / finger; press and hold to speed up (warp)
// No libraries, just 2D canvas + a little projection maths.

const BOX = { x: 1000, y: 520, zMin: 250, zMax: 1700 };
const FLOOR_Y = 460, GRID = 220, LINK = 330;

export default function Scene() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, f = 600, nodes = [], packets = [], raf = 0, scroll = 0, speed = 1, held = false;
    const cam = { yaw: 0, pitch: 0, ty: 0, tp: 0 };
    const rnd = (a, b) => a + Math.random() * (b - a);

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight; f = Math.min(Math.max(w, 700), 1400) * 0.85;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 600 ? 42 : 68;
      nodes = Array.from({ length: n }, () => ({
        x: rnd(-BOX.x, BOX.x), y: rnd(-BOX.y, BOX.y * 0.6), z: rnd(BOX.zMin, BOX.zMax),
        vx: rnd(-0.5, 0.5), vy: rnd(-0.3, 0.3), vz: rnd(-0.5, 0.5), big: Math.random() > 0.82,
      }));
      packets = [];
    };

    // rotate around the middle of the scene, then perspective-project
    const proj = (x, y, z) => {
      const zc = z - 950, cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const x1 = x * cy + zc * sy, z1 = -x * sy + zc * cy;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp + 950;
      if (z2 < 60) return null;
      const k = f / z2;
      return { x: w / 2 + x1 * k, y: h * 0.48 + y1 * k, k, z: z2 };
    };

    const line = (a, b, alpha) => { ctx.strokeStyle = `rgba(225,29,46,${alpha})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };

    const frame = () => {
      cam.yaw += (cam.ty - cam.yaw) * 0.06; cam.pitch += (cam.tp - cam.pitch) * 0.06;
      speed += ((held ? 5 : 1) - speed) * 0.08;
      scroll = (scroll + 1.2 * speed) % GRID;
      ctx.clearRect(0, 0, w, h); ctx.lineWidth = 1;

      // floor: horizontal lines scroll toward the camera, vertical lines recede
      for (let z = 300 - scroll; z < 3400; z += GRID) {
        const a = proj(-2600, FLOOR_Y, z), b = proj(2600, FLOOR_Y, z);
        if (a && b) line(a, b, Math.max(0, 0.34 * (1 - z / 3400)));
      }
      for (let x = -2600; x <= 2600; x += GRID) {
        const a = proj(x, FLOOR_Y, 300), b = proj(x, FLOOR_Y, 3400);
        if (a && b) line(a, b, 0.2);
      }

      // move nodes
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy; p.z += p.vz - (held ? 2 : 0);
        if (p.x > BOX.x || p.x < -BOX.x) p.vx *= -1;
        if (p.y > BOX.y * 0.6 || p.y < -BOX.y) p.vy *= -1;
        if (p.z > BOX.zMax) p.vz = -Math.abs(p.vz);
        if (p.z < BOX.zMin) { p.z = BOX.zMax; }
      }
      const P = nodes.map((p) => proj(p.x, p.y, p.z));

      // links
      const links = [];
      for (let i = 0; i < nodes.length; i++) {
        if (!P[i]) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          if (!P[j]) continue;
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
          if (d < LINK) { links.push([i, j]); line(P[i], P[j], (1 - d / LINK) * 0.5 * Math.min(1, 1.4 - P[i].z / 2400)); }
        }
      }

      // data packets travelling along links
      while (packets.length < 14 && links.length) { const l = links[Math.floor(Math.random() * links.length)]; packets.push({ a: l[0], b: l[1], t: 0, s: rnd(0.006, 0.016) }); }
      packets = packets.filter((q) => {
        q.t += q.s * speed; const A = P[q.a], B = P[q.b];
        if (q.t >= 1 || !A || !B) return false;
        const x = A.x + (B.x - A.x) * q.t, y = A.y + (B.y - A.y) * q.t, k = (A.k + B.k) / 2;
        ctx.fillStyle = "rgba(255,70,80,.95)"; ctx.beginPath(); ctx.arc(x, y, Math.max(1.4, 3.2 * k * 2), 0, 6.283); ctx.fill();
        return true;
      });

      // nodes (far ones fade)
      for (let i = 0; i < nodes.length; i++) {
        const q = P[i]; if (!q) continue;
        const r = Math.max(1.2, (nodes[i].big ? 9 : 5) * q.k * 1.6), a = Math.max(0.15, 1 - q.z / 2300);
        ctx.fillStyle = nodes[i].big ? `rgba(255,45,61,${a})` : `rgba(255,130,135,${a * 0.8})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.283); ctx.fill();
        if (nodes[i].big) { ctx.strokeStyle = `rgba(255,77,90,${a * 0.5})`; ctx.beginPath(); ctx.arc(q.x, q.y, r + 5, 0, 6.283); ctx.stroke(); }
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const move = (e) => { cam.ty = ((e.clientX / w) * 2 - 1) * 0.32; cam.tp = ((e.clientY / h) * 2 - 1) * 0.18; };
    const down = (e) => { held = true; move(e); }, up = () => { held = false; };
    init(); frame();
    window.addEventListener("resize", init);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init); window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
    };
  }, []);

  return <canvas ref={ref} className="net" aria-hidden="true" />;
}
