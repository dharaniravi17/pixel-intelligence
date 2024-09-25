const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");
const savedGallery = document.querySelector(".saved-gallery");
const savedImagesContainer = document.querySelector(".saved-images");
const viewSavedBtn = document.getElementById('view-saved-btn');

const UNSPLASH_API_KEY = 'ZqXhKe5QcYsP3DFKd9h36LpOtWxKwzdWtO8G4FMYGTc'; // Replace with your Unsplash API key
let isImageGenerating = false;

// Local storage key
const SAVED_IMAGES_KEY = 'saved_images';

// Function to save an image URL to local storage
const saveImage = (imageUrl) => {
  const savedImages = JSON.parse(localStorage.getItem(SAVED_IMAGES_KEY)) || [];
  savedImages.push(imageUrl);
  localStorage.setItem(SAVED_IMAGES_KEY, JSON.stringify(savedImages));
  alert('Image saved successfully!');
};

// Function to load saved images from local storage
const loadSavedImages = () => {
  const savedImages = JSON.parse(localStorage.getItem(SAVED_IMAGES_KEY)) || [];
  savedImagesContainer.innerHTML = '';
  savedImages.forEach((imageUrl, index) => {
    const imgCard = document.createElement('div');
    imgCard.classList.add('img-card');

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Saved Image';
    imgElement.classList.add('gallery-image');

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Delete';
    removeBtn.classList.add('remove-btn');
    removeBtn.onclick = () => removeImage(index);

    imgCard.appendChild(imgElement);
    imgCard.appendChild(removeBtn);
    savedImagesContainer.appendChild(imgCard);
  });
};

const updateImageCards = (imgDataArray) => {
  imageGallery.innerHTML = ''; // Clear previous images
  imgDataArray.forEach((imgObject) => {
    const imgCard = document.createElement('div');
    imgCard.classList.add('img-card');

    const imgElement = document.createElement('img');
    imgElement.src = imgObject.urls.regular;
    imgElement.alt = 'AI Generated Image';
    imgElement.classList.add('gallery-image');

    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.classList.add('save-btn');
    saveBtn.onclick = () => saveImage(imgObject.urls.regular);

    imgCard.appendChild(imgElement);
    imgCard.appendChild(saveBtn);
    imageGallery.appendChild(imgCard);
  });
};

const fetchImages = async (query, count) => {
  const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&count=${count}`, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }

  return response.json();
};

const generateImages = async (userPrompt) => {
  try {
    const imgDataArray = await fetchImages(userPrompt, 12); // Fetch up to 12 images
    updateImageCards(imgDataArray);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.currentTarget.querySelector(".prompt-input").value;
  if (!userPrompt.trim()) {
    alert('Please enter a description.');
    return;
  }

  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  generateImages(userPrompt);
};

generateForm.addEventListener("submit", handleImageGeneration);

const handleImageUpload = async () => {
  const fileInput = document.getElementById('image-upload');
  const files = fileInput.files;

  if (files.length === 0) {
    alert('Please select one or more files to upload.');
    return;
  }

  const readerPromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  try {
    const uploadedImages = await Promise.all(readerPromises);
    uploadedImages.forEach((imageDataUrl) => {
      const imgCard = document.createElement('div');
      imgCard.classList.add('img-card');

      const imgElement = document.createElement('img');
      imgElement.src = imageDataUrl;
      imgElement.alt = 'Uploaded Image';
      imgElement.classList.add('gallery-image');

      const saveBtn = document.createElement('button');
      saveBtn.innerText = 'Save';
      saveBtn.classList.add('save-btn');
      saveBtn.onclick = () => saveImage(imageDataUrl);

      imgCard.appendChild(imgElement);
      imgCard.appendChild(saveBtn);
      imageGallery.appendChild(imgCard);
    });
  } catch (error) {
    alert(`Error uploading images: ${error.message}`);
  }
};

document.getElementById('upload-btn').addEventListener('click', handleImageUpload);

viewSavedBtn.addEventListener('click', () => {
  savedGallery.style.display = 'block';
  loadSavedImages();
});

const removeImage = (index) => {
  const savedImages = JSON.parse(localStorage.getItem(SAVED_IMAGES_KEY)) || [];
  savedImages.splice(index, 1);
  localStorage.setItem(SAVED_IMAGES_KEY, JSON.stringify(savedImages));
  loadSavedImages();
};
