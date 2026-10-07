export function webglDisponible() {
  try {
    const canevas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canevas.getContext('webgl2') || canevas.getContext('webgl')))
  } catch {
    return false
  }
}
