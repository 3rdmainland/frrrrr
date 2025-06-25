export const canvasTheme = (themeChoice: 'mint' | 'white' | 'black' = 'white') => ({
  backgrounds: {
    default: themeChoice,
    values: [
      { name: 'mint', value: '#d7faf3' }, // Adjust the shade of blue as needed
      { name: 'white', value: '#ffffff' },
      { name: 'black', value: '#000000' },
      { name: 'red', value: '#a55a5a' },
    ],
  },
})
