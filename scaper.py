from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get('https://nhai.gov.in/#/official/officers-fields')

wait = WebDriverWait(driver, 15)
time.sleep(3)

# keep the browser open so you can see what's happening
input("navigate to the officers page manually, then press Enter here to scrape...")

# grab HTML after you've navigated
html = driver.page_source
driver.quit()

soup = BeautifulSoup(html, 'html.parser')
rows = soup.find_all('tr')

data = []
for row in rows:
    cols = row.find_all('td')
    if len(cols) >= 4:
        name = cols[0].text.strip()
        designation = cols[1].text.strip()
        cug = cols[2].text.strip()
        email_raw = cols[3].text.strip()
        email = email_raw.replace('[at]', '@').replace('[dot]', '.')
        data.append({
            'name': name,
            'designation': designation,
            'cug': cug,
            'email': email
        })

df = pd.DataFrame(data)
print(f"scraped {len(df)} rows")
print(df.head(10).to_string())
df.to_csv('nhai_officers.csv', index=False)