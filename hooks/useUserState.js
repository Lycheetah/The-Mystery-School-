import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KEYS, DEFAULT_USER_STATE } from '../data/schema'

let _state = null
let _listeners = []

function notify() {
  _listeners.forEach(fn => fn(_state))
}

export function useUserState() {
  const [state, setState] = useState(_state)
  const [loaded, setLoaded] = useState(_state !== null)

  useEffect(() => {
    _listeners.push(setState)
    return () => { _listeners = _listeners.filter(fn => fn !== setState) }
  }, [])

  useEffect(() => {
    if (_state !== null) { setLoaded(true); return }

    AsyncStorage.getItem(KEYS.USER_STATE).then(raw => {
      _state = raw ? { ...DEFAULT_USER_STATE, ...JSON.parse(raw) } : { ...DEFAULT_USER_STATE }
      setState(_state)
      setLoaded(true)
    }).catch(() => {
      _state = { ...DEFAULT_USER_STATE }
      setState(_state)
      setLoaded(true)
    })
  }, [])

  const update = useCallback(async (patch) => {
    _state = { ..._state, ...patch }
    notify()
    await AsyncStorage.setItem(KEYS.USER_STATE, JSON.stringify(_state))
  }, [])

  return { state: state || DEFAULT_USER_STATE, update, loaded }
}

export async function getUserState() {
  if (_state) return _state
  const raw = await AsyncStorage.getItem(KEYS.USER_STATE)
  return raw ? { ...DEFAULT_USER_STATE, ...JSON.parse(raw) } : { ...DEFAULT_USER_STATE }
}
