import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/overwatch.ts',
  external: ['socket.io-client'],
  output: {
    file: 'dist/overwatch.js',
    format: 'cjs',
    exports: 'default'
  },
  plugins: [typescript({ noEmitOnError: true })]
};
