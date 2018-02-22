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
  
    // Take a look
    lookaround: function (gd, hlp) {
      if (gd.turn === 0) {
        for (var ti = 0; ti < 2; ti++) {
          console.log('== team ' + ti + ' ==');
          for (var id = 0; id < gd.heroes.length; id++){
            if (gd.heroes[id].team == ti) console.log('H' + (id.length < 2 ? '0' : '') + id);
          }
        }
      }
      console.log('-----------------------------');
      
//      for (var k in gd.heroes[0]){
//        console.log(k + ' == ' + gd.heroes[0][k]);
//      }
      
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
      var cn = {0:{f:0, fhm:100, e:0, eh:0, ehm:150, u:0, m:0, w:0}};
      var data = {0:{e:[], f:[], fhm:false, ehm:false, m:false, w:false}};
      var n = 'Stay';
      tl = {0:[[n, [hft, hfl], b.tiles[hft][hfl]]]};
      while (r < mr) { r++; tl[r] = [];
        cn[r] = Object.assign({}, cn[r-1]);
        cn[r].u = 0;
        data[r] = Object.assign({}, data[r-1]);
        for (j in tl[(r-1)]) {
          t = tl[(r-1)][j];
          if (t[2].type === 'Unoccupied' || r === 1) {
            for (i = 0; i <= 3; i++) {
              c = [t[1][0] + ds[i][1][0], t[1][1] + ds[i][1][1]];
              k = c[0] + '|' + c[1];
              if (!v.hasOwnProperty(k) && hlp.validCoordinates(b, c[0], c[1])) {
                v[k] = true;
                s = b.tiles[c[0]][c[1]];
                n = r==1 ? ds[i][0] : t[0];
                tl[r][k] = [n, c, s];

//                console.log('== ' + c[0] + '|' +  c[1] + ' == ' + s.type);

                // counters
                if (s.type === 'Hero'){
                  if (s.team == h.team) {
                    cn[r].f++;
                    if (s.health < cn[r].fhm) {
                      cn[r].fhm = s.health;
                      data[r].fhm = [n, c, s];
                    }
                    data[r].f.push(s);
                  } else {
                    cn[r].e++;
                    cn[r].eh+= s.health;
                    if (s.health < cn[r].ehm) {
                      cn[r].ehm = s.health;
                      data[r].ehm = [n, c, s];
                    }
                    data[r].e.push(s);
                  }
                }
                if (s.type === 'DiamondMine'){
                  if (!s.owner || (s.owner && gd.heroes[s.owner.id].team != h.team)) {
                    cn[r].m++;
                    if (data[r].m === false) data[r].m = [n, c, s];
                  }
                }
                if (s.type === 'HealthWell'){
                  cn[r].w++;
                  if (data[r].w === false) data[r].w = [n, c, s];
                }
                if (s.type === 'Unoccupied'){
                  cn[r].u++;
                }

              }
            }
          }
          
        }
        
        // logic
        console.log('== r' + r + ' ==');

        // blocked
        if (r == 1 && cn[r].u == 0) {
          return moves.panic(gd, hlp, r, tl, cn, data);
        }
        if (r == 1) console.log('- non blocked: ' + cn[r].u + ' ways');
        
        // run
        if (cn[r].e * 30 >= h.health) {
          return moves.fear(gd, hlp, r, tl, cn, data);
        }
        console.log('- no fear: ' + cn[r].e + ' enemies (*30) < ' + h.health + ' health');
        
        // drink
        if (h.health <= 70 && data[r].w) {
          console.log('drink --> ' + data[r].w[1][0] + '|' +  data[r].w[1][1] + ' HealthWell' + ' (' + h.health + ' health)');
          return data[r].w[0];
        }
        console.log('- no drink: ' + h.health + ' health');
        
        // heal
        if (cn[r].fhm <= 60) {
          console.log('heal --> ' + data[r].fhm[1][0] + '|' +  data[r].fhm[1][1] + ' with ' + cn[r].fhm + ' health');
          return data[r].fhm[0];
        }
        console.log('- no heal: no injured');
        
        // retreat
        if (cn[r].e > (cn[r].f + 1) && h.health < 90 && r < 4) {
          console.log('retreat: ' + cn[r].e + ' enemies > ' + (cn[r].f + 1) + ' friends');
          return moves.fear(gd, hlp, r, tl, cn, data);
        }
        console.log('- no retreat: ' + cn[r].e + ' enemies <= ' + (cn[r].f + 1) + ' friends');
        
        // mine
        if (cn[r].m > 0) {
          console.log('mine --> ' + data[r].m[1][0] + '|' +  data[r].m[1][1] + ' DiamondMine' + (data[r].m[2].owner ? ', owner ' + data[r].m[2].owner.id + ' (team ' + gd.heroes[data[r].m[2].owner.id].team + ')' : ', free'));
          return data[r].m[0];
        }
        console.log('- no mine: ' + cn[r].m + ' free mines around');
        
        // attack
        if ((cn[r].f + 1) >= cn[r].e && data[r].ehm && h.health > 60) {
          return moves.attack(gd, hlp, r, tl, cn, data);
        }
        console.log('- no attack: ' + (cn[r].f + 1) + ' friends < ' + cn[r].e + ' enemies');
        
        // group
        if (cn[r].f > 0 && cn[r].e > 0 && r >= 4 && h.health < 100) {
          return moves.group(gd, hlp, r, tl, cn, data);
        }
        console.log('- no group: ' + cn[r].f + ' friends');
      }
      
      // random
      console.log('attack or fear');
      if (Math.floor(Math.random()*1) > 0)
        return moves.attack(gd, hlp, r, tl, cn, data);
      return moves.fear(gd, hlp, r, tl, cn, data);
    },
    
    // Go go go
    attack: function (gd, hlp, r, tl, cn, data) {
      console.log('attack --> ' + data[r].ehm[1][0] + '|' +  data[r].ehm[1][1] + ' with ' + cn[r].ehm + ' health');
      return data[r].ehm[0];
    },
    
    // Close to friends
    group: function (gd, hlp, r, tl, cn, data) {
      console.log('group');
      var b = gd.board;
      var i, j, d, s;
      var dm = 1000;
      var n = 'Stay';
      for (j in tl[1]) {
        s = b.tiles[tl[1][j][1][0]][tl[1][j][1][1]];
        if (s.type === 'Unoccupied'){
          d = 0;
          for (i = 0; i < data[r].f.length; i++){
            d+= Math.abs(tl[1][j][1][0]-data[r]['f'][i].distanceFromTop) + Math.abs(tl[1][j][1][1]-data[r]['f'][i].distanceFromLeft);
          }
          if (d < dm){
            dm = d;
            n = tl[1][j][0];
          }
        }
      }
      if (n === 'Stay') {
        return moves.panic(gd, hlp, r, tl, cn, data);
      }
      return n;
    },
    
    // Run away
    fear: function (gd, hlp, r, tl, cn, data) {
      console.log('fear');
      var h = gd.activeHero;
      var b = gd.board;
      var i, j, d, s;
      var dm = 0;
      var n = 'Stay';
      for (j in tl[1]) {
        s = b.tiles[tl[1][j][1][0]][tl[1][j][1][1]];
        if (s.type === 'HealthWell' && h.health < 100 && r > 1){
          console.log('drink');
          return tl[1][j][0];
        }
        if (s.type === 'Unoccupied'){
          d = 0;
          for (i = 0; i < data[r].e.length; i++){
            d+= Math.abs(tl[1][j][1][0]-data[r]['e'][i].distanceFromTop) + Math.abs(tl[1][j][1][1]-data[r]['e'][i].distanceFromLeft);
          }
          if (d > dm){
            dm = d;
            n = tl[1][j][0];
          }
        }
      }
      if (n === 'Stay') {
        return moves.panic(gd, hlp, r, tl, cn, data);
      }
      return n;
    },
    
    // Crazy starts
    panic: function (gd, hlp, r, tl, cn, data) {
      console.log('panic');
      var h = gd.activeHero;
      var b = gd.board;
      var m = 0;
      // 20 - critical health
      // 15 - heal friend
      // 10 - heal yourself
      // 5 - hit enemy
      // 0 - mine
      var s;
      var n = 'Stay';
      var a = '';
      for (var j in tl[1]) {
        s = b.tiles[tl[1][j][1][0]][tl[1][j][1][1]];
        if (m < 15 && s.type === 'Hero' && s.team == h.team && s.health < 100){
          m = 15;
          n = tl[1][j][0];
          a = 'heal';
        }
        if (s.type === 'HealthWell' && h.health < 100){
          if (m < 20 && h.health <= 30) {
            m = 20;
            n = tl[1][j][0];
          }
          if (m < 10) {
            m = 10;
            n = tl[1][j][0];
          }
        }
        if (m < 5 && s.type === 'Hero' && s.team != h.team){
          m = 5;
          n = tl[1][j][0];
        }
        if (m == 0 && s.type === 'DiamondMine'){
          n = tl[1][j][0];
        }
      }
      return n;
    }
};

// Set our hero's strategy
var move =  moves.lookaround;

// Export the move function here
module.exports = move;
