const path = require('path');
const glob = require("glob");

const entries = glob.sync('./src/**/*.ts')
        .reduce(
            (entries, entry) =>
                Object.assign(entries,
                    { [entry.replace('./src/', '').replace('.ts', '')]: entry }),
            {})
console.log("entries:", entries);

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    // entry: {
    //     index: "./src/main/index.ts"
    // },
    entry: entries,
    output: {
        // filename: '[name].[chunkhash].js',
        filename: '[name].js',
		path: path.resolve(__dirname, 'build')
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" }
            // { include: [path.resolve(__dirname, 'src/main')] }
        ]
    }
};
