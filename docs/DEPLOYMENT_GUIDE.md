# Deployment Guide

## How to Add These Files to Your Wix Site

### Method 1: Manual Copy/Paste (Recommended for Beginners)

#### Step 1: Enable Velo
1. Open your Wix site in the Wix Editor
2. Click **Dev Mode** toggle in the top menu bar
3. This opens the Velo code panel on the left

#### Step 2: Add Backend Code
1. In Velo sidebar, expand the **Backend** folder
2. Click the **+** icon next to Backend
3. Select **New .jsw File**
4. Name it: `subscriptionChecker`
5. Open the file `/wix-velo-code/backend/subscriptionChecker.jsw` from this folder
6. **Copy all the code**
7. **Paste** it into your new Wix file
8. Press **Ctrl+S** (or Cmd+S on Mac) to save

#### Step 3: Add Page Code
1. In the Wix Editor, select the **page** where you want ad management (e.g., Home)
2. Click the **{}** icon at the top of the Velo sidebar (Page Code)
3. This opens the code editor for that page
4. Open the file `/wix-velo-code/pages/Home.js` from this folder
5. **Copy the content** (starting from the import statements)
6. **Paste** it into your page code
   - If there's already an `$w.onReady` function, merge the code inside
   - Replace the entire file if it's empty
7. **Important**: Update the AdSense element IDs:
   ```javascript
   const adElements = [
     '#adsenseTop',      // Change to your actual element ID
     '#adsenseSidebar',  // Change to your actual element ID
     // etc.
   ];
   ```
8. Save the file

#### Step 4: Add Site-Wide Code (Optional)
1. In Velo sidebar, look for **Site** tab (or create it)
2. Open the file `/wix-velo-code/pages/Site.js`
3. Copy and paste the code
4. Save

#### Step 5: Test
1. Click **Preview** in the top right
2. Open browser console (F12)
3. Check for console logs showing subscription tier
4. Verify ads show/hide correctly

---

### Method 2: Using Wix CLI (Advanced)

#### Prerequisites
- Node.js and npm installed
- Wix CLI installed: `npm install -g @wix/cli`
- Git configured with access to your Wix GitHub repo

#### Steps
1. **Clone your Wix site repository**
   ```bash
   git clone git@github.com:YourUsername/TFTM_Wix.git
   cd TFTM_Wix
   ```

2. **Copy the Velo code files**
   ```bash
   # Copy backend code
   cp /path/to/wix-velo-code/backend/subscriptionChecker.jsw ./backend/
   
   # Copy page code (you'll need to integrate this into your existing pages)
   # Note: Page code structure depends on your Wix site setup
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Test locally**
   ```bash
   wix dev
   ```
   This opens a local preview of your site

5. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Add subscription and ad management system"
   git push origin main
   ```

6. **Sync with Wix**
   - Changes pushed to GitHub automatically sync with your Wix site
   - You may need to re-publish your site in the Wix Editor

---

### Method 3: Using Replit (If GitHub Connected)

If you have GitHub connected to your Replit account:

1. **In Replit, open the terminal**
2. **Navigate to the wix-velo-code folder**
   ```bash
   cd wix-velo-code
   ```

3. **Initialize git and add your Wix repo as remote**
   ```bash
   git init
   git remote add wix git@github.com:TheBigCaker/TFTM_Wix.git
   ```

4. **Pull the latest from your Wix repo**
   ```bash
   git pull wix main
   ```

5. **Copy files into the correct structure**
   ```bash
   # This depends on your Wix repo structure
   cp backend/subscriptionChecker.jsw ../path/to/wix/backend/
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Add subscription system"
   git push wix main
   ```

---

## After Deployment

### 1. Configure Pricing Plans
- Follow instructions in `PRICING_PLANS_SETUP.md`
- Create Free, Education, and Pro plans in Wix Dashboard

### 2. Add AdSense Elements
- Install Wix Monetize with AdSense app
- Place AdSense elements on your pages
- Assign IDs that match your code

### 3. Update Plan IDs
In `PricingPage.js`, update the plan IDs:
```javascript
function getPlanIdForType(planType) {
  switch (planType) {
    case 'EDUCATION':
      return 'abc123...';  // Get this from Wix Dashboard
    case 'PRO':
      return 'xyz789...';  // Get this from Wix Dashboard
    default:
      return null;
  }
}
```

To find Plan IDs:
1. Go to Wix Dashboard → Pricing Plans
2. Click on a plan
3. Look in the URL or plan settings for the ID

### 4. Test Thoroughly
- Test as logged-out user (should see ads)
- Test as logged-in free user (should see ads)
- Test with test subscriptions (ads should hide)

### 5. Publish
- Click **Publish** in Wix Editor
- Your subscription system is now live!

---

## Updating Code Later

To make changes after initial deployment:

### Using Wix Editor (Easiest)
1. Open your site in Wix Editor
2. Turn on Dev Mode
3. Edit the files directly in the Velo sidebar
4. Save and publish

### Using CLI/Git
1. Pull latest changes from your Wix repo
2. Make edits locally
3. Test with `wix dev`
4. Commit and push
5. Republish in Wix Editor

---

## File Mapping

Here's where each file should go in your Wix site:

| This Folder | Wix Site Location |
|-------------|-------------------|
| `backend/subscriptionChecker.jsw` | `Backend/subscriptionChecker.jsw` |
| `pages/Home.js` | `Pages/Home (Home)/Home.js` |
| `pages/Site.js` | `Site/Site.js` |
| `pages/PricingPage.js` | `Pages/Pricing (pricing)/Pricing.js` |

Note: Exact paths depend on your Wix site structure.

---

## Troubleshooting Deployment

### "Cannot find module 'backend/subscriptionChecker'"
- Make sure the backend file is in the `Backend` folder
- Check the filename is exactly `subscriptionChecker.jsw`
- Try republishing your site

### Code not updating in preview
- Clear browser cache
- Close and reopen Dev Mode
- Refresh the preview

### Git conflicts
- Pull latest changes first: `git pull wix main`
- Resolve conflicts manually
- Commit and push again

---

## Important Reminders

✅ Always test in **Test Mode** before accepting real payments
✅ Keep a backup of your code before major changes
✅ Don't commit API keys or secrets to Git (Wix manages these automatically)
✅ Test on multiple devices and browsers
✅ Enable error logging in production for easier debugging

---

Need help? Check the troubleshooting section in `PRICING_PLANS_SETUP.md` or the Wix Velo documentation.
