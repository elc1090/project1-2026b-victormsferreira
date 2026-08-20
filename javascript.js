const filePicker = document.getElementById("image-picker");
const imageList = document.getElementById("image-list");
const mainImage = document.getElementById("main-image");
const viewport = document.getElementById("viewport");
const viewportItems = document.getElementById("viewport-items");
const annotationsContainer = document.getElementById("annotations-container");

let cam = { x: 0, y: 0, scale: 1 };
let selectedNote = null;
let selectedHandle = null;

images = [];

function newAnnotation() {
  return {
    x: Math.random()*64,
    y: Math.random()*64,
    w: 96, 
    h: 32,
    text: "Your Note Here",
    col: {r: 255, g: 255, b: 255},
  };
}

function annotationElement(annotation) {
  let div = document.createElement("div");
  let box = document.createElement("div");
  let note = document.createElement("p");
  note.innerText = annotation.text;
  div.className = "note"
  div.style.translate = annotation.x+"px " + annotation.y+"px";
  box.style.width = annotation.w + "px";
  box.style.height = annotation.h + "px";
  box.style.minwidth = annotation.w + "px";
  box.style.minheight = annotation.h + "px";
  box.id = "box";
  div.appendChild(box);
  div.appendChild(note);
  div.annotation = annotation;

  let handlePositions = [
    {top: "0px", left: "0px", point: "nw"},
    {top: "0px", left: annotation.w+"px", point: "ne"},
    {top: annotation.h+"px", left: "0px", point: "sw"},
    {top: annotation.h+"px", left: annotation.w+"px", point: "se"},
  ]
  for (handlePos of handlePositions) {
    let handle = document.createElement("div");
    handle.className = "handle" 
    handle.point = handlePos.point;
    handle.style.position = "absolute";
    handle.style.top = handlePos.top;
    handle.style.left = handlePos.left;
    handle.note = div;
    div.appendChild(handle);
  }
  return div;
}

function updateAnnotationElement(elem) {
  const annotation = elem.annotation
  const box = elem.firstChild;
  elem.style.translate = annotation.x+"px " + annotation.y+"px";
  box.style.width = annotation.w + "px";
  box.style.height = annotation.h + "px";
  box.style.minwidth = annotation.w + "px";
  box.style.minheight = annotation.h + "px";

  let handlePositions = [
    {top: "0px", left: "0px", point: "nw"},
    {top: "0px", left: annotation.w+"px", point: "ne"},
    {top: annotation.h+"px", left: "0px", point: "sw"},
    {top: annotation.h+"px", left: annotation.w+"px", point: "se"},
  ]

  const handles = elem.getElementsByClassName("handle");
  for (handle of handles) {
    for (handlePos of handlePositions) {
      if (handle.point == handlePos.point) {
        handle.style.top = handlePos.top;
        handle.style.left = handlePos.left;
      }
    }
  }
}

function setMainImage(index) {
  mainImage.src = images[index].url;
  cam = { x: 0, y: 0, scale: 1 };
  console.log(mainImage.width + ", " + mainImage.height);
  cam.x = viewport.clientWidth / 2 - mainImage.width / 2
  cam.y = viewport.clientHeight / 2 - mainImage.height / 2
  viewportItems.style.translate = cam.x + "px " + cam.y +"px";
  viewportItems.style.scale = cam.scale;
  mainImage.style.display = "flow";

  while (annotationsContainer.firstChild) {
    annotationsContainer.removeChild(annotationsContainer.firstChild);
  }

  for (const annotation of images[index].annotations) {
    annotationsContainer.appendChild(annotationElement(annotation));
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
    images.push({ 
      name: img.name, 
      url: URL.createObjectURL(img), 
      annotations: [newAnnotation(),newAnnotation(),newAnnotation(),]
    }); 
  }
  while (imageList.firstChild) {
    imageList.removeChild(imageList.firstChild);
  }
  let i = 0; 
  for (const img of images) {
    newImage = createImagePreview(img, i)
    newImage.addEventListener("click", function (e) {
      setMainImage(this.imgNumber);
    }, true );
    imageList.appendChild(newImage);
    i += 1;
  }
}
filePicker.addEventListener("input", onFilePick);

viewport.addEventListener("pointermove", function(e) {
  if (e.buttons & 1) {
    let x = e.movementX;
    let y = e.movementY;
    x = x / cam.scale;
    y = y / cam.scale;
    if (selectedHandle != null) {
      switch (selectedHandle.point) {
      case 'nw': {
        selectedHandle.note.annotation.x += x;
        selectedHandle.note.annotation.y += y;
        selectedHandle.note.annotation.w -= x;
        selectedHandle.note.annotation.h -= y;
        updateAnnotationElement(selectedHandle.note);
      } break;
      case 'sw': {
        selectedHandle.note.annotation.x += x;
        selectedHandle.note.annotation.w -= x;
        selectedHandle.note.annotation.h += y;
        updateAnnotationElement(selectedHandle.note);
      } break;
      case 'ne': {
        selectedHandle.note.annotation.y += y;
        selectedHandle.note.annotation.w += x;
        selectedHandle.note.annotation.h -= y;
        updateAnnotationElement(selectedHandle.note);
      } break;
      case 'se': {
        selectedHandle.note.annotation.w += x;
        selectedHandle.note.annotation.h += y;
        updateAnnotationElement(selectedHandle.note);
      } break;
      }
    } else if (selectedNote != null) {
      selectedNote.annotation.x += x;
      selectedNote.annotation.y += y;
      updateAnnotationElement(selectedNote);
    } else {
      cam.x += x;
      cam.y += y;
      viewportItems.style.translate = cam.x + "px " + cam.y +"px";
    }
  }
}, true);

viewport.addEventListener("pointerdown", function(e) {
  let note = e.target.closest(".note")
  let handle = e.target.closest(".handle")
  if (handle) {
    selectedHandle = handle;
  } else  if (note) {
    selectedHandle= null;
    selectedNote = note;
  } else {
    selectedHandle= null;
    selectedNote = null;
  }
}, true);

viewport.addEventListener("wheel", function(e) {
  cam.scale += e.deltaY / 100.0;
  if (cam.scale < 0.01) cam.scale = 0.01;
  viewportItems.style.scale = cam.scale;
});
mainImage.style.display = "none";
