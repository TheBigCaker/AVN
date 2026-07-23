# Copyright (c) 2026 David Baker (Delta Vector) and the Sol Mech R&D team.
# Licensed under the Business Source License 1.1 (BSL 1.1). See LICENSE.md in the project root for license information.

import sys
import json
import msal
import requests

import os

CLIENT_ID = "04b07795-8ddb-461a-bbee-02f9e1bf7b46" # Public Azure CLI Client ID
AUTHORITY = "https://login.microsoftonline.com/common"
SCOPES = ["https://management.azure.com/user_impersonation"]
CACHE_FILE = "msal_cache.json"

def run_dns_update():
    cache = msal.SerializableTokenCache()
    if os.path.exists(CACHE_FILE):
        try:
            cache.deserialize(open(CACHE_FILE, "r").read())
        except Exception:
            pass

    app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY, token_cache=cache)
    
    result = None
    accounts = app.get_accounts()
    if accounts:
        print("Found cached account. Attempting silent token acquisition...")
        result = app.acquire_token_silent(scopes=SCOPES, account=accounts[0])

    if not result:
        # Initiate Device Code Flow
        flow = app.initiate_device_flow(scopes=SCOPES)
        if "user_code" not in flow:
            print("Failed to initiate device flow. Response:")
            print(json.dumps(flow, indent=2))
            return

        # Print the verification instructions for the user
        print("\n" + "="*60)
        print(flow["message"])
        print("="*60 + "\n")
        sys.stdout.flush()

        # Block and poll until the user signs in
        result = app.acquire_token_by_device_flow(flow)
        
    if "access_token" not in result:
        print("Authentication failed:")
        print(json.dumps(result, indent=2))
        return

    if cache.has_state_changed:
        try:
            with open(CACHE_FILE, "w") as f:
                f.write(cache.serialize())
        except Exception as e:
            print(f"Warning: Failed to save token cache: {e}")

    token = result["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("Successfully authenticated with Azure! Scanning for DNS Zone 'alt-vibe.net'...\n")

    # 1. Fetch all subscriptions
    sub_url = "https://management.azure.com/subscriptions?api-version=2020-01-01"
    sub_resp = requests.get(sub_url, headers=headers)
    if sub_resp.status_code != 200:
        print(f"Failed to fetch subscriptions: {sub_resp.text}")
        return
    
    subs = sub_resp.json().get("value", [])
    target_zone = None
    target_domain = None

    print(f"Found subscriptions: {[sub.get('displayName') for sub in subs]}")

    # 2. Iterate subscriptions to search for DNS zone or domain registration
    for sub in subs:
        sub_id = sub["subscriptionId"]
        sub_name = sub.get("displayName", sub_id)
        
        # A. Check for DNS zones
        dns_url = f"https://management.azure.com/subscriptions/{sub_id}/providers/Microsoft.Network/dnszones?api-version=2018-05-01"
        dns_resp = requests.get(dns_url, headers=headers)
        if dns_resp.status_code == 200:
            zones = dns_resp.json().get("value", [])
            for zone in zones:
                if zone["name"].lower() == "alt-vibe.net":
                    target_zone = zone
                    print(f"🟢 Found DNS Zone 'alt-vibe.net' in subscription: {sub_name}")
                    break
        
        # B. Check for App Service Domains (purchased via Microsoft)
        domains_url = f"https://management.azure.com/subscriptions/{sub_id}/providers/Microsoft.DomainRegistration/domains?api-version=2021-02-01"
        domains_resp = requests.get(domains_url, headers=headers)
        if domains_resp.status_code == 200:
            domains = domains_resp.json().get("value", [])
            for dom in domains:
                if dom["name"].lower() == "alt-vibe.net":
                    target_domain = dom
                    print(f"🟢 Found Domain Registration 'alt-vibe.net' in subscription: {sub_name}")
                    break
                    
        if target_zone or target_domain:
            break

    if not target_zone and not target_domain:
        print("❌ Error: Could not find DNS Zone or Domain Registration for 'alt-vibe.net' in any of your subscriptions.")
        return

    # 3. Perform the update
    if target_domain:
        domain_id = target_domain["id"]
        print(f"Updating Nameservers of Domain Registration to point to Vercel...")
        
        # Update nameservers to Vercel DNS
        patch_url = f"https://management.azure.com{domain_id}?api-version=2021-02-01"
        payload = {
            "properties": {
                "nameServers": [
                    "ns1.vercel-dns.com",
                    "ns2.vercel-dns.com"
                ]
            }
        }
        patch_resp = requests.patch(patch_url, headers=headers, json=payload)
        if patch_resp.status_code in (200, 201, 202):
            print("\n🟢 SUCCESS: Nameservers for 'alt-vibe.net' updated to Vercel (ns1.vercel-dns.com, ns2.vercel-dns.com) successfully!")
            return
        else:
            print(f"\n❌ Failed to update Domain Nameservers: {patch_resp.status_code} - {patch_resp.text}")
            
    if target_zone:
        zone_id = target_zone["id"]
        record_url = f"https://management.azure.com{zone_id}/A/@?api-version=2018-05-01"
        payload = {
            "properties": {
                "TTL": 3600,
                "ARecords": [
                    {"ipv4Address": "76.76.21.21"}
                ]
            }
        }
        print("Updating A record '@' in Azure DNS Zone to point to Vercel (76.76.21.21)...")
        put_resp = requests.put(record_url, headers=headers, json=payload)
        if put_resp.status_code in (200, 201):
            print("\n🟢 SUCCESS: A record '@' pointed to Vercel (76.76.21.21) successfully!")
        else:
            print(f"\n❌ Failed to update DNS Zone A record: {put_resp.status_code} - {put_resp.text}")

if __name__ == "__main__":
    run_dns_update()
