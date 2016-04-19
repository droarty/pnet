let sorting = {
  numeric(a, b) {
    let a_int = isNaN(parseInt(a)) ? -1 : parseInt(a)
    let b_int = isNaN(parseInt(b)) ? -1 : parseInt(b)

    if (a_int > b_int) {
      return 1
    }
    else if (a_int < b_int) {
      return -1
    }
    else {
      return 0
    }
  }
}

module.exports = sorting
