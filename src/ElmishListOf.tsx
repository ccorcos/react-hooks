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

// This is a higher-order component that will create a list of components where you can
// add or remove any number of these components.
type ListOfState<S> = { items: Array<{ id: number; state: S }>; nextId: number }

type ListOfAction<A> =
	| { type: "insert" }
	| { type: "remove"; id: number }
	| { type: "childAction"; id: number; childAction: A }

function ListOfReducer<S, A>(child: Component<S, A>) {
	return function(
		state: ListOfState<S>,
		action: ListOfAction<A>
	): ListOfState<S> {
		switch (action.type) {
			case "insert":
				const newItem = {
					id: state.nextId,
					state: child.init(),
				}
				return {
					nextId: state.nextId + 1,
					items: [...state.items, newItem],
				}
			case "remove":
				return {
					nextId: state.nextId,
					items: state.items.filter(item => item.id !== action.id),
				}
			case "childAction":
				return {
					nextId: state.nextId,
					items: state.items.map(item => {
						if (item.id === action.id) {
							return {
								id: item.id,
								state: child.reducer(item.state, action.childAction),
							}
						} else {
							return item
						}
					}),
				}
		}
	}
}
function ListOfRender<S, A>(child: Component<S, A>) {
	return function(props: {
		state: ListOfState<S>
		dispatch: (action: ListOfAction<A>) => void
	}) {
		const { state, dispatch } = props
		return (
			<div>
				<button onClick={() => dispatch({ type: "insert" })}>insert</button>
				{state.items.map(item => {
					return (
						<div key={item.id} style={{ display: "flex" }}>
							{child.render({
								state: item.state,
								dispatch: action =>
									dispatch({
										type: "childAction",
										id: item.id,
										childAction: action,
									}),
							})}
							<button onClick={() => dispatch({ type: "remove", id: item.id })}>
								{"x"}
							</button>
						</div>
					)
				})}
			</div>
		)
	}
}

function ListOf<S, A>(
	child: Component<S, A>
): Component<ListOfState<S>, ListOfAction<A>> {
	return {
		init: () => ({ items: [], nextId: 0 }),
		reducer: ListOfReducer(child),
		render: ListOfRender(child),
	}
}

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
	return <Start component={ListOf(CounterComponent)} />
}

export default App
