let centres = [],
    k = 3;
let opacity = 1;
let count = 0;
let header, data=[];
var margin = {top: 30, right: 50, bottom: 40, left:40};
var width = 1260 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    var xScale = d3.scaleLinear()
    .range([0, width]);

var yScale = d3.scaleLinear()
    .range([height, 0]);

var radius = d3.scaleSqrt()
    .range([1,3]);
var normalize = d3.scaleLinear().range([0,1])
var xAxis = d3.axisBottom()
    .scale(xScale);

var yAxis = d3.axisLeft()
    .scale(yScale);
let holdC;
let classVals=[];
let cv;
var color = d3.scaleOrdinal(d3.schemeCategory10);
d3.text('/data3.csv',(e,text)=>{
    let dat = text.split('\n');
    let columns = dat.shift().split(',');
    dat = dat.join('\n');    
    var data = d3.csvParseRows(dat, function(d) {
        if(columns.join(',').indexOf('Class') !== -1){
            let cval = d.splice(-1);
            classVals.push(parseInt(cval[0]));
        }
        return d.map(Number);
    });

    cv = new Set(classVals);
    let controls = document.getElementById('controls');
    let x = document.createElement('select');
    x.value = 0;
    let z = document.createElement('select');
    z.value = 1;
    for(let i = 0; i < data[0].length;i++){
        let y = document.createElement('option');
        y.value = i;
        y.name = i;
        y.innerHTML = columns[i];
        y.className = "option-x"
        if(i === 0){
            y.selected = "selected";
        }
        x.appendChild(y);
        y = document.createElement('option');
        y.value = i;
        y.name = i;
        if(i === 1){
            y.selected = "selected";
        }
        y.innerHTML = columns[i];
        y.className = "option-y"
        z.appendChild(y);
    }
    x.className = "select-x sel"
    x.id = "1";
    z.className = "select-y sel"
    z.id = "2";
    let v = document.createElement('input');
    v.type = 'number';
    v.value = 3;
    v.id = "numclusters";
    let w = document.createElement('button');
    w.innerHTML = 'Create new cluster';
    w.id = "submit";
    controls.appendChild(x);
    controls.appendChild(z);
    controls.appendChild(v);
    w.addEventListener('click',(e)=>{
        let vals = Array.from(document.getElementsByClassName('sel')).map((val)=>{
            return val.value;
        })
        count = 0;
        svg.selectAll('.value').remove();
        svg.selectAll('.centre').remove();
        let numclusters = parseInt(document.getElementById('numclusters').value);        
        cluster(parseInt(vals[0]),parseInt(vals[1]), data,numclusters)
    })
    controls.appendChild(w);

    for(let i = 0; i < data[0].length;i++){
        normalize.domain(d3.extent(data, function(d){
            return d[i];
        })).nice();
        data.forEach((d,j)=>{
            data[j][i] = normalize(data[j][i])
        })
    }    
    xScale.domain(d3.extent(data, function(d){
        return d[0];
    })).nice();
    yScale.domain(d3.extent(data, function(d){
        return d[1];
    })).nice();

    radius.domain(d3.extent(data, function(d){
        return d[0];
    })).nice();
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);

    svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);
    cluster(0,1, data,k);
});

function cluster(a1, a2, data,numclusters){  
    
    xScale.domain(d3.extent(data, function(d){
        return d[a1];
    })).nice();
    yScale.domain(d3.extent(data, function(d){
        return d[a2];
    })).nice();
    let clusters=[];
    let picked = [];
    let centres = [];
    for(let i = 0; i < numclusters;){
        let centre = randrange(0, data.length);
        if(!picked.includes(centre)){
            centres.push(data[centre]);
            clusters.push([]);
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
    })
    var bubble = svg.selectAll('.value')
    .data(data)
    .enter().filter((d,i)=>{
        if(cv.size > 2 || classVals.length === 0 || classVals[i] === 0)
            return true;
        else
            return false;
    }).append('circle')
    .attr('class', 'value bubble')
    .attr('cx', function(d){return xScale(d[a1]);})
    .attr('cy', function(d){ return yScale(d[a2]); })
    .attr('r', "4px")
    .style('stroke','black')
    .style('fill', function(d,i){ return color(selectedArr[i]); })

    var bubble = svg.selectAll('.value')
    .data(data)
    .enter().filter((d,i)=>{
        if(classVals[i] === 1)
            return true;
        else
            return false;
    }).append('rect')
    .attr('class', 'value squares')
    .attr('x', function(d){return xScale(d[a1]);})
    .attr('y', function(d){ return yScale(d[a2]); })
    .attr('height', "8px")
    .attr('width', "8px")
    .style('fill', function(d,i){ return color(selectedArr[i]); })
    .style('stroke','black')
    .style('opacity',opacity);
    let delayC = 0;
    while(!aequal(pCentre, centres)){
        delayC++;
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
        if(count === 0){
            svg.selectAll('.centre')
            .data(centresArr[count])
            .enter().append('circle')
            .attr('class', 'centre')
            .attr('cx', function(d){return xScale(d[a1]);})
            .attr('cy', function(d){ return yScale(d[a2]); })
            .attr('r', "10px")
            .style('fill', "black")
            .style('opacity',opacity);
            count++;
        }
        setTimeout(()=>{
            svg.selectAll('.value')
            .data(data)
            .style('fill', function(d,i){ return color(selectedArr[i]); })
            .style('opacity',opacity);

            svg.selectAll('.centre')
            .data(centresArr[count])
            .attr('cx', function(d){return xScale(d[a1]);})
            .attr('cy', function(d){ return yScale(d[a2]);})
            count++;
        },100*delayC)
        pCentre = centres;
        console.log(centres);
        
        centres = calcNewCentres(clusters);
        if(!aequal(pCentre, centres)){
            clusters.forEach((c,i)=>{
                clusters[i]=[];
            });
        }
    }
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