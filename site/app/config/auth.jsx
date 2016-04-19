import Config from 'app/config/config.jsx'

Auth.configure({
  apiUrl: Config.apiUrl,
  tokenValidationPath: '/auth/validate_token',
  validateOnPageLoad: false,
  forceHardRedirect: false,
  storage: 'cookies',
  cookieExpiry: 14,
  cookiePath: '/',
  tokenFormat: {
    'access-token': '{{ access-token }}',
    'token-type': 'Bearer',
    client: '{{ client }}',
    expiry: '{{ expiry }}',
    uid: '{{ uid }}'
  },
  handleLoginResponse: function(response) {
    return response.data
  },
  handleTokenValidationResponse: function(response) {
    return response.data
  },
  authProviderPaths: {
    /* FIXME: There's a bug in configuring providers in j-toker; it directs to the
     wrong path on the api server if I call the key 'google'  */
    github: '/auth/google_oauth2',
    google: '/auth/google_oauth2'
  }
})

module.exports = Auth
