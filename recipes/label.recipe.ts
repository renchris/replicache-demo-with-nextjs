import { defineRecipe } from '@pandacss/dev'

const label = defineRecipe({
  className: 'label',
  base: {
    color: 'fg.default',
    fontWeight: 'medium',
  },
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: {
        textStyle: 'sm',
      },
      md: {
        textStyle: 'sm',
      },
      lg: {
        textStyle: 'sm',
      },
      xl: {
        textStyle: 'md',
      },
    },
  },
})

export default label
