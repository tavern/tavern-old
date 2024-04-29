#! /usr/bin/env bun

import { useState, useEffect } from 'react'
import { Text, render, useApp, useInput, useStdin, type Key, Box } from 'ink'
import termSize from 'term-size'
import { ScrollArea } from './components/ScrollArea'
// import tmdbLogo from './assets/tmdb.png' with { type: 'file' }

const { columns: cols, rows } = termSize()

const App = () => {
  const { exit } = useApp()
  const { setRawMode, isRawModeSupported, stdin } = useStdin()

  stdin.on('data', data => {})

  useEffect(() => {
    setRawMode(isRawModeSupported)

    return () => {
      setRawMode(false)
    }
  })

  useInput((input, key) => {
    if (input === 'q') {
      exit()
      process.nextTick(() => {
        process.exit(0)
      })
    }
  })

  return (
    <>
      <ScrollArea alignItems="center" justifyContent="center" borderColor="magenta" height={rows}>
        <Text>{`Columns: ${cols}, Rows: ${rows}`}</Text>
        {Array.from({ length: 20 })
          .fill(true)
          .map((_, index) => (
            <Box key={index} borderStyle="single">
              <Text>Item #{index + 1}</Text>
            </Box>
          ))}
      </ScrollArea>
    </>
  )
}

const { clear, waitUntilExit } = render(<App />)
clear()
await waitUntilExit()
