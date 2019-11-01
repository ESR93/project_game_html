
// +++++++++++++++++++++++++++++++++|||DECLARATION OF INPUT VARIABLES|||+++++++++++++++++++++++++++++++++ 

// DATABASE REQUEST AND SENDING RELATED

// 1.PLACEHOLDERS FOR INPUTTING GMAT QUESTIONS DATA
let gmatData = []
let questionPost = []
let postArr = []
let finalRes

// 2.MAPPING OF DB ATTRIBUTES WITH JS CLASSES
let nodeClasses=['prob_solv', 'data_suf','critical','correct',]
let dataAttr=['Problem Solving','Data Sufficiency','Critical Reasoning','Sentence Correction',]

// COMPLETION PROCESS RELATED

// 1. NEW OBJECT OF CHRONOMETER CLASS
import Chronometer from './chronometer.js'
let chronometer = new Chronometer();

// 2.FLAGS FOR BUTTONS TO KNOW ON WHEN TO LAUNCH THE NEXT CHRONOMETER
let isStart = [false, false, false, false, false]

// 3.FLAGS TO POSITION WITING THE PROCESS OF COMPLITION

let state = {
  quant: false,
  verb: false,
  ready: false,
  done: false,
}
let gmatDOM = document.querySelectorAll('.gmat_block')[0]
console.log(gmatDOM)



// +++++++++++++++++++++++++++++++++|||DECLARATION OF FUNCTIONS|||+++++++++++++++++++++++++++++++++ 

// 1 CHRONOMETER RELATED

function printMinutes($btn) {
  let a = chronometer.twoDigitsNumber(chronometer.getMinutes())
  $btn.getElementsByClassName('minDec')[0].innerHTML = a[0]
  $btn.getElementsByClassName('minUni')[0].innerHTML = a[1]
}

function printSeconds($btn) {
  let a = chronometer.twoDigitsNumber(chronometer.getSeconds())
  $btn.getElementsByClassName('secDec')[0].innerHTML = a[0]
  $btn.getElementsByClassName('secUni')[0].innerHTML = a[1]
}

function printTime($btn,j) {
  if(isStart[j]){
    chronometer.startClick()
    document.secInt = setInterval(() => {
        printMinutes($btn)
        printSeconds($btn)
    },10)
  }
  return document.secInt
}

// 1 RELATED TO THE VISUALIZATION: HIDING / UNHIDING

function visibleBtn() {
  document.querySelectorAll('.quantbtn').forEach(function($btn){
      if (state.quant) {
        $btn.style.display = "block";
      }
      else {
        $btn.style.display = "none";
        gmatDOM.style.display = "none"
      }
    })
    document.querySelectorAll('.verbbtn').forEach(function($btn){
      if (state.verb) {
        $btn.style.display = "block";
      }
      else {
        $btn.style.display = "none";
        gmatDOM.style.display = "none"
      }
    })
  }

function valueCreator(input, num){
  let postGMAT = {
    "choice_id": null,
    "question_number": null,
    "time_spent": null,
    "correct": false
  }
  let formsGMAT = input.querySelectorAll('input')
  let f = false
  formsGMAT.forEach(function(elem)
    {
      if(elem.type="radio") { 
        if(elem.checked) {
          f = true
          postGMAT.choice_id=parseFloat(input.id)
          postGMAT.question_number=(num+1)
          postGMAT.time_spent=chronometer.currentTime
          postGMAT.correct=elem.value
        }
      }
    })
    if (f)
      return postGMAT
  }


function moveStuff () {
  document.getElementById('start_btn').onclick = () => {
  chronometer.stopClick()
  chronometer.resetClick()
  if (state.ready){
      let replacement = gmatDOM.querySelectorAll('.replecement')
      let $elem = gmatDOM.querySelectorAll('.widmid')
      $elem[0].style.display = 'flex'
      replacement[0].style.display = 'none'
      isStart[0] = true
      printTime($elem[0].querySelectorAll('.right_part')[0],0)
      for(let i=1;i<5;i++) {
        let $btn = $elem[i-1].querySelectorAll('.next_btn')
        $btn[0].onclick = () => {
          if (valueCreator($elem[i-1],(i-1)))
          {
            console.log((i-1))
            postArr.push(valueCreator($elem[i-1],(i-1)))
            chronometer.resetClick()
            $elem[i].style.display = 'flex'
            replacement[i].style.display = 'none'
            $elem[i-1].style.display = 'none'
            replacement[i-1].style.display = 'block'
            clearInterval(document.secInt)
            chronometer.stopClick()
            isStart[i] = true
          }
          else throw "Please select the choice first"
          printTime($elem[i].querySelectorAll('.right_part')[0],i)
          if(i===4)
          {
            state.done = true
          }
        }
      }
      $elem[4].querySelectorAll('.next_btn')[0].onclick = () => {
        chronometer.stopClick()
        if (valueCreator($elem[4],4))
            postArr.push(valueCreator($elem[4],4))
        if(state.done){
          postArr.forEach(elem => {
            console.log(elem)
            axios.post('http://127.0.0.1:8000/api/post',elem
            )
            .then(res => console.log(res))
            .catch(error => {
              console.log('Oh No! Error is: ', error)
              console.log(elem);
            })
          })
        }
        location.href = './stats.html';
      }
    }
  }
  return postArr
}


// +++++++++++++++++++++++++++++++++|||DOM MANIPULATION CODE|||+++++++++++++++++++++++++++++++++ 


// 1. FETCH DATA FROM THE DATABASE AND HIDING UNNECESSARY DATA ON THE PAGE
axios.get('http://127.0.0.1:8000/api/get').then(res => {
  gmatData = res.data;
  console.log(gmatData)
}).catch(err => console.log(err))

document.querySelectorAll('.quantbtn').forEach($btn => 
  $btn.style.display = "none"
)

document.querySelectorAll('.verbbtn').forEach($btn => 
  $btn.style.display = "none"
)
gmatDOM.style.display = "none"


// 2. DEFINING THE RULES FOR CLICKING OF THE MAIN
  document.getElementById('quant').onclick = function()
  {
      state.quant = true
      state.verb = false
      visibleBtn()
      chronometer.stopClick()
      chronometer.resetClick()
    
  }
  document.getElementById('verb').onclick = function()
  {
      state.quant = false
      state.verb = true
      visibleBtn()
      chronometer.stopClick()
      chronometer.resetClick()
    
  }

  nodeClasses.forEach(function(elem,i){
    document.getElementById(elem).onclick = () => 
{
      chronometer.stopClick()
      chronometer.resetClick()
      gmatDOM.style.display = "block"
      questionPost = gmatData.filter(item => item.question_type===dataAttr[i])
      console.log(questionPost)
      questionDisplay(questionPost)
      state.ready = true
      finalRes = moveStuff ()
    }
  })

  function questionDisplay (arr) {
    let randomArr = []
    let n = 0
    let i = 0
    do {
      n = Math.floor(Math.random()*arr.length)
      if(!(randomArr.includes(arr[n])))
      {
        randomArr.push(arr[n])
        i++
      }
    } while (i < 5);
    let cloneGmat = gmatDOM.querySelector('.widmid').cloneNode(true);
    gmatDOM.innerHTML='<div><button id="start_btn">START</button></div>';
    let gmatInput
    randomArr.forEach(function(elem,num) {
      cloneGmat.setAttribute('id',elem.id)
      cloneGmat.getElementsByClassName('q_number')[0].innerText = `QUESTION #${num+1}`
      if(elem.question_context!=='no')
        cloneGmat.getElementsByClassName('q_context')[0].innerText = elem.question_context
      else
        cloneGmat.getElementsByClassName('q_context')[0].innerText = ""
      if(elem.image!==null)      
        cloneGmat.getElementsByClassName('q_img')[0].innerText = `<img src='${elem.image}'>`
      else
        cloneGmat.getElementsByClassName('q_img')[0].innerText = ""

      cloneGmat.getElementsByClassName('q_text')[0].innerText = elem.question_text
      let answerForm = ''
      elem.choices.forEach(function(ans,i) {
        gmatInput = cloneGmat.querySelectorAll('input')[0].cloneNode(true)
        gmatInput.setAttribute("question_number", (i+1));
        gmatInput.name = elem.question_type
        gmatInput.value = ans.correct
        answerForm += gmatInput.outerHTML
        answerForm += ` ${ans.choices_text} <br>`
      })
      cloneGmat.querySelectorAll('span')[0].innerHTML = answerForm
      if (num===4)
        cloneGmat.querySelectorAll('button')[0].innerText = 'DONE'
        cloneGmat.style.display = 'none'
      gmatDOM.innerHTML += cloneGmat.outerHTML
      gmatDOM.innerHTML += `<div class='replecement'>QUESTION #${num+1}</div>`
    })
    console.log(gmatDOM.querySelector('.widmid'))
  }
