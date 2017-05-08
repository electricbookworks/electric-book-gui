import typescript from 'rollup-plugin-typescript';

export default {
	entry: 'src/ts/EBW.ts',
	format: 'iife',
	moduleName: 'EBW',
	dest: 'public/js/ts.js',
	sourceMap: true,
	external: ['tslib'],
	globals: {
		'tslib':'tslib'
	},
	plugins: [
		typescript({
			typescript: require('./node_modules/typescript'),
			noImplicitAny: true,
			noEmitHelpers: false,
			importHelpers: true,
			target: "es5",
			lib: ["esnext"],
			"types": ["core-js"],
			paths: {
				"tslib": ["public/bower_components/tslib/tslib.d.ts"]
			}
		})
	]
}