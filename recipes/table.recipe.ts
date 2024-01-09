import { defineSlotRecipe } from '@pandacss/dev'

const table = defineSlotRecipe({
  className: 'table',
  jsx: ['ItemTable'],
  slots: ['header'],
  variants: {
    size: {
      md: {
        header: {
          px: '4',
        },
      },
    },
  },
})

export default table
