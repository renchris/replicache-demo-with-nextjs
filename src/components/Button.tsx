import { ark } from '@ark-ui/react'
import { styled } from 'styled-system/jsx'
import { button } from 'styled-system/recipes'

export type ButtonProps = typeof Button
export const Button = styled(ark.button, button)
export const ExitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
