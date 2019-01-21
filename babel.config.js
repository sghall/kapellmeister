module.exports = {
  env: {
    esm: {
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
      plugins: [
        '@babel/plugin-transform-typescript',
        '@babel/plugin-proposal-class-properties'
      ],
    },
    cjs: {
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
          },
        ],
      ],
      plugins: [
        '@babel/plugin-transform-typescript',
        '@babel/plugin-proposal-class-properties'
      ],
    },
    test: {
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
          },
        ],
      ],
      plugins: [
        '@babel/plugin-transform-typescript',
        '@babel/plugin-proposal-class-properties'
      ],
    },
    coverage: {
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
          },
        ],
      ],
      plugins: [
        '@babel/plugin-transform-typescript',
        '@babel/plugin-proposal-class-properties',
        'babel-plugin-istanbul',
      ],
    },
  },
}
