import {isValidElement, useState} from 'react'
import {isValidElementType} from 'react-is'
import {useI18nText} from 'sanity'

import {Pane} from '../../components'
import {type StructureToolPaneActionHandler} from '../../types'
import {type BaseStructureToolPaneProps} from '../types'
import {UserComponentPaneContent} from './UserComponentPaneContent'
import {UserComponentPaneHeader} from './UserComponentPaneHeader'

type UserComponentPaneProps = BaseStructureToolPaneProps<'component'>

/**
 * @internal
 */
export function UserComponentPane(props: UserComponentPaneProps) {
  const {index, pane, paneKey, ...restProps} = props
  const {
    child,
    component: UserComponent,
    menuItems,
    menuItemGroups,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: _unused,
    ...restPane
  } = pane
  const [ref, setRef] = useState<{
    actionHandlers?: Record<string, StructureToolPaneActionHandler>
  } | null>(null)
  const {title = ''} = useI18nText(pane)

  return (
    <Pane id={paneKey} minWidth={320} selected={restProps.isSelected}>
      <UserComponentPaneHeader
        actionHandlers={ref?.actionHandlers}
        index={index}
        menuItems={menuItems}
        menuItemGroups={menuItemGroups}
        title={title}
      />

      <UserComponentPaneContent>
        {isValidElementType(UserComponent) && (
          <UserComponent
            {...restProps}
            {...restPane}
            // NOTE: here we're utilizing the function form of refs so setting
            // the ref causes a re-render for `UserComponentPaneHeader`
            ref={setRef as any}
            // @ts-expect-error - @TODO Fix typings
            child={child}
            paneKey={paneKey}
          />
        )}
        {isValidElement(UserComponent) && UserComponent}
      </UserComponentPaneContent>
    </Pane>
  )
}
