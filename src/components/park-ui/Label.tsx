import { ark } from '@ark-ui/react/factory'
import type { ComponentProps } from 'react'
import { styled } from 'styled-system/jsx'
import { label } from '@styled-system/recipes/label'

export const Label = styled(ark.label, label)
export interface LabelProps extends ComponentProps<typeof Label> {}
