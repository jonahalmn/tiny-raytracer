import Camera from './Camera'
import WebGL from './webGL'

export default class Scene {
  constructor() {
    let target = document.querySelector('#root')

    this.dimensions = {
      x: window.innerWidth,
      y: window.innerHeight
    }

    this.camera = new Camera({
      near: 0.1,
      far: 10,
      fov: 45,
      viewportHeight: this.dimensions.y,
      viewportWidth: this.dimensions.x
    })

    this.glManager = new WebGL({ camera: this.camera })

    target.appendChild(this.glManager.canvas)
  }
}
