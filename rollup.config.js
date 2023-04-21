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
                file: "build/simple-sku.js",
                format: "cjs"
            },
            {
                file: "build/simple-sku.cjs",
                format: "cjs"
            },
            {
                file: "build/simple-sku.mjs",
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
                presets: ["@babel/preset-env"],
                plugins: ["@babel/plugin-transform-runtime"]
            }),
            terser()
        ]
    }
];
