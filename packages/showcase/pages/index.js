import * as React from "react"
import glamorous from "glamorous"
import { Card, Icon } from "@operational/components"
import { fetchFromRepo } from "../utils"

import Layout from "../components/Layout"
import StaticContent from "../components/StaticContent"
import { Operational } from "../components/Icons"
import Demo from "../components/Demo"

const TitleBar = glamorous.div(({ theme }) => ({
  label: "showcasetitlebar",
  padding: `${theme.spacing * 1}px 0`,
  color: "#000",
  position: "relative",
  height: 400,
  display: "flex",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  "& h1": {
    ...theme.typography.title,
    fontWeight: 400,
    fontSize: "2.5rem",
    textAlign: "center",
    margin: "10px 0 10px 0"
  },
  "& h2": {
    ...theme.typography.body,
    fontSize: "1.25rem",
    textAlign: "center",
    marginTop: 0
  }
}))

const TitleBarContent = glamorous.div({
  label: "showcasetitlebarcontent",
  textAlign: "center",
  position: "relative",
  zIndex: 1000,
  "& svg": {
    margin: "auto"
  }
})

const BodyContent = glamorous.div({
  padding: "32px 16px",
  maxWidth: 760,
  margin: "auto"
})

export default class Intro extends React.Component {
  static async getInitialProps() {
    const content = await fetchFromRepo("/README.md")
    return { content: content.split("<!-- separator -->")[1] }
  }

  state = {
    rotation: 0
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState(() => ({ rotation: 360 }))
      this.rotationInterval = setInterval(
        () => this.setState(() => ({ rotation: this.state.rotation === 0 ? 360 : 0 })),
        10000
      )
    }, 5000)
  }

  componentWillUnmount() {
    this.rotationInterval && clearInterval(this.rotationInterval)
  }

  render() {
    return (
      <Layout pathname={this.props.url.pathname}>
        <Card css={{ width: "100%", position: "relative", padding: 0 }}>
          <TitleBar>
            <TitleBarContent>
              <Operational size={80} rotation={this.state.rotation} />
              <h1>Operational UI</h1>
              <h2>Building blocks for effective operational interfaces</h2>
            </TitleBarContent>
            <Demo />
          </TitleBar>
          <BodyContent>
            <StaticContent markdownContent={this.props.content} />
          </BodyContent>
        </Card>
      </Layout>
    )
  }
}