var posX = NaN;
var posY = NaN;
pb.onmousemove = function (event) {
  return false;
};
pb.onclick = function (event) {
  return false;
};

var OutPos = [];
var g_dx = 0;
var g_dy = 0;
var maindiv = document.getElementById('main');
var gMouseDown = false;

maindiv.onmousedown = function (event) {
  if (event.button != 0) return;
  gMouseDown = true;
};
maindiv.onmousemove = function (event) {
  let dx = event.pageX - OutPos[0];
  let dy = event.pageY - OutPos[1];
  OutPos = [event.pageX, event.pageY];
  if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
    //限制移动范围
    // g_dx = 0;
    // g_dy = 0;
    return;
  } 
  if (gMouseDown) {
    g_dx += dx;
    g_dy += dy;
    // console.log(g_dx,g_dy);
    // 相机方向局部x坐标,即右边
    // let cameraLx = Vector.VectorAllOne().Mul(up).Cross(camera.dir);
  }
  return;
};
maindiv.onmouseup = function (event) {
  gMouseDown = false;
  return;
};
maindiv.oncontextmenu = function (event) {
  event.preventDefault();
};

maindiv.onclick = function (event) {
  return false;
};
var speed = new Vector([0.1, 0.1, 0.1, 0]);
var cameraLx =null;
var cameraOffset = new Vector([0, 0, 0, 0]);
var key_w_Down = false;
var key_s_Down = false;
var key_a_Down = false;
var key_d_Down = false;
var key_e_Down = false;
var key_q_Down = false;
document.onkeydown = function (event) {
  // if(!gMouseDown) return;
  switch (event.key) {
    case 'w':
      key_w_Down = true;
      break;
    case 's':
      key_s_Down = true;
      break;
    case 'a':
      key_a_Down = true;
      break;
    case 'd':
      key_d_Down = true;
      break;
    case 'e':
      key_e_Down = true;
      break;
    case 'q':
      key_q_Down = true;
      break;
    default:
      return;
  }
  return;
};
document.onkeyup = function (event) {
  switch (event.key) {
    case 'w':
      key_w_Down = false;
      break;
    case 's':
      key_s_Down = false;
      break;
    case 'a':
      key_a_Down = false;
      break;
    case 'd':
      key_d_Down = false;
      break;
    case 'e':
      key_e_Down = false;
      break;
    case 'q':
      key_q_Down = false;
      break;
    default:
      return;
  }
  return;
};
var g_keyPickGap = 5;
setInterval(() => {
  if(key_w_Down){
    cameraOffset.Add(camera.dir).Mul(speed);
  }
  if(key_s_Down){
    cameraOffset.Add(camera.dir).Mul(speed).Neg();
  }
  if(key_a_Down){
    cameraOffset.Add(cameraLx).Mul(speed);
  }
  if(key_d_Down){
    cameraOffset.Add(cameraLx).Mul(speed).Neg();
  }
  if(key_e_Down){
    cameraOffset.Add(up).Mul(speed);
  }
  if(key_q_Down){
    cameraOffset.Add(up).Mul(speed).Neg();
  }
}, g_keyPickGap);
