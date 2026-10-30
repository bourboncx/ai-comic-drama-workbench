import { useEffect, useState } from 'react'

export function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => localStorage.setItem(key, JSON.stringify(value)), 120)
    return () => clearTimeout(timer)
  }, [key, value])

  return [value, setValue]
}
