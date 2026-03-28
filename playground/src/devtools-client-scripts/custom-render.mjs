export default function (ctx) {
  ctx.current.events.on('dom:panel:mounted', (panel) => {
    const el = document.createElement('div')
    el.style.padding = '16px'
    el.textContent = 'Hello from custom render dock!'

    const btn = document.createElement('button')
    btn.textContent = 'Click me'
    btn.onclick = () => {
      // eslint-disable-next-line no-alert
      alert('Button clicked in custom render dock!')
    }
    el.appendChild(btn)
    panel.appendChild(el)
  })
}
