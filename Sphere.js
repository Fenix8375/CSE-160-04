
function sin(x){

    return Math.sin(x);
}

function cos(x){

    return Math.cos(x);
}


class Sphere {
    constructor() {
        this.type = "Sphere";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.normalMatrix = new Matrix4();
        this.verts32 = new Float32Array([])
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        var d = Math.PI / 10;
        var dd = Math.PI / 10;

        for (var t = 0; t <= Math.PI; t += d) {
            for (var r = 0; r < 2 * Math.PI; r += d) {
                var p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];

                var p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
                var p3 = [sin(t) * cos(r + dd), sin(t) * sin(r + dd), cos(t)];
                var p4 = [sin(t + dd) * cos(r + dd), sin(t + dd) * sin(r + dd), cos(t + dd)];

                var v = [];
                var uv = []; 
                v = v.concat(p1, p2, p4);
                uv = uv.concat([0, 0], [1, 0], [1, 1]);
                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);

                v = [];
                uv = [];

                v = v.concat(p1, p4, p3);
                uv = uv.concat([0, 0], [1, 1], [0, 1]);
                gl.uniform4f(u_FragColor, 1, 0, 0, 1);
                drawTriangle3DUVNormal(v, uv, v); 
            }
        }
    }
}
