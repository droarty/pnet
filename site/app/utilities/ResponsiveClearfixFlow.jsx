/*
 This utility takes a list of components that use bootstrap grid classes to modify the
 flow of the list depending on the viewport size.  It then inserts clearfix divs at
 the natural wrapping points of the grid.  The problem that the clearfix class solves is when
 a displayed item should wrap back to the left edge of the grid but is blocked because
 a taller item is in the way so it then floats to the right of that taller item.  The
 clearfix forces the next item to float under the left most item in the grid.
 Without a clearfix inserted:
 ---- ---- ----
 |1 | |2 | |3 |
 |  | |  | |  |
 |  | ---- ----
 ---- ---- ----
 |4 | |5 |
 |  | |  |
 ---- ----
 With a clearfix inserted:
 ---- ---- ----
 |1 | |2 | |3 |
 |  | |  | |  |
 |  | ---- ----
 ----      clearfixDiv
 ---- ----
 |4 | |5 |
 |  | |  |
 ---- ----
 However, we have another problem when the number of grid columns is dynamic.
 Class = "col-sm-6 col-md-4" specifies that in the small (sm) viewport our items
 are 6/12ths of the screen width, so we have two columns.  And in the medium (md)
 or larger viewport, our items are 4/12ths of the screen width so three columns.
 So sometimes we want a clearfix after every second item, other times we want a
 clearfix after every third item. To solve this we can use the bootstrap
 hiden/visible grid classes to hide or show our clearfix in different viewports.
 This algorithm does just that.

 Note: currently this utility provides a clearfix solution for the grid pattern
 "col-sm-6 col-md-4", so if we ever need to accomodate other patterns, the pattern
 itself will need to be passed in so we know which pattern to parse for.  ie.
 ResponsiveFlow(list, 'col-sm-6 col-md-4') or ResponsiveFLow(list, 'col-xs-6 col-sm-4
 col-md-2').  The classes can be picked apart for patterns to support or we can just
 create a hash of patterns and algorithms.
 */

import React from 'react'

let defaultFormats = [
  {classes: ['md', 'lg'], columns: 3},
  {classes: ['sm'], columns: 2}
]

let ResponsiveClearfixFlow = function(list, formats = defaultFormats) {
  let revisedList = []
  list.forEach(function(originalItem, index) {
    revisedList.push(originalItem)
    // add a clearfix div if needed
    let clearfixClasses = calculateClearfixClasses(index, formats)
    if (clearfixClasses) {
      revisedList.push(
        <div
          className={clearfixClasses}
          key={`clearfix_for_${index}`}
        />
      )
    }
  })
  return revisedList
}

let calculateClearfixClasses = function(index, formats) {
  let clearfixClasses = ''
  formats.forEach(function(format) {
    if ((index + 1) % format.columns == 0) {
      clearfixClasses += `visible-${format.classes.join('-block visible-')}-block `
    }
  })
  if (clearfixClasses) {
    clearfixClasses += 'clearfix'
  }

  return clearfixClasses
}

module.exports = ResponsiveClearfixFlow
