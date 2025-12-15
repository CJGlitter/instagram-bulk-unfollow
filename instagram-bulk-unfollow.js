// ==UserScript==
// @name         Instagram Bulk Unfollow
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Bulk unfollow Instagram accounts with checkboxes
// @author       You
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
        document.body.appendChild(button);
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

    // Wait for the follower/following dialog to open
    function waitForFollowerDialog() {
        // Check if dialog is already open
        const dialog = document.evaluate(
            '/html/body/div[5]/div[2]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (dialog) {
            // Dialog is already open
            startBulkMode();
        } else {
            // Wait for dialog to appear
            const dialogObserver = new MutationObserver((mutations, obs) => {
                const foundDialog = document.evaluate(
                    '/html/body/div[5]/div[2]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]',
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;

                if (foundDialog) {
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

            // Reset text after 3 seconds if dialog doesn't appear
            setTimeout(() => {
                if (!isActive || !observer) {
                    activateBtn.textContent = originalText;
                }
            }, 3000);
        }
    }

    // Start bulk mode - add checkboxes and observer
    function startBulkMode() {
        createBulkButton();
        addCheckboxes();

        // Start observing for new content
        observer = new MutationObserver(() => {
            if (isActive) {
                addCheckboxes();
            }
        });

        // Only observe the dialog container, not the entire body
        const dialog = document.evaluate(
            '/html/body/div[5]/div[2]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (dialog) {
            observer.observe(dialog, {
                childList: true,
                subtree: true
            });
        }
    }

    // Add checkboxes to follower rows
    function addCheckboxes() {
        // Find all follower/following buttons that say "Following"
        const followButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.trim() === 'Following'
        );

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
            }
        });

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
                    
                    // Wait before next unfollow (2-5 seconds)
                    if (i < checkedBoxes.length - 1) {
                        await randomDelay(2, 5);
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
        createActivateButton();
    }

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
