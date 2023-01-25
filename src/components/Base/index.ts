import Templator from 'templators/index'
import { EventBus } from 'services/index'
import { identity } from 'utils/index'
import { v4 as makeUUID } from 'uuid'

export type ComponentStatusType = 'primary' | 'success' | 'warning' | 'alert'

export type EventComponentType =
  | '@event-component:MOUNT'
  | '@event-component:RENDER'
  | '@event-component:UPDATE'
  | '@event-component:UNMOUNT'

export type ComponentListenerPropType = {
  eventType: Event['type']
  callback: (event: Event) => void
}

export interface BaseComponentOptions {
  withId?: boolean
  listeners?: ComponentListenerPropType[]
  onMount?: <T>(...args: T[]) => void
  onRender?: <T>(...args: T[]) => void
  onUpdate?: <T>(...args: T[]) => void
  onUnmount?: <T>(...args: T[]) => void
}

export interface BaseComponentProps {
  status?: ComponentStatusType
  id?: string
  className?: string
  children?: BaseComponent<BaseComponentProps>[] | string[]
}

export const componentAttributeNameId = 'data-component-id'

export default abstract class BaseComponent<
  TPropsType extends BaseComponentProps
> {
  protected abstract template: string

  private id = ''
  private eventEmitter = new EventBus<EventComponentType>()
  private unsubscribes: ComponentListenerPropType[] = []

  public isMount = false

  constructor(
    protected name: string | null = null,
    protected props: TPropsType = {} as TPropsType,
    protected options: BaseComponentOptions = {}
  ) {
    this.options = { withId: true, ...options }

    if (typeof name === 'string') {
      this.eventEmitter.on(
        '@event-component:MOUNT',
        this.options.onMount || identity
      )
      this.eventEmitter.on(
        '@event-component:RENDER',
        this.options.onRender || identity
      )
      this.eventEmitter.on(
        '@event-component:UPDATE',
        this.options.onUpdate || identity
      )
      this.eventEmitter.on(
        '@event-component:UNMOUNT',
        this.options.onUnmount || identity
      )

      this.unsubscribes = this.addListeners()

      return this
    } else {
      throw new Error(`Invalid component name: ${this.name}`)
    }
  }

  protected componentMount<T>(...args: T[]) {
    this.isMount = true

    console.log('children', this.props.children)

    this.eventEmitter.emit('@event-component:MOUNT', ...args)
  }

  protected componentRender<T>(...args: T[]) {
    this.eventEmitter.emit('@event-component:RENDER', ...args)
  }

  protected componentUpdate<T>(...args: T[]) {
    this.eventEmitter.emit('@event-component:UPDATE', ...args)
  }

  protected componentUnmount<T>(...args: T[]) {
    this.eventEmitter.emit('@event-component:UNMOUNT', ...args)

    this.eventEmitter.off(
      '@event-component:MOUNT',
      this.options.onMount || identity
    )
    this.eventEmitter.off(
      '@event-component:RENDER',
      this.options.onRender || identity
    )
    this.eventEmitter.off(
      '@event-component:UPDATE',
      this.options.onUpdate || identity
    )
    this.eventEmitter.off(
      '@event-component:UNMOUNT',
      this.options.onUnmount || identity
    )

    this.removeListeners()
  }

  private addListeners() {
    const { listeners } = this.options

    if (listeners?.length) {
      return listeners.map((listener) => {
        const subscribe = (event: Event) => {
          if (
            typeof listener.callback === 'function' &&
            this.isCurrentElement(event.target as HTMLElement)
          ) {
            listener.callback(event)
          }
        }

        window.addEventListener(listener.eventType, subscribe)

        return {
          eventType: listener.eventType,
          callback: subscribe,
        }
      }, [])
    }

    return []
  }

  private removeListeners() {
    this.unsubscribes.forEach((unsubscribe) => {
      window.removeEventListener(unsubscribe.eventType, unsubscribe.callback)
    })
  }

  public prepareProps(props: TPropsType): TPropsType {
    return props
  }

  public create(props: TPropsType = {} as TPropsType): string {
    this.props = { ...this.props, ...props }

    if (Templator) {
      const preparedProps = this.prepareProps
        ? this.prepareProps(this.props)
        : this.props

      if (this.options.withId) {
        this.id = `_id_${makeUUID()}`
      }

      const elementTempContainer = document.createElement('div')
      elementTempContainer.innerHTML = Templator.compile(
        this.template,
        preparedProps
      )

      const element = elementTempContainer.firstElementChild
      element?.setAttribute(componentAttributeNameId, this.id)

      this.componentMount(element)

      return elementTempContainer.innerHTML
    }

    return ''
  }

  public isCurrentElement(element: HTMLElement) {
    return this.id === element.getAttribute(componentAttributeNameId)
  }

  public getProps() {
    return this.props
  }

  public updateProps(props: TPropsType) {
    this.props = props
  }

  public getDOMRef() {
    if (this.id) {
      return document.querySelector(`[${componentAttributeNameId}=${this.id}]`)
    } else {
      throw new Error('Can`t get component before create and paste in DOM')
    }
  }
}
