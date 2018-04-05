let csv = require('fast-csv');
let centres = [],
    k;

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('Enter number of clusters to generate: ');
rl.prompt();
rl.on('line', function(line) {
    k = parseInt(line);
    rl.close();
}).on('close',function(){
    let count = 0;
    let header, data=[];
    csv.fromPath('./data3.csv').on('data',(result)=>{
        result = result.map((r, i)=>{
            return parseFloat(parseFloat(r).toFixed(6));
        });
        data.push(result);
    }).on('end', ()=>{
        let picked = [], clusters=[];
        for(let i = 0; i < k;){
            let centre = randrange(0, data.length);
            if(!picked.includes(centre)){
                centres.push(data[centre]);
                clusters.push([]);
                i++;
            }
        }
        let pCentre=[];
        while(!aequal(pCentre, centres)){
            data.forEach((d, i)=>{
                let min = Infinity, selected;
                centres.forEach((c,i)=>{
                    let dist = eDist(c,d);
                    if(dist < min){
                        min = dist;
                        selected = i;
                    }
                })
                clusters[selected].push(d);
            })
           console.log(clusters.map((c)=>{
               return (100 * c.length / data.length).toFixed(2)+"%";
           }));

            pCentre = centres;
            centres = calcNewCentres(clusters);
            clusters.forEach((c,i)=>{
                clusters[i]=[];
            });
        }
    })
});
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