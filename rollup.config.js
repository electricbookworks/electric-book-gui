import typescript from 'rollup-plugin-typescript';

export default {
	input: 'src/ts/EBW.ts',
	output: {
		file: 'public/js/ts.js',
		format: 'iife',
		globals: {
			'tslib':'tslib',
			'TSFoundation':'TSFoundation'
		},
		name: "EBW",
		sourceMap: true
	},
	external: ['tslib','TSFoundation'],
	plugins: [
		typescript({
			typescript: require('./node_modules/typescript'),
			noImplicitAny: true,
			noEmitHelpers: false,
			importHelpers: true,
			target: "es5",
			lib: ["esnext"],
			"types": ["core-js","codemirror"],
			paths: {
				"tslib": ["public/bower_components/tslib/tslib.d.ts"]
			}
		})
	]
}