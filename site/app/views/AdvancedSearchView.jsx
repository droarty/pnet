import React from 'react'

let AdvancedSearchView = React.createClass({
  getInitialState() {
    return ({
      school: '',
      city: '',
      district: '',
      school_list: []
    })
  },

  onChangeSchool(event) {
    let newState = this.state
    newState.school = event.target.value
    this.setState(newState)
    this.updateSearch(newState)
  },

  onChangeCity(event) {
    let newState = this.state
    newState.city = event.target.value
    this.setState(newState)
    this.updateSearch(newState)
  },

  onChangeDistrict(event) {
    let newState = this.state
    newState.district = event.target.value
    this.setState(newState)
    this.updateSearch(newState)
  },

  updateSearch() {
    if ((this.state.school + this.state.city + this.state.district).length >2) {
      window.$.ajax({
        url: `/api/schools/search?school=${this.state.school}&city=${this.state.city}&district=${this.state.district}&`,
        type: 'GET',
        success: (result)=> {
          this.setState({
            school_list: result
          })
        }
      })
    }
  },

  render() {
    let pathname = window.location.pathname

    return (
      <div>
        <h1>Advanced Search</h1>
        <div>
          <span className="input-item">
            School: <input type="text" ref="school" value={this.state.school} onChange={this.onChangeSchool}/>
          </span>
          <span className="input-item">
            City: <input type="text" ref="city" value={this.state.city} onChange={this.onChangeCity}/>
          </span>
          <span className="input-item">
            District: <input type="text" ref="district" value={this.state.district} onChange={this.onChangeDistrict}/>
          </span>
        </div>
        <div>
          {JSON.stringify(this.state.school_list)}
        </div>
      </div>
    )
  }
})

module.exports = AdvancedSearchView
