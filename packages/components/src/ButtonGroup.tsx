import * as React from "react"
import glamorous, { GlamorousComponent } from "glamorous"
import { Theme } from "@operational/theme"

export interface Props {
  id?: string
  css?: any
  className?: string
  children?: React.ReactNode
}

const Container = glamorous.div(({ theme }: { theme: Theme }) => ({
  label: "buttongroup",
  "& > div": {
    margin: 0
  },
  "& > div:not(:first-child)": {
    borderLeft: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  "& > div:not(:last-child)": {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  }
}))

const ButtonGroup = (props: Props) => (
  <Container id={props.id} css={props.css} className={props.className}>
    {props.children}
  </Container>
)

export default ButtonGroup
