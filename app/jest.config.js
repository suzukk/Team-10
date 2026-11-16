/** @type {import('jest').Config} */
export default {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '\\.spec\\.ts$',
  // Апп нь ESM тул тестийг ч ESM-ээр ажиллуулна.
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Эх кодод "./x.js" гэж импортолдог; тестийн үед "./x.ts"-ийг олно.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: { syntax: 'typescript', decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
        },
        module: { type: 'es6' },
      },
    ],
  },
};
