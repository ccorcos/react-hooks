import React from "react"
import { useState } from "./hooks"

// A component described with pure functions in the style of Elm (or Redux).
type Component<S, A> = {
	init: () => S
	reducer: (s: S, a: A) => S
	render: (props: { state: S; dispatch: (action: A) => void }) => JSX.Element
}

type CounterState = { count: number }

type CounterAction = { type: "increment" } | { type: "decrement" }

function CounterReducer(
	state: CounterState,
	action: CounterAction
): CounterState {
	switch (action.type) {
		case "increment":
			return {
				count: state.count + 1,
			}
		case "decrement":
			return {
				count: state.count - 1,
			}
	}
}

function Counter(props: {
	state: CounterState
	dispatch: (action: CounterAction) => void
}) {
	const { state, dispatch } = props
	return (
		<div>
			<button onClick={() => dispatch({ type: "decrement" })}>{"-"}</button>
			<span>{state.count}</span>
			<button onClick={() => dispatch({ type: "increment" })}>{"+"}</button>
		</div>
	)
}

const CounterComponent: Component<CounterState, CounterAction> = {
	init: () => ({ count: 0 }),
	reducer: CounterReducer,
	render: Counter,
}

// This component bootstraps a component with useState.
function Start(props: { component: Component<any, any> }) {
	const [state, setState] = useState(props.component.init())
	return (
		<props.component.render
			state={state}
			dispatch={action => setState(props.component.reducer(state, action))}
		/>
	)
}

function App() {
	return <Start component={CounterComponent} />
}

export default App
