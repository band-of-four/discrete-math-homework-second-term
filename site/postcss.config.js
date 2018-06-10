const production = process.env.NODE_ENV === 'production';

module.exports = {
  map: !production,
  plugins: {
    'postcss-import': {
      onImport(sources) { global.watchCSS(sources, this.from); }
    },

    'postcss-cssnext': {
    },

    'cssnano': production && {
      preset: ['default', {
        discardComments: { removeAll: true }
      }]
    }
  }
}
