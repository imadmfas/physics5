const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../dist/index.html') + '#coords');
  await p.waitForFunction(()=>window.__pp,{timeout:90000});
  await p.evaluate(()=>{ window.__pp.gsap.ticker.lagSmoothing(0); localStorage.clear(); });
  const list = (process.argv[2]||'0,1,2,3,4,5,6,7,8,9').split(',').map(Number);
  for (const i of list) {
    await p.evaluate(async i=>{ await window.__pp.goTo(i,true); }, i);
    await p.waitForTimeout(1500);
    // zoom onto right page
    await p.evaluate(()=>{ const {flyTo,V}=window.__pp; flyTo(V(0.54,1.05,1.05),V(0.54,0.13,0.0),0); });
    for (const k of [0,1,2]) { await p.evaluate(k=>window.__pp.activate(k), k); await p.waitForTimeout(2500); }
    await p.screenshot({ path: `./L${i}.png`, timeout: 120000 });
  }
  console.log(errs.join('\n')||'no errors');
  await b.close();
})();
