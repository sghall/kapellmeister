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
        '@babel/plugin-proposal-class-properties',
        ['@babel/plugin-transform-computed-properties', { loose: true }]
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
        '@babel/plugin-proposal-class-properties',
        ['@babel/plugin-transform-computed-properties', { loose: true }]
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
        '@babel/plugin-proposal-class-properties',
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
        '@babel/plugin-proposal-class-properties',
        'babel-plugin-istanbul',
      ],
    },
  },
}
