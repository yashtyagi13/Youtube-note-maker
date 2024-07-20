let btn = document.getElementById('get_time')
let span = document.getElementById('box')

// Send a message to content.js to get the video duration when the extension button is clicked
let ComingArray = {};
let pageUrl = null;
let VideoTitle = null;
let videoId = null;
document.getElementById('MergeFilesButton').addEventListener('click', mergeFiles);
document.getElementById('mergeInput').addEventListener('click', (e) => {
  console.log("Ich");
  e.stopPropagation();
});
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  pageUrl = tabs[0].url;
  if (pageUrl.includes("youtube.com/watch")) {
    const queryParameters = pageUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    videoId = urlParameters.get("v");
    document.getElementById('CopyVideoIdBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(videoId);
    })
    document.getElementById('optionsButton').addEventListener('click', () => {
      console.log("options button clicked", document.getElementById('ButtonContainer').style);
      if (document.getElementById('ButtonContainer').style.display == 'none' || document.getElementById('ButtonContainer').style.display == '') {
        document.getElementById('ButtonContainer').style.display = 'flex';
      } else {
        document.getElementById('ButtonContainer').style.display = 'none';
      }
    })
    let ImagesArray = [];
    await chrome.storage.local.get("ImagesArray").then((result) => {
      if (result.ImagesArray && videoId && result.ImagesArray[videoId]) {
        ImagesArray = [...result.ImagesArray[videoId]];
      }
    });
    if (ImagesArray.length > 0) {
      VideoTitle = ImagesArray[0][3];
      const Container = document.getElementById('container');
      const title = document.createElement('h1');
      title.style.display = 'flex';
      title.style.justifyContent = 'center';
      title.style.marginBottom = '20px';
      title.innerHTML = VideoTitle;
      Container.appendChild(title);
      ImagesArray.map((src) => {
        const image = document.createElement('img');
        image.src = src[0];
        image.style.width = '100%';
        const a = document.createElement('a');
        a.href = src[1];
        a.appendChild(image);
        Container.appendChild(a);
        if (src[2] != "") {
          const note = document.createElement('p');
          note.style.fontSize = '15px';
          note.innerText = src[2];
          Container.appendChild(note);
        }
      })
    }
  }
});
async function mergeFiles(e) {
  e.stopPropagation();
  const mergeInput = document.getElementById('mergeInput');
  const mergeInputValue = mergeInput.value;
  if (mergeInputValue != "") {
    let ImagesArray = {};
    await chrome.storage.local.get("ImagesArray").then((result) => {
      if (result.ImagesArray) {
        console.log(result.ImagesArray);
        ImagesArray = { ...result.ImagesArray };
      }
    });
    if (ImagesArray[mergeInputValue]) {
      ImagesArray[videoId] = [...ImagesArray[mergeInputValue], ...ImagesArray[videoId]];
      chrome.storage.local.set({ ImagesArray: ImagesArray }).then(() => {
        console.log("Images array is set now");
      });
      window.location.reload();
    } else {
      alert("Please enter a valid video id to merge");
      mergeInput.value = "";
    }
  }
}

const downloadbtns = document.getElementById('downloadbtns');
downloadbtns.addEventListener('click', () => {
  convertHTMLtoPDF()
})
function convertHTMLtoPDF() {

  const Container = document.getElementById('container');

  var opt = {
    margin: [0.38, 0.5],
    filename: VideoTitle + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, allowTaint: true, letterRendering: true },
    pagebreak: { avoid: ['a', 'p'] },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(Container).save();
}

