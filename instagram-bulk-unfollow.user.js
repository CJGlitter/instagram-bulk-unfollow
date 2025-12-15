// ==UserScript==
// @name         Instagram Bulk Unfollow
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @description  Bulk unfollow Instagram accounts with checkboxes
// @author       You
// @license      MIT
// @match        https://www.instagram.com/*
// @updateurl    https://raw.githubusercontent.com/CJGlitter/instagram-bulk-unfollow/refs/heads/main/instagram-bulk-unfollow.js
// @downloadurl  https://raw.githubusercontent.com/CJGlitter/instagram-bulk-unfollow/refs/heads/main/instagram-bulk-unfollow.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isProcessing = false;
    let isActive = false;
    let observer = null;

    // CSS for the UI elements
    const styles = `
        .bulk-unfollow-checkbox {
            margin-right: 10px;
            cursor: pointer;
            width: 18px;
            height: 18px;
        }
        .bulk-unfollow-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: #ed4956;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .bulk-unfollow-btn:hover {
            background: #c13344;
        }
        .bulk-unfollow-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .bulk-activate-btn {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: #0095f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .bulk-activate-btn:hover {
            background: #1877f2;
        }
        .bulk-activate-btn.active {
            background: #00ba34;
        }
        .bulk-activate-btn.active:hover {
            background: #00a82e;
        }
        .unfollow-loader {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ed4956;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 8px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create and add the activation button
    function createActivateButton() {
        if (document.getElementById('bulk-activate-btn')) return;

        const button = document.createElement('button');
        button.id = 'bulk-activate-btn';
        button.className = 'bulk-activate-btn';
        button.textContent = 'Activate Bulk Unfollow';
        button.onclick = toggleBulkMode;

        // Ensure body exists before appending
        if (document.body) {
            document.body.appendChild(button);
            console.log('Instagram Bulk Unfollow: Activation button added');
        } else {
            console.error('Instagram Bulk Unfollow: document.body not available');
        }
    }

    // Create and add the bulk unfollow button
    function createBulkButton() {
        if (document.getElementById('bulk-unfollow-btn')) return;

        const button = document.createElement('button');
        button.id = 'bulk-unfollow-btn';
        button.className = 'bulk-unfollow-btn';
        button.textContent = 'Unfollow Selected (0)';
        button.onclick = handleBulkUnfollow;
        document.body.appendChild(button);
    }

    // Toggle bulk mode on/off
    function toggleBulkMode() {
        const activateBtn = document.getElementById('bulk-activate-btn');

        if (isActive) {
            // Deactivate
            isActive = false;
            activateBtn.textContent = 'Activate Bulk Unfollow';
            activateBtn.classList.remove('active');

            // Stop observer
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            // Remove checkboxes and bulk button
            document.querySelectorAll('.bulk-unfollow-checkbox').forEach(cb => cb.remove());
            const bulkBtn = document.getElementById('bulk-unfollow-btn');
            if (bulkBtn) bulkBtn.remove();
        } else {
            // Activate
            isActive = true;
            activateBtn.textContent = 'Deactivate Bulk Unfollow';
            activateBtn.classList.add('active');

            // Wait for follower dialog and start adding checkboxes
            waitForFollowerDialog();
        }
    }

    // Find dialog using multiple methods
    function findFollowerDialog() {
        // Method 1: Try XPath
        const dialogXPath = document.evaluate(
            '/html/body/div[5]/div[2]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (dialogXPath) {
            console.log('Instagram Bulk Unfollow: Found dialog via XPath');
            return dialogXPath;
        }

        // Method 2: Look for role="dialog"
        const dialogRole = document.querySelector('[role="dialog"]');
        if (dialogRole) {
            console.log('Instagram Bulk Unfollow: Found dialog via role="dialog"');
            // Try to find the scrollable container inside
            const scrollContainer = dialogRole.querySelector('[style*="overflow"]');
            if (scrollContainer) {
                console.log('Instagram Bulk Unfollow: Found scroll container inside dialog');
                return scrollContainer;
            }
            return dialogRole;
        }

        // Method 3: Look for common dialog patterns
        const possibleDialogs = document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]');
        for (const el of possibleDialogs) {
            // Check if it contains "Following" buttons
            const hasFollowingButtons = el.querySelector('button')?.textContent.includes('Following');
            if (hasFollowingButtons) {
                console.log('Instagram Bulk Unfollow: Found dialog via fixed position + Following button');
                return el;
            }
        }

        console.log('Instagram Bulk Unfollow: No dialog found');
        return null;
    }

    // Wait for the follower/following dialog to open
    function waitForFollowerDialog() {
        console.log('Instagram Bulk Unfollow: Checking for dialog...');

        // Check if dialog is already open
        const dialog = findFollowerDialog();

        if (dialog) {
            // Dialog is already open
            console.log('Instagram Bulk Unfollow: Dialog already open, starting bulk mode');
            startBulkMode();
        } else {
            console.log('Instagram Bulk Unfollow: Dialog not found, waiting for it to appear...');

            // Wait for dialog to appear
            let checkCount = 0;
            const dialogObserver = new MutationObserver((mutations, obs) => {
                checkCount++;
                console.log(`Instagram Bulk Unfollow: Checking for dialog (attempt ${checkCount})...`);

                const foundDialog = findFollowerDialog();

                if (foundDialog) {
                    console.log('Instagram Bulk Unfollow: Dialog appeared! Starting bulk mode...');
                    obs.disconnect();
                    startBulkMode();
                }
            });

            dialogObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Show message to user
            const activateBtn = document.getElementById('bulk-activate-btn');
            const originalText = activateBtn.textContent;
            activateBtn.textContent = 'Waiting for follower dialog...';

            // Reset text after 10 seconds if dialog doesn't appear
            setTimeout(() => {
                if (!isActive || !observer) {
                    console.log('Instagram Bulk Unfollow: Timeout waiting for dialog');
                    activateBtn.textContent = originalText;
                    dialogObserver.disconnect();
                }
            }, 10000);
        }
    }

    // Start bulk mode - add checkboxes and observer
    function startBulkMode() {
        console.log('Instagram Bulk Unfollow: Starting bulk mode...');

        createBulkButton();
        addCheckboxes();

        // Start observing for new content
        observer = new MutationObserver(() => {
            if (isActive) {
                addCheckboxes();
            }
        });

        // Only observe the dialog container, not the entire body
        const dialog = findFollowerDialog();

        if (dialog) {
            console.log('Instagram Bulk Unfollow: Observing dialog for new followers...');
            observer.observe(dialog, {
                childList: true,
                subtree: true
            });
        } else {
            console.error('Instagram Bulk Unfollow: Could not find dialog to observe!');
        }
    }

    // Add checkboxes to follower rows
    function addCheckboxes() {
        console.log('Instagram Bulk Unfollow: Adding checkboxes...');

        // Find all follower/following buttons that say "Following"
        const followButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
            btn.textContent.trim() === 'Following'
        );

        console.log(`Instagram Bulk Unfollow: Found ${followButtons.length} "Following" buttons`);

        let addedCount = 0;
        followButtons.forEach(button => {
            // Check if checkbox already exists
            const parentDiv = button.closest('div[role="button"]')?.parentElement || button.parentElement;
            if (parentDiv && !parentDiv.querySelector('.bulk-unfollow-checkbox')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'bulk-unfollow-checkbox';
                checkbox.onchange = updateButtonCount;

                // Insert checkbox before the button
                parentDiv.insertBefore(checkbox, parentDiv.firstChild);
                addedCount++;
            }
        });

        console.log(`Instagram Bulk Unfollow: Added ${addedCount} new checkboxes`);
        updateButtonCount();
    }

    // Update the button text with count
    function updateButtonCount() {
        const button = document.getElementById('bulk-unfollow-btn');
        if (!button) return;

        const checkedCount = document.querySelectorAll('.bulk-unfollow-checkbox:checked').length;
        button.textContent = `Unfollow Selected (${checkedCount})`;
    }

    // Random delay between min and max seconds
    function randomDelay(min, max) {
        const delay = (Math.random() * (max - min) + min) * 1000;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Handle the bulk unfollow process
    async function handleBulkUnfollow() {
        if (isProcessing) return;

        const checkedBoxes = Array.from(document.querySelectorAll('.bulk-unfollow-checkbox:checked'));
        
        if (checkedBoxes.length === 0) {
            alert('Please select at least one account to unfollow');
            return;
        }

        const confirmed = confirm(`Are you sure you want to unfollow ${checkedBoxes.length} account(s)?`);
        if (!confirmed) return;

        isProcessing = true;
        const button = document.getElementById('bulk-unfollow-btn');
        button.disabled = true;
        
        // Add loading indicator
        const loader = document.createElement('span');
        loader.className = 'unfollow-loader';
        button.appendChild(loader);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < checkedBoxes.length; i++) {
            const checkbox = checkedBoxes[i];
            const parentDiv = checkbox.parentElement;
            const followingButton = parentDiv.querySelector('button');

            try {
                // Click the "Following" button
                followingButton.click();
                
                // Wait for the dialog to appear
                await randomDelay(0.5, 1);
                
                // Find and click the "Unfollow" confirmation button
                const unfollowButton = Array.from(document.querySelectorAll('button')).find(btn => 
                    btn.textContent.trim() === 'Unfollow'
                );
                
                if (unfollowButton) {
                    unfollowButton.click();
                    checkbox.checked = false;
                    checkbox.remove();
                    successCount++;
                    
                    // Update button text
                    button.firstChild.textContent = `Unfollowing... (${i + 1}/${checkedBoxes.length})`;

                    // Wait before next unfollow (3-8 seconds)
                    if (i < checkedBoxes.length - 1) {
                        await randomDelay(3, 8);
                    }
                } else {
                    failCount++;
                    // Close any open dialog
                    const closeButton = document.querySelector('svg[aria-label="Close"]');
                    if (closeButton) closeButton.closest('button').click();
                }
            } catch (error) {
                console.error('Error unfollowing:', error);
                failCount++;
            }
        }

        // Reset button
        loader.remove();
        button.disabled = false;
        button.textContent = 'Unfollow Selected (0)';
        isProcessing = false;

        alert(`Unfollow complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
    }

    // Initialize - only create the activation button
    function init() {
        console.log('Instagram Bulk Unfollow: Initializing...');
        console.log('Instagram Bulk Unfollow: readyState =', document.readyState);
        console.log('Instagram Bulk Unfollow: body exists =', !!document.body);

        // Try to create button immediately
        createActivateButton();

        // Also set up observer to re-add button if Instagram removes it
        const buttonObserver = new MutationObserver(() => {
            if (!document.getElementById('bulk-activate-btn')) {
                console.log('Instagram Bulk Unfollow: Button was removed, re-adding...');
                createActivateButton();
            }
        });

        if (document.body) {
            buttonObserver.observe(document.body, {
                childList: true,
                subtree: false
            });
        }
    }

    // Wait for page to load and retry initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also try after a short delay in case Instagram's React app clears everything
    setTimeout(init, 1000);
    setTimeout(init, 3000);
})();
