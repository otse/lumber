import aabb2 from "./aabb2";

export interface Pt { x: number; y: number };

class pts {
	static pt(a: vec2): Pt {
		return { x: a[0], y: a[1] };
	}

	static clone(zx: vec2): vec2 {
		return [zx[0], zx[1]];
	}

	static make(n: number, m: number): vec2 {
		return [n, m];
	}

	static area_every(bb: aabb2, callback: (pos: vec2) => any) {
		let y = bb.min[1];
		for (; y <= bb.max[1]; y++) {
			let x = bb.max[0];
			for (; x >= bb.min[0]; x--) {
				callback([x, y]);
			}
		}
	}

	static project(a: vec2): vec2 {
		return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
	}

	static unproject(a: vec2): vec2 {
		return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
	}

	static to_string(a: vec2 | vec3 | vec4) {
		const pr = (b) => b != undefined ? `, ${b}` : '';

		return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
	}

	static equals(a: vec2, b: vec2): boolean {
		return a[0] == b[0] && a[1] == b[1];
	}

	static floor(a: vec2): vec2 {
		return [Math.floor(a[0]), Math.floor(a[1])];
	}

	static ceil(a: vec2): vec2 {
		return [Math.ceil(a[0]), Math.ceil(a[1])];
	}

	static inv(a: vec2): vec2 {
		return [-a[0], -a[1]];
	}

	static mult(a: vec2, n: number, m?: number): vec2 {
		return [a[0] * n, a[1] * (m || n)];
	}

	static divide(a: vec2, n: number, m?: number): vec2 {
		return [a[0] / n, a[1] / (m || n)];
	}

	static subtract(a: vec2, b: vec2): vec2 {
		return [a[0] - b[0], a[1] - b[1]];
	}

	static add(a: vec2, b: vec2): vec2 {
		return [a[0] + b[0], a[1] + b[1]];
	}

	static abs(a: vec2): vec2 {
		return [Math.abs(a[0]), Math.abs(a[1])];
	}

	static min(a: vec2, b: vec2): vec2 {
		return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
	}

	static max(a: vec2, b: vec2): vec2 {
		return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
	}

	static together(zx: vec2): number {
		return zx[0] + zx[1];
	}

}

export default pts;