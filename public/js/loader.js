var c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    cw = 150,
    ch = 150;

c.width = cw;
c.height = ch;

var rand = function(a,b){return ~~((Math.random()*(b-a+1))+a);}

var path = [
        {x: cw/2, y:(ch/2-50)},
        {x: (cw/2)-60, y: (ch/2+50)},
        {x: (cw/2)+60, y: (ch/2+50)}
    ],
    particles = [],
    particleCount = 10,
    particleDelayTick = 7,
    particleDelayTickMax = 7,
    hue = rand(0, 360);

var Particle = function(path, speed){
    this.path = path;
    this.currentPoint = 0;
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = speed;
}

var createParticles = function(){
    if(particles.length < particleCount){
        if(particleDelayTick >= particleDelayTickMax){
            particles.push(new Particle(path, 3));
            particleDelayTick = 0;
        } else {
            particleDelayTick++;
        }
    }
}

var updateParticles = function(){
    var i = particles.length;
    while(i--){
        var p = particles[i];

        var onLastPoint = (p.currentPoint === p.path.length-1);
        var nextPoint = (onLastPoint) ? 0 : p.currentPoint+1;
        var dx = p.path[nextPoint].x - p.x;
        var dy = p.path[nextPoint].y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var vx = dx / dist * p.speed;
        var vy = dy / dist * p.speed;

        if(dist > p.speed){
            p.x += vx;
            p.y += vy;
        } else {
            p.x = p.path[nextPoint].x;
            p.y = p.path[nextPoint].y;
            p.currentPoint = nextPoint;
        }
    }
}

var renderParticles = function(){
    ctx.fillStyle = 'hsla('+hue+',50%,10%,1)';
    ctx.strokeStyle = 'hsla('+hue+',50%,10%,1)';
    var i = particles.length;
    while(i--){
        var p = particles[i];
        var i2 = particles.length;
        while(i2--){
            var p2 = particles[i2];
            if(i != i2){
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(cw/2, ch/2);
                ctx.stroke();
            }
        }
    }
}

var eraseIt = function(){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, .4)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';
}

var loopsIDidItAgain = function(){
    eraseIt();
    createParticles();
    updateParticles();
    renderParticles();
    hue = (hue < 360) ? hue+1 : 0;
}

setInterval(loopsIDidItAgain, 5);