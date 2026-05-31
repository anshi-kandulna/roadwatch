import pandas as pd
import json
import re
import math

officers_df = pd.read_csv('nhai_officers.csv')
piu_df = pd.read_csv('piu_geocoded.csv')

# extract CUG numbers and match to PIU
def extract_numbers(cug_str):
    return re.findall(r'8\d{9}|[6-9]\d{9}', str(cug_str))

officers_df['numbers'] = officers_df['cug'].apply(extract_numbers)
officers_exploded = officers_df.explode('numbers').dropna(subset=['numbers'])
piu_df['piu_contact_clean'] = piu_df['piu_contact'].astype(str).str.extract(r'(\d{10})')[0]

piu_df = piu_df.merge(
    officers_exploded[['name', 'designation', 'email', 'numbers']],
    left_on='piu_contact_clean',
    right_on='numbers',
    how='left'
)

# build RO email lookup
ro_officers = officers_df[officers_df['designation'].str.contains(
    'Regional Officer|Chief General Manager', na=False
)]

def get_ro_email(email_str):
    if pd.isna(email_str):
        return ''
    emails = [e.strip() for e in str(email_str).split(',')]
    for e in emails:
        if e.startswith('ro'):
            return e
    return emails[0]

ro_officers = ro_officers.copy()
ro_officers['ro_email'] = ro_officers['email'].apply(get_ro_email)

ro_lookup = {}
for _, row in ro_officers.iterrows():
    email = row['ro_email']
    if email.startswith('ro'):
        city = email.replace('ro', '').split('@')[0]
        ro_lookup[city] = email

def get_ro_email_for_piu(ro_name):
    if pd.isna(ro_name):
        return ''
    city = ro_name.replace('RO-', '').lower().strip()
    city = city.replace(' ', '').replace('(hr)', '').replace('(pb)', '').replace('(up)', '')
    return ro_lookup.get(city, '')

piu_df['ro_email'] = piu_df['ro_name'].apply(get_ro_email_for_piu)

def get_best_email(row):
    if pd.notna(row.get('email')) and str(row.get('email', '')).strip():
        emails = [e.strip() for e in str(row['email']).split(',')]
        for e in emails:
            parts = e.split('@')[0] if '@' in e else ''
            if len(parts) <= 10:
                return e
        return emails[0]
    if row.get('ro_email'):
        return row['ro_email']
    return ''

piu_df['best_email'] = piu_df.apply(get_best_email, axis=1)

print(f"with email: {piu_df['best_email'].str.contains('@').sum()}/{len(piu_df)}")

piu_list = piu_df[['piu_city', 'piu_contact', 'ro_name', 'ro_contact',
                    'lat', 'lng', 'name', 'designation', 'best_email']].dropna(subset=['lat','lng']).to_dict('records')

# replace NaN with None before saving
def clean_record(record):
    return {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in record.items()}

piu_list = [clean_record(r) for r in piu_list]

with open('frontend/public/piu_locations.json', 'w') as f:
    json.dump(piu_list, f)

print(f"saved {len(piu_list)} PIUs to frontend/public/piu_locations.json")