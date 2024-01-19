import * as Checkbox from './park-ui/Checkbox'
import type { CheckboxProps } from './park-ui/Checkbox'

const CheckIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ItemCheckbox = (props: CheckboxProps) => (
  <Checkbox.Root {...props}>
    {(state) => (
      <Checkbox.Control>
        {state.isChecked && <CheckIcon />}
      </Checkbox.Control>
    )}
  </Checkbox.Root>
)

export default ItemCheckbox
