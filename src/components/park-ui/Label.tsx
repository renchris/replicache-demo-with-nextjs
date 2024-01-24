import { ark } from '@ark-ui/react/factory'
import type { ComponentProps } from 'react'
import { styled } from 'styled-system/jsx'
import { formLabel } from '@styled-system/recipes'

export const Label = styled(ark.label, formLabel)
export interface LabelProps extends ComponentProps<typeof Label> {}
