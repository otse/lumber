const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'js/App.js',
	output: {
		name: 'lumber',
		file: 'bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: false,
		globals: { THREE: 'THREE' }
	}
};