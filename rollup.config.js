import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

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
            resolve(),
            typescript(),
            commonjs(),
            terser()
        ]
    }
];
