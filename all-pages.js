const HIDER = '???';
const TAB_UPDATED = 'TAB_UPDATED';

const isTextNode = (node) => node.nodeType != 1;

// Replace all heart counts on posts in the feed
const replaceFeedEngagement = () => {
    Array.from(document.querySelectorAll('.reactions-count span'))
        .forEach(engagement => {
            engagement.innerHTML = HIDER;
        }
    )
}

// Replace like counts on the left sidebar when viewing a post
const replacePostEngagement = () => {
    Array.from(document.querySelectorAll('.reaction-number'))
        .forEach(engagement => {
            engagement.innerHTML = HIDER;
        }
    )
}

// Remove like counts on related posts that load below a post
const replaceRelatedPostEngagement = () => {
    const relatedPosts = Array.from(document.querySelectorAll('.engagement-count') || []);
    relatedPosts.forEach(post => {
        // Children is a list of 5 nodes 
        // [blank text, heart image, engagement count, comment image, comment count]
        const children = post.childNodes;
        children.forEach((child, i) => {
            // We want to remove only the engagement count text node
            if (isTextNode(child) && i == 2) {
                child.replaceWith(HIDER);
            }
        });
    });
}

// Hide the icon on the bell showing how many notifications you've received
// TODO: this is untested, I need a notification first
const hideNotificationBell = () => {
    const notificationCount = document.querySelector('.notifications-number');
    notificationCount && notificationCount.remove();
}

// DASHBOARD -------------------

// Hide the top two rows on the dashboard completely
const hideDashboardStatistics = () => {
    const actions = document.querySelector('.dashboard-container .actions')
    actions && actions.remove();
    const analytics = document.querySelector('.dashboard-analytics-header-wrapper')
    analytics && analytics.remove();
}

// Hide the grey views / reactions / comments information on each post
const hideArticleStatistics = () => {
    const posts = document.querySelectorAll('.single-article');
    posts.forEach(post => {
        const indicator = post.querySelector('.dashboard-pageviews-indicator');
        indicator && indicator.remove();
    })
}

// NOTIFICATIONS PAGE ----------------

// Hide any notifications that contain "reacted to" or "followed you"
const hideReactNotifications = () => {
    const notifications = Array.from(document.querySelectorAll('.single-notification'));

    notifications
        .forEach(notification => {
            const reactionContent = notification.querySelector('.reaction-content');
            const children = reactionContent ? Array.from(reactionContent.childNodes) : [];
            loop:
            for (let node of children) {
                if (isTextNode(node) && node.nodeValue) {
                    const value = node.nodeValue;
                    if (value.includes('reacted to') || value.includes('followed you')) {
                        notification.remove();
                        break loop;
                    }
                }
            }
        }
    )
}

const replaceEverything = () => {
    replaceFeedEngagement();
    replacePostEngagement();
    replaceRelatedPostEngagement();
    hideNotificationBell();

    hideDashboardStatistics();
    hideArticleStatistics();

    hideReactNotifications();
}

// // Run only on initial page load
replaceEverything();

// Listen for user navigation and re-run the script
// and re-run the script accordingly.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      // message gets send from background.js
      if (request.message === TAB_UPDATED) {
        replaceEverything();
        // TODO: When navigating from feed to post, the counts don't get hidden
        // if you call the function right away. Not sure if it's being re-rendered?
        setTimeout(replaceEverything, 500);
      }
});
