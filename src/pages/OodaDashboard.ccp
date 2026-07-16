@web
component OodaDashboard
node main class=ooda-container
  node div class=header
    node h1
      text "AVN OODA Loop: User, Employee & Ads Manager"
    endnode
    node div class=subtitle
      text "Observe, Orient, Decide, Act on Site-wide Subscriptions & Payments"
    endnode
  endnode

  <!-- Grid Layout for OODA Steps -->
  node div class=grid
    <!-- OBSERVE CARD -->
    node div class=card id=card-observe
      node div class=card-label
        text "1. OBSERVE (User State)"
      endnode
      node div class=card-body
        node div class=input-group
          node label
            text "User Tier:"
          endnode
          node select id=select-user-tier
            node option value="free"
              text "Free Member"
            endnode
            node option value="pro"
              text "Pro Employee-Member"
            endnode
            node option value="admin"
              text "Co-op Admin/Staff"
            endnode
          endnode
        endnode
        node div class=input-group
          node label
            text "Active Ads Count:"
          endnode
          node span id=span-ads-count
            text "3 Active Ads"
          endnode
        endnode
      endnode
    endnode

    <!-- ORIENT CARD -->
    node div class=card id=card-orient
      node div class=card-label
        text "2. ORIENT (Aura & Rules)"
      endnode
      node div class=card-body
        node div class=orient-metric
          node span
            text "Health Pool Eligibility: "
          endnode
          node span id=orient-health class=status-badge
            text "Ineligible"
          endnode
        endnode
        node div class=orient-metric
          node span
            text "Ad Visibility Rule: "
          endnode
          node span id=orient-ads-status class=status-badge
            text "Show Public Ads"
          endnode
        endnode
      endnode
    endnode

    <!-- DECIDE CARD -->
    node div class=card id=card-decide
      node div class=card-label
        text "3. DECIDE (Resolutions)"
      endnode
      node div class=card-body
        node div class=decide-action
          node span
            text "Auto-Action: "
          endnode
          node span id=decide-action-text
            text "Inject Ad Banner"
          endnode
        endnode
        node div class=decide-action
          node span
            text "Billing Target: "
          endnode
          node span id=decide-billing-text
            text "$0/mo"
          endnode
        endnode
      endnode
    endnode

    <!-- ACT CARD -->
    node div class=card id=card-act
      node div class=card-label
        text "4. ACT (Execution)"
      endnode
      node div class=card-body
        node button id=btn-trigger-payment class=btn-primary
          text "Trigger Stripe / Wix Pay Upgrade"
        endnode
        node button id=btn-toggle-ads class=btn-secondary
          text "Toggle User Ad Spaces"
        endnode
      endnode
    endnode
  endnode

  <!-- Ad Space Management -->
  node div class=section-title
    text "ADVERTISING SPACE SOLDOUT PANEL"
  endnode
  node div class=ad-sales-container
    node div class=ad-input-group
      node label
        text "Sell Ad Space to User ($10/slot)"
      endnode
      node select id=select-ad-buyer
        node option value="plumber"
          text "Bob (Coop Plumber)"
        endnode
        node option value="gardener"
          text "Alice (Mutual Aid Gardener)"
        endnode
      endnode
      node button id=btn-buy-ad class=btn-accent
        text "Purchase Ad Slot"
      endnode
    endnode
    node div class=active-ads-board
      node h4
        text "Live Ads Shown on Free Feeds:"
      endnode
      node ul id=list-active-ads
        node li
          text "Bob's Coop Plumbing — Free tools lending"
        endnode
      endnode
    endnode
  endnode

  node script type=text/javascript
    text "var selectTier = document.getElementById('select-user-tier'); var spanAdsCount = document.getElementById('span-ads-count'); var orientHealth = document.getElementById('orient-health'); var orientAdsStatus = document.getElementById('orient-ads-status'); var decideActionText = document.getElementById('decide-action-text'); var decideBillingText = document.getElementById('decide-billing-text'); var btnPayment = document.getElementById('btn-trigger-payment'); var btnToggleAds = document.getElementById('btn-toggle-ads'); var btnBuyAd = document.getElementById('btn-buy-ad'); var selectAdBuyer = document.getElementById('select-ad-buyer'); var listActiveAds = document.getElementById('list-active-ads'); var ads = [\"Bob's Coop Plumbing — Free tools lending\"]; function runOodaLoop() { var tier = selectTier.value; if (tier === 'free') { orientHealth.innerText = 'Ineligible'; orientHealth.className = 'status-badge bg-red'; orientAdsStatus.innerText = 'Show Public Ads'; orientAdsStatus.className = 'status-badge bg-red'; decideActionText.innerText = 'Inject Ad Banner'; decideBillingText.innerText = '$0/mo'; btnPayment.innerText = 'Upgrade to Pro Employee-Member'; btnPayment.disabled = false; } else if (tier === 'pro') { orientHealth.innerText = 'Eligible (Pooled)'; orientHealth.className = 'status-badge bg-green'; orientAdsStatus.innerText = 'Hide Ads (Ad-Free)'; orientAdsStatus.className = 'status-badge bg-green'; decideActionText.innerText = 'Unlock Backoffice IT/HR'; decideBillingText.innerText = '$35/mo'; btnPayment.innerText = 'Manage Sub & Payments'; btnPayment.disabled = false; } else if (tier === 'admin') { orientHealth.innerText = 'Full Access (Staff)'; orientHealth.className = 'status-badge bg-purple'; orientAdsStatus.innerText = 'Audit Ad Feeds'; orientAdsStatus.className = 'status-badge bg-purple'; decideActionText.innerText = 'Process Admin Tickets'; decideBillingText.innerText = 'Paid from Treasury'; btnPayment.innerText = 'View Treasury Pool'; btnPayment.disabled = true; } spanAdsCount.innerText = ads.length + ' Active Ads'; } selectTier.addEventListener('change', runOodaLoop); btnBuyAd.addEventListener('click', function() { var buyer = selectAdBuyer.options[selectAdBuyer.selectedIndex].text; ads.push(buyer + ' — Local Mutual Support ad'); var li = document.createElement('li'); li.innerText = buyer + ' — Local Mutual Support ad'; listActiveAds.appendChild(li); runOodaLoop(); }); btnPayment.addEventListener('click', function() { alert('Connecting to Wix Pay API / Stripe portal for secure payment processing...'); }); runOodaLoop();"
  endnode
endnode

style main.ooda-container
  display: block
  padding: 30px
  background: #080c14
  color: #f1f5f9
  font-family: 'Outfit', sans-serif
  border-radius: 20px
  border: 1px solid rgba(255,255,255,0.08)
  max-width: 1000px
  margin: auto
  box-shadow: 0 15px 40px rgba(0,0,0,0.5)
endstyle

style div.header
  margin-bottom: 25px
  border-width: 0px 0px 1px 0px
  border-style: solid
  border-color: rgba(255,255,255,0.08)
  padding-bottom: 15px
endstyle

style div.header h1
  font-family: 'Orbitron', sans-serif
  font-size: 2em
  color: #00f2fe
  margin: 0
endstyle

style div.subtitle
  color: #94a3b8
  font-size: 0.95em
  margin-top: 5px
endstyle

style div.grid
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 20px
  margin-bottom: 30px
endstyle

style div.card
  background: rgba(15, 23, 42, 0.45)
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 16px
  padding: 20px
endstyle

style div.card-label
  font-family: 'Orbitron', sans-serif
  font-size: 0.85em
  color: #c084fc
  font-weight: bold
  margin-bottom: 15px
  letter-spacing: 1px;
endstyle

style div.input-group
  display: flex
  justify-content: space-between;
  align-items: center
  margin-bottom: 12px
endstyle

style div.input-group label
  font-size: 0.9em
  color: #94a3b8
endstyle

style div.input-group select
  background: #0d1527
  border: 1px solid rgba(255,255,255,0.08)
  padding: 8px
  border-radius: 6px
  color: #fff
endstyle

style div.orient-metric, style div.decide-action
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 12px
  font-size: 0.95em
endstyle

style span.status-badge
  padding: 3px 8px
  border-radius: 4px
  font-size: 0.8em
  font-weight: bold
endstyle

style .bg-red
  background: rgba(255, 94, 98, 0.2)
  color: #ff5e62
endstyle

style .bg-green
  background: rgba(5, 196, 107, 0.2)
  color: #05c46b
endstyle

style .bg-purple
  background: rgba(157, 78, 221, 0.2)
  color: #c084fc
endstyle

style button.btn-primary
  background: linear-gradient(135deg, #00f2fe, #4facfe)
  color: #fff
  border: none
  padding: 12px
  border-radius: 8px
  font-family: 'Orbitron', sans-serif
  font-weight: bold
  cursor: pointer
  width: 100%
  margin-bottom: 10px
  transition: all 0.2s
endstyle

style button.btn-secondary
  background: rgba(255,255,255,0.05)
  color: #fff
  border: 1px solid rgba(255,255,255,0.08)
  padding: 12px
  border-radius: 8px
  font-family: 'Orbitron', sans-serif
  font-weight: bold
  cursor: pointer
  width: 100%
  transition: all 0.2s
endstyle

style div.section-title
  font-family: 'Orbitron', sans-serif
  color: #05c46b
  font-size: 1.1em
  margin: 30px 0 15px 0
  border-width: 0px 0px 1px 0px
  border-style: solid
  border-color: rgba(255,255,255,0.08)
  padding-bottom: 8px
endstyle

style div.ad-sales-container
  display: grid
  grid-template-columns: 1fr 1.2fr
  gap: 20px
  background: rgba(255,255,255,0.02)
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 16px
  padding: 20px
endstyle

style div.ad-input-group
  display: flex
  flex-direction: column
  gap: 12px
endstyle

style div.ad-input-group label
  font-size: 0.9em
  color: #94a3b8
endstyle

style div.ad-input-group select
  background: #0d1527
  border: 1px solid rgba(255,255,255,0.08)
  padding: 10px
  border-radius: 6px
  color: #fff
endstyle

style button.btn-accent
  background: linear-gradient(135deg, #ff5e62, #ff9966)
  color: #fff
  border: none
  padding: 12px
  border-radius: 8px
  font-family: 'Orbitron', sans-serif
  font-weight: bold
  cursor: pointer
  transition: all 0.2s
endstyle

style div.active-ads-board
  background: #090d16
  border: 1px solid rgba(255,255,255,0.05)
  border-radius: 12px
  padding: 15px
endstyle

style div.active-ads-board h4
  margin-top: 0
  margin-bottom: 10px
  font-family: 'Orbitron', sans-serif
  font-size: 0.9em
  color: #ffc107
endstyle

style div.active-ads-board ul
  padding-left: 20px
  font-size: 0.9em
  line-height: 1.6
endstyle
endcomponent
@end
