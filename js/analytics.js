let gmatData = []
let lineData = []
let lineLables = []
let radarLables = []
let radarData = []
let dataAttr=['Problem Solving','Data Sufficiency','Critical Reasoning','Sentence Correction']

// 1. FETCH DATA FROM THE DATABASE AND HIDING UNNECESSARY DATA OF THE PAGE
axios.get('http://127.0.0.1:8000/api/get_answers').then(res => {
  gmatData = res.data;
  console.log(gmatData)
}).catch(err => console.log(err))

function convertData(num){
    let sum = 0
    let n = 0
    gmatData.forEach(elem => {
        if(!elem.answers.length) return;
        else{
            elem.answers.forEach( answ =>{
                if(answ.question_number === num)
                    {
                        sum += answ.time_spent
                        n++
                    }
            })
        }
    })
    if(n!==0)
        return sum/n/100
}

function gradesCalc(){

    let arr = []
    dataAttr.forEach(attrib =>
        {   
            let nCorr = 0
            let nTot = 0
            gmatData.forEach(elem => {
                if(!elem.answers.length) return;
                else{
                    if(elem.question_type === attrib)
                    {
                        nTot+=elem.answers.length
                        nCorr+=elem.answers.filter(e => e.correct).length
                    }
                }
            })
            console.log(nCorr)
            console.log(nTot)
            if (nTot!==0)
                arr.push(nCorr/nTot*5)
            else
                arr.push(0)
        })
    return  arr
}

function getLastAnswers () {
    let mx = 0
    gmatData.forEach(elem => {
        if(!elem.answers.length) return;
        else{
            elem.answers.forEach(answ =>{
                if (answ.id > mx)
                    mx = answ.id 
            })
        }
    })
    let arr = []
    let lbl
    let nCorr = 0
    let timeTot = 0
    let mxTime = 0
    for(let i=(mx-4); i<=mx; i++)
    {
        gmatData.forEach(elem => {
            if(!elem.answers.length) return;
            else{
                lbl = elem.question_type
                elem.answers.forEach(answ =>{
                    if (answ.id === i)
                    {
                        arr.push(answ.time_spent/100)
                        if (answ.correct)
                        {   
                            nCorr ++
                            timeTot += answ.time_spent
                            if(mxTime<answ.time_spent)
                                mxTime = answ.time_spent
                        }

                    }
                })
            }
        })
    }
    document.getElementById("score_correct").innerHTML = `${nCorr}/5`
    document.getElementById("fastest").innerHTML = Math.floor(mxTime/60)
    if (nCorr!==0)
        document.getElementById("averagest").innerHTML = Math.floor((timeTot/nCorr)/60)
    else
        document.getElementById("averagest").innerHTML = 0 
    let theScore = (650 + Math.floor((100/5)*nCorr))
    document.getElementById("big_num").innerHTML = theScore
    return {"lable":lbl, "data":arr, "correct": nCorr }
}

function pushToRadar(res) {
    let arr = []
    dataAttr.forEach( elem => {
        if(res.lable === elem)
        {
            console.log(elem)
            arr.push(res.correct/5)
        }
        else
            arr.push(0)
    })
    return arr
}



document.getElementById("quant").onclick = () => {
    lineData = []
    lineLables = []
    for(let i=1; i<6; i++)
    {
        lineLables.push(`Q ${i}`)
        lineData.push(convertData(i))
    }
    let currentObject = getLastAnswers()
    console.log(currentObject)

    new Chart(document.getElementById("line-chart").getContext('2d'), {
        type: 'line',
        data: {
            labels: lineLables,
            datasets: [{
                label: "Overall performance",
                data: lineData,
                borderColor: "darkgray",
                fill: false,
            },
            {
                label: "Your performance",
                data: currentObject.data,
                borderColor: "brown",
                fill: false,
            },
        ],
        },
        options: {
            title: {
              display: true,
              text: 'Average time spent per question'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },    
                    scaleLabel: {
                        display: true,
                        labelString: '[sec]',
                        position: 'left',
                      }
                }]
            }          
        }
    });
    radarData = gradesCalc()
    console.log(radarData)
    console.log(currentObject)
    let resRadarData = pushToRadar(currentObject)
    console.log(resRadarData)
    new Chart(document.getElementById("radar-chart").getContext('2d'), {
        type: 'radar',
        data: {
            labels: dataAttr,
            datasets: [{
                label: "Total",
                borderColor: "darkgrey",
                pointBorderColor: "darkgrey",
                pointBackgroundColor: "darkgrey",
                data: radarData,
                borderColor: "darkgrey",
                fill: false,  
            },
            {
                label: "Your Score",
                borderColor: "brown",
                pointBorderColor: "#fff",
                pointBackgroundColor: "brown",
                data: resRadarData,
                borderColor: "brown",
                fill: false,  
            },],
        },
        options: {
            title: {
              display: true,
              text: 'Average scores per question'
            },
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 5,
                    min: 0,
                    stepSize: 1
                }
            }
          }
    });
    
}







