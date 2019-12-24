const ow = require('ow')
const {GoogleAuth} = require('google-auth-library')
const {Secret} = require('./secret')

class SecretClient {
  constructor() {
    this.auth = new GoogleAuth({})
  }

  async read(secretId) {
    ow(secretId, ow.string)

    const secret = await this.load(secretId)
    return secret.read()
  }

  async write(secretId, secretValue) {
    ow(secretId, ow.string)
    ow(secretValue, ow.string)

    const secret = await this.load(secretId)
    return secret.write(secretValue)
  }

  async load(secretId) {
    ow(secretId, ow.string)

    const projectId = await this.getProjectId()
    return new Secret({
      secretId,
      projectId,
    })
  }

  async getProjectId() {
    return this.auth.getProjectId()
  }
}

module.exports = {SecretClient}
