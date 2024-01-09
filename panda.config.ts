// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@pandacss/dev'
import table from 'recipes/table.recipe'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: ['@pandacss/preset-base', '@park-ui/panda-preset'],

  // Where to look for your css declarations
  include: [
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/app/**/*.{ts,tsx,js,jsx}',
  ],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      slotRecipes: {
        table,
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  /**
   * Outputs base JSX component library
   * https://panda-css.com/docs/concepts/style-props#jsx-patterns
   * https://panda-css.com/docs/concepts/patterns
   *  */
  jsxFramework: 'react',

})
