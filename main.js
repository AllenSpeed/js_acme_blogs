function createElemWithText(
  nameOfElToBeCreated = "p",
  textContentOfCreatedEl = "",
  className = ""
) {
  let newlyCreatedElWithText = document.createElement(nameOfElToBeCreated);
  newlyCreatedElWithText.textContent = textContentOfCreatedEl;
  newlyCreatedElWithText.className = className;
  return newlyCreatedElWithText;
}

function createSelectOptions(users) {
  if (users === undefined || users === null) {
    return undefined;
  }

  optionArray = [];
  for (user of users) {
    console.log(user);
    var opt = document.createElement("option");
    opt.value = user.id;
    opt.innerHTML = user.name;
    optionArray.push(opt);
  }

  return optionArray;
}

function toggleCommentSection(postId) {
  if (!postId) {
    return undefined;
  } else {
    const commentSection = document.querySelector(
      `section[data-post-id="${postId}"]`
    );
    if (!commentSection) {
      return null;
    }
    commentSection.classList.toggle("hide");
    return commentSection;
  }
}

const toggleCommentButton = (postId) => {
  if (postId == null) {
    return undefined;
  }
  const selectedButton = document.querySelector(
    `button[data-post-id="${postId}"]`
  );
  if (selectedButton != null) {
    selectedButton.textContent === "Show Comments"
      ? (selectedButton.textContent = "Hide Comments")
      : (selectedButton.textContent = "Show Comments");
  }
  return selectedButton;
};

// testing the above function
// const button = document.getElementById("postButton");
// button.addEventListener("click", (postID) => {
//   toggleCommentButton(postID.target.id);
// });

function deleteChildElements(html_element) {
  if (
    !html_element ||
    typeof html_element === "string" ||
    typeof html_element === "number"
  ) {
    return undefined;
  }
  if (!(html_element instanceof Element)) {
    return undefined;
  }
  let child = html_element.lastElementChild;
  while (child) {
    html_element.removeChild(child);
    child = html_element.lastElementChild;
  }
  return html_element;
}

function addButtonListeners() {
  let buttons = document.querySelector("main").querySelectorAll("button");
  buttons.forEach((button) =>
    button.addEventListener(
      "click",
      (e) => toggleComments(e, button.dataset.postId),
      false
    )
  );
  return buttons;
}

function toggleComments(e, postId) {
  if (!e && !postId) {
    return undefined;
  }
  e.target.listener = true;
  let section = toggleCommentSection(postId);
  let button = toggleCommentButton(postId);
  return [section, button];
}

function removeButtonListeners() {
  let buttons = document.querySelector("main").querySelectorAll("button");
  for (button of buttons) {
    button.removeEventListener("click", toggleComments);
  }
  return buttons;
}

function createComments(data) {
  if (!data) {
    return undefined;
  }
  let fragment = new DocumentFragment();
  data.forEach((comment) => {
    let article = document.createElement("article");
    let header = createElemWithText("h3", comment.name);
    let body = createElemWithText("p", comment.body);
    let paragraph = createElemWithText("p", `From: ${comment.email}`);
    article.append(header, body, paragraph);
    fragment.append(article);
  });
  return fragment;
}

function populateSelectMenu(data) {
  if (!data) {
    return undefined;
  }
  let selectMenu = document.getElementById("selectMenu");
  let options = createSelectOptions(data);
  options.forEach((option) => {
    selectMenu.appendChild(option);
  });
  return selectMenu;
}

async function getUsers() {
  try {
    let res = await fetch("https://jsonplaceholder.typicode.com/users");
    let data = await res.json();
    return data;
  } catch (err) {
    console.log("Error fetching users", err.response);
  }
}

async function getUserPosts(userId) {
  if (!userId) {
    return undefined;
  }
  try {
    let res = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}/posts/`
    );
    let data = await res.json();
    return data;
  } catch (err) {
    console.log("Error fetching users posts", err.response);
  }
}

async function getUser(userId) {
  if (!userId) {
    return undefined;
  }
  try {
    let res = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}/`
    );
    let data = await res.json();
    return data;
  } catch (err) {
    console.log("Error fetching user", err.response);
  }
}

async function getPostComments(postId) {
  if (!postId) {
    return undefined;
  }
  try {
    let res = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}/comments/`
    );
    let data = await res.json();
    return data;
  } catch (err) {
    console.log("Error fetching Posts", err);
  }
}

async function displayComments(postId) {
  if (!postId) {
    return undefined;
  }
  let section = document.createElement("section");
  section.setAttribute("data-post-id", postId);
  section.classList.add("comments", "hide");

  let comments = await getPostComments(postId);
  let fragment = createComments(comments);
  section.append(fragment);
  return section;
}

async function createPosts(postData) {
  if (!postData) {
    return undefined;
  }
  let fragment = document.createDocumentFragment();
  for (post of postData) {
    let article = document.createElement("article");
    let header = createElemWithText("h2", post.title);
    let paragraph = createElemWithText("p", post.body);
    let para2 = createElemWithText("p", `Post ID: ${post.id}`);
    let author = await getUser(post.userId);
    let authorInfo = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`
    );
    let catchPhrase = createElemWithText("p", author.company.catchPhrase);
    let button = createElemWithText("button", "Show Comments");
    button.setAttribute("data-post-id", post.id);
    article.append(header, paragraph, para2, authorInfo, catchPhrase, button);
    let section = await displayComments(post.id);
    article.appendChild(section);
    fragment.appendChild(article);
  }
  return fragment;
}

async function displayPosts(posts) {
  let main = document.querySelector("main");
  let element = posts
    ? await createPosts(posts)
    : document.querySelector(".default-text");
  main.append(element);
  return element;
}

async function refreshPosts(posts) {
  if (!posts) {
    return undefined;
  }
  let removeButtons = removeButtonListeners();
  let main = document.querySelector("main");
  main = deleteChildElements(main);
  let fragment = await displayPosts(posts);
  let addButtons = addButtonListeners();
  return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
  let userId = event?.target?.value || 1;
  let posts = await getUserPosts(userId);
  let refreshPostsArray = await refreshPosts(posts);
  return [userId, posts, refreshPostsArray];
}

async function initPage() {
  let users = await getUsers();
  let select = populateSelectMenu(users);
  return [users, select];
}

async function initApp() {
  initPage();
  let selectMenu = document.getElementById("selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler, false);
}
document.addEventListener("DOMContentLoaded", initApp);
