import * as glMatrix from 'gl-matrix'

export default class Camera {
  constructor({ near, far, fov, viewportHeight, viewportWidth }) {
    this.projection = glMatrix.mat4.create()
    glMatrix.mat4.perspective(this.projection, fov, viewportWidth / viewportHeight, near, far)

    this.inverseProjection = glMatrix.mat4.create()
    glMatrix.mat4.invert(this.inverseProjection, this.projection)

    this.model = glMatrix.mat4.create()
    glMatrix.mat4.identity(this.model)
    glMatrix.mat4.translate(this.model, this.model, [0, 0, -10])

    this.inverseModel = glMatrix.mat4.create()
    glMatrix.mat4.invert(this.inverseModel, this.model)

    console.log(this.inverseModel)
  }
}
