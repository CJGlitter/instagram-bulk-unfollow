# Instagram Bulk Unfollow

A Tampermonkey userscript that adds checkboxes to your Instagram following list, allowing you to select and unfollow multiple accounts at once.

## Features

- ✅ Add checkboxes next to accounts in your following list
- ✅ Select multiple accounts to unfollow at once
- ✅ Automatic random delays to avoid Instagram rate limits
- ✅ Simple activate/deactivate toggle
- ✅ Progress tracking during bulk unfollow

## Installation Guide for Beginners

### Step 1: Install Tampermonkey Extension

1. Open **Google Chrome** browser
2. Go to the [Tampermonkey Chrome Web Store page](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
3. Click the blue **"Add to Chrome"** button
4. When prompted, click **"Add extension"**
5. You should see a small Tampermonkey icon appear in your browser toolbar (top-right corner)

### Step 2: Install This Script

**Option A: Install from GitHub (Recommended)**

1. Click this link: [Install Script](https://raw.githubusercontent.com/CJGlitter/instagram-bulk-unfollow/main/instagram-bulk-unfollow.user.js)
2. Tampermonkey will automatically open and show you the script
3. Click the **"Install"** button
4. You're done!

**Option B: Manual Installation**

1. Click the Tampermonkey icon in your browser toolbar
2. Select **"Create a new script..."**
3. Delete all the example code that appears
4. Copy the entire contents of [instagram-bulk-unfollow.user.js](instagram-bulk-unfollow.user.js)
5. Paste it into the Tampermonkey editor
6. Click **File → Save** (or press Ctrl+S / Cmd+S)
7. Close the Tampermonkey tab

### Step 3: Verify Installation

1. Click the Tampermonkey icon in your browser toolbar
2. Select **"Dashboard"**
3. You should see **"Instagram Bulk Unfollow"** in your list of scripts
4. Make sure the toggle switch next to it is **green/enabled**

## How to Use

1. **Go to Instagram** and log into your account
2. **Navigate to your profile** and click on your **"Following"** list
3. You should see a blue **"Activate Bulk Unfollow"** button appear in the top-right corner
4. **Click the button** to activate the script (it will turn green and say "Deactivate Bulk Unfollow")
5. **Checkboxes** will appear next to each account you're following
6. **Select the accounts** you want to unfollow by checking the boxes
7. A red **"Unfollow Selected (X)"** button will appear in the bottom-right showing how many you've selected
8. **Click the red button** to start unfollowing
9. Confirm when prompted
10. Wait while the script automatically unfollows the selected accounts

### Tips

- The script uses **random delays (3-8 seconds)** between unfollows to avoid triggering Instagram's spam detection
- You can **scroll** through your following list to load more accounts and check more boxes before clicking "Unfollow Selected"
- Click **"Deactivate Bulk Unfollow"** when you're done to turn off the feature

## Important Safety Warnings

### About Third-Party Scripts

⚠️ **READ THIS CAREFULLY**

Tampermonkey userscripts run **powerful code** in your browser that can:
- Access your Instagram account
- Read your private messages
- Post on your behalf
- Access your passwords and cookies
- Modify web pages you visit

### Safety Guidelines

1. **Only install scripts from trusted sources**
   - Read the code before installing (if you know how to code)
   - Check reviews and ratings
   - Verify the script author's reputation

2. **This specific script:**
   - Only runs on instagram.com
   - Only adds checkboxes and unfollow functionality
   - Does NOT collect your data
   - Does NOT send information anywhere
   - The code is open-source and visible in this repository

3. **General best practices:**
   - Regularly review your installed scripts in Tampermonkey Dashboard
   - Remove scripts you no longer use
   - Keep Tampermonkey updated
   - Be cautious about scripts that request unusual permissions

4. **Use at your own risk:**
   - Bulk unfollowing may trigger Instagram's rate limits
   - Your account could be temporarily restricted
   - Instagram's policies may change
   - This script is provided as-is with no guarantees

### Instagram Rate Limits

Instagram may temporarily block you from following/unfollowing if you:
- Unfollow too many accounts too quickly
- Perform the action repeatedly in a short time period
- Use automation tools excessively

**Recommendations:**
- Don't unfollow more than 200 accounts per day
- Take breaks between bulk unfollow sessions
- The script includes random delays, but be sensible with usage

## Troubleshooting

### The buttons don't appear
- Refresh the Instagram page
- Make sure Tampermonkey is enabled (check the icon)
- Check that the script is enabled in Tampermonkey Dashboard

### Checkboxes don't show up
- Make sure you clicked "Activate Bulk Unfollow"
- Try closing and reopening the following dialog
- Scroll in the following list to trigger checkbox creation

### Script stops working
- Clear your browser cache
- Disable and re-enable the script
- Reinstall the script
- Check if Instagram updated their website (the script may need updating)

## Uninstalling

1. Click the Tampermonkey icon
2. Select **"Dashboard"**
3. Find **"Instagram Bulk Unfollow"** in the list
4. Click the **trash can icon** on the right
5. Confirm deletion

## Technical Details

- **Version:** 1.1.2
- **Compatible with:** Chrome + Tampermonkey
- **Works on:** instagram.com
- **Auto-updates:** Yes (from GitHub)

## License

This script is provided as-is for educational purposes. Use responsibly and at your own risk.

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Try reinstalling the script
3. Report bugs via GitHub Issues

---

**Disclaimer:** This is an unofficial tool not affiliated with Instagram or Meta. Automation may violate Instagram's Terms of Service. Use at your own discretion.
