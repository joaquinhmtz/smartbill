module.exports = {
  packagerConfig: {
    icon: './src/assets/icons/app-icon',
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'my-electron-app',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
};
