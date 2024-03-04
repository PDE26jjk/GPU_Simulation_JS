/**https://blog.csdn.net/u011607490/article/details/85330110
 * MatFill
 * @param value
 * @param x
 * @param y
 */
let MatFill = (value, x, y = x) =>
  Array(y)
    .fill(0)
    .map(() => Array(x).fill(value));

/**
 * 内插值
 * @param {number} p0 
 * @param {number} p1 
 * @param {number} t 
 */
function intr(p0, p1, t) {
  if (p0 instanceof Vector) {
    return Vector.inter(p0, p1, t)
  }
  return p0 + (p1 - p0) * t;
}
class Gfx {
  /**
   * @type {Array<Shape>}
   */
  Shapes = []
  constructor(pixelBox) {
    this.pointNum = 0; //div数量
    this.divStr = []; //div的HTML
    this.pixelBox = pixelBox;
    this.origin = [pixelBox.offsetLeft, pixelBox.offsetTop];
    this.width = pixelBox.clientWidth;
    this.height = pixelBox.clientHeight;
    this.useClipTriangle = true;
    this.useLineRender = false

    this.usePerspZ = true;
    this.usePerspX = false;
    this.usePerspY = false;
    this.useCullBack = true;

    this.uniqueLines = new Set();
    this.MainCamera = null;
    /**
     * 定义两个cav，模拟交换链中的前后缓冲，每次绘制就将元素更新到隐藏的div,调用Present就交换显示隐藏。
     */
    this.preIndex = 0; //前后缓冲的序号
    this.preBuffer = [document.createElement('canvas'), document.createElement('canvas')];
    this.preBuffer.forEach((pbf) => {
      this.pixelBox.appendChild(pbf);
    });
    this.preBuffer[0].style.display = 'none';
    this.preBuffer[1].style.display = 'inline-block';
    this.preBuffer[0].fillStyle = "#000";
    this.preBuffer[1].fillStyle = "#000";
    this.preBuffer[0].style.width = `${this.width}px`;
    this.preBuffer[1].style.width = `${this.width}px`;
    this.preBuffer[0].style.height = `${this.height}px`;
    this.preBuffer[1].style.height = `${this.height}px`;
    this.preBuffer[0].width = this.width;
    this.preBuffer[1].width = this.width;
    this.preBuffer[0].height = this.height;
    this.preBuffer[1].height = this.height;
    this.preBuffer[0].setAttribute('name', 'pb0');
    this.preBuffer[1].setAttribute('name', 'pb1');
    this.preBuffer[0] = this.preBuffer[0].getContext("2d");
    this.preBuffer[1] = this.preBuffer[1].getContext("2d");
  }
  Present() {
    this.preBuffer[this.preIndex].canvas.style.display = 'inline-block';
    this.preIndex = !this.preIndex + 0;
    this.preBuffer[this.preIndex].canvas.style.display = 'none';
  }
  /**
   *
   * @param {Camera} Camera
   */
  SetCamera(Camera) {
    this.MainCamera = Camera;
  }
  ResetPixelBox(pixelBox) {
    this.pixelBox = pixelBox;
    this.origin = [pixelBox.offsetLeft, pixelBox.offsetTop];
    this.width = pixelBox.clientWidth;
    this.height = pixelBox.clientHeight;
  }
  AddShape(Shape) {
    this.Shapes.push(Shape);
  }

  static ClearBuffer() {
    // allV = [];
    // allI = [];
    // allLine = [];
    zbuffer = MatFill(2, 800, 600);
  }
  Draw() {
    // 数据更新----------------------------
    this.pointNum = 0;
    this.ClearPixelBox();
    Gfx.ClearBuffer();

    cameraLx = Vector.VectorAllOne().Mul(up).Cross(camera.dir);
    // 移动视角
    if (g_dy)
      this.MainCamera.RotateCamera(cameraLx, 0.005 * g_dy);
    if (g_dx)
      this.MainCamera.RotateCamera(up, 0.005 * -g_dx);
    this.MainCamera.MoveCamera(cameraOffset);
    pixelBox_W = this.width;
    pixelBox_H = this.height;
    // 计算顶点----------------------------
    this.Shapes.forEach((shape) => {
      // let indexEnd = allV.length;
      let MVP = Matrix.IdentityMatrix().Mul(shape.M).Mul(this.MainCamera.VP);
      let material = shape.material
      let shader = material.shader
      GlobalRender = {
        M: shape.M,
        V: this.MainCamera.V,
        P: this.MainCamera.P,
        VP: this.MainCamera.VP,
        MVP: MVP
      }
      // material.setParameters()
      let posVSname = Object.keys(shader.v2f).find((key) => shader.v2f[key] === "POSITION0")
      if (!posVSname) {
        console.error(shape.name + ": 着色器错误！请在v2f中加上POSITION语义");
        return
      }
      for (let index = 0; index < shape.indices.length; index++) {

        // if(index>= 1) break
        const indexGroup = shape.indices[index];

        let primitive = []
        indexGroup.forEach(i => {
          let appData = {}
          for (const k of Object.keys(shader.appData)) {
            switch (shader.appData[k]) {
              case "VERTEX":
                appData[k] = shape.vertices[i]
                break;
              case "NORMAL":
                appData[k] = shape.normals[i]
                break;
              case "COLOR":
                appData[k] = shape.colors[i]
                break;
              case "UV":
                appData[k] = shape.coordinates[i]
                break;
              default:
                break;
            }
          }
          let v2f = material.VS(appData);

          primitive.push(v2f)// 未插值
        })// primitive
        let triangle = primitive.map(p => {
          let posVS = p[posVSname].MulScale(1 / p[posVSname].w())
          posVS.vct[0] = posVS.vct[0] * -0.5 + 0.5;
          posVS.vct[0] *= pixelBox_W
          posVS.vct[1] = posVS.vct[1] * -0.5 + 0.5;
          posVS.vct[1] *= pixelBox_H
          return p[posVSname]
        })
        // console.log(triangle[0].vct,triangle[1].vct,triangle[2].vct);
        // 视锥裁剪
        if (this.useClipTriangle)
          if (!this.ClipTriangleTest(triangle)) {
            continue
          }

        // 背面剔除
        if (this.useCullBack) {
          if (!this.CullBackTest(triangle)) {
            continue
          }
        }
        // console.log(triangle[0].vct,triangle[1].vct,triangle[2].vct);
        // 完成深度测试、调用像素着色器
        // this.preBuffer[this.preIndex].fillStyle = "#f00";
        if (!this.useLineRender)
          this.FillTriangle(triangle, posVSname, primitive, material)
        else {
          this.DrawLineOneBox(...triangle[0].xy(), ...triangle[1].xy());
          this.DrawLineOneBox(...triangle[0].xy(), ...triangle[2].xy());
          this.DrawLineOneBox(...triangle[1].xy(), ...triangle[2].xy());
        }

      }// indices

    })// shape

    this.Present();
    //收集的数据清零----------------------------
    g_dx = 0;
    g_dy = 0;
    cameraOffset = new Vector([0, 0, 0, 0]);
    // console.log(this.divNum);
  }
  ClipTriangleTest(triangle) {
    // 最简单的处理，只要有一个点在屏幕内，就不裁剪。
    for (let j = 0; j < triangle.length; j++) {
      const point = triangle[j];

      if (point.vct[0] >= 0 && point.vct[0] <= 1 &&
        point.vct[1] >= 0 && point.vct[1] <= 1) {
        return true;
      }
      return true;
    }
  }
  CullBackTest(triangle) {
    let v1 = Vector.FromTo(triangle[0], triangle[1]);
    let v2 = Vector.FromTo(triangle[0], triangle[2]);
    let crossZ = v1.vct[0] * v2.vct[1] - v1.vct[1] * v2.vct[0];
    return crossZ < 0
  }
  /**
   * Draw a rect appended yo pixel box base on given x,y, width, height and color.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {*} bb 后缓冲
   */
  DrawRect(x, y, width, height, bb = this.preBuffer[this.preIndex]) {
    this.pointNum += 1;
    bb.fillRect(x, y, width, height);
  }
  ClipLine(x1, y1, x2, y2) {
    let p = [
      x1 - x2, // -deltaX
      x2 - x1, // deltaX
      y1 - y2, // -deltaY
      y2 - y1, // deltaY
    ];
    if (!p[0] && !p[2]) return [0, 0, 0, 0];
    let q = [
      x1, // q1
      this.width - x1, // q2
      y1, // q3
      this.height - y1, // q4
    ];
    let umax = [0];
    let umin = [1];
    for (let i = 0; i < 4; i++) {
      // 平行于x或y轴
      if (p[i] == 0) {
        if (q[i] < 0) return [0, 0, 0, 0];
        else {
          if (!i) {
            //i=0
            if (q[3] / p[3] < q[2] / p[2]) {
              umax.push(q[3] / p[3]);
              umin.push(q[2] / p[2]);
            } else {
              umin.push(q[3] / p[3]);
              umax.push(q[2] / p[2]);
            }
            break;
          } else {
            if (q[0] / p[0] < q[1] / p[1]) {
              umin.push(q[1] / p[1]);
              umax.push(q[0] / p[0]);
            } else {
              umax.push(q[1] / p[1]);
              umin.push(q[0] / p[0]);
            }

            break;
          }
        }
      } //入边交点
      else if (p[i] < 0) {
        umax.push(q[i] / p[i]);
      } //出边交点
      else {
        umin.push(q[i] / p[i]);
      }
    }
    umax = Math.max(...umax);
    umin = Math.min(...umin);
    if (umin < umax) return [0, 0, 0, 0];
    return [
      x1 + umax * p[1], //
      y1 + umax * p[3],
      x1 + umin * p[1],
      y1 + umin * p[3],
    ];
  }


  DrawLineOneBox(x1, y1, x2, y2) {
    [x1, y1, x2, y2] = this.ClipLine(x1, y1, x2, y2); // 裁剪
    if (new Set([x1, y1, x2, y2]).size < 2) return; // 不画的条件：四值相等

    let cav = this.preBuffer[this.preIndex];
    cav.beginPath();
    // 起点
    cav.moveTo(x1, y1);
    // 终点
    cav.lineTo(x2, y2);
    cav.closePath();
    cav.stroke();
  }
  FillTriangle(triangle, posVSname, primitiveData, material) {
    if (triangle.length != 3) return;

    let data = [0, 1, 2].map(i => { return { pos: triangle[i], data: primitiveData[i] } })
    // 
    let lines = [];
    let copyData = (dataOri) => {
      let dataCopy = { data: {} }
      Object.keys(primitiveData[0]).forEach(k => {
        if (dataOri.data[k] instanceof Vector) {
          dataCopy.data[k] = dataOri.data[k].copy()
        }
        else
          dataCopy.data[k] = dataOri.data[k]
      })
      dataCopy.pos = dataCopy.data[posVSname]
      return dataCopy
    }
    lines.push([copyData(data[0]), copyData(data[1])]);
    lines.push([copyData(data[0]), copyData(data[2])]);
    lines.push([copyData(data[1]), copyData(data[2])]);
    const [x1, y1, z1, x2, y2, z2, x3, y3, z3] = [...triangle[0].xyz(), ...triangle[1].xyz(), ...triangle[2].xyz()]
    const zs = new Vector([1/z1,1/z2,1/z3]) 
    let newlines = [];
    let _data = {}
    Object.keys(primitiveData[0]).forEach(k => {
      let d = null
      let v = primitiveData[0][k]
      if (v instanceof Vector) {
        d = []
        for (let index = 0; index < 3; index++) {
          d.push(new Vector([primitiveData[0][k].vct[index],primitiveData[1][k].vct[index],primitiveData[2][k].vct[index]]).Mul(zs))
        }
      }
      else{
        d = new Vector([primitiveData[0][k],primitiveData[1][k],primitiveData[2][k]]).Mul(zs)
      }
      _data[k] = d
    })
    // console.log(_data);
    lines.forEach((line) => {
      if (line[1].pos.y() - line[0].pos.y()) { // 同y的边剔除
        if (line[0].pos.y() > line[1].pos.y()) { // y值大的放后面
          [line[0], line[1]] = [line[1], line[0]];
        }
        let y = line[0].pos.y() + 0.5 << 0
        if (typeof newlines[y] == 'undefined') newlines[y] = [];
        let slot = newlines[y];//slot:[[vector0],y1,{data的增量}]
        const oneOverDeltaY = 1 / (line[1].pos.y() - line[0].pos.y())
        // line.push((line[1].pos.x() - line[0].pos.x()) * oneOverDeltaY);//x的增量
        // line.push((line[1].pos.z() - line[0].pos.z()) * oneOverDeltaY);//z的增量
        let deltaData = {}

        Object.keys(primitiveData[0]).forEach(k => {
          if (line[0].data[k] instanceof Vector) {

            deltaData[k] = line[1].data[k].copy().Sub(line[0].data[k]).MulScale(oneOverDeltaY)
            // line[0].data[k] = line[0].data[k].copy()
          }
          else
            deltaData[k] = (line[1].data[k] - line[0].data[k]) * oneOverDeltaY

        })
        // console.log(line[0].pos.vct,line[1].pos.vct,deltaData['posVS'].vct);
        // console.log(line[0].data["color"].vct);
        line[0].pos = line[0].data[posVSname]
        line.push(deltaData);
        line[1] = line[1].pos.y() + 0.5 << 0;
        slot.push(line);


      }
    });

    let yMin = pixelBox_H;
    let yMax = -1;
    triangle.forEach((point) => {
      if (point.y() < yMin) {
        yMin = point.y();
      }
      if (point.y() > yMax) yMax = point.y();
    });
    if (yMin > pixelBox_H || yMax < 0) return

    
    const oneOverArea = 1 / (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
    const ys = [(y2 - y3) * oneOverArea, (y3 - y1) * oneOverArea, (y1 - y2) * oneOverArea]
    
    yMin = Math.floor(Math.max(yMin, 0))
    yMax = Math.floor(Math.min(yMax, pixelBox_H))
    let scanline = [];
    let drawX;
    for (let y = yMin; y <= yMax; y++) {
      if (typeof newlines[y] != 'undefined') {
        newlines[y].forEach((e) => {
          scanline.push(e);
        });
        scanline.sort((a, b) => {
          if (!(a[0].pos.x() - b[0].pos.x())) {
            return a[2][posVSname].x() - b[2][posVSname].x();
          }
          return a[0].pos.x() - b[0].pos.x();
        });
      }

      drawX = [];
      for (let i = 0; i < scanline.length; i++) {
        drawX.push(scanline[i][0]);
        // scanline[i][0].pos.vct[0] += scanline[i][2];// x增
        // scanline[i][0].pos.vct[2] += scanline[i][3];// z增
        Object.keys(primitiveData[0]).forEach(k => {// data增
          if (scanline[i][0].data[k] instanceof Vector) {
            // console.log(k,'1',scanline[0][0].data[k],scanline[1][0].data[k]);
            scanline[i][0].data[k].Add(scanline[i][2][k])
            // console.log(k,'2',scanline[0][0].data[k],scanline[1][0].data[k]);
          }

          else
            scanline[i][0].data[k] += scanline[i][2][k]
        })
        if (scanline[i][1] == y) {
          scanline.splice(i, 1);
          i--;
          drawX.pop();
        }
      }
      let IsFirstPoint = true;// 扫描线算法考虑了一行中多个线段，我们现在只画三角形，只有一个线段
      const l1 = (x2 * (y3 - y) + x3 * (y - y2)) * oneOverArea//计算重心的中间变量
      const l2 = (x3 * (y1 - y) + x1 * (y - y3)) * oneOverArea
      const l3 = (x1 * (y2 - y) + x2 * (y - y1)) * oneOverArea
      for (let i = 0; i < drawX.length; i++) {
        if (!IsFirstPoint) {
          // console.log(drawX[i - 1].pos === drawX[i].pos);
          this.DrawXLine(drawX[i - 1], drawX[i], y, ys, [l1, l2, l3], triangle, material);
        }
        IsFirstPoint = !IsFirstPoint;
      }
    }
  }

  /**
   * 
   * @param {Vector} v0 
   * @param {Vector} v1 
   * @param {number} y 
   * @param {Material} material 
   */
  DrawXLine(v0, v1, y, ys, ls, triangle, material) {
    let x0 = v0.pos.x();
    let x1 = v1.pos.x();
    let z0 = v0.pos.z();
    let z1 = v1.pos.z();
    let z;
    let x = Math.max(0, x0)
    let xEnd = Math.min(x1, pixelBox_W)
    y = (y + 0.5) << 0
    x = (x + 0.5) << 0
    for (; x <= xEnd; x++) {
      const l1 = (ls[0] + x * (ys[0]))
      const l2 = (ls[1] + x * (ys[1]))
      const l3 = (ls[2] + x * (ys[2]))
      const zp = 1 / (l1 / triangle[0].z() + l2 / triangle[1].z() + l3 / triangle[2].z())
      // console.log(l1,l2,l3,l1+l2+l3);
      const t = (x - x0) / (x1 - x0)
      let v2f = {}

      z = intr(z0, z1, t);
      // console.log(x, y);
      if (this.zTest(x, y, zp)) {
        Object.keys(v0.data).forEach(k => {
          v2f[k] = intr(v0.data[k], v1.data[k], t)
        })
        // console.log(material.PS(v2f).vct);
        let color = material.PS(v2f).vct
        let colorStr = `rgba(${(color[0] * 255)}, ${(color[1] * 255)}, ${(color[2] * 255)}, ${(color[3] * 255)})`
        this.preBuffer[this.preIndex].fillStyle = colorStr;
        // console.log(this.preBuffer[this.preIndex].fillStyle);
        // this.preBuffer[this.preIndex].fillStyle = "rgba(255, 1, 1, 1)"
        // this.preBuffer[this.preIndex].fillStyle = "#ff0";
        this.DrawRect(x, y, 1, 1);
      }
    }
  }
  zTest(x, y, z) {
    if (x > this.width || y > this.height || x < 0 || y < 0) return false;

    if (typeof zbuffer[y] == 'undefined') {
      zbuffer[y] = [];
      Array.apply(zbuffer[y], { length: this.width }).map(() => 2);
    }
    if (zbuffer[y][x] > z) {
      zbuffer[y][x] = z;
      return true;
    }
    return false;
  }
  ClearPixelBox() {
    this.preBuffer[this.preIndex].clearRect(0, 0, this.width, this.height);
  }
}

class Shape {
  /**
   *
   */
  constructor(vertices = [], indices = [], colors = [], normals = [], coordinates = []) {
    //顶点
    this.vertices = vertices;
    //索引
    this.indices = indices;
    this.colors = colors
    this.normals = normals
    this.coordinates = coordinates
    this.M = Matrix.IdentityMatrix();
    this.material = DefaultMaterial
  }
  SetName(name) {
    this.name = name
  }
  SetVB(VB) {
    this.vertices = VB;
  }
  SetIB(IB) {
    this.indices = IB;
  }
  setMaterial(material) {
    this.material = material
  }
}
var pb = document.getElementById('pixelBox');
var gfx = new Gfx(pb);
