import React from "react"
import { useState } from "./hooks"

// A store represents state that can get passed around.
interface Store<T> {
	value: T
	setValue: (arg: T) => void
}

// Wrap hooks to create stores.
function useStore<T>(arg: T) {
	const [value, setValue] = useState(arg)
	return { value, setValue }
}

// Wrap components to instantiate stores.
function useStores<P, S extends { [key: string]: any }>(
	initialValues: S,
	fn: (props: P, stores: { [key in keyof S]: Store<S[key]> }) => JSX.Element
) {
	return (props: P & Partial<{ [key in keyof S]: Store<S[key]> }>) => {
		const stores: S = {} as any
		for (const key in initialValues) {
			if (props[key]) {
				stores[key] = props[key]
			} else {
				stores[key] = useStore(initialValues[key])
			}
		}
		return fn(props, stores)
	}
}

// The state of this counter is abstracted away through the use of "stores".
// A store encapsulated state. It can be instatiated in a parent component and
// passed down to this component. If it is not passed as a prop, it will be
// instatiated inside the component. This makes it really easy to "lift the
// state" into a parent component.
const Counter = useStores(
	{ countStore: 0 },
	(
		props: { label: string; delta: number },
		stores: { countStore: Store<number> }
	) => {
		const { countStore } = stores
		return (
			<div>
				<button
					onClick={() => countStore.setValue(countStore.value - props.delta)}
				>
					{"-"}
				</button>
				<span>
					{props.label}: {countStore.value}
				</span>
				<button
					onClick={() => countStore.setValue(countStore.value + props.delta)}
				>
					{"+"}
				</button>
			</div>
		)
	}
)

// Here are two independent counters, just like before. The state of the counters
// are initialized when they mount.
function TwoCounters() {
	return (
		<div>
			<Counter label="one" delta={1} />
			<Counter label="two" delta={1} />
		</div>
	)
}

// Both of these counters are operating on the same store. Their count is always
// the same, but they add different amounts to the state. Thus their state is
// effectively lifted into the parent.
const DualCounters = useStores(
	{ countStore: 0 },
	(props: {}, stores: { countStore: Store<number> }) => {
		const { countStore } = stores
		return (
			<div>
				<Counter label="+1" delta={1} countStore={countStore} />
				<Counter label="+10" delta={10} countStore={countStore} />
			</div>
		)
	}
)

// Here is a more complex scenario where one counter dictated the amount the other
// counter increments by. Thus we've lifted only the part of the state that is needed.
const DeltaCounters = useStores(
	{ delta: 1 },
	(props: {}, stores: { delta: Store<number> }) => {
		const { delta } = stores
		return (
			<div>
				<Counter label={"+" + delta.value} delta={delta.value} />
				<Counter label="delta" delta={1} countStore={delta} />
			</div>
		)
	}
)

export default DeltaCounters
