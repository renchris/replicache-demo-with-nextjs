// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@pandacss/dev'
import button from 'recipes/button.recipe'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: ['@pandacss/preset-base', '@park-ui/panda-preset'],

  // Where to look for your css declarations
  include: ['./src/components/**/*.{ts,tsx,js,jsx}', './src/app/**/*.{ts,tsx,js,jsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      recipes: {
        button,
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
