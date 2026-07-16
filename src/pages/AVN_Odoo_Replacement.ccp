@web
component AVNOdooReplacement
node main class=erp-container
  <!-- ERP Header -->
  node div class=erp-header
    node h1
      text "AVN Sovereign ERP (Odoo Open-Source Replacement)"
    endnode
    node div class=subtitle
      text "Modular Enterprise Resource Planning for Unions & Cooperatives"
    endnode
  endnode

  <!-- Left: ERP Sidebar Navigation -->
  node div class=erp-layout
    node nav class=erp-nav
      node ul
        node li class="nav-item active" data-mod="crm"
          text "🤝 CRM & Leads"
        endnode
        node li class="nav-item" data-mod="billing"
          text "💳 Invoicing & Billing"
        endnode
        node li class="nav-item" data-mod="inventory"
          text "📦 Tool & Stock Inventory"
        endnode
        node li class="nav-item" data-mod="hr"
          text "✊ HR & Union Registry"
        endnode
        node li class="nav-item" data-mod="tasks"
          text "📋 Task Kanban Board"
        endnode
      endnode
    endnode

    <!-- Right: Active Module Viewport -->
    node main class=erp-viewport
      
      <!-- Module 1: CRM -->
      node section id="mod-crm" class="module-view active"
        node h3
          text "Customer Relationship Management"
        endnode
        node div class=action-bar
          node input id=crm-name-input type=text placeholder="Lead Name"
          endnode
          node select id=crm-status-select
            node option value="new"
              text "New Lead"
            endnode
            node option value="contacted"
              text "Contacted"
            endnode
            node option value="won"
              text "Coop Agreement Signed"
            endnode
          endnode
          node button id=btn-add-lead class=btn-primary
            text "Add Lead"
          endnode
        endnode
        node div class=table-wrapper
          node table id=crm-table
            node tr
              node th
                text "Name"
              endnode
              node th
                text "Status"
              endnode
              node th
                text "Date Added"
              endnode
            endnode
            node tr
              node td
                text "Urban Farmers Association"
              endnode
              node td
                text "Coop Agreement Signed"
              endnode
              node td
                text "2026-07-15"
              endnode
            endnode
          endnode
        endnode
      endsection

      <!-- Module 2: Invoicing & Billing -->
      node section id="mod-billing" class="module-view"
        node h3
          text "Cooperative Invoices & Solidarity Dividends"
        endnode
        node div class=action-bar
          node input id=bill-client type=text placeholder="Client Name"
          endnode
          node input id=bill-amount type=number placeholder="Invoice Amount ($)"
          endnode
          node button id=btn-add-invoice class=btn-primary
            text "Generate Invoice"
          endnode
        endnode
        node div class=table-wrapper
          node table id=billing-table
            node tr
              node th
                text "Client"
              endnode
              node th
                text "Total Bill"
              endnode
              node th
                text "AVN 2% Dividend"
              endnode
              node th
                text "Status"
              endnode
            endnode
            node tr
              node td
                text "Solar Coop Installation"
              endnode
              node td
                text "$1,500.00"
              endnode
              node td
                text "$30.00"
              endnode
              node td
                text "Paid"
              endnode
            endnode
          endnode
        endnode
      endsection

      <!-- Module 3: Inventory -->
      node section id="mod-inventory" class="module-view"
        node h3
          text "Mutual Aid Tool-Belt & Collective Stock"
        endnode
        node div class=action-bar
          node input id=inv-item type=text placeholder="Tool/Asset Name"
          endnode
          node select id=inv-status
            node option value="available"
              text "Available for Lending"
            endnode
            node option value="checkedout"
              text "Checked Out (In Use)"
            endnode
          endnode
          node button id=btn-add-item class=btn-primary
            text "Register Asset"
          endnode
        endnode
        node div class=table-wrapper
          node table id=inventory-table
            node tr
              node th
                text "Tool / Good"
              endnode
              node th
                text "Status"
              endnode
              node th
                text "Location / Holder"
              endnode
            endnode
            node tr
              node td
                text "Heavy Rotary Hammer Drill"
              endnode
              node td
                text "Available for Lending"
              endnode
              node td
                text "Santa Cruz Warehouse"
              endnode
            endnode
          endnode
        endnode
      endsection

      <!-- Module 4: HR & Union Registry -->
      node section id="mod-hr" class="module-view"
        node h3
          text "Worker Registry & Co-op Union Tiers"
        endnode
        node div class=table-wrapper
          node table id=hr-table
            node tr
              node th
                text "Worker Name"
              endnode
              node th
                text "Role"
              endnode
              node th
                text "AVN Tier"
              endnode
              node th
                text "Benefits Pool Status"
              endnode
            endnode
            node tr
              node td
                text "Bob (Plumber)"
              endnode
              node td
                text "Maintenance Contractor"
              endnode
              node td
                text "Pro Employee-Member"
              endnode
              node td
                text "Active (Unioned)"
              endnode
            endnode
          endnode
        endnode
      endsection

      <!-- Module 5: Tasks Kanban Board -->
      node section id="mod-tasks" class="module-view"
        node h3
          text "Cooperative Kanban Dispatch"
        endnode
        node div class=kanban-board
          node div class=kanban-column id=col-todo
            node h4
              text "To Do (Open Aid Runs)"
            endnode
            node div class=kanban-cards id=todo-cards
              node div class=kanban-card
                text "Pick up solar batteries from port"
              endnode
            endnode
          endnode
          node div class=kanban-column id=col-progress
            node h4
              text "In Progress"
            endnode
            node div class=kanban-cards id=progress-cards
              node div class=kanban-card
                text "Setup secure chat for local grocery union"
              endnode
            endnode
          endnode
          node div class=kanban-column id=col-done
            node h4
              text "Completed Tasks"
            endnode
            node div class=kanban-cards id=done-cards
              node div class=kanban-card
                text "Draft bylaws for plumber guild"
              endnode
            endnode
          endnode
        endnode
      endsection

    endnode
  endnode

  node script type=text/javascript
    text "var navItems = document.querySelectorAll('.nav-item'); var modules = document.querySelectorAll('.module-view'); navItems.forEach(function(item) { item.addEventListener('click', function() { navItems.forEach(function(nav) { nav.classList.remove('active'); }); item.classList.add('active'); var target = item.getAttribute('data-mod'); modules.forEach(function(mod) { mod.classList.remove('active'); }); document.getElementById('mod-' + target).classList.add('active'); }); }); document.getElementById('btn-add-lead').addEventListener('click', function() { var name = document.getElementById('crm-name-input').value; var status = document.getElementById('crm-status-select').options[document.getElementById('crm-status-select').selectedIndex].text; if (!name) return; var table = document.getElementById('crm-table'); var row = table.insertRow(-1); row.insertCell(0).innerText = name; row.insertCell(1).innerText = status; row.insertCell(2).innerText = new Date().toISOString().split('T')[0]; document.getElementById('crm-name-input').value = ''; }); document.getElementById('btn-add-invoice').addEventListener('click', function() { var client = document.getElementById('bill-client').value; var amount = parseFloat(document.getElementById('bill-amount').value); if (!client || isNaN(amount)) return; var table = document.getElementById('billing-table'); var row = table.insertRow(-1); var div = amount * 0.02; row.insertCell(0).innerText = client; row.insertCell(1).innerText = '$' + amount.toFixed(2); row.insertCell(2).innerText = '$' + div.toFixed(2); row.insertCell(3).innerText = 'Pending'; document.getElementById('bill-client').value = ''; document.getElementById('bill-amount').value = ''; }); document.getElementById('btn-add-item').addEventListener('click', function() { var item = document.getElementById('inv-item').value; var status = document.getElementById('inv-status').options[document.getElementById('inv-status').selectedIndex].text; if (!item) return; var table = document.getElementById('inventory-table'); var row = table.insertRow(-1); row.insertCell(0).innerText = item; row.insertCell(1).innerText = status; row.insertCell(2).innerText = 'Shared Commons Pool'; document.getElementById('inv-item').value = ''; });"
  endnode
endnode

style main.erp-container
  display: block
  padding: 30px
  background: #080c14
  color: #f1f5f9
  font-family: 'Outfit', sans-serif
  border-radius: 20px
  border: 1px solid rgba(255,255,255,0.08)
  max-width: 1100px
  margin: auto
  box-shadow: 0 15px 45px rgba(0,0,0,0.5)
endstyle

style div.erp-header
  margin-bottom: 25px
  border-width: 0px 0px 1px 0px
  border-style: solid
  border-color: rgba(255,255,255,0.08)
  padding-bottom: 15px
endstyle

style div.erp-header h1
  font-family: 'Orbitron', sans-serif
  font-size: 2em
  color: #05c46b
  margin: 0
endstyle

style div.subtitle
  color: #94a3b8
  font-size: 0.95em
  margin-top: 5px
endstyle

style div.erp-layout
  display: flex
  gap: 30px
endstyle

style nav.erp-nav
  width: 250px
  border-right: 1px solid rgba(255,255,255,0.08)
  padding-right: 20px
endstyle

style nav.erp-nav ul
  list-style: none
  display: flex
  flex-direction: column
  gap: 12px
endstyle

style nav.erp-nav ul li
  padding: 12px 16px
  border-radius: 8px
  cursor: pointer
  font-family: 'Orbitron', sans-serif
  font-size: 13px
  font-weight: bold
  transition: all 0.2s
endstyle

style nav.erp-nav ul li:hover
  background: rgba(255,255,255,0.03)
endstyle

style nav.erp-nav ul li.active
  background: rgba(5, 196, 107, 0.08)
  border: 1px solid rgba(5, 196, 107, 0.2)
  color: #05c46b
endstyle

style main.erp-viewport
  flex: 1
endstyle

style section.module-view
  display: none
endstyle

style section.module-view.active
  display: block
endstyle

style section.module-view h3
  font-family: 'Orbitron', sans-serif
  font-size: 1.2em
  color: #00f2fe
  margin-bottom: 20px
endstyle

style div.action-bar
  display: flex
  gap: 12px
  margin-bottom: 20px
endstyle

style div.action-bar input
  background: #0d1527
  border: 1px solid rgba(255,255,255,0.08)
  padding: 10px
  border-radius: 6px
  color: #fff
  flex: 1
endstyle

style div.action-bar select
  background: #0d1527
  border: 1px solid rgba(255,255,255,0.08)
  padding: 10px
  border-radius: 6px
  color: #fff
endstyle

style button.btn-primary
  background: linear-gradient(135deg, #05c46b, #00d2d3)
  color: #fff
  border: none
  padding: 10px 20px
  border-radius: 6px
  font-family: 'Orbitron', sans-serif
  font-weight: bold
  cursor: pointer
  transition: all 0.2s
endstyle

style div.table-wrapper
  background: rgba(15, 23, 42, 0.4)
  border: 1px solid rgba(255,255,255,0.05)
  border-radius: 12px;
  overflow: hidden
endstyle

style table
  width: 100%
  border-collapse: collapse
endstyle

style th, style td
  padding: 14px
  text-align: left
  border-bottom: 1px solid rgba(255,255,255,0.05)
  font-size: 14px
endstyle

style th
  color: #94a3b8
  font-family: 'Orbitron', sans-serif
  font-size: 11px
  letter-spacing: 1px
endstyle

/* Kanban styles */
style div.kanban-board
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 15px
endstyle

style div.kanban-column
  background: rgba(15, 23, 42, 0.4)
  border: 1px solid rgba(255,255,255,0.05)
  border-radius: 12px
  padding: 15px
endstyle

style div.kanban-column h4
  margin-top: 0
  margin-bottom: 15px
  font-family: 'Orbitron', sans-serif
  font-size: 13px
  color: #ffc107
  border-width: 0px 0px 1px 0px
  border-style: solid
  border-color: rgba(255,255,255,0.08)
  padding-bottom: 8px
endstyle

style div.kanban-cards
  display: flex
  flex-direction: column;
  gap: 10px
endstyle

style div.kanban-card
  background: #101827
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 8px
  padding: 12px
  font-size: 13px;
  line-height: 1.5;
  cursor: grab
endstyle
endcomponent
@end
