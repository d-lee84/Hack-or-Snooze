const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ title, author, url, username, storyId, createdAt }) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    const url = new URL(this.url);
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    console.debug("addStory");

    // Get the author, title, url information 


    // Make a post request to the server
    let response = await axios.post(`${BASE_URL}/stories`, {
      token: user.loginToken,
      story: newStory
    });

    // Define variables for creating Story instance
    let { author, title, url, storyId, createdAt } = response.data.story;
    let username = user.username;

    // Return a Story instance 
    return new Story({ title, author, url, username, storyId, createdAt })

  }

  /** Remove a user story
   *  - Takes in the id of the story to remove
   *  - Finds the story from the stories list
   *  - Updates the server with the removed story
   */

  // Filter the array
  // Change the order of removing from API then Front end
  async removeStory(user, storyToDeleteId) {
    await axios.delete(`${BASE_URL}/stories/${storyToDeleteId}`,
      { data: { "token": user.loginToken } });

    this.stories = this.stories.filter(
      (s) => s.storyId !== storyToDeleteId
    );

    user.deleteStory(storyToDeleteId);
  }

  /** Edits story in the server
   *  - Update the story instance on the storyList.stories
   *  - Updates the user's stories by calling method on user instance
   * 
   * @param {instance of User class: currentUser} user 
   * @param {ID of the story to edit} storyId 
   * @param {title, author, url} story 
   */

  async editStory(user, storyId, story) {
    await axios({
      method: 'patch',
      url: `${BASE_URL}/stories/${storyId}`,
      data: {
        token: user.loginToken, 
        story
      }
    });

    let storyToEdit = storyList.stories.find(
      (s) => s.storyId === storyId
    );

    for (let key in story) {
      storyToEdit[key] = story[key];
    }

    user.updateStory(storyId, story);
  }
}

// storyList.addStory(currentUser, {title: "Rithm Won Again", author: "David", url: "https://www.rithmschool.com/courses/intermediate-css-bootstrap/css-transform-transition-animation-exercise'"})


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], stories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    stories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and stories
    this.favorites = favorites.map(s => new Story(s));
    this.stories = stories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });
      return new User(response.data.user, response.data.token);
    } catch (err) {
      // alert('Please select a different username.');
      throw new Error('Please select a different username');
      //return false;
    }
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } }
    });

    return new User(response.data.user, response.data.token);
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      return new User(response.data.user, token);
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /**  Add a favorite story
   *   - Takes in the storyId
   *   - Finds the story instance and adds to currentUser.favorites
   *   - Updates the server with the storyId to add to favorites
   */

  async addFavorite(storyToAddId) {
    let story = storyList.stories.find(
      (s) => s.storyId === storyToAddId
    );
    this.favorites.push(story);

    await axios.post(`${BASE_URL}/users/${this.username}`
      + `/favorites/${storyToAddId}`, { "token": this.loginToken });
  }

  /** Remove a favorite story 
   *  - Takes in the storyId
   *  - Finds the story index and removes from currentUser.favorites
   *  - Updates the server with the storyId to remove from favorites
  */

  async removeFavorite(storyToDeleteId) {
    await axios.delete(`${BASE_URL}/users/${this.username}`
      + `/favorites/${storyToDeleteId}`, { data: { "token": this.loginToken } });

    this.favorites = this.favorites.filter(
      (s) => s.storyId !== storyToDeleteId
    );
  }

  /** Find and delete the story from the stories and favorites array 
   *  - pass in the ID of the story to delete
   */

  deleteStory(storyToDeleteId) {
    this.stories = this.stories.filter(
      (s) => s.storyId !== storyToDeleteId
    );

    this.favorites = this.favorites.filter(
      (s) => s.storyId !== storyToDeleteId
    );
  }

  /** Find and update the story from the stories and favorites array 
   *  - pass in the ID of the story to update
   *  - story: {title, author, url}
   */

  updateStory(storyId, story) {
    let storyToEdit = this.stories.find(
      (s) => s.storyId === storyId
    );

    for (let key in story) {
      storyToEdit[key] = story[key];
    }

    // Update the story if its in the favorites list
    storyToEdit = this.favorites.find(
      (s) => s.storyId === storyId
    );
    
    if(storyToEdit) {
      for (let key in story) {
        storyToEdit[key] = story[key];
      }
    }
  }
}

