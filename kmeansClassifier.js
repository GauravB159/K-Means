let centres = [],
    k = 3;
let opacity = 1;
let training = [], testing = [];
let trainingC = [], testingC = [];
let count = 0;
let header, data=[];
var margin = {top: 30, right: 50, bottom: 40, left:40};
var width = 1260 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var normalize = d3.scaleLinear().range([0,1])
let holdC;
let classVals=[];
let cv, tv;
let clusterIndices = [];

function randRange(min, max){
    return Math.random() * (max - min) + min;
}

d3.text('/data3.csv',(e,text)=>{
    let dat = text.split('\n');
    let columns = dat.shift().split(',');
    dat = dat.join('\n');    
    d3.csvParseRows(dat, function(d) {
        let chance = randRange(0,100);
        if(chance < 70){
            let cval = d.splice(-1);
            trainingC.push(parseFloat(cval[0]));
            d = d.map(Number);
            training.push(d);

        }else{
            let tval = d.splice(-1);
            testingC.push(parseFloat(tval[0]));
            d = d.map(Number);
            testing.push(d);
        }
    });
    cv = new Set(trainingC);
    k = cv.size;
    cv = Array.from(cv);
    tv = new Set(testingC);
    tv = Array.from(cv);
    for(let i = 0; i < training[0].length;i++){
        normalize.domain(d3.extent(training, function(d){
            return d[i];
        })).nice();
        training.forEach((d,j)=>{
            training[j][i] = normalize(training[j][i])
        })
    }
    cluster(0,1, training,k);
});

function cluster(a1, a2, data,numclusters){  

    let clusters=[];
    let picked = [];
    let centres = [];
    clusterIndices = [];
    console.log(numclusters);
    for(let i = 0; i < numclusters;){
        let centre = randrange(0, data.length);
        if(!picked.includes(centre)){
            centres.push(data[centre]);
            clusters.push([]);
            clusterIndices.push([]);
            i++;
        }
    }    
    let pCentre=[];
    let count = 0;
    let centresArr = [];
    let selectedArr = [];
    data.forEach((d, i)=>{
        let min = Infinity, selected;
        centres.forEach((c,j)=>{
            let dist = eDist(c,d);
            if(dist < min){
                min = dist;
                selected = j;
            }
        })
        selectedArr.push(selected);
        clusters[selected].push(d);
        clusterIndices[selected].push(i);
    });
    console.log(clusterIndices);
    while(!aequal(pCentre, centres)){
        let selectedArr = [];
        data.forEach((d, i)=>{
            let min = Infinity, selected;
            centres.forEach((c,i)=>{
                let dist = eDist(c,d);
                if(dist < min){
                    min = dist;
                    selected = i;
                }
            })
            selectedArr.push(selected);
            clusters[selected].push(d);
        });
        centresArr.push(centres);
        pCentre = centres;
        centres = calcNewCentres(clusters);
        if(!aequal(pCentre, centres)){
            clusters.forEach((c,i)=>{
                clusters[i]=[];
            });
        }
    }
    let classes = {};
    clusterIndices.forEach((c,i)=>{
        classes[cv[i]] = mode(c);
    })
    classify(centres,classes)
}
function classify(centres,classes){
    let count = 0;
    testing.forEach((t,i)=>{
        let min = Infinity, selected;
        centres.forEach((c,j)=>{
            let dist = eDist(c,t);
            if(dist < min){
                min = dist;
                selected = j;
            }
        })
        if(classes[Object.keys(classes)[selected]] === testingC[i]){
            count++;
        }
    })
    if(count < 1000){
        count = testing.length - count;
    }
    console.log("Accuracy: " + ((count / testing.length)*100).toFixed(2)+"%");
}
function calcNewCentres(clusters){
    let newCentres = clusters.map((cluster)=>{
        let newC = [];
        cluster.forEach((c)=>{
            c.forEach((a,i)=>{
                if(newC[i]){
                    newC[i]+=a;
                }else{
                    newC[i] = a;
                }
            })
        })
        newC.forEach((n,i)=>{
            newC[i] = newC[i] / cluster.length;
            newC[i] = parseFloat(newC[i].toFixed(4))
        })
        return newC;
    })
    return newCentres;
}
function aequal(a1,a2){
    return a1.length==a2.length && a1.every((v,i)=>{
        if(v instanceof Array){
            return aequal(v,a2[i])
        }else{
            return v === a2[i]
        }
    });
}
function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
function randrange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function eDist(centre, instance){
    let dist = 0;
    centre.forEach((c,i)=>{
        ins = instance[i];
        dist = dist + (c - ins)*(c-ins);
    })
    dist = Math.sqrt(dist);    
    return parseFloat(dist.toFixed(4));
}