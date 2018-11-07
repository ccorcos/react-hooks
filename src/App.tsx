import React from "react"
import { useState } from "./hooks"

function Counter(props: { label: string }) {
	const [count, setCount] = useState(0)
	return (
		<div>
			<button onClick={() => setCount(count - 1)}>{"-"}</button>
			<span>
				{props.label}: {count}
			</span>
			<button onClick={() => setCount(count + 1)}>{"+"}</button>
		</div>
	)
}

function TwoCounters() {
	return (
		<div>
			<Counter label="one" />
			<Counter label="two" />
		</div>
	)
}

export default TwoCounters
