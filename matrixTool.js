//计算4*4矩阵就写在这里好了
class Matrix {
  constructor(arr) {
    if (arr.length == 16)
      this.mtx = [
        [arr[0], arr[1], arr[2], arr[3]],
        [arr[4], arr[5], arr[6], arr[7]],
        [arr[8], arr[9], arr[10], arr[11]],
        [arr[12], arr[13], arr[14], arr[15]],
      ];
    else if (arr.length == 4) this.mtx = arr.concat();
    //深拷贝
    else return;
  }
  static IdentityMatrix() {
    var mtx = new Matrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return mtx;
  }
  /**
   * @param {Matrix} Mtx
   */
  Mul(Mtx) {
    let mtx1 = this.mtx;
    let mtx2 = Mtx.mtx;
    let res = [];
    this.mtx = null;
    for (let i = 0; i < 4; i++) {
      let arr = [0, 0, 0, 0];
      for (let j = 0; j < 4; j++) {
        // 累加
        arr[0] += mtx1[i][j] * mtx2[j][0];
        arr[1] += mtx1[i][j] * mtx2[j][1];
        arr[2] += mtx1[i][j] * mtx2[j][2];
        arr[3] += mtx1[i][j] * mtx2[j][3];
      }
      res.push(arr);
    }
    this.mtx = res;
    return this;
  }
  /**
   * 转置
   */
  Transpose() {
    for (let i = 0; i < 4; i++) {
      for (let j = i; j < 4; j++) {
        let cache = this.mtx[i][j];
        this.mtx[i][j] = this.mtx[j][i];
        this.mtx[j][i] = cache;
      }
    }
    return this;
  }
  /**
   * 旋转矩阵
   * @param {Vector} A
   * @param {number} angle
   */
  static RotationM(A, angle) {
    A.Normalize();
    let c = Math.cos(-angle),
      dc = 1 - c,
      s = Math.sin(-angle),
      [x, y, z] = A.xyz();
    let m = [
      [c + dc * x * x, dc * x * y - s * z, dc * x * z + s * y, 0],
      [dc * x * y + s * z, c + dc * y * y, dc * y * z - s * x, 0],
      [dc * x * z - s * y, dc * y * z + s * x, c + dc * z * z, 0],
      [0, 0, 0, 1]
    ]
    return new Matrix(m);
  }
  /**
   * 缩放矩阵
   * @param {number} x
   * @param {numbar} y
   * @param {numbar} z
   */
  static ScalingM(x, y, z) {
    let m = [
      [x, 0, 0, 0],
      [0, y, 0, 0],
      [0, 0, z, 0],
      [0, 0, 0, 1]
    ]
    return new Matrix(m);
  }
  /**
   * 移动矩阵
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  static MoveM(x, y, z) {
    let m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [x, y, z, 1]
    ]
    return new Matrix(m);
  }

}
// 4维向量
class Vector {
  constructor(arr) {
    if (arr.length == 4) this.vct = [arr[0], arr[1], arr[2], arr[3]];
    if (arr.length == 3) this.vct = [arr[0], arr[1], arr[2], 1];
    // this.id = Math.floor(Math.random() * 10000000)
    return this;
  }
  copy() {
    return new Vector(this.vct);
  }
  xy() {
    return [this.vct[0], this.vct[1]];
  }
  x() {
    return this.vct[0];
  }
  y() {
    return this.vct[1];
  }
  z() {
    return this.vct[2];
  }
  w() {
    return this.vct[3];
  }
  xyz() {
    return [this.vct[0], this.vct[1], this.vct[2]];
  }
  /**
   * @param {Matrix} Mtx
   */
  Transform(Mtx) {
    let mtx = Mtx.mtx;
    let vct = this.vct;
    this.vct = null;
    let arr = [0, 0, 0, 0];
    for (let j = 0; j < 4; j++) {
      // 累加
      arr[0] += vct[j] * mtx[j][0];
      arr[1] += vct[j] * mtx[j][1];
      arr[2] += vct[j] * mtx[j][2];
      arr[3] += vct[j] * mtx[j][3];
    }
    this.vct = arr;
    return this;
  }
  /**
   * 每个分量相加
   * @param {Vector} Vct
   */
  Add(Vct) {
    let vct = Vct.vct;
    this.vct[0] += vct[0];
    this.vct[1] += vct[1];
    this.vct[2] += vct[2];
    this.vct[3] += vct[3];
    return this;
  }
  /**
 * 每个分量相减
 * @param {Vector} Vct
 */
  Sub(Vct) {
    let vct = Vct.vct;
    this.vct[0] -= vct[0];
    this.vct[1] -= vct[1];
    this.vct[2] -= vct[2];
    this.vct[3] -= vct[3];
    return this;
  }
  /**
   * 每个分量相乘
   * @param {Vector} Vct
   */
  Mul(Vct) {
    let vct = Vct.vct;
    this.vct[0] *= vct[0];
    this.vct[1] *= vct[1];
    this.vct[2] *= vct[2];
    this.vct[3] *= vct[3];
    return this;
  }
 /**
 * 乘常数
 * @param {Vector} Vct
 */
  MulScale(t) {
    this.vct[0] *= t;
    this.vct[1] *= t;
    this.vct[2] *= t;
    this.vct[3] *= t;
    return this;
  }
  /**
   * 取相反数
   */
  Neg() {
    this.vct[0] = -this.vct[0];
    this.vct[1] = -this.vct[1];
    this.vct[2] = -this.vct[2];
    this.vct[3] = -this.vct[3];
  }
  /**
   * 点乘,4个量都是点乘结果
   * @param {Vector} Vct
   */
  Dot(Vct) {
    this.Mul(Vct);
    let sum = 0;
    this.vct.forEach((e) => {
      sum += e;
    });
    for (let j = 0; j < 4; j++) {
      this.vct[j] = sum;
    }
    return this;
  }
  /**
   * 标准化
   *
   */
  Normalize() {
    let sum = 0;
    this.vct.forEach((e) => {
      sum += e * e;
    });
    if (sum == 1) return this;

    sum = Math.sqrt(sum);
    for (let i = 0; i < 4; i++) {
      this.vct[i] /= sum;
    }
    return this;
  }

  /**
   * 叉乘
   * @param {Vector} Vct
   */
  Cross(Vct) {
    let v1 = Vct.vct;
    let v2 = this.vct;
    let arr = [
      v1[2] * v2[1] - v1[1] * v2[2], //V1.z * V2.y - V1.y * V2.z
      v1[0] * v2[2] - v1[2] * v2[0], //V1.x * V2.z - V1.z * V2.x
      v1[1] * v2[0] - v1[0] * v2[1], //V1.x * V2.y - V1.y * V2.x
      0,
    ];
    this.vct = arr;
    return this;
  }

  static VectorAllOne() {
    return new Vector([1, 1, 1, 1]);
  }

  static inter(v1, v2, t) {
    return new Vector(
      [v1.vct[0] + (v2.vct[0] - v1.vct[0]) * t,
      v1.vct[1] + (v2.vct[1] - v1.vct[1]) * t,
      v1.vct[2] + (v2.vct[2] - v1.vct[2]) * t,
      v1.vct[3] + (v2.vct[3] - v1.vct[3]) * t]
    );
  }
  
  /**
   * 
   * @param {Vector} v1 
   * @param {Vector} v2 
   */
  static FromTo(v1, v2) {
    return new Vector(
      [v2.vct[0] - v1.vct[0], v2.vct[1] - v1.vct[1], v2.vct[2] - v1.vct[2], 0]
    );
  }
}

// test
let test = false
if (test) {
  let arr1 = [1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  let mtx1 = new Matrix(arr1);

  let mtx2 = new Matrix(arr1);
  let v1 = new Vector([1, 2, 3, 1]);
  let v2 = new Vector([4, 5, 6, 0]);
  v1.Cross(v2);
  v1.Transform(mtx1);

  console.log(v1.vct);

}
