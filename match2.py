from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import time
import pandas as pd

csv_df=pd.read_csv("GIS_cleaned.csv")
piu_df = csv_df[['piu_city', 'piu_contact', 'ro_name', 'ro_contact']].drop_duplicates()

geolocator = Nominatim(user_agent="roadwatch")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

def geocode_city(city):
    try:
        loc = geocode(f"{city}, India")
        if loc:
            return loc.latitude, loc.longitude
        return None, None
    except:
        return None, None

piu_df['lat'] = None
piu_df['lng'] = None

for idx, row in piu_df.iterrows():
    lat, lng = geocode_city(row['piu_city'])
    piu_df.at[idx, 'lat'] = lat
    piu_df.at[idx, 'lng'] = lng
    print(f"geocoded: {row['piu_city']} → {lat}, {lng}")

# step 3: save — you only need to do this once
piu_df.to_csv('piu_geocoded.csv', index=False)