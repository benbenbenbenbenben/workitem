module.exports = function(wallaby) {
    return {
      files: [
        'src/**/*.ts',
      ],
      tests: [
        'spec/**/*.spec.ts'
      ],
      debug: true,
      compilers: {
        '**/*.ts': wallaby.compilers.typeScript()
      },
      testFramework: 'mocha',
      env: {
        type: 'node'
      }
    };
  };