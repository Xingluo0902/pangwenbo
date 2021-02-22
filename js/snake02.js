window.onload = function() {
    var sw = 20;
    var sh = 20;
    var tr = 30;
    var td = 30;
    var snake = null;
    var food = null;
    var game = null;

    function Square(x, y, classname) {
        this.x = x * sw;
        this.y = y * sh;
        this.class = classname;
        this.viewDiv = document.createElement('div');
        this.viewDiv.className = this.class;
        this.parent = document.getElementById('snakeWrap');
    }

    Square.prototype.create = function() {
        this.viewDiv.style.position = 'absolute';
        this.viewDiv.style.left = this.x + 'px';
        this.viewDiv.style.top = this.y + 'px';
        this.viewDiv.style.width = sw + 'px';
        this.viewDiv.style.height = sh + 'px';
        this.parent.appendChild(this.viewDiv);
    }
    Square.prototype.remove = function() {
        this.parent.removeChild(this.viewDiv);
    }


    function Snake() {
        this.head = null;
        this.tail = null;
        this.pos = [];
        this.directions = {
            left: {
                x: -1,
                y: 0,
                rotate: 180
            },
            up: {
                x: 0,
                y: -1,
                rotate: -90
            },
            right: {
                x: 1,
                y: 0,
                rotate: 0
            },
            down: {
                x: 0,
                y: 1,
                rotate: 90
            },

        }

    }
    Snake.prototype.init = function() {
        var snakeHead = new Square(2, 0, 'snakeHead');
        snakeHead.create();
        this.head = snakeHead;
        this.pos.push([2, 0]);
        var snakeBody1 = new Square(1, 0, 'snakeBody');
        snakeBody1.create();
        this.pos.push([1, 0]);
        var snakeBody2 = new Square(0, 0, 'snakeBody');
        snakeBody2.create();
        this.tail = snakeBody2;
        this.pos.push([0, 0]);

        snakeHead.last = null;
        snakeHead.next = snakeBody1;
        snakeBody1.last = snakeHead;
        snakeBody1.next = snakeBody2;
        snakeBody2.last = snakeBody1;
        snakeBody2.next = null;

        this.direction = this.directions.right;
    }
    Snake.prototype.getNextPos = function() {
        var nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]
        var self = false;
        this.pos.forEach(function(value) {
            if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
                self = true;
            }
        })
        if (self) {
            console.log('撞到了自己！');
            this.strategies.death.call(this);
            return;
        }
        if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
            console.log('撞到墙了！');
            this.strategies.death.call(this);
            return;
        }

        if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
            console.log('撞到食物了！');
            this.strategies.eat.call(this);
        }

        this.strategies.move.call(this);

    }
    Snake.prototype.strategies = {
        move: function(format) {
            var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
            newBody.next = this.head.next;
            newBody.next.last = newBody;
            newBody.last = null;
            this.head.remove();
            newBody.create();
            var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
            newHead.next = newBody;
            newHead.last = null;
            newBody.last = newHead;
            newHead.viewDiv.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
            newHead.create();
            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
            this.head = newHead;
            if (!format) {
                this.tail.remove();
                this.tail = this.tail.last;
                this.pos.pop();
            }
        },
        eat: function() {
            this.strategies.move.call(this, true);
            createFood();
            game.scores++;
        },
        death: function() {
            console.log('Game Over!')
            game.over();
        }
    }
    snake = new Snake();

    function createFood() {
        var x = null;
        var y = null;
        var onSnake = true;
        while (onSnake) {
            x = Math.round(Math.random() * (td - 1));
            y = Math.round(Math.random() * (tr - 1));

            snake.pos.forEach(function(value) {
                if (x != value[0] && y != value[1]) {
                    onSnake = false;
                }
            });
        }
        food = new Square(x, y, 'snakeFood');
        food.pos = [x, y];
        var snakeFood = document.getElementsByClassName("snakeFood")[0];
        if (snakeFood) {
            snakeFood.style.left = x * sw + 'px';
            snakeFood.style.top = y * sh + 'px';
        } else {
            food.create();
        }

    }


    function Game() {
        this.timer = null;
        this.scores = 0;
    }
    Game.prototype.init = function() {
        snake.init();
        createFood();
        document.onkeydown = function(event) {
            if (event.which == 37 && snake.direction != snake.directions.right) {
                snake.direction = snake.directions.left;
                console.log('左');
            } else if (event.which == 38 && snake.direction != snake.directions.down) {
                snake.direction = snake.directions.up;
                console.log('上');
            } else if (event.which == 40 && snake.direction != snake.directions.up) {
                snake.direction = snake.directions.down;
                console.log('下');
            } else if (event.which == 39 && snake.direction != snake.directions.left) {
                snake.direction = snake.directions.right;
                console.log('右');
            }

        }
        this.start();
    }
    Game.prototype.start = function() {
        this.timer = setInterval(function() {
            snake.getNextPos();
        }, 200);
    }
    Game.prototype.pause = function() {
        clearInterval(this.timer);
    }
    var snakeWrap = document.getElementById('snakeWrap');
    Game.prototype.over = function() {
        clearInterval(this.timer);
        alert('你的蛇吃掉了' + this.scores + '樱桃！')
        snakeWrap.innerHTML = '';
        snake = new Snake();
        game = new Game();
        startbtn.style.display = 'block';
    }
    game = new Game();
    var startbtn = document.getElementsByClassName('btn')[0];
    startbtn.onclick = function() {
        startbtn.style.display = 'none';
        game.init();
    }
    var pauseBtn = document.getElementsByClassName('pauseBtn')[0];

    snakeWrap.onclick = function() {
        game.pause();
        pauseBtn.style.display = 'block';
    }
    pauseBtn.onclick = function() {
        game.start();
        pauseBtn.style.display = 'none';
    }
}