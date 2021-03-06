/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();

  // If there is a user logged in, show nav bar
  if (currentUser) { $navUserLinks.show() };

}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserLinks.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Display new story form */

function navSubmitStoryClick(evt) {
  hidePageComponents();
  $newStorySection.show();
  $navUserLinks.show();
  $allStoriesList.show();
  putStoriesOnPage();
}

/** Event handler for submit link click
 * shows new story form on DOM
 */
$("#nav-submit").on("click", navSubmitStoryClick);


/** Handle Fav link click on Nav 
 * hides page elements
 * then shows fav list 
 */

function navFavClick(evt) {
  putFavsListOnPage();
}

/** Event handler for "favorites" click on navbar */

$navFavorites.on("click", navFavClick);


/** Handler for my stories link click
 * Hides pages components
 * shows nav bar links and own stories
 */

function navMyStories(evt) {
  putUserStoriesOnPage();
}

/**Event handler for My Stories navbar link click */

$navOwnStories.on("click", navMyStories);