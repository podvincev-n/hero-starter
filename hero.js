/* eslint no-unused-vars: 0 */
/*

Strategies for the hero are contained within the "moves" object as
name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

The "moves" object only contains the data, but in order for a specific
strategy to be implemented we MUST set the "move" variable to a
definite property.  This is done like so:

move = moves.heWhoLivesToFightAnotherDay;

You MUST also export the move function, in order for your code to run
So, at the bottom of this code, keep the line that says:

module.exports = move;

The "move" function must return "North", "South", "East", "West", or "Stay"
(Anything else will be interpreted by the game as "Stay")

The "move" function should accept two arguments that the website will be passing in:
- a "gameData" object which holds all information about the current state
  of the battle
- a "helpers" object, which contains useful helper functions
- check out the helpers.js file to see what is available to you

*/

// Strategy definitions
var moves = {
    // Aggressor
    aggressor: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 30
        if (gameData.activeHero.health <= 30){
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go attack someone...anyone.
            return helpers.findNearestEnemy(gameData);
        }
    },

    // Health Nut
    healthNut: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 75
        if (gameData.activeHero.health <= 75){
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go mine some diamonds!!!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // Balanced
    balanced: function (gameData, helpers){
        // Here we determine if it's an even or odd turn for your hero;
        if ((gameData.turn / 2) % 2) {
            // If it is even, act like an an Aggressor
            return moves.aggressor(gameData, helpers);
        } else {
            // If it is odd, act like a Priest
            return moves.priest(gameData, helpers);
        }
    },

    // The "Northerner"
    // This hero will walk North.  Always.
    northener: function (gameData, helpers) {
        return 'North';
    },

    // The "Blind Man"
    // This hero will walk in a random direction each turn.
    blindMan: function (gameData, helpers) {
        var choices = ['North', 'South', 'East', 'West'];
        return choices[Math.floor(Math.random()*4)];
    },

    // The "Priest"
    // This hero will heal nearby friendly champions.
    priest: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 60) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestTeamMember(gameData);
        }
    },

    // The "Unwise Assassin"
    // This hero will attempt to kill the closest enemy hero. No matter what.
    unwiseAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 30) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestEnemy(gameData);
        }
    },

    // The "Careful Assassin"
    // This hero will attempt to kill the closest weaker enemy hero.
    carefulAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 50) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestWeakerEnemy(gameData);
        }
    },

    // The "Safe Diamond Miner"
    // This hero will attempt to capture enemy diamond mines.
    safeDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        // Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });
        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            // Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            // Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            // If healthy, go capture a diamond mine!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // The "Selfish Diamond Miner"
    // This hero will attempt to capture diamond mines (even those owned by teammates).
    selfishDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        // Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });

        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            // Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            // Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            // If healthy, go capture a diamond mine!
            return helpers.findNearestUnownedDiamondMine(gameData);
        }
    },
    
    // Take a look
    lookaround: function (gd, hlp) {
      var h = gd.activeHero;
      var b = gd.board;
      var ds = [['North', [-1, 0]], ['East', [0, 1]], ['South', [1, 0]], ['West', [0, -1]]];
      var hft = h.distanceFromTop;
      var hfl = h.distanceFromLeft;
      var mr = Math.max(hfl + hft, -2 + b.lengthOfSide - hfl + b.lengthOfSide - hft);
      var r = 0;
      var t = c = [];
      var s = i = j = 0;
      var k = hft + '|' + hfl;
      var v = {}; v[k] = true;
      var cn = {};
      var data = {};
      var n = 'Stay';
      tl = {0:[[n, [hft, hfl], b.tiles[hft][hfl]]]};
      while (r < mr) { r++; tl[r] = [];
        cn[r] = {f:0, e:0, eh:0, ehm:100};
        data[r] = {e:[]};
        for (j in tl[(r-1)]) {
          t = tl[(r-1)][j];
          for (i = 0; i <= 3; i++) {
            c = [t[1][0] + ds[i][1][0], t[1][1] + ds[i][1][1]];
            k = c[0] + '|' + c[1];
            if (!v.hasOwnProperty(k) && hlp.validCoordinates(b, c[0], c[1])) {
              v[k] = true;
              s = b.tiles[c[0]][c[1]];
              n = 'Stay';
              if (r==1 && s.type === 'Unoccupied')
                n = ds[i][0];
              else
                n = t[0];
              tl[r][k] = [n, c, s];
              
//              console.log('== ' + c[0] + '|' +  c[1] + ' == ' + s.type);
              
              // counters
              if (s.type === 'Hero'){
                if (s.team == h.team) {
                  cn[r].f++;
                } else {
                  cn[r].e++;
                  cn[r].eh+= s.health;
                  cn[r].ehm = Math.min(cn[r].ehm, s.health);
                  data[r].e.push(s);
                }
              }
              
            }
          }
        }
        
        // logic
//        console.log('== r' + r + ' ==');
//        for (var k in cn[r]){
//          console.log(k + ' == ' + cn[r][k]);
//        }
        
        // run
        if (cn[r].e * 30 >= h.health) {
          console.log('run');
          return moves.fear(gd, hlp, r, tl, cn, data);
        }
        
      }
      
      // mine
      console.log('mine');
      return moves.selfishDiamondMiner(gd, hlp);
    },
    
    // Run away
    fear: function (gd, hlp, ar, tl, cn, data) {
      var h = gd.activeHero;
      var b = gd.board;
      var hft = h.distanceFromTop;
      var hfl = h.distanceFromLeft;
      var c = [0, 0, 0];
      for (var i = 1; i <= ar; i++)
        for (var j = 0; j < data[ar].e.length; j++){
          c[0]+= data[ar]['e'][j].distanceFromTop;
          c[1]+= data[ar]['e'][j].distanceFromLeft;
          c[2]++;
        }
      var n = 'Stay';
      var d, s;
      var cn = [Math.round(c[0]/c[2]), Math.round(c[1]/c[2])];
      var dm = Math.abs(hft-cn[0]) + Math.abs(hfl-cn[1]);
      for (j in tl[1]) {
        //TODO проверка на наличие непустых
        s = b.tiles[tl[1][j][1][0]][tl[1][j][1][1]];
        if (s.type === 'Unoccupied'){
          d = Math.abs(tl[1][j][1][0]-cn[0]) + Math.abs(tl[1][j][1][1]-cn[1]);
          if (d > dm){
            dm = d;
            n = tl[1][j][0];
          }
        }
      }
//      console.log(n);
      return n;
    }
};

// Set our hero's strategy
var move =  moves.lookaround;

// Export the move function here
module.exports = move;
