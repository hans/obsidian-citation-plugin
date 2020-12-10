import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian', 'path', 'events', 'fs', 'util', 'os', 'stream'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs({
      // Don't extract require('fsevents'), since this will fail on non-OSX
      ignore: ["fsevents"]
    }),
    json(),
  ]
};
