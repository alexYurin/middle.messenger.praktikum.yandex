import BaseComponent, {
  BaseComponentProps,
  ComponentStatusType,
} from 'components/Base/index'
import { RuleKeyType } from 'components/Form/Validation'
import templateString from 'bundle-text:./template.pug'
import './styles.scss'

export interface InputProps extends BaseComponentProps {
  status?: ComponentStatusType
  type?: string
  name?: string
  form?: string
  message?: string
  value?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  required?: boolean
  validation?: RuleKeyType
}

export default class Input extends BaseComponent<InputProps> {
  protected template = templateString
  protected targetQueryForBrowserEvents = '.input__field'
  protected disableRenderPropsList = ['status', 'value', 'message']

  constructor(
    props: InputProps = {
      name: '',
    }
  ) {
    super('input', props)
  }

  protected onUpdateProps(
    propKey: keyof InputProps,
    prevValue: unknown,
    newValue: unknown
  ): boolean {
    if (this.disableRenderPropsList.includes(propKey)) {
      switch (propKey) {
        case 'message': {
          const isDefinedValue = typeof newValue === 'string' && newValue
          const inputMessage =
            this.getDOMElement().querySelector('.input__message')

          if (isDefinedValue && inputMessage) {
            inputMessage.textContent = newValue

            break
          }

          if (isDefinedValue) {
            const message = document.createElement('p')

            message.classList.add('input__message')
            message.textContent = newValue

            this.getDOMElement()?.appendChild(message)

            break
          }

          inputMessage?.remove()

          break
        }

        case 'status': {
          const input = this.getDOMElement()

          input.classList.remove(`input_${prevValue}`)

          if (typeof newValue === 'string' && newValue) {
            const value = `input_${newValue}`

            input.classList.add(value)
          }

          break
        }

        case 'value': {
          if (typeof newValue === 'string') {
            this.getEventTarget<HTMLInputElement>().value = newValue
          }

          break
        }

        default:
          break
      }

      return false
    }

    return prevValue !== newValue
  }
}
