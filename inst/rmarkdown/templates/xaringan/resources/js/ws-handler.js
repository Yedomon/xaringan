var flag, focused = false;
ws.onmessage = function(event) {
  flag = true;
  var d = JSON.parse(event.data);
  if (d === true) {
    // fire a servr:reload event
    Event && document.dispatchEvent(new Event('servr:reload'));
    return location.reload();
  }
  if (!slideshow || !remark || d === false || d === null) return;
  var p = d.page; if (p < 1) p = 1;
  if (!focused) slideshow.gotoSlide(p);
  if (d.markdown === false) return;
  var el = document.getElementsByClassName('remark-slides-area');
  el = el[0].children[p - 1].querySelector('.remark-slide-content');
  var n = el.querySelector('.remark-slide-number').outerHTML.toString();
  el.innerHTML = remark.convert(d.markdown) + n;
  if (MathJax) {
    slideshow._releaseMath(el);
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, el]);
  }
  var i, codes = el.getElementsByTagName('pre');
  for (i = 0; i < codes.length; i++) {
    remark.highlighter.engine.highlightBlock(codes[i]);
  }
};

// send the page number to R, so RStudio can move to the Rmd source of the
// current slide
setInterval(function() {
  if (flag === false || ws.readyState !== ws.OPEN) return;
  flag = false;
  ws.send((slideshow && remark) ? JSON.stringify({
    'n': slideshow.getCurrentSlideIndex() + 1,
    'N': slideshow.getSlideCount(),
    'focused': focused
  }) : '');
}, !!SERVR_INTERVAL);

window.addEventListener('focus', function(e) { focused = true; });
window.addEventListener('blur',  function(e) { focused = false; });