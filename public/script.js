
const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea-input");
const searchInput = document.querySelector("#search-input");
const ideaList = document.querySelector("#idea-list");
const ideaCount = document.querySelector("#idea-count");
const emptyState = document.querySelector("#empty-state");
let allIdeas = [];


async function loadIdeas() {
  try {
    const response = await fetch("/api/ideas");
    const ideas = await response.json();

    if (!response.ok) {
      throw new Error(ideas.error || "Could not load ideas.");
    }

    allIdeas = ideas;
    renderIdeas();
  } catch (error) {
    console.error("Loading ideas failed:", error);
    alert("Could not load ideas. Check the server and Supabase settings.");
  }
}

function renderIdeas() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredIdeas = allIdeas.filter((idea) =>
    `${idea.title} ${idea.description}`
      .toLowerCase()
      .includes(searchTerm)
  );

  ideaList.replaceChildren();

  filteredIdeas.forEach((idea) => {
    const item = document.createElement("li");
    item.className = "idea-card";

    const title = document.createElement("h3");
    title.textContent = idea.title;

    const description = document.createElement("p");
    description.textContent = idea.description;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this idea?")) {
        return;
      }

      deleteButton.disabled = true;

      try {
        const deleteResponse = await fetch(
          `/api/ideas/${encodeURIComponent(idea.id)}`,
          { method: "DELETE" }
        );

        const result = await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(result.error || "Could not delete idea.");
        }

        await loadIdeas();
      } catch (error) {
        console.error("Delete failed:", error);
        alert(error.message);
        deleteButton.disabled = false;
      }
    });

    item.append(title, description, deleteButton);
    ideaList.appendChild(item);
  });

  ideaCount.textContent = searchTerm
    ? `${filteredIdeas.length} of ${allIdeas.length} ideas`
    : `${allIdeas.length} ${allIdeas.length === 1 ? "idea" : "ideas"}`;

  emptyState.hidden = filteredIdeas.length > 0;

  if (allIdeas.length === 0) {
    emptyState.textContent = "Your next great idea starts here.";
  } else if (filteredIdeas.length === 0) {
    emptyState.textContent = "No matching ideas found. Try another search.";
  }
}

searchInput.addEventListener("input", renderIdeas);


ideaForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = ideaInput.value.trim();

  if (!title) {
    alert("Please write an idea first.");
    return;
  }

  const saveButton = ideaForm.querySelector('button[type="submit"]');
  saveButton.disabled = true;

  try {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: title
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not save idea.");
    }

    ideaInput.value = "";
    await loadIdeas();
  } catch (error) {
    console.error("Saving idea failed:", error);
    alert(error.message);
  } finally {
    saveButton.disabled = false;
  }
});

loadIdeas();
