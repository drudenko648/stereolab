import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { useStore } from '../src/state/useStore'

// Unmount React trees and reset the global zustand store between tests so each
// component/store test starts from a clean, deterministic state.
afterEach(() => {
  cleanup()
  useStore.setState(useStore.getInitialState(), true)
})
