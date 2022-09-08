
var ROWS = 26;
var COLUMNS = 71;



var DEFAULT_WEIGHT=5
var TOTAL_NODES = ROWS * COLUMNS;


var GRAPH_MATRIX = new Array(ROWS).fill(DEFAULT_WEIGHT).map(row => new Array(COLUMNS).fill(DEFAULT_WEIGHT))
var WEIGHT_MATRIX = new Array(ROWS).fill(0).map(row => new Array(COLUMNS).fill(0))

var ANIMATION_SPEED_DEFAULT = 50; // 10 Nodes Per 1000 milliSecond
var ANIMATION_SPEED = 50;
var TIME_DELAY = 100;  

var STOP_SIMULATION = false;
var START_SIMULATION=false;

var DEFAULT_START_X=1
var DEFAULT_START_Y=2
var START_X=DEFAULT_START_X;
var START_Y=DEFAULT_START_Y;
var DEFAULT_START_OVERRIDE=false;

// var DEFAULT_DESTINATION_X=7
// var DEFAULT_DESTINATION_Y=8

var DEFAULT_DESTINATION_X=22
var DEFAULT_DESTINATION_Y=62
var DESTINATION_X=DEFAULT_DESTINATION_X
var DESTINATION_Y=DEFAULT_DESTINATION_Y
var DEFAULT_DESTINATION_OVERRIDE=false;

var DEFAULT_START_CHANGED=false
var DEFAULT_DESTINATION_CHANGED=false
var ShortestPath=[]

let HEURISTIC="manhattan"
let HEURISTIC_VALUE=10

let cutPossible=true;
let pastePossible=false;
let elementclass=""
let disableRightClick=true;








window.onload = function () {
    // GenerateNewRandomGraph()

    if(disableRightClick){

        document.addEventListener('contextmenu', event => event.preventDefault());
    }

    GenerateGraph();
    TakeAnimationSpeed();
    // TakeHeuristicValue()    
    AddEventListeners();
    myLoad()
    // convertUserGraphToMatrix()
}

function AddEventListeners() {


    var startSimulation = document.getElementById("startSimulation")
    startSimulation.addEventListener("click", StartSimulation)
    
    var redrawGraph = document.getElementById("redrawGraph")
    redrawGraph.addEventListener("click", RedrawGraph)
    
    var stopSimulation = document.getElementById("stopSimulation")
    stopSimulation.addEventListener("click", StopSimulation)
    
    var newRandomGraph = document.getElementById("generateNewGraph")
    newRandomGraph.addEventListener("click", GenerateNewRandomGraph)
    
    var graph=document.getElementById("graph")
    graph.addEventListener("click",addBlocks )
    graph.addEventListener("mousedown",moveStartDestination )


}

function myLoad(){
    
    var modal = document.getElementById("tutorial");
    
    var btn = document.getElementById("helpButton");
    
    var span = document.getElementsByClassName("close")[0];
    
    btn.onclick = function() {
      modal.style.display = "block";
    }
    
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

}

function StartSimulation(){
    var selectAlgo=document.getElementById("selectAlgoId")
    console.log(selectAlgo)
    console.log(selectAlgo.value)

    let algo=selectAlgo.value

    if(algo=="dij"){
        StartDijSimulation()
    }else if(algo=="ast"){

        loadHeuristics()
        StartSimulationAStar()
    }else if(algo=="dfs"){
        StartSimulationDFS()
    }else if (algo=="bfs"){
        StartSimulationBFS()
    }else{
        console.log("Error In Selection")
    }

}

function loadHeuristics(){
    console.log("Loading Heuristics");
    var selectHeu=document.getElementById("selectHeuId")
    // console.log("element",selectHeu)
    console.log("value",selectHeu.value)

    var selectHeuVal=document.getElementById("selecHeuValId")
    // console.log(selectHeuVal)
    console.log(selectHeuVal.value)
    HEURISTIC_VALUE=selectHeuVal.value
}


function moveStartDestination(event){
    let start="start"
    let destination="destination"
    let targetedElement=event.target.classList[0]
    if(targetedElement == start || targetedElement ==destination || !cutPossible){
        console.log(targetedElement);
        if (event.buttons==2){
            if(cutPossible){
                console.log("Cut: ")
                elementclass=event.target.classList[0]
                let eid=event.target.id
                eid = eid.split("-")[1]
                eid = eid.split(",")
                eid.forEach((e,i,arr)=>{
                    arr[i]=Number(e)
                })
                console.log(GRAPH_MATRIX[eid[0]][eid[1]])
                console.log(eid);
                let w=GRAPH_MATRIX[eid[0]][eid[1]]
                console.log(elementclass)  
                let newClassName="initialNode" + w.toString()
                event.target.setAttribute("class", newClassName)
                cutPossible=!cutPossible
                }else{
                    console.log("Paste: ")
                    event.target.setAttribute("class",elementclass)
                    elementclass=""
                    cutPossible=!cutPossible
            }     
        }
    }
}

function GenerateNewRandomGraph(){
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            let weightIntensity=Math.floor(Math.random() * (3) + 1)
            let id = "node-" + row.toString() + "," + col.toString();
            let element = document.getElementById(id)
            GRAPH_MATRIX[row][col]=weightIntensity
            if(row==START_X && col==START_Y){
                element.className='start'
            }else if(row==DESTINATION_X && col==DESTINATION_Y){
                element.className='destination'
            }else{
                element.className="initialNode"+weightIntensity.toString();
            }
        }
    }

}

function convertUserGraphToMatrix() {
    console.log("Convert User Graph To Matrix");
    let html_graph = document.getElementById("graph");

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            let id = "node-" + row.toString() + "," + col.toString();
            let element = document.getElementById(id)
            if (element.className=="start"){
                if(row!=DEFAULT_START_X || col != DEFAULT_START_Y){
                    DEFAULT_START_X=row
                    DEFAULT_START_Y=col
                    START_X=row
                    START_Y=col
                    DEFAULT_START_OVERRIDE=true;
                    console.log("Starting Location Changed");
                }
                GRAPH_MATRIX[row][col]="S"
            }else if(element.className=="destination"){
                if(row!=DEFAULT_DESTINATION_X || col != DEFAULT_DESTINATION_Y){
                    DEFAULT_DESTINATION_X=row
                    DEFAULT_DESTINATION_Y=col
                    DESTINATION_X=row
                    DESTINATION_Y=col
                    DEFAULT_DESTINATION_OVERRIDE=true;
                    console.log("Deatination Location Changed");
                }
                GRAPH_MATRIX[row][col]="D"
            }else if(element.className=='block'){
                GRAPH_MATRIX[row][col]="X"
            }else{
            }
        }
    }
}

async function drawPath() {
    console.log("Drawing Path")
    for (let i = 0; i < ShortestPath.length; i++) {
        let value=ShortestPath[i]
        let elementX=value[0]
        let elementY=value[1]
        let id = "node-"+elementX.toString()+","+elementY.toString()
        let element=document.getElementById(id)
        element.className="path"
        await drawPathTimer(TIME_DELAY)
    }
} //draw path


const drawPathTimer = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function StopSimulation() {
    STOP_SIMULATION = true
}

async function StartSimulationDFS(){
    console.log("Simulation Started: DFS");
    convertUserGraphToMatrix()
    let graph = new Graph(GRAPH_MATRIX);
    let path = graph.dfs()
    await drawPathDFS(path);
}


async function drawPathDFS(arr) {
    console.log("Drawing Path DFS")
    for (let i = 0; i < arr.length; i++) {
        let value=arr[i]
        console.log(value)
        let elementX=value[0]
        let elementY=value[1]
        let id = "node-"+elementX.toString()+","+elementY.toString()
        let element=document.getElementById(id)
        element.className="path"
        await drawPathTimerDFS(TIME_DELAY)
    }
} //draw path


const drawPathTimerDFS = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function StartSimulationAStar(){

    console.log("Simulation Started: AStar");
    convertUserGraphToMatrix()
    let graph = new Graph(GRAPH_MATRIX);
    graph.Astar(GRAPH_MATRIX).then(results=>{
        RedrawGraph()
        ShortestPath=results;
        drawPath(results);
    }).catch(err=>{
        RedrawGraph()
        console.log(err.message)
    })

}

async function StartSimulationBFS(){
    console.log("Simulation Started: AStar");
    convertUserGraphToMatrix()
    let graph = new Graph(GRAPH_MATRIX);
    graph.bfs(GRAPH_MATRIX).then(results=>{
        RedrawGraph()
        ShortestPath=results;
        drawPath(results);
    }).catch(err=>{
        RedrawGraph()
        console.log(err.message)
    })
}

async function StartDijSimulation() {
    console.log("Simulation Started: Dijkstra");
    convertUserGraphToMatrix()
    let graph = new Graph(GRAPH_MATRIX);
    graph.dijkstra(GRAPH_MATRIX).then(results=>{
        ShortestPath=results;
        RedrawGraph()
        drawPath();
    }).catch(err=>{
        alert("Path Dont Exists")
        RedrawGraph()
        console.log(err.message)
    })
}

function RedrawGraph() {
    console.log("Resetting Graph");
    STOP_SIMULATION = false;
    // let graph = document.getElementById("graph");
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            let id = "node-" + row.toString() + "," + col.toString();
            let element = document.getElementById(id)
            if(row==START_X && col==START_Y){
                element.className='start'
            }else if(row==DESTINATION_X && col==DESTINATION_Y){
                element.className='destination'
            }else if (GRAPH_MATRIX[row][col]=="X"){
                element.className="block"
            }
            else{
                element.className="initialNode"+GRAPH_MATRIX[row][col].toString();
            }
        }
    }
}


function TakeAnimationSpeed() {
    var animationSpeed = document.getElementById("animationSpeed");
    var output = document.getElementById("animationSpeedDisplay");
    animationSpeed.oninput = function () {
        output.innerHTML = this.value;
        ANIMATION_SPEED = this.value;
        TIME_DELAY=1000/ANIMATION_SPEED
    }
}


function GenerateGraph() {
    let graph = document.getElementById("graph");
    for (let row = 0; row < ROWS; row++) {
        let tableRow = document.createElement("tr");
        for (let col = 0; col < COLUMNS; col++) {
            let weightIntensity = Math.floor(Math.random() * (3) + 1)
            let tableColumn = document.createElement("td");
            tableColumn.id = "td-" + row.toString() + "," + col.toString();
            let nodeInGraph = document.createElement("div");
            nodeInGraph.id = "node-" + row.toString() + "," + col.toString();
            if(row==START_X && col==START_Y){
                nodeInGraph.className="start";
                GRAPH_MATRIX[row][col] = weightIntensity
                WEIGHT_MATRIX[row][col]=weightIntensity
            }else if(row==DESTINATION_X && col==DESTINATION_Y){
                nodeInGraph.className="destination";
                GRAPH_MATRIX[row][col] = weightIntensity
                WEIGHT_MATRIX[row][col]=weightIntensity
            }
            else{
                nodeInGraph.className="initialNode" + weightIntensity.toString();
                GRAPH_MATRIX[row][col] = weightIntensity
                WEIGHT_MATRIX[row][col]=weightIntensity
                nodeInGraph.addEventListener("dragenter",addBlocks )
            }
            tableColumn.appendChild(nodeInGraph);
            tableRow.append(tableColumn);
        }
        graph.appendChild(tableRow);
    }

}

function addBlocks(e){
    let element=e.target
    if (element.tagName=="DIV" && element.className!="start" && element.className!="destination"){
        if (element.className!="block"){
            element.className="block"
            console.log("Block Added");
        }else{
            console.log("Block Removed");
            let coordinate = element.id.split("-")[1].split(",");
            coordinate.forEach((num,i,arr)=>{
                arr[i]=Number(num)
            })
            let x= coordinate[0]
            let y= coordinate[1]
            let w = WEIGHT_MATRIX[x][y]
            console.log("Here:",x,y,w);
            console.log(element)
            element.className = "initialNode"+w.toString()
        }
    }else{
        console.log("Choose Another Block");
    }
}


// my libraries

class Node {
    constructor(x, y, w) {
        this.x = x;
        this.y = y;
        this.weight = w;
        this.neighbours = [];
        this.neighbourDetails = {}
        this.parent = []
        this.distanceFromParent = 0
        this.heuristic = 0
        this.f = 0
        this.START = false
        this.DESTINATION = false
        this.BLOCK = false
    }


    setF(f) {
        this.f = f;
    }

    giveF() {
        return this.f
    }

    giveParent() {
        return this.parent
    }

    giveDistanceFromParent() {
        return this.distanceFromParent;
    }

    giveHeuristic() {
        return this.heuristic;
    }

    setHeuristic(h) {
        this.heuristic = h;
    }


    discoverNeighbours(GRAPH_ROWS, GRAPH_COLS) {
        let left = this.y - 1
        let right = this.y + 1
        let up = this.x - 1
        let down = this.x + 1
        if (left >= 0) {
            this.neighbours.push([this.x, left])
        }
        if (right < GRAPH_COLS) {
            this.neighbours.push([this.x, right])
        }

        if (up >= 0) {
            this.neighbours.push([up, this.y])
        }

        if (down < GRAPH_ROWS) {
            this.neighbours.push([down, this.y])
        }
    }

    printNeighboursDetails() {
        console.log("Neighbours of ", this.x, this.y, ":", this.neighbourDetails)
    }

    giveNeighbourDetails() {
        return this.neighbourDetails
    }

    giveNeighbours() {
        return this.neighbours
    }
    giveCoordinates() {
        return [this.x, this.y]
    }
    giveWeight() {
        return this.weight
    }

    updateNeighboursWeight(NodeMatrix) {
        let neighArray = this.giveNeighbours()
        console.log(neighArray)
        for (let i = 0; i < neighArray.length; i++) {
            let neighbour = neighArray[i]
            let x = neighbour[0]
            let y = neighbour[1]
            let weight = NodeMatrix[x][y].weight
            this.neighbourDetails[i + 1] = [neighbour, weight]
        }
    }
}

class Graph {

    constructor(matrix) {
        this.matrix = matrix;
        this.Rows = matrix.length;
        this.Cols = matrix[0].length;
        this.NodeMatrix = new Array(this.Rows).fill(0).map(() => new Array(this.Cols).fill(0))
        this.distanceMatrix = new Array(this.Rows).fill(0).map(() => new Array(this.Cols).fill(999))
        this.weightMatrix = new Array(this.Rows).fill(0).map(() => new Array(this.Cols).fill(0))
        this.visitMatrix = new Array(this.Rows).fill(false).map(() => new Array(this.Cols).fill(false))
        
        this.dicStartEnd = {
            "S": "Start",
            "D": "Destination"
        }
        this.nodesInGraphSDExcluded = []
        this.blocksArray=[]
        this.convertMatrixToGraph()
        this.updateWeights()
        this.calculateHeuristic()
    }

    printActualMatrix() {
        var str = []
        var rowstr = ""
        for (let row = 0; row < this.Rows; row++) {
            rowstr = ""
            for (let col = 0; col < this.Cols; col++) {
                rowstr += this.matrix[row][col].toString() + "\t"
            }
            str.push(rowstr)
            console.log(rowstr)
        }
        return str
    }

    updateDistanceMatrixOfNeighbours(neighbours) {
        let length = neighbours.length
        for (const [key, value] of Object.entries(neighbours)) {
            let x = value[0][0]
            let y = value[0][1]
            let distance = value[1]
            this.distanceMatrix[x][y] = distance
        }
    }

    giveNode(xy) {
        return this.NodeMatrix[xy[0]][xy[1]]
    }

    giveAllNodesInGraph() {
        return this.nodesInGraphSDExcluded
    }

    printIndex() {
        console.log(this.dicStartEnd)
    }

    giveWeightOfNode(x, y) {
        return this.NodeMatrix[x][y].weight
    }

    giveStartingNode() {
        let coordinates = this.dicStartEnd["S"]
        let node = this.NodeMatrix[coordinates[0]][coordinates[1]]
        return node
    }
    giveDestinationNode() {
        let coordinates = this.dicStartEnd["D"]
        let node = this.NodeMatrix[coordinates[0]][coordinates[1]]
        return node
    }

    convertMatrixToGraph() {
        for (let row = 0; row < this.Rows; row++) {
            for (let col = 0; col < this.Cols; col++) {
                let x = row
                let y = col
                let weight = this.matrix[x][y]

                this.NodeMatrix[x][y] = new Node(x, y, weight)
                this.weightMatrix[x][y] = this.matrix[x][y]
                this.nodesInGraphSDExcluded.push([x, y])
                
                if (this.matrix[x][y] == "S") {
                    this.weightMatrix[x][y] = 0
                    this.NodeMatrix[x][y].START = true
                    this.NodeMatrix[x][y].weight = 0
                    this.dicStartEnd["S"] = [x, y]
                    this.distanceMatrix[x][y] = 0
                    this.nodesInGraphSDExcluded.pop()
                }

                if (this.matrix[x][y] === "D") {
                    this.weightMatrix[x][y] = 0
                    this.NodeMatrix[x][y].DESTINATION = true
                    this.NodeMatrix[x][y].weight = 0
                    this.dicStartEnd["D"] = [x, y]
                    this.nodesInGraphSDExcluded.pop()
                }

                if (this.matrix[x][y] === "X") {
                    this.weightMatrix[x][y] = "X"
                    this.NodeMatrix[x][y].BLOCK=true
                    this.NodeMatrix[x][y].weight = "X"
                    // this.dicStartEnd["D"] = [x, y]
                    this.distanceMatrix[x][y] = 999
                    this.nodesInGraphSDExcluded.pop()
                    this.blocksArray.push([x,y])
                }

                if (this.matrix[x][y]!="X"){
                    this.NodeMatrix[x][y].discoverNeighbours(this.Rows, this.Cols)
                }
            }
        }

    }

    addToPriorityQueue(pq) {
        for (var row = 0; row < this.Rows; row++) {
            for (var col = 0; col < this.Cols; col++) {
                let x = row
                let y = col
                let weight = this.distanceMatrix[row][col]
                if (this.NodeMatrix[x][y].DESTINATION || this.NodeMatrix[x][y].BLOCK){
                    continue
                }else {
                    pq.enqueue([x, y], weight)
                }
            }
        }
    }

    updateWeights() {
        for (var row = 0; row < this.Rows; row++) {
            for (var col = 0; col < this.Cols; col++) {
                let i = 0
                let neighbours = this.NodeMatrix[row][col].neighbours
                neighbours.forEach(neighbour => {
                    let neighbourX = neighbour[0]
                    let neighbourY = neighbour[1]
                    let neighbourW = this.weightMatrix[neighbourX][neighbourY]
                    this.NodeMatrix[row][col].neighbourDetails[i + 1] = [[neighbour], neighbourW]
                    i++
                })
            }
        }
    }

    printGraph() {
        for (let row = 0; row < this.Rows; row++) {
            for (let col = 0; col < this.Cols; col++) {
                console.log(this.NodeMatrix[row][col].weight)
            }
        }
    }

    printGraphAsString() {
        var str = []
        var rowstr = ""
        for (let row = 0; row < this.Rows; row++) {
            rowstr = ""
            for (let col = 0; col < this.Cols; col++) {
                rowstr += this.NodeMatrix[row][col].weight.toString() + " "
            }
            str.push(rowstr)
            console.log(rowstr)
        }
        return str
    }

    printWeightMatrixAsString() {
        var str = []
        var rowstr = ""
        for (let row = 0; row < this.Rows; row++) {
            rowstr = ""
            for (let col = 0; col < this.Cols; col++) {
                rowstr += this.weightMatrix[row][col].toString() + "\t"
            }
            str.push(rowstr)
            console.log(rowstr)
        }
    }

    generatePath() {
        let pathMap = this.RoutingTable
        let start = this.giveStartingNode()
        start = [start.x, start.y].toString()
        let destination = this.giveDestinationNode()
        destination = [destination.x, destination.y].toString()
        let StartToDestinationPath = []
        StartToDestinationPath.push(destination)
        while (true) {
            let previous = pathMap.get(destination)
            StartToDestinationPath.push(previous)
            destination = previous
            if (previous == start) {
                break
            }
        }
        let arr = []
        StartToDestinationPath.forEach(element => {
            arr.push(element.split(','))
        })
        let StartToDestination = []
        arr.forEach(element => {
            let xy = []
            element.forEach(num => {
                parseInt(num)
                xy.push(parseInt(num))
            })
            StartToDestination.push(xy)
        })
        StartToDestination = StartToDestination.reverse()
        return StartToDestination
    }

    printDistanceMatrixAsString() {
        var str = []
        var rowstr = ""
        for (let row = 0; row < this.Rows; row++) {
            rowstr = ""
            for (let col = 0; col < this.Cols; col++) {
                rowstr += this.distanceMatrix[row][col].toString() + "\t"
            }
            str.push(rowstr)
            console.log(rowstr)
        }
    }

    // dijkstra() {

    async dijkstra() {
        console.log("Dijkstra Started")
        let startNode = this.giveStartingNode()
        let neighbours = startNode.giveNeighbourDetails()
        var pq = new PriorityQueue();
        this.addToPriorityQueue(pq)
        var pathToVia = new Map();
        let destinationFound=false;
        let pathExists=false;
        while (!pq.isEmpty()) {
            let previousNode = pq.dequeue()
            let nodeX = previousNode[0][0]
            let nodeY = previousNode[0][1]
            if (this.NodeMatrix[nodeX][nodeY].DESTINATION){
                destinationFound=true;
                pathExists=true;
                console.log("Reached Destination");
                break;
            }
            let id="node-"+nodeX.toString()+","+nodeY.toString();
            let element = document.getElementById(id)
            // console.log(id,element)
            element.className="visitedNode";     
            if (STOP_SIMULATION) {
                console.log("Stopped: Dijkstra")
                // return;
                return new Promise((reject)=>{
                    reject(new Error("Dijkstra: Terminated By User"))
                })
            }
            await dijkstrasleep(TIME_DELAY);
            let distance = previousNode[1]
            neighbours = this.NodeMatrix[nodeX][nodeY].giveNeighbours()
            neighbours.forEach(neighbour => {
                let neighbourX = neighbour[0]
                let neighbourY = neighbour[1]
                if(this.NodeMatrix.weight!="X"){

                    let weight = this.NodeMatrix[neighbourX][neighbourY].weight;
                    let newDistance = distance + weight
                    if (newDistance < this.distanceMatrix[neighbourX][neighbourY]) {
                        this.distanceMatrix[neighbourX][neighbourY] = newDistance
                        pq.enqueue([neighbourX, neighbourY], newDistance)
                        pathToVia.set([neighbourX, neighbourY].toString(), previousNode[0].toString())
                    }
                }
            });
            if (pq.isEmpty() && !destinationFound){
                pathExists=false
            }
        }
        let PATH=[]
        if(pathExists){
            this.RoutingTable = pathToVia
            console.log(this.RoutingTable)
            PATH = this.generatePath()
            return new Promise((resolve)=>{
                resolve(PATH)
            })

        }else{
            console.log("Heeeeee");
            return new Promise((reject)=>{
                reject(PATH)
            })
        }
    }

    async Astar() {

        let openList = new PriorityQueue()
        let closedList = new PriorityQueue()
        let pathExists=false
        let reachedDestination=false

        let startNode = this.giveStartingNode()
        startNode.distanceFromParent = 0
        let sx = startNode.x
        let sy = startNode.y
        let startingweight = startNode.weight
        let h = startNode.heuristic

        this.distanceMatrix[sx][sy] = 0
        let destinationNode = this.giveDestinationNode()
        let dx = destinationNode.x
        let dy = destinationNode.y
        var pathToVia = new Map();
        // console.log("Initial","sx:",sx,"sy:",sy,"sh:",h,"dx:",dx,"dy:",dy);
        let i=0
        openList.enqueue([sx, sy], h)
        while (!openList.isEmpty() ) {
            let current_node = openList.dequeue()
            let cx = current_node[0][0]
            let cy = current_node[0][1]
            let ch = this.NodeMatrix[cx][cy].heuristic
            let currentNodeDistanceFromParent = this.NodeMatrix[cx][cy].distanceFromParent
            let cf = currentNodeDistanceFromParent + ch

            //HTML Added
            let id="node-"+cx.toString()+","+cy.toString();

            let element = document.getElementById(id)
            // console.log(id,element)
            element.className="visitedNode";

            if (STOP_SIMULATION) {
                console.log("Stopped: AStar")
                // return;
                return new Promise((reject)=>{
                    reject(new Error("AStar: Terminated By User"))
                })
            }
            await astarasleep(TIME_DELAY);


            // animation ends
            if (cx == dx && cy == dy) {
                reachedDestination=true
                pathExists=true
                break;
            }
            let neighbours = this.NodeMatrix[cx][cy].giveNeighbours()
            for (let i = 0; i < neighbours.length; i++) {
                let neighbour = neighbours[i];
                let nx = neighbour[0]
                let ny = neighbour[1]
                let nw = this.NodeMatrix[nx][ny].weight
                if (nw=="X"){
                    continue;
                }

                let neighbourDistanceFromCurrentNode = currentNodeDistanceFromParent + nw
                let neighboutDistanceFromDistanceMatrix = this.distanceMatrix[nx][ny]
                if (openList.ifContains([nx, ny])) {
                    if (neighbourDistanceFromCurrentNode < neighboutDistanceFromDistanceMatrix) {
                        this.distanceMatrix[nx][ny] = neighbourDistanceFromCurrentNode
                        this.NodeMatrix[nx][ny].parent = [cx, cy]
                        this.NodeMatrix[nx][ny].distanceFromParent = neighbourDistanceFromCurrentNode
                        pathToVia.set([nx, ny].toString(), [[cx, cy], neighbourDistanceFromCurrentNode])
                    }
                } else if (closedList.ifContains([nx, ny])) {
                    if (neighbourDistanceFromCurrentNode < neighboutDistanceFromDistanceMatrix) {
                        this.distanceMatrix[nx][ny] = neighbourDistanceFromCurrentNode
                        this.NodeMatrix[nx][ny].parent = [cx, cy]
                        this.NodeMatrix[nx][ny].distanceFromParent = neighbourDistanceFromCurrentNode
                        pathToVia.set([nx, ny].toString(), [[cx, cy], neighbourDistanceFromCurrentNode])
                        let element = closedList.remove([nx, ny])
                        openList.enqueue([element[0], element[1]], element[2])

                    }//move out of here
                } else {
                    let h = this.NodeMatrix[nx][ny].heuristic
                    let f = neighbourDistanceFromCurrentNode + h
                    openList.enqueue([nx, ny], f)
 
                    if (neighbourDistanceFromCurrentNode < neighboutDistanceFromDistanceMatrix) {

                        this.distanceMatrix[nx][ny] = neighbourDistanceFromCurrentNode
                        this.NodeMatrix[nx][ny].parent = [cx, cy]
                        this.NodeMatrix[nx][ny].distanceFromParent = neighbourDistanceFromCurrentNode
                        pathToVia.set([nx, ny].toString(), [[cx, cy], neighbourDistanceFromCurrentNode])
                    }
                }

            }
            closedList.enqueue([cx, cy], cf)
            if(openList.isEmpty && !reachedDestination){
                pathExists=false;
            }


        }// while ends

        let path=[]
        if (pathExists){
            this.RoutingTable = pathToVia
            path = this.generatePathAStar()
            return new Promise((resolve)=>{
                resolve(path)
            })
        }else{
        return new Promise((reject)=>{
            reject(path)
            })
        }
    }

    calculateHeuristic() {
        let destination = this.giveDestinationNode()
        let destinationX = destination.x
        let destinationY = destination.y

        for (let row = 0; row < this.Rows; row++) {
            for (let col = 0; col < this.Cols; col++) {
                let dx = Math.abs(destinationX - row)
                let dy = Math.abs(destinationY - col)
                // set d to lowest of neighbours
                let d = HEURISTIC_VALUE
                let D = d*(dx + dy)
                this.NodeMatrix[row][col].setHeuristic(D)
            }
        }
    }

    calculateTotalWeight(path) {
        let totalWeight = 0
        for (let i = 0; i < path.length; i++) {
            totalWeight += this.weightMatrix[path[i][0]][path[i][1]]
        }
        console.log("Total Cost: ",totalWeight)
        return totalWeight
    }

    generatePathAStar() {
        let pathMap = this.RoutingTable
        let start = this.giveStartingNode()
        start = [start.x, start.y].toString()

        let destination = this.giveDestinationNode()
        let X = destination.x
        let Y = destination.y
        destination = [destination.x, destination.y].toString()

        let StartToDestinationPath = []
        StartToDestinationPath.push([X, Y])
        while (true) {
            let previous = pathMap.get(destination)
            // console.log(previous)
            StartToDestinationPath.push(previous[0])
            // console.log(StartToDestinationPath);
            destination = previous[0].toString();
            if (destination == start) {
                break
            }
        }
        StartToDestinationPath.reverse()
        return StartToDestinationPath
    }



    
    dfsRecursive(currentNode,destinationNode){
        // console.log("recursive");
        if(currentNode[0]==destinationNode[0] && currentNode[1]==destinationNode[1]){
            let x=destinationNode[0]
            let y=destinationNode[1]
            let w=this.NodeMatrix[x][y]
            this.visitMatrix[x][y]=true
            return [destinationNode]
        }
        
        let cx=currentNode[0]
        let cy=currentNode[1]
        this.visitMatrix[cx][cy]=true
        let path=[]
        let neighbours = this.NodeMatrix[cx][cy].giveNeighbours()
        for (let i = 0; i < neighbours.length; i++) {
            const nx = neighbours[i][0];
            const ny = neighbours[i][1];
            if(this.visitMatrix[nx][ny]==true){
                continue;
            }
            this.visitMatrix[nx][ny]=true
            if(this.NodeMatrix[nx][ny].weight=="X"){
                continue;
            }
            let via = this.dfsRecursive([nx,ny],destinationNode)
            // via.push()
            if (via.length>0){
                via.push([cx,cy])
                return via
            }
        }
        return []
    }


    dfs(){
        console.log("DFS Started");
        let startNode = this.giveStartingNode()
        let sx=startNode.x
        let sy=startNode.y
        this.visitMatrix[sx][sy]=false
        let destinationNode = this.giveDestinationNode()
        let dx=destinationNode.x
        let dy=destinationNode.y
        let via= this.dfsRecursive([sx,sy],[dx,dy])
        if(via.length>0){
            this.ShortestPath = via.reverse()
            return this.ShortestPath
        }
        else{
            return []
        }

    }

    generatePathBFS() {
        let pathMap = this.RoutingTable
        let start = this.giveStartingNode()
        start = [start.x, start.y].toString()
        let destination = this.giveDestinationNode()
        let dx=destination.x
        let dy=destination.y
        destination = [destination.x, destination.y].toString()
        let StartToDestinationPath = []

        StartToDestinationPath.push([dx,dy])
        while (true) {
            let previous = pathMap.get(destination)
            StartToDestinationPath.push(previous)
            destination = previous.toString()
            // console.log("HHHHHHHHHHHHHHHh");
            if (previous == start) {
                break
            }
        }

        StartToDestinationPath = StartToDestinationPath.reverse()
        return StartToDestinationPath
    }




    async bfs(){
        let nodes = this.nodesInGraphSDExcluded
        let startNode = this.giveStartingNode()
        let startNodeX = startNode.x
        let startNodeY = startNode.y 
        
        var NodesList=[[startNodeX,startNodeY]]
        // let ParentNode=[startNodeX,startNodeY]

        var pathToVia = new Map();
        let destinationFound=false;
        let pathExists=false;
        let neighbours_neighbour=[]
        while (NodesList.length>0) {
            const current_node = NodesList.shift()
            let current_Node_X = current_node[0]
            let current_Node_Y = current_node[1]
            this.visitMatrix[current_Node_X][current_Node_Y]=true;
            if (this.NodeMatrix[current_Node_X][current_Node_Y].DESTINATION){
                destinationFound=true;
                pathExists=true;
                break;
            }
            let current_Neighbours=this.NodeMatrix[current_Node_X][current_Node_Y].neighbours


            //HTML Added
            let id="node-"+current_Node_X.toString()+","+current_Node_Y.toString();

            let element = document.getElementById(id)
            element.className="visitedNode";

            if (STOP_SIMULATION) {
                console.log("Stopped: BFS")
                // return;
                return new Promise((reject)=>{
                    reject(new Error("BFS: Terminated By User"))
                })
            }
            await bfssleep(TIME_DELAY);





            for (var i=0;i<current_Neighbours.length;i++) {
                let nx=current_Neighbours[i][0]
                let ny=current_Neighbours[i][1]
                if(this.visitMatrix[nx][ny]==false && this.NodeMatrix[nx][ny].BLOCK==false){
                    pathToVia.set(current_Neighbours[i].toString(), current_node)
                    neighbours_neighbour.push(current_Neighbours[i])


 

                    // animation added till here
                }
            }
            
            if(NodesList.length== 0){
                NodesList=neighbours_neighbour
                neighbours_neighbour=[]
            }

            if (NodesList.length==0 && !destinationFound && neighbours_neighbour.length==0){
                pathExists=false
                break;
            }
        }//while ends
        let path=[]
        if(destinationFound){
            this.RoutingTable = pathToVia
            path = this.generatePathBFS()
            return new Promise((resolve)=>{
                resolve(path)
            })
        }else{
            return new Promise((reject)=>{
                reject(path)
                })
            }
        }
    }

    const dijkstrasleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    const astarasleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }


    const bfssleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }










// function checkGraph() {

//     var simplematrix2 = [
//         [1, 1, 2, 1, 5],
//         [1, "S", 2, 1, 1],
//         [1, 99, 2, "D", 1],
//         [0, 2, 1, 0, 0],
//         [0, 0, 0, 0, 0],
//     ]

//     var unitmatrix = [
//         [1, 1, 1, 1, 1],
//         [1, "S", 1, 1, 1],
//         [1, 1, 1, "D", 1],
//         [1, 1, 1, 1, 1],
//         [1, 1, 1, 1, 1],
//     ]


//     var simplematrix1 = [
//         ["S", 99],
//         [2, "D"]
//     ]

//     var rect = [
//         ["S", 99, 8],
//         [2, "D", 2]
//     ]


//     var finalmatrix1 = [
//         ["S", 2, 4],
//         [1, 2, 4],
//         [1, 2, "D"],
//     ]

//     var testMatrix = [
//         ["S", 99, 99],
//         [1, 6, 8],
//         [1, 1, "D"],
//     ]

//     var finalmatrix2 = [
//         [1, 2, 3, 4, 3, 2, 1],
//         [2, 3, 1, "S", 2, 1, 1],
//         [1, 1, 1, 2, 2, 2, 3],
//         [1, 2, 3, 6, 22, 10, 1],
//         [1, 2, 3, 6, 22, 10, 1],
//         [1, 2, 3, 6, 22, 10, 1],
//         [1, 2, 3, 6, "D", 10, 1]
//     ]
//     var g = new Graph(finalmatrix2)

//     let path = g.dijkstra()
//     console.log(path)
// }

// checkGraph()






class PriorityQueue {
    constructor(descending = false) {
        this.descending = descending;
        this.X = [];
        this.Y = [];
        this.P = [];
    }
    size() {
        return this.X.length
    }

    ifContains(element){
        let xOfElement=element[0]
        let yOfElement=element[1]
        for (var i = 0; i < this.X.length; i++) {
            if (this.X[i] == xOfElement && this.Y[i] == yOfElement) {
                return true;
            }
        }
        return false;
    }

    remove(element) {

        var contain = false;
        let xOfElement = element[0]
        let yOfElement = element[1]
        let priority=0;
        let exist=false;

        for (var i = 0; i < this.X.length; i++) {
            if (this.X[i] == xOfElement && this.Y[i] == yOfElement) {
                // console.log("Already exists at index: ",i)
                // if (this.P[i] >= priority) {
                    // this.P[i] = priority;
                    // removing element  because it exists and have less priority
                    // console.log("Priority Updated")
                    priority=this.P[i]
                    this.X.splice(i, 1)
                    this.Y.splice(i, 1)
                    this.P.splice(i, 1)
                    break;
                // }else{
                //     return
                // }
                // exist=true;
            }
        }

       return [...element,priority]
    }

    enqueue(element, priority) {
        var contain = false;
        let xOfElement = element[0]
        let yOfElement = element[1]
        let exist=false;
        for (var i = 0; i < this.X.length; i++) {
            if (this.X[i] == xOfElement && this.Y[i] == yOfElement) {
                // console.log("Already exists at index: ",i)
                if (this.P[i] >= priority) {
                    // this.P[i] = priority;
                    // removing element  because it exists and have less priority
                    // console.log("Priority Updated")
                    this.X.splice(i, 1)
                    this.Y.splice(i, 1)
                    this.P.splice(i, 1)
                    break;
                }else{
                    return
                }
                // exist=true;
            }
        }

        for (var i = 0; i < this.X.length; i++) {
            if (this.P[i] > priority) {
                this.X.splice(i, 0, xOfElement);
                this.Y.splice(i, 0, yOfElement);
                this.P.splice(i, 0, priority);
                contain = true;
                break;
            }
        }

        if (!contain) {
            this.X.push(xOfElement);
            this.Y.push(yOfElement);
            this.P.push(priority);
        }
    }

    // enqueueList(arrList){
    //     var lengthList = arrList.length
    //     for (var i =0;i<lengthList;i++){
    //         var item = arrList.pop();
    //         this.enqueue([item[0],item[1]],item[2])
    //     }
    // }

    dequeue() {
        if (this.isEmpty()) {
            // console.log("Queue Empty")
            return false
        }

        if (this.descending) {
            let x = this.X.pop();
            let y = this.Y.pop();
            let p = this.P.pop();
            return [[x, y], p]
        } else {
            let x = this.X.shift();
            let y = this.Y.shift();
            let p = this.P.shift();
            return [[x, y], p]

        }
    }

    front() {
        if (this.isEmpty())
            return "No elements in Queue";

        let x = this.X[0];
        let y = this.Y[0];
        let p = this.P[0];
        return [[x, y], p]
    }

    rear() {
        if (this.isEmpty())
            return "No elements in Queue";

        let x = this.X[-1];
        let y = this.Y[-1];
        let p = this.P[-1];
        return [[x, y], p]
    }


    isEmpty() {
        return this.X.length == 0;
    }

    printPQueue() {
        if (this.X.length == 0) {
            console.log("Empty")
            return
        }
        for (var i = 0; i < this.X.length; i++) {
            console.log([this.X[i], this.Y[i]], this.P[i]);
        }
    }
    printPQueueAsString() {
        if (this.X.length == 0) {
            console.log("Empty")
            return
        }
        let str=""
        for (var i = 0; i < this.X.length; i++) {
            str += [[this.X[i], this.Y[i]], this.P[i]].toString() +"\t"
            // console.log([this.X[i], this.Y[i]], this.P[i]);
        }
        console.log(str)
    }

}


// function aditya() {
//     // creating object for queue class
//     var pq = new PriorityQueue();

//     pq.enqueue([1, 2], 2)
//     pq.enqueue([1, 3], 6)
//     pq.enqueue([4, 5], 4)
//     pq.enqueue([1, 5], 4)
//     pq.enqueue([1, 3], 4)
//     // pq.printPQueue();
//     pq.enqueue([1, 3], 2)
//     // pq.printPQueue();
//     pq.enqueue([4, 5], 1)
//     pq.enqueue([1, 6], 4)
//     pq.enqueue([1, 8], 1)
//     pq.enqueue([1, 6], 1)
    
    
//     // pq.printPQueue();
//     // console.log(pq.isEmpty())
//     console.log("Size:",pq.size())
//     // pq.printPQueue();
//     // pq.printPQueue();
//     // pq.printPQueue();
//     // console.log("Popped Item: ",pq.dequeue())
//     // console.log(pq.dequeue())
//     // console.log(pq.dequeue())
//     // console.log(pq.dequeue())
//     // console.log(pq.dequeue())
//     // console.log(pq.dequeue())
//     // pq.printPQueue()

//     pq.printPQueue()
//     console.log("Again dequeuing")
//     console.log(pq.dequeue())
//     pq.printPQueue()
//     // pq.dequeue()

// }

// aditya()


