async (page) => {
  const base=page.url().replace(/[^/]*$/,''),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'disasters.html');
  const app=page.frameLocator('iframe');
  const cases={indian:'aceh',tsunami:'sanriku',krakatau:'krakatau',winter:'pinatubo'};
  for(const [id,key] of Object.entries(cases)){
    await app.locator(`[data-event="${id}"]`).click();
    await app.locator(`#event-surface[data-terrain="${key}"]`).waitFor();
    for(const value of [0,35,65,100,0])await app.locator('#event-progress').fill(String(value));
    await app.locator('#fx-close').click();
    if(!await app.locator('#event-surface').isVisible())throw Error(id+' close-up missing');
    await app.locator('#fx-planet').click();
    if(await app.locator('#event-surface').isVisible())throw Error(id+' canvas blocks globe');
    await page.screenshot({path:`output/playwright/qa-${id}-planet.png`});
    await app.locator('#fx-surface').click();await app.locator('#event-progress').fill('50');
    await page.screenshot({path:`output/playwright/qa-${id}-region.png`});
  }
  for(const id of ['impact','ice']){
    await app.locator(`[data-event="${id}"]`).click();await app.locator('#event-progress').fill('60');
    if(await app.locator('#event-surface').isVisible())throw Error('Hidden surface blocks '+id);
  }
  await app.locator('[data-event=krakatau]').click();await app.locator('#fx-surface').click();
  await app.locator('#event-progress').fill('30');await app.locator('#event-play').click();await page.waitForTimeout(500);await app.locator('#event-play').click();
  const stopped=await app.locator('#event-progress').inputValue();if(+stopped<=30)throw Error('Playback stalled');
  await page.waitForTimeout(200);if(await app.locator('#event-progress').inputValue()!==stopped)throw Error('Pause failed');
  await app.locator('#event-restart').click();if(+await app.locator('#event-progress').inputValue()!==0)throw Error('Restart failed');
  await page.setViewportSize({width:390,height:844});await app.locator('#event-progress').fill('45');await page.screenshot({path:'output/playwright/qa-mobile-region.png'});
  const f=page.frames().find(f=>f.url().includes('lab=disasters'));
  if(await f.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Phone overflow');
  await app.getByRole('link',{name:'Tectonics',exact:true}).click();await page.waitForURL('**/index.html');
  if(await page.locator('[data-event]').count()!==4)throw Error('Main page menu');
  for(const [id,key] of Object.entries({eruption:'pinatubo',island:'kilauea',ridge:'rift'})){
    await page.locator(`[data-event="${id}"]`).click();await page.locator(`#event-surface[data-terrain="${key}"]`).waitFor();await page.locator('#event-progress').fill('80');
    await page.screenshot({path:`output/playwright/qa-main-${id}.png`});await page.locator('#event-exit').click();
    if(await page.locator('#event-surface').isVisible())throw Error('Exit failed '+id);
  }
  await page.locator('[data-event=ring]').click();await page.locator('#event-progress').fill('60');await page.locator('#event-exit').click();
  await page.setViewportSize({width:1440,height:1000});
  if(errors.length)throw Error(errors.join('\n'));
}
