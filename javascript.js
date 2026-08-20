const filePicker = document.getElementById("image-picker");
const imageList = document.getElementById("image-list");
const mainImage = document.getElementById("main-image");
const viewport = document.getElementById("viewport");
const annotationsContainer = document.getElementById("annotations-container");

cam = { x: 0, y: 0, scale: 0 };

images = [];

function newAnnotation() {
  return {
    x: 0,
    y: 0,
    w: 64, 
    h: 32,
    text: "Your Note Here",
    col: {r: 255, g: 255, b: 255},
  };
}

function setMainImage(index) {
  mainImage.src = images[index].url;
  cam = { x: 0, y: 0, scale: 1 };
  console.log(mainImage.width + ", " + mainImage.height);
  cam.x = viewport.clientWidth / 2 - mainImage.width / 2
  cam.y = viewport.clientHeight / 2 - mainImage.height / 2
  mainImage.style.translate = cam.x + "px " + cam.y +"px";
  mainImage.style.scale = cam.scale;
  mainImage.style.display = "flow";

  while (annotationsContainer.firstChild) {
    annotationsContainer.removeChild(annotationsContainer.firstChild);
  }

  for (annotation in images[index].annotations) {
    annotationP = document.createElement("p");
    annotationP.innerText = annotation.text;
    viewport.appendChild(annotationP);
    console.log(annotation);
  }
  console.log(cam);
}

function createImagePreview(image, num) {
    const imgElement  = document.createElement("img"); 
    const previewElement = document.createElement("div");
    const nameElement = document.createElement("p");
    const noteCount = document.createElement("p");
    const div = document.createElement("div");
    noteCount.innerText = "0 Anotações";
    nameElement.innerText = image.name;
    noteCount.className = "annotation-count";
    nameElement.className = "image-name";
    imgElement.src = image.url; 
    previewElement.imgNumber = num;
    previewElement.className = "image-preview";
    imgElement.className = "image-preview-image";
    previewElement.appendChild(imgElement);
    previewElement.appendChild(div);
    div.appendChild(nameElement);
    div.appendChild(noteCount);

    return previewElement;
}

function onFilePick() {
  for (const img of filePicker.files) {
    images.push({ name: img.name, url: URL.createObjectURL(img), annotations: [newAnnotation()]}); 
  }
  while (imageList.firstChild) {
    imageList.removeChild(imageList.firstChild);
  }
  let i = 0; 
  for (const img of images) {
    newImage = createImagePreview(img, i)
    newImage.addEventListener("click", function (e) {
      setMainImage(this.imgNumber);
    }, {capture: true} );
    imageList.appendChild(newImage);
    i += 1;
  }
}
filePicker.addEventListener("input", onFilePick);

document.getElementById("viewport").addEventListener("pointermove", function(e) {
  if (e.buttons & 1) {
    cam.x += e.movementX;
    cam.y += e.movementY;
    mainImage.style.translate = cam.x + "px " + cam.y +"px";
    console.log(mainImage.style.translate);
  }
});

document.getElementById("viewport").addEventListener("wheel", function(e) {
  cam.scale += e.deltaY / 100.0;
  if (cam.scale < 0.01) cam.scale = 0.01;
  mainImage.style.scale = cam.scale;
});
mainImage.style.display = "none";
