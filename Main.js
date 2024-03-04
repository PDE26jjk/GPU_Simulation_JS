var d1,d2;

var zbuffer;

window.onload = function () {
  function render() {
    d1 = new Date().getTime();

    gfx.Draw();

    d2 = new Date().getTime();
    g_timeGapFrame = d2 - d1;
    clearInterval(set1);
    set1 = setInterval(render, g_timeGapDefault > g_timeGapFrame ? g_timeGapDefault : g_timeGapFrame);
    document.title = '每帧:' + g_timeGapFrame + 'ms';
  };
  var set1 = setInterval(render, g_timeGapDefault);
};
var g_timeGapDefault = 10;
var g_timeGapFrame = 10;

LoadObjPath('Models/ball2.obj').then(shapes => {
  shapes.forEach(shape => {
    shape.setMaterial(DefaultMaterial)
    gfx.AddShape(shape)
  })
})

let pos = new Vector([0, 0, -6, 1]);
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

