module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  syntax: 'sass',
  rules: {
    indentation: [2, { baseIndentLevel: 1 }],
    'declaration-empty-line-before': [
      'always',
      {
        except: ['after-declaration', 'first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'declaration-colon-newline-after': 'always-multi-line',
    'declaration-colon-space-after': 'always-single-line',
    'value-keyword-case': null,
  },
};
