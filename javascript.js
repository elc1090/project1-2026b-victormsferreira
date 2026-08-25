const filePicker = document.getElementById("image-picker");
const imageList = document.getElementById("image-list");
const mainImage = document.getElementById("main-image");
const viewport = document.getElementById("viewport");
const viewportItems = document.getElementById("viewport-items");
const annotationsContainer = document.getElementById("annotations-container");

const properties = {
  div: document.getElementById("properties-box"),
  x: document.getElementById("note-x").getElementsByClassName("info")[0],
  y: document.getElementById("note-y").getElementsByClassName("info")[0],
  w: document.getElementById("note-w").getElementsByClassName("info")[0],
  h: document.getElementById("note-h").getElementsByClassName("info")[0],
  color: document.getElementById("color-input"),
  alpha: document.getElementById("opacity-input"),
  tag: document.getElementById("tag-input"),
  fontSize: document.getElementById("tag-font-size-input"),
  circle: document.getElementById("tag-circular-input"),
}
const buttons = {
  select: document.getElementById("select"),
  draw: document.getElementById("draw"),
  delete: document.getElementById("delete"),
  zoomOut: document.getElementById("zoom-out"),
  zoomIn: document.getElementById("zoom-in"),
  zoomDisplay: document.getElementById("zoom-display"),
  remove: document.getElementById("remove"),
  export: document.getElementById("export-json"),
  import: document.getElementById("import-json"),
}

let mode = "select"

let cam = { x: 0, y: 0, scale: 1 };

function exportJSON() {
  let exported = {
    version: 1,
    exportDate: 0,
    images: [],
  };
  for (img of images) {
    let imgData = {
      imgName: img.name,
      data: img.data,
      annotations: [],
    };
    for (annotation of img.annotations) {
      imgData.annotations.push( {
        x: annotation.x,
        y: annotation.y,
        w: annotation.w, 
        h: annotation.h,
        text: annotation.text,
        fontSize: annotation.fontSize,
        col: annotation.col,
        circle: annotation.circle,
      });
    }
    exported.images.push(imgData);
  }
  let json = JSON.stringify(exported)
  var a = document.createElement("a");
  var file = new Blob([json], {type: "text/plain"});
  a.href = URL.createObjectURL(file);
  a.download = "annotations.json";
  a.click();
}


async function importJSON(file) {
  const json = await file.text();
  data = JSON.parse(json);
  console.log(data);
  for (img of data.images) {
    let newImage = { 
      name: img.imgName, 
      url: img.data,
      data: img.data,
      annotations: []
    }
    images.push(newImage); 
    for (annotation of img.annotations) {
      newImage.annotations.push( {
        x: annotation.x,
        y: annotation.y,
        w: annotation.w, 
        h: annotation.h,
        text: annotation.text,
        fontSize: annotation.fontSize,
        col: annotation.col,
        circle: annotation.circle,
      });
    }
  }
  updateImageList();
}

function camZoom(amt) {
  camSetZoom(cam.scale + amt);
}

function camSetZoom(amt) {
  cam.scale = amt;
  if (cam.scale < 0.01) cam.scale = 0.01;
  viewportItems.style.scale = cam.scale;
  buttons.zoomDisplay.innerText = Math.round(cam.scale * 100) + "%";
}


let selectedNote = null;
let selectedHandle = null;
let imgWidth = 0;
let imgHeight = 0;
let images = [];
let imageIndex = -1;

function selectNote(note) {
  if (selectedNote) {
    selectedNote.className = "note"
  }
  selectedNote = note;
  if (note) {
    note.className = "note selected"
  }
}

function newAnnotation() {
  return {
    x: Math.random()*64,
    y: Math.random()*64,
    w: 8, 
    h: 8,
    text: "Your Note Here",
    fontSize: 12,
    col: {r: Math.random()*256, g: Math.random()*256, b: Math.random()*256, a: 0.5},
    circle: false,
  };
}

function annotationColorString(annotation) {
  let alpha = annotation.col.a * 100;
  return "rgb(" +annotation.col.r+" "+annotation.col.g+" "+annotation.col.b+" / "+alpha+"%)";
}

function annotationColorStringHex(annotation) {
  let r = Math.round(annotation.col.r).toString(16);
  let g = Math.round(annotation.col.g).toString(16);
  let b = Math.round(annotation.col.b).toString(16);
  if (r.length < 2) { r = "0"+r; }
  if (g.length < 2) { g = "0"+g; }
  if (b.length < 2) { b = "0"+b; }
  return "#"+r+g+b;
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
  box.className = "box";
  note.className = "note-text";
  note.style.fontSize = annotation.fontSize;
  let colString = annotationColorString(annotation);
  box.style.backgroundColor = colString;
  note.style.backgroundColor = colString;
  div.appendChild(box);
  div.appendChild(note);
  div.annotation = annotation;
  annotation.elem = div;

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
  updatePropertiesPanel(annotation);
  updateAnnotationElement(div);
  return div;
}

function updatePropertiesPanel(annotation) {
  let colString = annotationColorStringHex(annotation);
  let alphaString = Math.round(annotation.col.a * 100).toString();
  properties.x.innerText = Math.round(annotation.x);
  properties.y.innerText = Math.round(annotation.y);
  properties.w.innerText = Math.round(annotation.w);
  properties.h.innerText = Math.round(annotation.h);
  properties.color.value = colString;
  properties.alpha.value = alphaString;
  properties.tag.value = annotation.text;
  properties.fontSize.value = annotation.fontSize;
  properties.circle.checked = annotation.circle;
}

function updateAnnotationElement(elem) {
  const annotation = elem.annotation
  const box = elem.getElementsByClassName("box")[0];
  const note = elem.getElementsByClassName("note-text")[0];
  annotation.w = Math.max(annotation.w, 1);
  annotation.h = Math.max(annotation.h, 1);
  annotation.x = Math.max(Math.min(annotation.x, imgWidth-annotation.w), 0);
  annotation.y = Math.max(Math.min(annotation.y, imgHeight-annotation.h), 0);
  note.innerText = annotation.text;
  elem.style.translate = annotation.x+"px " + annotation.y+"px";
  box.style.width = annotation.w + "px";
  box.style.height = annotation.h + "px";
  box.style.minwidth = annotation.w + "px";
  box.style.minheight = annotation.h + "px";
  let colString = annotationColorString(annotation);
  box.style.backgroundColor = colString;
  note.style.backgroundColor = colString;
  note.style.fontSize = annotation.fontSize + "px";
  note.style.top = "-" + (annotation.fontSize * 2 + 9) + "px";
  if (annotation.circle) {
    box.style.borderRadius = "50%";
  } else {
    box.style.borderRadius = "5px";
  }

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
  updatePropertiesPanel(annotation);
}

function regenerateAnnotations() {
  while (annotationsContainer.firstChild) {
    annotationsContainer.removeChild(annotationsContainer.firstChild);
  }
  if (imageIndex > -1) {
    for (const annotation of images[imageIndex].annotations) {
      annotationsContainer.appendChild(annotationElement(annotation));
    }
    let preview = imageList.getElementsByClassName("image-preview")[imageIndex];
    let noteCount = preview.getElementsByClassName("annotation-count")[0];
    noteCount.innerText = images[imageIndex].annotations.length + " Anotações";
  }
}

function setMainImage(index) {
  imageIndex = index;
  selectNote(null);
  selectedHandle = null;
  if (index == -1) {
    mainImage.style.display = "none";
    while (annotationsContainer.firstChild) {
      annotationsContainer.removeChild(annotationsContainer.firstChild);
    }
  } else {
    mainImage.src = images[index].url;
    cam = { x: 0, y: 0, scale: 1 };
    imgWidth = mainImage.width;
    imgHeight = mainImage.height;
    cam.x = viewport.clientWidth / 2 - mainImage.width / 2
    cam.y = viewport.clientHeight / 2 - mainImage.height / 2
    viewportItems.style.translate = cam.x + "px " + cam.y +"px";
    viewportItems.style.scale = cam.scale;
    mainImage.style.display = "flow";
    regenerateAnnotations();
  }

}

function createImagePreview(image, num) {
  const imgElement  = document.createElement("img"); 
  const previewElement = document.createElement("div");
  const nameElement = document.createElement("p");
  const noteCount = document.createElement("p");
  const div = document.createElement("div");
  noteCount.innerText = image.annotations.length + " Anotações";
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

function updateImageList() {
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

async function onFilePick() {
  for (const img of filePicker.files) {
    let buffer = new Uint8Array(await img.arrayBuffer());
    let newImg = {
      name: img.name, 
      url: URL.createObjectURL(img), 
      data: "data:"+img.type+";base64,"+buffer.toBase64(),
      annotations: []
    }
    images.push(newImg); 
  }
  updateImageList();
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
    selectNote(selectedHandle.note);
    properties.div.style.visibility = "visible";
    updatePropertiesPanel(selectedHandle.note.annotation);
  } else  if (note) {
    selectedHandle= null;
    selectNote(note);
    properties.div.style.visibility = "visible";
    updatePropertiesPanel(selectedNote.annotation);
  } else {
    if (mode == "select") {
      properties.div.style.visibility = "hidden";
      selectedHandle= null;
      selectNote(null);
    } else {
      const viewportRect = this.getBoundingClientRect();
      let n = newAnnotation();
      n.x = (e.clientX - viewportRect.left - cam.x)/ cam.scale - n.w;
      n.y = (e.clientY - viewportRect.top - cam.y)/ cam.scale - n.h;
      images[imageIndex].annotations.push(n);
      regenerateAnnotations();
      selectedHandle = n.elem.getElementsByClassName("handle")[3];
    }
  }
}, true);

  viewport.addEventListener("drop", async function(e) {
  e.preventDefault();
  for (const img of e.dataTransfer.files) {
    let buffer = new Uint8Array(await img.arrayBuffer());
    let newImg = {
      name: img.name, 
      url: URL.createObjectURL(img), 
      data: "data:"+img.type+";base64,"+buffer.toBase64(),
      annotations: []
    }
    images.push(newImg); 
  }
  updateImageList();
});

viewport.addEventListener("dragover", function(e) {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === "file",
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (fileItems.some((item) => item.type.startsWith("image/"))) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }
});

window.addEventListener("dragover", (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === "file",
    );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (!viewport.contains(e.target)) {
      e.dataTransfer.dropEffect = "none";
    }
  }
});

window.addEventListener("drop", (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
    e.preventDefault();
  }
});

viewport.addEventListener("wheel", function(e) {
  camZoom(e.deltaY / 100.0);
});
mainImage.style.display = "none";

function parseColor(hex) {
  let color = {r: 0, g:0, b: 0};
  color.r = parseInt(hex.slice(1, 3), 16);
  color.g = parseInt(hex.slice(3, 5), 16);
  color.b = parseInt(hex.slice(5, 7), 16);
  return color;
}

properties.color.addEventListener("input", function(e) {
  if (selectedNote) {
    let color = parseColor(this.value);
    selectedNote.annotation.col.r = color.r;
    selectedNote.annotation.col.g = color.g;
    selectedNote.annotation.col.b = color.b;
    updateAnnotationElement(selectedNote);
  }});


properties.alpha.addEventListener("input", function(e) {
  if (selectedNote) {
    selectedNote.annotation.col.a = parseInt(this.value) / 100;
    updateAnnotationElement(selectedNote);
  }});

properties.tag.addEventListener("input", function(e) {
    if (selectedNote) {
    selectedNote.annotation.text = this.value;
    updateAnnotationElement(selectedNote);
  }});
properties.fontSize.addEventListener("input", function(e) {
    if (selectedNote) {
    selectedNote.annotation.fontSize = parseInt(this.value);
    updateAnnotationElement(selectedNote);
  }});
properties.circle.addEventListener("input", function(e) {
    if (selectedNote) {
    selectedNote.annotation.circle = this.checked;
    updateAnnotationElement(selectedNote);
  }});

buttons.select.addEventListener("click", function(e) {
  this.className = "tool-button current";
  buttons.draw.className = "tool-button";
  mode = "select";
});
buttons.draw.addEventListener("click", function(e) {
  this.className = "tool-button current";
  buttons.select.className = "tool-button";
  mode = "draw";
});
buttons.zoomOut.addEventListener("click", function(e) {
  camZoom(-5/100.0);
});
buttons.zoomIn.addEventListener("click", function(e) {
  camZoom(5/100.0);
});
buttons.zoomDisplay.addEventListener("click", function(e) {
  camSetZoom(1.0);
});
buttons.delete.addEventListener("click", function(e) {
  if (selectedNote) {
    images[imageIndex].annotations.splice(images[imageIndex].annotations.indexOf(selectedNote.annotation), 1);
    regenerateAnnotations();
    selectNote(null);
    properties.div.style.visibility = "hidden";
  }
});
buttons.remove.addEventListener("click", function(e) {
  if (imageIndex == -1) return;
  images.splice(imageIndex, 1);
  if (images.length == 0)  {
    setMainImage(-1);
  } else {
    while (imageIndex >= images.length) {
      imageIndex--;
    }
    setMainImage(imageIndex);
  }
  updateImageList();
});
buttons.export.addEventListener("click", function(e) {
  exportJSON();
});
buttons.import.addEventListener("input", function(e) {
  importJSON(this.files[0]);
});
properties.div.style.visibility = "hidden";
