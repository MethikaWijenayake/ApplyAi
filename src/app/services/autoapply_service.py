"""
Auto-apply engine using Playwright.

Supports:
  - LinkedIn Easy Apply
  - Indeed Apply

Results stored in job_applications table:
  apply_result: 'success' | 'failed' | 'manual_required'

To use: install playwright browsers once with:
  playwright install chromium
"""

import asyncio
from typing import Optional


async def auto_apply(
    job_url: str,
    job_title: str,
    company: str,
    resume_data: dict,
    user_email: str,
    user_name: str,
) -> dict:
    """
    Attempt to auto-apply to a job.
    Returns result dict with status, method used, and any error.
    """
    url_lower = job_url.lower()

    if "linkedin.com" in url_lower:
        return await _apply_linkedin(job_url, resume_data, user_email, user_name)
    elif "indeed.com" in url_lower:
        return await _apply_indeed(job_url, resume_data, user_email, user_name)
    else:
        return {
            "status": "manual_required",
            "method": "unknown",
            "error": "Unsupported job board. Only LinkedIn and Indeed are currently supported.",
        }


async def _apply_linkedin(
    job_url: str, resume_data: dict, user_email: str, user_name: str
) -> dict:
    """LinkedIn Easy Apply automation."""
    try:
        from playwright.async_api import async_playwright, TimeoutError as PWTimeout

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = await context.new_page()

            try:
                await page.goto(job_url, timeout=15000)
                await page.wait_for_load_state("domcontentloaded")

                # Look for Easy Apply button
                easy_apply_btn = page.locator("button:has-text('Easy Apply'), .jobs-apply-button")
                if not await easy_apply_btn.count():
                    return {
                        "status": "manual_required",
                        "method": "linkedin",
                        "error": "No Easy Apply button found. External application required.",
                    }

                await easy_apply_btn.first.click()
                await page.wait_for_timeout(2000)

                # Fill contact info if fields present
                name_parts = user_name.split(" ", 1)
                first = name_parts[0]
                last = name_parts[1] if len(name_parts) > 1 else ""

                for selector, value in [
                    ("input[name='firstName'], input[id*='first']", first),
                    ("input[name='lastName'], input[id*='last']", last),
                    ("input[type='email']", user_email),
                    ("input[name='phoneNumber'], input[type='tel']", resume_data.get("phone", "")),
                ]:
                    try:
                        field = page.locator(selector).first
                        if await field.count() and await field.is_visible():
                            await field.clear()
                            await field.fill(value)
                    except Exception:
                        pass

                # Check for multi-step — look for Next/Submit
                next_btn = page.locator("button:has-text('Next'), button:has-text('Review')")
                submit_btn = page.locator("button:has-text('Submit application')")

                # Navigate through steps (max 5)
                for _ in range(5):
                    if await submit_btn.count() and await submit_btn.is_visible():
                        await submit_btn.click()
                        await page.wait_for_timeout(2000)
                        return {"status": "success", "method": "linkedin_easy_apply"}

                    if await next_btn.count() and await next_btn.first.is_visible():
                        await next_btn.first.click()
                        await page.wait_for_timeout(1500)
                    else:
                        break

                # Check for success confirmation
                success_indicators = [
                    "Your application was sent",
                    "Application submitted",
                    "applied",
                ]
                page_text = await page.content()
                if any(ind.lower() in page_text.lower() for ind in success_indicators):
                    return {"status": "success", "method": "linkedin_easy_apply"}

                return {
                    "status": "manual_required",
                    "method": "linkedin",
                    "error": "Could not complete all required steps automatically.",
                }

            except PWTimeout:
                return {
                    "status": "failed",
                    "method": "linkedin",
                    "error": "Page load timed out.",
                }
            finally:
                await browser.close()

    except ImportError:
        return {
            "status": "failed",
            "method": "linkedin",
            "error": "Playwright not installed. Run: playwright install chromium",
        }
    except Exception as e:
        return {"status": "failed", "method": "linkedin", "error": str(e)}


async def _apply_indeed(
    job_url: str, resume_data: dict, user_email: str, user_name: str
) -> dict:
    """Indeed application automation."""
    try:
        from playwright.async_api import async_playwright, TimeoutError as PWTimeout

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )
            page = await context.new_page()

            try:
                await page.goto(job_url, timeout=15000)
                await page.wait_for_load_state("domcontentloaded")

                # Indeed apply button
                apply_btn = page.locator(
                    "button:has-text('Apply now'), "
                    "a:has-text('Apply now'), "
                    "#indeedApplyButton, "
                    ".indeed-apply-button"
                )

                if not await apply_btn.count():
                    return {
                        "status": "manual_required",
                        "method": "indeed",
                        "error": "No Indeed Apply button found.",
                    }

                await apply_btn.first.click()
                await page.wait_for_timeout(2000)

                # Fill basic fields
                name_parts = user_name.split(" ", 1)
                for selector, value in [
                    ("input[name='applicant.name'], input[autocomplete='name']", user_name),
                    ("input[name='applicant.firstName']", name_parts[0]),
                    ("input[name='applicant.lastName']", name_parts[1] if len(name_parts) > 1 else ""),
                    ("input[type='email'], input[name='applicant.emailAddress']", user_email),
                    ("input[type='tel'], input[name='applicant.phoneNumber']", resume_data.get("phone", "")),
                ]:
                    try:
                        field = page.locator(selector).first
                        if await field.count() and await field.is_visible():
                            await field.clear()
                            await field.fill(value)
                    except Exception:
                        pass

                # Step through form
                for _ in range(6):
                    continue_btn = page.locator(
                        "button:has-text('Continue'), "
                        "button:has-text('Next'), "
                        "button[type='submit']:has-text('Submit')"
                    )
                    submit_final = page.locator(
                        "button:has-text('Submit your application'), "
                        "button:has-text('Submit application')"
                    )

                    if await submit_final.count() and await submit_final.is_visible():
                        await submit_final.click()
                        await page.wait_for_timeout(2000)
                        return {"status": "success", "method": "indeed_apply"}

                    if await continue_btn.count() and await continue_btn.first.is_visible():
                        await continue_btn.first.click()
                        await page.wait_for_timeout(1500)
                    else:
                        break

                page_text = await page.content()
                if any(w in page_text.lower() for w in ["application submitted", "you applied", "thank you for applying"]):
                    return {"status": "success", "method": "indeed_apply"}

                return {
                    "status": "manual_required",
                    "method": "indeed",
                    "error": "Form requires manual input (captcha, custom questions, or login required).",
                }

            except PWTimeout:
                return {"status": "failed", "method": "indeed", "error": "Page timed out."}
            finally:
                await browser.close()

    except ImportError:
        return {
            "status": "failed",
            "method": "indeed",
            "error": "Playwright not installed. Run: playwright install chromium",
        }
    except Exception as e:
        return {"status": "failed", "method": "indeed", "error": str(e)}
