declare type vec4 = [number, number, number, number];
declare type vec3 = [number, number, number];
declare type vec2 = [number, number];

declare interface Point {
	x: number
	y: number
}

declare interface Asset {
	readonly img: string
	readonly size: vec2
	readonly area?: vec2
	readonly offset?: vec2
}