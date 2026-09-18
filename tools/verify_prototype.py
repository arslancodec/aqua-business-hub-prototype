"""Browser smoke check for the static prototype. Run inside the project venv."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1050}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:5173')
    page.wait_for_selector('.welcome-banner')
    page.screenshot(path=str(ARTIFACTS / 'executive-desktop.png'), full_page=True, animations='disabled')
    pages = ['finance', 'procurement', 'engineering', 'people', 'aquaculture', 'assets', 'research', 'documents', 'approvals', 'risks', 'reports']
    checked_tabs = 0
    for module in pages:
        print('Checking ' + module, flush=True)
        page.locator(f'.nav-item[href="#/{module}"]').click()
        page.wait_for_function("m => document.querySelector('.nav-item.active')?.getAttribute('href') === '#/' + m", arg=module)
        page.wait_for_selector('.module-tabs')
        tabs = page.locator('.module-tabs button').all_text_contents()
        for index in range(len(tabs)):
            page.locator('.module-tabs button').nth(index).click()
            page.wait_for_selector('table')
            checked_tabs += 1
            if page.locator('.record-link').count():
                page.locator('.record-link').first.click()
                page.wait_for_selector('[role="dialog"]')
                page.locator('[data-action="detail-tab:Documents"]').click()
                assert page.locator('.document-row').count() == 3
                page.locator('[data-action="detail-tab:Activity"]').click()
                assert page.locator('.vertical-steps').count() == 1
                page.keyboard.press('Escape')
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), module

    page.locator('.nav-item[href="#/finance"]').click()
    page.locator('[data-action="tab:Payments"]').click()
    page.locator('#table-search').fill('National Feeds')
    assert page.locator('.record-link').count() == 1
    page.locator('#table-search').fill('no-such-record')
    assert page.locator('.empty-state').count() == 1
    page.locator('#table-search').fill('')
    page.locator('#status-filter').select_option('Paid')
    assert page.locator('.record-link').count() == 1
    page.locator('[data-action="create"]').click()
    page.locator('[name="field0"]').fill('PAY-2026-DEMO')
    page.locator('[name="field1"]').fill('AquaTech Engineering')
    page.locator('[name="field2"]').fill('240000')
    page.locator('#prototype-form [type="submit"]').click()
    assert 'No record has been saved' in page.locator('.success-preview').inner_text()
    page.keyboard.press('Escape')

    page.keyboard.press('Control+k')
    page.locator('#global-query').fill('tilapia')
    assert page.locator('.search-result').count() > 0
    page.locator('.search-result').first.click()
    assert 'Batch traceability' in page.locator('[role="dialog"]').inner_text()
    page.keyboard.press('Escape')

    page.locator('.nav-item[href="#/aquaculture"]').click()
    page.screenshot(path=str(ARTIFACTS / 'aquaculture-desktop.png'), full_page=True)
    page.locator('#hub-filter').select_option('Chakwal')
    assert page.locator('.record-link').count() == 1
    page.locator('#hub-filter').select_option('All project hubs')
    page.locator('[data-action="risk-alert"]').click()
    page.screenshot(path=str(ARTIFACTS / 'water-quality-drawer.png'), full_page=True)
    page.keyboard.press('Escape')

    page.locator('.nav-item[href="#/overview"]').click()
    page.locator('[data-action="export"]').click()
    page.screenshot(path=str(ARTIFACTS / 'report-preview.png'), full_page=True)
    page.keyboard.press('Escape')
    for tab in ['Financial performance', 'Operational health', 'Programme overview']:
        page.locator(f'[data-action="overview-tab:{tab}"]').click()
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(ARTIFACTS / 'executive-mobile.png'), full_page=True, animations='disabled')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile overview overflow'
    page.locator('.mobile-toggle').click()
    page.locator('.nav-item[href="#/aquaculture"]').click()
    page.wait_for_function("document.querySelector('.nav-item.active')?.getAttribute('href') === '#/aquaculture'")
    assert not page.locator('.sidebar').evaluate("e => e.classList.contains('mobile-open')")
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile module overflow'
    page.locator('.record-link').first.click()
    assert page.locator('[role="dialog"]').is_visible()
    page.keyboard.press('Escape')
    assert not errors, errors
    print(json.dumps({'modules_checked': len(pages), 'tabs_checked': checked_tabs, 'browser_errors': errors, 'desktop_and_mobile': 'passed', 'artifacts': str(ARTIFACTS)}, indent=2))
    browser.close()
