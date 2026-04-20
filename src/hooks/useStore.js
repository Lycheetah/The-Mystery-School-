import { useState, useEffect, useCallback } from 'react'
import { KEYS, DEFAULT_USER_STATE } from '../../data/schema'

let _state = null
let _listeners = []

function notify() {
  _listeners.forEach(fn => fn({ ..._state }))
}

export function useStore() {
  const [state, setState] = useState(_state)
  const [loaded, setLoaded] = useState(_state !== null)

  useEffect(() => {
    _listeners.push(setState)
    return () => { _listeners = _listeners.filter(fn => fn !== setState) }
  }, [])

  useEffect(() => {
    if (_state !== null) { setLoaded(true); return }

    window.store.get(KEYS.USER_STATE).then(saved => {
      _state = saved ? { ...DEFAULT_USER_STATE, ...saved } : { ...DEFAULT_USER_STATE }
      setState({ ..._state })
      setLoaded(true)
    }).catch(() => {
      _state = { ...DEFAULT_USER_STATE }
      setState({ ..._state })
      setLoaded(true)
    })
  }, [])

  const update = useCallback(async (patch) => {
    _state = { ..._state, ...patch }
    notify()
    await window.store.set(KEYS.USER_STATE, _state)
  }, [])

  return { state: state || DEFAULT_USER_STATE, update, loaded }
}

export async function getStoreValue(key) {
  return window.store.get(key)
}

export async function setStoreValue(key, value) {
  return window.store.set(key, value)
}

export async function deleteStoreValue(key) {
  return window.store.delete(key)
}

export async function clearStore() {
  _state = null
  _listeners = []
  return window.store.clear()
}
