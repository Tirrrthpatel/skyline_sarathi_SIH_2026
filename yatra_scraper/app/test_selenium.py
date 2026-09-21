from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def main():
    print("Starting Selenium...")

    options = Options()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(options=options)

    try:
        print("Opening Google...")

        driver.get("https://www.google.com")

        print("Browser opened successfully!")
        print("Page title:", driver.title)
        print("Current URL:", driver.current_url)

        input("\nPress ENTER to close Chrome...")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()