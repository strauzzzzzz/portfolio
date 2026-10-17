let done = false

export function setIntroDone() {
  if (done) return
  done = true
  window.dispatchEvent(new CustomEvent('intro-done'))
}

export function isIntroDone() {
  return done
}
