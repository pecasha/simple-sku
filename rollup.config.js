import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "build/index.umd.js",
                name: "Sku",
                format: "umd"
            },
            {
                file: "build/index.cjs",
                format: "cjs"
            },
            {
                file: "build/index.mjs",
                format: "esm"
            }
        ],
        plugins: [
            typescript({
                cacheRoot: "./node_modules/.cache/rollup-plugin-typescript2"
            }),
            resolve(),
            commonjs(),
            babel({
                babelHelpers: "runtime",
                exclude: "node_modules/**",
                extensions: [".ts"],
                presets: [["@babel/preset-env", {
                    loose: false,
                    modules: false,
                    targets: {
                        chrome: 60
                    }
                }]],
                plugins: [
                    "@babel/plugin-transform-runtime"
                ]
            }),
            terser()
        ]
    }
];
