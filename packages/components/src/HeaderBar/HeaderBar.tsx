import * as React from "react"
import styled from "react-emotion"
import { OperationalStyleConstants } from "@operational/theme"

export interface HeaderProps {
  /**
   * The "logo" element of the HeaderBar.
   * Typically, the leftmost element.
   */
  logo: React.ReactNode

  /** The center of the HeaderBar. */
  main?: React.ReactNode

  /** The "end" element of the HeaderBar. */
  end?: React.ReactNode
}

const Bar = styled("div")(
  {
    display: "grid",
    width: "100vw",
    maxWidth: "100%",
    " > *": {
      display: "flex",
      alignItems: "center",
    },
  },
  ({ theme }: { theme?: OperationalStyleConstants }) => {
    const height = 45

    return {
      height,
      padding: `0 ${theme.space.content}px`,
      gridTemplateColumns: `${theme.sidebarWidth}px auto 50px`,
      backgroundColor: theme.color.background.dark,
      color: theme.color.white,
      " > *": {
        height,
      },
    }
  },
)

const StartContainer = styled("div")()
const CenterContainer = styled("div")()
const EndContainer = styled("div")({ justifyContent: "flex-end" })

const HeaderBar: React.SFC<HeaderProps> = ({ logo, main, end }) => (
  <Bar>
    <StartContainer>{logo}</StartContainer>
    <CenterContainer>{main}</CenterContainer>
    <EndContainer>{end}</EndContainer>
  </Bar>
)

export default HeaderBar