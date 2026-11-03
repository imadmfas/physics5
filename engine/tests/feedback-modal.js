const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 640 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://../dist/index.html#doppler');
  await p.waitForFunction(()=>window.__pp,{timeout:90000});
  await p.waitForTimeout(4000);
  await p.click('#bNote');
  await p.fill('#noteText','قيمة التردد في المثال تحتاج مراجعة');
  await p.screenshot({ path: '/home/claude/note.png', timeout: 120000 });
  let url=null; p.context().on('page', np => { url = np.url(); });
  await p.click('#note .go'); await p.waitForTimeout(1500);
  console.log(errs.join('\n')||'no errors', url && decodeURIComponent(url).slice(0,300));
  await b.close();
})();
