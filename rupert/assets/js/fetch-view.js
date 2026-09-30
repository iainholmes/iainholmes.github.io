import { fetchDog, FETCH_FRAME_MS } from './core/fetch-drawing.js';
const dock = document.querySelector('.fetch-dock');
if (dock && document.querySelector('.edition')) {
  const button = dock.querySelector('button'), status = dock.querySelector('.fetch-status');
  const stage = document.querySelector('.fetch-stage'), runner = stage.querySelector('.fetch-runner'), ball = stage.querySelector('.fetch-ball');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, busy = false, start = 0;
  dock.hidden = false;
  function reset(message = '') {
    cancelAnimationFrame(raf); busy = false; dock.dataset.state = 'idle'; stage.hidden = true;
    button.removeAttribute('aria-disabled'); status.textContent = message;
  }
  const mix = (a,b,t) => a + (b-a)*Math.min(1,Math.max(0,t));
  const cycle = FETCH_FRAME_MS.reduce((a,b)=>a+b,0);
  function pose(ms) { let time = ms % cycle; for(let i=0;i<6;i++){if(time<FETCH_FRAME_MS[i])return i;time-=FETCH_FRAME_MS[i];}return 0; }
  function play() {
    if (busy) return;
    if (motion.matches) { runner.innerHTML = fetchDog(0,true); status.textContent = 'Rupert has brought the ball back. Reduced motion is on.'; dock.dataset.state = 'rest'; return; }
    busy = true; dock.dataset.state = 'playing'; button.setAttribute('aria-disabled','true'); status.textContent = 'Rupert is fetching the ball.';
    stage.hidden = false;
    const origin = button.querySelector('.tennis-ball').getBoundingClientRect();
    const bounds = stage.getBoundingClientRect(), x = origin.left+origin.width/2, y = origin.top+origin.height/2-bounds.top;
    const dogY = y - 25, finishX = x - 103;
    start = performance.now();
    function tick(now) {
      const elapsed = now-start;
      if(elapsed>=5450){reset('Rupert brought the ball back.');return;}
      const returning=elapsed>=2900, dropping=elapsed>=4950;
      let dogX;
      if(!returning) dogX=mix(x+65,-160,(elapsed-250)/2200);
      else dogX=mix(-160,finishX,(elapsed-2900)/2050);
      const frame=pose(elapsed), bounce=[0,-3,-5,-1,2,-2][frame];
      runner.innerHTML=fetchDog(frame,returning&&!dropping);
      runner.style.left=`${dogX}px`;runner.style.top=`${dogY+(dropping?0:bounce)}px`;
      runner.style.transform=returning?'none':'scaleX(-1)';
      if(elapsed<1900){
        const t=elapsed/1900, ballX=mix(x,-30,t);
        const arc= Math.abs(Math.sin(t*Math.PI*2.5))*Math.max(0,62*(1-t));
        ball.hidden=false;ball.style.left=`${ballX-8}px`;ball.style.top=`${y-8-arc}px`;
      } else if(dropping){
        const t=(elapsed-4950)/500;ball.hidden=false;ball.style.left=`${x-8}px`;ball.style.top=`${mix(y-15,y-8,t)}px`;
        runner.style.opacity=String(1-t);
      } else {ball.hidden=true;runner.style.opacity='1';}
      raf=requestAnimationFrame(tick);
    }
    runner.style.opacity='1';raf=requestAnimationFrame(tick);
  }
  button.addEventListener('click',play);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&busy)reset('Fetch stopped.');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&busy)reset();});
  addEventListener('resize',()=>{if(busy)reset();});
  addEventListener('pagehide',()=>reset());
  motion.addEventListener('change',()=>{if(busy)reset('Motion preference updated.');});
}
