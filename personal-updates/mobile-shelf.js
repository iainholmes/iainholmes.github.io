/* Move the original live press notes, so mobile and desktop share the same data hooks. */
(function(){
  'use strict';
  var shelf=document.getElementById('shelf');if(!shelf)return;
  var units=Array.from(shelf.querySelectorAll('.shelf-unit'));
  var notes=units.map(function(unit){return unit.querySelector('.press-note')});
  var mobile=matchMedia('(max-width:1000px)'),frame=0;
  var panel=document.createElement('section');panel.className='mobile-press-note';panel.hidden=true;
  panel.setAttribute('aria-label','Current publication');shelf.after(panel);
  function activeIndex(){
    var left=shelf.getBoundingClientRect().left;
    var distances=units.map(function(unit){return Math.abs(unit.getBoundingClientRect().left-left)});
    return distances.indexOf(Math.min.apply(null,distances));
  }
  function sync(){
    frame=0;if(!mobile.matches)return;
    var active=activeIndex();
    notes.forEach(function(note,i){note.hidden=i!==active});
    panel.dataset.publication=units[active].querySelector('[data-issue-mark]').dataset.issueMark;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(sync)}
  function layout(){
    panel.hidden=!mobile.matches;
    notes.forEach(function(note,i){if(mobile.matches)panel.append(note);else{units[i].append(note);note.hidden=false}});
    sync();
  }
  shelf.addEventListener('scroll',schedule,{passive:true});
  shelf.addEventListener('scrollend',sync);
  shelf.addEventListener('focusin',function(event){
    // Keyboard focus selects a snap unit; pointer focus must not move the link mid-tap.
    if(!mobile.matches||!event.target.matches(':focus-visible'))return;
    var unit=event.target.closest('.shelf-unit');if(!unit)return;
    shelf.scrollTo({left:shelf.scrollLeft+unit.getBoundingClientRect().left-shelf.getBoundingClientRect().left,behavior:'instant'});
    sync();
  });
  mobile.addEventListener('change',layout);
  new ResizeObserver(schedule).observe(shelf);
  addEventListener('pageshow',schedule);
  document.fonts.ready.then(schedule);
  layout();
})();
