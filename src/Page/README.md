This component lays out a typical opinionated page in an application, containing a title, breadcrumbs, control buttons, as well as iconography that helps the user understand how the page fits into the larger context of the application.

This component is typically used inside a layout component along with a sidenav. Check out the [layout docs](./layout.md) to get a sense of this usage.

### Usage

Here is a simple usage example:

```jsx
;<Page title="Settings Page">
  <Card>Hello, this is page content</Card>
</Page>
```

### Properly handles grid rows

Here is a simple usage example:

```jsx
;<div style={{ height: 400 }}>
  <Page title="Settings Page">
    {Array(2)
      .fill("Hello, this is page content")
      .map((text, index) => <Card key={index}>{text}</Card>)}
  </Page>
</div>
```

### Sticky Header

Here is a simple usage example:

```jsx
;<div style={{ height: 200 }}>
  <Page title="Settings Page">
    {Array(50)
      .fill("Hello, this is page content")
      .map((text, index) => <Card key={index}>{text}</Card>)}
  </Page>
</div>
```

### With actions

```jsx
/* Always use condensed buttons in page actions */
const actions = (
  <Button condensed icon="ExternalLink" color="ghost">
    Go somewhere else
  </Button>
)
;<Page title="Settings Page" actions={actions}>
  <Card>Hello, this is page content</Card>
</Page>
```

### With tabs

```jsx
const Tab = props => (
  <PageContent>
    <Card title={`${props.title} Tab`} />
  </PageContent>
)
;<Page
  title="Bundle detail"
  tabs={[
    { name: "overview", children: <Tab title="Overview" /> },
    { name: "jobs", children: <Tab title="Jobs" /> },
    { name: "functions", children: <Tab title="Functions" /> },
  ]}
/>
```

### Sticky Header with Tabs

```jsx
const TabContent = props => (
  <PageContent areas="side main">
    {Array(50)
      .fill("Hello, this is page content")
      .map((text, index) => <Card key={index}>{text}</Card>)}
  </PageContent>
)
;<div style={{ height: 200 }}>
  <Page
    actions={
      <Button condensed icon="ExternalLink" color="ghost">
        Go somewhere else
      </Button>
    }
    title="Bundle detail"
    tabs={[
      { name: "overview", children: <TabContent /> },
      { name: "jobs", children: <TabContent /> },
      { name: "functions", children: <TabContent /> },
    ]}
  />
</div>
```

### With tabs and handlers

```jsx
const Tab = props => (
  <PageContent>
    <Card title={`${props.title} Tab`}>The tabs are not working because nothing update `activeTabName`!</Card>
  </PageContent>
)
;<Page
  title="Bundle detail"
  activeTabName="jobs"
  onTabChange={console.log}
  tabs={[
    { name: "overview", children: <Tab title="Overview" /> },
    { name: "jobs", children: <Tab title="Jobs" /> },
    { name: "functions", children: <Tab title="Functions" /> },
  ]}
/>
```

### With activeTabName controlled (classically with a router)

```jsx
const Tab = props => (
  <PageContent>
    <Card title={`${props.title} Tab`} />
  </PageContent>
)

class Router extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabName: "jobs",
    }
  }

  goTo(tabName) {
    this.setState({ tabName })
  }

  render() {
    return (
      <>
        <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: "1px black solid" }}>
          <h1>Router actions</h1>
          <p>Current route: {this.state.tabName}</p>
          <Button onClick={() => this.goTo("overview")}>go to overview</Button>
          <Button onClick={() => this.goTo("jobs")}>go to jobs</Button>
          <Button onClick={() => this.goTo("functions")}>go to functions</Button>
        </div>
        <Page
          title="Bundle detail"
          activeTabName={this.state.tabName}
          onTabChange={this.goTo.bind(this)}
          tabs={[
            { name: "overview", children: <Tab title="Overview" /> },
            { name: "jobs", children: <Tab title="Jobs" /> },
            { name: "functions", children: <Tab title="Functions" /> },
          ]}
        />
      </>
    )
  }
}

;<Router />
```

### With hidden tab

```jsx
const Tab = props => (
  <PageContent>
    <Card title={`${props.title} Tab`} />
  </PageContent>
)

class Router extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabName: "jobs",
    }
  }

  goTo(tabName) {
    this.setState({ tabName })
  }

  render() {
    return (
      <>
        <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: "1px black solid" }}>
          <h1>Router actions</h1>
          <p>Current route: {this.state.tabName}</p>
          <Button onClick={() => this.goTo("overview")}>go to overview</Button>
          <Button onClick={() => this.goTo("jobs")}>go to jobs</Button>
          <Button onClick={() => this.goTo("functions")}>go to functions</Button>
          <Button onClick={() => this.goTo("editor")}>go to editor</Button>
        </div>
        <Page
          title="Bundle detail"
          activeTabName={this.state.tabName}
          onTabChange={this.goTo.bind(this)}
          tabs={[
            { name: "overview", children: <Tab title="Overview" /> },
            { name: "jobs", children: <Tab title="Overview" /> },
            { name: "functions", children: <Tab title="Overview" /> },
            { name: "editor", children: <Tab title="Editor" />, hidden: true },
          ]}
        />
      </>
    )
  }
}

;<Router />
```

### With different layout

```jsx
;<Page title="Side on left!" areas="side main" fill>
  <PageArea name="side">
    <Card title="Side part">I'm on the side part</Card>
  </PageArea>
  <PageArea name="main">
    <Card title="Main part">I'm on the main part</Card>
  </PageArea>
</Page>
```

### With dropdown menu

```jsx
const options = [
  { label: "Payroll", onClick: () => {} },
  { label: "All Databases", onClick: () => {} },
  { label: "Sales - Germany only", onClick: () => {} },
  { label: "Sales - global", onClick: () => {} },
  { label: "Reporting", onClick: () => {} },
  { label: "Logistics", onClick: () => {} },
]

const actions = (
  <HeaderMenu items={options} withCaret align={"right"}>
    Sales / Foodmart
  </HeaderMenu>
)
;<Page title="Settings Page" actions={actions}>
  <Card>Hello, this is page content</Card>
</Page>
```

### Render a confirm box (prompt)

`Page` components support rendering an opinionated confirm box through a method in its context.

```
<OperationalUI>
  <Page>
    {({ confirm, modal }) => (
      <Button onClick={() => {
        confirm({
          title: "Are you sure",
          body: "This is a scary operation."
        })
      }}>Do something scary</Button>
    )}
  </Page>
</OperationalUI>
```

### Render a modal box

Modals are a more flexible alternative to the confirm box, that may contain anything, and are not tied to the cancel and confirm button structure.

```
<OperationalUI>
  <Page>
    {({ confirm, modal }) => (
      <Button onClick={() => {
        modal({
          title: "This is a modal",
          body: (close) => <Button onClick={() => { close() }}>Close this modal</Button>
        })
      }}>Do something scary</Button>
    )}
  </Page>
</OperationalUI>
```