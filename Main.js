var d1 = new Date().getTime();

var zbuffer;

// console.log(zbuffer);
var d2 = new Date().getTime();
console.log(d2 - d1);

window.onload = function () {
  function render() {
    d1 = new Date().getTime();

    gfx.Draw();

    d2 = new Date().getTime();
    g_timeGapFrame = d2 - d1;
    // console.log();
    clearInterval(set1);
    set1 = setInterval(render, g_timeGapDefault > g_timeGapFrame ? g_timeGapDefault : g_timeGapFrame);
    document.title = '每帧:' + g_timeGapFrame + 'ms';
  };
  var set1 = setInterval(render, g_timeGapDefault);

  // gfx.DrawLineOneBox(319,404,269,404);
  // gfx.DrawLineOneBox(100,100,100,200);
  // gfx.DrawLine(50,50,100,100);
};
var g_timeGapDefault = 10;
var g_timeGapFrame = 10;

LoadObjPath('Models/a.obj').then(shapes => {
  shapes.forEach(shape => {
    gfx.AddShape(shape)
  })
})

let pos = new Vector([-2, 0, -8, 1]);
let dir = new Vector([0, 0, 1, 0]);
var camera = new Camera(pos, dir);

gfx.SetCamera(camera);

document.getElementById('IsClip').onclick = function () {
  gfx.useClipTriangle = this.checked;
};
document.getElementById('IsLine').onclick = function () {
  gfx.useLineRender = this.checked;
};
document.getElementById('IsCullBack').onclick = function () {
  gfx.useCullBack = this.checked;
};

