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
    let $star = $(`#${story.storyId} > i`);

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
  await storyList.addStory(currentUser, storyInfo);

  // Update storyList with new list of stories
  storyList = await StoryList.getStories();

  //Update allStoryList section with new story added
  putStoriesOnPage();
}

/** Event handler for new story form submission*/

$newStoryForm.on("submit", submitNewStory);



/** Function that updates the star icon of the favorite stories */

function putFavsListOnPage() {
  hidePageComponents();
  $navUserLinks.show();
  
  $allStoriesList.empty();
  $allFavsList.empty();

  if(currentUser.favorites.length === 0) {
    $allFavsList.html(`<h4>No Favorites Added Yet!</h4>`);
  }

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allFavsList.append($story);
  }

  putFavStarsOnStories();

  $allFavsList.show();

}

/**Toggle fav star click handler */
function toggleStoryFavorite(evt) {
  let $star = $(evt.target);
  let storyId = $star.closest('li').attr('id');
  if($star.hasClass('far')) {
    $star.attr('class', 'fas fa-star');
    currentUser.addFavorite(storyId);
  } else {
    $star.attr('class', 'far fa-star');
    currentUser.removeFavorite(storyId);
  }
}

$storiesContainer.on('click', '.fa-star', toggleStoryFavorite);