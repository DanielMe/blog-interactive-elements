function drawValueXAxis(parent) {
    var axis = parent.append("g")
        .attr("class", "axis");
    
    axis.append("path")
        .attr("d", "M76.8827 616.176C76.8827 616.176 107.5777 558.279 107.5777 558.279C107.5777 558.279 135.4787 617.573 135.4787 617.573C121.1787 602.575 91.8807 601.876 76.8827 616.176C76.8827 616.176 76.8827 616.176 76.8827 616.176")
    axis.append("path")
        .attr("d", "M91.6707 1213.0C93.6297 1207.96 96.5567 1159.13 99.4967 1090.01C105.7107 943.911 113.2067 705.711 116.2257 605.392C116.3567 600.002 112.0867 595.52 106.6967 595.389C101.3067 595.259 96.8247 599.528 96.6947 604.918C95.1017 692.303 91.5487 884.327 87.4877 1028.95C84.7507 1126.43 82.0937 1202.14 79.7187 1208.4C78.4507 1211.7 80.0997 1215.41 83.3977 1216.68C86.6967 1217.94 90.4037 1216.3 91.6707 1213.0C91.6707 1213.0 91.6707 1213.0 91.6707 1213.0")
    return axis;
}

function drawValueYAxis(parent) {
    var axis = parent.append("g")
        .attr("class", "axis");
    
    axis.append("path")
        .attr("d", "M1299.4187 1169.04C1299.4187 1169.04 1357.7887 1198.82 1357.7887 1198.82C1357.7887 1198.82 1298.9387 1227.65 1298.9387 1227.65C1313.7187 1213.12 1313.9487 1183.81 1299.4187 1169.04C1299.4187 1169.04 1299.4187 1169.04 1299.4187 1169.04")
    axis.append("path")
        .attr("d", "M86.3017 1211.65C86.9737 1212.34 89.5957 1210.75 92.7727 1210.34C100.8417 1209.29 113.9897 1208.4 131.4587 1207.61C212.0987 1204.0 383.6377 1202.88 573.5357 1203.12C861.0877 1203.49 1190.6987 1206.91 1310.8287 1208.21C1316.2187 1208.25 1320.6287 1203.91 1320.6687 1198.52C1320.7087 1193.12 1316.3687 1188.71 1310.9787 1188.67C1153.9087 1187.9 638.7957 1185.94 327.6627 1189.92C224.8457 1191.24 144.2657 1193.17 106.1337 1196.11C94.4327 1197.01 86.5137 1198.08 82.8777 1199.16C78.7137 1200.39 77.1087 1202.83 76.6047 1204.15C75.3367 1207.45 76.9857 1211.15 80.2847 1212.42C82.3667 1213.22 84.6117 1212.86 86.3017 1211.65C86.3017 1211.65 86.3017 1211.65 86.3017 1211.65")
    return axis;

}


function drawValueSeries(minVal, maxVal, num_steps_to_show, series, value_curve_class, value_curve_id) {
    var xScale = d3.scaleLinear()
        .domain([0,num_steps_to_show])
        .range([91, 1200])

    var yScale = d3.scaleSqrt()
        .domain([minVal,maxVal*1.1+1])
        .range([1200, 600])

    var line = d3.line()
        .x((d,i) => xScale(i))
        .y(d => yScale(d));

    var chart = d3.select("g#value_canvas")
        .selectAll("path#"+value_curve_id)
        .data([series]);

    chart
        .enter()
        .append("path")
        .attr("id",value_curve_id)
        .attr("class", "value_curve " + value_curve_class)
        .attr("d", d => line(d));
    
    chart
        .transition()
        .attr("d", d => line(d));
}

function updateCanvas() {
    console.log(state);
    drawValueData();
    drawBudgetBar();
    drawProductivityBar();
}

function drawValueData() {
    var num_steps_to_show = 20;
    var slices = [];
    for (var i = 0; i < state.ai_players.length; ++i) {
        slices.push(state.ai_players[i].value_history.slice(
            Math.max(0, state.iteration - num_steps_to_show), 
            Math.min(state.ai_players[i].value_history.length, state.iteration+1)));
    }
    slices.push(state.human_player.value_history.slice(
        Math.max(0, state.iteration - num_steps_to_show), 
        Math.min(state.human_player.value_history.length, state.iteration+1)));

    var minVal = d3.min(slices.map(slice => d3.min(slice)));
    var maxVal = d3.max(slices.map(slice => d3.max(slice)));

    for (var i = 0; i < slices.length -1; ++i){
        drawValueSeries(minVal, maxVal, num_steps_to_show, slices[i], "ai", "value_ai_"+i);
    }

    drawValueSeries(minVal, maxVal, num_steps_to_show, slices[slices.length-1], "human", "value_human");
}

function drawValueArea(parent) {
    var valueArea = parent.append("g");

    valueArea.append("text")
        .attr("class", "area_label value")
        .attr("y", 638.43982)
        .attr("x", 166.80002)
        .text("Value");

    drawValueXAxis(valueArea);
    drawValueYAxis(valueArea);
    parent.append("g")
        .attr("id", "value_canvas");

    drawValueData();

    return valueArea;
}

function drawBars(parentId, height, maxWidth, value) {
    var maxValue = 100;
    var barScale = d3.scaleSqrt()
        .domain([0, maxValue])
        .range([0, maxWidth]);
    var borderScale = d3.scaleSqrt()
        .domain([0, maxValue])
        .range([15, 5]);
    var totalWidth = barScale(value);
    var borderWidth = borderScale(value);
    var width = (totalWidth / value) * 0.6;
    var spacing = (totalWidth / value) * 0.4;

    var rect = d3.select("g#"+parentId).selectAll("rect")
        .data(d3.range(value));

    rect.enter()
        .append("rect")
        .attr("style", "stroke-width: " + borderWidth + "px")
        .attr("height", height)
        .attr("width", width)
        .attr("y", 0)
        .attr("x", d => d*(width + spacing));
        
    rect.transition()
        .attr("style", "stroke-width: " + borderWidth + "px")
        .attr("width", width)
        .attr("x", d => d*(width + spacing));

    rect.exit().remove();
}

function drawBudgetBar() {
    drawBars("budget_canvas", 223.67166, 1536 - 98, state.human_player.budget)
}

function drawBudgetArea(parent) {
    var budgetArea = parent.append("g");
    budgetArea.append("text")
        .attr("class", "area_label budget")
        .attr("y", 158.42102)
        .attr("x", 94.13102)
        .text("Budget");
    parent.append("g")
        .attr("id", "budget_canvas")
        .attr("class", "bars budget")
        .attr("transform", "translate(98, 206)");
    drawBudgetBar();

    return budgetArea;
}

function drawProductivityBar() {
    drawBars("productivity_canvas", 138.54276, 1536 - 115, state.human_player.productivity)
}


function drawProductivityArea(parent) {
    var productivityArea = parent.append("g");
    productivityArea.append("text")
        .attr("class", "area_label productivity")
        .attr("y", 1380.355)
        .attr("x", 94.599022)
        .text("Productivity");
    parent.append("g")
        .attr("id", "productivity_canvas")
        .attr("class", "bars productivity")
        .attr("transform", "translate(115, 1439)");
    drawProductivityBar(state);

    return productivityArea;
}

function drawArrowPC(parent) {
    var arrow = parent.append("g")
        .attr("class", "pc arrow");

    arrow.append("path")
        .attr("d", "m 9.4517,1593.77 c 0,0 60.572,-25 60.572,-25 0,0 -16.339,63.46 -16.339,63.46 -1.444,-20.67 -23.561,-39.9 -44.233,-38.46 0,0 0,0 0,0");
    arrow.append("path")
        .attr("d", "m 186.1347,1878.3 c -67.597,4.2 -112.271,-39.72 -135.298,-95.52 -24.154,-58.53 -24.816,-130.25 -2.792,-174.35 2.358,-4.85 0.336,-10.7 -4.512,-13.06 -4.849,-2.36 -10.7,-0.34 -13.058,4.51 -22.875,48.31 -21.365,126 5.967,188.99 26.405,60.85 76.383,107.95 150.583,102.21 3.526,-0.25 6.188,-3.31 5.942,-6.84 -0.246,-3.52 -3.307,-6.18 -6.832,-5.94 0,0 0,0 0,0");

    return arrow;
}

function drawButtonPC(parent) {
    var button = parent.append("g");
    button.append("rect")
        .attr("class", "pc button")
        .attr("height", 181.495)
        .attr("width", 514.45966)
        .attr("x", 224.86342)
        .attr("y", 1766.1815)
        .on('click',() => investHandler("PC"));
    
    button.append("text")
        .attr("x", 243.35381)
        .attr("y", 1880.7084)
        .attr("class", "button_label")
        .text("Invest in PC");

    return button;
}

function drawArrowP(parent) {
    var arrow = parent.append("g")
        .attr("class", "p arrow");
    arrow.append("path")
        .attr("d", "m 1236.1387,1308.36 c 0,0 -3.87,-65.41 -3.87,-65.41 0,0 54.65,36.15 54.65,36.15 -20.01,-5.38 -45.4,9.25 -50.78,29.26 0,0 0,0 0,0");
    arrow.append("path")
        .attr("d", "m 1358.7987,1869.34 c 49.1,-1.59 80.03,-17.59 97.54,-42.9 18.17,-26.24 21.91,-63.09 15.34,-106.09 -20.87,-136.56 -146.15,-337.41 -207.61,-441.77 -2.76,-4.64 -8.76,-6.16 -13.4,-3.4 -4.63,2.76 -6.14,8.77 -3.38,13.4 61.79,102.46 188.27,299.31 210.13,434.02 6.3,38.82 3.95,72.29 -12.29,96.15 -15.38,22.6 -43.19,36.05 -86.79,37.79 -3.53,0.12 -6.29,3.1 -6.17,6.63 0.13,3.53 3.1,6.29 6.63,6.17 0,0 0,0 0,0");


    return arrow;
}

function drawButtonP(parent) {
    var button = parent.append("g");
    button.append("rect")
        .attr("class", "p button")
        .attr("height", 181.495)
        .attr("width", 545.15784)
        .attr("x", 790.76837)
        .attr("y", 1761.0704)
        .on('click',() => investHandler("P"));
    
    button.append("text")
        .attr("x", 872.33881)
        .attr("y", 1871.8984)
        .attr("class", "button_label")
        .text("Invest in P");
    return button;
}

function drawControlArea(parent) {
    var controlArea = parent.append("g");

    drawArrowPC(controlArea);
    drawArrowP(controlArea);
    drawButtonPC(controlArea);
    drawButtonP(controlArea);

    return controlArea;
}


function newPlayerState(action, currentState, rank){
    if(currentState.budget <= 0) {
        return {
            "budget": currentState.budget,
            "productivity": currentState.productivity,
            "value_history": currentState.value_history,
            "lowBudgetStrategy": currentState.lowBudgetStrategy,
            "highBudgetStrategy": currentState.highBudgetStrategy,
            "eliminated": true
        };
    }

    var newBudget = currentState.budget - rules.cost_of_move;
    if(rank == 0) {
        newBudget += rules.reward_if_first;
    }
    if(rank == 1) {
        newBudget += rules.reward_if_second;
    }
    newBudget = Math.max(0, newBudget);

    var newValue = currentState.value_history.slice(-1)[0];
    var newProductivity = currentState.productivity;
    if(action == "P") {
        newValue += currentState.productivity;
        newProductivity -= rules.productivity_penalty;
    } else if(action == "PC") {
        newProductivity += rules.productivity_gain;
    }
    newProductivity = Math.max(0, newProductivity);
    var newValueHistory = currentState.value_history.slice();
    newValueHistory.push(newValue);

    return {
        "budget": newBudget,
        "productivity": newProductivity,
        "value_history": newValueHistory,
        "lowBudgetStrategy": currentState.lowBudgetStrategy,
        "highBudgetStrategy": currentState.highBudgetStrategy,
        "eliminated": false
    }
}

function getRanks(){
    var values = state.ai_players.map(p => p.value_history.slice(-1)[0]);
    values.push(state.human_player.value_history.slice(-1)[0]);
    var ranks = d3.rank(values, (a, b) => d3.descending(a,b));
    if(d3.count(ranks.filter(d => d == 0)) > 1 ) {
        ranks = ranks.map(d => d+1); // share the first place
    }

    return {
        "ai": ranks.slice(0, state.ai_players.length),
        "human": ranks.slice(-1)[0]
    }
}

function investHandler(human_action) {
    var ranks = getRanks();
    state = {
        "iteration": state.iteration + 1,
        "human_player": newPlayerState(human_action, state.human_player, ranks.human),
        "ai_players": state.ai_players.map((playerState, i) => newPlayerState(getAIAction(i), playerState, ranks.ai[i]))
    };

    if(state.human_player.eliminated) {
        showResult(false);
    } else if (state.ai_players.filter(p => !p.eliminated).length <= 1) {
        showResult(true);
    } else {
        updateCanvas();
    }
}  

function getAIAction(player) {
    if(state.ai_players[player].budget <= 2) {
        return "P";
    }
    if(state.ai_players[player].productivity <= 1) {
        return "PC";
    }
    if(state.ai_players[player].budget <= 4) {
        if(Math.random() > state.ai_players[player].lowBudgetStrategy) {
            return "P";
        } else {
            return "PC";
        }
    } else {
        if(Math.random() > state.ai_players[player].highBudgetStrategy) {
            return "P";
        } else {
            return "PC";
        }
    }
}


function drawGame() {
    var gameCanvas = d3.select("#game_canvas");
    drawControlArea(gameCanvas);
    drawProductivityArea(gameCanvas);
    drawValueArea(gameCanvas);
    drawBudgetArea(gameCanvas);

    return gameCanvas;

}

function makeInitialPlayerState() {
    return {
        "budget": 10,
        "value_history": [0],
        "productivity": 5,
        "eliminated": false
    };
}

function makeInitialAiPlayerState() {
    return {
        "budget": 10,
        "value_history": [0],
        "productivity": 5,
        "eliminated": false,
        "lowBudgetStrategy": Math.random()*0.5,
        "highBudgetStrategy": Math.random()*0.5 + 0.4
    };
}

function makeInitialGameState() {
    return {
        "iteration": 0,
        "human_player": makeInitialPlayerState(),
        "ai_players": [ 
            makeInitialAiPlayerState(), 
            makeInitialAiPlayerState(), 
            makeInitialAiPlayerState(), 
            makeInitialAiPlayerState(),
            makeInitialAiPlayerState(),
            makeInitialAiPlayerState(),
            makeInitialAiPlayerState(),
            makeInitialAiPlayerState()
        ]
    };
}

function showResult(isVictory) {
    d3.select("#result")
        .attr("style", "visibility: visible");
    d3.select("#main")
        .attr("style", "visibility: hidden");

    d3.select("#result_text")
        .text(isVictory ? 
            "Good job! Only you and one other player are left, everyone else ran out of budget." : 
            "Oops, you ran out of budget!");

    d3.select("#retry_button")
        .on("click", reStartGame);

}

function reStartGame() {
    d3.select("#main")
        .attr("style", "visibility: visible");
    d3.select("#result")
        .attr("style", "visibility: hidden");
    state = makeInitialGameState();
    updateCanvas();
}

function main() {
    d3.select("#result")
        .attr("style", "visibility: hidden");
    d3.select("#main")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 1536 2048")
        .attr("id", "game_canvas");
    drawGame();
}
var state = makeInitialGameState();
var rules = {
    "cost_of_move": 1,
    "reward_if_first": 2,
    "reward_if_second": 1,
    "productivity_penalty": 1,
    "productivity_gain": 1
}
document.addEventListener("DOMContentLoaded", main);
