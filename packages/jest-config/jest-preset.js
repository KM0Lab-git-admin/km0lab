/** @type {import('jest').Config} */
const preset = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': require.resolve('./mocks/style-mock.js'),
  },
  setupFilesAfterEach: [],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/.expo/'],
  transformIgnorePatterns: [
    '/node_modules/(?!.*(@km0lab|nanoid|uuid)).+\\.(js|jsx|ts|tsx)$',
  ],
}

module.exports = preset
