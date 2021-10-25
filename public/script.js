document.querySelectorAll('.date').forEach(d => {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const date = formatter.format(new Date(d.innerText))
  d.innerText = date
})

document.querySelectorAll('.date-time').forEach(d => {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  const date = formatter.format(new Date(d.innerText))
  d.innerText = date
})

M.AutoInit()

M.Slider.init(document.querySelectorAll('.slider'), {})