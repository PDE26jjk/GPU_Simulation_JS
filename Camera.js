const up = new Vector([0,1,0,0]);//上方向默认y
//摄像机
class Camera {
    /**
     * 
     * @param {Vector} pos 
     * @param {Vector} dir 
     * @param {number} AspectRatio 
     */
    constructor(pos,dir,AspectRatio= 1.333333333){
        this.FovAngleY = 0.25 * Math.PI,
        this.FarZ = 100;
        this.NearZ = 0.1;
        this.SetAspectRatio(AspectRatio);
        this.SetCamera(pos,dir);
    }
    /**
     * 
     * @param {Vector} pos 
     * @param {Vector} dir 
     */
    SetCamera(pos,dir){
        this.pos = pos;
        this.dir = dir;
        this.UpdateViewMatrix();
    }
    /**
     * 
     * @param {number} AspectRatio 纵宽比
     */
    SetAspectRatio(AspectRatio){
        this.AspectRatio = AspectRatio;
        let FarZ = this.FarZ;
        let NearZ = this.NearZ;
        let Height = 1/Math.tan(this.FovAngleY/2);
        let Width = Height / AspectRatio;
        let fRange = FarZ / (FarZ-NearZ);
        let P = Matrix.IdentityMatrix();
        let mtx = P.mtx;
        mtx[0][0]= Width;
        mtx[1][1]= Height;
        mtx[2][2]= fRange;
        mtx[3][2]= -fRange*NearZ;
        // mtx[0][3]= 1;// x透视
        // mtx[1][3]= 1;// y透视
        mtx[2][3]= 1;
        mtx[3][3]= 0;
        this.P = P;
    }
    /**
     * 
     */
    UpdateViewMatrix(){
        this.V = Camera.MatrixLookToLH(this.pos,this.dir,up);
        this.VP = Matrix.IdentityMatrix().Mul(this.V).Mul(this.P);
    }
    /**
     * 
     * @param {Vector} pos 
     * @param {Vector} dir 
     * @param {Vector} up 
     * @return {Matrix}
     */
    static MatrixLookToLH(pos,dir,up){
        let arr = [1,1,1,1];
        let R2 = new Vector(arr).Mul(dir).Normalize();
        let R0 = new Vector(arr).Mul(up).Cross(R2).Normalize();
        let R1 = new Vector(arr).Mul(R2).Cross(R0);
        let NegPos = new Vector(arr).Mul(pos).Mul(new Vector([-1,-1,-1,-1]));
        let D0 = new Vector(arr).Mul(R0).Dot(NegPos);
        let D1 = new Vector(arr).Mul(R1).Dot(NegPos);
        let D2 = new Vector(arr).Mul(R2).Dot(NegPos);
        let M = [
            [...R0.vct.slice(0,3),D0.vct[3]],
            [...R1.vct.slice(0,3),D1.vct[3]],
            [...R2.vct.slice(0,3),D2.vct[3]],
            [0,0,0,1]
        ]
        return new Matrix(M).Transpose();
    }
    /**
     * 
     * @param {Vector} offset 
     */
    MoveCamera(offset){
        this.pos.Add(offset);
        this.UpdateViewMatrix();
        return this;
    }
    /**
     * 
     * @param {Vector} A 
     * @param {number} angle 
     */
    RotateCamera(A,angle){
       let olddirM = this.dir.vct.concat();
       this.dir.Transform(Matrix.RotationM(A,angle)).Normalize();
    //    console.log(this.dir.vct);
       if(dir.vct[1]>0.99 || dir.vct[1]<-0.99){
           this.dir.vct = olddirM;
       }
       this.UpdateViewMatrix();
       return this;
    }
}


// console.log(Camera.MatrixLookToLH(v1,v2,up).mtx);