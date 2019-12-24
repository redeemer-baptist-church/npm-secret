const ow = require('ow')
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager')

class Secret {
  constructor(options = {}) {
    ow(options, ow.object.exactShape({
      secretId: ow.string,
      projectId: ow.string,
    }))

    this.secretId = options.secretId
    this.projectId = options.projectId
    this.encoding = 'utf8'
  }

  async read() {
    const [version] = await this.accessSecretVersion()
    return version.payload.data.toString(this.encoding)
  }

  async write(secretValue) {
    ow(secretValue, ow.string)

    // TODO: deal with adding a version to an existing secret
    await this.createSecret()
    return this.addSecretVersion(secretValue)
  }

  async createSecret() {
    return this.client.createSecret({
      secretId: this.secretId,
      parent: `projects/${this.projectId}`,
      secret: {
        replication: {
          automatic: {},
        },
      },
    })
  }

  async addSecretVersion(secretValue) {
    ow(secretValue, ow.string)

    const data = Buffer.from(secretValue, this.encoding)
    return this.client.addSecretVersion({
      parent: `projects/${this.projectId}/secrets/${this.secretId}`,
      payload: {
        data,
      },
    })
  }

  async accessSecretVersion() {
    return this.client.accessSecretVersion({
      name: `projects/${this.projectId}/secrets/${this.secretId}/versions/latest`,
    })
  }

  get client() { // eslint-disable-line class-methods-use-this
    return new SecretManagerServiceClient()
  }
}

module.exports = {Secret}
