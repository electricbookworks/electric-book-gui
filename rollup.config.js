import typescript from 'rollup-plugin-typescript';

export default {
	entry: 'src/ts/EBW.ts',
	format: 'iife',
	moduleName: 'EBW',
	dest: 'public/js/ts.js',
	sourceMap: true,
	external: ['tslib','TSFoundation'],
	globals: {
		'tslib':'tslib',
		'TSFoundation':'TSFoundation'
	},
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