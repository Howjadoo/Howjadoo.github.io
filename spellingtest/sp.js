// Don't touch below this line
var statementSuccess = ["Hooray!", "You got it!", "That's right!", "Nice job!", "Way to go!", "Outstanding!", "You're great!", "Terrific!", "Wonderful!", "Wow, you did it!"]

var synth = speechSynthesis;
var flag = false;

var voiceSelect = document.querySelector('#voices');
var voices = [];

//https://www.hongkiat.com/blog/text-to-speech/
onload = function() {
  if ('speechSynthesis' in window) {
    
    voiceSelect = document.querySelector('#voices');
    
    // Load last list of words
    if (localStorage.getItem("lastListOfSpellingWords") != null) {
      document.getElementById("userListOfWords").value = localStorage.getItem("lastListOfSpellingWords")  
    }    

    document.querySelectorAll('#userListOfWords').forEach(item => {
      item.addEventListener('focus', itm => {
        document.getElementById("instrux1").innerHTML = "Click outside of this box to start the spelling test"
        item.style.background = "#FFF";
        var tbl = document.querySelector('#spellingtest')
        tbl.innerHTML = "";
        return true
      })
    })

    document.querySelectorAll('#userListOfWords').forEach(item => {
      item.addEventListener('blur', itm => {
        document.getElementById("instrux1").innerHTML = "Click the black box to enter your list of spelling words"
        item.style.background = "#000";
        localStorage.setItem("lastListOfSpellingWords", document.getElementById("userListOfWords").value);
        reloadSpellingTest()
        return true
      })
    })

    initiateSynth()
    reloadSpellingTest()
    
    if (synth.speaking) {
      /* stop narration */
      /* for safari */
      flag = false;
      synth.cancel();
    }

  } else {
    msg = document.createElement('h5');
    msg.textContent = "Detected no support for Speech Synthesis";
    msg.style.textAlign = 'center';
    msg.style.backgroundColor = 'red';
    msg.style.color = 'white';
    msg.style.marginTop = msg.style.marginBottom = 0;
    document.body.insertBefore(msg, document.querySelector('#SpeechSynthesis'));
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }

  return array;
}

function reloadSpellingTest() {

  function buildWordList() {

    var tbl = document.querySelector('#spellingtest')
    tbl.innerHTML = "";
    tbl.insertRow(-1).insertCell(0).innerHTML = 'Spell these words (hit enter to hear the word)'

    shuffle(document.getElementById("userListOfWords").value.trim().split('\n')).forEach(w => {
      w = w.trim()
      console.log(w)
      if (w != '') {
      	rw = tbl.insertRow(-1)
        rw.insertCell(0).innerHTML = '<span class="sayword">Say Word</span><span class="theword">' + w + '</span><input class="thetest" type="text" length="50" autocomplete="off" autocorrect="off" autocapitalize="off" /><span class="yougotit"></span>';
    	}
    })
  }

  buildWordList()

  document.querySelectorAll('.sayword').forEach(item => {
    item.addEventListener('click', event => {
      playWord(item.parentElement.querySelector('.theword').textContent)
    })
  })

  document.querySelectorAll('.thetest').forEach(item => {
    item.addEventListener('click', event => {
      playWord(item.parentElement.querySelector('.theword').textContent)
    })

    item.addEventListener('focus', event => {
      playWord(item.parentElement.querySelector('.theword').textContent)
    })

    item.addEventListener('input', event => {
      wordChanged(item, event)
    })
                          
    item.addEventListener('keyup', event => {
      wordChanged(item, event)
    })
    
     /* w = item.parentElement.querySelector('.theword').textContent.toLowerCase()
      if (item.value.toLowerCase() == w) { // if the word is now spelled correctly
        if (event.keyCode != 13) { // only run if the key wasn't the enter key, otherwise ignore; prevents users from pressing enter and interrupting sound
          var s1 = randomChoice(statementSuccess)
          item.parentElement.querySelector('.thetest').style.background = "#CCFFCC";
          item.parentElement.querySelector('.yougotit').textContent = "✔️ " + s1
          playWord(s1)
        }
      } else {
        if (event.keyCode === 13) { //play the word if not yet spelled correctly and enter key is pressed
          playWord(item.parentElement.querySelector('.theword').textContent)
        }
        item.parentElement.querySelector('.thetest').style.background = "#FFF";
        item.parentElement.querySelector('.yougotit').textContent = ""
      }
    })*/
  })

}

function playWord(w) {
  onClickStop()
  document.querySelector('#texttospeech').textContent = w
  onClickPlay()
}

function initiateSynth() {
  populateVoiceList()
  //populateVoiceList();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }
}


function populateVoiceList() {
  voices = synth.getVoices().sort(function(a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    if (aname < bname) return -1;
    else if (aname == bname) return 0;
    else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';

  //get cookie voice
  //var cookievoice = getCookie('SpeechSynthesisVoice');
  var cookievoice = localStorage.getItem("SpeechSynthesisVoice");

  for (i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);

    //add selcted to option if if cookievoice
    if (cookievoice === voices[i].name) {
      selectedIndex = i;
      option.setAttribute('selected', 'selected');
    }
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}


//end select voices

function onClickPlay() {
  if (!flag) {
    flag = true;
    utterance = new SpeechSynthesisUtterance(document.querySelector('#texttospeech').textContent);
    //utterance.voice = synth.getVoices()[0];

    //add voice//
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for (i = 0; i < voices.length; i++) {
      //if(voices[i].name === 'Google UK English Female') {
      if (voices[i].name === selectedOption) {
        utterance.voice = voices[i];

        localStorage.setItem("SpeechSynthesisVoice", selectedOption);
        break;
      }
    }

    voiceSelect.onchange = function() {
      onClickStop();
      onClickPlay();
    }
    //and add voice

    utterance.onend = function() {
      flag = false;
    };
    synth.speak(utterance);

    //fix stop after a while bug
    let r = setInterval(() => {
      console.log(speechSynthesis.speaking);
      if (!speechSynthesis.speaking) {
        clearInterval(r);
      } else {
        speechSynthesis.resume();
      }
    }, 14000);
    //end fix stop after a while bug
  }
  if (synth.paused) {
    /* unpause/resume narration */
    synth.resume();
  }
}

function onClickPause() {
  if (synth.speaking && !synth.paused) {
    /* pause narration */
    synth.pause();
  }
}

function onClickStop() {
  if (synth.speaking) {
    /* stop narration */
    /* for safari */
    flag = false;
    synth.cancel();
  }
}

function wordChanged(item, event) {
  w = item.parentElement.querySelector('.theword').textContent.toLowerCase()
  if (item.value.toLowerCase() == w) { // if the word is now spelled correctly
    if (event.keyCode != 13) { // only run if the key wasn't the enter key, otherwise ignore; prevents users from pressing enter and interrupting sound
      var s1 = randomChoice(statementSuccess)
      item.parentElement.querySelector('.thetest').style.background = "#CCFFCC";
      item.parentElement.querySelector('.yougotit').textContent = "✔️ " + s1
      playWord(s1)
    }
  } else {
    if (event.keyCode === 13) { //play the word if not yet spelled correctly and enter key is pressed
      playWord(item.parentElement.querySelector('.theword').textContent)
    }
    item.parentElement.querySelector('.thetest').style.background = "#FFF";
    item.parentElement.querySelector('.yougotit').textContent = ""
  }
}

function randomChoice(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}
