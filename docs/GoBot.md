
For the IPvGO subnet game, we are going to create a bot using the (slightly) customized rules laid out in the minigame.

First, we need to prepare to represent a board. It is given to us in a string format, with rows and characters arranged as such:

```json
[  
"XX.O.",  
"X..OO",  
".XO..",  
"XXO.#",  
".XO.#",  
]
```

X's are Black, O's are white, .'s are empty, and #'s are dead nodes which are not part of the game (and do not count as territory nor open nodes).

We will construct this board as a Board object with various Points:

```js
class Board {
  constructor(state) {
    this.grid = 
  }
}
```