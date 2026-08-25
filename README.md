# project1-2026b-victormsferreira

# Projeto: Remake de aplicação web simples

![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")



## Acesso

[Link](https://elc1090.github.io/project1-2026b-victormsferreira/)


## Desenvolvedor(a)
Victor Mateus Severo Ferreira - Ciência da Computação


## App original

### Links

- [App Original](https://elc1090.github.io/demo-image-annotator/)
- [Repositório](https://github.com/elc1090/demo-image-annotator/deployments/github-pages)

### Descrição

O aplicativo original permite adicionar anotações a áreas de imagens.


## Demanda do(a) cliente

### Cliente
GUILHERME DE CEZARO MARTINI

### Demanda
1. Conseguir escolher cores diferentes para uma anotação
2. Controle da opacidade da anotação
3. Conseguir escolher entre anotações em forma de retângulo ou círculo
4. Adicionar um favicon pro site
5. Conseguir aumentar o tamanho da fonte das tags
6. Conseguir arrastar imagens pro editor
7. Conseguir importar CSV ou JSON das tags para uma imagem

## Desenvolvimento

### Processo
Iniciei o desenvolvimento pela funcionalidade que permite ao usuário carregar imagens e lista-las
em uma lista, permitindo o usuário clicar em uma imagem da lista e mostrando ela no viewport principal.
Esse funcionalidade usa a tag `input` do tipo `file` para abrir um file picker para o usuário, permitindo-o
escolher imagens, e após a seleção, o webapp carrega todas essas imagens e as adiciona a uma lista, após
carrega-las, o site gera um div para cada imagem e os adiciona como filhos de um div que organiza todas
essas imagens como previews, contendo uma thumbnail, o nome da imagem e o número de anotações

Após isso, implementei os controles de panning e zoom no viewport utilizando os eventos pointermove e
o atributo CSS `translate` e `scale`. Esses atributos são aplicados a um div que é filho do viewport principal
e contém a imagem principal na qual se está trabalhando e todas as anotações.

Após isso, implementei as anotações. Esse processo foi o mais difícil do trabalho, pois envolve
diferentes sistemas de coordenadas que precisam ser convertidos entre si, e deve-se evitar que eventos
se sobrepoem. Por exemplo, não se deve mover o panning se o usuário estiver tentando mover uma anotação e
mover as handles deve ter prioridade sobre mover a anotação. Após as anotações, foi criado o painél
de propriedades, que permite visualizar a posição e tamanho das anotações, modificar o texto e outras
propriedades requiridas pelas demandas.

No final implementei algumas mais funcionalidades com o menu de ferramentas e exportar/importar JSON.
A funcionalidade JSON teve dificuldades devido ao fato de que ela pode ser amba exportada e importada.
No original, era apenas necessário exporta-la, significando que era necessário apenas manter o nome
da imagem no arquivo, não a imagem em si. Como nesse remake era necessário a funcionalidade de importação,
foi necessário codificar a imagem em base64 para salva-la no json, permitindo reconstrui-la ao carregar.


### Trechos de código
Função que cria o elemento HTML para uma dada anotação:
```js
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
```

Carregamento de imagems:
```js
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
```

Parser de cores CSS (#RRGGBB) em um array RGB:
```js
function parseColor(hex) {
  let color = {r: 0, g:0, b: 0};
  color.r = parseInt(hex.slice(1, 3), 16);
  color.g = parseInt(hex.slice(3, 5), 16);
  color.b = parseInt(hex.slice(5, 7), 16);
  return color;
}
```

-- TODO --

## Tecnologias

### Linguagens e afins

- HTML
- CSS
- Javascript

### Ambiente de desenvolvimento

- Kakoune (WSL2)
- Testado no navegador Vivaldi
- Python para hospedar localmente

## Referências e créditos

- Documentação Mozilla https://developer.mozilla.org/en-US/




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
