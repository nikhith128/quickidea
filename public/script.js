
const ideaForm = document.querySelector("form");
const ideaInput = document.querySelector("textarea");
const saveButton = document.querySelector("button");
const ideasContainer = document.querySelector("#ideas");

async function loadIdeas() {
  if (!ideasContainer) return;

  try {
    const response = await fetch("/api/ideas");
    const ideas = await response.json();

    if (!response.ok) throw new Error(ideas.error);

    ideasContainer.replaceChildren();

    ideas.forEach((idea) => {
      const card = document.createElement("article");
      const title = document.createElement("h3");
      const description = document.createElement("p");

      title.textContent = idea.title;
      description.textContent = idea.description;

      card.append(title, description);
      ideasContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Could not load ideas:", error);
  }
}

if (ideaForm) {
  ideaForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = ideaInput?.value.trim();

    if (!title) {
      alert("Please enter an idea.");
      return;
    }

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

      ideaForm.reset();
      await loadIdeas();
    } catch (error) {
      console.error("Save failed:", error);
      alert(error.message);
    } finally {
      saveButton.disabled = false;
    }
  });
}

loadIdeas();
