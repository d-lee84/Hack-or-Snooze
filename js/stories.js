// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  let starClass = (currentUser)
    ? "far fa-star"
    : "";

  return $(`
      <li id="${story.storyId}">
        <i class ="${starClass}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
/** Called when the user is logged in, and updates the stories
 *  if they are in the favorites list for the user
 */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $allFavsList.empty();
  $ownStoriesList.empty();


  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  // Check if you are logged in
  if (currentUser) { putFavStarsOnStories() };

  $allStoriesList.show();
}


/** If a user is logged in, put the corresponding star or fav 
 *  star on all the stories
*/

function putFavStarsOnStories() {

  // Loop over the favorites list of the user
  for (let story of currentUser.favorites) {
    // Find the li element by using the story id
    let $star = $(`#${story.storyId} > i.fa-star`);

    // Change the star to fas-star (remove far-star class)
    $star.attr("class", "fas fa-star");
  }
}

/**Handling new story form submission
 * 
 * collect form data in object {author, title, url}
 * POST new story via add story method, using currentUser and form data object
 * update the DOM with new list of stories
 */

async function submitNewStory(evt) {
  evt.preventDefault();

  // Story form data
  let author = $("#author-new-story").val();
  let title = $("#title-new-story").val();
  let url = $("#url-new-story").val();
  let storyInfo = { author, title, url };

  // POST new Story instance
  let newStory = await storyList.addStory(currentUser, storyInfo);

  // add new story to User's own stories list
  currentUser.stories.push(newStory);

  const response = await axios({
    url: `${BASE_URL}/users/${currentUser.username}`,
    method: "GET",
    params: { token: currentUser.loginToken },
  });
  currentUser = new User(response.data.user, currentUser.loginToken);

  // Update storyList with new list of stories
  storyList = await StoryList.getStories();

  //Update allStoryList section with new story added
  putStoriesOnPage();

  $newStoryForm.trigger("reset");
}

/** Event handler for new story form submission*/

$newStoryForm.on("submit", submitNewStory);



/** Function that updates the star icon of the favorite stories */

function putFavsListOnPage() {
  hidePageComponents();
  $allStoriesList.hide();
  $navUserLinks.show();

  $allStoriesList.empty();
  $allFavsList.empty();
  $ownStoriesList.empty();

  // Check if there are no favorites 
  if (currentUser.favorites.length === 0) {
    $allFavsList.html(`<h4>No Favorites Added Yet!</h4>`);
  } else {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $allFavsList.append($story);
    }

    putFavStarsOnStories();
  }

  $allFavsList.show();

}

/**Toggle fav star click handler */
async function toggleStoryFavorite(evt) {
  let $star = $(evt.target);
  let storyId = $star.closest('li').attr('id');
  console.log("storyId:", storyId);

  if ($star.hasClass('far')) {
    $star.attr('class', 'fas fa-star');
    await currentUser.addFavorite(storyId);
  } else {
    $star.attr('class', 'far fa-star');
    await currentUser.removeFavorite(storyId);
  }
}

$storiesContainer.on('click', '.fa-star', toggleStoryFavorite);

/**Put Own Stories on page
 * adds each User story to ol on DOM
 * and prepend trash can icon
 */

function putUserStoriesOnPage() {
  hidePageComponents();
  $navUserLinks.show();

  $allStoriesList.empty();
  $allFavsList.empty();
  $ownStoriesList.empty();

  // Check if there are no favorites 
  if (currentUser.stories.length === 0) {
    $ownStoriesList.html(`<h4>No Stories Added Yet!</h4>`);
  } else {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.stories) {
      const $story = generateStoryMarkup(story);
      $story.prepend('<i class="far fa-edit"></i>');
      $story.prepend('<i class="far fa-trash-alt"></i>');
      $ownStoriesList.append($story);
    }

    putFavStarsOnStories();
  }

  $ownStoriesList.show();
}



/** Removes the story from the ownStoriesList Ol
 *  Updates the page by putting the ownStories back into the DOM */

async function deleteStory(evt) {
  let $deleteIcon = $(evt.target);
  let storyId = $deleteIcon.closest('li').attr('id');

  await storyList.removeStory(currentUser, storyId);
  putUserStoriesOnPage();
}


$storiesContainer.on('click', '.fa-trash-alt', deleteStory);



/** Removes the story from the ownStoriesList Ol
 *  Updates the page by putting the ownStories back into the DOM */

async function editStory(evt) {
  let $editIcon = $(evt.target);
  let storyId = $editIcon.closest('li').attr('id');

  await storyList.removeStory(currentUser, storyId);
  putUserStoriesOnPage();
}


$storiesContainer.on('click', '.fa-edit', editStory);