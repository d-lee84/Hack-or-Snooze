// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesContainer = $('.stories-container');

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $allFavsList = $('#all-favs-list');

const $ownStoriesList = $("#own-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $newStorySection = $("#submit-story-container");
const $newStoryForm = $("#new-story-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navUserLinks = $("#nav-user-links");
const $navFavorites = $("#nav-favorites");
const $navOwnStories = $("#nav-own-stories");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $navUserLinks,
    $newStorySection,
    $allFavsList,
    $ownStoriesList
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // Clearing the page before initial load of stories
  hidePageComponents();

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
