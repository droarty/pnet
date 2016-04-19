import Auth from 'j-toker'
import Config from 'app/config/config.jsx'

window.$.ajaxSetup({
  beforeSend(xhr, settings) {
    Auth.appendAuthHeaders(xhr, settings)
  },
  error(response) {
    if (response.status == '401') {
      if (Auth.user.student_id && Auth.user.signedIn) Auth.signOut()
    } else if (!Config.development) {
      window.location.href = `/error/${response.status}`
    }
  }
})

