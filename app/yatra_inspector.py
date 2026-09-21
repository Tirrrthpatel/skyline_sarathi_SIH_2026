from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import (
    WebDriverException,
    InvalidSessionIdException,
)
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


# ============================================================
# CONFIGURATION
# ============================================================

YATRA_URL = "https://www.yatra.com/flights"

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
SCREENSHOT_DIR = BASE_DIR / "screenshots"

RAW_DIR.mkdir(parents=True, exist_ok=True)
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# DRIVER
# ============================================================

def create_driver():

    options = Options()

    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1440,1000")

    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")

    driver = webdriver.Chrome(
        options=options
    )

    driver.set_page_load_timeout(45)

    return driver


# ============================================================
# CHECK BROWSER SESSION
# ============================================================

def browser_is_alive(driver):

    try:

        driver.current_url

        return True

    except (
        WebDriverException,
        InvalidSessionIdException
    ):

        return False


# ============================================================
# SAVE SNAPSHOT
# ============================================================

def save_snapshot(driver, prefix):

    if not browser_is_alive(driver):

        print(
            "\nBrowser session is no longer active."
        )

        return None

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    html_path = (
        RAW_DIR /
        f"{prefix}_{timestamp}.html"
    )

    screenshot_path = (
        SCREENSHOT_DIR /
        f"{prefix}_{timestamp}.png"
    )

    with open(
        html_path,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            driver.page_source
        )

    driver.save_screenshot(
        str(screenshot_path)
    )

    print("\nSnapshot saved:")

    print(
        "HTML:",
        html_path
    )

    print(
        "Screenshot:",
        screenshot_path
    )

    return html_path


# ============================================================
# PAGE INFORMATION
# ============================================================

def print_page_information(driver):

    print("\n")
    print("=" * 70)
    print("PAGE INFORMATION")
    print("=" * 70)

    print(
        "\nCurrent URL:"
    )

    print(
        driver.current_url
    )

    print(
        "\nPage title:"
    )

    print(
        driver.title
    )


# ============================================================
# INSPECT INPUTS
# ============================================================

def inspect_inputs(driver):

    print("\n")
    print("=" * 70)
    print("INPUT ELEMENTS")
    print("=" * 70)

    inputs = driver.find_elements(
        By.TAG_NAME,
        "input"
    )

    print(
        "Total inputs:",
        len(inputs)
    )

    for index, element in enumerate(inputs):

        try:

            print(
                f"\nINPUT [{index}]"
            )

            print(
                "type:",
                element.get_attribute("type")
            )

            print(
                "name:",
                element.get_attribute("name")
            )

            print(
                "id:",
                element.get_attribute("id")
            )

            print(
                "class:",
                element.get_attribute("class")
            )

            print(
                "placeholder:",
                element.get_attribute("placeholder")
            )

            print(
                "value:",
                element.get_attribute("value")
            )

            print(
                "aria-label:",
                element.get_attribute("aria-label")
            )

        except WebDriverException:

            print(
                "Could not inspect this input."
            )


# ============================================================
# INSPECT BUTTONS
# ============================================================

def inspect_buttons(driver):

    print("\n")
    print("=" * 70)
    print("BUTTON ELEMENTS")
    print("=" * 70)

    buttons = driver.find_elements(
        By.TAG_NAME,
        "button"
    )

    print(
        "Total buttons:",
        len(buttons)
    )

    for index, element in enumerate(buttons):

        try:

            print(
                f"\nBUTTON [{index}]"
            )

            print(
                "text:",
                repr(element.text.strip())
            )

            print(
                "id:",
                element.get_attribute("id")
            )

            print(
                "class:",
                element.get_attribute("class")
            )

            print(
                "aria-label:",
                element.get_attribute("aria-label")
            )

        except WebDriverException:

            print(
                "Could not inspect this button."
            )


# ============================================================
# VISIBLE TEXT
# ============================================================

def inspect_visible_text(driver):

    print("\n")
    print("=" * 70)
    print("VISIBLE PAGE TEXT")
    print("=" * 70)

    body = driver.find_element(
        By.TAG_NAME,
        "body"
    )

    text = body.text.strip()

    print(
        text[:15000]
    )


# ============================================================
# RESULT CARDS
# ============================================================

def inspect_flight_cards(driver):

    print("\n")
    print("=" * 70)
    print("FLIGHT RESULT CARDS")
    print("=" * 70)

    cards = driver.find_elements(
        By.CSS_SELECTOR,
        "div.flightItem"
    )

    print(
        "Flight cards found:",
        len(cards)
    )

    for index, card in enumerate(
        cards[:10],
        start=1
    ):

        try:

            print(
                f"\n--- FLIGHT CARD {index} ---"
            )

            print(
                card.text[:1500]
            )

        except WebDriverException:

            print(
                "Could not inspect card."
            )


# ============================================================
# MAIN
# ============================================================

def main():

    driver = None

    try:

        print("=" * 70)

        print(
            "SIH26056 - YATRA DOM INSPECTOR"
        )

        print("=" * 70)

        # ----------------------------------------------------
        # Create browser
        # ----------------------------------------------------

        print(
            "\nStarting Chrome..."
        )

        driver = create_driver()

        print(
            "Chrome started successfully."
        )

        # ----------------------------------------------------
        # Open Yatra
        # ----------------------------------------------------

        print(
            "\nOpening Yatra..."
        )

        driver.get(
            YATRA_URL
        )

        WebDriverWait(
            driver,
            20
        ).until(
            lambda d:
            d.execute_script(
                "return document.readyState"
            )
            in [
                "interactive",
                "complete"
            ]
        )

        print(
            "Yatra page loaded."
        )

        print_page_information(
            driver
        )

        # ----------------------------------------------------
        # Initial inspection
        # ----------------------------------------------------

        inspect_inputs(
            driver
        )

        inspect_buttons(
            driver
        )

        inspect_visible_text(
            driver
        )

        save_snapshot(
            driver,
            "yatra_home"
        )

        # ----------------------------------------------------
        # Manual search
        # ----------------------------------------------------

        print("\n")
        print("=" * 70)
        print("MANUAL SEARCH")
        print("=" * 70)

        print(
            """
Use the Chrome browser.

Perform:

1. One Way
2. From: New Delhi (DEL)
3. To: Mumbai (BOM)
4. Select a future travel date
5. 1 Traveller
6. Economy
7. Click Search

IMPORTANT:
Do NOT close Chrome.

Wait until the flight result cards are
completely visible.

Then come back to this terminal.
"""
        )

        input(
            "\nPress ENTER only AFTER results are visible..."
        )

        # ----------------------------------------------------
        # Check browser
        # ----------------------------------------------------

        print(
            "\nChecking Chrome session..."
        )

        if not browser_is_alive(driver):

            print(
                "\nERROR: Chrome was closed."
            )

            print(
                "Please run the program again "
                "and keep Chrome open."
            )

            return

        print(
            "Chrome session is alive."
        )

        # ----------------------------------------------------
        # Wait for flight cards
        # ----------------------------------------------------

        print(
            "\nWaiting for flight cards..."
        )

        WebDriverWait(
            driver,
            30
        ).until(
            lambda d:
            len(
                d.find_elements(
                    By.CSS_SELECTOR,
                    "div.flightItem"
                )
            ) > 0
        )

        print(
            "Flight cards detected."
        )

        # ----------------------------------------------------
        # Save result page
        # ----------------------------------------------------

        save_snapshot(
            driver,
            "yatra_results"
        )

        # ----------------------------------------------------
        # Inspect results
        # ----------------------------------------------------

        print_page_information(
            driver
        )

        inspect_flight_cards(
            driver
        )

        inspect_visible_text(
            driver
        )

        # ----------------------------------------------------
        # Finished
        # ----------------------------------------------------

        print("\n")
        print("=" * 70)
        print("INSPECTION SUCCESSFUL")
        print("=" * 70)

        print(
            """
The current Yatra result DOM has been captured.

You can now close Chrome manually.
"""
        )

        input(
            "\nPress ENTER to finish the Python program..."
        )

    except InvalidSessionIdException:

        print(
            "\nChrome session disappeared."
        )

    except WebDriverException as error:

        print(
            "\nWebDriver error:"
        )

        print(
            error
        )

    except Exception as error:

        print(
            "\nUnexpected error:"
        )

        print(
            type(error).__name__
        )

        print(
            error
        )

    finally:

        if driver is not None:

            try:

                if browser_is_alive(driver):

                    driver.quit()

                    print(
                        "\nChrome closed by Python."
                    )

            except Exception:

                pass


if __name__ == "__main__":

    main()