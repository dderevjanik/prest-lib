const path = require('path');
const glob = require("glob");
const { CheckerPlugin } = require("awesome-typescript-loader");

const entries = {
    ...glob.sync('./src/*.ts')
        .reduce(
            (entries, entry) =>
                Object.assign(entries,
                    { [entry.replace('./src/', '').replace('.ts', '')]: entry }),
            {}),
    ...glob.sync('./demo/*.ts')
        .reduce(
            (entries, entry) =>
                Object.assign(entries,
                    { [entry.replace('./demo/', '').replace('.ts', '')]: entry }),
            {})
};
console.log("entries:", entries);

module.exports = {
    mode: "development",
    devtool: "cheap-source-map",
    entry: entries,
    devServer: {
        contentBase: path.join(__dirname, "build"),
        port: 9009
    },
    output: {
        filename: '[name].js',
		path: path.resolve(__dirname, 'build')
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
};
