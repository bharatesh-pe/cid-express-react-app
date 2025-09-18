module.exports = {
  files: ['**/*.js', '**/*.jsx'],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
      global: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly'
    }
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  },
  ignores: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    '*.min.js'
  ]
};


