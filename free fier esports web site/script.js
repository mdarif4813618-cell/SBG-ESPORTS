(() => {
  "use strict";

  const STORAGE_KEY = "sbgMustakProfile_v1";

  const DEFAULTS = {
    teamTag: "SBG〆",
    ign: "MUSTAK",
    realName: "Your Name",
    uid: "0000000000",
    server: "Bangladesh",
    guild: "YOUR GUILD",
    merit: "100",
    level: "0",
    rank: "UNRANKED",
    kd: "0.00",
    headshot: "0%",
    wins: "0",
    likes: "0",
    role: "RUSHER",
    bio: "A Free Fire player building skills, teamwork and competitive experience.",
    mindset: "Every round is a new challenge. Every fight is an opportunity to improve.",
    gunName: "M590",
    rankMode: "BR-RANKED",
    mapName: "BERMUDA",
    characterName: "OSCAR",
    petName: "FALCO",
    youtube: "",
    facebook: "",
    images: {}
  };

  const TEXT_FIELDS = [
    ["teamTag", "Team tag / prefix"],
    ["ign", "In-game name"],
    ["realName", "Real name"],
    ["uid", "Player UID"],
    ["server", "Server"],
    ["guild", "Guild"],
    ["merit", "Merit"],
    ["level", "Level"],
    ["rank", "Rank"],
    ["kd", "K/D ratio"],
    ["headshot", "Headshot percentage"],
    ["wins", "Wins"],
    ["likes", "Likes"],
    ["role", "Role / playstyle"],
    ["bio", "Player bio"],
    ["mindset", "Player mindset"],
    ["gunName", "Favourite gun"],
    ["rankMode", "Favourite rank mode"],
    ["mapName", "Favourite map"],
    ["characterName", "Favourite character"],
    ["petName", "Favourite pet"],
    ["youtube", "YouTube URL"],
    ["facebook", "Facebook URL"]
  ];

  const IMAGE_FIELDS = [
    ["logo", "Logo image"],
    ["profile", "Profile image"],
    ["badge", "Role badge"],
    ["gun", "Gun image"],
    ["rankImage", "Rank image"],
    ["map", "Map image"],
    ["character", "Character image"],
    ["pet", "Pet image"],
    ["roleImage", "Role image"],
    ["gameProfile", "Game profile screenshot"],
    ["gameplay1", "Gameplay screenshot 1"],
    ["gameplay2", "Gameplay screenshot 2"]
  ];

  let state = loadState();
  let backdrop;
  let form;
  let statusLine;
  let toastTimer;

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return cloneDefaults();

      const parsed = JSON.parse(saved);
      return {
        ...cloneDefaults(),
        ...parsed,
        images: { ...(parsed.images || {}) }
      };
    } catch (error) {
      console.warn("Saved profile could not be loaded.", error);
      return cloneDefaults();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      alert("সেভ করা যায়নি। ছবি ছোট করে আবার চেষ্টা করো।");
      return false;
    }
  }

  function fullIgn() {
    return [state.teamTag, state.ign]
      .map(value => String(value || "").trim())
      .filter(Boolean)
      .join("—");
  }

  function updatePage() {
    document.querySelectorAll("[data-field]").forEach(element => {
      const key = element.dataset.field;
      const value = key === "fullIgn" ? fullIgn() : state[key];
      element.textContent = value ?? "";
    });

    document.querySelectorAll(".image-slot[data-image]").forEach(slot => {
      const key = slot.dataset.image;
      const savedImage = state.images[key];
      const placeholder = slot.querySelector(":scope > .placeholder");
      const badgePlaceholder = slot.querySelector(":scope > .badge-placeholder");

      slot.querySelector(":scope > img.uploaded-image")?.remove();

      if (savedImage) {
        const img = document.createElement("img");
        img.className = "uploaded-image";
        img.src = savedImage;
        img.alt = key + " image";
        slot.appendChild(img);

        if (placeholder) placeholder.hidden = true;
        if (badgePlaceholder) badgePlaceholder.hidden = true;
      } else {
        if (placeholder) placeholder.hidden = false;
        if (badgePlaceholder) badgePlaceholder.hidden = false;
      }
    });

    document.querySelectorAll("[data-link]").forEach(link => {
      const key = link.dataset.link;
      const url = String(state[key] || "").trim();

      if (/^https?:\/\//i.test(url)) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.classList.remove("is-empty");
      } else {
        link.href = "#";
        link.removeAttribute("target");
        link.classList.add("is-empty");
      }
    });
  }

  function createEditor() {
    backdrop = document.createElement("div");
    backdrop.className = "editor-backdrop";

    backdrop.innerHTML = `
      <section class="editor-panel" role="dialog" aria-modal="true"
        aria-labelledby="editorTitle">
        <header class="editor-header">
          <h2 id="editorTitle">EDIT <span>PLAYER PROFILE</span></h2>
          <button class="editor-close" type="button" aria-label="Close">×</button>
        </header>

        <form id="profileEditor">
          <div class="editor-content">
            <p class="editor-intro">
              প্রোফাইলের তথ্য পরিবর্তন করো, ছবি আপলোড করো এবং Save Changes চাপো।
            </p>

            <h3 class="editor-section-title">PLAYER INFORMATION</h3>
            <div class="editor-grid" id="textFields"></div>

            <h3 class="editor-section-title">UPLOAD / CHANGE IMAGES</h3>
            <p class="editor-help">
              ছবি না দিলে Placeholder থাকবে। কোনো আপলোড করা ছবি সরাতে Remove image নির্বাচন করো।
            </p>
            <div class="editor-grid" id="imageFields"></div>

            <p class="locked-note">
              🔒 Banner locked: images/bsnner.jpeg এই ফর্ম থেকে পরিবর্তন করা যাবে না।
            </p>
            <p class="editor-help">
              প্রতিটি ছবির সর্বোচ্চ সাইজ 2 MB। তথ্য ও ছবি এই ব্রাউজারে সংরক্ষণ করা হয়।
            </p>
          </div>

          <footer class="editor-actions">
            <span class="editor-status" id="editorStatus" aria-live="polite"></span>
            <button class="editor-button reset" id="resetProfile" type="button">
              Reset to Default
            </button>
            <button class="editor-button" id="cancelEditor" type="button">
              Cancel
            </button>
            <button class="editor-button save" type="submit">
              Save Changes
            </button>
          </footer>
        </form>
      </section>
    `;

    document.body.appendChild(backdrop);
    form = backdrop.querySelector("#profileEditor");
    statusLine = backdrop.querySelector("#editorStatus");

    const textContainer = backdrop.querySelector("#textFields");

    TEXT_FIELDS.forEach(([key, label]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "editor-field";

      const labelElement = document.createElement("label");
      labelElement.htmlFor = "field-" + key;
      labelElement.textContent = label;

      let input;

      if (key === "bio" || key === "mindset") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = key === "youtube" || key === "facebook" ? "url" : "text";
      }

      input.id = "field-" + key;
      input.name = key;
      input.value = state[key] ?? "";
      input.maxLength = 500;

      if (input.type === "url") {
        input.placeholder = "https://example.com/...";
      }

      wrapper.append(labelElement, input);
      textContainer.appendChild(wrapper);
    });

    const imageContainer = backdrop.querySelector("#imageFields");

    IMAGE_FIELDS.forEach(([key, label]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "editor-field";

      const labelElement = document.createElement("label");
      labelElement.htmlFor = "image-" + key;
      labelElement.textContent = label;

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.name = "image-" + key;
      input.id = "image-" + key;

      const removeLabel = document.createElement("label");
      removeLabel.className = "remove-image";

      const removeInput = document.createElement("input");
      removeInput.type = "checkbox";
      removeInput.name = "remove-" + key;

      removeLabel.append(
        removeInput,
        document.createTextNode(" Remove image / use placeholder")
      );

      const hint = document.createElement("span");
      hint.className = "editor-help";
      hint.textContent = state.images[key]
        ? "A custom image is saved."
        : "No custom image; placeholder is shown.";

      wrapper.append(labelElement, input, hint, removeLabel);
      imageContainer.appendChild(wrapper);
    });

    backdrop.querySelector(".editor-close")
      .addEventListener("click", closeEditor);

    backdrop.querySelector("#cancelEditor")
      .addEventListener("click", closeEditor);

    backdrop.querySelector("#resetProfile")
      .addEventListener("click", resetProfile);

    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeEditor();
    });

    form.addEventListener("submit", handleSave);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && backdrop.classList.contains("open")) {
        closeEditor();
      }
    });
  }

  function openEditor() {
    if (!backdrop) createEditor();

    TEXT_FIELDS.forEach(([key]) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = state[key] ?? "";
    });

    IMAGE_FIELDS.forEach(([key]) => {
      const fileInput = form.elements.namedItem("image-" + key);
      const removeInput = form.elements.namedItem("remove-" + key);

      if (fileInput) fileInput.value = "";
      if (removeInput) removeInput.checked = false;
    });

    statusLine.textContent = "";
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    backdrop.querySelector("input")?.focus();
  }

  function closeEditor() {
    if (!backdrop) return;
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);

      if (!file.type.startsWith("image/")) {
        reject(new Error("শুধু image file নির্বাচন করো।"));
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        reject(new Error("ছবির সাইজ 2 MB-এর নিচে রাখো।"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("ছবি পড়া যায়নি।"));
      reader.readAsDataURL(file);
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    statusLine.textContent = "Saving...";

    const next = {
      ...state,
      images: { ...state.images }
    };

    TEXT_FIELDS.forEach(([key]) => {
      const input = form.elements.namedItem(key);
      next[key] = String(input?.value ?? "").trim();
    });

    try {
      for (const [key] of IMAGE_FIELDS) {
        const fileInput = form.elements.namedItem("image-" + key);
        const removeInput = form.elements.namedItem("remove-" + key);

        if (removeInput?.checked) {
          delete next.images[key];
        } else if (fileInput?.files?.[0]) {
          next.images[key] = await readImage(fileInput.files[0]);
        }
      }

      state = next;

      if (!saveState()) {
        state = loadState();
        updatePage();
        statusLine.textContent = "Save failed. Try smaller images.";
        return;
      }

      updatePage();
      statusLine.textContent = "Saved successfully!";
      showToast("Profile changes saved!");
      setTimeout(closeEditor, 500);
    } catch (error) {
      statusLine.textContent = error.message || "Could not save changes.";
    }
  }

  function resetProfile() {
    const confirmed = confirm(
      "সব পরিবর্তন ও আপলোড করা ছবি মুছে ডিফল্ট অবস্থায় ফিরিয়ে নিতে চাও?"
    );

    if (!confirmed) return;

    state = cloneDefaults();

    if (!saveState()) return;

    updatePage();

    // Form-এও ডিফল্ট তথ্য দেখাও
    TEXT_FIELDS.forEach(([key]) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = state[key] ?? "";
    });

    IMAGE_FIELDS.forEach(([key]) => {
      const fileInput = form.elements.namedItem("image-" + key);
      const removeInput = form.elements.namedItem("remove-" + key);
      if (fileInput) fileInput.value = "";
      if (removeInput) removeInput.checked = false;
    });

    statusLine.textContent = "Default values restored.";
    showToast("Default profile restored.");
  }

  function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  document.getElementById("openEditor")
    ?.addEventListener("click", openEditor);

  updatePage();
})();