const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errs=[];
  for (const [w,h,f] of [[1000,640,'cov1.png'],[390,780,'cov2.png']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + require('path').resolve(__dirname, '../dist/index.html') + ''); await p.evaluate(()=>{const v=document.getElementById('visits'); document.getElementById('visitsN').textContent='1,234'; v.hidden=false;});
    if (f==='cov1.png') await p.waitForFunction(()=>window.__pp,{timeout:90000}); await p.waitForTimeout(3000);
    await p.screenshot({ path: './'+f, timeout: 120000 });
    if (f==='cov1.png') { await p.click('#coverGo'); await p.waitForTimeout(1500); console.log('hidden:', await p.evaluate(()=>document.getElementById('cover').classList.contains('gone'))); }
  }
  console.log(errs.join('\n')||'no errors'); await b.close();
})();
