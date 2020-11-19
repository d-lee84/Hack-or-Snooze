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
  return $(`
      <li id="${story.storyId}">
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

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
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
  let storyInfo = { author, title, url};

  // POST new Story instance
  await storyList.addStory(currentUser, storyInfo);

  // Update storyList with new list of stories
  storyList = await StoryList.getStories();

  //Update allStoryList section with new story added
  putStoriesOnPage();
}

/** Event handler for new story form submission*/

$newStoryForm.on("submit", submitNewStory);