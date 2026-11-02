// Drives the Anicca demo stage. MODE=dry → headless + checkpoint screenshots; MODE=rec → headed on Xvfb + ffmpeg capture.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const DIR = __dirname;
const MODE = process.env.MODE || 'dry';
const OUT = process.env.OUT || path.join(DIR, 'raw.mp4'); require('fs').mkdirSync(path.join(DIR, '.shots'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let shot = 0;
const T0 = { t: 0 };
const log = (m) => console.log(`[${((Date.now() - T0.t) / 1000).toFixed(1)}s] ${m}`);

(async () => {
  await fetch('http://localhost:8000/demo/reset', { method: 'POST' });
  const browser = await chromium.launch({
    headless: MODE !== 'rec',
    args: MODE === 'rec' ? ['--window-position=0,0', '--window-size=1920,1200', '--lang=pt-BR', '--no-first-run'] : [],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'pt-BR' });
  const page = await ctx.newPage(); globalThis.__page = page;
  await page.goto('file://' + path.join(DIR, 'stage.html'));
  const snap = async (name) => { if (MODE === 'dry') await page.screenshot({ path: path.join(DIR, '.shots', `${String(++shot).padStart(2, '0')}-${name}.png`) }); };

  const setSrc = (id, url) => page.evaluate(([id, url]) => (document.getElementById(id).src = url), [id, url]);
  await setSrc('wa', 'http://localhost:8000/whatsapp');
  await setSrc('rosa', 'http://localhost:8081/');
  await setSrc('lucas', 'http://127.0.0.1:8081/');
  await setSrc('doc', 'http://localhost:3000/dashboard');
  const fr = (id) => page.frameLocator('#' + id);
  const frame = async (id) => (await page.$('#' + id)).contentFrame();

  // Playwright ignores the CSS scale of the iframes, so map coordinates ourselves.
  const pt = async (id, loc) => {
    await loc.waitFor({ timeout: 20000 });
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const r = await loc.evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    const f = await page.$eval('#' + id, (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, s: b.width / el.offsetWidth }; });
    return { x: f.x + r.x * f.s, y: f.y + r.y * f.s };
  };
  const tap = async (id, loc, pause = 250, show = true) => {
    const { x, y } = await pt(id, loc);
    if (show) {
      await page.evaluate(([x, y]) => { const c = document.getElementById('cursor'); c.style.opacity = 1; c.style.left = x + 'px'; c.style.top = y + 'px'; }, [x, y]);
      await sleep(600);
      await page.evaluate(() => { const c = document.getElementById('cursor'); c.classList.remove('click'); void c.offsetWidth; c.classList.add('click'); });
    }
    await page.mouse.click(x, y);
    await page.mouse.move(30, 1060);
    await sleep(pause);
  };
  // ── setup (not recorded) ──
  const login = async (id, email) => {
    const f = fr(id);
    await f.getByText('JÁ TENHO UMA CONTA').waitFor({ timeout: 120000 }); await sleep(1500);
    for (let i = 0; i < 6 && !(await f.locator('input').count()); i++) {
      if (i % 2) await f.getByText('JÁ TENHO UMA CONTA').evaluate((el) => el.click());
      else await tap(id, f.getByText('JÁ TENHO UMA CONTA'), 0, false);
      await sleep(1500);
    }
    await f.locator('input').nth(0).fill(email);
    await f.locator('input').nth(1).fill('123456');
    for (let i = 0; i < 6 && !(await f.getByText('OLÁ,').count()); i++) {
      if (i % 2) await f.getByText(/^ENTRAR$/).last().evaluate((el) => el.click());
      else await tap(id, f.getByText(/^ENTRAR$/).last(), 0, false);
      await sleep(2500);
    }
    await f.getByText('OLÁ,').first().waitFor({ timeout: 30000 });
  };
  await login('rosa', 'rosa@anicca.demo');
  await login('lucas', 'lucas@anicca.demo');
  const waF = await frame('wa');
  await waF.waitForSelector('#input');
  await waF.addStyleTag({ content: `.panel{display:none!important} body{padding:0!important;background:transparent!important;min-height:0!important;height:100vh;overflow:hidden}
    .phone{height:100vh!important;width:390px!important;border-radius:52px!important;padding:12px!important;box-shadow:none!important} .screen{border-radius:42px!important}` });
  const docF = await frame('doc');
  await fr('doc').getByText('Bom dia, Dra. Sandra').waitFor({ timeout: 120000 });
  await docF.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  await sleep(2500);

  const hideCursor = () => page.evaluate(() => (document.getElementById('cursor').style.opacity = 0));
  const step = (n) => page.evaluate((n) => { for (let i = 1; i <= 4; i++) { const e = document.getElementById('s' + i); e.classList.toggle('on', i === n); e.classList.toggle('done', i < n); } }, n);
  const flash = (...ids) => page.evaluate((ids) => ids.forEach((id) => { const e = document.getElementById(id); e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }), ids);
  const wheel = async (id, dy, x = 0.5, y = 0.6) => {
    const bb = await (await page.$('#' + id)).boundingBox();
    await page.mouse.move(bb.x + bb.width * x, bb.y + bb.height * y);
    const n = Math.max(1, Math.round(Math.abs(dy) / 60));
    for (let i = 0; i < n; i++) { await page.mouse.wheel(0, Math.sign(dy) * 60); await sleep(16); }
    await sleep(150); await page.mouse.move(30, 1060);
  };
  const waType = async (text) => {
    const input = fr('wa').locator('#input');
    await tap('wa', input, 100);
    await input.pressSequentially(text, { delay: 42 });
    await sleep(350);
    await tap('wa', fr('wa').locator('button[title=Enviar]'), 0);
  };
  const waIdle = async () => { await sleep(400); await waF.waitForFunction(() => document.getElementById('presence').textContent === 'online' && document.getElementById('typing').style.display !== 'block', null, { timeout: 30000 }); };
  const pill = (t) => page.evaluate((t) => (document.getElementById('pillText').textContent = t), t);

  // Pre-position: Rosa's hub on "Meus Meds", Lucas on today's tasks.
  await wheel('rosa', 420); await wheel('lucas', 330);
  await hideCursor(); await page.mouse.move(1900, 1070);
  await sleep(1500);
  await snap('start');

  // ── recording ──
  let ff;
  const off = await page.evaluate(() => ({ top: window.outerHeight - window.innerHeight + window.screenY, left: window.screenX }));
  console.log('offset', off);
  if (MODE === 'rec') {
    ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'x11grab', '-framerate', '30', '-video_size', '1920x1080', '-draw_mouse', '0', '-i', `${process.env.DISPLAY}.0+${off.left},${off.top}`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
    await sleep(800);
  }
  T0.t = Date.now();

  // 1 — medicine via WhatsApp → patient and caregiver apps update
  await sleep(1500); await step(1); await sleep(1800);
  await waType('Bom dia, Ani! Tomei a Ondansetrona agora');
  await waIdle(); await sleep(600);
  await flash('fRosa', 'fLucas'); log('meds synced');
  await hideCursor();
  await sleep(3200); await snap('meds');
  await tap('rosa', fr('rosa').getByText('Rotina', { exact: true }).last(), 2600);
  await hideCursor(); await snap('rotina');

  // 2 — mole photo → computer vision → Body Map + SOAP
  await step(2); await sleep(900);
  await tap('wa', fr('wa').locator('#clip'), 700);
  if (!(await fr('wa').locator('button[data-attach=lesao]').isVisible())) { await fr('wa').locator('#clip').evaluate((el) => el.click()); await sleep(400); }
  await tap('wa', fr('wa').locator('button[data-attach=lesao]'), 500);
  await tap('rosa', fr('rosa').getByText('Ver sintomas →'), 1800);
  await snap('bodymap');
  await tap('rosa', fr('rosa').getByText('Costas', { exact: true }), 1200);
  await waIdle(); await flash('fRosa'); log('pinta synced');
  await hideCursor(); await sleep(2200);
  await snap('costas');
  await tap('rosa', fr('rosa').getByText('Histórico', { exact: true }), 1800);
  await snap('historico');
  await tap('rosa', fr('rosa').getByText(/Costas superiores/).first(), 2200);
  await snap('detalhe');
  await hideCursor();
  await wheel('rosa', 480); await sleep(2800);
  await snap('detalhe2');

  // 3 — fever → emergency protocol; caregiver sees it
  await step(3); await sleep(600);
  await waType('Estou com febre, 38,2');
  await waIdle(); await flash('fRosa', 'fLucas'); log('febre');
  await tap('lucas', fr('lucas').getByText('Rotina', { exact: true }).last(), 2800);
  await hideCursor(); await snap('febre');
  await wheel('wa', -200, 0.5, 0.5); await sleep(400); await wheel('wa', 400, 0.5, 0.5);
  await sleep(1800);

  // 4 — doctor panel
  await step(4); await sleep(1500);
  await page.evaluate(() => { document.getElementById('sceneA').classList.add('hidden'); document.getElementById('sceneB').classList.remove('hidden'); });
  await sleep(2800); await snap('painel');
  await pill('Alertas triados por gravidade, em tempo real');
  await tap('doc', fr('doc').getByText('Alertas', { exact: true }).first(), 3000);
  await hideCursor(); await snap('alertas');
  await wheel('doc', 360, 0.55, 0.5); await sleep(3000);
  await snap('alertas2');
  await pill('IA clínica com raciocínio e fontes (PubMed)');
  await tap('doc', fr('doc').getByText('Rosa Maria Andrade').first(), 1500);
  const ask = fr('doc').getByPlaceholder('Descreva a tarefa ou pergunta sobre este paciente...').first();
  await tap('doc', ask, 100);
  await ask.pressSequentially('E a pinta?', { delay: 70 });
  await sleep(400); await ask.press('Enter');
  await hideCursor();
  await sleep(5000); await snap('ia');
  await tap('doc', fr('doc').getByText('Fontes e Referências').last(), 600);
  await hideCursor();
  await wheel('doc', 500, 0.55, 0.5); await sleep(3800);
  await snap('ia2');
  await page.keyboard.press('Escape'); await sleep(500);
  const closeBtn = fr('doc').locator('button:has(svg.lucide-x)').last();
  if (await fr('doc').getByText('Fontes e Referências').count() > 1 && await closeBtn.count()) { await tap('doc', closeBtn, 500); }
  await pill('Ficha clínica: foto + nota S/O/A/P gerada pela Ani');
  await tap('doc', fr('doc').getByText('Ficha Clínica').first(), 1800);
  await hideCursor();
  await wheel('doc', 650, 0.85, 0.6); await sleep(4500);
  await snap('ficha');
  log('end');

  if (ff) { ff.stdin.write('q'); await new Promise((r) => ff.on('close', r)); }
  await browser.close();
})().catch(async (e) => { console.error(e); try { await globalThis.__page.screenshot({ path: path.join(DIR, 'fail.png') }); } catch {} process.exit(1); });
