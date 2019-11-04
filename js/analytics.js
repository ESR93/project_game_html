let gmatData = []
let lineData = []
let lineLables = []
let barLables = []
let barData = []
let dataAttr=['Problem Solving','Data Sufficiency','Critical Reasoning','Sentence Correction']

// 1. FETCH DATA FROM THE DATABASE AND HIDING UNNECESSARY DATA OF THE PAGE
axios.get('http://127.0.0.1:8000/api/get_answers').then(res => {
  gmatData = res.data;
  console.log(gmatData)
  let currentObject = getLastAnswers ()
  console.log(currentObject)
}).catch(err => console.log(err))

function convertData(num){
    let avg = 0
    let n = 0
    gmatData.forEach(elem => {
        if(!elem.answers.length) return;
        else{
            elem.answers.forEach( answ =>{
                if(answ.question_number === num)
                    {
                        console.log(num)
                        console.log(answ.time_spent)
                        avg += answ.time_spent
                        n++
                    }
            })
        }
    })
    if(n!==0)
        return avg/n
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
    console.log(mx)
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
                        arr.push(answ.time_spent)
                        if (answ.correct)
                        {   
                            console.log(elem)
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


document.getElementById("quant").onclick = () => {
    lineData = []
    lineLables = []
    for(let i=1; i<6; i++)
    {
        lineLables.push(`${i}`)
        lineData.push(convertData(i))
    }
    console.log(lineData)
    console.log(lineLables)

    new Chart(document.getElementById("line-chart").getContext('2d'), {
        type: 'line',
        data: {
            labels: lineLables,
            datasets: [{
                lable: "Your performance",
                data: lineData,
                borderColor: "#3e95cd",
                fill: false,
            },],
        },
        options: {
            title: {
              display: true,
              text: 'Average time spent per question'
            }
          }
    });

    new Chart(document.getElementById("radar-chart").getContext('2d'), {
        type: 'radar',
        data: {
            lables: dataAttr,
            datasets: [{
                lable: "Total",
                backgroundColor: "rgba(179,181,198,0.2)",
                borderColor: "rgba(179,181,198,1)",
                pointBorderColor: "#fff",
                pointBackgroundColor: "rgba(179,181,198,1)",
                data: [3,4,5,4,5],
                borderColor: "#3e95cd",
                fill: false,   
            },],
        },
        options: {
            title: {
              display: true,
              text: 'Average scores per question'
            }
          }
    });
    
}







