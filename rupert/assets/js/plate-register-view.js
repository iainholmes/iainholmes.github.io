// Native dialog enhancement. The image links remain useful without JavaScript.
const register = document.querySelector('.plate-register');
if (register && typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
  const dialog = document.createElement('dialog');
  dialog.className = 'plate-viewer';
  dialog.setAttribute('aria-labelledby', 'plate-viewer-title');
  dialog.innerHTML = '<header><h2 id="plate-viewer-title"></h2><button type="button" autofocus aria-label="Close enlarged plate">Close</button></header><img class="plate-viewer-image" alt=""><footer></footer>';
  document.body.append(dialog);
  let trigger;
  register.addEventListener('click', event => {
    const link = event.target.closest('.register-art');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); trigger = link;
    const print = link.closest('.register-print'), image = print.querySelector('img');
    dialog.querySelector('h2').textContent = print.querySelector('.register-number').textContent;
    const enlarged = dialog.querySelector('img');
    enlarged.src = link.href; enlarged.alt = image.alt;
    enlarged.width = Number(image.getAttribute('width')); enlarged.height = Number(image.getAttribute('height'));
    dialog.querySelector('footer').replaceChildren(...[...print.querySelector('figcaption').children].map(n => n.cloneNode(true)));
    dialog.showModal(); document.documentElement.classList.add('plate-inspecting');
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const stops = [...dialog.querySelectorAll('button, a[href]')];
    const first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('plate-inspecting');
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
}
