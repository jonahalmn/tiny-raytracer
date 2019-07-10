import * as glMatrix from 'gl-matrix'

export default class Camera {
  constructor({ near, far, fov, viewportHeight, viewportWidth }) {
    this.projection = glMatrix.mat4.create()
    glMatrix.mat4.perspective(this.projection, fov, viewportWidth / viewportHeight, near, far)

    this.inverseProjection = glMatrix.mat4.create()
    glMatrix.mat4.invert(this.inverseProjection, this.projection)
  }
}
