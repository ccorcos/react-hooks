import React from "react"

const R: any = React

export const useState = R.useState as <T>(
	initialValue: T
) => [T, (arg: T) => void]
