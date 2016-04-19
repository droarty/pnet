// default values
let config = {
  apiUrl: '',
  development: '',
  peer_responses_polling_interval: 60000,
  article_placeholder: '8e66f30e-d0f7-4163-9985-482579bfa9c7',
  image_placeholder: '8fdae466-496b-4f03-b4fb-a074fd5a926d',
  infographic_placeholder: '8e66f30e-d0f7-4163-9985-482579bfa9c7',
  podcast_placeholder: 'd6c54ea9-ecd8-4ea5-bd44-f6d2470f07ff',
  video_placeholder: '4d754b10-642d-4c2b-b66a-ce117948131e',
  quiz_placeholder: 'c7c44344-9cfa-4ad4-aa50-4e9621f4f3b4'
}

if (window.server_base_url)
  config.apiUrl = window.server_base_url

if (window.development)
  config.development = window.development

module.exports = config
