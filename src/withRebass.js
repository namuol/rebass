
import React from 'react'
import { setScale as createMargin } from 'understyle/dist/margin'
import { setScale as createPadding } from 'understyle/dist/padding'
import radii from './util/radii'
import colorStyle from './util/color-style'
import basicTheme from './themes/basic'

const isObj = o => typeof o === 'object' && o !== null

export const getSubComponentStyles = (...args) => {
  const keys = args.reduce((a, obj) => [ ...a, ...Object.keys(obj) ], [])
    .reduce((a, key) => {
      const hasObj = args.reduce((acc, b) => {
        return acc || isObj(b[key])
      }, false)
      if (!hasObj) {
        return a
      }
      if (a.indexOf(key) < 0) {
        a.push(key)
      }
      return a
    }, [])

  return keys
    .reduce((a, key) => {
      args.forEach(obj => {
        if (isObj(obj[key])) {
          a[key] = {
            ...a[key],
            ...obj[key]
          }
        }
      })
      return a
    }, {})
}

const withRebass = Comp => {
  class RebassBase extends React.Component {
    render () {
      const { rebass } = this.context

      const theme = { ...basicTheme, ...rebass }
      const { scale, colors, borderRadius } = theme
      const themeStyle = theme[Comp.name] || {}

      const margin = createMargin(scale)
      const padding = createPadding(scale)
      const radiusStyles = radii(borderRadius)
      const colorStyles = colorStyle(colors)

      // extract common style props
      const {
        p, pt, pr, pb, pl, px, py,
        m, mt, mr, mb, ml, mx, my,
        rounded,
        pill,
        circle,
        color,
        backgroundColor,
        style = {},
        ...props
      } = this.props

      const subComponentStyles = getSubComponentStyles(themeStyle, style)

      const sx = {
        boxSizing: 'border-box',
        ...themeStyle,
        // handle gutter prop with negative numbers instead
        // needs an update from understyle
        ...margin({ m, mt, mr, mb, ml, mx, my }),
        ...padding({ p, pt, pr, pb, pl, px, py }),
        ...colorStyles({
          color,
          backgroundColor
        }),
        ...radiusStyles({
          rounded,
          pill,
          circle
        }),
        ...style
      }

      return (
        <Comp
          {...props}
          theme={theme}
          subComponentStyles={subComponentStyles}
          style={sx}
        />
      )
    }
  }

  RebassBase.contextTypes = {
    rebass: React.PropTypes.object
  }

  RebassBase.displayName = Comp.name

  return RebassBase
}

export default withRebass

