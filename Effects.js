// var ef_WVP;
var GlobalRender={
    M:Matrix.IdentityMatrix,
    V:Matrix.IdentityMatrix,
    P:Matrix.IdentityMatrix,
    VP:Matrix.IdentityMatrix,
    MVP:Matrix.IdentityMatrix,
}
// var allV=[];
// var allI=[];//[i0,i1,i2];
// var allLine=[];//[x1,y1,x2,y2];
var pixelBox_W;//宽
var pixelBox_H;//高

class Shader{
    constructor(vertex,fragment,appData,v2f){
        this.vertex = vertex
        this.fragment = fragment
        this.appData = appData
        this.v2f = v2f
        this.cullBack=true
        this.ZWirte=true
        this.ZCompare='less'
    }
}

class Material{
    /**
     * @type {Shader}
     */
    shader
    constructor(shader,parameters){
        this.shader = shader
        this.parameters = parameters
    }
    setParameters(parameters){
        this.parameters = parameters
    }
    VS(vert){
        return this.shader.vertex(vert,this.parameters)
    }
    PS(frag){
        return this.shader.fragment(frag,this.parameters)
    }
}

let appData = {
    // 变量: 语义
    vert: "VERTEX",
    color: "COLOR",
    normal: "NORMAL",
    uv: "UV"
}
let v2f = {
    posVS: "POSITION0",
    posWS: "POSITION1",
    normalWS: "NORMAL",
    color: "COLOR",
    uv: "UV"
}
function VS(appData,parameters){
    // let pos = appData.vert;

    // let posVS = new Vector(appData.vert).Transform(GlobalRender.WVP)
    let v2f = {
        posVS:new Vector(appData.vert).Transform(GlobalRender.MVP),
        posWS:new Vector(appData.vert).Transform(GlobalRender.M),
        normalWS:new Vector([...appData.normal,0]).Transform(GlobalRender.M).Normalize(),// 假设均一缩放，否则得乘M矩阵的逆转置，或者把缩放系数提出来
        color:new Vector(appData.color),
        uv:new Vector([...appData.uv,0,1]),
        // u:appData.uv[0]
    }
    return v2f;
}
function PS(v2f,parameters){
    let lightDir = new Vector([0,1,-1,0]).Normalize()
    let {normalWS,uv,u} =v2f
    normalWS.Normalize()
    // normalWS.Add(new Vector([1,1,1,0])).MulScale(0.5)
    // normalWS.vct[3] = 1
    // let diff = Math.max(0,lightDir.Dot(normalWS).x())// 兰伯特
    let diff = (lightDir.Dot(normalWS).x()+1)*0.5 // 半兰伯特
    let amb = new Vector([1,1,1,0]).MulScale(0.2)
    // let color = v2f.color.MulScale(diff).Add(amb)
    let texture = parameters.texture.sample(...v2f.uv.xy())
    let color = texture.MulScale(diff).Add(amb)
    color.vct[3] = 1
    return color
}

let parameters = {
    texture:new Texture('Models/UV_Grid_Sm.jpg')
}

const DefaultMaterial = new Material(new Shader(VS,PS,appData,v2f),parameters)
