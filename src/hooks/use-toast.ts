import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 4000

type ToastVariant = "default" | "destructive"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  open: boolean
}

type Action =
  | { type: "ADD_TOAST"; toast: Omit<Toast, "id" | "open"> }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "REMOVE_TOAST"; id: string }

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type State = { toasts: Toast[] }

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((l) => l(memoryState))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        toasts: [
          { ...action.toast, id: genId(), open: true },
          ...state.toasts,
        ].slice(0, TOAST_LIMIT),
      }
    case "DISMISS_TOAST":
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, open: false } : t
        ),
      }
    case "REMOVE_TOAST":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) }
  }
}

export function toast(props: Omit<Toast, "id" | "open">) {
  dispatch({ type: "ADD_TOAST", toast: props })
  const id = (count).toString()
  setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), TOAST_REMOVE_DELAY)
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS_TOAST", id }),
  }
}
