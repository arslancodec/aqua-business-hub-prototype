from pathlib import Path
from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width':390,'height':844})
    page.goto('http://127.0.0.1:5173/#/aquaculture')
    page.wait_for_selector('.lifecycle')
    page.screenshot(path='artifacts/aquaculture-mobile.png', full_page=True, animations='disabled')
    print(json.dumps(page.evaluate('''() => ({width: innerWidth, document:document.documentElement.scrollWidth, elements:[...document.querySelectorAll('body *')].filter(e=>{let r=e.getBoundingClientRect();return r.right>innerWidth+1 && !e.closest('.table-scroll')}).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,text:e.textContent.slice(0,70)}))})'''), indent=2))
    browser.close()
