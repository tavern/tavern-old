import React, { useReducer, type ReactNode, useEffect } from 'react'
import { Box, measureElement, useInput, type DOMElement, type BoxProps } from 'ink'

type State = {
  height: number
  innerHeight: number
  scrollTop: number
}

const actions = {
  scrollDown: () => ({ type: 'SCROLL_DOWN' }) as const,
  scrollUp: () => ({ type: 'SCROLL_UP' }) as const,
  setInnerHeight: (innerHeight: number) => ({ type: 'SET_INNER_HEIGHT', innerHeight }) as const,
} as const
type Action = ReturnType<(typeof actions)[keyof typeof actions]>

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SET_INNER_HEIGHT':
      return {
        ...state,
        innerHeight: action.innerHeight,
      }

    case 'SCROLL_DOWN':
      return {
        ...state,
        scrollTop: Math.min(state.innerHeight - state.height, state.scrollTop + 1),
      }

    case 'SCROLL_UP':
      return {
        ...state,
        scrollTop: Math.max(0, state.scrollTop - 1),
      }

    default:
      return state
  }
}

export function ScrollArea({ height, children }: { children: ReactNode; height: number } & BoxProps) {
  const [state, dispatch] = useReducer(reducer, {
    height,
    scrollTop: 0,
    innerHeight: 0,
  })

  const innerRef = React.useRef<DOMElement>(null)

  useEffect(() => {
    const dimensions = measureElement(innerRef.current!)

    dispatch({
      type: 'SET_INNER_HEIGHT',
      innerHeight: dimensions.height,
    })
  }, [])

  useInput((_input, key) => {
    if (key.downArrow) {
      dispatch({
        type: 'SCROLL_DOWN',
      })
    }

    if (key.upArrow) {
      dispatch({
        type: 'SCROLL_UP',
      })
    }
  })

  return (
    <Box height={height} flexDirection="column" overflow="hidden">
      <Box ref={innerRef} flexShrink={0} flexDirection="column" marginTop={-state.scrollTop}>
        {children}
      </Box>
    </Box>
  )
}
