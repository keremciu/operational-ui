import Events from "../../utils/event_catalog"
import { IEvents, IObject, IState, TD3Selection, TDatum } from "../typings"
import { defaults, find, filter, forEach, isFunction, keys, map, reduce, values } from "lodash/fp"
import { withD3Element } from "../../utils/d3_utils"
import * as d3 from "d3-selection"
import "d3-transition"
import { pie as d3Pie, arc as d3Arc } from "d3-shape"
import { interpolateObject } from "d3-interpolate"
import * as styles from "./styles"

// y is a step-function (with two x values resulting in the same y value)
// on the positive integer domain which is monotonic decreasing
function approxZero(y: (x: number) => number, initialX: number): number {
  // make sure to get points with different y value
  let p0: { x: number; y: number } = { x: initialX, y: y(initialX) }
  let p1: { x: number; y: number } = { x: initialX + 2, y: y(initialX + 2) }

  // Solve for 0
  let m: number = (p0.y - p1.y) / (p0.x - p1.x)
  let xZero: number = -p0.y / m + p0.x

  // Find nearest integer value for x that has y > 0
  let x: number = Math.round(xZero)
  let i: number
  for (i = 0; i <= 10; i++) {
    if (y(x) <= 0) {
      x--
    }
  }

  return x
}

// Accessors of series in prepared data
function dataKey(d: TDatum): string {
  return d.data.key
}
function dataLabelValue(d: TDatum): string {
  return d.data.percentage ? d.data.percentage.toFixed(1) + "%" : undefined
}
function dataColor(d: TDatum): string {
  return d.data.colorHex
}

abstract class AbstractRenderer {
  color: (d: TDatum) => string
  computed: IObject = {}
  currentTranslation: [number, number]
  data: TDatum[]
  drawn: boolean = false
  el: TD3Selection
  events: IEvents
  key: (d: TDatum) => string
  previous: IObject
  state: IState
  total: number
  type: string
  value: (d: TDatum) => number

  constructor(state: IState, events: IEvents, el: TD3Selection, options: IObject) {
    this.state = state
    this.events = events
    this.el = el.select("g.drawing")
    forEach.convert({ cap: false })((option: any, key: string): void => {
      ;(this as any)[key] = isFunction(option) ? (d?: any) => option(d) : option
    })(options)
    this.events.on(Events.FOCUS.ELEMENT.HOVER, this.updateElementHover.bind(this))
    this.events.on(Events.FOCUS.ELEMENT.OUT, this.updateElementHover.bind(this))
    this.events.on(Events.CHART.OUT, this.updateElementHover.bind(this))
  }

  setData(data: TDatum[]): void {
    this.data = data
  }

  computeTotal(): void {
    this.total = reduce((memo: number, datum: TDatum): number => {
      const value: number = this.value(datum)
      return memo + (value || 0)
    }, 0)(this.data)
  }

  hasData(): boolean {
    return this.data.length > 0
  }

  draw(): void {
    this.compute()
    this.drawn ? this.updateDraw() : this.initialDraw()
  }

  initialDraw(): void {
    // groups
    this.el.append("svg:g").attr("class", "arcs")
    this.el.append("svg:g").attr("class", styles.total)

    if (this.hasData()) {
      this.updateDraw()
    }

    this.drawn = true
  }

  updateDraw(): void {
    // Remove focus before updating chart
    this.events.emit(Events.FOCUS.ELEMENT.OUT)

    const duration: number = this.state.current.get("config").duration
    let that: AbstractRenderer = this,
      n: number = 0

    // Center coordinate system
    this.el.attr("transform", this.translateString(this.computeTranslate()))

    // Arcs
    let arcs: TD3Selection = this.el
      .select("g.arcs")
      .selectAll("g")
      .data(this.computed.data, dataKey)

    // Exit
    let exit: any = arcs
      .exit()
      .transition()
      .duration(duration)

    exit.selectAll("path").attrTween("d", this.removeArcTween.bind(this))

    exit.selectAll(`text.${styles.label}`).style("opacity", "1e-6")

    exit.remove()

    // Enter
    let enter: TD3Selection = arcs
      .enter()
      .append("svg:g")
      .attr("class", styles.arc)
      .on("mouseenter", this.onMouseOver.bind(this))

    enter.append("svg:path").style("fill", (d: TDatum): string => this.color(d.data))

    enter
      .append("svg:text")
      .attr("class", styles.label)
      .attr("dy", 5)
      .style("text-anchor", "middle")

    let update: any = arcs
      .enter()
      .merge(arcs)
      .transition()
      .duration(duration)
      .each(() => (n = n + 1))
      .on("end", (): void => {
        n = n - 1
        if (n < 1) {
          this.onTransitionEnd()
        }
      })

    update.selectAll("path").attrTween("d", this.arcTween.bind(this))

    update
      .selectAll(`text.${styles.label}`)
      .attr("transform", this.labelTranslate.bind(this))
      .text(dataLabelValue)

    // Total
    this.updateTotal()
  }

  onTransitionEnd(): void {
    return
  }

  abstract centerDisplayString(): string[]

  updateTotal(): void {
    let duration: number = this.state.current.get("config").duration

    let total: any = this.el
      .select(`g.${styles.total}`)
      .selectAll("text")
      .data(this.centerDisplayString())

    total
      .exit()
      .transition()
      .duration(duration)
      .style("font-size", "1px")
      .remove()

    total
      .enter()
      .append("svg:text")
      .attr("text-anchor", "middle")

    let mergedTotal: TD3Selection = total
      .enter()
      .merge(total)
      .selectAll("text")

    mergedTotal.text((d: string): string => d)

    const node: any = mergedTotal.node()
    if (node) {
      let y = (x: number): number => {
        mergedTotal.style("font-size", x + "px")
        // Text should fill half of available width (0.5 * diameter = radius)
        return this.computed.inner - node.getBBox().width
      }

      // start with min font size
      if (y(this.state.current.get("config").minTotalFontSize) < 0) {
        // Not enough room - do not show total
        total = total.data([])
      } else {
        // change font size until bounding box is completely filled
        approxZero(y, this.state.current.get("config").minTotalFontSize)
        mergedTotal.attr("dy", this.totalYOffset())
      }
    }
  }

  abstract totalYOffset(): string

  updateElementHover(datapoint: IObject): void {
    if (!this.drawn) {
      return
    }

    let arcs: any = this.el.select("g.arcs").selectAll("g")

    const filterFocused: any = (d: TDatum): boolean =>
        datapoint.d && datapoint.d.data && dataKey(d) === dataKey(datapoint.d),
      filterUnFocused: any = (d: TDatum): boolean =>
        datapoint.d && datapoint.d.data ? dataKey(d) !== dataKey(datapoint.d) : true

    arcs
      .filter(filterFocused)
      .select("path")
      .attr("d", this.computed.arcOver)
      .attr("filter", `url(#${this.state.current.get("computed").canvas.shadowDefinitionId})`)

    arcs
      .filter(filterUnFocused)
      .select("path")
      .attr("d", this.computed.arc)
      .attr("filter", null)
  }

  onMouseOver(d: TDatum): void {
    const centroid: [number, number] = this.translateBack(this.computed.arc.centroid(d))
    this.events.emit(Events.FOCUS.ELEMENT.HOVER, { focusPoint: { centroid }, d })
  }

  abstract angleRange(): [number, number]

  abstract totalForPercentages(): number

  checkData(): void {
    return
  }

  angleValue(d: TDatum): number {
    return this.value(d)
  }

  // Compute
  compute(): void {
    this.previous = this.computed
    let d: IObject = {}

    // We cannot draw a pie chart with no series or only series that have the value 0
    if (!this.hasData()) {
      return
    }

    this.checkData()

    let startAngle: number
    let endAngle: number
    ;[startAngle, endAngle] = this.angleRange()

    d.layout = d3Pie()
      .sort(null)
      .value(this.angleValue.bind(this))
      .startAngle(startAngle)
      .endAngle(endAngle)
    d.total = this.totalForPercentages()

    this.computed = d
    this.previous = defaults(this.computed)(this.previous)

    // data should not become part of this.previous in first computation
    this.computed.data = d.layout(this.data)
    this.calculatePercentages(d.total)
    this.computeArcs()
  }

  calculatePercentages(total: number): void {
    forEach((datum: IObject): void => {
      datum.percentage = this.value(datum) / total * 100
    })(this.data)
  }

  computeArcs(scale?: number): void {
    let computed: IObject = this.computed
    const drawingDims: IObject = this.state.current.get("computed").canvas.drawingContainerDims
    computed.r = this.computeOuter(drawingDims.width, drawingDims.height, scale)
    computed.inner = this.computeInner(computed.r)
    computed.rHover = this.hoverOuter(computed.r)
    computed.innerHover = Math.max(computed.inner - 1, 0)
    computed.arc = d3Arc()
      .innerRadius(computed.inner)
      .outerRadius(computed.r)
    computed.arcOver = d3Arc()
      .innerRadius(computed.innerHover)
      .outerRadius(computed.rHover)
  }

  // Calculation of outer radius
  computeOuter(width: number, height: number, scaleFactor?: number): number {
    return Math.min(width, height) / 2 - this.state.current.get("config").outerBorderMargin
  }

  // Calculation of inner radius
  computeInner(outerRadius: any): number {
    const width: number = outerRadius - this.state.current.get("config").minInnerRadius
    // If there isn't enough space, don't render inner circle
    return width < this.minWidth() ? 0 : outerRadius - Math.min(width, this.maxWidth())
  }

  // minWidth: number = this.type() === "gauge" ? options.minGaugeWidth : options.minDonutWidth,
  abstract minWidth(): number

  // maxWidth: number = this.type() === "gauge" ? options.maxGaugeWidth : options.maxDonutWidth,
  abstract maxWidth(): number

  hoverOuter(radius: number): number {
    return radius + 1
  }

  abstract computeTranslate(): [number, number]

  // Translate back to 0,0 in top left
  translateBack(point: [number, number]): [number, number] {
    let currentTranslation: [number, number] = this.currentTranslation
    return [point[0] + currentTranslation[0], point[1] + currentTranslation[1]]
  }

  abstract arcTween(d: TDatum, i: number): (t: number) => string

  removeArcTween(d: TDatum, i: number): (t: number) => string {
    let s0: number
    let e0: number
    s0 = e0 = this.angleRange()[1]
    let f = interpolateObject({ endAngle: d.endAngle, startAngle: d.startAngle }, { endAngle: e0, startAngle: s0 })
    return (t: number): string => this.computed.arc(f(t))
  }

  labelTranslate(d: TDatum): string {
    return this.translateString(this.computed.arc.centroid(d))
  }

  translateString(values: [number, number]): string {
    return "translate(" + values.join(", ") + ")"
  }

  dataForLegend(): IObject[] {
    return map((datum: IObject): IObject => {
      return {
        label: this.key(datum),
        color: this.color(datum)
      }
    })(this.data)
  }

  // Remove & clean up
  remove(): void {
    if (this.drawn) {
      this.el.remove()
      this.drawn = false
    }
  }
}

export default AbstractRenderer
